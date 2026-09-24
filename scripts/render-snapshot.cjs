#!/usr/bin/env node
/**
 * Scentspired Render Parity Harness
 *
 * Captures the rendered HTML of a fixed page set from a running
 * `shopify theme dev` server, normalizes everything that legitimately varies
 * between requests, and stores it as a golden baseline.
 *
 * This is the safety net that makes aggressive refactoring possible: extract a
 * component, re-run with --check, and any change to the rendered output is
 * reported as a defect rather than discovered later in a browser.
 *
 *   node scripts/render-snapshot.cjs            capture/refresh the baseline
 *   node scripts/render-snapshot.cjs --check     diff against the baseline
 *   node scripts/render-snapshot.cjs --url=...   point at a different server
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const { readRegionFile, DEFAULT_REGION } = require('./region-engine.cjs');
/**
 * Which baseline set to read or write. The core region lives in tests/parity/baseline; a
 * second region needs its own, because the same page legitimately differs
 * between storefronts — different prices, different products, different
 * Trustpilot. Comparing one region against another's baseline is meaningless.
 *
 *   --region=usa  ->  tests/parity/baseline-usa
 */
const regionArg = process.argv.find((a) => a.startsWith('--region='));
const REGION = regionArg ? regionArg.slice('--region='.length) : '';
const BASELINE_DIR = path.join(
  THEME_ROOT,
  REGION && REGION !== DEFAULT_REGION ? `tests/parity/baseline-${REGION}` : 'tests/parity/baseline'
);

const args = process.argv.slice(2);
const isCheck = args.includes('--check');

/**
 * The server and market default to the region's own data, so `--region=usa`
 * alone cannot be checked against the UK dev server. It used to default to
 * 9292 whatever the region, which reported every USA page as changed — the
 * harness comparing one storefront against another's baseline.
 */
const regionData = readRegionFile(REGION || DEFAULT_REGION) || {};
if (REGION && !readRegionFile(REGION)) {
  console.error(`\n  ✗ No regions/${REGION}/region.json — unknown region.\n`);
  process.exit(1);
}

const urlArg = args.find(a => a.startsWith('--url='));
const BASE_URL = (
  urlArg ? urlArg.split('=')[1] : `http://127.0.0.1:${regionData.dev_port || 9292}`
).replace(/\/$/, '');

/**
 * Shopify picks the market from the request, and `shopify theme dev` serves the
 * myshopify domain — so it resolves to the developer's own country, not the
 * storefront's. In the wrong market products read as unavailable and inventory
 * is withheld, which looks exactly like a broken theme. Pinning the country
 * makes snapshots reproducible from any location.
 */
const countryArg = args.find(a => a.startsWith('--country='));
const COUNTRY = countryArg
  ? countryArg.split('=')[1]
  : (regionData.geo_countries && regionData.geo_countries[0]) || 'GB';

// The page set. Every surface whose markup we intend to keep stable.
const PAGES = {
  home: '/',
  'collection-women': '/collections/women',
  'collection-men': '/collections/men',
  'collection-unisex': '/collections/unisex',
  'collection-all': '/collections/all',
  cart: '/cart',
  search: '/search?q=perfume',
  // The product page is the highest-value surface in the theme and was the one
  // the first baseline missed, so its markup is pinned explicitly.
  product: '/products/addiction',
  blog: '/blogs/news',
  article:
    '/blogs/news/fragrance-layering-explained-how-to-turn-two-bottles-into-a-signature-scent-nobody-else-is-wearing',
  'page-about': '/pages/about-us',
  'page-discovery-set': '/pages/discovery-set',
  'page-fragrance-finder': '/pages/fragrance-finder',
  'page-faqs': '/pages/faqs',
  'page-contact': '/pages/contact',
  'page-privacy': '/pages/privacy-policy',
  'page-returns': '/pages/returns',
  'page-terms': '/pages/termsncondition',
  'not-found': '/this-page-does-not-exist',
  'account-login': '/account/login',
};

/**
 * Strip everything that varies per request but carries no design meaning.
 * Over-normalizing hides regressions, so this stays deliberately narrow:
 * ids, tokens, nonces, timestamps and cache-busting query strings only.
 */
function normalize(html) {
  /*
   * The development theme's id changes on every `shopify theme dev` restart and
   * appears in at least five forms (themeId: N, theme_id: N, "themeId":N,
   * data-theme-instance-id="N", inside Shopify.theme). Matching forms one at a
   * time missed four of them and reported all 20 pages changed after a
   * restart. So read the id off the page and replace it wherever it appears.
   */
  const themeId =
    (html.match(/data-theme-instance-id="(\d{6,})"/) || [])[1] ||
    (html.match(/Shopify\.theme\s*=\s*\{[^}]*?"id"\s*:\s*(\d{6,})/) || [])[1];
  if (themeId) html = html.replace(new RegExp(`\\b${themeId}\\b`, 'g'), 'THEME_ID');

  return (
    html
      // Shopify injects installed-app blocks through content_for_header, and
      // their ORDER varies between identical requests. They are not our theme's
      // markup, so they are removed wholesale rather than compared.
      .replace(/<!-- BEGIN app block[\s\S]*?<!-- END app block -->/g, '<!-- APP BLOCK -->')
      .replace(/<!-- BEGIN app snippet[\s\S]*?<!-- END app snippet -->/g, '<!-- APP SNIPPET -->')
      // App-extension asset tags are emitted in a different order each request.
      // Same set, shuffled — so they are dropped rather than diffed.
      .replace(/<(?:script|link)[^>]*cdn\.shopify\.com\/extensions\/[^>]*>(?:<\/script>)?/g, '')
      // Shopify's analytics bootstrap carries a fresh request id every time
      .replace(/__st=\{[\s\S]*?\};/g, '__st={X};')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, 'UUID')
      // per-session cart token and app cache-busting timestamps
      .replace(/cart-id="[0-9a-f]{32}"/g, 'cart-id="X"')
      // Shopify fingerprints the theme's file contents; it changes whenever any
      // file changes, including a pure rename, so it says nothing about markup.
      .replace(/"themeCityHash":"\d+"/g, '"themeCityHash":"X"')
      // per-search session id threaded through search result URLs
      .replace(/_sid=[0-9a-f]+/g, '_sid=X')
      // Shopify's own platform assets and session state, which change when
      // Shopify ships, not when we do
      .replace(/trekkie\.storefront\.[0-9a-f]+\.min\.js/g, 'trekkie.storefront.X.min.js')
      // Shopify injects its event-observer bootstrap on some requests only —
      // this was the intermittent ~1155 byte fragment
      .replace(/<script data-source-attribution="shopify\.event_observer\.bootstrap">[\s\S]*?<\/script>/g, '')
      .replace(/redirectState = (?:null|"[^"]*")/g, 'redirectState = X')
      .replace(/\bver=\d{9,}/g, 'ver=X')
      // Shopify re-numbers section instance ids on every theme upload
      .replace(/shopify-section-(?:template|sections)--\d+__/g, 'shopify-section-X__')
      .replace(/(?:template|sections)--\d+__/g, 'X__')
      /*
       * Restarting `shopify theme dev` creates a NEW development theme, so the
       * theme id changes in every asset path and in Shopify.theme, and Shopify
       * regenerates the ai_gen_id hash on AI-generated blocks. That made all 20
       * pages differ by ~25 bytes after a restart — environment, not markup,
       * and exactly the kind of noise that teaches you to ignore a red harness.
       */
      .replace(/\/cdn\/shop\/t\/\d+\//g, '/cdn/shop/t/X/')
      .replace(/Shopify\.theme\s*=\s*\{[\s\S]*?\};/g, 'Shopify.theme = {X};')
      .replace(/"theme_store_id":\s*(?:null|\d+)/g, '"theme_store_id":X')
      .replace(/a[a-z0-9]{17,}aigenblock/g, 'AIGEN_aigenblock')
      // Block instance prefixes are re-issued per development theme too:
      // shopify-block-AOUN6TTZxbnQwL1JrS__judge_me_… after one restart,
      // shopify-block-ATU1nU2dkU2o4UzA3T__judge_me_… after the next.
      .replace(/\bA[A-Za-z0-9]{17}__(?=[a-z])/g, 'BLOCK__')
      // per-request security and session values
      .replace(/nonce="[^"]*"/g, 'nonce="X"')
      .replace(/"token":"[^"]*"/g, '"token":"X"')
      .replace(/name="form_type"[^>]*>/g, 'name="form_type">')
      .replace(/<input[^>]*name="utf8"[^>]*>/g, '<input name="utf8">')
      .replace(/authenticity_token[^"&]*/g, 'authenticity_token=X')
      // asset fingerprints and CDN cache busters
      .replace(/\?v=\d+/g, '?v=X')
      .replace(/&amp;v=\d+/g, '&amp;v=X')
      // analytics / monitoring payloads that embed timestamps and request ids
      .replace(/"requestId":"[^"]*"/g, '"requestId":"X"')
      .replace(/"pageurl":"[^"]*"/g, '"pageurl":"X"')
      .replace(/\b\d{13}\b/g, 'TS')
      // live inventory moves between requests; stock level is not layout
      .replace(/availableInventory"?:\s*\d+/g, 'availableInventory: N')
      .replace(/data-inventory="\d+"/g, 'data-inventory="N"')
      // the dev server injects its own hot-reload client
      .replace(/<script[^>]*hot-reload[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/\r\n/g, '\n')
      // Removing an injected block leaves a blank line behind, which offsets
      // every following line. Blank lines do not render, so collapse them.
      // Whole runs, so normalising is idempotent: the old /\n[ \t]*\n+/ left
      // every second whitespace-only line, and a second pass changed output.
      .replace(/\n(?:[ \t]*\n)+/g, '\n')
      .trim()
  );
}

async function fetchPage(route) {
  const url = new URL(BASE_URL + route);
  url.searchParams.set('country', COUNTRY);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'scentspired-parity-harness' },
    redirect: 'follow',
  });
  return { status: res.status, html: await res.text() };
}

(async () => {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });

  console.log(`\n  Render parity harness — ${isCheck ? 'CHECK' : 'CAPTURE'}`);
  console.log(`  Server: ${BASE_URL}\n`);

  const failures = [];
  const empties = [];
  let captured = 0;
  const refused = [];
  const pending = [];

  for (const [name, route] of Object.entries(PAGES)) {
    let result;
    try {
      result = await fetchPage(route);
    } catch (err) {
      failures.push(`${name}: request failed (${err.message})`);
      console.log(`  ✗ ${name.padEnd(20)} request failed`);
      continue;
    }

    const normalized = normalize(result.html);
    const file = path.join(BASELINE_DIR, `${name}.html`);

    if (normalized.length === 0) {
      empties.push(name);
      console.log(`  ⚠ ${name.padEnd(20)} HTTP ${result.status}, empty body`);
      continue;
    }

    if (isCheck) {
      if (!fs.existsSync(file)) {
        failures.push(`${name}: no baseline captured yet`);
        console.log(`  ✗ ${name.padEnd(20)} no baseline`);
        continue;
      }
      const before = fs.readFileSync(file, 'utf8');
      let current = normalized;

      // Shopify occasionally injects an extra app fragment on one request and
      // not the next. A real regression reproduces every time, so a single
      // mismatch is retried before it is believed.
      /*
       * Shopify does not always return a collection's products in the same
       * order: ties on the sort key rotate between requests, so two adjacent
       * cards swap and the page differs by a handful of bytes with nothing
       * changed. Diagnosed by diffing a failure — "Deep Attraction" and
       * "Ocean Drift" had simply traded places.
       *
       * Retry a few times and accept the first attempt that matches. This
       * narrows the flake without widening the normaliser: sorting product
       * cards before comparing would also hide a real change to a grid, which
       * is one of the things this harness exists to catch.
       */
      for (let attempt = 0; attempt < 3 && before !== current; attempt++) {
        await new Promise(r => setTimeout(r, 1200));
        try {
          current = normalize((await fetchPage(route)).html);
        } catch { /* keep the previous result */ }
      }

      if (before === current) {
        console.log(`  ✓ ${name.padEnd(20)} identical (${current.length} bytes)`);
      } else {
        const delta = current.length - before.length;
        failures.push(`${name}: rendered output changed (${delta >= 0 ? '+' : ''}${delta} bytes)`);
        console.log(`  ✗ ${name.padEnd(20)} CHANGED (${delta >= 0 ? '+' : ''}${delta} bytes)`);
      }
    } else {
      /*
       * Never record an error page as a baseline.
       *
       * The dev server produces three failure bodies that are not the theme:
       * an 87-byte expired-token message, a ~5KB "Failed to Upload Theme
       * Files" page, and Shopify's own 502. Writing one into the baseline
       * poisons the harness silently — every later run then diffs a real page
       * against an error and reports enormous changes, or worse, matches
       * another error and reports success. This has already happened twice.
       */
      /*
       * Recognising error pages one by one kept missing the next kind: a
       * 10,704-byte page from a USA server whose session had just expired had
       * none of the markers below and was written as three baselines. So the
       * check is also POSITIVE: every page in the set renders through
       * layout/theme.liquid, which always emits window.__STORE_CONFIG; no
       * error page from the CLI or Shopify does. And a real page does not lose
       * half its bytes between captures.
       */
      const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').length : 0;
      const why =
        normalized.length < 2000
          ? `only ${normalized.length} bytes`
          : /Failed to Upload Theme Files/.test(normalized)
            ? 'a theme upload error'
            : /access token provided is expired/.test(normalized)
              ? 'an expired session'
              : /Failed to render storefront with status/.test(normalized)
                ? 'a Shopify 5xx'
                : !/window\.__STORE_CONFIG\s*=/.test(normalized)
                  ? `not rendered by this theme's layout (${normalized.length} bytes, no __STORE_CONFIG)`
                  : previous && normalized.length < previous / 2
                    ? `shrank from ${previous} to ${normalized.length} bytes`
                    : null;

      if (why) {
        console.error(`  ! ${name.padEnd(20)} REFUSED — ${why}`);
        refused.push(`${name}: ${why}`);
        continue;
      }

      // Held until every page is known good: a baseline set must come from
      // one healthy server, never a mix of before and after a failure.
      pending.push([file, normalized]);
      console.log(`  + ${name.padEnd(20)} ${normalized.length} bytes`);
    }
  }

  console.log('');
  if (empties.length > 0) {
    console.log(`  Note: ${empties.length} page(s) returned an empty body: ${empties.join(', ')}`);
    console.log('  An empty body usually means Shopify rejected the theme upload.\n');
  }

  if (!isCheck) {
    if (refused.length) {
    console.error(`
  ❌ ${refused.length} page(s) REFUSED — the dev server was unhealthy:`);
    for (const r of refused) console.error(`     ${r}`);
    console.error(`  No baseline was written — not even the pages that looked healthy.
  Fix the server and re-run.
`);
    process.exit(1);
  }

  for (const [file, body] of pending) {
    fs.writeFileSync(file, body);
    captured++;
  }

  // Report where it actually wrote. Hardcoding the UK path here meant a USA
  // capture claimed to have written the UK baseline, which is a bad thing to
  // read back later when you are trying to work out what got overwritten.
  const where = path.relative(THEME_ROOT, BASELINE_DIR).replace(/\\/g, '/');
  console.log(`  Baseline captured: ${captured} page(s) in ${where}/\n`);
    process.exit(empties.length > 0 ? 1 : 0);
  }

  if (failures.length === 0) {
    console.log('  ✅ Render parity holds — no page changed.\n');
    process.exit(0);
  }

  console.log(`  ❌ ${failures.length} parity failure(s):`);
  failures.forEach(f => console.log(`     ${f}`));
  console.log('\n  Inspect a diff with:');
  console.log('     node scripts/render-snapshot.cjs --check --url=<server>');
  console.log('     git diff tests/parity/baseline\n');
  process.exit(1);
})();

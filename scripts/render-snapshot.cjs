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
/**
 * Which baseline set to read or write. UK lives in tests/parity/baseline; a
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
  REGION && REGION !== 'uk' ? `tests/parity/baseline-${REGION}` : 'tests/parity/baseline'
);

const args = process.argv.slice(2);
const isCheck = args.includes('--check');
const urlArg = args.find(a => a.startsWith('--url='));
const BASE_URL = (urlArg ? urlArg.split('=')[1] : 'http://127.0.0.1:9292').replace(/\/$/, '');

/**
 * Shopify picks the market from the request, and `shopify theme dev` serves the
 * myshopify domain — so it resolves to the developer's own country, not the
 * storefront's. In the wrong market products read as unavailable and inventory
 * is withheld, which looks exactly like a broken theme. Pinning the country
 * makes snapshots reproducible from any location.
 */
const countryArg = args.find(a => a.startsWith('--country='));
const COUNTRY = countryArg ? countryArg.split('=')[1] : 'GB';

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
      .replace(/\n[ \t]*\n+/g, '\n')
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
      fs.writeFileSync(file, normalized);
      captured++;
      console.log(`  + ${name.padEnd(20)} ${normalized.length} bytes`);
    }
  }

  console.log('');
  if (empties.length > 0) {
    console.log(`  Note: ${empties.length} page(s) returned an empty body: ${empties.join(', ')}`);
    console.log('  An empty body usually means Shopify rejected the theme upload.\n');
  }

  if (!isCheck) {
    console.log(`  Baseline captured: ${captured} page(s) in tests/parity/baseline/\n`);
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

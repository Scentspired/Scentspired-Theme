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
const BASELINE_DIR = path.join(THEME_ROOT, 'tests/parity/baseline');

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
  blog: '/blogs/news',
  'page-about': '/pages/about-us',
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
      // the dev server injects its own hot-reload client
      .replace(/<script[^>]*hot-reload[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/\r\n/g, '\n')
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
      if (before === normalized) {
        console.log(`  ✓ ${name.padEnd(20)} identical (${normalized.length} bytes)`);
      } else {
        const delta = normalized.length - before.length;
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

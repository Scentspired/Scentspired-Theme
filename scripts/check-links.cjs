#!/usr/bin/env node
/**
 * ============================================================================
 * LINK CHECK — every internal link a shopper can reach from the home page opens
 * ============================================================================
 *
 * A page handle is the store's own, and stores differ: UK's terms page is
 * /pages/terms-and-condition, USA's /pages/terms-and-conditions. A region's
 * content that names the other store's handle links to a 404, and nothing
 * static can see it — only the store knows its pages. This asks the store:
 * it opens the home page on a running dev server, then every internal page it
 * links to, and requests every internal link found on those. Any 404 fails.
 *
 *   node scripts/check-links.cjs [--region=usa] [--url=http://127.0.0.1:9293]
 *
 * The server and market default to the region's region.json (dev_port,
 * geo_countries), like the parity harness. A 401 is the dev server's session
 * flapping and a 502/503 the dev server overloaded, not the page; each is
 * retried before it counts.
 * ============================================================================
 */

const { readRegionFile, DEFAULT_REGION } = require('./region-engine.cjs');

const arg = (name) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || '').slice(name.length + 3);
const REGION = arg('region') || DEFAULT_REGION;
const region = readRegionFile(REGION);
if (!region) {
  console.error(`\n  ✗ No regions/${REGION}/region.json — unknown region.\n`);
  process.exit(1);
}
const BASE = (arg('url') || `http://127.0.0.1:${region.dev_port || 9292}`).replace(/\/$/, '');
const COUNTRY = arg('country') || (region.geo_countries && region.geo_countries[0]) || 'GB';

// Assets, Shopify's own endpoints and the checkout are not the theme's links.
const SKIP = /^\/(cdn|checkouts?|services|s\/files|account|cart\/|\/)|\.(css|js|png|jpe?g|webp|gif|svg|ico|woff2?|xml|txt)$/;

async function get(route) {
  const url = `${BASE}${route}${route.includes('?') ? '&' : '?'}country=${COUNTRY}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { redirect: 'manual' }).catch(() => null);
    if (res && ![401, 502, 503].includes(res.status)) return { status: res.status, html: res.status === 200 ? await res.text() : '' };
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  return { status: 0, html: '' }; // unanswered: the dev server, not the page
}

function links(html) {
  const out = new Set();
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) if (!SKIP.test(m[1])) out.add(m[1]);
  return out;
}

async function inBatches(items, fn, size = 2) {
  const results = [];
  for (let i = 0; i < items.length; i += size) results.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return results;
}

(async () => {
  const home = await get('/');
  if (home.status !== 200) {
    console.error(`\n  ✗ ${BASE}/ answered ${home.status} — is the ${REGION} dev server running?\n`);
    process.exit(1);
  }
  const foundOn = new Map([['/', new Set(['/'])]]);
  const note = (link, page) => (foundOn.get(link) || foundOn.set(link, new Set()).get(link)).add(page);
  for (const l of links(home.html)) note(l, '/');

  const status = new Map([['/', 200]]);
  const firstLevel = [...foundOn.keys()].filter((l) => l !== '/');
  for (const [route, res] of (await inBatches(firstLevel, async (r) => [r, await get(r)]))) {
    status.set(route, res.status);
    for (const l of links(res.html)) note(l, route);
  }
  const secondLevel = [...foundOn.keys()].filter((l) => !status.has(l));
  for (const [route, res] of (await inBatches(secondLevel, async (r) => [r, await get(r)]))) status.set(route, res.status);

  const broken = [...status].filter(([, s]) => s === 404 || s >= 500);
  const flapping = [...status].filter(([, s]) => s === 0);
  console.log(`\n  ${REGION}: ${status.size} internal links from ${firstLevel.length + 1} pages checked on ${BASE}`);
  if (flapping.length) console.log(`  ⚠️  ${flapping.length} still unanswered after retries (dev server): ${flapping.map(([r]) => r).join(', ')}`);
  if (broken.length) {
    console.error(`\n  ❌ ${broken.length} broken link${broken.length === 1 ? '' : 's'}:\n`);
    for (const [route, s] of broken) {
      const pages = [...foundOn.get(route)];
      console.error(`     ${s} ${route}  — linked from ${pages.length > 3 ? `${pages.slice(0, 3).join(', ')} and ${pages.length - 3} more` : pages.join(', ')}`);
    }
    console.error('');
    process.exit(1);
  }
  console.log('  ✅ Every internal link opens.\n');
  process.exit(flapping.length ? 1 : 0);
})();

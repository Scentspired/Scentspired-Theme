#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 14: Live Output Parity Feedback Loop
 * ============================================================================
 *
 * Asserts that the values each storefront will actually render — currency,
 * shipping thresholds, domains, SEO — match what the live stores expect, and
 * that those values reach the compiled theme.
 *
 * It iterates every folder under regions/, so onboarding a region extends this
 * gate automatically. The only hardcoded part is EXPECTED_LIVE: the handful of
 * facts we have independently confirmed against the live storefronts, which is
 * what makes this a parity check rather than a tautology.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { resolveRegion, listRegions } = require('../../scripts/region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '../..');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Live Parity Feedback Loop     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

let total = 0;
let passed = 0;
const failures = [];

function assertEqual(actual, expected, description) {
  total++;
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed++;
    console.log(`  ✅ [PASS] ${description}`);
  } else {
    failures.push({ description, actual, expected });
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
  }
}

/**
 * Values confirmed against the live storefronts. UK and USA come from the
 * region conditional that shipped in the live theme's layout; UAE is the
 * launch configuration.
 */
const EXPECTED_LIVE = {
  uk: {
    currency_code: 'GBP',
    currency_symbol: '£',
    free_shipping_threshold_cents: 3500,
    shipping_cost_cents: 499,
    home_url: 'https://scentspired.co.uk',
    hreflang: 'en-gb',
  },
  usa: {
    currency_code: 'USD',
    currency_symbol: '$',
    free_shipping_threshold_cents: 7000,
    shipping_cost_cents: 799,
    home_url: 'https://scentspired.com',
    hreflang: 'en-us',
  },
  uae: {
    currency_code: 'AED',
    home_url: 'https://scentspired.ae',
    hreflang: 'en-ae',
  },
};

const regions = listRegions();

console.log(`>>> [1/4] Resolving ${regions.length} region(s) against the schema...`);
const resolved = {};
for (const id of regions) {
  try {
    resolved[id] = resolveRegion(id);
    console.log(`  ✅ [PASS] ${id} satisfies regions/_schema.json`);
    total++;
    passed++;
  } catch (err) {
    total++;
    failures.push({ description: `${id} schema validation`, actual: err.message, expected: 'valid' });
    console.error(`  ❌ [FAIL] ${id} failed schema validation`);
  }
}

console.log('\n>>> [2/4] Comparing resolved values against confirmed live values...');
for (const [id, expectations] of Object.entries(EXPECTED_LIVE)) {
  const region = resolved[id];
  if (!region) {
    total++;
    failures.push({ description: `region ${id} exists`, actual: 'missing', expected: 'present' });
    console.error(`  ❌ [FAIL] region "${id}" has no region.json`);
    continue;
  }
  for (const [key, expected] of Object.entries(expectations)) {
    assertEqual(region[key], expected, `${id}: ${key}`);
  }
}

console.log('\n>>> [3/4] Verifying each compiled theme carries its own region...');
for (const id of regions) {
  const snippet = path.join(THEME_ROOT, 'dist', id, 'snippets', 'region--active.liquid');
  if (!fs.existsSync(snippet)) {
    console.log(`  ⏭️  dist/${id} not compiled — skipping (run npm run compile:all)`);
    continue;
  }
  const content = fs.readFileSync(snippet, 'utf8');
  const declared = key => {
    const m = content.match(new RegExp(`when '${key}' -%\\}([^\\r\\n{]+)`));
    return m ? m[1].trim() : null;
  };

  assertEqual(declared('currency_code'), resolved[id].currency_code, `dist/${id} ships ${resolved[id].currency_code}`);

  // Identity keys must be this region's own. A shared CDN asset is fine;
  // claiming another storefront's domain as your own is not.
  for (const key of ['home_url', 'domain', 'hreflang', 'currency_symbol']) {
    assertEqual(declared(key), String(resolved[id][key]), `dist/${id} declares its own ${key}`);
  }
}

console.log('\n>>> [4/4] Verifying shared code holds no region literals...');
const SHARED_DIRS = ['sections', 'snippets', 'layout', 'blocks'];
const GENERATED = ['region--active.liquid', 'region--registry.liquid'];
const domains = Object.values(resolved).map(r => r.domain);

const offenders = [];
for (const dir of SHARED_DIRS) {
  const full = path.join(THEME_ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const file of fs.readdirSync(full)) {
    if (GENERATED.includes(file)) continue;
    const content = fs.readFileSync(path.join(full, file), 'utf8');
    // A region conditional is the thing this architecture exists to remove:
    // a literal domain used to choose behaviour.
    if (domains.some(d => new RegExp(`(if|elsif|unless)[^\\n]*${d.replace('.', '\\.')}`).test(content))) {
      offenders.push(`${dir}/${file}`);
    }
  }
}
assertEqual(offenders, [], 'no shared file branches on a storefront domain');

console.log('');
console.log('==================================================================');
console.log(`   PARITY RESULTS: ${passed} / ${total} Passed`);
if (failures.length === 0) {
  console.log('   🎉 REGIONAL OUTPUT MATCHES LIVE EXPECTATIONS');
} else {
  console.log(`   ❌ ${failures.length} PARITY FAILURE(S)`);
}
console.log('==================================================================');
console.log('');

process.exit(failures.length > 0 ? 1 : 0);

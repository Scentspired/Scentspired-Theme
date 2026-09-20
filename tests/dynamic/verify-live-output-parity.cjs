#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 14: Live Output Parity Feedback Loop
 * ============================================================================
 *
 * Verifies that the compiled theme engine outputs (pricing, variant IDs, currency
 * symbols, shipping thresholds, and brand catalogs) match the live production
 * expectations across all 3 regional storefronts (UK, USA, UAE) with 100% exact parity.
 *
 * Ensures:
 * 1. ZERO BREAKAGE for downstream JavaScript bundle builders.
 * 2. EXACT EQUIVALENCE with live store catalog expectations.
 * 3. CENTRALIZED SINGLE SOURCE OF TRUTH (No scattered hardcoding).
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '../..');
const UK_ROOT = path.resolve(THEME_ROOT, '../Scentspired-UK');
const USA_ROOT = path.resolve(THEME_ROOT, '../Scentspired-USA');
const UAE_ROOT = path.resolve(THEME_ROOT, '../Scentspired-UAE');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Live Parity Feedback Loop     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

let totalAssertions = 0;
let passedAssertions = 0;
const failures = [];

function assertEqual(actual, expected, description) {
  totalAssertions++;
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passedAssertions++;
    console.log(`  ✅ [PASS] ${description}`);
  } else {
    failures.push({
      description,
      actual,
      expected
    });
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EVALUATE COMPILED STORE CONTEXT & REGIONAL SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
console.log('>>> [1/5] Evaluating Centralized Store Context Parity...');

function getStrategyScalar(region, key) {
  if (key === 'currency_symbol') {
    return compileStoreContext(region).currencySymbol;
  }
  const f = path.join(THEME_ROOT, 'snippets', `region-strategy-${region}.liquid`);
  const c = fs.readFileSync(f, 'utf8');
  const reg = new RegExp("when\\s+'" + key + "'\\s*-%\\}([^\\{%]+)");
  const m = c.match(reg);
  return m ? m[1].trim() : null;
}

function compileStoreContext(region) {
  const f = path.join(THEME_ROOT, 'snippets', `region-strategy-${region}.liquid`);
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/\{\s*"region"[\s\S]*?\}/);
  if (!m) throw new Error(`Could not parse JSON in region-strategy-${region}.liquid`);
  return JSON.parse(m[0]);
}

// Assert against Live UK expectations
const ukContext = compileStoreContext('uk');
assertEqual(ukContext.currencySymbol, '£', 'UK Currency Symbol is £');
assertEqual(ukContext.currencyCode, 'GBP', 'UK Currency Code is GBP');
assertEqual(ukContext.shippingThresholdCents, 3500, 'UK Free Shipping Threshold is 3500 cents (£35)');
assertEqual(ukContext.canonicalUrl, 'https://scentspired.co.uk', 'UK Canonical URL is scentspired.co.uk');

// Assert against Live USA expectations
const usaContext = compileStoreContext('usa');
assertEqual(usaContext.currencySymbol, '$', 'USA Currency Symbol is $');
assertEqual(usaContext.currencyCode, 'USD', 'USA Currency Code is USD');
assertEqual(usaContext.shippingThresholdCents, 7000, 'USA Free Shipping Threshold is 7000 cents ($70)');
assertEqual(usaContext.canonicalUrl, 'https://scentspired.com', 'USA Canonical URL is scentspired.com');

// Assert against Live UAE expectations
const uaeContext = compileStoreContext('uae');
assertEqual(uaeContext.currencySymbol, 'AED ', 'UAE Currency Symbol is "AED "');
assertEqual(uaeContext.currencyCode, 'AED', 'UAE Currency Code is AED');
assertEqual(uaeContext.shippingThresholdCents, 15000, 'UAE Free Shipping Threshold is 15000 cents (AED 150)');
assertEqual(uaeContext.shippingCost, 2500, 'UAE Shipping Cost is 2500 cents (AED 25)');
assertEqual(uaeContext.canonicalUrl, 'https://scentspired.ae', 'UAE Canonical URL is scentspired.ae');

// ─────────────────────────────────────────────────────────────────────────────
// 2. EVALUATE BUNDLE-DATA COMPILED MATRICES (FIVE-BOX & BUNDLE)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [2/5] Evaluating Five Favourites (Five-Box) Output Parity...');

function compileBundleData(bundleType, region) {
  const currSym = getStrategyScalar(region, 'currency_symbol');
  if (bundleType === 'five-box') {
    return {
      currencySymbol: currSym,
      pricing: {
        '50ml': {
          total: parseFloat(getStrategyScalar(region, 'five_box_price_50')),
          standard: parseFloat(getStrategyScalar(region, 'five_box_std_50')),
          saving: parseFloat(getStrategyScalar(region, 'five_box_saving_50'))
        },
        '100ml': {
          total: parseFloat(getStrategyScalar(region, 'five_box_price_100')),
          standard: parseFloat(getStrategyScalar(region, 'five_box_std_100')),
          saving: parseFloat(getStrategyScalar(region, 'five_box_saving_100'))
        }
      },
      variants: {
        '50ml': parseInt(getStrategyScalar(region, 'five_box_50_id'), 10),
        '100ml': parseInt(getStrategyScalar(region, 'five_box_100_id'), 10)
      }
    };
  } else if (bundleType === 'trio-set') {
    return {
      currencySymbol: currSym,
      pricing: {
        '50ml': {
          total: parseFloat(getStrategyScalar(region, 'trio_price_50')),
          standard: parseFloat(getStrategyScalar(region, 'trio_std_50')),
          saving: parseFloat(getStrategyScalar(region, 'trio_saving_50'))
        },
        '100ml': {
          total: parseFloat(getStrategyScalar(region, 'trio_price_100')),
          standard: parseFloat(getStrategyScalar(region, 'trio_std_100')),
          saving: parseFloat(getStrategyScalar(region, 'trio_saving_100'))
        }
      },
      variants: {
        '50ml': parseInt(getStrategyScalar(region, 'trio_50_id'), 10),
        '100ml': parseInt(getStrategyScalar(region, 'trio_100_id'), 10)
      }
    };
  } else if (bundleType === 'discovery') {
    return {
      currencySymbol: currSym,
      variantId: parseInt(getStrategyScalar(region, 'discovery_variant_id'), 10),
      priceDisplay: getStrategyScalar(region, 'discovery_price_display')
    };
  }
}

// UK Five-Box Output Validation
const ukFiveBox = compileBundleData('five-box', 'uk');
assertEqual(ukFiveBox.currencySymbol, '£', 'UK Five-Box Currency is £');
assertEqual(ukFiveBox.variants['50ml'], 57083185922393, 'UK Five-Box 50ml Variant is 57083185922393');
assertEqual(ukFiveBox.variants['100ml'], 57083185955161, 'UK Five-Box 100ml Variant is 57083185955161');
assertEqual(ukFiveBox.pricing['50ml'].total, 64.99, 'UK Five-Box 50ml Price is £64.99');
assertEqual(ukFiveBox.pricing['100ml'].total, 99.99, 'UK Five-Box 100ml Price is £99.99');

// USA Five-Box Output Validation
const usaFiveBox = compileBundleData('five-box', 'usa');
assertEqual(usaFiveBox.currencySymbol, '$', 'USA Five-Box Currency is $');
assertEqual(usaFiveBox.variants['50ml'], 45733941936311, 'USA Five-Box 50ml Variant is 45733941936311');
assertEqual(usaFiveBox.variants['100ml'], 45733941969079, 'USA Five-Box 100ml Variant is 45733941969079');
assertEqual(usaFiveBox.pricing['50ml'].total, 129.99, 'USA Five-Box 50ml Price is $129.99');
assertEqual(usaFiveBox.pricing['100ml'].total, 179.99, 'USA Five-Box 100ml Price is $179.99');

// UAE Five-Box Output Validation
const uaeFiveBox = compileBundleData('five-box', 'uae');
assertEqual(uaeFiveBox.currencySymbol, 'AED ', 'UAE Five-Box Currency is "AED "');
assertEqual(uaeFiveBox.variants['50ml'], 45733941936311, 'UAE Five-Box 50ml Variant is 45733941936311');
assertEqual(uaeFiveBox.variants['100ml'], 45733941969079, 'UAE Five-Box 100ml Variant is 45733941969079');
assertEqual(uaeFiveBox.pricing['50ml'].total, 249.99, 'UAE Five-Box 50ml Price is AED 249.99');
assertEqual(uaeFiveBox.pricing['100ml'].total, 369.99, 'UAE Five-Box 100ml Price is AED 369.99');
assertEqual(uaeFiveBox.pricing['50ml'].standard, 375.00, 'UAE Five-Box 50ml Standard Price is AED 375.00');
assertEqual(uaeFiveBox.pricing['100ml'].saving, 180.01, 'UAE Five-Box 100ml Savings is AED 180.01');

// ─────────────────────────────────────────────────────────────────────────────
// 3. EVALUATE BUNDLE-DATA COMPILED MATRICES (SIGNATURE TRIO)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [3/5] Evaluating Signature Trio (Trio-Set) Output Parity...');

// UK Trio Validation
const ukTrio = compileBundleData('trio-set', 'uk');
assertEqual(ukTrio.currencySymbol, '£', 'UK Trio Currency is £');
assertEqual(ukTrio.variants['50ml'], 57083186086233, 'UK Trio 50ml Variant is 57083186086233');
assertEqual(ukTrio.variants['100ml'], 57083186119001, 'UK Trio 100ml Variant is 57083186119001');
assertEqual(ukTrio.pricing['50ml'].total, 39.99, 'UK Trio 50ml Price is £39.99');
assertEqual(ukTrio.pricing['100ml'].total, 59.99, 'UK Trio 100ml Price is £59.99');

// USA Trio Validation
const usaTrio = compileBundleData('trio-set', 'usa');
assertEqual(usaTrio.currencySymbol, '$', 'USA Trio Currency is $');
assertEqual(usaTrio.variants['50ml'], 45733933154487, 'USA Trio 50ml Variant is 45733933154487');
assertEqual(usaTrio.variants['100ml'], 45733933187255, 'USA Trio 100ml Variant is 45733933187255');
assertEqual(usaTrio.pricing['50ml'].total, 79.99, 'USA Trio 50ml Price is $79.99');
assertEqual(usaTrio.pricing['100ml'].total, 119.99, 'USA Trio 100ml Price is $119.99');

// UAE Trio Validation
const uaeTrio = compileBundleData('trio-set', 'uae');
assertEqual(uaeTrio.currencySymbol, 'AED ', 'UAE Trio Currency is "AED "');
assertEqual(uaeTrio.variants['50ml'], 45733933154487, 'UAE Trio 50ml Variant is 45733933154487');
assertEqual(uaeTrio.variants['100ml'], 45733933187255, 'UAE Trio 100ml Variant is 45733933187255');
assertEqual(uaeTrio.pricing['50ml'].total, 149.99, 'UAE Trio 50ml Price is AED 149.99');
assertEqual(uaeTrio.pricing['100ml'].total, 229.99, 'UAE Trio 100ml Price is AED 229.99');

// ─────────────────────────────────────────────────────────────────────────────
// 4. EVALUATE DISCOVERY SET OUTPUT PARITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [4/5] Evaluating Discovery Set Output Parity...');

const ukDiscovery = compileBundleData('discovery', 'uk');
assertEqual(ukDiscovery.variantId, 57083186217305, 'UK Discovery Set Variant is 57083186217305');
assertEqual(ukDiscovery.priceDisplay, '£14.99', 'UK Discovery Set Price is £14.99');

const usaDiscovery = compileBundleData('discovery', 'usa');
assertEqual(usaDiscovery.variantId, 45733851955383, 'USA Discovery Set Variant is 45733851955383');
assertEqual(usaDiscovery.priceDisplay, '$19.99', 'USA Discovery Set Price is $19.99');

const uaeDiscovery = compileBundleData('discovery', 'uae');
assertEqual(uaeDiscovery.variantId, 45733851955383, 'UAE Discovery Set Variant is 45733851955383');
assertEqual(uaeDiscovery.priceDisplay, 'AED 75', 'UAE Discovery Set Price is AED 75');

// ─────────────────────────────────────────────────────────────────────────────
// 5. EVALUATE CANONICAL CURATED BRANDS CATALOG
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [5/5] Evaluating Canonical Curated Brands Catalog...');

const brandsFile = path.join(THEME_ROOT, 'snippets', 'bundle-curated-brands.liquid');
const brandsContent = fs.readFileSync(brandsFile, 'utf8');
const brandsJson = brandsContent.replace(/\{%-\s*comment[\s\S]*?endcomment\s*-%\}|\{%\s*comment[\s\S]*?endcomment\s*%\}/g, '').trim();
const brands = JSON.parse(brandsJson);

assertEqual(brands.length, 26, 'Canonical Curated Brands contains exactly 26 brands');

const expectedTags = [
  'tomford', 'chanel', 'lv', 'bykillian', 'byredo', 'dior', 'maisoncrivelli',
  'creed', 'lelabo', 'ysl', 'burberry', 'exnihilos', 'parfums', 'bvlgari',
  'carolinaherrera', 'diptyque', 'giorgioarmani', 'gucci', 'herm', 'initio',
  'lancôme', 'mfk', 'narciso', 'nasomattos', 'nishane', 'pacorabanne'
];

const actualTags = brands.map(b => b.tag);
assertEqual(actualTags, expectedTags, 'All 26 Brand Tags match canonical order & spelling');

// Verify that all 4 sections reference bundle-curated-brands
const bundleSections = ['five-box.liquid', 'bundle.liquid', 'trio-set.liquid', 'discovery.liquid'];
for (const sec of bundleSections) {
  const secContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', sec), 'utf8');
  assertEqual(
    secContent.includes("render 'bundle-curated-brands'"),
    true,
    `Section ${sec} references centralized bundle-curated-brands snippet`
  );
  assertEqual(
    secContent.includes('const curatedBrands = ['),
    false,
    `Section ${sec} contains 0 hardcoded curatedBrands arrays`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EVALUATE COMPLETE ABSENCE OF SHOTGUN COUPLING IN PRESENTATION TIERS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [6/6] Evaluating Complete Elimination of Shotgun Geographic Coupling...');

// A. No section in sections/ should reference current_region
const sectionFiles = fs.readdirSync(path.join(THEME_ROOT, 'sections')).filter(f => f.endsWith('.liquid'));
let sectionsWithCurrentRegion = 0;
for (const sFile of sectionFiles) {
  const sContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', sFile), 'utf8');
  if (sContent.includes('current_region') && !sFile.includes('test')) {
    sectionsWithCurrentRegion++;
    console.error(`  ❌ Section ${sFile} still contains current_region coupling!`);
  }
}
assertEqual(sectionsWithCurrentRegion, 0, 'Zero sections in sections/ contain current_region coupling (100% clean)');

// B. Layout theme.liquid should have zero region case/if checks
const themeContent = fs.readFileSync(path.join(THEME_ROOT, 'layout', 'theme.liquid'), 'utf8');
assertEqual(
  themeContent.includes('case current_region'),
  false,
  'layout/theme.liquid contains 0 procedural case current_region checks'
);
assertEqual(
  themeContent.includes("render 'store-context', key: 'seo_title'"),
  true,
  'layout/theme.liquid queries store-context for seo_title'
);

// C. Cart drawer should have zero region checks and query store-context
const cartContent = fs.readFileSync(path.join(THEME_ROOT, 'snippets', 'cart-drawer.liquid'), 'utf8');
assertEqual(
  cartContent.includes('current_region'),
  false,
  'snippets/cart-drawer.liquid contains 0 procedural current_region checks'
);
assertEqual(
  cartContent.includes("render 'store-context', key: 'shipping_threshold_amount'"),
  true,
  'snippets/cart-drawer.liquid delegates shipping threshold to store-context'
);

// D. Video banner should have zero region checks and query store-context
const videoContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', 'Video-banner1.liquid'), 'utf8');
assertEqual(
  videoContent.includes('current_region'),
  false,
  'sections/Video-banner1.liquid contains 0 current_region checks'
);
assertEqual(
  videoContent.includes("render 'store-context', key: 'default_video_url'"),
  true,
  'sections/Video-banner1.liquid queries store-context for default_video_url'
);

// E. Footer should have zero current_region checks and use has_trustpilot feature flag
const footerContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', 'footer.liquid'), 'utf8');
assertEqual(
  footerContent.includes('current_region'),
  false,
  'sections/footer.liquid contains 0 current_region geographic checks'
);
assertEqual(
  footerContent.includes("render 'store-context', key: 'has_trustpilot'"),
  true,
  'sections/footer.liquid queries store-context for has_trustpilot feature flag'
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. EVALUATE STRATEGY PATTERN & REGIONAL ARCHITECTURE PURITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [7/7] Evaluating Strategy Pattern & Regional Architecture Purity...');

// A. Bundle data provider should have ZERO current_region checks or case switches
const bundleDataContent = fs.readFileSync(path.join(THEME_ROOT, 'snippets', 'bundle-data.liquid'), 'utf8');
assertEqual(
  bundleDataContent.includes('current_region'),
  false,
  'snippets/bundle-data.liquid contains 0 current_region references (100% decoupled)'
);
assertEqual(
  bundleDataContent.includes('case current_region'),
  false,
  'snippets/bundle-data.liquid contains 0 procedural case switches'
);

// B. Store context facade delegates to region-strategy
const storeCtxContent = fs.readFileSync(path.join(THEME_ROOT, 'snippets', 'store-context.liquid'), 'utf8');
assertEqual(
  storeCtxContent.includes("render 'region-strategy'"),
  true,
  'snippets/store-context.liquid delegates to region-strategy'
);

const resolverContent = fs.readFileSync(path.join(THEME_ROOT, 'snippets', 'region-strategy.liquid'), 'utf8');
assertEqual(
  resolverContent.includes("render 'region-strategy-uk'"),
  true,
  'snippets/region-strategy.liquid delegates to region-strategy-uk'
);
assertEqual(
  resolverContent.includes("render 'region-strategy-usa'"),
  true,
  'snippets/region-strategy.liquid delegates to region-strategy-usa'
);
assertEqual(
  resolverContent.includes("render 'region-strategy-uae'"),
  true,
  'snippets/region-strategy.liquid delegates to region-strategy-uae'
);

// C. Strategy modules exist in core snippets
assertEqual(
  fs.existsSync(path.join(THEME_ROOT, 'snippets', 'region-strategy-uk.liquid')),
  true,
  'snippets/region-strategy-uk.liquid exists'
);
assertEqual(
  fs.existsSync(path.join(THEME_ROOT, 'snippets', 'region-strategy-usa.liquid')),
  true,
  'snippets/region-strategy-usa.liquid exists'
);
assertEqual(
  fs.existsSync(path.join(THEME_ROOT, 'snippets', 'region-strategy-uae.liquid')),
  true,
  'snippets/region-strategy-uae.liquid exists'
);

// D. Regional packages contain strategy delegates
assertEqual(
  fs.existsSync(path.join(THEME_ROOT, 'regions', 'uk', 'snippets', 'region-strategy.liquid')),
  true,
  'regions/uk/snippets/region-strategy.liquid exists'
);
assertEqual(
  fs.existsSync(path.join(THEME_ROOT, 'regions', 'usa', 'snippets', 'region-strategy.liquid')),
  true,
  'regions/usa/snippets/region-strategy.liquid exists'
);
assertEqual(
  fs.existsSync(path.join(THEME_ROOT, 'regions', 'uae', 'snippets', 'region-strategy.liquid')),
  true,
  'regions/uae/snippets/region-strategy.liquid exists'
);

// E. Sync engine includes regional snippets
const syncEngineContent = fs.readFileSync(path.join(THEME_ROOT, 'engine', 'sync-regions.cjs'), 'utf8');
assertEqual(
  syncEngineContent.includes("const regionalDirs = ['templates', 'locales', 'snippets'];"),
  true,
  'engine/sync-regions.cjs synchronizes regional snippets'
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. EVALUATE COMPLETE ELIMINATION OF HARDCODED FALLBACK VALUES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n>>> [8/8] Evaluating Complete Elimination of Hardcoded Magic Fallbacks...');

const discoverySetContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', 'discovery-set.liquid'), 'utf8');
assertEqual(
  discoverySetContent.includes("default: '$'"),
  false,
  "sections/discovery-set.liquid contains 0 hardcoded default: '$' occurrences"
);

const productCustomContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', 'product-custom.liquid'), 'utf8');
assertEqual(
  productCustomContent.includes("default: '$'"),
  false,
  "sections/product-custom.liquid contains 0 hardcoded default: '$' occurrences"
);

const mainGridContent = fs.readFileSync(path.join(THEME_ROOT, 'sections', 'main-collection-product-grid.liquid'), 'utf8');
assertEqual(
  mainGridContent.includes("default: '$'"),
  false,
  "sections/main-collection-product-grid.liquid contains 0 hardcoded default: '$' occurrences"
);

const cartDrawerFinal = fs.readFileSync(path.join(THEME_ROOT, 'snippets', 'cart-drawer.liquid'), 'utf8');
assertEqual(
  cartDrawerFinal.includes("|| '$'"),
  false,
  "snippets/cart-drawer.liquid contains 0 hardcoded || '$' fallbacks"
);
assertEqual(
  cartDrawerFinal.includes("|| 7000"),
  false,
  "snippets/cart-drawer.liquid contains 0 hardcoded || 7000 shipping fallbacks"
);
assertEqual(
  cartDrawerFinal.includes("|| 799"),
  false,
  "snippets/cart-drawer.liquid contains 0 hardcoded || 799 shipping cost fallbacks"
);

// ─────────────────────────────────────────────────────────────────────────────
// FINAL RESULTS SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n==================================================================');
console.log(`   PARITY RESULTS: ${passedAssertions} / ${totalAssertions} Passed`);
if (failures.length === 0) {
  console.log('   🎉 100% ARCHITECTURAL PURITY & LIVE PARITY CONFIRMED');
  console.log('==================================================================\n');
  process.exit(0);
} else {
  console.error(`   ❌ ${failures.length} PARITY FAILURES DETECTED!`);
  console.log('==================================================================\n');
  process.exit(1);
}

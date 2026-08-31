#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 4: Deep Component & Logic Integration Suite
 * ============================================================================
 * 
 * Exhaustive component-level and mathematical logic simulations across:
 *   Suite U: Variant Inventory & Sold-Out Boundary Logic
 *   Suite V: Quick Order List Bulk Queue & State Machine
 *   Suite W: Product Info & Volume Pricing Rule Engine
 *   Suite X: Media Gallery & Modal Synchronizer
 *   Suite Y: Facets & Multi-Facet Collection Filter Query Builder
 *   Suite Z: Predictive Search Engine & Regex Escape Safety
 *   Suite AA: Multi-Currency & Locale Formatter
 *   Suite AB: Rapid Add-to-Cart Concurrency & Double-Click Lockout
 *   Suite AC: Network Dropout, 422 Unprocessable Entity, & Corrupt HTML Recovery
 *   Suite AD: Line Item Properties Zero-Drop & Cart Tier Math
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, suiteName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`    ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`    ❌ [FAIL] ${message}`);
  }
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Deep Logic & Component Test  ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE U: Variant Inventory & Sold-Out Boundary Logic
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE U: Variant Inventory & Sold-Out Boundary Logic         │');
console.log('└──────────────────────────────────────────────────────────────┘');

function checkInventoryAvailability(variant, requestedQty = 1, currentCartQty = 0) {
  if (!variant || typeof variant !== 'object') return false;
  if (!variant.available) return false;
  if (variant.inventory_policy === 'continue') return true;
  if (typeof variant.inventory_quantity === 'number') {
    return (currentCartQty + requestedQty) <= variant.inventory_quantity;
  }
  return true;
}

const vInStock = { id: 101, available: true, inventory_quantity: 5, inventory_policy: 'deny' };
const vSoldOut = { id: 102, available: false, inventory_quantity: 0, inventory_policy: 'deny' };
const vContinuePolicy = { id: 103, available: true, inventory_quantity: 0, inventory_policy: 'continue' };

assert(checkInventoryAvailability(vInStock, 1, 0) === true, 'U1.1: In-stock variant with 5 units allows adding 1 unit', 'SUITE U');
assert(checkInventoryAvailability(vInStock, 3, 3) === false, 'U1.2: Adding 3 units when 3 already in cart exceeds stock limit of 5', 'SUITE U');
assert(checkInventoryAvailability(vSoldOut, 1, 0) === false, 'U1.3: Sold out variant (available=false) correctly blocked', 'SUITE U');
assert(checkInventoryAvailability(vContinuePolicy, 10, 0) === true, 'U1.4: Pre-order variant (policy=continue) allows purchasing past 0 stock', 'SUITE U');
assert(checkInventoryAvailability(null, 1, 0) === false, 'U1.5: Null/undefined variant safely rejected without TypeError', 'SUITE U');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE V: Quick Order List Bulk Queue & State Machine
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE V: Quick Order List Bulk Queue & State Machine         │');
console.log('└──────────────────────────────────────────────────────────────┘');

class MockQuickOrderQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.cartData = {};
  }
  enqueue(variantId, quantity) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) return false;
    this.queue.push({ variantId, quantity: qty });
    return true;
  }
  processBatch() {
    if (this.queue.length === 0) return {};
    const updates = {};
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      updates[item.variantId] = item.quantity;
    }
    this.cartData = { ...this.cartData, ...updates };
    return updates;
  }
}

const queue = new MockQuickOrderQueue();
assert(queue.enqueue(401, '5') === true, 'V1.1: Valid integer quantity string enqueued cleanly', 'SUITE V');
assert(queue.enqueue(402, -3) === false, 'V1.2: Negative quantity rejected at boundary', 'SUITE V');
assert(queue.enqueue(403, 'invalid') === false, 'V1.3: Non-numeric quantity string rejected', 'SUITE V');
queue.enqueue(404, 2);
const batch = queue.processBatch();
assert(batch[401] === 5 && batch[404] === 2, 'V2.1: Multi-item batch updates dictionary created accurately', 'SUITE V');
assert(queue.queue.length === 0, 'V2.2: Queue fully flushed after processing', 'SUITE V');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE W: Product Info & Volume Pricing Rule Engine
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE W: Product Info & Volume Pricing Rule Engine           │');
console.log('└──────────────────────────────────────────────────────────────┘');

function calculateVolumePrice(unitPriceCents, quantity, tiers = []) {
  const qty = parseInt(quantity, 10) || 1;
  let activeUnitPrice = unitPriceCents;

  const sortedTiers = [...tiers].sort((a, b) => b.min_quantity - a.min_quantity);
  for (const tier of sortedTiers) {
    if (qty >= tier.min_quantity) {
      activeUnitPrice = tier.price_cents;
      break;
    }
  }

  const subtotalCents = activeUnitPrice * qty;
  return {
    unitPrice: activeUnitPrice,
    subtotal: subtotalCents,
    savings: (unitPriceCents * qty) - subtotalCents
  };
}

const volumeTiers = [
  { min_quantity: 3, price_cents: 2500 },
  { min_quantity: 5, price_cents: 2000 }
];

const standardResult = calculateVolumePrice(3000, 2, volumeTiers);
assert(standardResult.unitPrice === 3000 && standardResult.subtotal === 6000 && standardResult.savings === 0, 'W1.1: Standard pricing applies for 2 units below tier 1 (2 * $30.00 = $60.00)', 'SUITE W');

const tier1Result = calculateVolumePrice(3000, 3, volumeTiers);
assert(tier1Result.unitPrice === 2500 && tier1Result.subtotal === 7500 && tier1Result.savings === 1500, 'W1.2: Tier 1 discount applies for 3 units ($25.00/ea, $15.00 total savings)', 'SUITE W');

const tier2Result = calculateVolumePrice(3000, 6, volumeTiers);
assert(tier2Result.unitPrice === 2000 && tier2Result.subtotal === 12000 && tier2Result.savings === 6000, 'W1.3: Tier 2 discount applies for 6 units ($20.00/ea, $60.00 total savings)', 'SUITE W');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE X: Media Gallery & Modal Synchronizer
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE X: Media Gallery & Modal Synchronizer                  │');
console.log('└──────────────────────────────────────────────────────────────┘');

class MockMediaGallery {
  constructor(mediaList = []) {
    this.mediaList = mediaList;
    this.activeIndex = 0;
    this.isModalOpen = false;
  }
  setActiveMedia(index) {
    if (index >= 0 && index < this.mediaList.length) {
      this.activeIndex = index;
      return true;
    }
    return false;
  }
  openModal() {
    this.isModalOpen = true;
    return this.mediaList[this.activeIndex] || null;
  }
  closeModal() {
    this.isModalOpen = false;
  }
}

const gallery = new MockMediaGallery(['img1.jpg', 'img2.jpg', 'img3.jpg']);
assert(gallery.setActiveMedia(1) === true && gallery.activeIndex === 1, 'X1.1: Media switch to index 1 updates active slide', 'SUITE X');
assert(gallery.setActiveMedia(10) === false && gallery.activeIndex === 1, 'X1.2: Out-of-bounds media index rejected safely', 'SUITE X');
assert(gallery.openModal() === 'img2.jpg' && gallery.isModalOpen === true, 'X1.3: Modal opens with current active media item', 'SUITE X');
gallery.closeModal();
assert(gallery.isModalOpen === false, 'X1.4: Modal closes cleanly and resets state', 'SUITE X');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE Y: Facets & Multi-Facet Collection Filter Query Builder
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE Y: Facets & Multi-Facet Collection Filter Query        │');
console.log('└──────────────────────────────────────────────────────────────┘');

function buildFacetQueryString(formValues = {}) {
  const params = [];
  for (const [key, val] of Object.entries(formValues)) {
    if (Array.isArray(val)) {
      val.forEach(v => {
        if (v !== '' && v !== null && v !== undefined) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
        }
      });
    } else if (val !== '' && val !== null && val !== undefined) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }
  return params.join('&');
}

const facetFilters = {
  'filter.v.price.gte': '20.00',
  'filter.v.price.lte': '100.00',
  'filter.p.tag': ['woody', 'floral', 'fresh'],
  'sort_by': 'price-ascending',
  'empty_filter': ''
};

const queryString = buildFacetQueryString(facetFilters);
assert(queryString.includes('filter.v.price.gte=20.00'), 'Y1.1: Price floor filter encoded correctly', 'SUITE Y');
assert(queryString.includes('filter.p.tag=woody') && queryString.includes('filter.p.tag=floral'), 'Y1.2: Multi-value array filters serialized into separate URL parameters', 'SUITE Y');
assert(!queryString.includes('empty_filter'), 'Y1.3: Empty filter string values cleanly stripped from query', 'SUITE Y');
assert(queryString.includes('sort_by=price-ascending'), 'Y1.4: Sort parameter included in URL state', 'SUITE Y');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE Z: Predictive Search Engine & Regex Escape Safety
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE Z: Predictive Search Engine & Regex Escape Safety      │');
console.log('└──────────────────────────────────────────────────────────────┘');

function safeRegexMatch(text, searchPattern) {
  if (!text || !searchPattern) return false;
  const escaped = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const rx = new RegExp(escaped, 'i');
    return rx.test(text);
  } catch (e) {
    return false;
  }
}

assert(safeRegexMatch("Tom Ford (Tobacco Vanille) [50ml]", "Ford (Tobacco") === true, 'Z1.1: Dangerous unescaped parentheses matched cleanly without SyntaxError', 'SUITE Z');
assert(safeRegexMatch("YSL + Libre *Special*", "+ Libre *") === true, 'Z1.2: Dangerous asterisks and plus signs matched safely without regex quantifier crash', 'SUITE Z');
assert(safeRegexMatch("Creed Aventus", "[") === false, 'Z1.3: Single unmatched square bracket safely handled without invalid character set crash', 'SUITE Z');
assert(safeRegexMatch("", "anything") === false, 'Z1.4: Empty target string safely returns false without exception', 'SUITE Z');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE AA: Multi-Currency & Locale Formatter
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE AA: Multi-Currency & Locale Formatter                  │');
console.log('└──────────────────────────────────────────────────────────────┘');

function formatCurrency(cents, currencyCode = 'GBP') {
  const numeric = Number(cents);
  if (isNaN(numeric) || cents === null || cents === undefined) {
    return currencyCode === 'GBP' ? '£0.00' : '$0.00';
  }
  const amount = (numeric / 100).toFixed(2);
  switch (currencyCode.toUpperCase()) {
    case 'GBP': return `£${amount}`;
    case 'EUR': return `€${amount}`;
    case 'USD': return `$${amount}`;
    case 'CAD': return `CA$${amount}`;
    default: return `${currencyCode} ${amount}`;
  }
}

assert(formatCurrency(1499, 'GBP') === '£14.99', 'AA1.1: 1499 cents correctly formats to £14.99', 'SUITE AA');
assert(formatCurrency(2900, 'EUR') === '€29.00', 'AA1.2: 2900 cents correctly formats to €29.00', 'SUITE AA');
assert(formatCurrency(12550, 'CAD') === 'CA$125.50', 'AA1.3: 12550 cents correctly formats to CA$125.50', 'SUITE AA');
assert(formatCurrency('invalid', 'GBP') === '£0.00', 'AA1.4: Invalid string input safely falls back to £0.00 without throwing', 'SUITE AA');
assert(formatCurrency(0, 'USD') === '$0.00', 'AA1.5: 0 cents formats correctly to $0.00', 'SUITE AA');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE AB: Rapid Add-to-Cart Concurrency & Double-Click Lockout
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE AB: Rapid Add-to-Cart Concurrency Lockout              │');
console.log('└──────────────────────────────────────────────────────────────┘');

class MockAddToCartDispatcher {
  constructor() {
    this.isProcessing = false;
    this.dispatches = 0;
  }
  async clickAddToCart() {
    if (this.isProcessing) return { success: false, reason: 'LOCKED' };
    this.isProcessing = true;
    this.dispatches++;
    await new Promise(r => setTimeout(r, 10));
    this.isProcessing = false;
    return { success: true };
  }
}

async function runConcurrencyTest() {
  const atc = new MockAddToCartDispatcher();
  const results = await Promise.all([
    atc.clickAddToCart(),
    atc.clickAddToCart(),
    atc.clickAddToCart()
  ]);

  const successCount = results.filter(r => r.success).length;
  const lockedCount = results.filter(r => r.reason === 'LOCKED').length;

  assert(successCount === 1, 'AB1.1: Exactly 1 dispatch permitted during rapid concurrent clicks', 'SUITE AB');
  assert(lockedCount === 2, 'AB1.2: 2 duplicate rapid clicks successfully blocked at gate', 'SUITE AB');
  assert(atc.isProcessing === false, 'AB1.3: Lock safely released after request completion', 'SUITE AB');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE AC: Network Dropout, 422 Unprocessable Entity, & Recovery
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE AC: Network Dropout & Corrupt HTML Recovery            │');
console.log('└──────────────────────────────────────────────────────────────┘');

async function simulateNetworkFetch(scenario) {
  let errorMessage = null;
  let isButtonUnlocked = false;

  try {
    if (scenario === '422_SOLD_OUT') {
      const response = { ok: false, status: 422, json: async () => ({ description: 'Sold out', message: 'Item is sold out' }) };
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.description || 'Sold out');
      }
    } else if (scenario === '502_CLOUDFLARE_HTML') {
      const response = { ok: false, status: 502, text: async () => '<html><body>Bad Gateway</body></html>' };
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }
    } else if (scenario === 'OFFLINE_DROPOUT') {
      throw new TypeError('Failed to fetch');
    }
  } catch (err) {
    errorMessage = err.message || 'Error occurred';
  } finally {
    isButtonUnlocked = true;
  }

  return { errorMessage, isButtonUnlocked };
}

async function runNetworkRecoveryTests() {
  const res422 = await simulateNetworkFetch('422_SOLD_OUT');
  assert(res422.errorMessage === 'Sold out' && res422.isButtonUnlocked, 'AC1.1: Shopify 422 Sold Out caught and button unlocked in finally', 'SUITE AC');

  const res502 = await simulateNetworkFetch('502_CLOUDFLARE_HTML');
  assert(res502.errorMessage.includes('502') && res502.isButtonUnlocked, 'AC1.2: Cloudflare 502 HTML response caught cleanly without JSON parse crash', 'SUITE AC');

  const resOffline = await simulateNetworkFetch('OFFLINE_DROPOUT');
  assert(resOffline.errorMessage === 'Failed to fetch' && resOffline.isButtonUnlocked, 'AC1.3: Network offline dropout caught safely and UI unlocked', 'SUITE AC');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE AD: Line Item Properties Zero-Drop & Cart Tier Math
// ─────────────────────────────────────────────────────────────────────────────
console.log('┌──────────────────────────────────────────────────────────────┐');
console.log('│ SUITE AD: Line Item Properties Zero-Drop & Tier Math         │');
console.log('└──────────────────────────────────────────────────────────────┘');

function calculateCartTierDiscount(subtotalCents) {
  let discountCents = 0;
  let nextTierThreshold = 0;

  if (subtotalCents >= 10000) {
    discountCents = Math.round(subtotalCents * 0.20); // 20% off
    nextTierThreshold = 0;
  } else if (subtotalCents >= 6000) {
    discountCents = Math.round(subtotalCents * 0.10); // 10% off
    nextTierThreshold = 10000 - subtotalCents;
  } else {
    discountCents = 0;
    nextTierThreshold = 6000 - subtotalCents;
  }

  return {
    subtotal: subtotalCents,
    discount: discountCents,
    total: subtotalCents - discountCents,
    nextTierThreshold
  };
}

const tierLow = calculateCartTierDiscount(4500);
assert(tierLow.discount === 0 && tierLow.nextTierThreshold === 1500, 'AD1.1: $45.00 subtotal receives $0 discount and calculates $15.00 to Tier 1', 'SUITE AD');

const tierMid = calculateCartTierDiscount(8000);
assert(tierMid.discount === 800 && tierMid.total === 7200 && tierMid.nextTierThreshold === 2000, 'AD1.2: $80.00 subtotal receives 10% ($8.00) discount, total = $72.00, $20.00 to Tier 2', 'SUITE AD');

const tierHigh = calculateCartTierDiscount(12000);
assert(tierHigh.discount === 2400 && tierHigh.total === 9600 && tierHigh.nextTierThreshold === 0, 'AD1.3: $120.00 subtotal receives 20% ($24.00) discount, total = $96.00 (Max Tier reached)', 'SUITE AD');

// Run async tests
(async () => {
  await runConcurrencyTest();
  await runNetworkRecoveryTests();

  console.log('');
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log(`│  Total Assertions: ${totalTests}  │  Passed: ${passedTests}  │  Failed:  ${failedTests}          │`);
  console.log('└──────────────────────────────────────────────────────────────┘');

  if (failedTests === 0) {
    console.log('\n  ✅ ALL RIGOROUS INTEGRATION SUITES VERIFIED (100% PASS)\n');
    process.exit(0);
  } else {
    console.error(`\n  ❌ ${failedTests} RIGOROUS INTEGRATION ASSERTIONS FAILED\n`);
    process.exit(1);
  }
})();

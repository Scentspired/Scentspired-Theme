# 🛡️ Theme Guardian — Automated Quality & Detection Report

**Generated At:** `2026-09-24 06:12:25 UTC`  
**Branch:** `develop`  
**Target Codebase:** `Scentspired-UK`  

---

## 📊 Executive Summary

| Metric | Value | Status |
| :--- | :--- | :--- |
| **Files Scanned** | `234` Liquid & JS files | 🔍 Complete |
| **Total Lines Inspected** | `61,091` lines | 🔍 Complete |
| **Active Rules Evaluated** | `12 Rules` | 🛡️ Active |
| **Errors (Blockers)** | `53` errors | ❌ **Blocking Deploy** |
| **Warnings** | `1` warnings | ⚠️ Review |
| **Flow Simulator Assertions** | `99` Passed / `0` Failed | ✅ **100% PASS** |
| **Overall Deployment Gate** | **BLOCKED** | 🔴 **ACTION REQUIRED** |

---

## 🧪 Purchase Funnel Simulation Results (Layer 2)

```
╔══════════════════════════════════════════════════════════════╗
║  SCENTSPIRED THEME GUARDIAN — Layer 2: Flow Simulator       ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│ SUITE A: Product Detail Page (PDP) Add-to-Cart Simulation    │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] A1.1: Submit button physically disabled on click
    ✅ [PASS] A1.2: Loading class applied to button
    ✅ [PASS] A1.3: Dispatched /cart/add request
    ✅ [PASS] A1.4: window.updateDossierCartUI received cart update
    ✅ [PASS] A1.5: window.openDossierCart triggered to slide drawer open
    ✅ [PASS] A1.6: Button re-enabled after completion
    ✅ [PASS] A1.7: Loading spinner removed
    ✅ [PASS] A2.1: Exactly 1 request dispatched despite 5 rapid clicks
    ✅ [PASS] A3.1: Error state active on sold-out response
    ✅ [PASS] A3.2: Sold out button remains physically disabled
    ✅ [PASS] A3.3: Sold out message rendered visible
    ✅ [PASS] A4.1: Network crash handled cleanly without unhandled exception
    ✅ [PASS] A4.2: Button safely re-enabled so customer can retry
    ✅ [PASS] A4.3: Loading spinner cleared on failure

┌──────────────────────────────────────────────────────────────┐
│ SUITE B: Variant Switching & Collection Card Simulation     │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] B1.1: Hidden variant input updated on size selection
    ✅ [PASS] B1.2: Price display updated to variant price
    ✅ [PASS] B2.1: Card with missing variant input executes safely without crash

┌──────────────────────────────────────────────────────────────┐
│ SUITE C: Bundle Builder & Apostrophe Safety Simulation       │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] C1.1: Brand tag with apostrophe properly escaped in inline onclick
    ✅ [PASS] C1.2: Second brand tag with apostrophe properly escaped
    ✅ [PASS] C2.1: Checkout button disabled when bundle has 4/5 items
    ✅ [PASS] C2.2: Checkout button unlocks when bundle has 5/5 items
    ✅ [PASS] C2.3: Discounted bundle price calculated and displayed

┌──────────────────────────────────────────────────────────────┐
│ SUITE D: Custom Cart Drawer Sync & Tier Simulation           │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] D1.1: Cart count badge updated to 3 items
    ✅ [PASS] D1.2: Cart total price correctly formatted
    ✅ [PASS] D2.1: Cart drawer successfully opened with .is-open class

┌──────────────────────────────────────────────────────────────┐
│ SUITE E: Global .item-form Delegation Simulation             │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] E1.1: .item-form dispatches /cart/add.js
    ✅ [PASS] E1.2: .item-form triggers cart drawer to open
    ✅ [PASS] E1.3: Submit button safely re-enabled

┌──────────────────────────────────────────────────────────────┐
│ SUITE F: Malformed & Missing Variant ID Defense              │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] F1.1: Missing variant ID cleanly blocked before API dispatch
    ✅ [PASS] F1.2: Submit button remains interactive and not frozen

┌──────────────────────────────────────────────────────────────┐
│ SUITE G: Non-JSON HTML Error & Crash Recovery               │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] G1.1: 502 HTML error caught in .catch() without crashing UI
    ✅ [PASS] G1.2: Button guaranteed re-enabled in .finally() block

┌──────────────────────────────────────────────────────────────┐
│ SUITE H: Pricing Calculation & NaN Defense                   │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] H1.1: Standard float formats correctly
    ✅ [PASS] H1.2: String float formats correctly
    ✅ [PASS] H1.3: undefined input defaults to $0.00 (never $NaN)
    ✅ [PASS] H1.4: null input defaults to $0.00
    ✅ [PASS] H1.5: Non-numeric string defaults safely

┌──────────────────────────────────────────────────────────────┐
│ SUITE I: Free Shipping Threshold Progress Math               │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] I1.1: $0 cart shows 0% progress and $50 remaining
    ✅ [PASS] I1.2: $35 cart shows 70% progress and $15 remaining
    ✅ [PASS] I1.3: $75 cart clamps to 100% and unlocks free shipping

┌──────────────────────────────────────────────────────────────┐
│ SUITE J: Checkout Gateway Action Integrity                   │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] J1.1: Empty cart checkout blocked from firing dead redirect
    ✅ [PASS] J1.2: Valid cart immediately redirects to /checkout

┌──────────────────────────────────────────────────────────────┐
│ SUITE K: Customer Account Registration & Auth Flow           │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] K1.1: Invalid registration inputs caught before network dispatch
    ✅ [PASS] K1.2: Valid registration inputs pass validation cleanly
    ✅ [PASS] K2.1: Guest shopper correctly routed to /account/login
    ✅ [PASS] K2.2: Logged-in customer correctly routed to /account dashboard
    ✅ [PASS] K2.3: Custom register link preserved

┌──────────────────────────────────────────────────────────────┐
│ SUITE L: Line Item Properties Serialization (Zero-Drop)      │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] L1.1: Exactly 15 line item properties generated for 5-box set
    ✅ [PASS] L1.2: Slot 1 metadata accurate
    ✅ [PASS] L1.3: Slot 5 metadata accurate
    ✅ [PASS] L2.1: Bundle with 4/5 items blocked
    ✅ [PASS] L2.2: Complete 5/5 bundle verified valid

┌──────────────────────────────────────────────────────────────┐
│ SUITE M: Live Telemetry & Error Vault Dispatcher             │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] M1.1: Error payload formatted with breadcrumb trail
    ✅ [PASS] M1.2: Breadcrumb order and metadata preserved
    ✅ [PASS] M2.1: Crash event successfully persisted in LocalStorage vault

┌──────────────────────────────────────────────────────────────┐
│ SUITE N: Predictive Search & Regex Escape Simulation         │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] N1.1: Special characters in search query safely escaped without RegExp crash
    ✅ [PASS] N2.1: Search queries < 2 chars short-circuit before network dispatch
    ✅ [PASS] N2.2: Valid 5-char search query dispatches to /search/suggest
    ✅ [PASS] N3.1: Null element gracefully returns false without exception
    ✅ [PASS] N3.2: Search items render into container with valid markup

┌──────────────────────────────────────────────────────────────┐
│ SUITE O: Mobile Navigation & Header State Machine            │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] O1.1: Mobile menu opens and applies is-active class
    ✅ [PASS] O1.2: Trigger aria-expanded updated to true on open
    ✅ [PASS] O1.3: Mobile menu closes and cleans up is-active class
    ✅ [PASS] O1.4: Trigger aria-expanded updated to false on close
    ✅ [PASS] O2.1: MobileNavigation legacy alias points to MobileMenuManager
    ✅ [PASS] O2.2: Instantiating MobileNavigation yields MobileMenuManager instance

┌──────────────────────────────────────────────────────────────┐
│ SUITE P: Multi-Currency & Localization Formatting            │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] P1.1: USD standard price 2900 cents formats to $29.00
    ✅ [PASS] P1.2: GBP price 12550 cents formats to £125.50
    ✅ [PASS] P1.3: 0 cents formats to $0.00
    ✅ [PASS] P1.4: Non-numeric currency input safely falls back to $0.00
    ✅ [PASS] P2.1: Country code updated to CA in localization form

┌──────────────────────────────────────────────────────────────┐
│ SUITE Q: Sentry Noise Defense & Front-End Error Filtering    │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] Q1.1: Linktree 3rd party script error correctly dropped
    ✅ [PASS] Q1.2: Firework video script error correctly dropped
    ✅ [PASS] Q1.3: Generic CORS "Script error." correctly dropped
    ✅ [PASS] Q1.4: First-party theme JS error correctly PRESERVED for capture

┌──────────────────────────────────────────────────────────────┐
│ SUITE R: Five-Box & Trio-Set Bundle Variable Safety          │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] R1.1: 5-Box set computes $145.00 subtotal - $15.00 discount = $130.00 total
    ✅ [PASS] R1.2: Trio set computes $87.00 subtotal - $10.00 discount = $77.00 total
    ✅ [PASS] R2.1: Incomplete 5-box (3/5 filled) is blocked with missingCount=2
    ✅ [PASS] R2.2: Complete 5-box (5/5 filled) passes validation cleanly

┌──────────────────────────────────────────────────────────────┐
│ SUITE S: Cart Quantity Mutation & Optimistic Delta Sync      │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] S1.1: Item quantity incremented from 2 to 3
    ✅ [PASS] S1.2: Setting quantity to 0 removes line item from cart
    ✅ [PASS] S2.1: Total cart item count calculated accurately (3 + 2 = 5 items)
    ✅ [PASS] S2.2: Cart subtotal formatted correctly ((3*29) + (2*15) = $117.00)

┌──────────────────────────────────────────────────────────────┐
│ SUITE T: Telemetry Ring Buffer & FIFO Eviction Safety        │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] T1.1: Ring buffer strictly capped at max capacity (10 entries)
    ✅ [PASS] T1.2: Oldest 15 entries evicted FIFO, preserving latest 16-25
    ✅ [PASS] T2.1: Cyclic payload safely stringified without throwing TypeError

┌──────────────────────────────────────────────────────────────┐
│ SUITE U: Multi-Store Bundle & Zero-Dollar Cart Defense       │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] U1.1: Discovery Set parent variant added successfully
    ✅ [PASS] U1.2: Added item ID matches parent bundle variant (NOT individual $0 components)
    ✅ [PASS] U1.3: Selected scents attached as line-item properties
    ✅ [PASS] U1.4: Cart total is strictly positive ($19.99 / £14.99), 0-dollar leak prevented
    ✅ [PASS] U2.1: API error caught cleanly without uncaught exception
    ✅ [PASS] U2.2: Dangerous silent fallback to $0 raw items strictly blocked
    ✅ [PASS] U2.3: Shopify error description propagated cleanly

┌──────────────────────────────────────────────────────────────┐
│ SUITE V: Zero-Price Order Prevention & Cart Security Shield │
└──────────────────────────────────────────────────────────────┘
    ✅ [PASS] V1.1: Detected 1 zero-priced item in cart for purge
    ✅ [PASS] V1.2: Correct zero-price child variant identified
    ✅ [PASS] V1.3: Update payload generated with 0 quantity purge
    ✅ [PASS] V2.1: Checkout button strictly locked for $0 subtotal cart
    ✅ [PASS] V2.2: Subtotal calculated strictly as $0 ignoring free items
    ✅ [PASS] V3.1: proceedToDossierCheckout hard-blocks 10-item $0 cart checkout

┌──────────────────────────────────────────────────────────────┐
│  Total Assertions: 99  │  Passed: 99  │  Failed:  0          │
└──────────────────────────────────────────────────────────────┘

  ✅ ALL CRITICAL PURCHASE FLOWS VERIFIED (100% PASS)
```

---

## 🚨 Detected Issues by File & Severity (Layer 1)

### 📄 `sections\bundle--discovery.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 193](#sections\bundle--discovery-liquid-line-193) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 204](#sections\bundle--discovery-liquid-line-204) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 210](#sections\bundle--discovery-liquid-line-210) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 217](#sections\bundle--discovery-liquid-line-217) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 402](#sections\bundle--discovery-liquid-line-402) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 407](#sections\bundle--discovery-liquid-line-407) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 199](#sections\bundle--discovery-liquid-line-199) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 233](#sections\bundle--discovery-liquid-line-233) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 232](#sections\bundle--discovery-liquid-line-232) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 363](#sections\bundle--discovery-liquid-line-363) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 389](#sections\bundle--discovery-liquid-line-389) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 420](#sections\bundle--discovery-liquid-line-420) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 301](#sections\bundle--discovery-liquid-line-301) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |
| [Line 119](#sections\bundle--discovery-liquid-line-119) | 🔴 ERROR | `no-hardcoded-shopify-variant-ids` | Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id \| json }}) or configured via Theme Settings to avoid multi-store desyncs. |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\bundle--discovery.liquid</code> (14 items)</b></summary>

<a id="sections\bundle--discovery-liquid-line-193"></a>
#### 📍 Line 193 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     191 |   function openSelector(index) {
     192 |   currentSlot = index;
>>   193 |   document.getElementById('SelectionDrawer').classList.add('visible');
     194 | 
     195 |   // 🔥 Directly open product step
```

<a id="sections\bundle--discovery-liquid-line-204"></a>
#### 📍 Line 204 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     202 | 
     203 |   function closeSelector() {
>>   204 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     205 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     206 |   }
```

<a id="sections\bundle--discovery-liquid-line-210"></a>
#### 📍 Line 210 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     208 |   function showStep(id) {
     209 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   210 |   document.getElementById(id).style.display = 'block';
     211 | 
     212 |   // ❌ No back button at all
```

<a id="sections\bundle--discovery-liquid-line-217"></a>
#### 📍 Line 217 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     215 | 
     216 |   if (id === 'Step-Product') {
>>   217 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     218 |     renderProducts();
     219 |     initSearchListener();
```

<a id="sections\bundle--discovery-liquid-line-402"></a>
#### 📍 Line 402 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     400 | 
     401 |     const statusText = count < 5 ? `Add ${5 - count} more items to complete your Discovery Box` : `Your Discovery Box is complete!`;
>>   402 |     document.getElementById('BundleStatusText').innerText = statusText;
     403 | 
     404 |     // Update progress markers
```

<a id="sections\bundle--discovery-liquid-line-407"></a>
#### 📍 Line 407 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     405 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     406 |     for (let i = 0; i < count; i++) {
>>   407 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     408 |     }
     409 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\bundle--discovery-liquid-line-199"></a>
#### 📍 Line 199 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     197 | 
     198 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   199 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     200 | }
     201 | 
```

<a id="sections\bundle--discovery-liquid-line-233"></a>
#### 📍 Line 233 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     231 |     const grid = document.getElementById('BrandGrid');
     232 |     grid.innerHTML = brands.map(b => `
>>   233 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     234 |         <span>${b.name}</span>
     235 |       </div>
```

<a id="sections\bundle--discovery-liquid-line-232"></a>
#### 📍 Line 232 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     230 |   function renderBrands() {
     231 |     const grid = document.getElementById('BrandGrid');
>>   232 |     grid.innerHTML = brands.map(b => `
     233 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     234 |         <span>${b.name}</span>
```

<a id="sections\bundle--discovery-liquid-line-363"></a>
#### 📍 Line 363 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     361 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     362 |       if (item) {
>>   363 |         el.classList.remove('empty');
     364 |         el.innerHTML = `
     365 |           <div class="slot-filled-content">
```

<a id="sections\bundle--discovery-liquid-line-389"></a>
#### 📍 Line 389 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     387 | 
     388 | /* Enable button only when exactly 5 items are selected */
>>   389 | mainBtn.disabled = count !== 5;
     390 | 
     391 | /* Show price ONLY when bundle is complete */
```

<a id="sections\bundle--discovery-liquid-line-420"></a>
#### 📍 Line 420 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     418 | async function handleCheckout() {
     419 |   const btn = document.getElementById('MainActionBtn');
>>   420 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     421 | 
     422 |   // Prevent double submission
```

<a id="sections\bundle--discovery-liquid-line-301"></a>
#### 📍 Line 301 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     299 | 
     300 | 
>>   301 |   function addProductToBundle(id) {
     302 |     const product = products.find(p => p.id === id);
     303 |     const variant = product.variants[0];
```

<a id="sections\bundle--discovery-liquid-line-119"></a>
#### 📍 Line 119 — `no-hardcoded-shopify-variant-ids` (🔴 ERROR)
> **Technical Finding:** Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id | json }}) or configured via Theme Settings to avoid multi-store desyncs.

```liquid
     117 |   const DISCOVERY_PRICE_DISPLAY = {{ region_discovery_price | json }};
     118 | 
>>   119 |   const DISCOVERY_SET_VARIANT_ID = 57083186217305; // Your single Discovery Set variant
     120 | 
     121 |   // Load all products from the 'shop' collection
```

</details>

---

### 📄 `sections\bundle--five-box.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 253](#sections\bundle--five-box-liquid-line-253) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 268](#sections\bundle--five-box-liquid-line-268) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 274](#sections\bundle--five-box-liquid-line-274) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 294](#sections\bundle--five-box-liquid-line-294) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 298](#sections\bundle--five-box-liquid-line-298) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 484](#sections\bundle--five-box-liquid-line-484) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 488](#sections\bundle--five-box-liquid-line-488) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 256](#sections\bundle--five-box-liquid-line-256) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 474](#sections\bundle--five-box-liquid-line-474) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 475](#sections\bundle--five-box-liquid-line-475) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 439](#sections\bundle--five-box-liquid-line-439) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 465](#sections\bundle--five-box-liquid-line-465) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 499](#sections\bundle--five-box-liquid-line-499) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 377](#sections\bundle--five-box-liquid-line-377) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\bundle--five-box.liquid</code> (14 items)</b></summary>

<a id="sections\bundle--five-box-liquid-line-253"></a>
#### 📍 Line 253 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     251 |  function openSelector(index) {
     252 |   currentSlot = index;
>>   253 |   document.getElementById('SelectionDrawer').classList.add('visible');
     254 | 
     255 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\bundle--five-box-liquid-line-268"></a>
#### 📍 Line 268 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     266 | 
     267 |   function closeSelector() {
>>   268 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     269 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     270 |   }
```

<a id="sections\bundle--five-box-liquid-line-274"></a>
#### 📍 Line 274 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     272 |   function showStep(id) {
     273 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   274 |   document.getElementById(id).style.display = 'block';
     275 | 
     276 |   currentStep = id;
```

<a id="sections\bundle--five-box-liquid-line-294"></a>
#### 📍 Line 294 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     292 |   // ---- HEADINGS + RENDER ----
     293 |   if (id === 'Step-Size') {
>>   294 |   document.getElementById('DrawerHeadline').innerText = 'Select Size';
     295 | }
     296 | 
```

<a id="sections\bundle--five-box-liquid-line-298"></a>
#### 📍 Line 298 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     296 | 
     297 | if (id === 'Step-Product') {
>>   298 |   document.getElementById('DrawerHeadline').innerText = 'Select Product';
     299 |   renderProducts();
     300 |   initSearchListener();
```

<a id="sections\bundle--five-box-liquid-line-484"></a>
#### 📍 Line 484 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     482 | 
     483 | const statusText = count < 5 ? `Add ${5 - count} more items to complete your Five favourites` : `Your Fifer Favourites are complete!`;
>>   484 |     document.getElementById('BundleStatusText').innerText = statusText;
     485 |     // Update progress markers
     486 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
```

<a id="sections\bundle--five-box-liquid-line-488"></a>
#### 📍 Line 488 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     486 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     487 |     for (let i = 0; i < count; i++) {
>>   488 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     489 |     }
     490 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\bundle--five-box-liquid-line-256"></a>
#### 📍 Line 256 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     254 | 
     255 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   256 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     257 | 
     258 |   if (activeSize) {
```

<a id="sections\bundle--five-box-liquid-line-474"></a>
#### 📍 Line 474 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     472 |   totalDisplay.style.visibility = 'visible';
     473 | 
>>   474 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
     475 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     476 | } else {
```

<a id="sections\bundle--five-box-liquid-line-475"></a>
#### 📍 Line 475 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     473 | 
     474 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
>>   475 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     476 | } else {
     477 |   totalDisplay.innerText = '';
```

<a id="sections\bundle--five-box-liquid-line-439"></a>
#### 📍 Line 439 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     437 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     438 |       if (item) {
>>   439 |         el.classList.remove('empty');
     440 |         el.innerHTML = `
     441 |           <div class="slot-filled-content">
```

<a id="sections\bundle--five-box-liquid-line-465"></a>
#### 📍 Line 465 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     463 | 
     464 | /* Enable button only when exactly 3 items are selected */
>>   465 | mainBtn.disabled = count !== 5;
     466 | 
     467 | /* Show price ONLY when bundle is complete */
```

<a id="sections\bundle--five-box-liquid-line-499"></a>
#### 📍 Line 499 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     497 |   async function handleCheckout() {
     498 |   const btn = document.getElementById('MainActionBtn');
>>   499 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     500 | 
     501 |   // Prevent double submission
```

<a id="sections\bundle--five-box-liquid-line-377"></a>
#### 📍 Line 377 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     375 | 
     376 | // Add product to bundle
>>   377 | function addProductToBundle(id, size) {
     378 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     379 |   if (!product) return alert('Product not found');
```

</details>

---

### 📄 `sections\bundle--trio-set.liquid` (15 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 248](#sections\bundle--trio-set-liquid-line-248) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 272](#sections\bundle--trio-set-liquid-line-272) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 283](#sections\bundle--trio-set-liquid-line-283) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 291](#sections\bundle--trio-set-liquid-line-291) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 497](#sections\bundle--trio-set-liquid-line-497) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 502](#sections\bundle--trio-set-liquid-line-502) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 251](#sections\bundle--trio-set-liquid-line-251) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 487](#sections\bundle--trio-set-liquid-line-487) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 488](#sections\bundle--trio-set-liquid-line-488) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 321](#sections\bundle--trio-set-liquid-line-321) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 320](#sections\bundle--trio-set-liquid-line-320) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 452](#sections\bundle--trio-set-liquid-line-452) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 478](#sections\bundle--trio-set-liquid-line-478) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 516](#sections\bundle--trio-set-liquid-line-516) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 396](#sections\bundle--trio-set-liquid-line-396) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\bundle--trio-set.liquid</code> (15 items)</b></summary>

<a id="sections\bundle--trio-set-liquid-line-248"></a>
#### 📍 Line 248 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     246 |   function openSelector(index) {
     247 |   currentSlot = index;
>>   248 |   document.getElementById('SelectionDrawer').classList.add('visible');
     249 | 
     250 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\bundle--trio-set-liquid-line-272"></a>
#### 📍 Line 272 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     270 | function showStep(id) {
     271 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   272 |   document.getElementById(id).style.display = 'block';
     273 | 
     274 |   currentStep = id;
```

<a id="sections\bundle--trio-set-liquid-line-283"></a>
#### 📍 Line 283 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     281 |   ============================ */
     282 |   if (id === 'Step-Size') {
>>   283 |     document.getElementById('DrawerHeadline').innerText = 'Select Size';
     284 |     backArrowBtn.style.display = 'none';
     285 |   }
```

<a id="sections\bundle--trio-set-liquid-line-291"></a>
#### 📍 Line 291 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     289 |   ============================ */
     290 |   if (id === 'Step-Product') {
>>   291 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     292 | 
     293 |     // ✅ Show back arrow ONLY before first product
```

<a id="sections\bundle--trio-set-liquid-line-497"></a>
#### 📍 Line 497 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     495 | 
     496 |     const statusText = count < 3 ? `Add ${3 - count} more items to complete your signature trio set` : `Your signature trio set is complete!`;
>>   497 |     document.getElementById('BundleStatusText').innerText = statusText;
     498 | 
     499 |     // Update progress markers
```

<a id="sections\bundle--trio-set-liquid-line-502"></a>
#### 📍 Line 502 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     500 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     501 |     for (let i = 0; i < count; i++) {
>>   502 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     503 |     }
     504 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\bundle--trio-set-liquid-line-251"></a>
#### 📍 Line 251 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     249 | 
     250 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   251 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     252 | 
     253 |   if (activeSize) {
```

<a id="sections\bundle--trio-set-liquid-line-487"></a>
#### 📍 Line 487 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     485 |   totalDisplay.style.visibility = 'visible';
     486 | 
>>   487 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
     488 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     489 | } else {
```

<a id="sections\bundle--trio-set-liquid-line-488"></a>
#### 📍 Line 488 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     486 | 
     487 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
>>   488 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     489 | } else {
     490 |   totalDisplay.innerText = '';
```

<a id="sections\bundle--trio-set-liquid-line-321"></a>
#### 📍 Line 321 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     319 |     const grid = document.getElementById('BrandGrid');
     320 |     grid.innerHTML = brands.map(b => `
>>   321 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     322 |         <span>${b.name}</span>
     323 |       </div>
```

<a id="sections\bundle--trio-set-liquid-line-320"></a>
#### 📍 Line 320 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     318 |   function renderBrands() {
     319 |     const grid = document.getElementById('BrandGrid');
>>   320 |     grid.innerHTML = brands.map(b => `
     321 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     322 |         <span>${b.name}</span>
```

<a id="sections\bundle--trio-set-liquid-line-452"></a>
#### 📍 Line 452 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     450 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     451 |       if (item) {
>>   452 |         el.classList.remove('empty');
     453 |         el.innerHTML = `
     454 |           <div class="slot-filled-content">
```

<a id="sections\bundle--trio-set-liquid-line-478"></a>
#### 📍 Line 478 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     476 | 
     477 | /* Enable button only when exactly 3 items are selected */
>>   478 | mainBtn.disabled = count !== 3;
     479 | 
     480 | /* Show price ONLY when bundle is complete */
```

<a id="sections\bundle--trio-set-liquid-line-516"></a>
#### 📍 Line 516 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     514 | async function handleCheckout() {
     515 |   const btn = document.getElementById('MainActionBtn');
>>   516 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     517 | 
     518 |   if (window.isProcessingCartAction) {
```

<a id="sections\bundle--trio-set-liquid-line-396"></a>
#### 📍 Line 396 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     394 | // Add product to bundle
     395 | // Add product to bundle
>>   396 | function addProductToBundle(id, size) {
     397 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     398 |   if (!product) return alert('Product not found');
```

</details>

---

### 📄 `sections\catalog--best-sellers.liquid` (7 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 418](#sections\catalog--best-sellers-liquid-line-418) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist |
| [Line 431](#sections\catalog--best-sellers-liquid-line-431) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist |
| [Line 432](#sections\catalog--best-sellers-liquid-line-432) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist |
| [Line 454](#sections\catalog--best-sellers-liquid-line-454) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist |
| [Line 646](#sections\catalog--best-sellers-liquid-line-646) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.variant-id-input') — will crash with "null is not an object" if element doesn't exist |
| [Line 495](#sections\catalog--best-sellers-liquid-line-495) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 680](#sections\catalog--best-sellers-liquid-line-680) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\catalog--best-sellers.liquid</code> (7 items)</b></summary>

<a id="sections\catalog--best-sellers-liquid-line-418"></a>
#### 📍 Line 418 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist

```liquid
     416 |   updatePageCalculation();
     417 |   updateProductsDisplay();
>>   418 |   document.getElementById('totalPages').textContent = totalPages;
     419 | 
     420 |   updateVariantAvailability();
```

<a id="sections\catalog--best-sellers-liquid-line-431"></a>
#### 📍 Line 431 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist

```liquid
     429 |       updatePageCalculation();
     430 |       updateProductsDisplay();
>>   431 |       document.getElementById('totalPages').textContent = totalPages;
     432 |       document.getElementById('currentPage').textContent = 1;
     433 |       updateVariantAvailability();
```

<a id="sections\catalog--best-sellers-liquid-line-432"></a>
#### 📍 Line 432 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist

```liquid
     430 |       updateProductsDisplay();
     431 |       document.getElementById('totalPages').textContent = totalPages;
>>   432 |       document.getElementById('currentPage').textContent = 1;
     433 |       updateVariantAvailability();
     434 |     }
```

<a id="sections\catalog--best-sellers-liquid-line-454"></a>
#### 📍 Line 454 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist

```liquid
     452 | 
     453 |   updateProductsDisplay();
>>   454 |   document.getElementById('currentPage').textContent =
     455 |     Math.floor(currentIndex / perPage) + 1;
     456 | }
```

<a id="sections\catalog--best-sellers-liquid-line-646"></a>
#### 📍 Line 646 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.variant-id-input') — will crash with "null is not an object" if element doesn't exist

```liquid
     644 |       btn.classList.add('active');
     645 | 
>>   646 |       card.querySelector('.variant-id-input').value = btn.dataset.variantId;
     647 |       
     648 |       const comparePrice = parseFloat(btn.dataset.variantCompareAtPrice) || 0;
```

<a id="sections\catalog--best-sellers-liquid-line-495"></a>
#### 📍 Line 495 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     493 |         
     494 |         if (availableVariants.length === 0) {
>>   495 |           cartBtn.classList.add('sold-out');
     496 |           cartBtn.innerText = 'Sold Out';
     497 |           cartBtn.disabled = true;
```

<a id="sections\catalog--best-sellers-liquid-line-680"></a>
#### 📍 Line 680 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     678 |       const variantId = form.querySelector('.variant-id-input').value;
     679 |       const submitBtn = form.querySelector('.cart-button');
>>   680 |       const originalText = submitBtn.innerText;
     681 | 
     682 |       submitBtn.disabled = true;
```

</details>

---

### 📄 `sections\catalog--product-custom.liquid` (4 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 463](#sections\catalog--product-custom-liquid-line-463) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('psModalVideo') — will crash with "null is not an object" if element doesn't exist |
| [Line 282](#sections\catalog--product-custom-liquid-line-282) | 🟡 WARN | `fetch-must-have-catch` | fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state |
| [Line 452](#sections\catalog--product-custom-liquid-line-452) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'modal' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 493](#sections\catalog--product-custom-liquid-line-493) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'dotsContainer' from DOM lookup used without null check — will crash if element doesn't exist |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\catalog--product-custom.liquid</code> (4 items)</b></summary>

<a id="sections\catalog--product-custom-liquid-line-463"></a>
#### 📍 Line 463 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('psModalVideo') — will crash with "null is not an object" if element doesn't exist

```liquid
     461 |       if (video) {
     462 |         modalImage.style.display = 'none';
>>   463 |         document.getElementById('psModalVideo').style.display = 'block';
     464 | 
     465 |         document.getElementById('psModalVideo').src = video.currentSrc || video.querySelector('source')?.src;
```

<a id="sections\catalog--product-custom-liquid-line-282"></a>
#### 📍 Line 282 — `fetch-must-have-catch` (🟡 WARN)
> **Technical Finding:** fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state

```liquid
     280 | 
     281 |   async function getCartQtyForVariant(variantId) {
>>   282 |     const res = await fetch('/cart.js');
     283 |     const cart = await res.json();
     284 |     const item = cart.items.find(i => i.variant_id == variantId);
```

<a id="sections\catalog--product-custom-liquid-line-452"></a>
#### 📍 Line 452 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'modal' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     450 |   const modal = document.getElementById('psImageModal');
     451 |   const modalImage = document.getElementById('psModalImage');
>>   452 |   const modalClose = document.querySelector('.ps-modal-close');
     453 | 
     454 |   document.querySelectorAll('.ps-gallery-item').forEach(item => {
```

<a id="sections\catalog--product-custom-liquid-line-493"></a>
#### 📍 Line 493 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'dotsContainer' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     491 |     if (window.innerWidth > 1080) return; // Only on mobile
     492 |     
>>   493 |     dotsContainer.innerHTML = '';
     494 |     const itemCount = document.querySelectorAll('.ps-gallery-item').length;
     495 |     
```

</details>

---

## 🔒 Pre-Push Automation Status
* **Git Pre-Push Hook:** Active in `.git/hooks/pre-push`
* **Shopify Theme Push Guard:** Bound to `npm run theme:push`
* **Quality Gate:** Hard-blocks any push if Errors > 0 or Flow Assertions fail.

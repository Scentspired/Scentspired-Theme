# 🛡️ Theme Guardian — Automated Quality & Detection Report

**Generated At:** `2026-09-23 20:46:54 UTC`  
**Branch:** `develop`  
**Target Codebase:** `Scentspired-UK`  

---

## 📊 Executive Summary

| Metric | Value | Status |
| :--- | :--- | :--- |
| **Files Scanned** | `245` Liquid & JS files | 🔍 Complete |
| **Total Lines Inspected** | `73,891` lines | 🔍 Complete |
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
| [Line 666](#sections\bundle--discovery-liquid-line-666) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 677](#sections\bundle--discovery-liquid-line-677) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 683](#sections\bundle--discovery-liquid-line-683) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 690](#sections\bundle--discovery-liquid-line-690) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 875](#sections\bundle--discovery-liquid-line-875) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 880](#sections\bundle--discovery-liquid-line-880) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 672](#sections\bundle--discovery-liquid-line-672) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 706](#sections\bundle--discovery-liquid-line-706) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 705](#sections\bundle--discovery-liquid-line-705) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 836](#sections\bundle--discovery-liquid-line-836) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 862](#sections\bundle--discovery-liquid-line-862) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 893](#sections\bundle--discovery-liquid-line-893) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 774](#sections\bundle--discovery-liquid-line-774) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |
| [Line 592](#sections\bundle--discovery-liquid-line-592) | 🔴 ERROR | `no-hardcoded-shopify-variant-ids` | Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id \| json }}) or configured via Theme Settings to avoid multi-store desyncs. |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\bundle--discovery.liquid</code> (14 items)</b></summary>

<a id="sections\bundle--discovery-liquid-line-666"></a>
#### 📍 Line 666 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     664 |   function openSelector(index) {
     665 |   currentSlot = index;
>>   666 |   document.getElementById('SelectionDrawer').classList.add('visible');
     667 | 
     668 |   // 🔥 Directly open product step
```

<a id="sections\bundle--discovery-liquid-line-677"></a>
#### 📍 Line 677 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     675 | 
     676 |   function closeSelector() {
>>   677 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     678 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     679 |   }
```

<a id="sections\bundle--discovery-liquid-line-683"></a>
#### 📍 Line 683 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     681 |   function showStep(id) {
     682 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   683 |   document.getElementById(id).style.display = 'block';
     684 | 
     685 |   // ❌ No back button at all
```

<a id="sections\bundle--discovery-liquid-line-690"></a>
#### 📍 Line 690 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     688 | 
     689 |   if (id === 'Step-Product') {
>>   690 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     691 |     renderProducts();
     692 |     initSearchListener();
```

<a id="sections\bundle--discovery-liquid-line-875"></a>
#### 📍 Line 875 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     873 | 
     874 |     const statusText = count < 5 ? `Add ${5 - count} more items to complete your Discovery Box` : `Your Discovery Box is complete!`;
>>   875 |     document.getElementById('BundleStatusText').innerText = statusText;
     876 | 
     877 |     // Update progress markers
```

<a id="sections\bundle--discovery-liquid-line-880"></a>
#### 📍 Line 880 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     878 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     879 |     for (let i = 0; i < count; i++) {
>>   880 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     881 |     }
     882 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\bundle--discovery-liquid-line-672"></a>
#### 📍 Line 672 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     670 | 
     671 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   672 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     673 | }
     674 | 
```

<a id="sections\bundle--discovery-liquid-line-706"></a>
#### 📍 Line 706 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     704 |     const grid = document.getElementById('BrandGrid');
     705 |     grid.innerHTML = brands.map(b => `
>>   706 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     707 |         <span>${b.name}</span>
     708 |       </div>
```

<a id="sections\bundle--discovery-liquid-line-705"></a>
#### 📍 Line 705 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     703 |   function renderBrands() {
     704 |     const grid = document.getElementById('BrandGrid');
>>   705 |     grid.innerHTML = brands.map(b => `
     706 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     707 |         <span>${b.name}</span>
```

<a id="sections\bundle--discovery-liquid-line-836"></a>
#### 📍 Line 836 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     834 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     835 |       if (item) {
>>   836 |         el.classList.remove('empty');
     837 |         el.innerHTML = `
     838 |           <div class="slot-filled-content">
```

<a id="sections\bundle--discovery-liquid-line-862"></a>
#### 📍 Line 862 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     860 | 
     861 | /* Enable button only when exactly 5 items are selected */
>>   862 | mainBtn.disabled = count !== 5;
     863 | 
     864 | /* Show price ONLY when bundle is complete */
```

<a id="sections\bundle--discovery-liquid-line-893"></a>
#### 📍 Line 893 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     891 | async function handleCheckout() {
     892 |   const btn = document.getElementById('MainActionBtn');
>>   893 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     894 | 
     895 |   // Prevent double submission
```

<a id="sections\bundle--discovery-liquid-line-774"></a>
#### 📍 Line 774 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     772 | 
     773 | 
>>   774 |   function addProductToBundle(id) {
     775 |     const product = products.find(p => p.id === id);
     776 |     const variant = product.variants[0];
```

<a id="sections\bundle--discovery-liquid-line-592"></a>
#### 📍 Line 592 — `no-hardcoded-shopify-variant-ids` (🔴 ERROR)
> **Technical Finding:** Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id | json }}) or configured via Theme Settings to avoid multi-store desyncs.

```liquid
     590 |   const DISCOVERY_PRICE_DISPLAY = {{ region_discovery_price | json }};
     591 | 
>>   592 |   const DISCOVERY_SET_VARIANT_ID = 57083186217305; // Your single Discovery Set variant
     593 | 
     594 |   // Load all products from the 'shop' collection
```

</details>

---

### 📄 `sections\bundle--five-box.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 746](#sections\bundle--five-box-liquid-line-746) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 761](#sections\bundle--five-box-liquid-line-761) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 767](#sections\bundle--five-box-liquid-line-767) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 787](#sections\bundle--five-box-liquid-line-787) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 791](#sections\bundle--five-box-liquid-line-791) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 977](#sections\bundle--five-box-liquid-line-977) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 981](#sections\bundle--five-box-liquid-line-981) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 749](#sections\bundle--five-box-liquid-line-749) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 967](#sections\bundle--five-box-liquid-line-967) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 968](#sections\bundle--five-box-liquid-line-968) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 932](#sections\bundle--five-box-liquid-line-932) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 958](#sections\bundle--five-box-liquid-line-958) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 992](#sections\bundle--five-box-liquid-line-992) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 870](#sections\bundle--five-box-liquid-line-870) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\bundle--five-box.liquid</code> (14 items)</b></summary>

<a id="sections\bundle--five-box-liquid-line-746"></a>
#### 📍 Line 746 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     744 |  function openSelector(index) {
     745 |   currentSlot = index;
>>   746 |   document.getElementById('SelectionDrawer').classList.add('visible');
     747 | 
     748 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\bundle--five-box-liquid-line-761"></a>
#### 📍 Line 761 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     759 | 
     760 |   function closeSelector() {
>>   761 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     762 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     763 |   }
```

<a id="sections\bundle--five-box-liquid-line-767"></a>
#### 📍 Line 767 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     765 |   function showStep(id) {
     766 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   767 |   document.getElementById(id).style.display = 'block';
     768 | 
     769 |   currentStep = id;
```

<a id="sections\bundle--five-box-liquid-line-787"></a>
#### 📍 Line 787 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     785 |   // ---- HEADINGS + RENDER ----
     786 |   if (id === 'Step-Size') {
>>   787 |   document.getElementById('DrawerHeadline').innerText = 'Select Size';
     788 | }
     789 | 
```

<a id="sections\bundle--five-box-liquid-line-791"></a>
#### 📍 Line 791 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     789 | 
     790 | if (id === 'Step-Product') {
>>   791 |   document.getElementById('DrawerHeadline').innerText = 'Select Product';
     792 |   renderProducts();
     793 |   initSearchListener();
```

<a id="sections\bundle--five-box-liquid-line-977"></a>
#### 📍 Line 977 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     975 | 
     976 | const statusText = count < 5 ? `Add ${5 - count} more items to complete your Five favourites` : `Your Fifer Favourites are complete!`;
>>   977 |     document.getElementById('BundleStatusText').innerText = statusText;
     978 |     // Update progress markers
     979 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
```

<a id="sections\bundle--five-box-liquid-line-981"></a>
#### 📍 Line 981 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     979 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     980 |     for (let i = 0; i < count; i++) {
>>   981 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     982 |     }
     983 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\bundle--five-box-liquid-line-749"></a>
#### 📍 Line 749 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     747 | 
     748 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   749 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     750 | 
     751 |   if (activeSize) {
```

<a id="sections\bundle--five-box-liquid-line-967"></a>
#### 📍 Line 967 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     965 |   totalDisplay.style.visibility = 'visible';
     966 | 
>>   967 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
     968 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     969 | } else {
```

<a id="sections\bundle--five-box-liquid-line-968"></a>
#### 📍 Line 968 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     966 | 
     967 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
>>   968 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     969 | } else {
     970 |   totalDisplay.innerText = '';
```

<a id="sections\bundle--five-box-liquid-line-932"></a>
#### 📍 Line 932 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     930 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     931 |       if (item) {
>>   932 |         el.classList.remove('empty');
     933 |         el.innerHTML = `
     934 |           <div class="slot-filled-content">
```

<a id="sections\bundle--five-box-liquid-line-958"></a>
#### 📍 Line 958 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     956 | 
     957 | /* Enable button only when exactly 3 items are selected */
>>   958 | mainBtn.disabled = count !== 5;
     959 | 
     960 | /* Show price ONLY when bundle is complete */
```

<a id="sections\bundle--five-box-liquid-line-992"></a>
#### 📍 Line 992 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     990 |   async function handleCheckout() {
     991 |   const btn = document.getElementById('MainActionBtn');
>>   992 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     993 | 
     994 |   // Prevent double submission
```

<a id="sections\bundle--five-box-liquid-line-870"></a>
#### 📍 Line 870 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     868 | 
     869 | // Add product to bundle
>>   870 | function addProductToBundle(id, size) {
     871 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     872 |   if (!product) return alert('Product not found');
```

</details>

---

### 📄 `sections\bundle--trio-set.liquid` (15 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 735](#sections\bundle--trio-set-liquid-line-735) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 759](#sections\bundle--trio-set-liquid-line-759) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 770](#sections\bundle--trio-set-liquid-line-770) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 778](#sections\bundle--trio-set-liquid-line-778) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 984](#sections\bundle--trio-set-liquid-line-984) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 989](#sections\bundle--trio-set-liquid-line-989) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 738](#sections\bundle--trio-set-liquid-line-738) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 974](#sections\bundle--trio-set-liquid-line-974) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 975](#sections\bundle--trio-set-liquid-line-975) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 808](#sections\bundle--trio-set-liquid-line-808) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 807](#sections\bundle--trio-set-liquid-line-807) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 939](#sections\bundle--trio-set-liquid-line-939) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 965](#sections\bundle--trio-set-liquid-line-965) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 1003](#sections\bundle--trio-set-liquid-line-1003) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 883](#sections\bundle--trio-set-liquid-line-883) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\bundle--trio-set.liquid</code> (15 items)</b></summary>

<a id="sections\bundle--trio-set-liquid-line-735"></a>
#### 📍 Line 735 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     733 |   function openSelector(index) {
     734 |   currentSlot = index;
>>   735 |   document.getElementById('SelectionDrawer').classList.add('visible');
     736 | 
     737 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\bundle--trio-set-liquid-line-759"></a>
#### 📍 Line 759 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     757 | function showStep(id) {
     758 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   759 |   document.getElementById(id).style.display = 'block';
     760 | 
     761 |   currentStep = id;
```

<a id="sections\bundle--trio-set-liquid-line-770"></a>
#### 📍 Line 770 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     768 |   ============================ */
     769 |   if (id === 'Step-Size') {
>>   770 |     document.getElementById('DrawerHeadline').innerText = 'Select Size';
     771 |     backArrowBtn.style.display = 'none';
     772 |   }
```

<a id="sections\bundle--trio-set-liquid-line-778"></a>
#### 📍 Line 778 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     776 |   ============================ */
     777 |   if (id === 'Step-Product') {
>>   778 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     779 | 
     780 |     // ✅ Show back arrow ONLY before first product
```

<a id="sections\bundle--trio-set-liquid-line-984"></a>
#### 📍 Line 984 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     982 | 
     983 |     const statusText = count < 3 ? `Add ${3 - count} more items to complete your signature trio set` : `Your signature trio set is complete!`;
>>   984 |     document.getElementById('BundleStatusText').innerText = statusText;
     985 | 
     986 |     // Update progress markers
```

<a id="sections\bundle--trio-set-liquid-line-989"></a>
#### 📍 Line 989 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     987 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     988 |     for (let i = 0; i < count; i++) {
>>   989 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     990 |     }
     991 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\bundle--trio-set-liquid-line-738"></a>
#### 📍 Line 738 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     736 | 
     737 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   738 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     739 | 
     740 |   if (activeSize) {
```

<a id="sections\bundle--trio-set-liquid-line-974"></a>
#### 📍 Line 974 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     972 |   totalDisplay.style.visibility = 'visible';
     973 | 
>>   974 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
     975 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     976 | } else {
```

<a id="sections\bundle--trio-set-liquid-line-975"></a>
#### 📍 Line 975 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     973 | 
     974 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
>>   975 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     976 | } else {
     977 |   totalDisplay.innerText = '';
```

<a id="sections\bundle--trio-set-liquid-line-808"></a>
#### 📍 Line 808 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     806 |     const grid = document.getElementById('BrandGrid');
     807 |     grid.innerHTML = brands.map(b => `
>>   808 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     809 |         <span>${b.name}</span>
     810 |       </div>
```

<a id="sections\bundle--trio-set-liquid-line-807"></a>
#### 📍 Line 807 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     805 |   function renderBrands() {
     806 |     const grid = document.getElementById('BrandGrid');
>>   807 |     grid.innerHTML = brands.map(b => `
     808 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     809 |         <span>${b.name}</span>
```

<a id="sections\bundle--trio-set-liquid-line-939"></a>
#### 📍 Line 939 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     937 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     938 |       if (item) {
>>   939 |         el.classList.remove('empty');
     940 |         el.innerHTML = `
     941 |           <div class="slot-filled-content">
```

<a id="sections\bundle--trio-set-liquid-line-965"></a>
#### 📍 Line 965 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     963 | 
     964 | /* Enable button only when exactly 3 items are selected */
>>   965 | mainBtn.disabled = count !== 3;
     966 | 
     967 | /* Show price ONLY when bundle is complete */
```

<a id="sections\bundle--trio-set-liquid-line-1003"></a>
#### 📍 Line 1003 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
    1001 | async function handleCheckout() {
    1002 |   const btn = document.getElementById('MainActionBtn');
>>  1003 |   const priceSpan = btn.querySelector('span:nth-child(2)');
    1004 | 
    1005 |   if (window.isProcessingCartAction) {
```

<a id="sections\bundle--trio-set-liquid-line-883"></a>
#### 📍 Line 883 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     881 | // Add product to bundle
     882 | // Add product to bundle
>>   883 | function addProductToBundle(id, size) {
     884 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     885 |   if (!product) return alert('Product not found');
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
| [Line 637](#sections\catalog--best-sellers-liquid-line-637) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.selected-variant-id') — will crash with "null is not an object" if element doesn't exist |
| [Line 495](#sections\catalog--best-sellers-liquid-line-495) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 663](#sections\catalog--best-sellers-liquid-line-663) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist |

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

<a id="sections\catalog--best-sellers-liquid-line-637"></a>
#### 📍 Line 637 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.selected-variant-id') — will crash with "null is not an object" if element doesn't exist

```liquid
     635 |       btn.classList.add('active');
     636 | 
>>   637 |       card.querySelector('.selected-variant-id').value = btn.dataset.variantId;
     638 |       
     639 |       const comparePrice = parseFloat(btn.dataset.comparePrice) || 0;
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

<a id="sections\catalog--best-sellers-liquid-line-663"></a>
#### 📍 Line 663 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     661 |       const variantId = form.querySelector('.selected-variant-id').value;
     662 |       const submitBtn = form.querySelector('.cart-button');
>>   663 |       const originalText = submitBtn.innerText;
     664 | 
     665 |       submitBtn.disabled = true;
```

</details>

---

### 📄 `sections\catalog--product-custom.liquid` (4 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 1058](#sections\catalog--product-custom-liquid-line-1058) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('psModalVideo') — will crash with "null is not an object" if element doesn't exist |
| [Line 877](#sections\catalog--product-custom-liquid-line-877) | 🟡 WARN | `fetch-must-have-catch` | fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state |
| [Line 1047](#sections\catalog--product-custom-liquid-line-1047) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'modal' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 1088](#sections\catalog--product-custom-liquid-line-1088) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'dotsContainer' from DOM lookup used without null check — will crash if element doesn't exist |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\catalog--product-custom.liquid</code> (4 items)</b></summary>

<a id="sections\catalog--product-custom-liquid-line-1058"></a>
#### 📍 Line 1058 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('psModalVideo') — will crash with "null is not an object" if element doesn't exist

```liquid
    1056 |       if (video) {
    1057 |         modalImage.style.display = 'none';
>>  1058 |         document.getElementById('psModalVideo').style.display = 'block';
    1059 | 
    1060 |         document.getElementById('psModalVideo').src = video.currentSrc || video.querySelector('source')?.src;
```

<a id="sections\catalog--product-custom-liquid-line-877"></a>
#### 📍 Line 877 — `fetch-must-have-catch` (🟡 WARN)
> **Technical Finding:** fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state

```liquid
     875 | 
     876 |   async function getCartQtyForVariant(variantId) {
>>   877 |     const res = await fetch('/cart.js');
     878 |     const cart = await res.json();
     879 |     const item = cart.items.find(i => i.variant_id == variantId);
```

<a id="sections\catalog--product-custom-liquid-line-1047"></a>
#### 📍 Line 1047 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'modal' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
    1045 |   const modal = document.getElementById('psImageModal');
    1046 |   const modalImage = document.getElementById('psModalImage');
>>  1047 |   const modalClose = document.querySelector('.ps-modal-close');
    1048 | 
    1049 |   document.querySelectorAll('.ps-gallery-item').forEach(item => {
```

<a id="sections\catalog--product-custom-liquid-line-1088"></a>
#### 📍 Line 1088 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'dotsContainer' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
    1086 |     if (window.innerWidth > 1080) return; // Only on mobile
    1087 |     
>>  1088 |     dotsContainer.innerHTML = '';
    1089 |     const itemCount = document.querySelectorAll('.ps-gallery-item').length;
    1090 |     
```

</details>

---

## 🔒 Pre-Push Automation Status
* **Git Pre-Push Hook:** Active in `.git/hooks/pre-push`
* **Shopify Theme Push Guard:** Bound to `npm run theme:push`
* **Quality Gate:** Hard-blocks any push if Errors > 0 or Flow Assertions fail.

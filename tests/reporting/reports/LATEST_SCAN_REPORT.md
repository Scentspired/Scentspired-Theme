# 🛡️ Theme Guardian — Automated Quality & Detection Report

**Generated At:** `2026-09-23 06:01:09 UTC`  
**Branch:** `develop`  
**Target Codebase:** `Scentspired-UK`  

---

## 📊 Executive Summary

| Metric | Value | Status |
| :--- | :--- | :--- |
| **Files Scanned** | `241` Liquid & JS files | 🔍 Complete |
| **Total Lines Inspected** | `73,870` lines | 🔍 Complete |
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

### 📄 `sections\best-sellers.liquid` (7 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 415](#sections\best-sellers-liquid-line-415) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist |
| [Line 428](#sections\best-sellers-liquid-line-428) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist |
| [Line 429](#sections\best-sellers-liquid-line-429) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist |
| [Line 451](#sections\best-sellers-liquid-line-451) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist |
| [Line 629](#sections\best-sellers-liquid-line-629) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.selected-variant-id') — will crash with "null is not an object" if element doesn't exist |
| [Line 488](#sections\best-sellers-liquid-line-488) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 655](#sections\best-sellers-liquid-line-655) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\best-sellers.liquid</code> (7 items)</b></summary>

<a id="sections\best-sellers-liquid-line-415"></a>
#### 📍 Line 415 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist

```liquid
     413 |   updatePageCalculation();
     414 |   updateProductsDisplay();
>>   415 |   document.getElementById('totalPages').textContent = totalPages;
     416 | 
     417 |   updateVariantAvailability();
```

<a id="sections\best-sellers-liquid-line-428"></a>
#### 📍 Line 428 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist

```liquid
     426 |       updatePageCalculation();
     427 |       updateProductsDisplay();
>>   428 |       document.getElementById('totalPages').textContent = totalPages;
     429 |       document.getElementById('currentPage').textContent = 1;
     430 |       updateVariantAvailability();
```

<a id="sections\best-sellers-liquid-line-429"></a>
#### 📍 Line 429 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist

```liquid
     427 |       updateProductsDisplay();
     428 |       document.getElementById('totalPages').textContent = totalPages;
>>   429 |       document.getElementById('currentPage').textContent = 1;
     430 |       updateVariantAvailability();
     431 |     }
```

<a id="sections\best-sellers-liquid-line-451"></a>
#### 📍 Line 451 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist

```liquid
     449 | 
     450 |   updateProductsDisplay();
>>   451 |   document.getElementById('currentPage').textContent =
     452 |     Math.floor(currentIndex / perPage) + 1;
     453 | }
```

<a id="sections\best-sellers-liquid-line-629"></a>
#### 📍 Line 629 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.selected-variant-id') — will crash with "null is not an object" if element doesn't exist

```liquid
     627 |       btn.classList.add('active');
     628 | 
>>   629 |       card.querySelector('.selected-variant-id').value = btn.dataset.variantId;
     630 |       
     631 |       const comparePrice = parseFloat(btn.dataset.comparePrice) || 0;
```

<a id="sections\best-sellers-liquid-line-488"></a>
#### 📍 Line 488 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     486 |         
     487 |         if (availableVariants.length === 0) {
>>   488 |           cartBtn.classList.add('sold-out');
     489 |           cartBtn.innerText = 'Sold Out';
     490 |           cartBtn.disabled = true;
```

<a id="sections\best-sellers-liquid-line-655"></a>
#### 📍 Line 655 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     653 |       const variantId = form.querySelector('.selected-variant-id').value;
     654 |       const submitBtn = form.querySelector('.cart-button');
>>   655 |       const originalText = submitBtn.innerText;
     656 | 
     657 |       submitBtn.disabled = true;
```

</details>

---

### 📄 `sections\discovery.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 648](#sections\discovery-liquid-line-648) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 659](#sections\discovery-liquid-line-659) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 665](#sections\discovery-liquid-line-665) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 672](#sections\discovery-liquid-line-672) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 857](#sections\discovery-liquid-line-857) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 862](#sections\discovery-liquid-line-862) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 654](#sections\discovery-liquid-line-654) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 688](#sections\discovery-liquid-line-688) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 687](#sections\discovery-liquid-line-687) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 818](#sections\discovery-liquid-line-818) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 844](#sections\discovery-liquid-line-844) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 875](#sections\discovery-liquid-line-875) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 756](#sections\discovery-liquid-line-756) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |
| [Line 574](#sections\discovery-liquid-line-574) | 🔴 ERROR | `no-hardcoded-shopify-variant-ids` | Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id \| json }}) or configured via Theme Settings to avoid multi-store desyncs. |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\discovery.liquid</code> (14 items)</b></summary>

<a id="sections\discovery-liquid-line-648"></a>
#### 📍 Line 648 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     646 |   function openSelector(index) {
     647 |   currentSlot = index;
>>   648 |   document.getElementById('SelectionDrawer').classList.add('visible');
     649 | 
     650 |   // 🔥 Directly open product step
```

<a id="sections\discovery-liquid-line-659"></a>
#### 📍 Line 659 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     657 | 
     658 |   function closeSelector() {
>>   659 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     660 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     661 |   }
```

<a id="sections\discovery-liquid-line-665"></a>
#### 📍 Line 665 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     663 |   function showStep(id) {
     664 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   665 |   document.getElementById(id).style.display = 'block';
     666 | 
     667 |   // ❌ No back button at all
```

<a id="sections\discovery-liquid-line-672"></a>
#### 📍 Line 672 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     670 | 
     671 |   if (id === 'Step-Product') {
>>   672 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     673 |     renderProducts();
     674 |     initSearchListener();
```

<a id="sections\discovery-liquid-line-857"></a>
#### 📍 Line 857 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     855 | 
     856 |     const statusText = count < 5 ? `Add ${5 - count} more items to complete your Discovery Box` : `Your Discovery Box is complete!`;
>>   857 |     document.getElementById('BundleStatusText').innerText = statusText;
     858 | 
     859 |     // Update progress markers
```

<a id="sections\discovery-liquid-line-862"></a>
#### 📍 Line 862 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     860 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     861 |     for (let i = 0; i < count; i++) {
>>   862 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     863 |     }
     864 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\discovery-liquid-line-654"></a>
#### 📍 Line 654 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     652 | 
     653 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   654 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     655 | }
     656 | 
```

<a id="sections\discovery-liquid-line-688"></a>
#### 📍 Line 688 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     686 |     const grid = document.getElementById('BrandGrid');
     687 |     grid.innerHTML = brands.map(b => `
>>   688 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     689 |         <span>${b.name}</span>
     690 |       </div>
```

<a id="sections\discovery-liquid-line-687"></a>
#### 📍 Line 687 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     685 |   function renderBrands() {
     686 |     const grid = document.getElementById('BrandGrid');
>>   687 |     grid.innerHTML = brands.map(b => `
     688 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     689 |         <span>${b.name}</span>
```

<a id="sections\discovery-liquid-line-818"></a>
#### 📍 Line 818 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     816 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     817 |       if (item) {
>>   818 |         el.classList.remove('empty');
     819 |         el.innerHTML = `
     820 |           <div class="slot-filled-content">
```

<a id="sections\discovery-liquid-line-844"></a>
#### 📍 Line 844 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     842 | 
     843 | /* Enable button only when exactly 5 items are selected */
>>   844 | mainBtn.disabled = count !== 5;
     845 | 
     846 | /* Show price ONLY when bundle is complete */
```

<a id="sections\discovery-liquid-line-875"></a>
#### 📍 Line 875 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     873 | async function handleCheckout() {
     874 |   const btn = document.getElementById('MainActionBtn');
>>   875 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     876 | 
     877 |   // Prevent double submission
```

<a id="sections\discovery-liquid-line-756"></a>
#### 📍 Line 756 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     754 | 
     755 | 
>>   756 |   function addProductToBundle(id) {
     757 |     const product = products.find(p => p.id === id);
     758 |     const variant = product.variants[0];
```

<a id="sections\discovery-liquid-line-574"></a>
#### 📍 Line 574 — `no-hardcoded-shopify-variant-ids` (🔴 ERROR)
> **Technical Finding:** Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id | json }}) or configured via Theme Settings to avoid multi-store desyncs.

```liquid
     572 | <script>
     573 | 
>>   574 |   const DISCOVERY_SET_VARIANT_ID = 57083186217305; // Your single Discovery Set variant
     575 | 
     576 |   // Load all products from the 'shop' collection
```

</details>

---

### 📄 `sections\five-box.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 737](#sections\five-box-liquid-line-737) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 752](#sections\five-box-liquid-line-752) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 758](#sections\five-box-liquid-line-758) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 778](#sections\five-box-liquid-line-778) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 782](#sections\five-box-liquid-line-782) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 968](#sections\five-box-liquid-line-968) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 972](#sections\five-box-liquid-line-972) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 740](#sections\five-box-liquid-line-740) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 958](#sections\five-box-liquid-line-958) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 959](#sections\five-box-liquid-line-959) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 923](#sections\five-box-liquid-line-923) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 949](#sections\five-box-liquid-line-949) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 983](#sections\five-box-liquid-line-983) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 861](#sections\five-box-liquid-line-861) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\five-box.liquid</code> (14 items)</b></summary>

<a id="sections\five-box-liquid-line-737"></a>
#### 📍 Line 737 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     735 |  function openSelector(index) {
     736 |   currentSlot = index;
>>   737 |   document.getElementById('SelectionDrawer').classList.add('visible');
     738 | 
     739 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\five-box-liquid-line-752"></a>
#### 📍 Line 752 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     750 | 
     751 |   function closeSelector() {
>>   752 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     753 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     754 |   }
```

<a id="sections\five-box-liquid-line-758"></a>
#### 📍 Line 758 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     756 |   function showStep(id) {
     757 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   758 |   document.getElementById(id).style.display = 'block';
     759 | 
     760 |   currentStep = id;
```

<a id="sections\five-box-liquid-line-778"></a>
#### 📍 Line 778 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     776 |   // ---- HEADINGS + RENDER ----
     777 |   if (id === 'Step-Size') {
>>   778 |   document.getElementById('DrawerHeadline').innerText = 'Select Size';
     779 | }
     780 | 
```

<a id="sections\five-box-liquid-line-782"></a>
#### 📍 Line 782 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     780 | 
     781 | if (id === 'Step-Product') {
>>   782 |   document.getElementById('DrawerHeadline').innerText = 'Select Product';
     783 |   renderProducts();
     784 |   initSearchListener();
```

<a id="sections\five-box-liquid-line-968"></a>
#### 📍 Line 968 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     966 | 
     967 | const statusText = count < 5 ? `Add ${5 - count} more items to complete your Five favourites` : `Your Fifer Favourites are complete!`;
>>   968 |     document.getElementById('BundleStatusText').innerText = statusText;
     969 |     // Update progress markers
     970 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
```

<a id="sections\five-box-liquid-line-972"></a>
#### 📍 Line 972 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     970 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     971 |     for (let i = 0; i < count; i++) {
>>   972 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     973 |     }
     974 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\five-box-liquid-line-740"></a>
#### 📍 Line 740 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     738 | 
     739 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   740 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     741 | 
     742 |   if (activeSize) {
```

<a id="sections\five-box-liquid-line-958"></a>
#### 📍 Line 958 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     956 |   totalDisplay.style.visibility = 'visible';
     957 | 
>>   958 |   document.querySelector('.savings-row .saving').innerText = `£ ${pricing.standard}`;
     959 |   document.querySelector('.save-row span').innerText = `£ ${pricing.saving}`;
     960 | } else {
```

<a id="sections\five-box-liquid-line-959"></a>
#### 📍 Line 959 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     957 | 
     958 |   document.querySelector('.savings-row .saving').innerText = `£ ${pricing.standard}`;
>>   959 |   document.querySelector('.save-row span').innerText = `£ ${pricing.saving}`;
     960 | } else {
     961 |   totalDisplay.innerText = '';
```

<a id="sections\five-box-liquid-line-923"></a>
#### 📍 Line 923 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     921 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     922 |       if (item) {
>>   923 |         el.classList.remove('empty');
     924 |         el.innerHTML = `
     925 |           <div class="slot-filled-content">
```

<a id="sections\five-box-liquid-line-949"></a>
#### 📍 Line 949 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     947 | 
     948 | /* Enable button only when exactly 3 items are selected */
>>   949 | mainBtn.disabled = count !== 5;
     950 | 
     951 | /* Show price ONLY when bundle is complete */
```

<a id="sections\five-box-liquid-line-983"></a>
#### 📍 Line 983 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     981 |   async function handleCheckout() {
     982 |   const btn = document.getElementById('MainActionBtn');
>>   983 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     984 | 
     985 |   // Prevent double submission
```

<a id="sections\five-box-liquid-line-861"></a>
#### 📍 Line 861 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     859 | 
     860 | // Add product to bundle
>>   861 | function addProductToBundle(id, size) {
     862 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     863 |   if (!product) return alert('Product not found');
```

</details>

---

### 📄 `sections\product-custom.liquid` (4 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 1050](#sections\product-custom-liquid-line-1050) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('psModalVideo') — will crash with "null is not an object" if element doesn't exist |
| [Line 869](#sections\product-custom-liquid-line-869) | 🟡 WARN | `fetch-must-have-catch` | fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state |
| [Line 1039](#sections\product-custom-liquid-line-1039) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'modal' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 1080](#sections\product-custom-liquid-line-1080) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'dotsContainer' from DOM lookup used without null check — will crash if element doesn't exist |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\product-custom.liquid</code> (4 items)</b></summary>

<a id="sections\product-custom-liquid-line-1050"></a>
#### 📍 Line 1050 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('psModalVideo') — will crash with "null is not an object" if element doesn't exist

```liquid
    1048 |       if (video) {
    1049 |         modalImage.style.display = 'none';
>>  1050 |         document.getElementById('psModalVideo').style.display = 'block';
    1051 | 
    1052 |         document.getElementById('psModalVideo').src = video.currentSrc || video.querySelector('source')?.src;
```

<a id="sections\product-custom-liquid-line-869"></a>
#### 📍 Line 869 — `fetch-must-have-catch` (🟡 WARN)
> **Technical Finding:** fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state

```liquid
     867 | 
     868 |   async function getCartQtyForVariant(variantId) {
>>   869 |     const res = await fetch('/cart.js');
     870 |     const cart = await res.json();
     871 |     const item = cart.items.find(i => i.variant_id == variantId);
```

<a id="sections\product-custom-liquid-line-1039"></a>
#### 📍 Line 1039 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'modal' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
    1037 |   const modal = document.getElementById('psImageModal');
    1038 |   const modalImage = document.getElementById('psModalImage');
>>  1039 |   const modalClose = document.querySelector('.ps-modal-close');
    1040 | 
    1041 |   document.querySelectorAll('.ps-gallery-item').forEach(item => {
```

<a id="sections\product-custom-liquid-line-1080"></a>
#### 📍 Line 1080 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'dotsContainer' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
    1078 |     if (window.innerWidth > 1080) return; // Only on mobile
    1079 |     
>>  1080 |     dotsContainer.innerHTML = '';
    1081 |     const itemCount = document.querySelectorAll('.ps-gallery-item').length;
    1082 |     
```

</details>

---

### 📄 `sections\trio-set.liquid` (15 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 726](#sections\trio-set-liquid-line-726) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 750](#sections\trio-set-liquid-line-750) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 761](#sections\trio-set-liquid-line-761) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 769](#sections\trio-set-liquid-line-769) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 975](#sections\trio-set-liquid-line-975) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 980](#sections\trio-set-liquid-line-980) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 729](#sections\trio-set-liquid-line-729) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 965](#sections\trio-set-liquid-line-965) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 966](#sections\trio-set-liquid-line-966) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 799](#sections\trio-set-liquid-line-799) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 798](#sections\trio-set-liquid-line-798) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 930](#sections\trio-set-liquid-line-930) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 956](#sections\trio-set-liquid-line-956) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 994](#sections\trio-set-liquid-line-994) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 874](#sections\trio-set-liquid-line-874) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\trio-set.liquid</code> (15 items)</b></summary>

<a id="sections\trio-set-liquid-line-726"></a>
#### 📍 Line 726 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     724 |   function openSelector(index) {
     725 |   currentSlot = index;
>>   726 |   document.getElementById('SelectionDrawer').classList.add('visible');
     727 | 
     728 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\trio-set-liquid-line-750"></a>
#### 📍 Line 750 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     748 | function showStep(id) {
     749 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   750 |   document.getElementById(id).style.display = 'block';
     751 | 
     752 |   currentStep = id;
```

<a id="sections\trio-set-liquid-line-761"></a>
#### 📍 Line 761 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     759 |   ============================ */
     760 |   if (id === 'Step-Size') {
>>   761 |     document.getElementById('DrawerHeadline').innerText = 'Select Size';
     762 |     backArrowBtn.style.display = 'none';
     763 |   }
```

<a id="sections\trio-set-liquid-line-769"></a>
#### 📍 Line 769 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     767 |   ============================ */
     768 |   if (id === 'Step-Product') {
>>   769 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     770 | 
     771 |     // ✅ Show back arrow ONLY before first product
```

<a id="sections\trio-set-liquid-line-975"></a>
#### 📍 Line 975 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     973 | 
     974 |     const statusText = count < 3 ? `Add ${3 - count} more items to complete your signature trio set` : `Your signature trio set is complete!`;
>>   975 |     document.getElementById('BundleStatusText').innerText = statusText;
     976 | 
     977 |     // Update progress markers
```

<a id="sections\trio-set-liquid-line-980"></a>
#### 📍 Line 980 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     978 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     979 |     for (let i = 0; i < count; i++) {
>>   980 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     981 |     }
     982 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\trio-set-liquid-line-729"></a>
#### 📍 Line 729 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     727 | 
     728 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   729 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     730 | 
     731 |   if (activeSize) {
```

<a id="sections\trio-set-liquid-line-965"></a>
#### 📍 Line 965 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     963 |   totalDisplay.style.visibility = 'visible';
     964 | 
>>   965 |   document.querySelector('.savings-row .saving').innerText = `£ ${pricing.standard}`;
     966 |   document.querySelector('.save-row span').innerText = `£ ${pricing.saving}`;
     967 | } else {
```

<a id="sections\trio-set-liquid-line-966"></a>
#### 📍 Line 966 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     964 | 
     965 |   document.querySelector('.savings-row .saving').innerText = `£ ${pricing.standard}`;
>>   966 |   document.querySelector('.save-row span').innerText = `£ ${pricing.saving}`;
     967 | } else {
     968 |   totalDisplay.innerText = '';
```

<a id="sections\trio-set-liquid-line-799"></a>
#### 📍 Line 799 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     797 |     const grid = document.getElementById('BrandGrid');
     798 |     grid.innerHTML = brands.map(b => `
>>   799 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     800 |         <span>${b.name}</span>
     801 |       </div>
```

<a id="sections\trio-set-liquid-line-798"></a>
#### 📍 Line 798 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     796 |   function renderBrands() {
     797 |     const grid = document.getElementById('BrandGrid');
>>   798 |     grid.innerHTML = brands.map(b => `
     799 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     800 |         <span>${b.name}</span>
```

<a id="sections\trio-set-liquid-line-930"></a>
#### 📍 Line 930 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     928 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     929 |       if (item) {
>>   930 |         el.classList.remove('empty');
     931 |         el.innerHTML = `
     932 |           <div class="slot-filled-content">
```

<a id="sections\trio-set-liquid-line-956"></a>
#### 📍 Line 956 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     954 | 
     955 | /* Enable button only when exactly 3 items are selected */
>>   956 | mainBtn.disabled = count !== 3;
     957 | 
     958 | /* Show price ONLY when bundle is complete */
```

<a id="sections\trio-set-liquid-line-994"></a>
#### 📍 Line 994 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     992 | async function handleCheckout() {
     993 |   const btn = document.getElementById('MainActionBtn');
>>   994 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     995 | 
     996 |   if (window.isProcessingCartAction) {
```

<a id="sections\trio-set-liquid-line-874"></a>
#### 📍 Line 874 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     872 | // Add product to bundle
     873 | // Add product to bundle
>>   874 | function addProductToBundle(id, size) {
     875 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     876 |   if (!product) return alert('Product not found');
```

</details>

---

## 🔒 Pre-Push Automation Status
* **Git Pre-Push Hook:** Active in `.git/hooks/pre-push`
* **Shopify Theme Push Guard:** Bound to `npm run theme:push`
* **Quality Gate:** Hard-blocks any push if Errors > 0 or Flow Assertions fail.

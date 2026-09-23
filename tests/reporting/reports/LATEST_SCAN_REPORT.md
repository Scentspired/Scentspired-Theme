# 🛡️ Theme Guardian — Automated Quality & Detection Report

**Generated At:** `2026-09-23 15:41:53 UTC`  
**Branch:** `develop`  
**Target Codebase:** `Scentspired-UK`  

---

## 📊 Executive Summary

| Metric | Value | Status |
| :--- | :--- | :--- |
| **Files Scanned** | `243` Liquid & JS files | 🔍 Complete |
| **Total Lines Inspected** | `73,533` lines | 🔍 Complete |
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
| [Line 418](#sections\best-sellers-liquid-line-418) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist |
| [Line 431](#sections\best-sellers-liquid-line-431) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist |
| [Line 432](#sections\best-sellers-liquid-line-432) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist |
| [Line 454](#sections\best-sellers-liquid-line-454) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist |
| [Line 632](#sections\best-sellers-liquid-line-632) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.selected-variant-id') — will crash with "null is not an object" if element doesn't exist |
| [Line 491](#sections\best-sellers-liquid-line-491) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 658](#sections\best-sellers-liquid-line-658) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\best-sellers.liquid</code> (7 items)</b></summary>

<a id="sections\best-sellers-liquid-line-418"></a>
#### 📍 Line 418 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist

```liquid
     416 |   updatePageCalculation();
     417 |   updateProductsDisplay();
>>   418 |   document.getElementById('totalPages').textContent = totalPages;
     419 | 
     420 |   updateVariantAvailability();
```

<a id="sections\best-sellers-liquid-line-431"></a>
#### 📍 Line 431 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('totalPages') — will crash with "null is not an object" if element doesn't exist

```liquid
     429 |       updatePageCalculation();
     430 |       updateProductsDisplay();
>>   431 |       document.getElementById('totalPages').textContent = totalPages;
     432 |       document.getElementById('currentPage').textContent = 1;
     433 |       updateVariantAvailability();
```

<a id="sections\best-sellers-liquid-line-432"></a>
#### 📍 Line 432 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist

```liquid
     430 |       updateProductsDisplay();
     431 |       document.getElementById('totalPages').textContent = totalPages;
>>   432 |       document.getElementById('currentPage').textContent = 1;
     433 |       updateVariantAvailability();
     434 |     }
```

<a id="sections\best-sellers-liquid-line-454"></a>
#### 📍 Line 454 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('currentPage') — will crash with "null is not an object" if element doesn't exist

```liquid
     452 | 
     453 |   updateProductsDisplay();
>>   454 |   document.getElementById('currentPage').textContent =
     455 |     Math.floor(currentIndex / perPage) + 1;
     456 | }
```

<a id="sections\best-sellers-liquid-line-632"></a>
#### 📍 Line 632 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.selected-variant-id') — will crash with "null is not an object" if element doesn't exist

```liquid
     630 |       btn.classList.add('active');
     631 | 
>>   632 |       card.querySelector('.selected-variant-id').value = btn.dataset.variantId;
     633 |       
     634 |       const comparePrice = parseFloat(btn.dataset.comparePrice) || 0;
```

<a id="sections\best-sellers-liquid-line-491"></a>
#### 📍 Line 491 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'cartBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     489 |         
     490 |         if (availableVariants.length === 0) {
>>   491 |           cartBtn.classList.add('sold-out');
     492 |           cartBtn.innerText = 'Sold Out';
     493 |           cartBtn.disabled = true;
```

<a id="sections\best-sellers-liquid-line-658"></a>
#### 📍 Line 658 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'submitBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     656 |       const variantId = form.querySelector('.selected-variant-id').value;
     657 |       const submitBtn = form.querySelector('.cart-button');
>>   658 |       const originalText = submitBtn.innerText;
     659 | 
     660 |       submitBtn.disabled = true;
```

</details>

---

### 📄 `sections\discovery.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 650](#sections\discovery-liquid-line-650) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 661](#sections\discovery-liquid-line-661) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 667](#sections\discovery-liquid-line-667) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 674](#sections\discovery-liquid-line-674) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 859](#sections\discovery-liquid-line-859) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 864](#sections\discovery-liquid-line-864) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 656](#sections\discovery-liquid-line-656) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 690](#sections\discovery-liquid-line-690) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 689](#sections\discovery-liquid-line-689) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 820](#sections\discovery-liquid-line-820) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 846](#sections\discovery-liquid-line-846) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 877](#sections\discovery-liquid-line-877) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 758](#sections\discovery-liquid-line-758) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |
| [Line 576](#sections\discovery-liquid-line-576) | 🔴 ERROR | `no-hardcoded-shopify-variant-ids` | Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id \| json }}) or configured via Theme Settings to avoid multi-store desyncs. |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\discovery.liquid</code> (14 items)</b></summary>

<a id="sections\discovery-liquid-line-650"></a>
#### 📍 Line 650 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     648 |   function openSelector(index) {
     649 |   currentSlot = index;
>>   650 |   document.getElementById('SelectionDrawer').classList.add('visible');
     651 | 
     652 |   // 🔥 Directly open product step
```

<a id="sections\discovery-liquid-line-661"></a>
#### 📍 Line 661 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     659 | 
     660 |   function closeSelector() {
>>   661 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     662 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     663 |   }
```

<a id="sections\discovery-liquid-line-667"></a>
#### 📍 Line 667 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     665 |   function showStep(id) {
     666 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   667 |   document.getElementById(id).style.display = 'block';
     668 | 
     669 |   // ❌ No back button at all
```

<a id="sections\discovery-liquid-line-674"></a>
#### 📍 Line 674 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     672 | 
     673 |   if (id === 'Step-Product') {
>>   674 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     675 |     renderProducts();
     676 |     initSearchListener();
```

<a id="sections\discovery-liquid-line-859"></a>
#### 📍 Line 859 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     857 | 
     858 |     const statusText = count < 5 ? `Add ${5 - count} more items to complete your Discovery Box` : `Your Discovery Box is complete!`;
>>   859 |     document.getElementById('BundleStatusText').innerText = statusText;
     860 | 
     861 |     // Update progress markers
```

<a id="sections\discovery-liquid-line-864"></a>
#### 📍 Line 864 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     862 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     863 |     for (let i = 0; i < count; i++) {
>>   864 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     865 |     }
     866 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\discovery-liquid-line-656"></a>
#### 📍 Line 656 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     654 | 
     655 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   656 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     657 | }
     658 | 
```

<a id="sections\discovery-liquid-line-690"></a>
#### 📍 Line 690 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     688 |     const grid = document.getElementById('BrandGrid');
     689 |     grid.innerHTML = brands.map(b => `
>>   690 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     691 |         <span>${b.name}</span>
     692 |       </div>
```

<a id="sections\discovery-liquid-line-689"></a>
#### 📍 Line 689 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     687 |   function renderBrands() {
     688 |     const grid = document.getElementById('BrandGrid');
>>   689 |     grid.innerHTML = brands.map(b => `
     690 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     691 |         <span>${b.name}</span>
```

<a id="sections\discovery-liquid-line-820"></a>
#### 📍 Line 820 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     818 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     819 |       if (item) {
>>   820 |         el.classList.remove('empty');
     821 |         el.innerHTML = `
     822 |           <div class="slot-filled-content">
```

<a id="sections\discovery-liquid-line-846"></a>
#### 📍 Line 846 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     844 | 
     845 | /* Enable button only when exactly 5 items are selected */
>>   846 | mainBtn.disabled = count !== 5;
     847 | 
     848 | /* Show price ONLY when bundle is complete */
```

<a id="sections\discovery-liquid-line-877"></a>
#### 📍 Line 877 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     875 | async function handleCheckout() {
     876 |   const btn = document.getElementById('MainActionBtn');
>>   877 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     878 | 
     879 |   // Prevent double submission
```

<a id="sections\discovery-liquid-line-758"></a>
#### 📍 Line 758 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     756 | 
     757 | 
>>   758 |   function addProductToBundle(id) {
     759 |     const product = products.find(p => p.id === id);
     760 |     const variant = product.variants[0];
```

<a id="sections\discovery-liquid-line-576"></a>
#### 📍 Line 576 — `no-hardcoded-shopify-variant-ids` (🔴 ERROR)
> **Technical Finding:** Hardcoded Shopify Variant ID (57083186217305) detected in JavaScript. All variant IDs must be dynamically queried via Liquid (e.g. {{ variant_id | json }}) or configured via Theme Settings to avoid multi-store desyncs.

```liquid
     574 | <script>
     575 | 
>>   576 |   const DISCOVERY_SET_VARIANT_ID = 57083186217305; // Your single Discovery Set variant
     577 | 
     578 |   // Load all products from the 'shop' collection
```

</details>

---

### 📄 `sections\five-box.liquid` (14 findings)

| Line | Severity | Rule | Defect Summary |
| :--- | :--- | :--- | :--- |
| [Line 738](#sections\five-box-liquid-line-738) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 753](#sections\five-box-liquid-line-753) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 759](#sections\five-box-liquid-line-759) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 779](#sections\five-box-liquid-line-779) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 783](#sections\five-box-liquid-line-783) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 969](#sections\five-box-liquid-line-969) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 973](#sections\five-box-liquid-line-973) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 741](#sections\five-box-liquid-line-741) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 959](#sections\five-box-liquid-line-959) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 960](#sections\five-box-liquid-line-960) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 924](#sections\five-box-liquid-line-924) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 950](#sections\five-box-liquid-line-950) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 984](#sections\five-box-liquid-line-984) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 862](#sections\five-box-liquid-line-862) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\five-box.liquid</code> (14 items)</b></summary>

<a id="sections\five-box-liquid-line-738"></a>
#### 📍 Line 738 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     736 |  function openSelector(index) {
     737 |   currentSlot = index;
>>   738 |   document.getElementById('SelectionDrawer').classList.add('visible');
     739 | 
     740 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\five-box-liquid-line-753"></a>
#### 📍 Line 753 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     751 | 
     752 |   function closeSelector() {
>>   753 |     document.getElementById('SelectionDrawer').classList.remove('visible');
     754 |     document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
     755 |   }
```

<a id="sections\five-box-liquid-line-759"></a>
#### 📍 Line 759 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     757 |   function showStep(id) {
     758 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   759 |   document.getElementById(id).style.display = 'block';
     760 | 
     761 |   currentStep = id;
```

<a id="sections\five-box-liquid-line-779"></a>
#### 📍 Line 779 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     777 |   // ---- HEADINGS + RENDER ----
     778 |   if (id === 'Step-Size') {
>>   779 |   document.getElementById('DrawerHeadline').innerText = 'Select Size';
     780 | }
     781 | 
```

<a id="sections\five-box-liquid-line-783"></a>
#### 📍 Line 783 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     781 | 
     782 | if (id === 'Step-Product') {
>>   783 |   document.getElementById('DrawerHeadline').innerText = 'Select Product';
     784 |   renderProducts();
     785 |   initSearchListener();
```

<a id="sections\five-box-liquid-line-969"></a>
#### 📍 Line 969 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     967 | 
     968 | const statusText = count < 5 ? `Add ${5 - count} more items to complete your Five favourites` : `Your Fifer Favourites are complete!`;
>>   969 |     document.getElementById('BundleStatusText').innerText = statusText;
     970 |     // Update progress markers
     971 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
```

<a id="sections\five-box-liquid-line-973"></a>
#### 📍 Line 973 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     971 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     972 |     for (let i = 0; i < count; i++) {
>>   973 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     974 |     }
     975 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\five-box-liquid-line-741"></a>
#### 📍 Line 741 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     739 | 
     740 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   741 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     742 | 
     743 |   if (activeSize) {
```

<a id="sections\five-box-liquid-line-959"></a>
#### 📍 Line 959 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     957 |   totalDisplay.style.visibility = 'visible';
     958 | 
>>   959 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
     960 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     961 | } else {
```

<a id="sections\five-box-liquid-line-960"></a>
#### 📍 Line 960 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     958 | 
     959 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
>>   960 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     961 | } else {
     962 |   totalDisplay.innerText = '';
```

<a id="sections\five-box-liquid-line-924"></a>
#### 📍 Line 924 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     922 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     923 |       if (item) {
>>   924 |         el.classList.remove('empty');
     925 |         el.innerHTML = `
     926 |           <div class="slot-filled-content">
```

<a id="sections\five-box-liquid-line-950"></a>
#### 📍 Line 950 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     948 | 
     949 | /* Enable button only when exactly 3 items are selected */
>>   950 | mainBtn.disabled = count !== 5;
     951 | 
     952 | /* Show price ONLY when bundle is complete */
```

<a id="sections\five-box-liquid-line-984"></a>
#### 📍 Line 984 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     982 |   async function handleCheckout() {
     983 |   const btn = document.getElementById('MainActionBtn');
>>   984 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     985 | 
     986 |   // Prevent double submission
```

<a id="sections\five-box-liquid-line-862"></a>
#### 📍 Line 862 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     860 | 
     861 | // Add product to bundle
>>   862 | function addProductToBundle(id, size) {
     863 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     864 |   if (!product) return alert('Product not found');
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
| [Line 727](#sections\trio-set-liquid-line-727) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist |
| [Line 751](#sections\trio-set-liquid-line-751) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist |
| [Line 762](#sections\trio-set-liquid-line-762) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 770](#sections\trio-set-liquid-line-770) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist |
| [Line 976](#sections\trio-set-liquid-line-976) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist |
| [Line 981](#sections\trio-set-liquid-line-981) | 🔴 ERROR | `no-unguarded-getElementById` | Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist |
| [Line 730](#sections\trio-set-liquid-line-730) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist |
| [Line 966](#sections\trio-set-liquid-line-966) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist |
| [Line 967](#sections\trio-set-liquid-line-967) | 🔴 ERROR | `no-unguarded-querySelector` | Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist |
| [Line 800](#sections\trio-set-liquid-line-800) | 🔴 ERROR | `no-unsafe-inline-onclick` | Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret") |
| [Line 799](#sections\trio-set-liquid-line-799) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 931](#sections\trio-set-liquid-line-931) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 957](#sections\trio-set-liquid-line-957) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 995](#sections\trio-set-liquid-line-995) | 🔴 ERROR | `no-unguarded-dom-variable` | Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist |
| [Line 875](#sections\trio-set-liquid-line-875) | 🔴 ERROR | `bundle-inventory-availability-guard` | addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles |

<details open>
<summary><b>🔍 View Code Snippets for <code>sections\trio-set.liquid</code> (15 items)</b></summary>

<a id="sections\trio-set-liquid-line-727"></a>
#### 📍 Line 727 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('SelectionDrawer') — will crash with "null is not an object" if element doesn't exist

```liquid
     725 |   function openSelector(index) {
     726 |   currentSlot = index;
>>   727 |   document.getElementById('SelectionDrawer').classList.add('visible');
     728 | 
     729 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
```

<a id="sections\trio-set-liquid-line-751"></a>
#### 📍 Line 751 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('id') — will crash with "null is not an object" if element doesn't exist

```liquid
     749 | function showStep(id) {
     750 |   document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
>>   751 |   document.getElementById(id).style.display = 'block';
     752 | 
     753 |   currentStep = id;
```

<a id="sections\trio-set-liquid-line-762"></a>
#### 📍 Line 762 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     760 |   ============================ */
     761 |   if (id === 'Step-Size') {
>>   762 |     document.getElementById('DrawerHeadline').innerText = 'Select Size';
     763 |     backArrowBtn.style.display = 'none';
     764 |   }
```

<a id="sections\trio-set-liquid-line-770"></a>
#### 📍 Line 770 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('DrawerHeadline') — will crash with "null is not an object" if element doesn't exist

```liquid
     768 |   ============================ */
     769 |   if (id === 'Step-Product') {
>>   770 |     document.getElementById('DrawerHeadline').innerText = 'Select Product';
     771 | 
     772 |     // ✅ Show back arrow ONLY before first product
```

<a id="sections\trio-set-liquid-line-976"></a>
#### 📍 Line 976 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('BundleStatusText') — will crash with "null is not an object" if element doesn't exist

```liquid
     974 | 
     975 |     const statusText = count < 3 ? `Add ${3 - count} more items to complete your signature trio set` : `Your signature trio set is complete!`;
>>   976 |     document.getElementById('BundleStatusText').innerText = statusText;
     977 | 
     978 |     // Update progress markers
```

<a id="sections\trio-set-liquid-line-981"></a>
#### 📍 Line 981 — `no-unguarded-getElementById` (🔴 ERROR)
> **Technical Finding:** Unguarded getElementById('Marker-${i}') — will crash with "null is not an object" if element doesn't exist

```liquid
     979 |     document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
     980 |     for (let i = 0; i < count; i++) {
>>   981 |       if (document.getElementById(`Marker-${i}`)) document.getElementById(`Marker-${i}`).classList.add('active');
     982 |     }
     983 |     if (count >= 1) document.getElementById('Label-1').classList.add('active');
```

<a id="sections\trio-set-liquid-line-730"></a>
#### 📍 Line 730 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('unknown') — will crash with "null is not an object" if element doesn't exist

```liquid
     728 | 
     729 |   document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
>>   730 |   document.querySelector(`.slot-item[data-index="${index}"]`).classList.add('active');
     731 | 
     732 |   if (activeSize) {
```

<a id="sections\trio-set-liquid-line-966"></a>
#### 📍 Line 966 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.savings-row .saving') — will crash with "null is not an object" if element doesn't exist

```liquid
     964 |   totalDisplay.style.visibility = 'visible';
     965 | 
>>   966 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
     967 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     968 | } else {
```

<a id="sections\trio-set-liquid-line-967"></a>
#### 📍 Line 967 — `no-unguarded-querySelector` (🔴 ERROR)
> **Technical Finding:** Unguarded querySelector('.save-row span') — will crash with "null is not an object" if element doesn't exist

```liquid
     965 | 
     966 |   document.querySelector('.savings-row .saving').innerText = `${currSym} ${pricing.standard}`;
>>   967 |   document.querySelector('.save-row span').innerText = `${currSym} ${pricing.saving}`;
     968 | } else {
     969 |   totalDisplay.innerText = '';
```

<a id="sections\trio-set-liquid-line-800"></a>
#### 📍 Line 800 — `no-unsafe-inline-onclick` (🔴 ERROR)
> **Technical Finding:** Unsafe inline onclick with dynamic string ${b.tag} — will crash if value contains apostrophe (e.g., "Victoria's Secret")

```liquid
     798 |     const grid = document.getElementById('BrandGrid');
     799 |     grid.innerHTML = brands.map(b => `
>>   800 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     801 |         <span>${b.name}</span>
     802 |       </div>
```

<a id="sections\trio-set-liquid-line-799"></a>
#### 📍 Line 799 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'grid' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     797 |   function renderBrands() {
     798 |     const grid = document.getElementById('BrandGrid');
>>   799 |     grid.innerHTML = brands.map(b => `
     800 |       <div class="option-item" onclick="selectBrand('${b.tag}')">
     801 |         <span>${b.name}</span>
```

<a id="sections\trio-set-liquid-line-931"></a>
#### 📍 Line 931 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'el' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     929 |       const el = document.querySelector(`.slot-item[data-index="${i}"]`);
     930 |       if (item) {
>>   931 |         el.classList.remove('empty');
     932 |         el.innerHTML = `
     933 |           <div class="slot-filled-content">
```

<a id="sections\trio-set-liquid-line-957"></a>
#### 📍 Line 957 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'mainBtn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     955 | 
     956 | /* Enable button only when exactly 3 items are selected */
>>   957 | mainBtn.disabled = count !== 3;
     958 | 
     959 | /* Show price ONLY when bundle is complete */
```

<a id="sections\trio-set-liquid-line-995"></a>
#### 📍 Line 995 — `no-unguarded-dom-variable` (🔴 ERROR)
> **Technical Finding:** Variable 'btn' from DOM lookup used without null check — will crash if element doesn't exist

```liquid
     993 | async function handleCheckout() {
     994 |   const btn = document.getElementById('MainActionBtn');
>>   995 |   const priceSpan = btn.querySelector('span:nth-child(2)');
     996 | 
     997 |   if (window.isProcessingCartAction) {
```

<a id="sections\trio-set-liquid-line-875"></a>
#### 📍 Line 875 — `bundle-inventory-availability-guard` (🔴 ERROR)
> **Technical Finding:** addProductToBundle does not verify variant availability — out-of-stock items could be selected into bundles

```liquid
     873 | // Add product to bundle
     874 | // Add product to bundle
>>   875 | function addProductToBundle(id, size) {
     876 |   const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
     877 |   if (!product) return alert('Product not found');
```

</details>

---

## 🔒 Pre-Push Automation Status
* **Git Pre-Push Hook:** Active in `.git/hooks/pre-push`
* **Shopify Theme Push Guard:** Bound to `npm run theme:push`
* **Quality Gate:** Hard-blocks any push if Errors > 0 or Flow Assertions fail.

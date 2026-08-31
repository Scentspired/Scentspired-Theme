# 🛡️ Theme Guardian — Scentspired Automated Testing & Detection Toolkit

> **Mission:** Zero errors slipped to production. Guarantee 100% purchase funnel continuity so customers can NEVER be prevented from completing an order.

---

## 🚀 Quick Start Commands

```bash
# Run Full Test Suite (Static Scanner + Flow Simulation + Clarity Verification)
npm test

# Run Individual Detection Layers
npm run test:scanner    # Layer 1: Static Code Scanner (67,000+ lines scanned in <1s)
npm run test:flows      # Layer 2: Purchase Flow & PDP/Bundle Lifecycle Simulator
npm run test:clarity    # Layer 3: Clarity Historical Bug Detection Verifier
```

---

## 🏗️ Architecture & Defense Layers

```
                               ┌─────────────────────────────┐
                               │       THEME CODEBASE        │
                               │  (Liquid, JS, Assets, CSS)  │
                               └──────────────┬──────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │         LAYER 1         │                     │         LAYER 2         │
         │   Static Code Scanner   │                     │  Purchase Flow Simulate │
         │ (AST & Pattern Analysis)│                     │ (Sandboxed DOM Lifecycle│
         └────────────┬────────────┘                     └────────────┬────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │         LAYER 3         │
                                 │ Clarity Bug Verifier    │
                                 │ (Historical Validation) │
                                 └────────────┬────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │      QUALITY GATE       │
                                 │  (PASS = Clean Deploy)  │
                                 │  (FAIL = Block Deploy)  │
                                 └─────────────────────────┘
```

---

## 🔍 Layer 1: Static Code Scanner (`tests/static-analysis.cjs`)

Scans every `.liquid` and `.js` file across `sections/`, `snippets/`, `assets/`, and `layout/`.

### Active Detection Rules:

| Rule | Description | Catches |
| :--- | :--- | :--- |
| **`no-unguarded-getElementById`** | Direct property/method access on `getElementById` without null-check | `null is not an object (evaluating 'getElementById(...).addEventListener')` |
| **`no-unguarded-querySelector`** | Direct property access on `querySelector` or `querySelectorAll` | `null is not an object (evaluating 'card.querySelector(...).value')` |
| **`no-unguarded-dom-variable`** | Local variables assigned from DOM queries used without null guards | `table.querySelectorAll` crashes |
| **`no-unsafe-inline-onclick`** | Dynamic template literals (`${...}`) in `onclick` with unescaped strings | `Uncaught SyntaxError: missing ) after argument list` (e.g. *Victoria's Secret*) |
| **`no-unguarded-closest-chain`** | Calling properties on `.closest()` results without checking if parent exists | `cannot read properties of null (reading 'querySelectorAll')` |
| **`balanced-script-tags`** | Verifies `<script>` and `</script>` tag counts match in Liquid templates | Page-breaking syntax crashes |
| **`fetch-must-have-catch`** | Enforces that all `fetch()` chains include `.catch()` or `try/catch` | Buttons permanently stuck in "Adding..." on network drop |

---

## 🧪 Layer 2: Critical Flow Simulator (`tests/critical-flow-simulator.cjs`)

Executes actual theme JavaScript logic inside a sandboxed DOM environment to simulate real shopper interactions:

* **Suite A: Product Detail Page (PDP) Add-to-Cart Lifecycle:**
  * Tests physical button disabling on click.
  * Tests multi-tap / rage-click debouncing (5 rapid clicks = 1 network request).
  * Tests Sold-out (Shopify 422) handling & persistent button disable.
  * Tests 500 error / offline network drop graceful recovery.
* **Suite B: Collection & Best-Sellers Variant Switching:**
  * Tests size swatch switching updates hidden variant ID input and price display.
  * Tests defensive execution when cards lack variant inputs (zero crash).
* **Suite C: Interactive Bundle & Box Builder:**
  * Tests brand names with apostrophes (e.g., *Victoria's Secret*, *Kilian's*) evaluate without syntax errors.
  * Tests 5-slot bundle completion and checkout button unlocking.
* **Suite D: Cart Drawer UI & Tier Synchronization:**
  * Tests `window.updateDossierCartUI` updates item count and total price.
  * Tests `window.openDossierCart` slides drawer open.
* **Suite E: Global `.item-form` Delegation:**
  * Tests add-to-cart dispatch, button loading states, and network recovery.

---

## 📈 Layer 3: Clarity Historical Detection Verifier (`tests/verify-clarity-detection.cjs`)

Continuously benchmarks the toolkit against the **543 historical error sessions** recorded in Microsoft Clarity:

* ✅ `document.getElementById('mobileCartTrigger').addEventListener` (83 sessions) $\rightarrow$ **CAUGHT**
* ✅ `table.querySelectorAll('tbody tr')` (40 sessions) $\rightarrow$ **CAUGHT**
* ✅ `card.querySelector('.selected-variant-id').value` (32 sessions) $\rightarrow$ **CAUGHT**
* ✅ `onclick selectBrand('${b.tag}')` apostrophe crashes (17 sessions) $\rightarrow$ **CAUGHT**
* ✅ `document.getElementById(id).style` (5 sessions) $\rightarrow$ **CAUGHT**

---

## ⚙️ How to Adapt & Maintain as the Site Evolves

1. **To add a new rule:** Add rule definition to `tests/config.json` and create the scanner function in `tests/static-analysis.cjs`.
2. **To whitelist an approved pattern:** Add the file path, rule name, and rationale to `approvedExceptions` in `tests/config.json`.
3. **To add a new customer journey test:** Add an assertion to `tests/critical-flow-simulator.cjs`.

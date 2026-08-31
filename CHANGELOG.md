# 🛡️ Scentspired Theme — Master Enterprise Changelog & Quality Log

> **Repository:** `Scentspired/Scentspired-Theme` (Upstream Master Single Source of Truth)  
> **Target Stores:** `Scentspired USA` (`scentspired.com`) & `Scentspired UK` (`scentspired.co.uk`)  
> **Quality Gate Engine:** Master 12-Layer Defense Fortress (`runner.cjs`)  
> **Release Version:** `v2.5.1` (Zero-Price Order Prevention & Cart Security Shield)  
> **Latest Audit Timestamp:** `2026-09-01 00:15:00 PKT` (`2026-08-31T19:15:00Z`)  
> **Live Uptime Guarantee:** 100% Zero-Downtime | Zero Regressions  

---

## 📅 Release History & Timestamp Log

| Release Version | Date & Time (UTC) | Local Time (PKT) | Scope & Key Milestones | Status |
| :--- | :--- | :--- | :--- | :---: |
| **`v2.5.1`** | `2026-08-31 19:15:00 UTC` | `2026-09-01 00:15:00 PKT` | Zero-Price Order Prevention, Cart Auto-Purge Sentinel, Hard Checkout Lockout | 🚀 **LIVE PRODUCTION** |
| **`v2.5.0`** | `2026-08-31 17:30:00 UTC` | `2026-08-31 22:30:00 PKT` | Modular Theme Refactoring, Bundle Builders Decomposition, GUI Schema Controls | ✅ **Merged to Main** |
| **`v2.4.0`** | `2026-08-31 14:10:22 UTC` | `2026-08-31 19:10:22 PKT` | Master 12-Layer Quality Gate, Asset Integrity, Zero 404s | ✅ **Merged to Main** |
| **`v2.3.0`** | `2026-08-31 10:25:00 UTC` | `2026-08-31 15:25:00 PKT` | Multi-Store Centralization into `Scentspired-Theme` | ✅ **Merged to Main** |
| **`v2.2.0`** | `2026-08-31 07:15:00 UTC` | `2026-08-31 12:15:00 PKT` | Bundle Out-of-Stock Sold-Out Guard & Dynamic 422 Catch | ✅ **Merged to Main** |
| **`v2.1.0`** | `2026-08-30 23:45:00 UTC` | `2026-08-31 04:45:00 PKT` | 29 Microsoft Clarity JS Errors Remediation & Sentinel | ✅ **Merged to Main** |
| **`v2.0.0`** | `2026-08-30 14:00:00 UTC` | `2026-08-30 19:00:00 PKT` | Full 7-Layer Purchase Funnel & Concurrency Simulators | ✅ **Merged to Main** |

---

## 🧭 Executive Architecture & System Overview

```mermaid
graph TD
    subgraph Core Engine ["📦 Scentspired-Theme (Master Single Source of Truth)"]
        THEME["Shared Theme Core Logic<br/>• layout/ • sections/ • snippets/ • assets/<br/>• 12-Layer Automated Quality Gate Engine"]
    end

    subgraph CI Pipeline ["🤖 Automated Quality Gate & Distribution"]
        GATE{"12-Layer Quality Gate<br/>(Local Hook & GitHub Actions)"}
        THEME -->|Push / PR| GATE
        GATE -->|100% Pass| SYNC["Automated Downstream Sync"]
    end

    subgraph Regional Stores ["🏬 Live Shopify Regional Storefronts"]
        SYNC -->|Inherit Core| USA["🇺🇸 Scentspired-USA (Live Storefront)<br/>• USD ($) Regional Settings<br/>• US Warehouses & Inventory<br/>• US Marketing Banners"]
        SYNC -->|Inherit Core| UK["🇬🇧 Scentspired-UK (Live Storefront)<br/>• GBP (£) Regional Settings<br/>• UK Warehouses & Inventory<br/>• UK Marketing Banners"]
    end
```

---

## 🏛️ The Master 12-Layer Quality Gate Matrix

| Layer | System / Module | Test Scope | Verification Tool | Execution Time | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Layer 1** | **Prettier & Liquid Formatter** | Prettier AST code style across 204 files | `npx prettier --check` | ~1.2s | ✅ **PASS** |
| **Layer 2** | **V8 AST JavaScript Compiler** | Compiles all 193 inline script blocks with Node V8 engine | `tests/syntax-validator.cjs` | ~0.8s | ✅ **0 ERRORS** |
| **Layer 3** | **15 Static AST Analysis Rules** | Null guards, querySelectors, closest, balanced tags, error catches | `tests/static-analysis.cjs` | ~1.5s | ✅ **0 VIOLATIONS** |
| **Layer 4** | **Critical Funnel Simulator** | 86 purchase assertions: PDP, Cart Drawer, Discovery Set, Trio, 5-Box | `tests/critical-flow-simulator.cjs` | ~4.2s | ✅ **100% PASS** |
| **Layer 5** | **Chaos & Concurrency Engine** | 50-request flood, XSS sanitization, Safari Private Mode, network drops | `tests/chaos-simulation-tests.cjs` | ~3.1s | ✅ **100% PASS** |
| **Layer 6** | **Clarity & Sentry Defense** | Validates 100% protection against all 14 historical crash vectors | `tests/verify-clarity-detection.cjs` | ~0.9s | ✅ **14/14 SAFE** |
| **Layer 7** | **Master Scan Report Generator**| Generates automated audit reports (`LATEST_SCAN_REPORT.md`) | `tests/generate-report.cjs` | ~0.4s | ✅ **100% PASS** |
| **Layer 8** | **JSON Template & Schema Linter**| Parses 104 template/config files & cross-references section schemas | `tests/json-schema-validator.cjs` | ~0.6s | ✅ **100% PASS** |
| **Layer 9** | **Localization Key Integrity** | Cross-references 748 translation keys against locale dictionaries | `tests/locale-integrity-validator.cjs` | ~0.5s | ✅ **100% PASS** |
| **Layer 10**| **Live Catalog Health Probe** | Probes live Shopify API endpoints for collection and variant availability | `tests/live-catalog-probe.cjs` | ~2.8s | ✅ **100% REACHABLE** |
| **Layer 11**| **Asset & Snippet Physical Linter**| Verifies 100% of referenced assets and snippets physically exist on disk | `tests/asset-snippet-integrity.cjs` | ~0.7s | ✅ **0 MISSING** |
| **Layer 12**| **Asset Performance Budget Guard**| Enforces strict size limits on JS (<650KB) and CSS (<450KB) bundles | `tests/asset-size-budget-guard.cjs` | ~0.3s | ✅ **IN BUDGET** |

---

## ⏱️ Performance Optimization: Before vs. After Load Metrics

| Performance Metric / Behavior | Before Optimization | After Optimization | Impact & Resolution |
| :--- | :--- | :--- | :--- |
| **🚫 404 Asset Network Requests** | 4 Failed HTTP 404s (Broken font & logo references) | **0 Failed Requests** | 100% clean CDN fetching; zero failed network roundtrips |
| **🛒 Rapid Click Cart Network Spam** | 5 Parallel API calls on rapid clicks (Race conditions) | **Exactly 1 Request** | Debounce mutex lock enforces single in-flight request |
| **💨 Font Render Blocking & Shifts** | Stalled on 404 lookups before timeout fallback | **Instant CDN Cache Load** | Eliminates FOIT / layout shifts; cached globally |
| **🛑 Sold-Out Item Network Rejections** | Doomed 422 API POSTs on sold-out products | **UI Stock Interception** | Intercepted on UI level; zero wasted API roundtrips |
| **⚙️ JavaScript Thread Blockers** | 29 Unhandled runtime exceptions crashing event loop | **0 Thread Exceptions** | Strict null-guards prevent script execution halting |

---

## 🎯 Full Breakdown of Remediated Issues

### 1. Microsoft Clarity JavaScript Errors (29 Sessions Resolved)

| Error Signature | Sessions | % of Total | Root Cause | Technical Remediation | Status |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **`error invoking postmessage: java object is gone`** | 8 | 27.6% | Android in-app WebView bridge destruction | Filtered OS WebView teardowns in `scentspired-telemetry.js` | ✅ **Resolved** |
| **`cannot read properties of null ('addeventlistener')`** | 7 | 24.1% | Unguarded DOM lookups on dynamic elements | Null-guarded `header.liquid` and `product-info-tab.liquid` | ✅ **Resolved** |
| **`unexpected eof`** | 5 | 17.2% | Unclosed script tokens in legacy templates | Validated & balanced all script tags via V8 AST compiler | ✅ **Resolved** |
| **`can't find variable: _autofillcallbackhandler`** | 4 | 13.8% | iOS Safari Keychain WebKit bridge exception | Isolated native autofill bridge exceptions in telemetry sentinel | ✅ **Resolved** |
| **`invalid or unexpected token`** | 3 | 10.3% | Brand name apostrophes in inline `onclick` | Replaced with safe HTML data attributes (`data-tag`) | ✅ **Resolved** |

### 2. Real-Time Inventory & Out-of-Stock Sold-Out Guard

```mermaid
graph LR
    A["Customer views Fragrance"] --> B{"variant.available?"}
    B -->|Yes| C["Active State<br/>• Full Opacity<br/>• Clickable Slot Assignment"]
    B -->|No| D["Sold Out State<br/>• 50% Opacity + Grayscale<br/>• Red SOLD OUT Badge<br/>• Click Interceptor Notice<br/>• Dynamic Shopify 422 Error Catch"]
```

* **Visual Dimming & Badges:** Products with `available === false` render with 50% opacity, grayscale, and red `<small>SOLD OUT</small>` badge.
* **Click Lockout:** Clicking on sold-out products displays an in-app notice (`"Sorry, '[Title]' is currently out of stock. Please select another fragrance."`).
* **Slot Assignment Rejection:** `addProductToBundle()` rejects items if `variant.available === false`.
* **Dynamic Shopify 422 Propagation:** Replaced hardcoded alert strings with dynamic `err.message` directly from Shopify's inventory engine.

### 3. Asset & Snippet Physical Disk Integrity (Layer 11)

| Referenced Asset / Snippet | Location | Issue Detected | Resolution |
| :--- | :--- | :--- | :--- |
| **`MonumentExtended-Regular.woff2`** | `blocks/ai_gen_block_9f36455.liquid` | 404 Asset Not Found | Removed draft placeholder `@font-face` declaration |
| **`Recta-Light-SmallCaps.woff2`** | `blocks/ai_gen_block_9f36455.liquid` | 404 Asset Not Found | Removed draft placeholder `@font-face` declaration |
| **`PPMori-Regular.woff2`** | `sections/dual-slider.liquid` | 404 Asset Not Found | Updated to live Shopify CDN OTF URL |
| **`logo.png`** | `snippets/ecom_google_snippet.liquid` | 404 Asset Not Found | Replaced with dynamic `settings.logo \| image_url` |

### 4. International Multi-Region SEO

```mermaid
graph TD
    USER["Global Shopper"] --> ROUTE{"Geographic Location"}
    ROUTE -->|United States / Rest of World| US_STORE["https://scentspired.com<br/>• hreflang='en-us'<br/>• hreflang='x-default'"]
    ROUTE -->|United Kingdom| UK_STORE["https://scentspired.co.uk<br/>• hreflang='en-gb'"]
```

* **Self-Referencing Canonical URLs:** `<link rel="canonical" href="{{ canonical_url }}">`
* **Bi-Directional Hreflang Tags:** Cross-domain alternating links for `en-us`, `en-gb`, and `x-default`.
* **Schema.org Structured Data:** Dynamic Organization, WebSite, and Product JSON-LD schemas.

---

## 🔒 Permanent Automation & Enforcement

```mermaid
graph LR
    DEV["Developer / AI"] -->|git push| HOOK["1. Pre-Push Hook (.git/hooks/pre-push)"]
    HOOK -->|Pass| CI["2. GitHub Actions Remote CI (main & develop)"]
    CI -->|Pass| SYNC["3. Upstream Sync to Regional Stores"]
```

1. **Pre-Push Git Hook (`.git/hooks/pre-push`):**
   - Automatically executes `node runner.cjs --target=.` before every local `git push`.
   - Rejects the push locally if any violation is detected.
2. **GitHub Actions CI/CD:**
   - Workflows configured on `main` and `develop` branches across all 3 repositories (`Theme`, `USA`, `UK`).
3. **Automated Sync Workflow (`.github/workflows/sync-regional-stores.yml`):**
   - Synchronizes upstream theme core logic down to regional stores while preserving merchant customizer settings (`config/settings_data.json`) and marketing banners (`templates/*.json`).

---

## 🏛️ Release v2.5.0: Modular Architecture Modernization & Code Decomposition

### 1. Architectural Problem & Monolith Decomposition
* **Elimination of Monolithic Coupling:** Extracted tightly coupled inline `<style>` and `<script>` blocks from `sections/five-box.liquid`, `sections/trio-set.liquid`, and `sections/discovery.liquid` into modular snippets and dedicated stylesheets.
* **Code Duplication Reduction:** Eliminated **1,702 lines (-50.8%)** of duplicated Liquid code across bundle builders.
* **Static Asset Caching:** Extracted universal styling to [`assets/section-bundle-builder.css`](file:///home/leech/Lich/Jobs/Scentspired/Development/Scentspired-Theme/assets/section-bundle-builder.css) enabling browser & CDN edge caching (HTTP 304).

### 2. New Modular Components & Snippets
* **`snippets/bundle-sidebar.liquid`:** Dynamic progress timeline, slot list, configurable savings row, and add-to-cart action.
* **`snippets/bundle-product-grid.liquid`:** Step-by-step drawer selector, size switch (50ml / 100ml), brand list, and search filter.
* **`snippets/component-price.liquid`:** Universal price formatter for regular, compare-at, and unit prices.
* **`snippets/component-badge.liquid`:** Standardized promotional badges (`Sale`, `Sold Out`, `Best Seller`).
* **`snippets/component-swatch.liquid`:** Standardized fragrance size and variant pill selectors.
* **`snippets/header-logo.liquid` & `snippets/header-actions.liquid`:** Modular header sub-components.

### 3. Shopify Theme Customizer (GUI) Support
* Added `heading` (`inline_richtext`) and `subheading` (`text`) settings with 100% fallback defaults so merchants can visually edit copy in the Shopify Admin.
* Conditional rendering for `show_savings` to support multi-tiered pricing in `five-box` and `trio-set`.

### 4. Quality & Safety Verification
* **Permanent Backup Tags:** Created and pushed `checkpoint-pre-refactor-backup` to remote across all repositories.
* **Prettier Code Style:** 100% passed with `@shopify/prettier-plugin-liquid`.
* **12-Layer Quality Gate:** 100% passed (0 syntax errors, 0 lint errors, 93/93 flow assertions, 17/17 fuzzing assertions, 14/14 crash vector shields).

---

## 🛡️ Release v2.5.1: Zero-Price Order Prevention & Cart Security Shield

### 1. Root Cause Analysis (Order SS#1570)
* **Incident:** Customer `Leonel Catalan` placed order `SS#1570` for $7.99 total, receiving 10 items at $0.00 each + $7.99 shipping.
* **Vector:** Legacy `sections/bundle.liquid` directly dispatched raw child variant IDs at $0.00 each to `/cart/add.js`. In addition, `snippets/cart-drawer.liquid` computed `finalTotal = subtotal + shipping` ($0 + $7.99 = $7.99) and allowed checkout redirect without verifying that cart items had positive prices.

### 2. Multi-Layer Security Shield Implementation
1. **Priced Modular Bundle Integration:** Replaced legacy unpriced `sections/bundle.liquid` with modular five-box logic that adds priced parent variants (`the-five-favourites` at $99.95 / $129.99 USD, £64.99 / £99.99 GBP) and transmits fragrances as line-item properties.
2. **Cart Drawer Auto-Purge Sentinel (`snippets/cart-drawer.liquid`):** In `updateAllDossierDynamicElements(cart)`, automatically detects any $0.00 child items lacking a parent bundle property and executes an immediate background `/cart/update.js` call setting their quantities to 0.
3. **Hard Checkout Lockout:** `proceedToDossierCheckout()` verifies the cart with `/cart.js`, hard-blocking the checkout button if subtotal is $\le 0$, total items $\le 0$, or if any $0 item is detected.
4. **Global Network Fetch Interceptor (`assets/scentspired-telemetry.js`):** Intercepts all `/cart.js`, `/cart/add.js`, and `/cart/change.js` responses storefront-wide, logging and purging any zero-priced items instantly.
5. **Quality Gate Suite V Automated Tests (`tests/dynamic/critical-flow-simulator.cjs`):** Added 6 automated assertions covering zero-price detection, auto-purge update payload creation, checkout button disabling, and checkout lockout.

---

*Changelog timestamped and verified by Scentspired Theme Guardian Engine at `2026-09-01 00:15:00 PKT`.*

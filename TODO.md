# Scentspired Technical Backlog & Discussion Items (TODO)

This document tracks identified architectural mismatches, regional divergence points, and open discussion items to review and align with the team.

---

## 0. Deliberately deferred during the typography refactor

Found while tokenising fonts. Each is **live behaviour today**, so changing it
would alter the rendering — which the refactor explicitly forbids. Recorded
here rather than silently fixed. None requires shotgun surgery to resolve
later: each is now reachable from one place.

### 0.1 Shopify's font picker (`Assistant`) paints most of the page

- **Status:** DEFERRED — needs a design decision, not a refactor
- **What:** `settings.type_body_font` / `type_header_font` resolve to `Assistant`,
  which paints **223 of 430** element signatures. It is not a brand font.
- **Why deferred:** switching it to a brand PP font is a site-wide visual change.
- **Cost to fix later:** one line. It now resolves through `--font-theme-body` /
  `--font-heading-family` in `snippets/token--typography.liquid`, so changing the
  token (or the theme setting) reaches every surface. No file hunt.

### 0.2 Three font families are referenced but never loaded

- **Status:** DEFERRED — fixing changes rendering
- **What:** `PPMori SemiBold` (10 signatures), `PPEditorial New Ultrabold` (3) and
  `PPEditorialNew Ultralight` have **no `@font-face` anywhere**. They silently
  fall back today.
- **Why deferred:** adding the `@font-face` would make them suddenly render in the
  intended face — a real visual change.
- **Cost to fix later:** add the `@font-face` next to the others in
  `layout/theme.liquid`; the tokens already exist.

### 0.3 `font-family: "object-fit: contain"`

- **Status:** DEFERRED — cosmetic defect, zero visual effect
- **Where:** `assets/component-predictive-search.css:232`
- **What:** a botched edit left a layout property inside a `font-family` value. It
  is an invalid family name, so the browser ignores it and falls through.
- **Why deferred:** harmless, and removing it is unrelated to typography tokens.

### 0.4 Bare `PPMori` is not a real family

- **Status:** INTENTIONALLY NOT MIGRATED
- **Where:** `sections/discovery-set.liquid` — `font-family: 'PPMori', -apple-system, …`
- **What:** no `@font-face` declares `PPMori` (without `Regular`), so this element
  paints in the system font. It is deliberately excluded from the token map: pointing
  it at `--font-body` would start rendering PPMori Regular, a real visual change.
  The exclusion is commented in `scripts/migrate-fonts.cjs` so it cannot be
  reintroduced by accident.

### 0.5 Fonts are loaded 46 times from 19 files, in two formats

- **Status:** DEFERRED — highest-value remaining typography work
- **What:** the theme contains **46 `@font-face` blocks across 19 files**. Sections
  re-declare the fonts the layout already loads, and they point at different
  files:

  | file | `@font-face` declarations |
  | :--- | ---: |
  | `PPMori-Regular.otf` | 15 |
  | `PPEditorialNew-Italic-….otf` | 12 |
  | `PPMori-Extralight.otf` | 4 |
  | the `.woff2` equivalents in `layout/theme.liquid` | 1 each |

- **Why it matters:** the same typeface is declared from both `.otf` and `.woff2`.
  OTF is far larger than WOFF2, so the page can pull megabytes it does not need,
  and which declaration wins depends on source order.
- **Why deferred:** consolidating changes *which file* the browser loads. The
  typeface is the same, but this is a loading change and the refactor forbids
  behavioural changes without separate sign-off.
- **Cost to fix later:** delete the 45 duplicate blocks and keep the `@font-face`
  set in `layout/theme.liquid` (or move it into `snippets/token--typography.liquid`
  beside the tokens). The token layer already means no component names a file.
- **Verify with:** `npm run fonts:check -- --painted` plus a network check that
  each font file is requested once.

### 0.5b Product card — all six sections converted

- **Status:** ✅ DONE. Six sections now render from two card definitions.
- **Remaining follow-up:** merge the two families into one. `card--product` uses
  `.product-form` / `.selected-variant-id` / `.compare-price` / `.sale-badge`;
  `card--product-carousel` uses `.item-form` / `.variant-id-input` /
  `.original-price` / `.price-badge`. `.product-form` carries **43 CSS rules**
  against `.item-form`'s 2, so merging is a CSS change and needs its own visual
  verification pass — do not fold them together as part of a markup edit.
- **Also outstanding:** `bundlediscovery` was converted but could not be
  verified in a browser, because no template references that section — it only
  exists as a theme-editor preset. Worth deciding whether to keep it at all.
- **Contract note for future edits:** `data-variant-price` is the formatted
  string, `data-variant-price-raw` is cents. Four sections parsed the former as
  cents and had to be corrected during conversion; that produced a visible
  "£NaN" on the collection page until fixed.

<details><summary>Original analysis (kept for context)</summary>

- **Status:** IN PROGRESS — 2 of 6 converted
- **Converted:** `best-sellers` (→ `card--product`), `Video-banner1`
  (→ `card--product-carousel`). Both verified in the browser: cards render and
  variant switching updates price and variant id.
- **Remaining:** `featuredscent`, `main-collection-product-grid`,
  `bundlediscovery`, `mobile-video-banner`.
- **Why the remaining four are not a simple markup swap.** They are not copies
  of one card. They share CSS class names but each has its own JS contract:

  | section | form | variant input | compare / badge hooks | `data-variant-price` |
  | :--- | :--- | :--- | :--- | :--- |
  | best-sellers | `.product-form` | `.selected-variant-id` | `.compare-price` / `.sale-badge` | formatted |
  | bundlediscovery | `.product-form` | `.selected-variant-id` | none | formatted |
  | Video-banner1 | `.item-form` | `.variant-id-input` | `data-compare-at-price-display` | formatted |
  | featuredscent | `.item-form` | `.variant-id-input` | `data-compare-price` / `data-sale-badge` | **raw cents** |
  | main-collection-product-grid | `.item-form` | `.variant-id-input` | `data-compare-at-price-display` | tbc |
  | mobile-video-banner | `.item-form` | `.variant-id-input` | none | tbc |

  The shared template already carries both hook spellings, since extra
  attributes are harmless. The blocker is `data-variant-price`: Video-banner1's
  JS expects a formatted string, featuredscent's expects raw cents. Converting
  featuredscent therefore requires editing its JS, not just its markup.
- **Next step per section:** convert the markup to
  `{% render 'card--product-carousel', product: product %}`, then reconcile that
  section's variant-click handler to read `data-variant-price-raw` for cents and
  `data-variant-price` for display. Verify in the browser that the price and
  variant id still update.
- **Also worth noting:** `.product-form` carries 43 CSS rules against
  `.item-form`'s 2, so the two families cannot be merged without CSS work. That
  merge is the step after all six are converted.

</details>

### 0.6 Two footer links 404 — including Terms & Conditions

- **Status:** OPEN — content fix, not a theme change
- **What:** the footer links to `/pages/terms-and-conditions` and
  `/pages/scent-families`. Both return **404 on the live UK storefront**, from
  every page on the site.
- **Verified:** live `scentspired.co.uk` returns 404 for both, as does our build.
  Pre-existing in production; not introduced by this work. `/pages/termsncondition`
  and `/pages/terms` also 404, so no alternative handle exists.
- **Why it matters:** Terms & Conditions is a legal page linked site-wide.
- **Fix:** create the two pages in Shopify admin with handles
  `terms-and-conditions` and `scent-families`. The theme already ships
  `templates/page.termsncondition.json` and `templates/page.scent-families.json`,
  so assign those templates once the pages exist. No code change needed.
- **Checked by:** crawling all 85 internal links on the homepage — the other 83 resolve.

### 0.7 Fallback chains were consolidated

- **Status:** DONE, recorded for transparency
- **What:** the same family was declared with differing fallbacks
  (`'PPMori Regular'` alone, `…, sans-serif`, `…, Arial, sans-serif`,
  `…, -apple-system, …`). All now resolve to one canonical stack per family.
- **Effect:** none while the webfont loads. The chains differ only if a webfont
  fails, where three files no longer fall back to Arial. Approved explicitly.

### 0.8 Aroma-note imagery is hardcoded to one store's CDN

- **Status:** OPEN — accepted by the region-literal guard, count frozen at 60
- **What:** `blocks/catalog--aroma-notes.liquid` embeds 60 absolute URLs of the
  form `https://scentspired.com/cdn/shop/files/<name>.jpg?v=…`.
- **Why it is not a bug today:** an absolute CDN URL loads from any origin, so
  the UK and UAE builds render these images correctly. Nothing is broken.
- **Why it is still debt:** shared code is pinned to one store's uploads. If
  that store renames or removes a file, every region loses the image at once,
  and a new region cannot substitute its own artwork without editing code.
- **Fix:** move the imagery onto product metafields (or a block setting) so the
  block reads whatever the product carries. That is a content migration — 60
  images have to be attached to products in Shopify admin — not a refactor,
  which is why it is deferred rather than done here.
- **Held by:** `tests/static/baseline-region-literals.json` records the count.
  The guard fails if a 61st is added.

### 0.9 Currency symbols were hardcoded in twelve more places

- **Status:** DONE — recorded because the first sweep missed them
- **What:** after the first currency fix (`best-sellers`, `product-custom`,
  `featuredscent`), nine more hardcoded `£` and one hardcoded `$` remained:
  - `sections/five-box.liquid` ×3, `sections/trio-set.liquid` ×3
  - `snippets/cart-drawer.liquid` ×3 — **renders on every page of the site**
  - `assets/cart.js` ×2 — cart line totals and cart total
  - `assets/card--product.js` ×1 — a `'$'` fallback, which would have rendered
    **dollar** signs on the UK store whenever `formatMoney` was not supplied
- **How they were found:** the first sweep was done by eye and by grep, and
  missed them. `guard--region-literals` found all ten on its first run. That is
  the argument for the guard: a manual sweep of 100+ files is not repeatable.
- **Fix applied:** all now read the region's symbol — `currSym` from
  `window.__STORE_CONFIG.currencySymbol` in Liquid sections, and a
  `currencySymbol()` helper in the two plain-JS assets.
- **Verified:** UK render unchanged (`£` throughout, 0 stray `$`); `dist/usa`
  resolves `$`, `dist/uae` resolves `AED`.

### 0.10 `five-box` and `trio-set` have no page to render on

- **Status:** OPEN — content gap, not a theme change
- **What:** `templates/page.fivebox.json` and `templates/page.trio-box.json`
  exist and are wired to real sections, but `/pages/fivebox` and
  `/pages/trio-box` both return **404** on the dev store.
- **Why it matters:** these two sections cannot be regression-checked, because
  no URL renders them. Code changes to them — including the currency fix in 0.9
  — are unverifiable end to end until a page exists.
- **Fix:** create the two pages in Shopify admin and assign the templates, the
  same fix as 0.6. Then add both routes to `scripts/render-snapshot.cjs`.

### 0.11 Contact addresses disagree between the FAQ and the privacy policy

- **Status:** OPEN — needs your decision, no code change pending
- **What:** on the UK storefront the FAQ answers say `support@scentspired.com`
  while the privacy policy says `support@scentspired.co.uk`. Both render today.
- **Why it was left alone:** the brief was zero visual change, and picking
  either address changes visible text on one of the two pages. The mechanism is
  now regional either way — the FAQ reads `support_email` / `returns_email`
  from region data, and the privacy policy comes from the per-region template
  JSON, which already overlays correctly.
- **To resolve:** set `support_email` and `returns_email` in
  `regions/uk/region.json` to whichever is correct. The FAQ follows
  immediately. The privacy policy text is merchant content in
  `regions/uk/templates/page.privacy-policy.json`.
- **Same question applies to:** `templates/article.blog-7.json`, which links to
  `scentspired.com` while every sibling article links to `scentspired.co.uk`.

### 0.12 Two region defects fixed, with a deliberate behaviour change

- **Status:** DONE — flagged because rendered output changed
- **Footer home link.** `sections/footer.liquid` linked the footer background
  logo to `https://scentspired.com` — sending a **UK shopper to the USA
  storefront** from every page. Now `{{ routes.root_url }}`, which stays on the
  current storefront for this region and for every future one, and needs no
  region data at all. Appearance is identical; the destination changed.
- **`llms.txt` canonical domain.** `snippets/llms.liquid` advertised
  `https://scentspired.com` to AI crawlers on every storefront. Now resolves
  from `home_url`, so UK advertises `scentspired.co.uk` and UAE
  `scentspired.ae`. Not a rendered page; no visual change.
- **Accepted compromise:** `sections/privacy-policy.liquid` still holds
  `support@scentspired.com` inside its `{% schema %}` presets. Schema is pure
  JSON and cannot hold Liquid, so this literal is unavoidable. It is dead in
  practice — saved template data overrides presets — and the guard exempts
  schema blocks for this reason. The `[Your Company Address], USA` placeholder
  that sat beside it was removed.

---

## 1. UK Free Shipping Threshold vs Cart Drawer Tier Mismatch

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - `snippets/cart-drawer.liquid` dynamically detects storefront region via currency/domain checks:
    - **UK (`is_uk`):** Threshold is `3500` cents (£35.00), default shipping cost `395` cents (£3.95), currency symbol `'£'`.
    - **UAE (`is_uae`):** Threshold is `15000` cents (150 AED), default shipping cost `2500` cents (25 AED), currency symbol `'AED '`.
    - **USA (`is_usa`):** Threshold is `7000` cents ($70.00), default shipping cost `799` cents ($7.99), currency symbol `'$'`.
  - All static HTML tier markers (`Below {{ curr_sym }}{{ shipping_threshold_amount }}`, `{{ curr_sym }}{{ shipping_cost_amount }} Shipping`, etc.) and dynamic JavaScript calculations (`freeShippingThreshold`, `defaultShippingCost`, `currSym`) are 100% synchronized with the announcement bar.

---

## 2. Geo-Redirect Bot/Crawler Detection (SEO Preservation)

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - Bot and crawler detection regex (`/bot|googlebot|crawler|spider|crawling|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|lighthouse|chrome-lighthouse|speed|insights|headless/i.test(ua)`) as well as `navigator.webdriver` checks are standardized in `layout/theme.liquid` across the core theme engine and all regional targets.
  - Geo-redirects execute asynchronously on idle (`requestIdleCallback`) only for real users, ensuring search engine bots index regional domains accurately without disruption.

## 3. Brand Name Two-Font Typography Identity ("Scent" + "spired")

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - Researched original reference implementations across regional blocks (e.g. `blocks/blog--luxury-perfume-banner-v3.liquid`, `blocks/blog--split-editorial-text-v2.liquid`, `blocks/blog--split-editorial-text.liquid`).
  - Font pairing and typographic rules:
    - **"Scent":** `'PP Editorial New', Georgia, serif`, upright normal style (`font-style: normal; font-weight: 500` / `600`).
    - **"spired":** `'PPEditorialNew Ultralight Italic'` / `'PPEditorialNew Italic'`, italic style (`font-style: italic; font-weight: 400`).
    - Visually renders as one seamless brand name word where only "spired" is italicized.
  - Implemented design tokens in `snippets/theme-design-tokens.liquid`:
    - `--font-family-brand-scent: 'PP Editorial New', Georgia, serif;`
    - `--font-family-brand-spired: 'PPEditorialNew Ultralight Italic', 'PPEditorialNew Italic', Georgia, serif;`
    - Global utility classes `.scentspired-brand-text` and `.brand-name-two-fonts`.
  - Created reusable modular component `snippets/brand-name.liquid` with configurable tag, link, and class attributes.
  - Applied two-font brand composition to `snippets/header-logo.liquid`, `sections/header.liquid` (text logo fallbacks on desktop & mobile), and `sections/footer.liquid` (fallback brand watermark).
  - All test layers passed with 0 errors and 0 warnings. Testing remains toggled off in `tests/config/test-settings.json` (Acceleration Mode).

## 4. Regional Deployment Policy: UAE Live Auto-Update Only & Permanent UK/USA Lockdown

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - **Strict UK/USA Zero-Push Lockdown:**
    - `Scentspired-UK` and `Scentspired-USA` are permanently locked down to read-only mirrors of production.
    - Push URLs in local git remotes are permanently set to `PUSH_DISABLED_READ_ONLY_MIRROR`.
    - Local Git pre-push hooks block all pushes to `main` and `develop`.
    - `engine/sync-regions.cjs` and `engine/sync-config.json` enforce hard-coded fatal error blocks (`exit 1`) immediately halting execution if any push to UK or USA is attempted.
  - **UAE Live Auto-Update Pipeline:**
    - `Scentspired-UAE` is designated as the sole authorized live deployment target.
    - `engine/sync-config.json` sets `defaultTarget: "uae"` and marks UAE with `"autoUpdate": true, "allowPush": true`.
    - Created GitHub Actions workflow `.github/workflows/auto-update-uae-live.yml` to automatically synchronize core updates from `Scentspired-Theme` to `Scentspired-UAE:main` upon verified releases.
    - Added local NPM shortcuts: `npm run sync:uae` (local sync), `npm run sync:uae:dry` (dry-run), and `npm run sync:uae:live` / `npm run deploy:uae`.
    - Configured `Scentspired-UAE` pre-push hook to authorize official theme engine sync pushes while blocking accidental manual terminal pushes.
  - Verified with `./lockdown-status.sh` (21/21 checks passed).

---


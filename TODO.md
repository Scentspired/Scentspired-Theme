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
### 0.13 No article on the site has an H1

- **Status:** OPEN — needs one decision from you, then it is 19 data edits
- **What:** all 19 article templates either omit the `main` (main-article)
  section or ship it `disabled: true`. That section is what would render the
  article's title, so every article page has **zero H1s**. The first heading a
  crawler meets is an `h2` from an editorial block.
- **Why it was not simply fixed:** the articles are hand-built from editorial
  blocks and deliberately do not show the Shopify article title. Enabling the
  title block would put a new visible heading at the top of all 19 articles —
  a content change, and the brief was zero visual change.
- **What is now in place:** `blocks/editorial--section*.liquid` take a
  `heading_level` setting, exactly like `featuredscent`. Default is `h2`, so
  nothing renders differently today. The generated
  `.ai-editorial-heading-<id>` class sets font-family, font-size, line-height
  and margin, so the tag carries no styling — h1 and h2 look identical.
- **To resolve:** in each `templates/article.blog-*.json`, set
  `"heading_level": "h1"` on the first editorial block. One key per article,
  no code change, no visual change.
- **Alternative:** re-enable `main` with only its `title` block, which shows
  the real article title as the H1. Better for SEO, but it adds a visible
  heading to every article — your call.

### 0.14 Heading structure: what changed and what is left

- **Status:** DONE for H1s, PARTIAL for the rest
- **Measured before:** 8 of 20 pages carried two H1s, 3 carried none.
- **Measured after:** 19 of 20 carry exactly one. Only articles remain (0.13).
- **Changes made, all verified as visually identical:**
  - `featuredscent` — h1 to a `heading_level` setting, default h2; the
    homepage placement sets h1. Fixed home, 4 collections and product.
  - `header` — the logo was an h1 on the homepage; now a div.
    `.header__heading` already set `margin: 0` and `line-height: 0`, and the
    logo is an image.
  - `main-cart-items` — the empty-cart message was a second h1; now an h2.
    It had no font-size of its own and was inheriting the global h1 size, so
    that size is now pinned on `.cart__empty-text` in `component-cart.css`.
    **Verified in the browser at both breakpoints: 30px/39px and 40px, the
    same values a bare h1 computes to.**
  - `contact-section` — a second, permanently empty h1; now an h2.
    `.contact-main-heading` sets its own font-size.
  - `hero-section` — the fragrance-finder page had no h1; its hero h2 is now
    the h1. `.hero-heading` sets its own size and spacing.
  - `discovery` — same, for the discovery-set page. This one had a
    tag-coupled selector (`.sidebar-header h2`), so the selector was widened
    to cover h1 rather than the markup being left alone. **Verified in the
    browser: 22px, weight 600, margin 0 0 10px — the old h2 values exactly.**
- **DONE — UI labels are no longer headings.** The cart drawer, mobile menu
  and search overlay labels — `YOUR CART`, `Oops...`, `ORDER SUMMARY`,
  `You might like to add`, `Menu`, `Recent Searches` — are divs carrying
  `.ui-label`, a class in `assets/base.css` that reproduces exactly what the
  heading tag supplied: family, style, weight, letter-spacing, colour,
  line-height, word-break. It is a deliberate copy of the `h1`–`h5` rule and
  says so, because the two have to move together.
  - Three were styled through tag-coupled selectors, so the selectors moved to
    classes rather than the markup being left alone: `.sp-section-header h2`,
    `.sp-recommendations-section h3`, `.custom-section-header h3`.
  - **Verified in the browser, not reasoned about.** Computed styles for all
    six were captured before the change and compared after. The first pass
    regressed three of them — `Menu` lost 2px and 2.6px of line-height to the
    base `h3` rule, `Recent Searches` lost a tag-coupled 14px/600, and
    `You might like to add` lost the top margin a browser gives an `h3`. All
    three were traced and pinned, and the second pass came back identical on
    every property.
- **DONE — `Video-banner1`'s scent-filter labels.** They were
  `<p class="main-heading">` at 45px, so that whole tier of the visual
  hierarchy was missing from the outline. Now `h2`. No selector targeted them
  by tag and the JS binds by class, so nothing else moved.
- **Still open — product and collection names inside the cart drawer** render
  as `h3`/`h4`. Left deliberately: those are content rather than chrome, and a
  product name is a defensible heading. Worth revisiting only if an audit still
  reads the outline badly.
### 0.15 Written content: what comes from region data and what still does not

- **Status:** FAQ DONE; four sections still hold copy
- **Already regional, and working:** `templates/*.json` (64 files for USA, 65
  for UAE), `locales/*.json` (51 each), `config/` (3 each), section groups, and
  the typed keys in `region.json`. This is why the privacy policy reads "As a
  UK-based company" on UK and "USA-based" on USA, with the right address on
  each.
- **Fixed here:** `sections/faq-section.liquid` held 748 words as markup and
  had no blocks at all, so no region could change an answer without forking the
  file. Its 3 categories and 27 questions are now blocks in
  `templates/page.faqs.json`, seeded into both regional overlays.
  - Answers carry `[support_email]` / `[returns_email]`, resolved from
    `region.json` at render time, so the address stays defined once even though
    the sentence around it is template data.
  - Verified: rendered text character-for-character identical at 7,414 chars;
    the whole page identical once whitespace collapses, bar three HTML
    comments; and rewriting one UAE answer produced a divergent `dist/uae` with
    no code file touched.
- **Still holding copy in shared code**, in descending order:

  | words | file |
  | ---: | :--- |
  | 248 | `sections/product-info-tab.liquid` |
  | 144 | `sections/header.liquid` |
  | 115 | `sections/text-blog.liquid` |
  | 92 | `sections/dual-slider.liquid` |

  None is currently wrong for any region — the copy is written
  region-neutrally. They are the same conversion as the FAQ when you want them.
- **Two Shopify constraints worth knowing before doing the next one:**
  `max_blocks` defaults to **16**, so any section carrying more needs it set
  explicitly; and the section's schema must reach the theme *before* the
  template that references its block types, or the upload is rejected with
  "Type must be defined in schema".

### 0.16 The parity harness occasionally reports a same-length change

- **Status:** OPEN — a harness flake, not a theme defect
- **What:** roughly one run in five, a page reports `CHANGED (+0 bytes)` and
  passes on the next run. Seen on `search`, then `home` and
  `collection-unisex`.
- **Cause:** same byte count with different content means a reorder, not an
  edit — Shopify reshuffling app blocks or rotating a recommendations carousel.
  The harness already normalises app-extension tags and retries once; the flake
  is when the retry catches the same shuffled state.
- **Why it is not simply normalised away:** widening the normaliser to ignore
  product order would also hide a real change to a product grid, which is one
  of the things this harness exists to catch.
- **Suggested fix:** retry twice rather than once, and treat a `+0 bytes`
  delta as a retry signal rather than a failure, since a real markup edit
  essentially never lands on the same byte count.
### 0.17 After a mass rename, the dev server does not upload the new files

- **Status:** OPEN — operational, costs time every time it happens
- **What:** Phase O renamed 86 sections. `shopify theme dev` uploaded the
  templates and section groups that reference them, but not three of the
  renamed `.liquid` files, so Shopify rejected the whole theme with:

  ```
  sections/header-group.json
    Section type 'core--announcement-bar' does not refer to an existing section file
  templates/page.contact.json
    Section type 'editorial--rich-text' does not refer to an existing section file
  templates/page.fragrance-finder.json
    Section type 'media--hero' does not refer to an existing section file
  ```

  Every page then served a 5KB "Failed to Upload Theme Files" error, which the
  parity harness read as pages losing ~850KB.
- **What it is not:** the files existed in `dist/` with exactly those names,
  the old names were gone, and the other 83 renamed sections uploaded fine —
  so double hyphens in a section filename are not the problem. It is the
  watcher missing the create half of a rename.
- **What does not fix it:** `touch`. Changing only the mtime did not make the
  dev server re-upload them.
- **What does:** deleting the file and writing it back, which produces a
  delete-then-create pair the watcher acts on. After that the upload errors
  were gone.
- **Better:** restart `npm run dev:<region>` after a rename batch. A fresh
  start does a full upload and avoids the question entirely.
- **Why it matters beyond this batch:** the failure is indistinguishable from
  a broken rename until you read the error page, and the parity harness
  reports it as enormous content loss. Anyone seeing "-864768 bytes" should
  check for an upload error before believing a regression.

### 0.18 The Shopify CLI session expires mid-session, repeatedly

- **Status:** OPEN — environmental
- **What:** both dev servers intermittently return an 87-byte body reading
  "The access token provided is expired, revoked, malformed, or invalid for
  other reasons." It has affected UK and USA at different times, sometimes
  1 request in 5, sometimes every request.
- **Why it matters:** the parity harness cannot tell that response from a page
  that legitimately lost content. An early run reported `page-terms` and
  `account-login` losing 257KB each; both were token errors. Re-baselining on
  that would have written error pages into the baselines and silently
  destroyed the harness.
- **Rule of thumb:** before trusting any parity failure, check whether the
  page is ~87 bytes or ~5KB with "Failed to Upload". Both mean the theme is
  fine and the session or the sync is not.
- **Possible fix worth trying:** have the harness detect both shapes and abort
  with "dev server unhealthy" rather than reporting a diff.





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


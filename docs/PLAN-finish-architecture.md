# Finishing the architecture — plan (2026-09-25)

The rule we are finishing: **the theme is structure, design and behaviour; a region
is content; Shopify is prices.** Nothing is dead, every file follows `domain--component`,
every list grows with its content, and behaviour lives in assets, not inside markup.

Measured starting point (after 4053713):

| # | Gap | Size |
|---|---|---|
| 1 | Content written into theme code | 996 pieces in 72 files |
| 2 | Lists with fixed numbered slots | 4 sections (5, 6, 6+6, 6 slots) |
| 3 | Inline JavaScript / CSS in markup | 6,883 JS + 3,643 CSS lines in 69 files |
| 4 | Two product-card designs | carousel card + Dawn legacy card (search) |
| 5 | Files not named `domain--component` | 9 sections, 11 snippets (+ 5 app snippets) |
| 6 | App leftovers and unused templates | PageFly (3 snippets), EComposer (2 snippets + 1 template); `page.launching` (no store), UK's `page.waitlist` and `page.llms` (UK has no such pages) |
| — | Known bug found while scoping | the cart scripts request sections that do not exist (`cart-icon-bubble` vs `cart--icon-bubble`, …) |
| — | Checker blind spot | "reached" means *mentioned*; a file can be mentioned and never loaded |

Live-store facts behind #6 (read-only checks): scentspired.com uses `/pages/waitlist`
(the Webflow template) and `/pages/llms`; scentspired.co.uk uses none of the three
(sitemap + direct URLs). UAE's store is not public, so its copies stay (its README
calls the waitlist UAE's own page).

## How every phase is proven

- **Baseline first (phase 0):** full `dist/` trees of all three regions, and normalised
  HTML of a page matrix on the UK and USA dev stores — home, two products, two
  collections, search, cart, FAQs, contact, privacy, blog list, an article, a box page,
  `/pages/bundle-1`, about, account login.
- **After each phase:** a full-tree build comparison (every folder, every file type,
  recursive — the lesson of f2a9105) and the HTML matrix. The only differences allowed
  are the ones the phase names. Computed-style comparison (swap the stylesheet in the
  page) where CSS moves; behaviour checks on the dev store where JS moves (size
  switching, filters, sliders, add to cart, cart drawer).
- The quality gate after every phase; a commit per phase; live UK/USA repos untouched.
- **Zero visible change** everywhere except phase 4 (search results take the store's
  card) and the cart bug fix (the cart icon updates as it should).

## Phases, in order

**0. Safety net.** Baselines above. `scripts/compare-builds.cjs` (full-tree diff).
Two tools that ask a running dev store instead of reading the code, so "mentioned but
never used" is caught: `scripts/asset-usage.cjs` (every asset the pages load, SVGs
inlined, followed through CSS and JS) and `scripts/template-usage.cjs` (which template
renders each live URL). Both read pages through `scripts/dev-page.cjs`, which retries
the CLI's 401 flaps and refuses `/password` — on a store without a password Shopify
answers it from another theme and `shopify theme dev` exits (it did, 2026-09-25).

**1. Remove what nothing uses.** PageFly and EComposer (5 snippets, 3 layout calls,
`templates/index.ecomposer.liquid`, their assets and settings if any). `page.launching`
everywhere; UK's `page.waitlist` and `page.llms`. Templates no live URL renders (every
page, collection, blog and article in both live sitemaps, matched on the dev stores;
all 244 products use `product`): `page.scent-2`, `page.scent-notes` (the live
/pages/scent-notes uses `page.scent-families`) and `page.launching-soon` (identical to
`page`, which Shopify falls back to). Then what only they used. **Not** removed:
`index.context.pk` looked unused (`?country=PK` changes nothing) but a market override
applies by the market's *handle*, and the USA store's market is called "pk" — the live
scentspired.com homepage shows the section only that override switches on. The page
comparison caught it; `template-usage.cjs` now detects overrides that way. Features switched off in
the theme's own settings, whose code can never run: predictive search, reveal-on-scroll
animation, the commented-out `cart-drawer.js`. Kept, with the reason: Shopify's system
pages (password, gift card, classic customer accounts) and code that runs on a state the
crawl did not reach (a cart with items, active filters, social links set, the editor).

**2. Names + the cart bug.** *(done)* Sections: `header` → `header--main`, `footer` →
`footer--main` (beside `header--drawer`, `header--search`, …), `apps` → `core--apps`,
`main-cart-items` → `cart--items`, `main-password-header/footer` →
`core--password-header/footer` (also their keys in `settings_data.json`). Snippets:
`price` → `catalog--price`, `facets` → `catalog--facets`, `price-facet` →
`catalog--facet-price`, `swatch(-input)` → `catalog--swatch(-input)`, `pagination` →
`ui--pagination`, `quantity-input` → `ui--quantity-input`, `icon-accordion` → `ui--icon`,
`meta-tags` → `core--meta-tags`, `country-/language-localization` →
`core--localization-country/-language`. Section groups keep Shopify's names
(`header-group`, `footer-group`). `bulk-quick-order-list` is not renamed: it is reachable
only from the legacy card, and goes with it in phase 4.
Assets too (after phase 4 removed those only the legacy card used): 145 renamed, e.g.
`base.css` → `core--base.css`, `global.js` → `core--global.js`, `component-cart.css` →
`cart--layout.css`, `facets.js` → `catalog--facets.js`, the 84 `icon-*.svg` →
`ui--icon-*.svg` (the icon picker builds `ui--icon-<name>.svg`).
The cart "bug" as scoped — scripts requesting sections that do not exist — was in code
that never runs: the theme's cart type is the drawer, so `cart.js` was never loaded and
Dawn's notification never rendered. Those went (`cart.js`, `cart-notification.js`, its
stylesheet, snippet and two sections, Dawn's `cart-drawer` section, the `cart_type`
setting). The real bug was on /cart: changing a quantity left the line price, the total
and the header's cart count stale until reload (its script called a `Shopify.formatMoney`
nothing defines). It now asks Shopify for the re-rendered rows, totals, cart icon and
screen-reader summary in the same request (Section Rendering API).

**3. Lists that grow.** *(done)* Numbered settings became blocks filled from content
lists; the compiler gained a typed form, `"blocks": { "brand": "@list:…brands",
"note": "@list:…notes" }`, one list per block type. Product info tabs: `icons` (the
per-product `custom.icon_N_*` metafields still override by position; the Highlight
Notes fallback shows the first four) and `faqs` (the mixed `items` list held 8
`ingredient` entries per region whose block type nothing rendered — removed).
Scent filter banner and mobile video banner: `brands` and `notes` (plus `brands_label`
/ `notes_label` for the two numbered labels). Instagram grid: from an AI block inside
Shopify's `_blocks` section to its own section with an `images` list, same section
key, its six hand-written animation delays generated per image. HTML identical apart
from the grid's class suffix (section id instead of block id), `0.0s`/`1.0s` for
`0s`/`1s`, and a space inside tags where `block.shopify_attributes` prints nothing.

**4. One product card.** *(done)* `card--product-carousel` is the only card: search results
and an article's related products use it, and `card--product-legacy` is gone with
everything only it used (the bulk quick-order feature: section, 2 snippets, script and
styles; `catalog--price`, `ui--quantity-input`, `ui--progress-bar`, the rating and
volume-pricing stylesheets; 7 unused custom elements and 6 unused helpers in
`global.js`). One card also means one stylesheet and one behaviour: the card's rules
moved out of the featured-scent stylesheet (which, unscoped, had been styling every card
on the page) into `card--product-carousel.css`, loaded once in the page head; its
add-to-cart, size switching and sold-out live in `card--product.js`, loaded once by the
layout (the layout's inline add-to-cart handler moved there). Proven with an in-page A/B:
the same page, the phase-3 cascade rebuilt inside it, every card element's computed
style compared — identical on home, collections and product at 390 and 1440px, after
removing one collection-grid rule the moved rules had always overridden. Visible: search
results show the store's card, three per row on desktop and one on phones, like the
collection pages. Also found: five media queries in `base.css` written `1200pxpx`, dead
since they were written — removed (the one rule search needs is back under a valid query).

**5. Content out of the code (996 → 0).** Largest files first (collection grid 231,
header 156, product tabs 92, hero 69, cart drawer 55, …). Where each piece goes:
- words, images, videos, links a section shows → that section's settings, filled from
  the region's page content (`@content:`), so a look can change them (the hero video);
- site-wide copy in the layout and snippets (header, cart drawer, footer) →
  `global.json`, read with `region--content`;
- interface wording (buttons, states, errors: "Add to cart", "Sold out", "Adding…") →
  translations (`| t`), and for scripts a strings object built from them — Shopify's
  standard, one per language, overridable per region;
- fallback defaults → removed: the content file supplies the value or the build fails;
- store IDs → `region.json`.
Each file's rendered HTML must be identical before and after.

**6. Behaviour and styling out of the markup.** Scripts without Liquid move to
`assets/<component>.js` as they are; the Liquid values they need arrive as data
attributes or a JSON config block. Styles without Liquid move to
`assets/<component>.css`; styles that need a per-block value use CSS custom properties
set on the element. Stays inline, documented: the font and token setup in
`layout/theme.liquid` (Shopify font objects) and tiny per-instance style hooks.

**7. Guards, so it stays done** (each seen failing on a fixture): no regional copy in
theme code (the ratchet at zero); `domain--component` names; no numbered setting
families; no inline script or style block without Liquid; nothing unloaded (crawler).

**8. Final proof and docs.** Full-tree diff against the phase-0 baseline, the HTML
matrix, the dev-store behaviour checklist, the gate; README/ARCHITECTURE and memory.

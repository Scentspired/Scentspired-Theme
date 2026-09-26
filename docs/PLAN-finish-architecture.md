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
applies by the market's *handle*, and the USA store's market handle is "pk" (a leftover of
setting the store up while testing; nothing to do with the regions) — the live
scentspired.com homepage shows the section only that override switches on. The page
comparison caught it. *(Phase 6 then removed the override: that homepage difference is
USA's content, `home.scent_stories.shown`.)* Features switched off in
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

**5. Content out of the code (996 → 0).** *(done)* Largest files first (collection grid 231,
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

*(done: the ratchet is at 0.)* The guard counted 703 at the phase's start (996 was the
first count, before its false positives were fixed), 0 at the end, in 15 commits
(798ae62 to 6359109). Each was checked before and after on USA and UK, HTML word-diffed
and exercised in the browser. How it went:
- **Where things went.** Region content gained the header's menus and search lists,
  the fragrance finder's quiz (questions, answers and their scoring), the cart drawer's
  copy, the scent notes, the product promises, the about page's text, the copyright
  line. `region.json` gained `brand_name` and `newsletter.klaviyo_list_id` (every region
  posted to one hardcoded Klaviyo list). The locale gained every interface string, with
  scripts reading them from JSON blocks (`headerStrings`, `cardStrings`,
  `bundleStrings`, …); strings a script needs raw use `_html` keys.
- **New machinery.** `region--content` answers `<path>.__json` (a whole list, for a
  script, written only for paths the theme reads that way). Content may name a theme
  asset by an `*_asset` key; the dead-file check follows it. Three new snippets:
  `header--shop-menu-sections`, `card--strings`, `bundle--strings`.
- **What it uncovered.** A skin-care demo stood in for product copy on the 180 USA and
  182 UK size products (redirect stubs, noindexed). A sold-out alert broke on titles
  with an apostrophe. "Your Fifer Favourites" reached shoppers. The search's fallback
  showed "Brand Name" for a brand. A section called "scent carousel" rendered a carousel
  every page hid (it is `editorial--section-heading` now). Other code never showed:
  a finder nav, promo banners, a brands block, a curve image on a Vercel blob,
  `desktop_video` code that read unset settings and printed a stray "c", two
  unused Google fonts.
- **What remained visible.** Two casings of the card's button labels ("Add to Cart",
  "ADD TO CART"): made one in phase 6.
- **Dev-server lesson.** A new section setting plus its template value can reach the
  store in the wrong order. The store then drops the unknown setting, and the fix is
  a forced re-upload (in memory).

**6. Behaviour and styling out of the markup.** *(done)* Scripts without Liquid moved to
`assets/<component>.js` as they were, loaded where the inline script ran (synchronous,
so the order holds; deferred where Shopify's section bundle was deferred); the Liquid
values they need arrive as `data-` attributes or JSON blocks (`#bestSellersProducts-…`,
`#bundleBoxData`, `#telemetryConfig`, …), each data set verified identical old literal
vs new JSON on both stores. Styles without Liquid moved to `assets/<component>.css`
at the same place (best sellers' `{% stylesheet %}` where Shopify's bundle loaded it);
styles needing a per-instance value use custom properties on the element (footer,
copyright, image split, Instagram grid, the 12 article parts). Stay inline, documented:
the brand's `@font-face` and the typography tokens (fonts found without waiting for a
stylesheet), and per-instance hooks that need `section.id`.
- **Proof.** In-page A/B (old text put back where it was, every element's computed style):
  0 differences on home, collection, product, search, FAQ, about and 404 at 1440 and 390;
  cross-build captures for converted blocks: 0 differences except the renamed
  keyframes. Article parts: all 12 kinds on three USA articles, 0 differences.
- **Inconsistencies made right** (these do change what shows, on purpose):
  - one wording, one key: "Add to Cart" / "Add to cart" / "ADD TO CART" (seven keys),
    Sold Out, Adding..., Added!, and 15 more labels in two casings; buttons, headings and
    short labels Title Case, form labels sentence case, messages as sentences;
  - the product card looks the same on every page: only `card--product-carousel.css`
    styles its insides; hosts size their own cards from their own section (the price was
    17px on home and 18px elsewhere, the brand 10px in the grid, corners 12px wherever the
    mobile banner's CSS loaded, line height 1.6 in the grid and 1.8 elsewhere);
  - numbered settings became lists or role names (image banner buttons, video banner title).
- **Found and fixed on the way.** USA's 15 designed articles showed as plain articles:
  their entries named handles the store no longer has (renamed live, no redirects); they
  now name the live handles. CSS browsers ignore (Tailwind source pasted into
  `core--base.css`, a stray `}` that dropped a whole media block, unitless media widths,
  a `//` comment that killed the white-header rule) removed, after checking the CSSOM.
  The cart drawer's markup that Theme Check rejects rewritten to what browsers built.
  UAE's robots.txt pointed crawlers at the USA sitemap. `pk` (the USA store's market
  handle, nothing to do with the regions) and its market override removed: the homepage
  difference is USA's content.

**7. Guards, so it stays done** *(done)*. The gate had never run: `testing_enabled` was
false, so CI and the pre-push hook printed "BYPASS" and passed; Shopify Theme Check and
Stylelint were declared but not installed, and "skipped" as a pass. Now the gate is on,
CI builds every region and fails if testing is ever switched off, a missing checker
fails its layer, and Theme Check runs on core and each compiled region (0 errors).
Gate layers added, each with a fixture that plants the defects and the legitimate forms:
Theme Check (12, now real), Stylelint (13, real), GitHub Actions workflows (22), one
wording one key (23), the card looks the same everywhere (24), no numbered settings (25),
no inline script/style without Liquid (26), nothing unloaded (27), no unread settings
(28), `domain--component` naming (29), every region the same shape (30). The content
ratchet (21) stays at zero. The compiler refuses a region `locales/` (translations go in
`translations/`: a one-key `locales/en.default.json` made the editor report every key
missing), a region `config/`, market overrides and any region entry but the six allowed.

**8. Final proof and docs.** *(done)* Full-tree accounting of all three builds against
the phase-0 baseline (every folder and file type, recursive): every added, removed and
changed file is one a phase named. The page matrix is clean on UK and USA, and the
behaviour checklist passes on both: size switching, filters, sliders, add to cart and
the cart drawer. The gate passes with every layer real. UK's render baseline is
re-recorded (20 pages), and `parity:check` finds no page changed. USA's is not yet.
In 11 attempts the USA dev server answered 401 on 2 to 8 of the 20 pages, and the
harness refuses to write a partial baseline. So `tests/parity/baseline-usa` is still
the 2026-09-24 recording. Re-record with `npm run parity:baseline:usa` once that
server is steady.
- **The parity harness pinned two 404s.** `page-terms` asked for
  `/pages/termsncondition`, a handle neither store has, so the baseline recorded the
  404 page twice. The route is now the region's own sidebar link to its terms page.
  `account-login` renders the 404 page on UK and USA, because both use new customer
  accounts (COMPATIBILITY 9).
- **A link check that asks the store** (`npm run links:check`, `links:check:usa`).
  It opens every page linked from the home page and requests every link on those.
  A region linking another store's handle is invisible to any static check. It found:
  - UK's footer linked `/pages/terms-and-conditions`, USA's handle, which is a 404 on
    UK. UK's is `-condition`, and UK's own sidebar already used it.
  - The menu's "Notes / Seasons" linked `/pages/scent-families`, which is a 404 on UK
    and a redirect on USA. The page is `/pages/scent-notes`, which the same menus
    already linked twice. Fixed for UK, USA and UAE.
  - The 15 article links on USA's `/pages/blogs` named the pre-rename handles (404
    live too). They now name the live handles, from the 41cf620 mapping.
  - UK now passes: 113 links, all open.
- **UK's terms page had the white header** while the other info pages had the black
  one: the header's URL list lacked UK's handle. It is added. The list itself is
  COMPATIBILITY 13.
- **Docs.**
  - README, ARCHITECTURE, the naming and layering rules (CRITICAL) and
    `regions/README.md` are rewritten for the model as it now is. They had described
    the two-tier live repos, a 7- or 12-layer gate, region strategy snippets,
    `regions/<id>/locales/`, and "a region has no templates/".
  - The regional-sync workflow no longer claims UAE deploys automatically.

**9. Compatibility register.** *(done)* [docs/COMPATIBILITY.md](COMPATIBILITY.md): 24
things kept so the live stores behave as they do, each with why it stays, the risk and
the fix. Documented, not fixed; these are the long-term goals. Three need action
before anything relies on them:
- the UAE deploy engine ships unbuilt core instead of `dist/uae`;
- `sync:pull` writes files the build refuses;
- designed articles are bound by handle, so a renamed article loses its design
  silently.

**Plan status: DONE (2026-09-26).** Phases 0–9 are complete, each committed and pushed
to Theme `main`. The live UK and USA repositories are untouched. One
housekeeping item is open: re-recording the USA render baseline (phase 8).

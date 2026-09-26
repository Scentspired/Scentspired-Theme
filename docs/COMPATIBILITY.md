# Compatibility register (2026-09-26)

What the theme still carries so the live stores keep working as they do today, and
what each would take to remove. **Documented, not fixed:** these are the long-term
goals, to take one at a time. Each entry says what it is, why it stays for now, the
risk while it stays, and the fix.

Facts were checked read-only against scentspired.co.uk (UK) and scentspired.com
(USA), and against the dev stores. UAE's storefront is password-protected, so UAE
facts come from its region files only.

Entries 1–3 need action before anything depends on them. The rest are debt.

---

## A. Deployment

### 1. The UAE deploy engine ships unbuilt core — *critical*
- **What.** `engine/sync-regions.cjs` (push mode, used by `auto-update-uae-live.yml`)
  copies `assets blocks config layout locales sections snippets` from the repository
  root into `../Scentspired-UAE`, and leaves `templates/**` alone. The root is not a
  theme a store can render: its `sections/*.json` hold `"@content:…"` references,
  and `region--content`, `region--data` and the box pages exist only in `dist/<id>`.
- **Why kept.** It predates the build. The workflow runs only by hand, so nothing
  triggers it.
- **Risk.** Running it would publish unresolved references and missing snippets to
  the UAE theme.
- **Fix.** Deploy `dist/uae` (after `compile:uae` and the gate), or replace the engine
  with `shopify theme push --path dist/uae` to an unpublished theme. Until then, do
  not run the workflow.

### 2. `sync:pull:*` writes files the build refuses
- **What.** Pull mode copies a live repo's `templates/` (JSON templates) into
  `regions/<id>/templates/` and its `locales/` into `regions/<id>/translations/`,
  then prunes what matches core. The build refuses JSON templates in a region, and a
  whole pulled locale is far more than "the keys that differ".
- **Why kept.** It is the only tool that reads a live repo's templates. It was used
  once, to seed the regions.
- **Risk.** A pull leaves a region that does not build, or one whose translations
  silently override core wording.
- **Fix.** Make pull a report: diff a live template's settings against the region's
  content files and print what differs. Nothing is written into `regions/`.

### 3. A renamed article silently loses its design
- **What.** `regions/<id>/content/articles.json` binds each designed article by
  `article_handle`. Rename the article in Shopify and it falls back to a plain
  article, and no check fails. This happened on USA: all 15 articles were renamed
  live, and the old handles return 404 with no redirects (fixed in 41cf620).
- **Risk.** The same thing again on any store.
- **Fix.** Bind by `article_template` (the template assigned in Shopify, which
  survives renames), or add a store check that every `article_handle` in content
  resolves on the dev store. `links:check` is the natural home for that check.

## B. Live-store differences the theme reproduces (store-side fixes)

### 4. USA old article URLs return 404
The 15 pre-rename USA article URLs have no redirects. The theme's own links now use
the live handles (articles in 41cf620, `/pages/blogs` in phase 8), but external
links and search results still point at the old URLs. **Fix (USA admin):** 15 URL
redirects, old → new. The pairs are in the diff of 41cf620.

### 5. USA `/pages/blogs` is a different page from UK's
UK's `/pages/blogs` renders `page.blog` (image banner + zigzag blog). USA's renders
`page.blogs` (image banner + blog grid) whose banner still shows Dawn's placeholder,
"Image banner" and "Give customers details about the banner image(s)…", live today.
The theme keeps both templates and USA's content as-is. **Fix:** either assign USA's
page `page.blog` (USA admin) and remove `page.blogs`, or give USA's banner real copy
(`regions/usa/content/page-blogs.json`).

### 6. Region-only pages
- **USA and UAE** ship `robots.txt.liquid`, `llms.txt.liquid`, `page.llms.liquid`
  and `page.waitlist.liquid` (`regions/<id>/templates/`). UK serves Shopify's
  default robots.txt and its own `llms.txt` file.
- `page.llms` passes a full CDN URL through `asset_url`, which yields a broken
  address. It is the same on live USA.
- `page.waitlist` is a Webflow export with 8 synchronous third-party `<script src>`
  tags.
- **Fix:** one robots policy for all regions (`{{ robots.default_groups }}` plus
  additions); `llms` built from content; the waitlist rebuilt as theme sections, or
  kept as a documented exception.

### 7. The USA store's market handle is "pk"
A leftover from setting up the store while testing in Pakistan; it has nothing to do
with the regions. The theme no longer has market overrides (phase 6), but the live
USA theme still has `index.context.pk.json`. **Fix (USA admin, optional):** rename
the market handle to something neutral before the theme goes live there.

### 8. Theme pages for pages the stores don't have
- `page-collabs` content exists for USA and UAE, but `/pages/collabs` is a 404 on
  both live stores.
- UAE also has `page-about` beside `page-about-us`.
- **Fix:** create the pages in the stores, or remove the content and templates once
  UAE's store confirms it doesn't need them.

### 9. Customer account templates are unused on UK and USA
Both stores use Shopify's new customer accounts, so `account--*` and
`templates/customers/*` never render there. They are kept for classic accounts
(UAE, or a store that switches back). **Fix:** remove once every store is confirmed
on new accounts.

### 10. The designed-article look is UK's
`article--parts` reproduces UK's article design. USA's live articles use USA's
older design, so USA articles change look when this theme goes live there (a
decision already taken: one design). Recorded so it isn't mistaken for a
regression.

### 11. UAE content that could not be checked
UAE's store is password-protected. These UAE values are copies of USA's and are
unverified:
- the 15 old article handles in `page-blogs.json`;
- the terms page handle;
- the values its `region.json` comment lists as carried over (support and returns
  emails, logo, hero video, category labels, UK bundle numbers).

**Fix:** run `npm run links:check -- --region=uae` against the UAE dev store, and
replace the carried-over values.

## C. Code kept byte-for-byte for the live look

### 12. 33 synchronous scripts
33 `<script>` tags in 25 files load synchronously, because the inline code they
replaced ran in that order. Each is a documented Theme Check `ParserBlockingScript`
exception (`{% # theme-check-disable ParserBlockingScript %}`). **Fix:** defer each
one after proving nothing that runs earlier depends on it (behaviour check on the
dev store), then remove its exception.

### 13. Header colour chosen by a URL list
`assets/core--page-classes.js` picks the black or white header from a hard-coded list
of paths, including every handle variant (`faq`/`faqs`, `return`/`returns`, three
spellings of terms). A page renamed in Shopify changes header colour, and a region
with other handles needs code edits. UK's terms page was missing until phase 8.
**Fix:** decide by template. The layout sets the class from the page's template,
or the info-page family marks itself, and the list goes.

### 14. Per-instance style hooks
- 15 sections keep a `<style>` block keyed on `section.id` (per-instance values the
  editor sets).
- The header keeps setting-conditional inline CSS.
- These are allowed by Layer 26, because they use Liquid.
- **Fix:** move the values to custom properties on the section element
  (`style="--x: {{ … }}"`), as the footer and Instagram grid already do.

### 15. Generic class names on the product card
The card's classes predate the naming rule: `.fragrance-item`, `.fragrance-name`,
`.price-badge`, `.cart-button`, `.variant-option-btn` and others, with no domain
prefix. Any other stylesheet using the same name styles the card. Layer 24 guards
the known collisions only. **Fix:** namespace them (`card-product__…`) in one
codemod, with an in-page A/B comparison.

### 16. `core--base.css` leftovers
- **shadcn-style `:root` variables.** Variables in `oklch` (`--background`,
  `--foreground`, `--primary`, `--radius`, …) were left from a pasted design system.
  No rule in the theme reads any of them.
- **An `@layer base { … }` block** (line ~3988). It holds live FAQ rules (category
  titles, …). Being layered, they lose to every unlayered rule, so unwrapping them
  changes the cascade.
- **Fix:** delete the variables, which is safe because nothing reads them. Unwrap
  the layer only with an in-page A/B comparison of the FAQ page.

### 17. Cart and card behaviour
- The size switch on a card waits for `/cart.js` before it updates, so the first
  click has noticeable latency.
- Removing an item from the cart drawer reloads the page.
- **Fix:** read the variant data already rendered in the card; re-render the drawer
  through the Section Rendering API, as `/cart` already does.

### 18. Telemetry sends the customer's email to Sentry
`core--telemetry.liquid` renders `customer.email`, and `core--telemetry-config.js`
passes it to `Sentry.setUser`. **Fix:** send the customer ID only.

### 19. Orphan translation keys
30 non-English locale files hold 261 keys that `en.default.json` no longer has, left
over from the wording cleanup (one wording, one key). Nothing reads them. **Fix:**
prune them when those languages are translated for real.

## D. Checks relaxed or ratcheted

### 20. Theme Check warnings (0 errors)
| check | count | where |
| :--- | :--- | :--- |
| DeprecatedFilter (`img_url`) | 10 | cart drawer, bundle box, five favourites, featured collections, perfume story, image split, newsletter banner |
| HardcodedRoutes | 4 | footer, product card, product page |
| UnclosedHTMLElement | 3 | `content--faq` |
| LiquidComplexity | 1 | `catalog--facets` |

`region--content*` snippets are generated and exempt from UnclosedHTMLElement,
HardcodedRoutes and LiquidComplexity by their header. **Fix:** `image_url`,
`routes.*`, and restructure the FAQ markup; then make warnings fail.

### 21. Theme Check checks switched off (`.theme-check.yml`)
- The switched-off checks are ImgWidthAndHeight, MatchingTranslations, RemoteAsset,
  OrphanedSnippet, UndefinedObject, UnusedAssign and VariableName.
- Some of the reasons given are stale. EComposer and Ryviu are gone, and dead files
  are now caught by Layer 27.
- **Fix:** turn each back on and fix or except what it reports.

### 22. Stylelint rules switched off
- The rules are:
  - `no-descending-specificity`
  - `font-family-no-missing-generic-family-keyword`
  - `no-duplicate-selectors`
  - `declaration-block-no-duplicate-properties`
  - `declaration-property-value-no-unknown`
  - `declaration-property-value-keyword-no-deprecated`
  - `property-no-deprecated`
  - `declaration-block-no-shorthand-property-overrides`
  - `keyframe-block-no-duplicate-selectors`
  - `comment-no-empty`
- Duplicates and overrides are how the live CSS behaves today.
- **Fix:** enable one at a time, each with an in-page A/B comparison.

### 23. Ratchet baselines (can only go down)
| baseline | recorded |
| :--- | :--- |
| static analysis (Layer 3) | 22: unguarded `getElementById` 9, `querySelector` 5, DOM variable 7, bundle inventory guard 1 |
| template schema (Layer 8) | 39: negative margins 15, ghost sections 24 |
| script globals (Layer 19) | 6 accepted shared names |
| headings (Layer 17) | 1 accepted: articles render no title heading. The reason recorded predates `article--parts` and needs re-checking |
| hardcoded content (Layer 21), region literals (Layer 15) | 0 |

### 24. Formatting is reported, not enforced
Layer 1 (Prettier) is `optional`: most files were never formatted, and formatting
them would churn every line. **Fix:** format in one commit that changes nothing
else, then make Layer 1 blocking.

# Architecture

One theme, many storefronts. This document follows a region from its source files
to a rendered page, then covers the rules that keep it that way.

## 1. Three owners

| owner | holds | lives in |
| :--- | :--- | :--- |
| **theme** | structure, design, behaviour: Liquid, CSS, JavaScript, page layouts, theme settings, interface wording | the repository root |
| **region** | content and identity: every word, image, link, list, on/off switch; currency, domains, store IDs | `regions/<id>/` |
| **Shopify** | products, prices, compare-at prices (sales), pages, articles, customers | each store's admin |

A value has exactly one owner. A price never appears in the theme or a region; a
colour or a spacing never appears in a region; a word a shopper reads never appears
in theme code (gate Layer 21 counts them; the count is 0).

## 2. The build: `regions/<id>` + theme → `dist/<id>`

```
theme root ──────────────┐
  assets blocks layout   │  copied as they are
  sections snippets      │
  config locales         │
                         ▼
regions/<id>/        scripts/compile-region.cjs <id>        dist/<id>/
  region.json    ──►  snippets/region--active.liquid      (identity, one case per key)
  content/*.json ──►  templates/*.json, sections/*-group.json filled in
                 ──►  snippets/region--content*.liquid    (lookup, split when large)
  looks/         ──►  the active look's values laid over content first
  data/*.json    ──►  snippets/region--data.liquid
  translations/  ──►  merged over locales/*.json
  templates/*.liquid ► copied (the region's own standalone pages)
  content/boxes.json ► one page per box, laid out by page-layouts/box.json
  every published region ► snippets/region--registry.liquid (hreflang, geo redirect)
```

`npm run compile:all` builds every region; `npm run dev:<id>` serves one.

### Layouts reference content; they never hold it

A template or section group is a layout: which sections, in which order, with
which design settings. Its content is a reference into the region's page file:

| in a layout | means |
| :--- | :--- |
| `"@content:<page>.<path>"` | that value from `regions/<id>/content/<page>.json`; `null` leaves the setting out |
| `"@shown": "<page>.<section>.shown"` | the section is on this region's page only where that value is `true` |
| `"blocks": "@list:<page>.<path>"` | one block per list item, styled by the layout's `block_designs` for its `type` |
| `"blocks": { "<type>": "@list:<path>", … }` | one list per block type, in that order |
| a block keyed by type whose value is `"@list:…"` among fixed blocks | the list's blocks, expanded in place |

A list in content grows the page: add an FAQ, a brand, an Instagram image, a
button, and the page has one more — nothing in code counts them. A template whose
page a region has no content file for is not published in that region.

### What the build refuses

- code (`.liquid` sections or snippets) or a JSON layout inside a region;
- a region entry other than `region.json`, `content/`, `data/`, `looks/`,
  `translations/`, `templates/` — so every region has the same shape;
- a region `locales/` (region wording goes in `translations/`) or `config/`;
- a market override (a template with `"parent"` / `"context"`): a page that differs
  by region differs by its content;
- a `@content` / `@list` / `@shown` that resolves to nothing, a key `region.json`'s
  `_schema.json` does not define, a look naming content that does not exist;
- any shared code reading a region key the region does not have.

## 3. At render time

Shared code asks the generated snippets; it never branches on the region.

```liquid
{%- capture symbol -%}{%- render 'region--active', key: 'currency_symbol' -%}{%- endcapture -%}
{% render 'region--content', key: 'global.cart_drawer.empty.heading' %}
{% render 'region--content', key: 'info-pages.sidebar_links.__keys' %}   {# a list's keys #}
{% render 'region--content', key: 'boxes.five_favourites.box_name', js: true %}
```

Sections read their own settings, which the build already filled from content.
Scripts read their values from `data-` attributes or JSON blocks rendered next to
them (`#bundleBoxData`, `#telemetryConfig`, `cardStrings`, …); the scripts themselves
are assets, loaded where the markup needs them (gate Layer 26 refuses an inline
script or style that uses no Liquid).

Interface wording (buttons, states, errors) is translations: `{{ 'products.product.add_to_cart' | t }}`.
One wording has one key (Layer 23); buttons, headings and short labels are Title
Case, form labels sentence case, messages full sentences.

## 4. Components

Files are named `<domain>--<component>` (CRITICAL.md, gate Layer 29): `cart--drawer`,
`catalog--facets`, `card--product-carousel`, `blog--article-share`. Section groups,
layouts and templates keep Shopify's names.

The product card is one component: `snippets/card--product-carousel.liquid`, styled
only by `assets/card--product-carousel.css`, behaving through `assets/card--product.js`.
A section that shows cards sizes them from its own section-scoped selector and
never styles the card's insides (Layer 24).

Designed blog articles are one template: `sections/article--parts.liquid` draws each
article's parts in order from `regions/<id>/content/articles.json`, matched by the
article's handle or its assigned template. An article with no entry renders as a
plain Shopify article.

Seasonal looks (`regions/<id>/looks/<name>.json`, switched in `_active.json`)
change only content values (banners, headlines, the announcement bar). Sales are
Shopify's compare-at prices, shown by one rule (`sale--badge`, `window.ScentspiredSale`).

## 5. Adding a region

```bash
npm run region:new -- fr            # region.json + a copy of every page's content, from uk
npm run compile -- fr               # names any TODO value or missing page
npm run dev -- fr
npm run test:region -- fr
```

Nothing outside `regions/fr/` changes. Setting `"published": true` adds the region
to hreflang and the geo redirect, and locks its store against writes from this
repository.

## 6. What keeps it true

- **The gate** (`node runner.cjs --scope=all`, 31 layers, README) runs in CI on every
  push, and before every push through the pre-push hook. Every architectural rule
  above is a layer, and every guard has a fixture proving it catches what it names
  (Layer 31). A missing checker fails; switching testing off fails CI.
- **Store checks** that need a running dev store: the render-parity harness
  (`parity:check`, rendered HTML of 20 pages per region), the link check
  (`links:check`), template and asset usage.
- **Live stores are never written.** UK and USA theme repositories are reference
  copies; `scripts/guard-live-repos.cjs` refuses pushes and theme uploads aimed at
  them, and a push here deploys nothing.

Where the theme still carries something for the live stores' sake, it is listed
with its long-term fix in [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).

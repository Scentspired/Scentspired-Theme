# Regions — where everything is

**The theme is structure and design; a region is content.** The Liquid, HTML,
CSS and JavaScript at the repository root, and the layouts of every page
(`templates/*.json`), of the header and footer (`sections/*.json`) and of the
theme settings (`config/settings_data.json`), are the same for every region:
section order, spacing, sizes, colours, CSS. Each region's folder holds what is
its own: every word, image, link, list item and on/off switch, and who it is.
UK is a region like any other.

To see everything one region has, and the file to edit for each:

```
npm run region:show -- uk
```

## I want to change…

| what | edit |
| :--- | :--- |
| a page's words, images, links (home, product, FAQs, contact, …) | `regions/<id>/content/<page>.json` (`home`, `product`, `page-faqs`, …) |
| a list on a page (FAQs, policy sections, collection cards, blog items, the homepage's brands and notes, Instagram images, product icons) | that list in the page's content file (`items`, `faqs`, `brands`, `notes`, `images`, `icons`): add, remove, reorder — the page grows with it |
| whether a section shows in this region | its `"shown"` in that page's content file, where the layout allows it |
| the header's or footer's content | `regions/<id>/content/header-group.json`, `footer-group.json` |
| the info pages' sidebar links | `regions/<id>/content/info-pages.json` |
| logo, favicon, social links, the store's app embeds | `regions/<id>/content/theme-settings.json` |
| homepage SEO title and description | `regions/<id>/content/global.json` → `"seo"` |
| boxes (bundles): pages, menus, the price a saving is shown against | `regions/<id>/content/boxes.json` |
| **which products are on sale, and by how much** | not here: in **Shopify**, each product's price and compare-at price (one by one, by collection, or all at once). The site shows the badge and struck-through price on exactly those products |
| the sale badge's wording ("Sale") | `regions/<id>/content/global.json` → `"sale_badge"` |
| **a look** (Christmas, a men's sale): banners, images, headlines while it runs | `regions/<id>/looks/<name>.json` (copy `_blank.json`); switch it on in `looks/_active.json` |
| Trustpilot on/off, app or widget, URL, IDs | `regions/<id>/region.json` → `"trustpilot"` |
| Google Analytics / Search Console | `regions/<id>/region.json` → `"analytics"` (shared defaults in `_defaults.json`) |
| currency, shipping threshold and cost, return fee, contact emails | `regions/<id>/region.json` |
| one piece of translated text | `regions/<id>/locales/<lang>.json` (only the keys that differ) |
| **spacing, sizes, colours, section order, CSS** | not in a region: the theme's `templates/*.json`, `sections/*.json`, `config/settings_data.json` or the section's stylesheet, for every region at once |

Sales and looks are separate:

- **Sale (Shopify).** Set the sale price and compare-at price on the products
  you want, in Shopify. The site shows "Sale" (or "[percent]% OFF", the saving
  worked out from those prices) and the struck-through price on exactly those
  products, and checkout charges the sale price. Nothing here changes a price.
  A Shopify automatic discount is charged at checkout but never shown on
  product pages: Shopify does not tell themes about it.
- **Look (here).** `looks/_active.json` names the look the site wears, or `""`.
  A look changes only how the site looks. `npm run looks:refresh` adds new
  content fields to every look and rewrites `_blank.json`.

Then `npm run compile -- <id>` builds it.

Every key `region.json` accepts, and what it does, is in `_schema.json`.

## What a region can't have

Code. Section and snippet `.liquid` files are shared by every region; the
compiler refuses them inside `regions/`. When a component needs a different
value per region, the value goes in the region's JSON and the component reads
it. That's why one fix to a component reaches every storefront.

## Adding a region

```
npm run region:new -- fr                 region.json + its own copy of every page, from uk
npm run region:new -- fr --from=usa      …starting from USA's pages instead
npm run compile -- fr                    builds dist/fr; names any TODO or missing page
npm run dev -- fr                        serves it
npm run test:region -- fr                tests it
```

Nothing outside `regions/fr/` needs editing. Set `"published": true` to launch:
the region joins hreflang and the geo-redirect, and its store is locked against
writes from this repository.

## Rules the build enforces

- A layout (`templates/*.json`, `sections/*.json`, `config/settings_data.json`)
  holds no content value of its own: every word, image, link or picked record
  is a `"@content:<page>.<path>"` reference into the region's content files.
- A region holds no design: no `templates/`, `sections/` or
  `config/settings_data.json`, and no spacing, size, colour or CSS value in its
  content files.
- `region.json` accepts only the keys in `_schema.json`.
- A look that names no content, or an `_active.json` that names no look, fails the build.
- A region has every page the default region (uk) has. It may have extra pages
  of its own (USA's `robots.txt`, UAE's waitlist).
- Every value shared code reads resolves for the region, or the build names it.

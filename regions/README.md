# Regions — where everything is

**The theme is a thin template. It holds no content.** The Liquid, HTML, CSS
and JavaScript at the repository root are structure only; every page's
content, the header, the footer, the theme settings and every regional value
live here, in the region's own folder, complete. UK is a region like any other.

To see everything one region has, and the file to edit for each:

```
npm run region:show -- uk
```

## I want to change…

| what | edit |
| :--- | :--- |
| Trustpilot on/off, app or widget, URL, IDs | `regions/<id>/region.json` → `"trustpilot"` |
| Google Analytics / Search Console | `regions/<id>/region.json` → `"analytics"` (shared defaults in `_defaults.json`) |
| currency, shipping threshold and cost, return fee | `regions/<id>/region.json` |
| support / returns email, social links, logo, SEO title | `regions/<id>/region.json` |
| bundle prices and variant IDs | `regions/<id>/region.json` → `"bundles"` |
| a page's content (home, contact, FAQ, returns, …) | `regions/<id>/templates/<page>.json` |
| the footer's content or links | `regions/<id>/sections/footer-group.json` |
| the header / menu | `regions/<id>/sections/header-group.json` |
| theme settings (colours, fonts chosen in the editor) | `regions/<id>/config/settings_data.json` |
| one piece of translated text | `regions/<id>/locales/<lang>.json` (only the keys that differ) |

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

- The theme holds no page content. `npm run region:prune` moves any that
  appears into the regions; the gate fails while there is some.
- A region has every page the default region (uk) has. It may have extra pages
  of its own (USA's `robots.txt`, UAE's waitlist).
- Every value shared code reads resolves for the region, or the build names it.

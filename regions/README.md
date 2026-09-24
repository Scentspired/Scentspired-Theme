# Regions — where everything is

**A region folder holds only what makes that region different.** Everything
else it inherits from core, which is the repository root. A near-empty folder
does not mean a near-empty storefront.

**UK is the core.** Its pages, header and footer are the root `templates/` and
`sections/`, so `regions/uk/` only holds its `region.json`. Editing a root file
changes UK *and* every region that inherits that file.

To see everything one region uses, and the file to edit for each:

```
npm run region:show -- usa
```

## I want to…

| change | edit |
| :--- | :--- |
| Trustpilot on/off, app or widget, URL, IDs | `regions/<id>/region.json` → `"trustpilot"` |
| Google Analytics / Search Console | `regions/<id>/region.json` → `"analytics"` (defaults in `_defaults.json`) |
| currency, shipping threshold and cost, return fee | `regions/<id>/region.json` |
| support / returns email, social links, logo, SEO title | `regions/<id>/region.json` |
| bundle prices and variant IDs | `regions/<id>/region.json` → `"bundles"` |
| the footer's content or links | `regions/<id>/sections/footer-group.json` |
| the header / menu | `regions/<id>/sections/header-group.json` |
| a page's content (contact, FAQ, returns, …) | `regions/<id>/templates/page.<name>.json` |
| theme settings (colours, fonts chosen in the editor) | `regions/<id>/config/settings_data.json` |
| one piece of translated text | `regions/<id>/locales/<lang>.json` (only the keys that differ) |

If the file isn't in the region's folder yet, the region is using core's.
Give it its own copy, then edit the copy:

```
npm run region:edit -- usa templates/page.faqs.json
npm run region:edit -- uae sections/footer-group.json
```

Every key `region.json` accepts, and what it does, is in `_schema.json`.

## What a region can't have

Code. Section and snippet `.liquid` files are shared by every region; the
compiler refuses them inside `regions/`. When a component needs a different
value per region, the value goes in `region.json` and the component reads it
with `{% render 'region--active', key: '…' %}`. That's why one fix to a
component reaches every storefront.

## Adding a region

```
npm run region:new -- fr          creates regions/fr/region.json, every required value as TODO
npm run compile -- fr             builds dist/fr; names any TODO or missing value
npm run dev -- fr                 serves it
npm run test:region -- fr         tests it
```

Nothing outside `regions/fr/` needs editing. Set `"published": true` to launch:
the region joins hreflang and the geo-redirect, and its store is locked against
writes from this repository.

## Keeping folders honest

A file identical to core's is a frozen copy: it stops receiving core's fixes.
`npm run region:prune` removes such copies (and reduces translation files to
the keys that differ). The gate fails while one exists.

# Scentspired Theme

One Shopify theme for every Scentspired storefront: United Kingdom, USA and
United Arab Emirates, and any region added later.

**The theme is structure, design and behaviour; a region is content; Shopify is
prices.** Every Liquid, CSS and JavaScript file, and the layout of every page, is
shared. A region's folder holds only what is its own — words, images, links, lists,
on/off switches, and who it is. Which products are on sale, and by how much, is
set in Shopify (compare-at prices), never here.

```
theme root                      shared by every region
├── assets/ blocks/ layout/     code: <domain>--<component> names (CRITICAL.md)
├── sections/ snippets/
├── templates/*.json            page layouts: section order, spacing, sizes, colours;
├── sections/*-group.json       every word, image and link is a "@content:" reference
├── config/                     theme settings, the same for every region
├── locales/                    interface wording (buttons, states, errors), one key per wording
└── page-layouts/               layouts the build turns into pages (box pages)

regions/<id>/                   one folder per storefront, all the same shape
├── region.json                 identity: currency, domains, store IDs, Trustpilot, analytics
├── content/<page>.json         the words, images, links and lists of each page
├── data/                       lists scripts read whole: box brands, aroma selector, hero lists
├── looks/                      seasonal looks (Christmas, a sale) and which one is on
├── translations/               wording that differs for this region (optional)
└── templates/*.liquid          standalone pages of its own (robots.txt, llms.txt)

dist/<id>/                      the built theme for one region (generated, not committed)
```

Where to change what, from a shopper's point of view, is in
[regions/README.md](regions/README.md). How the pieces fit is in
[ARCHITECTURE.md](ARCHITECTURE.md); the naming and layering rules in
[CRITICAL.md](CRITICAL.md).

## Build and run

```bash
npm ci                     # tools: Shopify CLI, Theme Check, Stylelint, Prettier
npm run compile:all        # dist/uk, dist/usa, dist/uae — each built and validated
npm run dev:uk             # serves dist/uk on its dev store, rebuilding on change
```

`npm run compile -- <id>` builds one region; `npm run region:show -- <id>` lists
every file a region has and what each one controls; `npm run region:new -- <id>`
starts a new one. The build refuses anything that would break the model: code or
a layout inside a region, a region with a folder the others lack, a market
override, a content reference that resolves to nothing, a look that names no
content.

## The quality gate

```bash
node runner.cjs --scope=all   # core and every built region
npm test                      # core only
```

31 layers. Every one but formatting (reported, not blocking) has to pass; a checker
that is not installed fails its layer.

| layers | what they check |
| :--- | :--- |
| 1–3 | formatting (Prettier, reported), JavaScript syntax of every script, static analysis |
| 4–7 | simulated storefront flows, chaos and concurrency cases, crash-pattern regressions, the scan report |
| 8–11 | JSON templates and schemas, locale keys, every referenced asset and snippet exists, asset size budgets |
| 12–13 | Shopify Theme Check on core and on each `dist/<id>`, Stylelint |
| 14 | each region's currency, shipping thresholds, domains and SEO match the facts confirmed on its live store, and reach its build |
| 15–21 | no region literals in shared code, guarded `image_url`, heading structure, section/snippet references, script globals, region onboarding, no content written into code (ratchet at 0) |
| 22–30 | workflow YAML, one wording one key, one product-card look, no numbered settings, no inline script/style without Liquid, nothing unloaded, no unread settings, `<domain>--<component>` names, every region the same shape |
| 31 | every guard's fixture: each guard is shown catching the defects it names, and passing the legitimate forms |

The master switch is `tests/config/test-settings.json` (`testing_enabled`). CI
fails if it is ever off. Pushes run the gate through the pre-push hook
(`npm install` installs the hooks).

## Checks against a running dev store

The gate reads files. These ask the store, because only the store knows its
pages, handles and products:

```bash
npm run parity:check          # rendered HTML of 20 UK pages vs tests/parity/baseline
npm run parity:check:usa      # the same for USA (tests/parity/baseline-usa)
npm run links:check           # every internal link reachable from the home page opens
npm run links:check:usa
```

`parity:baseline` / `parity:baseline:usa` re-record a baseline; the harness refuses
to write one if any page came back from an unhealthy dev server.
`scripts/template-usage.cjs` and `scripts/asset-usage.cjs` report which template
each live URL renders and which assets pages actually load. (`npm run fonts:check`
needs no store: it fails if any typography declaration resolves to a different font.)

## Live stores

`../Scentspired-UK` and `../Scentspired-USA` are the live storefronts' theme
repositories, kept as read-only reference. Nothing here pushes to them, and
`scripts/guard-live-repos.cjs` refuses any push or theme upload aimed at them.
Pushing this repository deploys nothing: a push to `main` runs the quality gate
in CI and stops there. The UAE deploy workflow runs only by hand — and must not be
run until its engine deploys `dist/uae` (see
[docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)).

Commits and pushes are made as `Ahmad Hassan (B-Ted) <ahmadhassan.bted@gmail.com>`,
without trailers; the commit-msg and pre-push hooks refuse anything else.

## Documents

| file | what it is |
| :--- | :--- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | how a request becomes a page: build, content lookup, regions, gate |
| [CRITICAL.md](CRITICAL.md) | naming grammar, layering, the rules every change follows |
| [regions/README.md](regions/README.md) | where every piece of a region's content lives |
| [docs/PLAN-finish-architecture.md](docs/PLAN-finish-architecture.md) | the architecture work, phase by phase, with its proofs |
| [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) | what was kept for the live stores' sake, and the long-term fix for each |
| [TODO.md](TODO.md) | open work |

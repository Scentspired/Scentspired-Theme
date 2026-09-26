# Tests

The quality gate (`runner.cjs`) and everything it runs. Every layer must pass,
except formatting (Layer 1), which is reported. A checker that is not installed
fails its layer. The master switch is `config/test-settings.json`
(`testing_enabled`), and CI fails if it is ever off.

```bash
node runner.cjs --scope=all   # core, then each dist/<id> (build first: npm run compile:all)
npm test                      # core only
npm run test:region -- usa    # one built region
npm run guard:fixtures        # every guard's fixture (Layer 31)
```

## Layout

```
tests/
├── config/
│   ├── test-settings.json         master switch, per-layer skips (none)
│   ├── config.json                static-analysis rules and approved exceptions
│   └── remediation-queue.json     release tooling's queue
├── static/                        read files, need no store
│   ├── guard--*.cjs               one architectural rule each (layers 15–30)
│   ├── guard--*.fixture.cjs       plants the defect and the legitimate forms
│   ├── tooling--*.fixture.cjs     proves Theme Check and Stylelint really run
│   ├── baseline-*.json            ratchets: recorded counts that can only fall
│   └── …                          syntax, static analysis, schema, locale, asset checks
├── dynamic/                       simulated flows, chaos cases, crash regressions,
│                                  region output parity (Layer 14)
├── regions/                       per-region suite and catalog probes
├── live/                          read-only probes of the live storefronts (not in the gate)
├── parity/                        render baselines (baseline/, baseline-usa/) and font inventory
├── release/                       release and remediation tooling
└── reporting/                     scan report and catalog generators (reports/ is generated)
```

## The layers

| layer | script | checks |
| :--- | :--- | :--- |
| 1 | Prettier | formatting, reported, not blocking |
| 2 | `static/syntax-validator.cjs` | every inline script and JS asset parses |
| 3 | `static/static-analysis.cjs` | rule engine: null guards, variant IDs, escaping (ratchet: `baseline-violations.json`) |
| 4 | `dynamic/critical-flow-simulator.cjs` | product page, quick add, boxes and cart drawer flows |
| 5 | `dynamic/chaos-simulation-tests.cjs` | concurrency floods, hostile payloads, storage failures |
| 6 | `dynamic/verify-clarity-detection.cjs` | the recorded Clarity crash patterns stay fixed |
| 7 | `reporting/generate-report.cjs` | writes the scan report |
| 8 | `static/json-schema-validator.cjs` | templates and section schemas (ratchet: `baseline-schema-violations.json`) |
| 9 | `static/locale-integrity-validator.cjs` | every `\| t` key exists |
| 10 | `static/asset-snippet-integrity.cjs` | every referenced asset and snippet exists |
| 11 | `static/asset-size-budget-guard.cjs` | JS and CSS size budgets |
| 12 | `static/theme-check-runner.cjs` | Shopify Theme Check on core and each `dist/<id>` (`.theme-check.yml`) |
| 13 | `static/stylelint-runner.cjs` | Stylelint (`.stylelintrc.json`) |
| 14 | `dynamic/verify-live-output-parity.cjs` | each region's currency, thresholds, domains, SEO match its confirmed live values |
| 15 | `guard--region-literals` | no domain, currency symbol or country code in shared code |
| 16 | `guard--image-url` | every settings `image_url` is guarded against blank |
| 17 | `guard--headings` | one H1 per page, no heading tags on interface labels |
| 18 | `guard--section-refs` | every section and snippet a file names exists |
| 19 | `guard--script-globals` | no top-level `const`/`let` declared in two files |
| 20 | `guard--region-onboarding` | a region has everything shared code reads |
| 21 | `guard--hardcoded-content` | no shopper-facing content in code (ratchet at 0) |
| 22 | `guard--workflows` | GitHub Actions YAML parses and has jobs, runners, steps |
| 23 | `guard--wording` | one wording, one translation key |
| 24 | `guard--card-look` | only the card's stylesheet styles the card's insides |
| 25 | `guard--numbered-settings` | no `thing_1`, `thing_2`, … setting families |
| 26 | `guard--inline-code` | no inline script or style that uses no Liquid |
| 27 | `scripts/find-dead-files.cjs --check` | every theme file is reached from a page |
| 28 | `guard--unread-settings` | every schema setting is read |
| 29 | `guard--naming` | `<domain>--<component>` file names |
| 30 | `guard--region-shape` | every region has the same shape; no market overrides |
| 31 | `static/run-guard-fixtures.cjs` | every fixture: each guard seen red and green |

## Adding a rule

1. Write `static/guard--<rule>.cjs`: exit 1 with the file and the reason, and take
   `--root=<dir>` so a fixture can point it at a temporary theme.
2. Write `static/guard--<rule>.fixture.cjs`: the defects it must flag and the
   legitimate forms it must pass. Layer 31 picks it up by name.
3. Add the layer to `runner.cjs`, and a line to the table above and to README.md.

A guard is evidence only once it has been seen failing. Twice on this project, a
check passed for the wrong reason.

## Checks that need a running dev store

These are not in the gate, because only the store knows its pages and handles:
`npm run parity:check[:usa]` (rendered HTML vs `parity/baseline*`) and
`npm run links:check[:usa]` (every internal link opens). The README has details.

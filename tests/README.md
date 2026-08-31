# 🛡️ Theme Guardian — Scentspired Automated Testing & Detection Toolkit

> **Mission:** Zero errors slipped to production. Guarantee 100% purchase funnel continuity and multi-store resilience across Scentspired Global Stores.

---

## 🏗️ Modular Test Suite Architecture

Following enterprise software engineering principles (Separation of Concerns, Functional Cohesion, Clean Abstractions), the test suite is organized into distinct functional domains:

```
tests/
├── config/                                 # Centralized Test Configuration & Rules
│   ├── config.json                         # 16 Static analysis rules & exceptions
│   └── remediation-queue.json              # Scheduled remediation task queue
│
├── static/                                 # Static Analysis, AST & Schema Linters
│   ├── syntax-validator.cjs                # Layer 2: JavaScript AST & Script Compiler
│   ├── static-analysis.cjs                 # Layer 3: Rule engine (Null guards, variant IDs, etc.)
│   ├── json-schema-validator.cjs           # Layer 8: JSON templates & section schema validator
│   ├── locale-integrity-validator.cjs      # Layer 9: Translation key dictionary integrity
│   ├── asset-snippet-integrity.cjs         # Layer 11: Physical asset & snippet reference check
│   └── asset-size-budget-guard.cjs         # Layer 12: Bundle size & asset performance budgets
│
├── dynamic/                                # Flow Simulators, Integration & Chaos Suites
│   ├── critical-flow-simulator.cjs         # Layer 4: Purchase funnel simulations (PDP, Bundles, Drawer)
│   ├── chaos-simulation-tests.cjs          # Layer 5: Concurrency, flood, race conditions, fuzzing
│   ├── rigorous-integration-tests.cjs      # Comprehensive integration test suites
│   └── verify-clarity-detection.cjs        # Layer 6: Clarity historical crash defense
│
├── live/                                   # Live Storefront & Catalog Probing
│   ├── live-catalog-probe.cjs              # Layer 10: Multi-store catalog & bundle API probe
│   └── live-smoke-test.cjs                 # Live storefront smoke tests
│
├── release/                                # Release Management & Remediation Automation
│   ├── daily-release-manager.cjs           # Daily gated release coordinator
│   ├── build-remediation-queue.cjs         # Remediation task queue builder
│   ├── generate-full-87day-changelog.cjs   # Release history builder
│   └── run-all.sh                          # Universal test runner shell script
│
├── reporting/                              # Report & Catalog Generators
│   ├── generate-report.cjs                 # Layer 7: Master scan report generator
│   ├── generate-master-catalog.cjs         # Master catalog generator
│   └── reports/                            # Generated reports & archive
│       ├── LATEST_SCAN_REPORT.md
│       ├── latest_scan_report.json
│       └── archive/
│
└── README.md                               # Test architecture documentation
```

---

## 🚀 Quick Start Commands

```bash
# Run Full 12-Layer Quality Gate
npm test

# Run Specific Test Layers
npm run test:scanner    # Layer 3: Static AST Analysis Rules (16 active rules)
npm run test:syntax     # Layer 2: JavaScript V8 AST Compiler
npm run test:flows      # Layer 4: Critical Purchase Funnel Simulator (93 assertions)
npm run test:chaos      # Layer 5: Chaos, Fuzzing & Concurrency Engine
npm run test:clarity    # Layer 6: Historical Clarity Crash Defense Verifier
npm run report:scan     # Layer 7: Generate Scan Markdown & JSON Reports
```

---

## 🛡️ The 12-Layer Quality Gate

| Layer | Domain | Tool / Script | Purpose |
| :--- | :--- | :--- | :--- |
| **Layer 1** | Formatting | `prettier --check` | Enforces uniform Liquid, JS, JSON & CSS styling. |
| **Layer 2** | Static | `tests/static/syntax-validator.cjs` | Compiles all inline `<script>` and JS files via V8 AST parser. |
| **Layer 3** | Static | `tests/static/static-analysis.cjs` | Evaluates 16 rules (null guards, variant IDs, unescaped strings). |
| **Layer 4** | Dynamic | `tests/dynamic/critical-flow-simulator.cjs` | Simulates PDP, Quick-Add, Bundles, and Cart Drawer funnels. |
| **Layer 5** | Dynamic | `tests/dynamic/chaos-simulation-tests.cjs` | 50-request concurrent floods, XSS payloads, Safari Private Mode. |
| **Layer 6** | Dynamic | `tests/dynamic/verify-clarity-detection.cjs` | Verifies protection against all 14 historical Clarity crash vectors. |
| **Layer 7** | Reporting | `tests/reporting/generate-report.cjs` | Generates timestamped audit logs (`LATEST_SCAN_REPORT.md`). |
| **Layer 8** | Static | `tests/static/json-schema-validator.cjs` | Validates JSON templates and section schema definitions. |
| **Layer 9** | Static | `tests/static/locale-integrity-validator.cjs` | Ensures 100% of Liquid `{{ 'key' \| t }}` exist in locale files. |
| **Layer 10**| Live | `tests/live/live-catalog-probe.cjs` | Probes live US & UK catalog endpoints and bundle variants. |
| **Layer 11**| Static | `tests/static/asset-snippet-integrity.cjs` | Verifies all referenced snippets and assets exist on disk. |
| **Layer 12**| Static | `tests/static/asset-size-budget-guard.cjs` | Prevents performance regressions by enforcing JS/CSS size budgets. |

---

## ⚙️ How to Maintain as the Site Evolves

1. **To add/modify a static rule:** Edit `tests/config/config.json` and add the scanner to `tests/static/static-analysis.cjs`.
2. **To whitelist an approved pattern:** Add the file path and rule name to `approvedExceptions` in `tests/config/config.json`.
3. **To add a purchase journey assertion:** Add tests to `tests/dynamic/critical-flow-simulator.cjs`.
4. **To adjust performance thresholds:** Update `tests/static/asset-size-budget-guard.cjs`.


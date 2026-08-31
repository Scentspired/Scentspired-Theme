# Scentspired Theme Guardian & Core Architecture

Centralized quality gate, testing engine, and upstream base theme architecture for Scentspired multi-store Shopify deployments (Scentspired USA and Scentspired UK).

---

## 1. Architectural Overview

The Scentspired codebase uses a decoupled 2-tier architecture:

- **Tier 1 (This Repository: `Scentspired-Theme`):** Centralized 7-layer Quality Gate, JavaScript AST syntax compilers, static code analysis rules, purchase funnel simulators, chaos engines, and upstream shared Liquid/CSS components.
- **Tier 2 (Regional Storefronts: `Scentspired-USA` & `Scentspired-UK`):** Independent Shopify storefronts retaining 100% isolated warehouse logistics, inventory management, marketing campaigns, regional payment gateways, and country-specific JSON templates (`templates/*.json`).

```
┌──────────────────────────────────────────────────────────────┐
│        Scentspired-Theme (Centralized Quality Engine)        │
│    7-Layer Gate • AST Compilers • Funnel Simulators • CLI    │
└──────────────────────────────┬───────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│       Scentspired-USA        ││       Scentspired-UK         │
│  US Warehouses • US Klaviyo  ││  UK 3PL • UK Klaviyo (GDPR)  │
│  USPS / Shop Pay • USD ($)   ││  Royal Mail / Klarna • GBP(£)│
│  US JSON Templates & Banners ││  UK JSON Templates & Banners │
└──────────────────────────────┘└──────────────────────────────┘
```

---

## 2. The 7-Layer Quality Gate

Every theme change must pass all 7 automated layers before deployment is approved:

1. **Layer 1: Prettier & Liquid Formatting Gate** — Validates Liquid, JSON, JS, and CSS code style.
2. **Layer 2: AST JavaScript & Script Block Compiler** — Compiles all inline `<script>` tags and `.js` assets through the Node.js V8 engine to detect unclosed tokens and syntax errors.
3. **Layer 3: Theme Guardian Static Code Analysis** — Enforces 7 rules (null-checks, apostrophe sanitization, balanced tags, and missing snippet asset verification).
4. **Layer 4: Storefront Critical Funnel Simulator** — Executes 14 multi-variant end-to-end suites testing add-to-cart, cart drawer sync, search overlays, and checkout routing.
5. **Layer 5: Chaos, Fuzzing & Concurrency Engine** — Runs 17 chaos assertions (50 concurrent add-to-cart floods, Safari private mode fallback, multi-tab sync, payload sanitization).
6. **Layer 6: Clarity & Sentry Crash Defense** — Validates 14 historical crash vectors (83+ session crash patterns) are fully patched.
7. **Layer 7: Automated Master Scan Report Generator** — Produces full markdown and JSON quality reports.

---

## 3. CLI Usage

### Run Tests Against a Target Theme
```bash
# Test Scentspired USA
node runner.cjs --target=../Scentspired-USA

# Test Scentspired UK
node runner.cjs --target=../Scentspired-UK

# Or via environment variable
THEME_TARGET_DIR=../Scentspired-USA node runner.cjs
```

---

## 4. CI/CD Pipeline Integration

Both `Scentspired-USA` and `Scentspired-UK` invoke this repository in GitHub Actions:

```yaml
- name: Checkout Centralized Theme Guardian
  uses: actions/checkout@v4
  with:
    repository: Scentspired/Scentspired-Theme
    path: .guardian-engine

- name: Run Centralized 7-Layer Quality Gate
  run: |
    cd .guardian-engine
    npm ci
    node runner.cjs --target=${{ github.workspace }}
```

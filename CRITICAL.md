# 🛡️ SCENTSPIRED ARCHITECTURE & MIGRATION DIRECTIVE

> **Document Status:** LIVING ARCHITECTURAL CONTRACT  
> **Target Audience:** All Theme Engineers, Shopify Developers, and Automated Agents  
> **Applies To:** `Scentspired-Theme`, `Scentspired-USA`, `Scentspired-UK`

---

## 1. Scentspired Virtual Package Architecture (SVPA)

Shopify strictly enforces a flat directory structure for `snippets/`, `sections/`, and `assets/`. Calling `{% render 'folder/snippet' %}` throws a fatal Liquid compilation error.

To maintain maximum modularity, zero coupling, single-file blast radius, and clean domain isolation without violating Shopify's flat folder rule, all custom components MUST adhere to the **Double-Hyphen (`--`) Virtual Package Standard**:

### Formal Grammar:
```
[domain]--[layer/subsystem]--[component].[ext]
```

### Examples:
- `snippets/blog--article--breadcrumb.liquid`  *(Represents `blog/article/breadcrumb`)*
- `snippets/blog--article--header.liquid`      *(Represents `blog/article/header`)*
- `snippets/blog--article--share.liquid`       *(Represents `blog/article/share`)*
- `snippets/blog--listing--category-filter.liquid` *(Represents `blog/listing/category-filter`)*
- `snippets/blog--listing--card.liquid`        *(Represents `blog/listing/card`)*
- `assets/blog--typography.css`                *(Represents `blog/typography.css`)*
- `assets/blog--listing.css`                   *(Represents `blog/listing.css`)*
- `assets/blog--card.css`                      *(Represents `blog/card.css`)*

### Why `--` (Double Hyphen)?
1. **Virtual Folder Tree Sorting:** In VS Code, GitHub, and terminal `ls`, all files prefixed with `blog--` sort consecutively, visually forming an isolated folder.
2. **Zero Liquid Conflicts:** Single dots (`.`) are object property accessors in Liquid and can trigger parser ambiguities. Slashes (`/`) cause fatal Liquid compile crashes.
3. **BEM-Aligned:** Consistent with modern CSS naming semantics.

---

## 2. The 4 Iron Rules of Safe Migration

Whenever refactoring or renaming files across Scentspired repositories, you MUST obey these four rules:

### Rule 1: Zero-Downtime Forwarding Shimming
Never delete an existing snippet name that might be referenced by legacy templates, drafts, or third-party apps without leaving a **1-line forwarding shim**:
```liquid
{% comment %} SVPA Backward-Compatibility Forwarding Shim {% endcomment %}
{% render 'blog--article--breadcrumb', article: article, blog: blog, show_home: show_home, show_blog: show_blog, show_category: show_category %}
```
This ensures zero downtime and prevents `Liquid error: Could not find snippet` crashes.

### Rule 2: Single Atomic Commit
All asset renames, template imports, and caller references must be staged and committed atomically in the same Git commit.

### Rule 3: Regional Isolation & Preservation
Each regional storefront (`Scentspired-USA` and `Scentspired-UK`) maintains active marketing campaigns and specific Shopify Admin customizations.
- **NEVER** delete or overwrite regional article templates (`article.blog-*.json`).
- **NEVER** remove regional section dependencies (e.g., `blogtextliquid.liquid`, `zigzag-blog.liquid`, `text-blog.liquid`) that are actively mapped to live merchant templates.
- Any shared improvements from `Scentspired-Theme` must be additive and backward-compatible.

### Rule 4: Mandatory 12-Layer Quality Gate Validation
No commit may be pushed to `origin` without passing the 12-layer Theme Guardian test suite:
```bash
node runner.cjs --target=.
```
All 12 layers (AST compiler, static analysis, flow simulator, physical asset integrity, JSON schema validity) must report 100% pass before any push.

---

## 3. Registered Virtual Package Domains

| Domain | Namespace Prefix | Scope & Responsibilities |
| :--- | :--- | :--- |
| **Blog & Editorial** | `blog--` | Article layouts, breadcrumbs, bylines, typography, listing grid, category filter |
| **Bundles & Sets** | `bundle--` | Discovery set, Trio set, Five-box mix-and-match engines |
| **Cart & Checkout** | `cart--` | Drawer UI, item rows, shipping threshold progress, zero-price locks |
| **Catalog & Merchandising** | `catalog--` | Product cards, collection facets, grid layouts, badge overlays |
| **Search & Discovery** | `search--` | Predictive search modal, tokenizer, live query results |
| **Core Primitives** | `core--` | Universal icons, form utilities, buttons, base accessibility helpers |

---

## 4. The Five Layers of Absolute Architectural Independence & Zero-Regression Protocol

To ensure visual discrepancies, negative-margin hacks, and ghost-section spacing bugs **NEVER HAPPEN AGAIN**, every component and template in Scentspired is strictly partitioned into five independent layers with zero cross-layer leak and single-file blast radius:

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 5: AUTOMATED QUALITY GATE DEFENSE (CI & Static Guards)          │
│  - tests/static/json-schema-validator.cjs                              │
│  - Theme Guardian 12-layer suite                                       │
│  - Automated pre-push validation                                       │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 4: REGIONAL DECLARATIVE DATA PAYLOADS                           │
│  - templates/article*.json (USA & UK isolated)                         │
│  - Pure data schemas, zero styling hacks, zero negative margins        │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: SECTION ORCHESTRATORS                                        │
│  - sections/main-article.liquid, blogtextliquid.liquid, etc.           │
│  - Pure mapping: extracts block/section data & feeds Layer 2 snippets   │
│  - Defensive rendering: handles disabled blocks gracefully             │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: ATOMIC VIRTUAL PACKAGE SNIPPETS                              │
│  - snippets/blog--article--*.liquid                                    │
│  - Pure functional components, strict prop interfaces, zero side effects│
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: FOUNDATION & DEFENSIVE DESIGN SYSTEM                         │
│  - assets/blog--typography.css                                         │
│  - CSS variables, responsive typography, self-healing layout rules     │
│  - High specificity container guards (div[id*="shopify-section"])       │
└────────────────────────────────────────────────────────────────────────┘
```

### Layer 1: Foundation & Defensive Design System (`assets/`)
- **Single Responsibility:** Centralized design tokens, typography scale, responsive layout grids, and defensive layout normalizers.
- **Independence Contract:** Zero dependencies on Liquid template logic or section schemas.
- **Defensive Self-Healing:** Uses high-specificity container rules (`div[id*="shopify-section"]`) to prevent inline Shopify Admin customizer styles or rogue IDs from corrupting container widths, max-widths, and padding.
- **Empty Section Pruning:** `.shopify-section:empty, div[id*="shopify-section"]:empty { display: none !important; }` completely collapses phantom gaps at the CSS engine level.

### Layer 2: Atomic Virtual Package Snippets (`snippets/`)
- **Single Responsibility:** Pure presentation rendering using standard semantic HTML.
- **Independence Contract:** Accepts explicit parameters (`article: article, blog: blog, ...`). Never reads or mutates global scope. Zero side effects.
- **Single-File Blast Radius:** Editing `snippets/blog--article--share.liquid` has zero blast radius on headers, breadcrumbs, or content sections.

### Layer 3: Section Orchestrators (`sections/`)
- **Single Responsibility:** Bridge between Shopify Section/Block schemas and Layer 2 Snippets.
- **Independence Contract:** Extracts settings and renders appropriate snippets. Sections never contain arbitrary hardcoded margins or ad-hoc layout offsets.
- **Defensive Orchestration:** Verifies block validity before rendering so empty blocks produce zero markup.

### Layer 4: Regional Declarative Data Payloads (`templates/`)
- **Single Responsibility:** Pure JSON data definitions for article contents and section orders.
- **Independence Contract:** Storefront isolation. `Scentspired-USA` and `Scentspired-UK` templates are completely independent. A change in USA never affects UK.
- **Data Purity Mandate:** Templates are pure data carriers. They MUST NEVER contain layout hacks, inline negative margins (`margin-bottom: -53px`), or ghost sections in `order`.

### Layer 5: Automated Quality Gate CI Guards (`tests/`)
- **Single Responsibility:** Automated verification blocking any commit or push that violates the architectural contract.
- **Automated Anti-Regression Rules (Hard Enforcement in `tests/static/json-schema-validator.cjs`):**
  1. **Rule 1 (Prohibit Negative Margins):** Hard-error on any `margin-bottom: -...` in `custom_css`.
  2. **Rule 2 (Prohibit Ghost Sections):** Hard-error on any disabled section or section with all-disabled blocks in the template `order` array.
  3. **Rule 3 (Hero Geometry Standardization):** Hard-error if hero banner `content_padding != 40` or `content_max_width_inner != 680`.
- **Pre-Push Guarantee:** These automated quality gates run prior to every git push to `develop` and `main`. If any rule fails, the push is immediately halted.


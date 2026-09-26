# 🛡️ SCENTSPIRED ARCHITECTURE & MIGRATION DIRECTIVE

> **Document Status:** LIVING ARCHITECTURAL CONTRACT  
> **Target Audience:** All Theme Engineers, Shopify Developers, and Automated Agents  
> **Applies To:** `Scentspired-Theme` (the `Scentspired-UK` and `Scentspired-USA` repositories are the live stores' locked reference copies: read, never written)

---

## 1. Scentspired Virtual Package Architecture (SVPA)

Shopify strictly enforces a flat directory structure for `snippets/`, `sections/`, and `assets/`. Calling `{% render 'folder/snippet' %}` throws a fatal Liquid compilation error.

To maintain maximum modularity, zero coupling, single-file blast radius, and clean domain isolation without violating Shopify's flat folder rule, all custom components MUST adhere to the **Double-Hyphen (`--`) Virtual Package Standard**:

### Formal Grammar:
```
[domain]--[component].[ext]
```
One double hyphen, after the domain. A component with parts joins them with single hyphens
(`article-share`), so every name has the same two levels and sorts under its domain.
`tests/static/guard--naming.cjs` (gate Layer 29) enforces it for sections, snippets, blocks and
assets; layouts, templates and section groups keep the names Shopify gives them.

### Examples:
- `snippets/blog--article-breadcrumb.liquid`
- `snippets/blog--article-share.liquid`
- `snippets/blog--listing-card.liquid`
- `sections/catalog--best-sellers.liquid`
- `assets/card--product-carousel.css`
- `assets/blog--typography.css`

### Why `--` (Double Hyphen)?
1. **Virtual Folder Tree Sorting:** In VS Code, GitHub, and terminal `ls`, all files prefixed with `blog--` sort consecutively, visually forming an isolated folder.
2. **Zero Liquid Conflicts:** Single dots (`.`) are object property accessors in Liquid and can trigger parser ambiguities. Slashes (`/`) cause fatal Liquid compile crashes.
3. **BEM-Aligned:** Consistent with modern CSS naming semantics.

---

## 2. The 4 Iron Rules of Safe Migration

Whenever refactoring or renaming files across Scentspired repositories, you MUST obey these four rules:

### Rule 1: Direct Semantic Architecture & Zero Cruft
Never use cryptic machine hashes or backward-compatibility shims. All components, blocks, and snippets must be directly and semantically named using the SVPA Double-Hyphen (`--`) convention, with callers updated directly to ensure a clean, modern, and straightforward architecture.

### Rule 2: Single Atomic Commit
All asset renames, template imports, and caller references must be staged and committed atomically in the same Git commit.

### Rule 3: Regional Isolation & Preservation
A region is content (`regions/<id>/`), the theme is structure and design, Shopify is prices (ARCHITECTURE.md).
- **NEVER** write to the live UK or USA repositories or stores. They are reference: what they render is what a refactor must preserve.
- **NEVER** remove a file a live URL still renders or loads. `scripts/template-usage.cjs` and `scripts/asset-usage.cjs` ask the dev stores; "nothing mentions it" is not proof.
- What the theme keeps only for the live stores' sake is listed, with its long-term fix, in `docs/COMPATIBILITY.md`.

### Rule 4: Mandatory Quality Gate Validation
No commit may be pushed to `origin` without passing every layer of the quality gate (31 layers, listed in README.md):
```bash
node runner.cjs --scope=all
```
The pre-push hook runs it and CI runs it on every push; a checker that is not installed fails its layer, and CI fails if testing is switched off.

---

## 3. Registered Virtual Package Domains

| Domain | Namespace Prefix | Scope & Responsibilities |
| :--- | :--- | :--- |
| **Blog & Editorial** | `blog--` | Article layouts, breadcrumbs, bylines, typography, listing grid, category filter |
| **Bundles & Sets** | `bundle--` | Discovery set, Trio set, Five-box mix-and-match engines |
| **Cart & Checkout** | `cart--` | Drawer UI, item rows, shipping threshold progress, zero-price locks |
| **Catalog & Merchandising** | `catalog--` | Product cards, collection facets, grid layouts, badge overlays |
| **Search & Discovery** | `search--` | Predictive search modal, tokenizer, live query results |
| **Core Primitives** | `core--` | Base styles, global scripts, meta tags, localization, password page |
| **Interface** | `ui--` | Icons, pagination, shared interface pieces |
| **Cards** | `card--` | The one product card (markup, styles, behaviour, strings), its badge, the collection card |
| **Product** | `product--` | Product structured data (review schema) |
| **Articles** | `article--` | Designed article parts (`article--parts` and its part styles) |
| **Editorial** | `editorial--` | Blog and article sections, rich text, section headings, scent stories, zigzag blog |
| **Content Pages** | `content--` | FAQ, contact, privacy, 404, generic page, collapsible content, the info-page sidebar |
| **Media** | `media--` | Hero, image and video banners, image split, running text, scent filter banner |
| **Marketing** | `marketing--` | Email signup and newsletter sections |
| **Header / Footer** | `header--`, `footer--` | The header, its drawer, menus and search; the footer |
| **Account** | `account--` | Customer account pages (classic accounts) |
| **Social / Widgets** | `social--`, `widget--` | Social icons and links, Instagram grid; Trustpilot |
| **Sale** | `sale--` | The one sale rule: badge and struck-through price from compare-at prices |
| **Region** | `region--` | Generated per region by the build: identity, content lookup, data, registry |
| **Tokens** | `token--` | Typography tokens |

---

## 4. The Five Layers of Absolute Architectural Independence & Zero-Regression Protocol

To ensure visual discrepancies, negative-margin hacks, and ghost-section spacing bugs **NEVER HAPPEN AGAIN**, every component and template in Scentspired is strictly partitioned into five independent layers with zero cross-layer leak and single-file blast radius:

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 5: AUTOMATED QUALITY GATE DEFENSE (CI & Static Guards)          │
│  - tests/static/json-schema-validator.cjs                              │
│  - Quality gate, 31 layers (node runner.cjs --scope=all)               │
│  - Automated pre-push validation                                       │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 4: REGIONAL DECLARATIVE DATA PAYLOADS                           │
│  - regions/<id>/content/*.json, referenced by templates/*.json         │
│  - Pure data, zero styling hacks, zero negative margins                │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: SECTION ORCHESTRATORS                                        │
│  - sections/article--parts.liquid, editorial--article.liquid, etc.     │
│  - Pure mapping: extracts block/section data & feeds Layer 2 snippets   │
│  - Defensive rendering: handles disabled blocks gracefully             │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: ATOMIC VIRTUAL PACKAGE SNIPPETS                              │
│  - snippets/blog--article-*.liquid                                    │
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
- **Single-File Blast Radius:** Editing `snippets/blog--article-share.liquid` has zero blast radius on headers, breadcrumbs, or content sections.

### Layer 3: Section Orchestrators (`sections/`)
- **Single Responsibility:** Bridge between Shopify Section/Block schemas and Layer 2 Snippets.
- **Independence Contract:** Extracts settings and renders appropriate snippets. Sections never contain arbitrary hardcoded margins or ad-hoc layout offsets.
- **Defensive Orchestration:** Verifies block validity before rendering so empty blocks produce zero markup.

### Layer 4: Regional Declarative Data Payloads (`templates/`)
- **Single Responsibility:** Pure JSON: a layout (`templates/*.json`) holds section order and design; a region's `content/<page>.json` holds its words, images, links and lists.
- **Independence Contract:** Storefront isolation. A region's content is its own: a change in `regions/usa/` never affects UK.
- **Data Purity Mandate:** Templates are pure data carriers. They MUST NEVER contain layout hacks, inline negative margins (`margin-bottom: -53px`), or ghost sections in `order`.

### Layer 5: Automated Quality Gate CI Guards (`tests/`)
- **Single Responsibility:** Automated verification blocking any commit or push that violates the architectural contract.
- **Automated Anti-Regression Rules (Hard Enforcement in `tests/static/json-schema-validator.cjs`):**
  1. **Rule 1 (Prohibit Negative Margins):** Hard-error on any `margin-bottom: -...` in `custom_css`.
  2. **Rule 2 (Prohibit Ghost Sections):** Hard-error on any disabled section or section with all-disabled blocks in the template `order` array.
  3. **Rule 3 (Hero Geometry Standardization):** Hard-error if hero banner `content_padding != 40` or `content_max_width_inner != 680`.
- **Pre-Push Guarantee:** These automated quality gates run prior to every git push to `develop` and `main`. If any rule fails, the push is immediately halted.


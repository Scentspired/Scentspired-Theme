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

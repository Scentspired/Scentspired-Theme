# CSS Heading & Semantic Landmark Audit

## Overview
This document records all CSS rules across the Scentspired theme codebase that target heading element type selectors (`h1` through `h6`) directly rather than exclusively relying on utility classes or BEM naming.

Preserving awareness of these type selectors ensures that future template refactors and component additions do not inadvertently break computed visual styles or introduce heading hierarchy regressions.

---

## Active Type-Selector Contracts

| File & Line | CSS Selector | Scope & Impact | Status |
| :--- | :--- | :--- | :--- |
| `assets/quick-add.css:340` | `quick-add-modal .product__title > h1` | Hides the product page `<h1>` when rendered inside the quick-add modal dialog | Protected & Verified |
| `assets/quick-add.css:344` | `quick-add-modal .product__title > a` | Displays the product link inside quick-add modal dialog | Protected & Verified |
| `assets/customer.css:15` | `.customer > h1` | Top-level headings in customer auth templates (login, register) | Protected & Verified |
| `assets/customer.css:446` | `:is(.account, .order) h1` | Top-level heading typography on customer account & order pages | Protected & Verified |
| `assets/customer.css:461` | `.account h1 + a` | Log out link adjacent to customer account heading | Protected & Verified |
| `assets/customer.css:351` | `.login h3` | Sub-heading typography on login template | Protected & Verified |
| `assets/section-footer.css:267` | `.footer__localization h2` | Localization / currency picker heading in footer | Protected & Verified |
| `assets/section-bundle-builder.css:53` | `.sidebar-header h2` | Bundle builder sidebar heading | Protected & Verified |
| `assets/section-blog-typography.css:76-97` | `.blog-rte h2`, `.blog-rte h3`, `.blog-rte h4` | Editorial article content headings generated via rich text editor | Protected & Verified |
| `assets/component-totals.css:12` | `.totals > h2` | Cart subtotal & totals label | Protected & Verified |
| `sections/main-account.liquid:11` | `.customer.account h1, h2, h3` | Inline heading margin normalization in account dashboard | Protected & Verified |
| `sections/bundlescomingsoon.liquid:29` | `#coming-soon-overlay .coming-soon-heading, #coming-soon-overlay h1, #coming-soon-overlay h2` | Full-screen countdown overlay heading | Protected & Verified |

---

## Semantic HTML Architecture Rules

1. **Single Page H1**:
   - Each rendered page must contain exactly one visible, prominent `<h1>` that represents the primary topic of the page.
   - On the homepage: Shop title / branding in the header provides the H1 context.
   - On collection pages: `main-collection-banner` provides the collection title H1. Product grids and promotional banners must use `<h2>`.
   - On product pages: Product title provides the H1. Modals (size charts, ingredient popups) must use `<h2>`.
   - On customer account pages: A visually-hidden `<h1>Account</h1>` satisfies WCAG 2.1 Level A requirement while retaining custom visual layout.

2. **Landmark Uniqueness**:
   - `<main>` must appear only once in the DOM hierarchy (in `layout/theme.liquid`).
   - Do NOT nest `<main>` elements inside sections or snippets (e.g. `contact-section.liquid` uses `<div class="faq-main">`).
   - Implicit ARIA landmarks: Do not add redundant `role="main"` to `<main>` or `role="navigation"` to `<nav>`.

3. **Styling Independence**:
   - Never style headings based solely on element tag names (`h1`, `h2`) in new code.
   - Always use utility classes (`.h1`, `.h2`, `.h3`, etc.) or dedicated BEM class names so semantic tags can be adjusted without visual regressions.

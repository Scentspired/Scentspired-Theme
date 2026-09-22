# Scentspired Technical Backlog & Discussion Items (TODO)

This document tracks identified architectural mismatches, regional divergence points, and open discussion items to review and align with the team.

---

## 1. UK Free Shipping Threshold vs Cart Drawer Tier Mismatch

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - `snippets/cart-drawer.liquid` dynamically detects storefront region via currency/domain checks:
    - **UK (`is_uk`):** Threshold is `3500` cents (£35.00), default shipping cost `395` cents (£3.95), currency symbol `'£'`.
    - **UAE (`is_uae`):** Threshold is `15000` cents (150 AED), default shipping cost `2500` cents (25 AED), currency symbol `'AED '`.
    - **USA (`is_usa`):** Threshold is `7000` cents ($70.00), default shipping cost `799` cents ($7.99), currency symbol `'$'`.
  - All static HTML tier markers (`Below {{ curr_sym }}{{ shipping_threshold_amount }}`, `{{ curr_sym }}{{ shipping_cost_amount }} Shipping`, etc.) and dynamic JavaScript calculations (`freeShippingThreshold`, `defaultShippingCost`, `currSym`) are 100% synchronized with the announcement bar.

---

## 2. Geo-Redirect Bot/Crawler Detection (SEO Preservation)

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - Bot and crawler detection regex (`/bot|googlebot|crawler|spider|crawling|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|lighthouse|chrome-lighthouse|speed|insights|headless/i.test(ua)`) as well as `navigator.webdriver` checks are standardized in `layout/theme.liquid` across the core theme engine and all regional targets.
  - Geo-redirects execute asynchronously on idle (`requestIdleCallback`) only for real users, ensuring search engine bots index regional domains accurately without disruption.

## 3. Brand Name Two-Font Typography Identity ("Scent" + "spired")

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - Researched original reference implementations across regional blocks (e.g. `blocks/blog--luxury-perfume-banner-v3.liquid`, `blocks/blog--split-editorial-text-v2.liquid`, `blocks/blog--split-editorial-text.liquid`).
  - Font pairing and typographic rules:
    - **"Scent":** `'PP Editorial New', Georgia, serif`, upright normal style (`font-style: normal; font-weight: 500` / `600`).
    - **"spired":** `'PPEditorialNew Ultralight Italic'` / `'PPEditorialNew Italic'`, italic style (`font-style: italic; font-weight: 400`).
    - Visually renders as one seamless brand name word where only "spired" is italicized.
  - Implemented design tokens in `snippets/theme-design-tokens.liquid`:
    - `--font-family-brand-scent: 'PP Editorial New', Georgia, serif;`
    - `--font-family-brand-spired: 'PPEditorialNew Ultralight Italic', 'PPEditorialNew Italic', Georgia, serif;`
    - Global utility classes `.scentspired-brand-text` and `.brand-name-two-fonts`.
  - Created reusable modular component `snippets/brand-name.liquid` with configurable tag, link, and class attributes.
  - Applied two-font brand composition to `snippets/header-logo.liquid`, `sections/header.liquid` (text logo fallbacks on desktop & mobile), and `sections/footer.liquid` (fallback brand watermark).
  - All test layers passed with 0 errors and 0 warnings. Testing remains toggled off in `tests/config/test-settings.json` (Acceleration Mode).

## 4. Regional Deployment Policy: UAE Live Auto-Update Only & Permanent UK/USA Lockdown

- **Status:** ✅ RESOLVED & IMPLEMENTED
- **Resolution:**
  - **Strict UK/USA Zero-Push Lockdown:**
    - `Scentspired-UK` and `Scentspired-USA` are permanently locked down to read-only mirrors of production.
    - Push URLs in local git remotes are permanently set to `PUSH_DISABLED_READ_ONLY_MIRROR`.
    - Local Git pre-push hooks block all pushes to `main` and `develop`.
    - `engine/sync-regions.cjs` and `engine/sync-config.json` enforce hard-coded fatal error blocks (`exit 1`) immediately halting execution if any push to UK or USA is attempted.
  - **UAE Live Auto-Update Pipeline:**
    - `Scentspired-UAE` is designated as the sole authorized live deployment target.
    - `engine/sync-config.json` sets `defaultTarget: "uae"` and marks UAE with `"autoUpdate": true, "allowPush": true`.
    - Created GitHub Actions workflow `.github/workflows/auto-update-uae-live.yml` to automatically synchronize core updates from `Scentspired-Theme` to `Scentspired-UAE:main` upon verified releases.
    - Added local NPM shortcuts: `npm run sync:uae` (local sync), `npm run sync:uae:dry` (dry-run), and `npm run sync:uae:live` / `npm run deploy:uae`.
    - Configured `Scentspired-UAE` pre-push hook to authorize official theme engine sync pushes while blocking accidental manual terminal pushes.
  - Verified with `./lockdown-status.sh` (21/21 checks passed).

---


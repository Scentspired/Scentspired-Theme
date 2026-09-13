# Scentspired Technical Backlog & Discussion Items (TODO)

This document tracks identified architectural mismatches, regional divergence points, and open discussion items to review and align with the team.

---

## 1. UK Free Shipping Threshold vs Cart Drawer Tier Mismatch

- **Status:** PENDING DISCUSSION
- **Impact:** UK users see announcement bar promising free delivery over £35, but the cart drawer requires $70 (7000 cents, ~£55+) and displays $7.99 shipping.
- **Where Detected:**
  - `snippets/cart-drawer.liquid`:
    - **Line 1512**: `<p class="sp-free-shipping-text">Free Shipping over 70$</p>`
    - **Line 1542**: `<div class="sp-tier-items">Below $70</div>`
    - **Line 1543**: `<div class="sp-tier-discount">$7.99 Shipping</div>`
    - **Line 1546**: `<div class="sp-tier-items">$70+</div>`
    - **Line 1558**: `<span><strong>FREE</strong> shipping on orders over $70 | $7.99 shipping under $70</span>`
    - **Line 2275**: `if (subtotal >= 7000) { // $70 or more` — unlocks free shipping tier at 7000 cents
    - **Line 2285**: `if (subtotal > 0 && subtotal < 7000) { shipping = 799; }` — charges 799 shipping under 7000 cents
  - Contrast with `sections/announcement-bar.liquid`:
    - **UK Store text**: `"Free Delivery on Orders over £35 - Free Returns"`
- **Proposed Alignment to Discuss:**
  - For UK store (`scentspired.co.uk`), threshold should be `3500` cents (£35.00) and shipping charge under threshold should be UK shipping rate (e.g., `£3.95` or `£4.99`, rather than `$7.99`).
  - For USA store (`scentspired.com`), threshold remains `7000` cents ($70.00) and shipping is `$7.99`.

---

## 2. Geo-Redirect Bot/Crawler Detection (SEO Preservation)

- **Status:** PENDING DISCUSSION
- **Impact:** Search engine bots (Googlebot, Bingbot) visiting `scentspired.com` from UK IPs or visiting `scentspired.co.uk` from US IPs might get redirected, disrupting regional SEO indexing.
- **Where Detected:**
  - `Scentspired-UK/layout/theme.liquid` (**Lines 395-401**):
    ```javascript
    // Skip redirect for search engine crawlers so they can index scentspired.co.uk
    var ua = navigator.userAgent.toLowerCase();
    var isBot = /bot|googlebot|crawler|spider|crawling|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit/.test(ua);
    if (isBot) return;
    ```
  - `Scentspired-USA/layout/theme.liquid` (**Lines 404-417**):
    - Removed bot detection entirely during Shopify-side direct edits. Redirects immediately on `data.country === "GB"`.
- **Proposed Alignment to Discuss:**
  - Restore the user-agent crawler check to `Scentspired-USA` as well so that Googlebot / Bingbot crawling from UK/European datacenters can index the `.com` site without being forcibly redirected to `.co.uk`.

---

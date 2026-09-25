/**
 * Product card renderer for sections that build their grid in JavaScript
 * (best sellers, the scent filter banner).
 *
 * Contains NO markup. The card is defined once in
 * snippets/card--product-carousel.liquid, which also emits it as a <template>;
 * this clones it and fills the slots, so the markup is a one-file change.
 *
 *   grid.appendChild(ScentspiredCard.renderCarousel(product, options));
 */
window.ScentspiredCard = (function () {
  'use strict';


  /**
   * The storefront's currency symbol, published by layout/theme.liquid from
   * region data. Never hardcode it: one theme serves every region.
   */
  // The theme's one sale rule (layout/theme.liquid): Shopify's prices decide.
  function sale() {
    // Every page defines it; without it, show no sale rather than guess one.
    return window.ScentspiredSale || { showsWasPrice: () => false, badge: () => '' };
  }

  function currencySymbol() {
    return (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';
  }
  const set = (root, slot, fn) => {
    const el = root.querySelector(`[data-card-${slot}]`);
    if (el) fn(el);
  };

  /**
   * Tag -> badge. Each section previously carried its own copy of this
   * mapping, so a new badge meant editing every one. It lives here now.
   */
  const BADGES = [
    { tag: 'men', label: 'Men', modifier: 'badge-men' },
    { tag: 'women', label: 'Women', modifier: 'badge-women' },
    { tag: 'unisex', label: 'Unisex', modifier: 'badge-unisex' },
  ];

  function badgesFromTags(tagsString) {
    const tags = String(tagsString || '').toLowerCase().split(',').map(t => t.trim());
    const hit = BADGES.find(b => tags.includes(b.tag));
    return hit ? [{ label: hit.label, modifier: hit.modifier }] : [];
  }

  function renderBadges(container, badges) {
    container.textContent = '';
    (badges || []).forEach(b => {
      const span = document.createElement('span');
      span.className = 'product-badge' + (b.modifier ? ' ' + b.modifier : '');
      span.textContent = b.label;
      container.appendChild(span);
    });
  }

  /**
   * The carousel card. Same data contract, different class hooks — see
   * snippets/card--product-carousel.liquid for why the two are separate.
   *
   * Extra options:
   *   index        written to data-product-index (Video-banner1 reads it)
   *   formatMoney  formats compareAtPrice, which arrives in cents here
   */
  function renderCarousel(product, options) {
    const tpl = document.getElementById('card--product-carousel');
    if (!tpl) {
      console.warn('[card--product-carousel] template missing');
      return document.createDocumentFragment();
    }

    const opts = options || {};
    const node = tpl.content.firstElementChild.cloneNode(true);
    const variants = product.variants || [];

    // Match the original behaviour: prefer an in-stock variant, then any
    // available one, then simply the first.
    const chosen =
      variants.find(v => v.available && v.availableInventory > 0) ||
      variants.find(v => v.available) ||
      variants[0] || {};

    node.dataset.productId = product.id;
    if (opts.index != null) node.dataset.productIndex = opts.index;

    set(node, 'image-link', el => { el.href = product.url; });
    set(node, 'title-link', el => { el.href = product.url; });
    set(node, 'title', el => { el.textContent = product.title; });
    set(node, 'vendor', el => { el.textContent = product.vendor || ''; });

    set(node, 'image', el => {
      el.src = product.image || product.featured_image;
      el.alt = product.title;
    });
    set(node, 'hover-image', el => {
      if (product.hover_image) {
        el.src = product.hover_image;
        el.alt = product.title;
        el.hidden = false;
      } else {
        el.remove();
      }
    });

    set(node, 'badges', el => renderBadges(el, product.badges || badgesFromTags(product.tags)));

    const price = node.querySelector('[data-price-display]');
    if (price) price.textContent = chosen.price != null ? chosen.price : '';

    const hasDiscount = sale().showsWasPrice(chosen.priceRaw, chosen.compareAtPrice);
    const badgeText = sale().badge(chosen.priceRaw, chosen.compareAtPrice);
    const compare = node.querySelector('[data-compare-at-price-display]');
    const badge = node.querySelector('[data-price-badge]');
    if (compare) {
      compare.textContent = opts.formatMoney
        ? opts.formatMoney(chosen.compareAtPrice)
        : currencySymbol() + (chosen.compareAtPrice / 100).toFixed(2);
      compare.style.display = hasDiscount ? 'inline' : 'none';
    }
    if (badge) {
      badge.textContent = badgeText;
      badge.style.display = badgeText ? 'inline' : 'none';
    }

    set(node, 'variants', el => {
      el.textContent = '';
      if (variants.length < 2) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      variants.forEach(v => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'variant-option-btn' + (v.availableInventory === 0 ? ' disabled' : '');
        btn.dataset.variantId = v.id;
        btn.dataset.variantPrice = v.price;
        btn.dataset.variantPriceRaw = v.priceRaw;
        btn.dataset.variantCompareAtPrice = v.compareAtPrice;
        btn.dataset.available = v.available;
        btn.dataset.inventory = v.availableInventory != null ? v.availableInventory : 0;
        btn.textContent = v.title;
        el.appendChild(btn);
      });
    });

    set(node, 'submit', el => { el.dataset.productTitle = product.title; });

    return node;
  }

  return { renderCarousel };
})();

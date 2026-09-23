/**
 * Product card renderer.
 *
 * Contains NO markup. The card is defined once in snippets/card--product.liquid
 * as a <template>; this clones it and fills the slots. That is what keeps the
 * card a one-file change: edit the template, every section follows.
 *
 *   const el = ScentspiredCard.render(product);
 *   grid.appendChild(el);
 *
 * `product` shape:
 *   id, url, title, vendor, featured_image, hover_image?, rating?,
 *   badges?: [{ label, modifier }],
 *   variants: [{ id, title, price, compareAtPrice, available }]
 */
window.ScentspiredCard = (function () {
  'use strict';


  /**
   * The storefront's currency symbol, published by layout/theme.liquid from
   * region data. Never hardcode it: one theme serves every region.
   */
  function currencySymbol() {
    return (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';
  }
  const TEMPLATE_ID = 'card--product';

  function template() {
    const el = document.getElementById(TEMPLATE_ID);
    if (!el) {
      // Rendering nothing is better than throwing: a section that forgot to
      // include the snippet degrades to an empty grid rather than a dead page.
      console.warn('[card--product] template missing — did the section render the snippet?');
      return null;
    }
    return el;
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

  function renderVariants(container, variants) {
    container.textContent = '';
    if (!variants || variants.length < 2) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    variants.forEach(v => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'variant-option-btn' + (v.available ? '' : ' disabled');
      btn.dataset.variantId = v.id;
      btn.dataset.variantPrice = v.price;
      btn.dataset.comparePrice = v.compareAtPrice || 0;
      btn.dataset.inventory = v.availableInventory != null ? v.availableInventory : 0;
      btn.dataset.available = v.available;
      btn.textContent = v.title;
      container.appendChild(btn);
    });
  }

  function render(product, options) {
    const tpl = template();
    if (!tpl) return document.createDocumentFragment();

    const opts = options || {};
    const node = tpl.content.firstElementChild.cloneNode(true);
    const first = (product.variants && product.variants[0]) || {};

    node.dataset.productId = product.id;

    set(node, 'image-link', el => { el.href = product.url; });
    set(node, 'title-link', el => { el.href = product.url; });
    set(node, 'title', el => { el.textContent = product.title; });
    set(node, 'vendor', el => { el.textContent = product.vendor || ''; });

    set(node, 'image', el => {
      el.src = product.featured_image;
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

    set(node, 'rating', el => {
      if (product.rating) {
        el.textContent = product.rating;
        el.hidden = false;
      } else {
        el.remove();
      }
    });

    const badges = product.badges || badgesFromTags(product.tags);
    set(node, 'badges', el => renderBadges(el, badges));
    set(node, 'variants', el => renderVariants(el, product.variants));

    const price = node.querySelector('[data-current-price]');
    if (price) price.textContent = first.price != null ? first.price : '';

    const onSale = Number(first.compareAtPrice) > 0;
    set(node, 'compare-price', el => {
      if (onSale) {
        el.textContent = opts.formatPrice ? opts.formatPrice(first.compareAtPrice) : first.compareAtPrice;
        el.hidden = false;
      } else {
        el.remove();
      }
    });
    set(node, 'sale-badge', el => { if (!onSale) el.remove(); else el.hidden = false; });

    // The form carried data-product-id in the original markup; some sections
    // read it from there rather than from the card root.
    set(node, 'form', el => { el.dataset.productId = product.id; });

    const idInput = node.querySelector('.selected-variant-id');
    if (idInput) idInput.value = first.id || '';

    set(node, 'submit', el => {
      el.dataset.allVariants = JSON.stringify(
        (product.variants || []).map(v => ({ available: v.available, id: v.id }))
      );
      // Sections differ in casing ("Add to Cart" vs "ADD TO CART"), which is
      // visible text, so it stays configurable rather than being unified.
      if (opts.cartLabel) el.textContent = opts.cartLabel;
      if (first.available === false) {
        el.classList.add('sold-out');
        el.textContent = 'Sold Out';
      }
    });

    return node;
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

    const hasDiscount = chosen.compareAtPrice && chosen.compareAtPrice > chosen.priceRaw;
    const compare = node.querySelector('[data-compare-at-price-display]');
    const badge = node.querySelector('[data-price-badge]');
    if (compare) {
      compare.textContent = opts.formatMoney
        ? opts.formatMoney(chosen.compareAtPrice)
        : currencySymbol() + (chosen.compareAtPrice / 100).toFixed(2);
      compare.style.display = hasDiscount ? 'inline' : 'none';
    }
    if (badge) badge.style.display = hasDiscount ? 'inline' : 'none';

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

  return { render, renderCarousel, badgesFromTags };
})();

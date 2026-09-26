/**
 * The product card's behaviour, loaded once by layout/theme.liquid.
 *
 * - renderCarousel(): the card for sections that build their grid in JavaScript
 *   (best sellers, the scent filter banner);
 * - every card form adds to cart without leaving the page (bindForms);
 * - sizes and sold-out for Liquid-rendered cards in a grid marked data-card-bind
 *   (search results, an article's related products).
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
  // Labels are the locale's (sections.product_card), written into the page head by
  // snippets/card--strings.liquid; read when first needed, after the page has parsed.
  const BADGES = [
    { tag: 'men', label: 'badgeMen', modifier: 'badge-men' },
    { tag: 'women', label: 'badgeWomen', modifier: 'badge-women' },
    { tag: 'unisex', label: 'badgeUnisex', modifier: 'badge-unisex' },
  ];
  let cardStrings = null;
  function cardString(key) {
    if (!cardStrings) {
      const el = document.getElementById('cardStrings');
      cardStrings = el ? JSON.parse(el.textContent) : {};
    }
    return cardStrings[key] || '';
  }

  function badgesFromTags(tagsString) {
    const tags = String(tagsString || '').toLowerCase().split(',').map(t => t.trim());
    const hit = BADGES.find(b => tags.includes(b.tag));
    return hit ? [{ label: cardString(hit.label), modifier: hit.modifier }] : [];
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

  /**
   * Choosing a size on a server-rendered card: the size is marked, the form
   * adds that variant, and the price, struck-through price and sale badge follow
   * it by the theme's one sale rule. Adding to cart is the layout's .item-form
   * handler (layout/theme.liquid).
   */
  function selectVariant(card, btn) {
    card.querySelectorAll('.variant-option-btn').forEach(b => b.classList.toggle('active', b === btn));
    const input = card.querySelector('.variant-id-input');
    if (input) input.value = btn.dataset.variantId;

    const price = Number(btn.dataset.variantPriceRaw);
    const compare = Number(btn.dataset.variantCompareAtPrice);
    const priceEl = card.querySelector('[data-price-display]');
    if (priceEl && btn.dataset.variantPrice) priceEl.textContent = btn.dataset.variantPrice;

    const compareEl = card.querySelector('[data-compare-at-price-display]');
    if (compareEl) {
      const shows = sale().showsWasPrice(price, compare);
      compareEl.textContent = shows ? currencySymbol() + (compare / 100).toFixed(2) : '';
      compareEl.style.display = shows ? 'inline' : 'none';
    }
    const badgeEl = card.querySelector('[data-price-badge]');
    if (badgeEl) {
      const text = sale().badge(price, compare);
      badgeEl.textContent = text;
      badgeEl.style.display = text ? 'inline' : 'none';
    }
  }

  /**
   * Add to cart from a card's form, then show the cart drawer with the new cart.
   */
  function addToCart(form) {
    const submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button');
    if (submitBtn) submitBtn.disabled = true;

    fetch('/cart/add.js', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error('Add to cart failed.');
        return res.json();
      })
      .then(() => {
        // Synchronize with the cart drawer (#sp-cart-drawer)
        if (typeof window.updateDossierCartUI === 'function' || typeof window.openDossierCart === 'function') {
          fetch('/cart.js')
            .then(res => res.json())
            .then(cartData => {
              if (typeof window.updateDossierCartUI === 'function') window.updateDossierCartUI(cartData);
              setTimeout(() => {
                if (typeof window.openDossierCart === 'function') window.openDossierCart();
              }, 100);
            })
            .catch(cartErr => console.error('Error fetching cart after add:', cartErr));
        } else {
          const cartBubble = document.getElementById('cart-icon-bubble');
          if (cartBubble) cartBubble.click();
        }
      })
      .catch(error => console.error('Error adding to cart:', error))
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  /** Every card form (.item-form) under root adds to cart without leaving the page. */
  function bindForms(root) {
    (root || document).querySelectorAll('.item-form').forEach(form => {
      if (form.dataset.addToCartBound) return;
      form.dataset.addToCartBound = 'true';
      form.addEventListener('submit', event => {
        event.preventDefault();
        addToCart(form);
      });
    });
  }

  /**
   * Behaviour for cards rendered by Liquid in a section with no script of its
   * own (search results, an article's related products): the first size that
   * can be bought is chosen, a card with none says sold out. Such a section
   * marks its grid data-card-bind; cards it adds later are bound by refresh().
   */
  function bind(root) {
    (root || document).querySelectorAll('[data-card-root]').forEach(card => {
      if (card.dataset.cardBound) return;
      card.dataset.cardBound = 'true';
      const buttons = [...card.querySelectorAll('.variant-option-btn')];
      buttons.forEach(btn =>
        btn.addEventListener('click', event => {
          event.preventDefault();
          if (btn.dataset.available === 'true') selectVariant(card, btn);
        })
      );
      if (!buttons.length) return;
      const first = buttons.find(b => b.dataset.available === 'true');
      if (first) {
        selectVariant(card, first);
      } else {
        const submit = card.querySelector('[data-card-submit]');
        if (submit) {
          submit.disabled = true;
          submit.classList.add('disabled');
          submit.textContent = (window.variantStrings && window.variantStrings.soldOut) || submit.textContent;
        }
      }
    });
  }

  /** After a section replaces its grid (filters, sorting): bind what is new. */
  function refresh(root) {
    bindForms(root);
    if (root && root.closest && root.closest('[data-card-bind]')) bind(root);
    (root || document).querySelectorAll('[data-card-bind]').forEach(bind);
  }

  document.addEventListener('DOMContentLoaded', () => refresh(document));

  return { renderCarousel, bind, bindForms, refresh };
})();

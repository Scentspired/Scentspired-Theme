/* The cart page's quantity changes and removals. Moved from sections/cart--items.liquid. */
  class CartManager {
    constructor() {
      this.debounceTimer = null;
      this.init();
    }

    init() {
      document.querySelectorAll('.cart-quantity').forEach(quantityInput => {
        const minusBtn = quantityInput.querySelector('button[name="minus"]');
        const plusBtn = quantityInput.querySelector('button[name="plus"]');
        const input = quantityInput.querySelector('.quantity__input');

        if (minusBtn && input) {
          minusBtn.addEventListener('click', e => {
            e.preventDefault();
            this.decreaseQuantity(input);
          });
        }

        if (plusBtn && input) {
          plusBtn.addEventListener('click', e => {
            e.preventDefault();
            this.increaseQuantity(input);
          });
        }

        if (input) {
          input.addEventListener('change', () => this.updateCart(input));
          this.updateButtonStates(input);
        }
      });
    }

    decreaseQuantity(input) {
      if (!input) return;
      let value = parseInt(input.value) || 0;
      const min = parseInt(input.getAttribute('data-min')) || 0;
      const step = parseInt(input.getAttribute('step')) || 1;

      value = Math.max(min, value - step);
      input.value = value;
      this.updateButtonStates(input);
      this.updateCart(input);
    }

    increaseQuantity(input) {
      if (!input) return;
      let value = parseInt(input.value) || 0;
      const max = input.getAttribute('max') ? parseInt(input.getAttribute('max')) : null;
      const step = parseInt(input.getAttribute('step')) || 1;

      if (max === null || value + step <= max) {
        value += step;
        input.value = value;
        this.updateButtonStates(input);
        this.updateCart(input);
      }
    }

    updateButtonStates(input) {
      if (!input) return;
      const quantityInput = input.closest('.cart-quantity');
      if (!quantityInput) return;
      const minusBtn = quantityInput.querySelector('button[name="minus"]');
      const plusBtn = quantityInput.querySelector('button[name="plus"]');

      const currentValue = parseInt(input.value) || 0;
      const min = parseInt(input.getAttribute('data-min')) || 0;
      const max = input.getAttribute('max') ? parseInt(input.getAttribute('max')) : null;

      if (minusBtn) minusBtn.disabled = currentValue <= min;
      if (plusBtn) plusBtn.disabled = max !== null && currentValue >= max;
    }

    updateCart(input) {
      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        const form = document.querySelector('form#cart');
        if (!form) return;

        const updates = {};
        document.querySelectorAll('.quantity__input').forEach(inp => {
          const varId = inp.getAttribute('data-quantity-variant-id');
          if (varId) updates[varId] = parseInt(inp.value) || 0;
        });

        // Shopify renders the changed cart in the same request (Section Rendering
        // API): the rows, the totals, the header's cart icon and the screen-reader
        // summary, each in the store's own money format.
        const items = document.getElementById('main-cart-items');
        const footer = document.getElementById('main-cart-footer');
        const sections = [items && items.dataset.id, footer && footer.dataset.id, 'cart--icon-bubble', 'cart--live-region-text'].filter(Boolean);

        const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        fetch(rootUrl + 'cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ updates, sections, sections_url: window.location.pathname }),
        })
          .then(response => {
            if (!response.ok) throw new Error(`cart/update.js ${response.status}`);
            return response.json();
          })
          .then(cart => this.render(cart, input && input.id))
          .catch(error => console.error('Error updating cart:', error));
      }, 500);
    }

    render(cart, focusId) {
      const rendered = id => cart.sections && cart.sections[id] ? new DOMParser().parseFromString(cart.sections[id], 'text/html') : null;

      ['main-cart-items', 'main-cart-footer'].forEach(regionId => {
        const region = document.getElementById(regionId);
        const html = region && rendered(region.dataset.id);
        const fresh = html && html.querySelector(`#${regionId} .js-contents`);
        const stale = region && region.querySelector('.js-contents');
        if (fresh && stale) stale.innerHTML = fresh.innerHTML;
        const wrapper = region && region.closest('cart-items, .gradient');
        if (wrapper) wrapper.classList.toggle('is-empty', cart.item_count === 0);
      });

      const icon = rendered('cart--icon-bubble');
      const iconContent = icon && icon.querySelector('.shopify-section');
      if (iconContent) document.querySelectorAll('#cart-icon-bubble').forEach(el => (el.innerHTML = iconContent.innerHTML));

      const summary = rendered('cart--live-region-text');
      const summaryContent = summary && summary.querySelector('.shopify-section');
      const liveRegion = document.getElementById('cart-live-region-text');
      if (summaryContent && liveRegion) liveRegion.textContent = summaryContent.textContent.trim();

      if (typeof window.updateDossierCartUI === 'function') window.updateDossierCartUI(cart);

      this.init();
      const focus = focusId && document.getElementById(focusId);
      if (focus) focus.focus();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new CartManager();
  });

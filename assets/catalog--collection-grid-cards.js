/* The collection grid's cards: quantities already in the cart, sold out and add to cart. Wording from #collectionGridStrings. Moved from sections/catalog--collection-grid.liquid. */
  document.addEventListener('DOMContentLoaded', () => {
    const gridStrings = JSON.parse((document.getElementById('collectionGridStrings') || {}).textContent || '{}');
    const currSym = (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';
    let cartQuantities = {};
    let cartFetchInProgress = false;

    /* ================= CART FETCH (CACHED) ================= */
    async function fetchCartOnce() {
      if (cartFetchInProgress) return;
      cartFetchInProgress = true;

      try {
        const res = await fetch('/cart.js');
        const cart = await res.json();
        cartQuantities = {};
        cart.items.forEach(item => {
          cartQuantities[item.variant_id] = item.quantity;
        });
      } catch (e) {
        console.error('Cart fetch failed', e);
      } finally {
        cartFetchInProgress = false;
      }
    }

    /* ================= VARIANT AVAILABILITY ================= */
    function isAvailable(btn) {
      const variantId = btn.dataset.variantId;
      const inventory = parseInt(btn.dataset.inventory || 0);
      const inCart = cartQuantities[variantId] || 0;
      const shopifyAvailable = btn.dataset.available === 'true';

      return shopifyAvailable && inventory > inCart;
    }

    /* ================= UPDATE VARIANTS ================= */
    function updateVariants() {
      document.querySelectorAll('.fragrance-item').forEach(card => {
        const buttons = card.querySelectorAll('.variant-option-btn');
        const priceEl = card.querySelector('[data-price-display]');
        const compareAtPriceEl = card.querySelector('[data-compare-at-price-display]');
        const priceBadgeEl = card.querySelector('[data-price-badge]');
        const input = card.querySelector('.variant-id-input');
        const addBtn = card.querySelector('.cart-button');

        let firstAvailable = null;
        let activeValid = false;

        buttons.forEach(btn => {
          const available = isAvailable(btn);

          btn.disabled = !available;
          btn.style.cursor = available ? 'pointer' : 'not-allowed';
          btn.style.opacity = available ? '1' : '0.5';
          btn.style.textDecoration = available ? 'none' : 'line-through';

          if (!available) btn.classList.remove('active');

          if (available && !firstAvailable) firstAvailable = btn;
          if (btn.classList.contains('active') && available) activeValid = true;
        });

        if (!activeValid && firstAvailable) {
          buttons.forEach(b => b.classList.remove('active'));
          firstAvailable.classList.add('active');
          if (input) input.value = firstAvailable.dataset.variantId;
          if (priceEl) priceEl.textContent = currSym + (firstAvailable.dataset.variantPriceRaw / 100).toFixed(2);

          // Update compare_at_price
          const compareAtPrice = firstAvailable.dataset.variantCompareAtPrice;
          const currentPrice = parseInt(firstAvailable.dataset.variantPriceRaw);

          // The theme's one sale rule (layout/theme.liquid).
          const showsWasPrice = window.ScentspiredSale.showsWasPrice(currentPrice, compareAtPrice);
          const saleBadgeText = window.ScentspiredSale.badge(currentPrice, compareAtPrice);
          if (compareAtPriceEl) {
            if (showsWasPrice) compareAtPriceEl.textContent = currSym + (parseInt(compareAtPrice) / 100).toFixed(2);
            compareAtPriceEl.style.display = showsWasPrice ? 'inline' : 'none';
          }
          if (priceBadgeEl) {
            priceBadgeEl.textContent = saleBadgeText;
            priceBadgeEl.style.display = saleBadgeText ? 'inline' : 'none';
          }
        }

        if (addBtn) {
          addBtn.disabled = !firstAvailable;

          const textEl = addBtn.querySelector('.btn-text') || addBtn;
          if (textEl) {
            if (!firstAvailable) {
              textEl.textContent = gridStrings.soldOut;
              addBtn.style.cursor = 'not-allowed';
              addBtn.style.opacity = '0.6';
            } else {
              textEl.textContent = gridStrings.addToCart;
              addBtn.style.cursor = 'pointer';
              addBtn.style.opacity = '1';
            }
          }
        }
      });
    }

    /* ================= CLICK HANDLER ================= */
    document.addEventListener('click', async e => {
      const btn = e.target.closest('.variant-option-btn');
      if (!btn || btn.disabled) return;

      const card = btn.closest('.fragrance-item');
      if (!card) return;

      await fetchCartOnce();

      if (!isAvailable(btn)) return;

      card.querySelectorAll('.variant-option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const priceEl = card.querySelector('[data-price-display]');
      const compareAtPriceEl = card.querySelector('[data-compare-at-price-display]');
      const priceBadgeEl = card.querySelector('[data-price-badge]');
      const input = card.querySelector('.variant-id-input');

      if (input) input.value = btn.dataset.variantId;
      if (priceEl) priceEl.textContent = currSym + (btn.dataset.variantPriceRaw / 100).toFixed(2);

      // Update compare_at_price
      const compareAtPrice = btn.dataset.variantCompareAtPrice;
      const currentPrice = parseInt(btn.dataset.variantPriceRaw);

      // The theme's one sale rule (layout/theme.liquid).
      const showsWasPrice = window.ScentspiredSale.showsWasPrice(currentPrice, compareAtPrice);
      const saleBadgeText = window.ScentspiredSale.badge(currentPrice, compareAtPrice);
      if (compareAtPriceEl) {
        if (showsWasPrice) compareAtPriceEl.textContent = currSym + (parseInt(compareAtPrice) / 100).toFixed(2);
        compareAtPriceEl.style.display = showsWasPrice ? 'inline' : 'none';
      }
      if (priceBadgeEl) {
        priceBadgeEl.textContent = saleBadgeText;
        priceBadgeEl.style.display = saleBadgeText ? 'inline' : 'none';
      }
    });

    /* ================= CART UPDATED EVENT ================= */
    document.addEventListener('cart:updated', async () => {
      await fetchCartOnce();
      updateVariants();
    });

    /* ================= INITIAL LOAD ================= */
    (async () => {
      await fetchCartOnce();
      updateVariants();
    })();
  });

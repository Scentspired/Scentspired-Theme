/* The product page's size buttons. Moved from sections/catalog--product-custom.liquid. */
document.addEventListener('DOMContentLoaded', function () {
  const variantButtons = document.querySelectorAll('.ps-variant-btn');
  const variantIdInput = document.querySelector('.ps-variant-id-input');
  const priceContainer = document.querySelector('.ps-price-container');
  const priceEl = priceContainer?.querySelector('[data-price]');

  if (!variantButtons.length || !priceContainer || !priceEl) return;

  // Price update function
  function updatePriceUI(price, compare) {
    priceEl.textContent = currSym + (price / 100).toFixed(2);

    let compareEl = priceContainer.querySelector('[data-compare-price]');
    let badgeEl = priceContainer.querySelector('[data-sale-badge]');

    // The theme's one sale rule (layout/theme.liquid).
    const showsWasPrice = window.ScentspiredSale.showsWasPrice(price, compare);
    const saleBadgeText = window.ScentspiredSale.badge(price, compare);

    if (showsWasPrice) {
      if (!compareEl) {
        compareEl = document.createElement('span');
        compareEl.className = 'ps-original-price';
        compareEl.setAttribute('data-compare-price', '');
        priceEl.parentNode.insertBefore(compareEl, priceEl.nextSibling);
      }
      compareEl.textContent = currSym + (compare / 100).toFixed(2);
      compareEl.style.display = 'inline';
    } else if (compareEl) {
      compareEl.style.display = 'none';
    }

    if (saleBadgeText) {
      if (!badgeEl) {
        badgeEl = document.createElement('span');
        badgeEl.className = 'ps-price-badge';
        badgeEl.setAttribute('data-sale-badge', '');
        const after = compareEl || priceEl;
        after.parentNode.insertBefore(badgeEl, after.nextSibling);
      }
      badgeEl.textContent = saleBadgeText;
      badgeEl.style.display = 'inline-block';
    } else if (badgeEl) {
      badgeEl.style.display = 'none';
    }
  }

  // Variant selection function
  function selectVariant(btn) {
    variantButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    variantIdInput.value = btn.dataset.variantId;

    const price = parseInt(btn.dataset.variantPrice, 10);
    const compare = parseInt(btn.dataset.variantCompare, 10) || null;
    updatePriceUI(price, compare);

    // Optional: update inventory/quantity
    if (typeof updateInventoryState === 'function') {
      updateInventoryState(btn.dataset.variantId);
    }
  }

  // Disable unavailable variants
  variantButtons.forEach(btn => {
    if (btn.dataset.available === "false") {
      btn.classList.add('disabled');
      btn.style.cursor = 'not-allowed';
      btn.style.textDecoration = 'line-through';
    }
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('disabled')) selectVariant(btn);
    });
  });

  const firstAvailable =
    Array.from(variantButtons).find(btn => btn.dataset.available !== "false")
    || variantButtons[0];

  if (firstAvailable) selectVariant(firstAvailable);
});

/* The product page's quantity and add to cart. Wording from the card strings (snippets/card--strings.liquid). Moved from sections/catalog--product-custom.liquid. */
  var cardStrings = JSON.parse((document.getElementById('cardStrings') || {}).textContent || '{}');
document.addEventListener('DOMContentLoaded', async function () {

  const qtyDisplay = document.getElementById('psQuantityDisplay');
  const qtyInput = document.getElementById('psQuantityInput');
  const minusBtn = document.querySelector('.ps-qty-circle.ps-qty-minus');
  const plusBtn = document.querySelector('.ps-qty-circle.ps-qty-plus');
  const addBtn = document.querySelector('.ps-cart-btn');

  let maxQty = Infinity;

  async function getCartQtyForVariant(variantId) {
    const res = await fetch('/cart.js');
    if (!res.ok) return 0; // an error answer has no items (it threw reading .find)
    const cart = await res.json();
    const item = (cart.items || []).find(i => i.variant_id == variantId);
    return item ? item.quantity : 0;
  }

  async function updateInventoryState(variantId) {
    const btn = document.querySelector(`.ps-variant-btn[data-variant-id="${variantId}"]`);
    if (!btn) return;

    const inventory = parseInt(btn.dataset.inventory);
    const policy = btn.dataset.inventoryPolicy;
    const management = btn.dataset.inventoryManagement;

    if (!management || policy === 'continue') {
      maxQty = Infinity;
      enableQty();
      return;
    }

    const cartQty = await getCartQtyForVariant(variantId);
    const available = Math.max(0, inventory - cartQty);
    maxQty = available;

    if (available <= 0) {
      disableQty();
    } else {
      enableQty();
    }

    // Ensure quantity display never exceeds max
    const displayQty = Math.min(parseInt(qtyDisplay.textContent, 10) || 1, maxQty);
    qtyDisplay.textContent = displayQty;
    qtyInput.value = displayQty;
    
    // Check and update plus button state immediately after setting quantity
    checkPlusButtonState();
  }

  function disableQty() {
    plusBtn.disabled = true;
    minusBtn.disabled = true;
    addBtn.disabled = true;
    addBtn.textContent = cardStrings.soldOutUpper;
  }

  function enableQty() {
    plusBtn.disabled = false;
    minusBtn.disabled = false;
    addBtn.disabled = false;
    addBtn.textContent = cardStrings.addToCartUpper;
  }

  // Function to check and update plus button state
  function checkPlusButtonState() {
    const currentQty = parseInt(qtyDisplay.textContent, 10) || 1;
    if (currentQty >= maxQty) {
      plusBtn.disabled = true;
    } else {
      plusBtn.disabled = false;
    }
  }

  plusBtn.addEventListener('click', () => {
    let qty = parseInt(qtyDisplay.textContent);
    if (qty < maxQty) {
      qty++;
      qtyDisplay.textContent = qty;
      qtyInput.value = qty;
      
      // Check and update plus button state immediately
      checkPlusButtonState();
    }
  });

  minusBtn.addEventListener('click', () => {
    let qty = parseInt(qtyDisplay.textContent);
    if (qty > 1) {
      qty--;
      qtyDisplay.textContent = qty;
      qtyInput.value = qty;
      
      // Check and update plus button state immediately
      checkPlusButtonState();
    }
  });

  // Variant click
  document.querySelectorAll('.ps-variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const variantId = btn.dataset.variantId;
      updateInventoryState(variantId);
    });
  });

  // ===== Form Submission (Add to Cart) =====
  document.querySelectorAll('.ps-form').forEach(form => {
    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const submitBtn = form.querySelector('.ps-cart-btn');
      const variantIdInput = form.querySelector('input[name="id"]');
      const variantId = variantIdInput?.value;
      if (!variantId) { alert(cardStrings.selectVariant); return; }

      const qtyInputField = form.querySelector('input[name="quantity"]');
      const qty = parseInt(qtyInputField?.value, 10) || 1;

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.textContent = cardStrings.adding;

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: qty })
        });

        if (!res.ok) throw new Error(`cart/add.js ${res.status}`);
        const cart = await res.json();

        // 🔹 Immediately update inventory after adding
        await updateInventoryState(variantId);

        submitBtn.textContent = cardStrings.added;
        setTimeout(() => {
          submitBtn.textContent = cardStrings.addToCartUpper;
          isSubmitting = false;
        }, 1500);

        // 🔹 Open cart drawer
        if (window.theme?.cartNotification) {
          window.theme.cartNotification.renderContents().then(() => {
            window.theme.cartNotification.open();
          }).catch(console.log);
        }

      } catch (err) {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.textContent = cardStrings.addToCartUpper;
        isSubmitting = false;
      }
    });
  });

  // ===== Listen for cart updates (removal from cart) =====
  setInterval(async () => {
    const activeVariant = document.querySelector('.ps-variant-btn.active');
    if (activeVariant) {
      const variantId = activeVariant.dataset.variantId;
      await updateInventoryState(variantId);
    }
  }, 1000); // every second, adjust inventory

  // Initial load
  const activeVariant = document.querySelector('.ps-variant-btn.active') || document.querySelector('.ps-variant-btn');
  if (activeVariant) await updateInventoryState(activeVariant.dataset.variantId);

});

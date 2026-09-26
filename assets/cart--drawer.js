/* The cart drawer. Wording from #cartDrawerStrings, box handles from #cartDrawerData. Moved from snippets/cart--drawer.liquid. */
  // var, not const: several sections declare this and a top-level const is a
  // global lexical binding, so the second one on the page throws and takes the
  // rest of its script with it.
  var currSym = (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';
// Global variables
let isProcessingCartAction = false; // Added flag to prevent duplicate submissions
const cartDrawerStrings = JSON.parse((document.getElementById('cartDrawerStrings') || {}).textContent || '{}');
const cartDrawerBoxHandles = JSON.parse((document.getElementById('cartDrawerData') || {}).textContent || '{}').boxProductHandles || [];

// Helper function to generate HTML for a single cart item
function generateCartItemHtml(item) {
  const originalPricePerItem = item.original_price;
  const totalDiscountedLinePrice = originalPricePerItem * item.quantity;

  const vendor = item.vendor || '';

  return `
    <div class="sp-product-item" data-key="${item.key}" data-variant-id="${item.variant_id}" data-inventory="${item.variant_inventory_quantity || 999}">
      <div class="sp-product-image-container">
        <img
          src="${item.image.replace(/(\.[^.]*)$/, '_200x$1')}"
          alt="${item.title}"
          class="sp-product-image"
          loading="lazy"
          width="80"
          height="100">
      </div>

      <div class="sp-product-details">
           <div class="sp-product-header">
  <h3 class="sp-product-title">
    ${
      // A box's line is not linked (its product is not a page to visit)
      !cartDrawerBoxHandles.includes(item.handle)
        ? `<a href="${item.url}" style="text-decoration: none; color: inherit;">
            ${item.title.toUpperCase()}
          </a>`
        : item.title.toUpperCase()
    }
  </h3>
  <div class="sp-product-pricing">
    <span class="sp-discounted-price">
      ${currSym}<span class="price-value"
        data-single-price="${(originalPricePerItem / 100).toFixed(2)}"
        data-original-single="${(originalPricePerItem / 100).toFixed(2)}"
        data-discount="0">${(totalDiscountedLinePrice / 100).toFixed(2)}
      </span>
    </span>
  </div>
</div>

        <div class="sp-product-vendor">${vendor}</div>

        <!-- quantity and remove buttons -->
        <div class="sp-product-actions">
                  <div class="sp-quantity-section">
                      <button class="sp-qty-decrease">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                      </button>
                      <span class="sp-quantity-display" data-quantity="${item.quantity}">${item.quantity}</span>
                      <button class="sp-qty-increase">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 3v8M3 7h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>

          <button class="sp-remove-product" data-key="${item.key}" onclick="removeDossierCartItem(this.dataset.key)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m3 0v10.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 15V4.5h12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Main function to update the entire cart UI based on new cart data
function updateDossierCartUI(cart) {
  const emptyCartContainer = document.getElementById('sp-empty-cart-full-container');
  const fullCartSections = document.getElementById('sp-full-cart-sections');
  const cartItemsList = document.getElementById('sp-cart-items-list');

  if (cart.item_count === 0) {
    if (emptyCartContainer) emptyCartContainer.style.display = 'flex';
    if (fullCartSections) fullCartSections.style.display = 'none';
  } else {
    if (emptyCartContainer) emptyCartContainer.style.display = 'none';
    if (fullCartSections) fullCartSections.style.display = 'block';

    // Re-render cart items
    let itemsHtml = '';
    
    cart.items.forEach(item => {
      itemsHtml += generateCartItemHtml(item);
    });



   if (cartItemsList) {
  cartItemsList.innerHTML = itemsHtml;

  // Add click listeners for qty buttons
cart.items.forEach(item => {
  const itemEl = document.querySelector(`[data-key="${item.key}"]`);
  if (!itemEl) return;

  const plusBtn = itemEl.querySelector('.sp-qty-increase');
  const minusBtn = itemEl.querySelector('.sp-qty-decrease');

  if (plusBtn) {
    plusBtn.onclick = async () => {
      const quantityEl = itemEl.querySelector('.sp-quantity-display');
      let currentQty = parseInt(quantityEl?.textContent || '0', 10);
      const maxQty = item.variant_inventory_quantity;

      if (item.variant_inventory_policy === 'deny' && currentQty >= maxQty) {
        showCartDrawerMessage(cartDrawerStrings.quantityLimit.replace('[quantity]', () => maxQty));
        return; // stop
      }

      // Disable button instantly for better UX
      plusBtn.disabled = true;
      plusBtn.classList.add('sp-qty-disabled');
      plusBtn.style.pointerEvents = 'none';
      plusBtn.style.cursor = 'not-allowed';

      await updateDossierItemQuantity(item.key, currentQty + 1);
    };
  }

  if (minusBtn) {
    minusBtn.onclick = async () => {
      const quantityEl = itemEl.querySelector('.sp-quantity-display');
      let currentQty = parseInt(quantityEl?.textContent || '0', 10);

      if (currentQty <= 1) return; // stop at 1

      // Disable button instantly for better UX
      minusBtn.disabled = true;
      minusBtn.classList.add('sp-qty-disabled');
      minusBtn.style.pointerEvents = 'none';

      await updateDossierItemQuantity(item.key, currentQty - 1);
    };
  }
});

  // CRITICAL: Enforce inventory limits AFTER event listeners are attached
  // This will properly disable buttons that are at max quantity
  enforceInventoryButtons(cart);
}

}

  // Update global cart count

// Update global cart count - FIXED FOR MULTIPLE CART ICONS
// Update global cart count - FIXED FOR EMPTY CART
const cartIconBubbles = document.querySelectorAll('#cart-icon-bubble');

cartIconBubbles.forEach(cartIcon => {
  if (cart.item_count > 0) {
    // Check if cart-count-bubble already exists
    let cartCountBubble = cartIcon.querySelector('.cart-count-bubble');
    
    if (!cartCountBubble) {
      // Create the bubble if it doesn't exist (cart was empty)
      cartCountBubble = document.createElement('div');
      cartCountBubble.className = 'cart-count-bubble';
      
      const countSpan = document.createElement('span');
      countSpan.setAttribute('aria-hidden', 'true');
      countSpan.textContent = cart.item_count;
      
      const srSpan = document.createElement('span');
      srSpan.className = 'visually-hidden';
      srSpan.textContent = cartDrawerStrings.cartCount.replace('[count]', () => cart.item_count);
      
      cartCountBubble.appendChild(countSpan);
      cartCountBubble.appendChild(srSpan);
      cartIcon.appendChild(cartCountBubble);
    } else {
      // Update existing bubble
      const cartCountSpan = cartCountBubble.querySelector('span[aria-hidden="true"]');
      if (cartCountSpan) {
        cartCountSpan.textContent = cart.item_count;
      }
      
      const cartCountSR = cartCountBubble.querySelector('.visually-hidden');
      if (cartCountSR) {
        cartCountSR.textContent = cartDrawerStrings.cartCount.replace('[count]', () => cart.item_count);
      }
      
      cartCountBubble.style.display = 'block';
    }
  } else {
    // Remove or hide the bubble when cart is empty
    const cartCountBubble = cartIcon.querySelector('.cart-count-bubble');
    if (cartCountBubble) {
      cartCountBubble.remove();
    }
  }
});
function enforceInventoryButtons(cart) {
  if (!cart || !cart.items) return;

  cart.items.forEach(item => {
    const itemEl = document.querySelector(`[data-key="${item.key}"]`);
    if (!itemEl) return;

    const plusBtn = itemEl.querySelector('.sp-qty-increase');
    const minusBtn = itemEl.querySelector('.sp-qty-decrease');

    if (!plusBtn || !minusBtn) return;

    // Get inventory from HTML data attribute (set during page render)
    const inventory = parseInt(itemEl.getAttribute('data-inventory') || '999');

  // Disable + if quantity reaches max inventory using CSS class
  if (item.quantity >= inventory) {
  plusBtn.classList.add('sp-qty-disabled');
  plusBtn.disabled = true;
  } else {
  plusBtn.classList.remove('sp-qty-disabled');
  plusBtn.disabled = false;
  }

    // Disable - if quantity 1
    if (item.quantity <= 1) {
      minusBtn.disabled = true;
      minusBtn.style.opacity = '0.3';
      minusBtn.style.pointerEvents = 'none';
      minusBtn.style.cursor = 'not-allowed';
      minusBtn.setAttribute('title', cartDrawerStrings.minimumQuantity);
    } else {
      minusBtn.disabled = false;
      minusBtn.style.opacity = '1';
      minusBtn.style.pointerEvents = 'auto';
      minusBtn.style.cursor = 'pointer';
      minusBtn.removeAttribute('title');
    }
  });
}
  // Update all dynamic elements with a single fetch
  updateAllDossierDynamicElements(cart);
}

document.addEventListener('DOMContentLoaded', function() {
  // Initial UI update based on current cart state
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      updateDossierCartUI(cart);
    })
    .catch(error => console.error('Error fetching initial cart:', error));

  // Delay to ensure all other theme scripts have loaded before overriding
  setTimeout(function() {
    initializeDossierCartTriggers();
  }, 500); // Reduced delay, adjust if needed
});

// Dossier Cart Drawer Functions
function openDossierCart() {
  const drawer = document.getElementById('sp-cart-drawer');
  const overlay = document.getElementById('sp-cart-overlay');

  if (drawer) drawer.classList.add('sp-active');
  if (overlay) overlay.classList.add('sp-active');
  if (drawer || overlay) {
    document.body.style.overflow = 'hidden';

    // Update pricing when cart opens
    setTimeout(() => {
      fetch('/cart.js')
        .then(res => {
          if (!res.ok) throw new Error(`cart.js ${res.status}`);
          return res.json();
        })
        .then(cart => {
          updateAllDossierDynamicElements(cart);
        })
        .catch(err => console.error('Error updating pricing:', err));
    }, 100);
  }
}

function closeDossierCart() {
  const drawer = document.getElementById('sp-cart-drawer');
  const overlay = document.getElementById('sp-cart-overlay');

  if (drawer) drawer.classList.remove('sp-active');
  if (overlay) overlay.classList.remove('sp-active');
  document.body.style.overflow = '';
}
function showCartDrawerMessage(message) {
  const cartDrawer = document.getElementById('sp-cart-drawer');
  if (!cartDrawer) return alert(message); // fallback

  // Create message element
  const msgElem = document.createElement('div');
  msgElem.style.padding = '1rem';
  msgElem.style.background = '#ffe0e0';
  msgElem.style.color = '#900';
  msgElem.style.marginBottom = '1rem';
  msgElem.textContent = message;

  cartDrawer.querySelector('.sp-cart-items')?.prepend(msgElem); // prepend inside drawer
  openDossierCart();

  setTimeout(() => msgElem.remove(), 3000); // auto remove after 3s
}


// Function to scroll to order summary section
function scrollToOrderSummary() {
  const orderSummary = document.getElementById('sp-order-summary');
  if (orderSummary) {
    orderSummary.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// OPTIMIZED: Single function to update all dynamic elements with one fetch
function updateAllDossierDynamicElements(cart) {
  // Calculate totals once
  let totalItems = 0;
  let subtotal = 0;

  cart.items.forEach(item => {
    totalItems += item.quantity;
    subtotal += item.original_line_price;
  });

  // 1. Update Progress Lines
  const effectiveItems = Math.max(0, totalItems - 2);
  const progressLines = document.querySelectorAll('.sp-progress-line');
  progressLines.forEach((line, index) => {
    if (index < effectiveItems) {
      line.classList.add('sp-active');
    } else {
      line.classList.remove('sp-active');
    }
  });

  // 2. Update Bundle Tier
  const tiers = document.querySelectorAll('.sp-tier');
  tiers.forEach(tier => tier.classList.remove('sp-tier-active'));

  const freeShippingThreshold = (window.__STORE_CONFIG && window.__STORE_CONFIG.freeShippingThreshold) || 0;
  const flatShippingCost = (window.__STORE_CONFIG && window.__STORE_CONFIG.shippingCost) || 0;

  if (subtotal >= freeShippingThreshold) { // region's free-shipping threshold
    const tier2 = document.querySelector('[data-items="2"]');
    if (tier2) tier2.classList.add('sp-tier-active');
  } else { // below it
    const tier1 = document.querySelector('[data-items="1"]');
    if (tier1) tier1.classList.add('sp-tier-active');
  }

  // 3. Update Pricing Display
  let shipping = 0;
  if (subtotal < freeShippingThreshold) {
    shipping = flatShippingCost;
  } else {
    shipping = 0; // FREE
  }

  const finalTotal = subtotal + shipping;
  const checkoutTotal = document.getElementById('checkout-total');
  if (checkoutTotal) {
    checkoutTotal.textContent = `${currSym}${(finalTotal / 100).toFixed(2)}`;
  }

  // Update order summary
  updateOrderSummary(subtotal, shipping);
}

// Update order summary - No Discounts
function updateOrderSummary(subtotal, shipping) {
  // Show initial price (no discounts)
  const initialPrice = document.getElementById('summary-initial-price');
  if (initialPrice) {
    initialPrice.textContent = `${currSym}${(subtotal / 100).toFixed(2)}`;
  }

  // Update shipping UI
  const shippingCost = document.getElementById('sp-shipping-cost');
  if (shippingCost) {
    shippingCost.textContent = shipping === 0
      ? cartDrawerStrings.free
      : `${currSym}${(shipping / 100).toFixed(2)}`;
  }

  // Hide discount lines since there are no discounts
  const memberDiscountLine = document.getElementById('member-discount-line');
  if (memberDiscountLine) {
    memberDiscountLine.style.display = 'none';
  }

  // Hide discount notice
  const discountNotice = document.getElementById('discount-notice');
  if (discountNotice) {
    discountNotice.style.display = 'none';
  }
}



async function updateDossierItemQuantity(key, newQuantity) {
  if (isProcessingCartAction) return;
  isProcessingCartAction = true;

  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: newQuantity })
    });

    const cart = await fetch('/cart.js').then(r => r.json());
    
    // Find the item element and its inventory
    const itemEl = document.querySelector(`[data-key="${key}"]`);
    if (itemEl) {
      const cartItem = cart.items.find(item => item.key === key);
      const inventory = parseInt(itemEl.getAttribute('data-inventory') || '999', 10);
      const plusBtn = itemEl.querySelector('.sp-qty-increase');
      
      if (plusBtn) {
        if (cartItem && cartItem.quantity >= inventory) {
          plusBtn.classList.add('sp-qty-disabled');
          plusBtn.disabled = true;
        } else {
          plusBtn.classList.remove('sp-qty-disabled');
          plusBtn.disabled = false;
        }
      }
    }
    
    // Update the full UI - this will call enforceInventoryButtons
    updateDossierCartUI(cart);

  } catch (err) {
    console.error(err);
  }

  isProcessingCartAction = false;
}



function removeDossierCartItem(key) {
  if (isProcessingCartAction) {
    console.warn('Cart action already in progress');
    return;
  }

  isProcessingCartAction = true;

  // Remove item from UI immediately
  const productItem = document.querySelector(`[data-key="${key}"]`);
  if (productItem) {
    productItem.style.opacity = '0.5';
    productItem.style.pointerEvents = 'none';
  }

  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: key,
      quantity: 0
    })
  })
  .then(response => response.json())
  .then(cart => {
    // Remove item from DOM
    if (productItem) {
      productItem.remove();
    }

    // Update all prices and UI
    updateDossierCartUI(cart); // Use the new comprehensive update function

    // If cart is now empty, reload to fully reset to the empty state (optional, but ensures Liquid re-eval)
    if (cart.item_count === 0) {
      location.reload();
    }
  })
  .catch(error => {
    console.error('Error removing item:', error);
    // Revert UI changes on error
    if (productItem) {
      productItem.style.opacity = '1';
      productItem.style.pointerEvents = 'auto';
    }
  })
  .finally(() => {
    isProcessingCartAction = false;
  });
}

function addDossierRecommended(variantId, productTitle, productImage, productPrice, originalPrice) {
  if (isProcessingCartAction) {
    console.warn('Cart action already in progress');
    return;
  }

  // Convert variantId to number if it's a string (variant IDs are numeric)
  const numericVariantId = parseInt(variantId, 10);
  if (isNaN(numericVariantId)) {
    console.error('Invalid variant ID:', variantId);
    alert(cartDrawerStrings.addUnavailable);
    return;
  }

  isProcessingCartAction = true;

  // Add the product to cart
  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: numericVariantId,
      quantity: 1
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("[v0] Product added successfully:", productTitle);
    // Update UI and open drawer, no page reload
    fetch('/cart.js') // Fetch latest cart state
      .then(res => res.json())
      .then(cart => {
        console.log("[v0] Cart updated, item count:", cart.item_count);
        updateDossierCartUI(cart); // Update all UI elements
        openDossierCart(); // Ensure drawer is open
      });
  })
  .catch(error => {
    console.error('Error adding recommended product to cart:', error);

    // Show error feedback
    const button = document.querySelector(`button[onclick*="${variantId}"]`);
    if (button) {
      const originalText = button.textContent;
      button.textContent = cartDrawerStrings.error;
      button.style.background = '#f44336';
      button.style.color = 'white';
      button.style.borderColor = '#f44336';

      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.style.color = '';
        button.style.borderColor = '';
      }, 1500);
    }
  })
  .finally(() => {
    isProcessingCartAction = false;
  });
}



function proceedToDossierCheckout() {
  window.location.href = `${window.Shopify.routes.root}checkout`;
}

function initializeDossierCartTriggers() {
  if (window.spCartTriggersInitialized) {
    return;
  }
  window.spCartTriggersInitialized = true;

  // Find all possible cart triggers
  const cartSelectors = [
    'a[href="/cart"]',
    'a[href*="/cart"]',
    '.cart-icon',
    '.cart-link',
    '.header-cart',
    '.cart-toggle',
    '.js-cart-trigger',
    '[data-cart-trigger]',
    '.cart-count-bubble',
    '.site-header__cart',
    '.header__icon--cart',
    '.cart-drawer-toggle',
    '.header-cart-link',
    '.cart-icon-wrapper'
  ];

  cartSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (!element.hasAttribute('data-sp-listener')) {
        element.setAttribute('data-sp-listener', 'true');

        // Add click handler to open the drawer
        element.addEventListener('click', function(e) {
          e.preventDefault(); // Prevent default navigation to cart page
          e.stopPropagation();
          e.stopImmediatePropagation(); // Stop other listeners on this element
          openDossierCart();
          return false; // Ensure no further action
        }, true); // Use capture phase to ensure it runs before other handlers
      }
    });
  });

  const cartForms = document.querySelectorAll('form[action="/cart/add"], form[action*="/cart/add"]');
  cartForms.forEach(form => {
    if (!form.hasAttribute('data-sp-form-listener')) {
      form.setAttribute('data-sp-form-listener', 'true');
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if (isProcessingCartAction) {
          console.warn('Form submission already in progress');
          return;
        }
        
        isProcessingCartAction = true;
        
        const formData = new FormData(this);
        const variantId = formData.get('id');
        const quantity = parseInt(formData.get('quantity')) || 1;
        
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: variantId,
            quantity: quantity
          })
        })
        .then(response => {
          if (!response.ok) throw new Error(`cart/add.js ${response.status}`);
          return response.json();
        })
        .then(data => {
          fetch('/cart.js')
            .then(res => {
              if (!res.ok) throw new Error(`cart.js ${res.status}`);
              return res.json();
            })
            .then(cart => {
              updateDossierCartUI(cart);
              openDossierCart();
            })
            .catch(cartError => console.error('Error fetching cart after add:', cartError));
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          alert(cartDrawerStrings.addFailed);
        })
        .finally(() => {
          isProcessingCartAction = false;
        });
      }, true);
    }
  });
}

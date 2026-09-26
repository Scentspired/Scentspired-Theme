/* The best sellers carousel: pages, sizes, stock and add to cart. Products from #bestSellersProducts-<section id> (its script tag's data-section-id), wording from the card strings. Moved from sections/catalog--best-sellers.liquid. */
  var cardStrings = JSON.parse((document.getElementById('cardStrings') || {}).textContent || '{}');
  var bestSellersSectionId = document.currentScript.dataset.sectionId;
let allProducts = [];
let currentIndex = 0;
let totalProducts = 0;
let totalPages = 0;
let isMobile = window.innerWidth <= 800;

// Determine products per page
function getPerPage() {
  return isMobile ? 1 : 2;
}

// Format price to currency. The symbol comes from the region resolved at build
// time — hardcoding it shipped pound signs to every storefront.
function formatPrice(priceInCents) {
  const currSym = (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';
  return currSym + (priceInCents / 100).toFixed(2);
}

document.addEventListener('DOMContentLoaded', function () {
  allProducts = JSON.parse((document.getElementById('bestSellersProducts-' + bestSellersSectionId) || {}).textContent || '[]');

  totalProducts = allProducts.length;
  updatePageCalculation();
  updateProductsDisplay();
  document.getElementById('totalPages').textContent = totalPages;

  updateVariantAvailability();
  setInterval(updateVariantAvailability, 2000);

  // Handle window resize for mobile / desktop
  window.addEventListener('resize', function () {
    const prevState = isMobile;
    isMobile = window.innerWidth <= 800;
    if (prevState !== isMobile) {
      currentIndex = 0;
      updatePageCalculation();
      updateProductsDisplay();
      document.getElementById('totalPages').textContent = totalPages;
      document.getElementById('currentPage').textContent = 1;
      updateVariantAvailability();
    }
  });
});

// Calculate total pages
function updatePageCalculation() {
  totalPages = Math.ceil(totalProducts / getPerPage());
}

// Navigate products
function navigateProducts(direction) {
  const perPage = getPerPage();
  currentIndex += direction * perPage;

  if (currentIndex >= totalProducts) currentIndex = 0;
  if (currentIndex < 0) {
    currentIndex = Math.floor((totalProducts - 1) / perPage) * perPage;
  }

  updateProductsDisplay();
  document.getElementById('currentPage').textContent =
    Math.floor(currentIndex / perPage) + 1;
}

// Get product badges
function updateVariantAvailability() {
  fetch('/cart.js')
    .then(res => res.json())
    .then(cartData => {
      const variantQtyMap = {};
      cartData.items.forEach(item => {
        variantQtyMap[item.variant_id] = item.quantity;
      });

      document.querySelectorAll('.variant-option-btn').forEach(btn => {
        const variantId = parseInt(btn.dataset.variantId);
        const inventory = parseInt(btn.dataset.inventory) || 0;
        const cartQty = variantQtyMap[variantId] || 0;

        const available = btn.dataset.available === 'true';
        // Stop the shopper exceeding stock, but only where stock is tracked:
        // inventory 0 also means "not tracked", and those variants are buyable.
        const tracked = inventory > 0;
        if (!available || (tracked && inventory <= cartQty)) {
          btn.classList.add('disabled');
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.classList.remove('disabled');
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });

      // Update cart buttons based on available variants
      document.querySelectorAll('.item-form').forEach(form => {
        const productCard = form.closest('.fragrance-item');
        const cartBtn = form.querySelector('.cart-button');
        const availableVariants = productCard.querySelectorAll('.variant-option-btn:not(.disabled)');
        
        if (availableVariants.length === 0) {
          cartBtn.classList.add('sold-out');
          cartBtn.innerText = cardStrings.soldOut;
          cartBtn.disabled = true;
          cartBtn.style.pointerEvents = 'none';
        } else {
          cartBtn.classList.remove('sold-out');
          cartBtn.innerText = cardStrings.addToCart;
          cartBtn.disabled = false;
          cartBtn.style.pointerEvents = 'auto';
        }
      });
    })
    .catch(err => console.warn('Cart fetch error:', err));
}

// Render products in grid
function updateProductsDisplay() {
  const grid = document.getElementById('productsGrid');
  const perPage = getPerPage();
  const productsToShow = allProducts.slice(currentIndex, currentIndex + perPage);

  // Card markup lives in snippets/card--product-carousel.liquid, the same card
  // every other section renders. This section supplies
  // data only, so a card change is a one-file change there.
  grid.innerHTML = '';
  productsToShow.forEach(product => {
    grid.appendChild(ScentspiredCard.renderCarousel(product, { formatPrice: formatPrice }));
  });

  // Auto-select first AVAILABLE variant per product
  grid.querySelectorAll('.fragrance-item').forEach(card => {
    const variantBtns = card.querySelectorAll('.variant-option-btn');
    const idInput = card.querySelector('.variant-id-input');
    const priceDisplay = card.querySelector('[data-price-display]');
    const cartBtn = card.querySelector('.cart-button');

    let firstAvailableBtn = null;
    let hasAnyAvailable = false;

    variantBtns.forEach(btn => {
      const available = btn.dataset.available === 'true';
      const inventory = parseInt(btn.dataset.inventory) || 0;
      
      // available is Shopify's answer to "can this be bought". inventory 0
      // also means "not tracked", so it must not disable on its own.
      if (!available) {
        btn.classList.add('disabled');
        return;
      }
      hasAnyAvailable = true;
      if (!firstAvailableBtn) {
        firstAvailableBtn = btn;
      }
    });

    // Check if ALL variants are out of stock
    if (!hasAnyAvailable) {
      cartBtn.classList.add('sold-out');
      cartBtn.innerText = cardStrings.soldOut;
      cartBtn.disabled = true;
      idInput.value = '';
    } else {
      cartBtn.classList.remove('sold-out');
      cartBtn.innerText = cardStrings.addToCart;
      cartBtn.disabled = false;
    }

    if (firstAvailableBtn) {
      variantBtns.forEach(b => b.classList.remove('active'));
      firstAvailableBtn.classList.add('active');

      idInput.value = firstAvailableBtn.dataset.variantId;
      
      const comparePrice = parseFloat(firstAvailableBtn.dataset.variantCompareAtPrice) || 0;
      const currentPrice = firstAvailableBtn.dataset.variantPrice;
      
      // The shared card holds price, compare price and badge as siblings, so
      // update them rather than writing markup into the price span. Writing
      // into it nested the markup wrongly and destroyed the badge the server
      // had already rendered.
      const section = priceDisplay.closest('.price-section') || priceDisplay.parentElement;
      const comparePriceEl = section && section.querySelector('[data-compare-at-price-display]');
      const saleBadgeEl = section && section.querySelector('[data-price-badge]');
      // The theme's one sale rule (layout/theme.liquid).
      const priceRaw = firstAvailableBtn.dataset.variantPriceRaw;
      const onSale = window.ScentspiredSale.showsWasPrice(priceRaw, comparePrice);
      const badgeText = window.ScentspiredSale.badge(priceRaw, comparePrice);

      priceDisplay.textContent = currentPrice;
      if (comparePriceEl) {
        comparePriceEl.textContent = onSale ? formatPrice(comparePrice) : '';
        comparePriceEl.style.display = onSale ? 'inline' : 'none';
      }
      if (saleBadgeEl) {
        saleBadgeEl.textContent = badgeText;
        saleBadgeEl.style.display = badgeText ? 'inline' : 'none';
      }
    }
  });

  // IMPORTANT: Rebind event handlers AFTER all HTML is added to DOM
  rebindProductEvents();
}

// Check if all variants are out of stock
function checkAllVariantAvailability(product) {
  return product.variants.every(v => !v.available);
}

// Update cart button state based on product availability
function updateCartButtonState(card) {
  const cartBtn = card.querySelector('.cart-button');
  const variantData = cartBtn.dataset.allVariants;
  
  if (!variantData) return;
  
  try {
    const variants = JSON.parse(variantData);
    const allOutOfStock = variants.every(v => !v.available);
    
    if (allOutOfStock) {
      cartBtn.classList.add('sold-out');
      cartBtn.innerText = cardStrings.soldOut;
      cartBtn.disabled = true;
    } else {
      cartBtn.classList.remove('sold-out');
      cartBtn.innerText = cardStrings.addToCart;
      cartBtn.disabled = false;
    }
  } catch (e) {
    console.warn('Error parsing variant data:', e);
  }
}

// Separate function to rebind all product events after DOM update
function rebindProductEvents() {
  console.log("Rebinding product events...");

  /* UPDATE CART BUTTON STATES ON LOAD */
  document.querySelectorAll('.fragrance-item').forEach(card => {
    updateCartButtonState(card);
  });

  /* VARIANT BUTTONS */
  document.querySelectorAll('.variant-option-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (btn.classList.contains('disabled')) return;

      const card = btn.closest('.fragrance-item');

      card.querySelectorAll('.variant-option-btn')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      card.querySelector('.variant-id-input').value = btn.dataset.variantId;
      
      const comparePrice = parseFloat(btn.dataset.variantCompareAtPrice) || 0;
      const currentPrice = btn.dataset.variantPrice;
      const priceDisplay = card.querySelector('[data-price-display]');
      
      // The shared card holds price, compare price and badge as siblings, so
      // update them rather than writing markup into the price span. Writing
      // into it nested the markup wrongly and destroyed the badge the server
      // had already rendered.
      const section = priceDisplay.closest('.price-section') || priceDisplay.parentElement;
      const comparePriceEl = section && section.querySelector('[data-compare-at-price-display]');
      const saleBadgeEl = section && section.querySelector('[data-price-badge]');
      // The theme's one sale rule (layout/theme.liquid).
      const priceRaw = btn.dataset.variantPriceRaw;
      const onSale = window.ScentspiredSale.showsWasPrice(priceRaw, comparePrice);
      const badgeText = window.ScentspiredSale.badge(priceRaw, comparePrice);

      priceDisplay.textContent = currentPrice;
      if (comparePriceEl) {
        comparePriceEl.textContent = onSale ? formatPrice(comparePrice) : '';
        comparePriceEl.style.display = onSale ? 'inline' : 'none';
      }
      if (saleBadgeEl) {
        saleBadgeEl.textContent = badgeText;
        saleBadgeEl.style.display = badgeText ? 'inline' : 'none';
      }
    });
  });

  /* ADD TO CART */
  document.querySelectorAll('.item-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const variantId = form.querySelector('.variant-id-input').value;
      const submitBtn = form.querySelector('.cart-button');
      const originalText = submitBtn.innerText;

      submitBtn.disabled = true;
      submitBtn.innerText = cardStrings.adding;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
      .then(res => {
        if (!res.ok) throw new Error(`cart/add.js ${res.status}`);
        return res.json();
      })
      .then(() => {
        updateVariantAvailability();
        return fetch('/cart.js');
      })
      .then(res => res.json())
      .then(cartData => {

        if (typeof window.updateDossierCartUI === 'function') {
          window.updateDossierCartUI(cartData);
        }

        setTimeout(() => {
          if (typeof window.openDossierCart === 'function') {
            window.openDossierCart();
          } else if (window.EllaThemeCartDrawer) {
            window.EllaThemeCartDrawer.refresh();
            window.EllaThemeCartDrawer.open();
          }
        }, 200);

        submitBtn.innerText = cardStrings.added;
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        alert(cardStrings.addFailed);
      });
    });
  });

  console.log("Events rebound successfully");
}

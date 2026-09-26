/* The Five Favourites builder (/pages/bundle-1): sizes, brands, perfumes, add to cart. Its data from #fiveFavouritesData, wording from #bundleStrings. Moved from sections/bundle--five-favourites.liquid. */
  var bundleStrings = JSON.parse((document.getElementById('bundleStrings') || {}).textContent || '{}');
  let activeSize = null;
  let currentStep = 'Step-Size';        // Tracks which step is open
let hasAddedFirstProduct = false;     // Becomes true after first product is added
let allFilteredProducts = [];

var fiveFavouritesData = JSON.parse((document.getElementById('fiveFavouritesData') || {}).textContent || '{}');

// Per size: price, standard price and saving, formatted by the store (see the top of this file).
const PRICING = fiveFavouritesData.pricing;

// Five Favourites' variant per size, from Shopify
const DISCOVERY_SET_VARIANT = fiveFavouritesData.variants;

  // Each size's perfumes: its collection in boxes.json (five_favourites, perfume_collection_per_size)
  const PRODUCTS_BY_SIZE = fiveFavouritesData.productsBySize;


 
  const brands = fiveFavouritesData.brands;

  let bundle = [null, null, null, null, null];
  let currentSlot = null;

  function isDesktop() {
    return window.innerWidth > 1024;
  }

  window.addEventListener('DOMContentLoaded', function() {
    if (isDesktop()) {
      openSelector(0);
    }
  });

  function openSelector(index) {
    currentSlot = index;
    const drawer = document.getElementById('SelectionDrawer');
    if (drawer) drawer.classList.add('visible');

    document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
    const activeSlot = document.querySelector(`.slot-item[data-index="${index}"]`);
    if (activeSlot) activeSlot.classList.add('active');

    if (activeSize) {
      showStep('Step-Product');
    } else {
      showStep('Step-Size');
    }
  }

  function closeSelector() {
    const drawer = document.getElementById('SelectionDrawer');
    if (drawer) drawer.classList.remove('visible');
    document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
  }

  function showStep(id) {
    document.querySelectorAll('.step-container').forEach(c => c.style.display = 'none');
    const stepEl = document.getElementById(id);
    if (stepEl) stepEl.style.display = 'block';

    currentStep = id;

    const backArrowBtn = document.getElementById('BackArrowBtn');
    const drawerHeadline = document.getElementById('DrawerHeadline');

    if (id === 'Step-Size') {
      if (backArrowBtn) backArrowBtn.style.display = 'none';
      if (drawerHeadline) drawerHeadline.innerText = bundleStrings.selectSize;
    } else if (id === 'Step-Product') {
      if (backArrowBtn) backArrowBtn.style.display = hasAddedFirstProduct ? 'none' : 'flex';
      if (drawerHeadline) drawerHeadline.innerText = bundleStrings.selectProduct;
      renderProducts();
      initSearchListener();
    }
  }

  function goBackToStep() {
    if (currentStep === 'Step-Product') {
      showStep('Step-Size');
    }
  }

  function selectSize(size) {
    activeSize = size;
    showStep('Step-Product');
  }

  function handleSearch(event) {
    if (!event || !event.target) return;
    const searchQuery = event.target.value || '';
    renderProducts(searchQuery);
  }

  function initSearchListener() {
    const searchInput = document.getElementById('ProductSearch');
    if (searchInput) {
      searchInput.value = '';
      searchInput.addEventListener('input', handleSearch);
    }
  }

  function renderProducts(searchQuery = '') {
    const grid = document.getElementById('ProductGrid');
    if (!grid || !activeSize) return;

    const products = PRODUCTS_BY_SIZE[activeSize] || [];

    const filtered = products.filter(p =>
      Array.isArray(p.variants) &&
      p.variants.some(v => v.available === true)
    );

    allFilteredProducts = filtered;

    let displayProducts = filtered;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      displayProducts = filtered.filter(p => {
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesVendor = p.vendor.toLowerCase().includes(query);
        const matchesTags = p.tags && p.tags.some(tag => tag.toLowerCase().includes(query));
        
        return matchesTitle || matchesVendor || matchesTags;
      });
    }

    if (displayProducts.length === 0) {
      grid.innerHTML = '<div class="no-results-message"></div>';
      grid.firstChild.textContent = bundleStrings.noResults;
      return;
    }

    grid.innerHTML = displayProducts.map(p => {
      const variant = (p.variants && p.variants.find(v => v.title.toLowerCase().includes(activeSize.toLowerCase()))) || (p.variants && p.variants[0]);
      const isAvailable = variant && variant.available !== false;
      if (!isAvailable) {
        return `
          <div class="option-item is-sold-out" style="opacity: 0.5; cursor: not-allowed; filter: grayscale(0.8);" data-message="${bundleStrings.outOfStockSelect.replace('[product]', () => p.title).replace('[size]', () => activeSize).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" onclick="alert(this.dataset.message)">
            <div class="item-thumb"><img src="${p.image}" alt=""></div>
            <span>${p.title} (${p.vendor}) <small style="display:inline-block; background:#d32f2f; color:#fff; font-size:9px; padding:2px 5px; border-radius:3px; font-weight:700; margin-left:4px;">${bundleStrings.soldOut}</small></span>
          </div>
        `;
      }
      return `
        <div class="option-item" onclick="addProductToBundle(${p.id}, '${activeSize}')">
          <div class="item-thumb"><img src="${p.image}" alt=""></div>
          <span>${p.title} (${p.vendor})</span>
        </div>
      `;
    }).join('');
  }

  function addProductToBundle(id, size) {
    if (!PRODUCTS_BY_SIZE[size]) return alert(bundleStrings.sizeNotConfigured);
    const product = PRODUCTS_BY_SIZE[size].find(p => p.id === id);
    if (!product) return alert(bundleStrings.productNotFound);

    const variant = product.variants.find(v => v.title.toLowerCase().includes(size.toLowerCase())) || product.variants[0];
    if (!variant || variant.available === false) {
      alert(bundleStrings.outOfStockChoose.replace('[product]', () => product.title).replace('[size]', () => size));
      return;
    }

    const isDesktopView = typeof isDesktop === 'function' ? isDesktop() : window.innerWidth >= 768;

    if (isDesktopView) {
      const firstEmptyIndex = bundle.findIndex(item => item === null);
      if (firstEmptyIndex !== -1) {
        bundle[firstEmptyIndex] = {
          variantId: variant.id,
          title: product.title,
          sku: variant.sku,
          image: product.image,
          price: variant.price,
          available: variant.available
        };
        if (!hasAddedFirstProduct) {
          hasAddedFirstProduct = true;
        }

        updateUI();

        const nextEmptyIndex = bundle.findIndex(item => item === null);
        if (nextEmptyIndex !== -1) {
          setTimeout(() => openSelector(nextEmptyIndex), 300);
        } else {
          closeSelector();
        }
      }
    } else {
      const slotIndex = currentSlot !== null ? currentSlot : 0;
      bundle[slotIndex] = {
        variantId: variant.id,
        title: product.title,
        sku: variant.sku,
        image: product.image,
        price: variant.price
      };
      if (!hasAddedFirstProduct) {
        hasAddedFirstProduct = true;
      }
      updateUI();
      closeSelector();
    }
  }

  function removeItem(index) {
    bundle[index] = null;
    updateUI();
  }

  function updateUI() {
    const count = bundle.filter(x => x).length;

    bundle.forEach((item, i) => {
      const el = document.querySelector(`.slot-item[data-index="${i}"]`);
      if (!el) return;
      if (item) {
        el.classList.remove('empty');
        el.innerHTML = `
          <div class="slot-filled-content">
            <div class="slot-img"><img src="${item.image}" alt=""></div>
            <div class="slot-info">
              <h4>${item.title}</h4>
            </div>
            <button class="remove-item" onclick="event.stopPropagation(); removeItem(${i})">×</button>
          </div>
        `;
      } else {
        el.classList.add('empty');
        el.innerHTML = `
          <div class="slot-placeholder-icon">+</div>
          <div class="slot-placeholder-text">
            <span class="primary">${bundleStrings.selectAProduct}</span>
            <span class="unlock"> ${bundleStrings.selectionsRemaining.replace('[count]', () => 5 - i)}</span>
          </div>
        `;
      }
    });

    const totalDisplay = document.getElementById('TotalDisplay');
    const mainBtn = document.getElementById('MainActionBtn');

    if (mainBtn) {
      mainBtn.disabled = count !== 5;
    }

    if (count === 5 && activeSize) {
      const pricing = PRICING[activeSize];
      if (pricing && totalDisplay) {
        totalDisplay.innerText = `${pricing.total}`;
        totalDisplay.style.visibility = 'visible';
      }
      const savingEl = document.querySelector('.savings-row .saving');
      if (savingEl && pricing && pricing.standard) savingEl.innerText = `${pricing.standard}`;
      const saveSpan = document.querySelector('.save-row span');
      if (saveSpan && pricing && pricing.saving) saveSpan.innerText = `${pricing.saving}`;
    } else if (totalDisplay) {
      totalDisplay.innerText = '';
      totalDisplay.style.visibility = 'hidden';
    }

    const statusText = count < 5 ? bundleStrings.fiveStatusMore.replace('[count]', () => 5 - count) : bundleStrings.fiveStatusComplete;
    const bundleStatusText = document.getElementById('BundleStatusText');
    if (bundleStatusText) bundleStatusText.innerText = statusText;

    document.querySelectorAll('.progress-marker, .progress-label').forEach(el => el.classList.remove('active'));
    for (let i = 0; i < count; i++) {
      const marker = document.getElementById(`Marker-${i}`);
      if (marker) marker.classList.add('active');
    }
    const label1 = document.getElementById('Label-1');
    if (label1) {
      if (count >= 1) label1.classList.add('active');
    }
    const label2 = document.getElementById('Label-2');
    if (label2) {
      if (count >= 2) label2.classList.add('active');
    }
    const label15 = document.getElementById('Label-15');
    if (label15) {
      if (count >= 3) label15.classList.add('active');
    }
    const label4 = document.getElementById('Label-4');
    if (label4) {
      if (count >= 4) label4.classList.add('active');
    }
    const label25 = document.getElementById('Label-25');
    if (label25) {
      if (count >= 5) label25.classList.add('active');
    }
  }

  async function handleCheckout() {
    const btn = document.getElementById('MainActionBtn');
    if (!btn) return;
    const priceSpan = btn.querySelector('span:nth-child(2)');

    if (window.isProcessingCartAction) {
      console.warn('Cart action already in progress');
      return;
    }

    if (!activeSize || bundle.filter(x => x).length !== 5) {
      alert(bundleStrings.completeFiveBox);
      return;
    }

    const variantId = DISCOVERY_SET_VARIANT && DISCOVERY_SET_VARIANT[activeSize] ? DISCOVERY_SET_VARIANT[activeSize] : null;

    window.isProcessingCartAction = true;
    btn.disabled = true;
    if (priceSpan) priceSpan.innerText = bundleStrings.adding;

    const properties = {};
    bundle.forEach((item, index) => {
      if (!item) return;
      properties[`Product ${index + 1}`] = item.title;
      if (item.sku) properties[`SKU ${index + 1}`] = item.sku;
      properties[`Variant ID ${index + 1}`] = item.variantId;
    });

    try {
      if (!variantId) {
        throw new Error(bundleStrings.invalidSize.replace('[sizes]', () => Object.keys(PRODUCTS_BY_SIZE).join(' or ')));
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 1,
          properties: properties
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.description || errorData.message || bundleStrings.addFailedFive);
      }

      console.log('Five Favourites added successfully');

      bundle = [null, null, null, null, null];
      if (typeof updateUI === 'function') updateUI();

      btn.disabled = false;
      if (priceSpan) priceSpan.innerText = bundleStrings.added;

      const cartResponse = await fetch('/cart.js');
      if (cartResponse.ok) {
        const cart = await cartResponse.json();
        if (typeof updateDossierCartUI === 'function') updateDossierCartUI(cart);
        if (typeof openDossierCart === 'function') openDossierCart();
      }

      setTimeout(() => {
        const defaultPrice = (activeSize && PRICING[activeSize]) ? `${PRICING[activeSize].total}` : '';
        if (priceSpan) priceSpan.innerText = defaultPrice;
        window.isProcessingCartAction = false;
      }, 2000);

    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.message || bundleStrings.addFailedFiveShort);
      btn.disabled = false;
      const defaultPrice = (activeSize && PRICING[activeSize]) ? `${PRICING[activeSize].total}` : '';
      if (priceSpan) priceSpan.innerText = defaultPrice;
      window.isProcessingCartAction = false;
    }
  }

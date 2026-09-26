/* The box builder (the trio, Five Favourites and discovery pages): slots, sizes, perfumes, add to cart. Its box from #bundleBoxData, wording from #bundleStrings. Moved from sections/bundle--box.liquid. */
  var bundleStrings = JSON.parse((document.getElementById('bundleStrings') || {}).textContent || '{}');
  var bundleBoxData = JSON.parse((document.getElementById('bundleBoxData') || {}).textContent || '{}');
  const PERFUMES_PER_BOX = bundleBoxData.perfumesPerBox;
  const BOX_NAME = bundleBoxData.boxName;
  const BOX_VARIANTS = bundleBoxData.variants;
  const PRODUCTS_BY_SIZE = bundleBoxData.productsBySize;

  // A box sold in one size starts with that size chosen.
  const SIZES = Object.keys(BOX_VARIANTS);
  const ONE_SIZE = SIZES.length === 1 ? SIZES[0] : null;
  let activeSize = ONE_SIZE;
  let currentStep = ONE_SIZE ? 'Step-Product' : 'Step-Size';
  let hasAddedFirstProduct = false;
  let bundle = new Array(PERFUMES_PER_BOX).fill(null);
  let currentSlot = null;

  function isDesktop() {
    return window.innerWidth > 1024;
  }

  window.addEventListener('DOMContentLoaded', function () {
    if (isDesktop()) openSelector(0);
  });

  function openSelector(index) {
    currentSlot = index;
    document.getElementById('SelectionDrawer').classList.add('visible');
    document.querySelectorAll('.slot-item').forEach((s) => s.classList.remove('active'));
    const slot = document.querySelector(`.slot-item[data-index="${index}"]`);
    if (slot) slot.classList.add('active');
    showStep(activeSize ? 'Step-Product' : 'Step-Size');
  }

  function closeSelector() {
    const drawer = document.getElementById('SelectionDrawer');
    if (drawer) drawer.classList.remove('visible');
    document.querySelectorAll('.slot-item').forEach((s) => s.classList.remove('active'));
  }

  function showStep(id) {
    const step = document.getElementById(id);
    if (!step) return;
    document.querySelectorAll('.step-container').forEach((c) => (c.style.display = 'none'));
    step.style.display = 'block';
    currentStep = id;

    const backArrowBtn = document.getElementById('BackArrowBtn');
    if (!backArrowBtn) return;

    if (id === 'Step-Size') {
      document.getElementById('DrawerHeadline').innerText = bundleStrings.selectSize;
      backArrowBtn.style.display = 'none';
    }
    if (id === 'Step-Product') {
      document.getElementById('DrawerHeadline').innerText = bundleStrings.selectProduct;
      // The back arrow goes back to the sizes, so only while there is a size to
      // change: more than one, and no perfume chosen yet (that fixes the size).
      backArrowBtn.style.display = !ONE_SIZE && !hasAddedFirstProduct ? 'flex' : 'none';
      renderProducts();
      initSearchListener();
    }
  }

  function goBackToStep() {
    if (!ONE_SIZE && currentStep === 'Step-Product' && !hasAddedFirstProduct) showStep('Step-Size');
  }

  function selectSize(size) {
    activeSize = size;
    showStep('Step-Product');
  }

  function renderProducts(searchQuery = '') {
    const grid = document.getElementById('ProductGrid');
    if (!activeSize) return;

    const available = (PRODUCTS_BY_SIZE[activeSize] || []).filter(
      (p) => Array.isArray(p.variants) && p.variants.some((v) => v.available === true)
    );

    let shown = available;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      shown = available.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (shown.length === 0) {
      grid.innerHTML = '<div class="no-results-message"></div>';
      grid.firstChild.textContent = bundleStrings.noResults;
      return;
    }

    grid.innerHTML = shown
      .map(
        (p) => `
      <div class="option-item" onclick="addProductToBundle(${p.id}, '${activeSize}')">
        <div class="item-thumb"><img src="${p.image}" alt=""></div>
        <span>${p.title} (${p.vendor})</span>
      </div>
    `
      )
      .join('');
  }

  function handleSearch(event) {
    renderProducts(event.target.value);
  }

  function initSearchListener() {
    const searchInput = document.getElementById('ProductSearch');
    if (searchInput) {
      searchInput.value = '';
      searchInput.addEventListener('input', handleSearch);
    }
  }

  function addProductToBundle(id, size) {
    const product = (PRODUCTS_BY_SIZE[size] || []).find((p) => p.id === id);
    if (!product) return alert(bundleStrings.productNotFound);

    const variant =
      product.variants.find((v) => v.title.toLowerCase().includes(size.toLowerCase())) || product.variants[0];

    bundle[currentSlot] = {
      variantId: variant.id,
      title: product.title,
      sku: variant.sku,
      image: product.image,
      price: variant.price,
    };
    hasAddedFirstProduct = true;
    updateUI();

    const nextEmptyIndex = bundle.findIndex((item) => item === null);
    if (nextEmptyIndex !== -1) {
      if (isDesktop()) {
        currentSlot = nextEmptyIndex;
        setTimeout(() => openSelector(nextEmptyIndex), 100);
      } else {
        closeSelector();
      }
    } else {
      setTimeout(() => closeSelector(), 100);
    }
  }

  function removeItem(index) {
    bundle[index] = null;
    updateUI();
  }

  function updateUI() {
    const count = bundle.filter((x) => x).length;

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
            <span class="unlock"> ${bundleStrings.selectionsRemaining.replace('[count]', () => PERFUMES_PER_BOX - i)}</span>
          </div>
        `;
      }
    });

    const totalDisplay = document.getElementById('TotalDisplay');
    const mainBtn = document.getElementById('MainActionBtn');
    mainBtn.disabled = count !== PERFUMES_PER_BOX;

    // The price shows once the box is full: what the store charges for the box
    // in this size, and — only where a standard price exists — the saving.
    const boxVariant = activeSize && BOX_VARIANTS[activeSize];
    if (count === PERFUMES_PER_BOX && boxVariant) {
      totalDisplay.innerText = boxVariant.price;
      totalDisplay.style.visibility = 'visible';
      const hasStandard = boxVariant.standard !== null;
      document.querySelector('.savings-row').style.display = hasStandard ? '' : 'none';
      document.querySelector('.save-row').style.display = hasStandard ? '' : 'none';
      if (hasStandard) {
        document.querySelector('.savings-row .saving').innerText = boxVariant.standard;
        document.querySelector('.save-row span').innerText = boxVariant.saving;
      }
    } else {
      totalDisplay.innerText = '';
      totalDisplay.style.visibility = 'hidden';
    }

    document.getElementById('BundleStatusText').innerText =
      count < PERFUMES_PER_BOX
        ? bundleStrings.statusMore.replace('[count]', () => PERFUMES_PER_BOX - count).replace('[box]', () => BOX_NAME)
        : bundleStrings.statusComplete.replace('[box]', () => BOX_NAME);

    document.querySelectorAll('.progress-marker, .progress-label').forEach((el) => el.classList.remove('active'));
    for (let i = 0; i < count; i++) {
      const marker = document.getElementById(`Marker-${i}`);
      if (marker) marker.classList.add('active');
      const label = document.getElementById(`Label-${i + 1}`);
      if (label) label.classList.add('active');
    }
  }

  async function handleCheckout() {
    const btn = document.getElementById('MainActionBtn');
    const priceSpan = btn.querySelector('span:nth-child(2)');
    // The price the button shows before Adding.../ADDED!, restored afterwards.
    const originalPrice = priceSpan ? priceSpan.innerText : '';

    if (window.isProcessingCartAction) {
      console.warn('Cart action already in progress');
      return;
    }
    if (!activeSize) {
      alert(bundleStrings.selectSizeFirst);
      return;
    }
    const boxVariant = BOX_VARIANTS[activeSize];
    if (!boxVariant) {
      alert(bundleStrings.variantNotFound);
      return;
    }

    window.isProcessingCartAction = true;
    btn.disabled = true;
    if (priceSpan) priceSpan.innerText = bundleStrings.adding;

    // One line item — the box — carrying the perfumes chosen as properties.
    const properties = {};
    bundle.forEach((item, index) => {
      if (!item) return;
      properties[`Product ${index + 1}`] = item.title;
      properties[`SKU ${index + 1}`] = item.sku;
      properties[`Variant ID ${index + 1}`] = item.variantId;
    });

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: boxVariant.id, quantity: 1, properties }),
      });
      if (!response.ok) throw new Error(`cart/add.js ${response.status}`);

      bundle = bundle.map(() => null);
      activeSize = ONE_SIZE;
      hasAddedFirstProduct = false;
      updateUI();
      openSelector(0);

      btn.disabled = false;
      if (priceSpan) priceSpan.innerText = bundleStrings.added;

      const cart = await (await fetch('/cart.js')).json();
      if (typeof updateDossierCartUI === 'function') updateDossierCartUI(cart);
      if (typeof openDossierCart === 'function') openDossierCart();

      setTimeout(() => {
        if (priceSpan) priceSpan.innerText = originalPrice;
        window.isProcessingCartAction = false;
      }, 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(bundleStrings.addError.replace('[box]', () => BOX_NAME));
      btn.disabled = false;
      if (priceSpan) priceSpan.innerText = originalPrice;
      window.isProcessingCartAction = false;
    }
  }

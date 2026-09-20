/**
 * ============================================================================
 * SCENTSPIRED THEME — PRODUCT CAROUSEL & MERCHANDISING ENGINE (SSOT)
 * ============================================================================
 * Unified, decoupled client-side carousel controller for Scentspired stores.
 * Handles product pagination, variant switching, availability guards, and
 * AJAX cart submission with zero cross-section listener collision.
 *
 * ZERO VISUAL REGRESSION • STRICT SEPARATION OF CONCERNS • SHOPIFY OS 2.0
 * ============================================================================
 */

(function () {
  'use strict';

  function getBadgeHTML(tags) {
    if (!tags) return '';
    const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase());
    if (tagList.includes('men')) return '<span class="product-badge badge-men">Men</span>';
    if (tagList.includes('women')) return '<span class="product-badge badge-women">Women</span>';
    if (tagList.includes('unisex')) return '<span class="product-badge badge-unisex">Unisex</span>';
    return '';
  }

  function formatPrice(priceInCents) {
    const sym =
      (window.Scentspired && window.Scentspired.currencySymbol) ||
      (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) ||
      '£';
    return sym + (Number(priceInCents) / 100).toFixed(2);
  }

  class ScentspiredCarousel {
    constructor(container, products, options = {}) {
      if (!container) return;
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) return;

      this.products = Array.isArray(products) ? products : [];
      this.options = Object.assign(
        {
          showRating: false,
          showComparePrice: true,
          buttonText: 'Add to Cart',
          perPageMobile: 1,
          perPageDesktop: 2,
          breakpoint: 800
        },
        options
      );

      this.currentIndex = 0;
      this.grid = this.container.querySelector('.bs-products-grid') || this.container.querySelector('#productsGrid');
      this.prevBtn = this.container.querySelector('.bs-nav-arrow.bs-prev-btn') || this.container.querySelector('#prevBtn');
      this.nextBtn = this.container.querySelector('.bs-nav-arrow.bs-next-btn') || this.container.querySelector('#nextBtn');
      this.currentPageEl = this.container.querySelector('#currentPage');
      this.totalPagesEl = this.container.querySelector('#totalPages');

      this.isMobile = window.innerWidth <= this.options.breakpoint;
      this.container.__scentspiredCarousel = this;

      this.init();
    }

    getPerPage() {
      return this.isMobile ? this.options.perPageMobile : this.options.perPageDesktop;
    }

    getTotalPages() {
      const perPage = this.getPerPage();
      return Math.max(1, Math.ceil(this.products.length / perPage));
    }

    init() {
      this.updateDisplay();
      this.bindEvents();
    }

    updateDisplay() {
      if (!this.grid) return;
      const perPage = this.getPerPage();
      const totalPages = this.getTotalPages();

      if (this.currentIndex >= totalPages) {
        this.currentIndex = totalPages - 1;
      }
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      }

      const start = this.currentIndex * perPage;
      const visibleProducts = this.products.slice(start, start + perPage);

      let html = '';
      visibleProducts.forEach(product => {
        html += this.renderCard(product);
      });
      this.grid.innerHTML = html;

      if (this.currentPageEl) this.currentPageEl.textContent = this.currentIndex + 1;
      if (this.totalPagesEl) this.totalPagesEl.textContent = totalPages;

      this.syncAvailability();
    }

    renderCard(product) {
      const badgeHTML = getBadgeHTML(product.tags);
      const variants = product.variants || [];

      let variantsHTML = '';
      if (variants.length > 1) {
        const pills = variants
          .map((v, i) => {
            const isAvail = v.available !== false;
            const disabledClass = isAvail ? '' : ' disabled';
            const activeClass = i === 0 && isAvail ? ' active' : '';
            return `<button type="button" class="variant-option-btn${activeClass}${disabledClass}" data-variant-id="${v.id}" data-variant-price="${v.price || ''}" data-compare-price="${v.compareAtPrice || 0}" data-available="${isAvail}">${v.title}</button>`;
          })
          .join('');
        variantsHTML = `<div class="variant-options">${pills}</div>`;
      }

      const firstVar = variants[0] || {};
      const firstPrice = firstVar.price || '';
      const firstId = firstVar.id || '';
      const comparePrice = firstVar.compareAtPrice || 0;

      let priceHTML = '';
      if (this.options.showComparePrice && comparePrice > 0) {
        priceHTML = `
          <div class="product-price-display" data-price-display>
            <div class="price-wrapper">
              <span data-current-price>${firstPrice}</span>
              <span class="compare-price">${formatPrice(comparePrice)}</span>
              <span class="sale-badge">SALE</span>
            </div>
          </div>`;
      } else {
        priceHTML = `<div class="product-price-display" data-price-display>${firstPrice}</div>`;
      }

      const ratingHTML = this.options.showRating
        ? '<div class="fragrance-rating">★★★★☆</div>'
        : '';

      const allVariantsData = JSON.stringify(variants.map(v => ({ available: v.available, id: v.id })));

      return `
        <div class="fragrance-item" data-product-id="${product.id}">
          <a href="${product.url}" style="text-decoration: none; color: inherit;">
            <div class="fragrance-image-wrap">
              ${product.featured_image ? `<img src="${product.featured_image}" alt="${product.title || ''}">` : `<div class="ai-product-placeholder" style="width:100%;height:100%;background-color:#e5e5e5;display:flex;align-items:center;justify-content:center;"><svg style="width:35%;height:35%;opacity:0.15;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`}
              ${product.hover_image ? `<img class="secondary-image" src="${product.hover_image}" alt="${product.title || ''}">` : ''}
              <div class="product-badges">${badgeHTML}</div>
            </div>
          </a>
          <div class="fragrance-info">
            <a href="${product.url}" style="text-decoration: none; color: inherit;">
              ${ratingHTML}
              <div class="fragrance-name">${product.title || ''}</div>
            </a>
            <div class="fragrance-brand">${product.vendor || ''}</div>
            ${priceHTML}
            <form method="post" action="/cart/add" class="product-form" data-product-id="${product.id}">
              <input type="hidden" name="id" class="selected-variant-id" value="${firstId}">
              ${variantsHTML}
              <button type="submit" class="button--brand cart-button" data-all-variants='${allVariantsData}'>${this.options.buttonText}</button>
            </form>
          </div>
        </div>`;
    }

    navigate(direction) {
      const totalPages = this.getTotalPages();
      this.currentIndex += direction;
      if (this.currentIndex >= totalPages) this.currentIndex = 0;
      if (this.currentIndex < 0) this.currentIndex = totalPages - 1;
      this.updateDisplay();
    }

    syncAvailability() {
      if (!this.grid) return;
      this.grid.querySelectorAll('.fragrance-item').forEach(card => {
        const variantBtns = card.querySelectorAll('.variant-option-btn');
        const hiddenInput = card.querySelector('.selected-variant-id');
        const cartBtn = card.querySelector('.cart-button');
        if (!variantBtns.length || !cartBtn) return;

        let activeBtn = card.querySelector('.variant-option-btn.active');
        if (!activeBtn) {
          const firstAvail = card.querySelector('.variant-option-btn:not(.disabled)');
          if (firstAvail) {
            firstAvail.classList.add('active');
            activeBtn = firstAvail;
            if (hiddenInput) hiddenInput.value = firstAvail.dataset.variantId;
          }
        }

        if (activeBtn && activeBtn.classList.contains('disabled')) {
          cartBtn.classList.add('sold-out');
          cartBtn.disabled = true;
          cartBtn.textContent = 'Sold Out';
        } else if (activeBtn) {
          cartBtn.classList.remove('sold-out');
          cartBtn.disabled = false;
          cartBtn.textContent = this.options.buttonText;
        }
      });
    }

    bindEvents() {
      // Prev / Next button listeners
      if (this.prevBtn) {
        this.prevBtn.onclick = null;
        this.prevBtn.addEventListener('click', e => {
          e.preventDefault();
          this.navigate(-1);
        });
      }
      if (this.nextBtn) {
        this.nextBtn.onclick = null;
        this.nextBtn.addEventListener('click', e => {
          e.preventDefault();
          this.navigate(1);
        });
      }

      // Scoped click listener for variant pills
      this.container.addEventListener('click', e => {
        const btn = e.target.closest('.variant-option-btn');
        if (!btn) return;
        const card = btn.closest('.fragrance-item');
        if (!card) return;

        card.querySelectorAll('.variant-option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const hiddenInput = card.querySelector('.selected-variant-id');
        if (hiddenInput && btn.dataset.variantId) {
          hiddenInput.value = btn.dataset.variantId;
        }

        const currentPrice = btn.dataset.variantPrice;
        const comparePrice = parseFloat(btn.dataset.comparePrice) || 0;
        const priceWrapper = card.querySelector('.price-wrapper');
        const priceDisplay = card.querySelector('[data-price-display]');

        if (priceWrapper) {
          const curEl = priceWrapper.querySelector('[data-current-price]');
          if (curEl && currentPrice) curEl.textContent = currentPrice;
        } else if (priceDisplay && currentPrice) {
          priceDisplay.textContent = currentPrice;
        }

        this.syncAvailability();
      });

      // Scoped AJAX submit listener for forms inside this carousel
      this.container.addEventListener('submit', e => {
        const form = e.target.closest('.product-form');
        if (!form) return;

        e.preventDefault();
        e.stopPropagation();

        const varInput = form.querySelector('.selected-variant-id');
        const variantId = varInput ? varInput.value : null;
        if (!variantId) return;

        const submitBtn = form.querySelector('.cart-button');
        let originalText = this.options.buttonText;
        if (submitBtn) {
          originalText = submitBtn.innerText;
          submitBtn.disabled = true;
          submitBtn.innerText = 'Adding...';
        }

        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        })
          .then(res => {
            if (!res.ok) throw new Error('Add to cart failed');
            return res.json();
          })
          .then(() => fetch('/cart.js'))
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch cart');
            return res.json();
          })
          .then(cartData => {
            if (typeof window.updateDossierCartUI === 'function') {
              window.updateDossierCartUI(cartData);
            }
            if (typeof window.openDossierCart === 'function') {
              window.openDossierCart();
            }
            if (submitBtn) submitBtn.innerText = 'ADDED!';
            setTimeout(() => {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
              }
            }, 2000);
          })
          .catch(err => {
            console.error(err);
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerText = originalText;
            }
          });
      });

      // Responsive breakpoint listener
      window.addEventListener('resize', () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= this.options.breakpoint;
        if (wasMobile !== this.isMobile) {
          this.currentIndex = 0;
          this.updateDisplay();
        }
      });

      // Global cart event listeners
      document.addEventListener('cart:updated', () => this.syncAvailability());
      document.addEventListener('cart:change', () => this.syncAvailability());
    }
  }

  window.ScentspiredProductCarousel = ScentspiredCarousel;
  window.rebindProductEvents = function () {
    document.querySelectorAll('.bs-section').forEach(function (container) {
      if (container.__scentspiredCarousel) {
        container.__scentspiredCarousel.syncAvailability();
      }
    });
  };
  document.dispatchEvent(new CustomEvent('scentspired:carousel-ready'));
})();

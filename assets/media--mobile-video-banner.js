/* The mobile video banner's brand and note pickers and their products. Reads its section id from its script tag (data-section-id). Moved from sections/media--mobile-video-banner.liquid. */
    var cardStrings = JSON.parse((document.getElementById('cardStrings') || {}).textContent || '{}');
    (async function () {
      const sid = document.currentScript.dataset.sectionId;
      const section = document.getElementById('mvps-' + sid);
      if (!section) return;

      const currSym = (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';

      // --- Fetch current cart ---
      async function getCart() {
        try {
          const res = await fetch('/cart.js');
          if (!res.ok) throw new Error(`cart.js ${res.status}`);
          return await res.json();
        } catch (err) {
          console.error(err);
          return { items: [] };
        }
      }

      const cart = await getCart();

      // --- Elements ---
      const brandsBtnEl = section.querySelector('#mvps-brands-btn-' + sid);
      const notesBtnEl = section.querySelector('#mvps-notes-btn-' + sid);
      const brandsPopup = section.querySelector('#mvps-brands-popup-' + sid);
      const notesPopup = section.querySelector('#mvps-notes-popup-' + sid);
      const layouts = Array.from(section.querySelectorAll('.mvps-fragrance-layout'));
      const dotsContainer = section.querySelector('#mvps-dots-' + sid);
      const brandsItems = brandsPopup ? Array.from(brandsPopup.querySelectorAll('.mvps-popup-item')) : [];
      const notesItems = notesPopup ? Array.from(notesPopup.querySelectorAll('.mvps-popup-item')) : [];

      const BRANDS_CATEGORY = 'VIBES';
      const NOTES_CATEGORY = 'OCCASIONS';
      const firstBrandText = brandsItems[0]?.textContent.trim() || 'Brand 1';

      let currentCategory = 'brands';
      let currentCollection = 'collection_1';

      // --- Dropdown functionality ---
      function closeAllPopups() {
        if (brandsPopup) brandsPopup.style.display = 'none';
        if (notesPopup) notesPopup.style.display = 'none';
        if (brandsBtnEl) brandsBtnEl.classList.remove('active');
        if (notesBtnEl) notesBtnEl.classList.remove('active');
        document.body.style.overflow = '';
        document.body.classList.remove('mvps-popup-open');
      }

      function updateDropdownText(btn, text) {
        if (!btn) return;
        const textSpan = btn.querySelector('.mvps-dropdown-text');
        if (textSpan) textSpan.textContent = text;
      }

      if (brandsBtnEl) {
        brandsBtnEl.addEventListener('click', e => {
          e.stopPropagation();
          if (brandsPopup && brandsPopup.style.display === 'flex') closeAllPopups();
          else if (brandsPopup) {
            closeAllPopups();
            brandsPopup.style.display = 'flex';
            brandsBtnEl.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mvps-popup-open');
          }
        });
      }

      if (notesBtnEl) {
        notesBtnEl.addEventListener('click', e => {
          e.stopPropagation();
          if (notesPopup && notesPopup.style.display === 'flex') closeAllPopups();
          else if (notesPopup) {
            closeAllPopups();
            notesPopup.style.display = 'flex';
            notesBtnEl.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mvps-popup-open');
          }
        });
      }

      brandsItems.forEach((item, index) => {
        if (index === 0) item.classList.add('active');
        item.addEventListener('click', () => {
          brandsItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          const collectionKey = 'collection_' + (index + 1);
          currentCollection = collectionKey;
          currentCategory = 'brands';
          updateDropdownText(brandsBtnEl, item.textContent.trim());
          updateDropdownText(notesBtnEl, NOTES_CATEGORY);
          notesItems.forEach(i => i.classList.remove('active'));
          showLayout(collectionKey);
          setTimeout(() => closeAllPopups(), 100);
        });
      });

      notesItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          notesItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          const collectionKey = 'collection_notes_' + (index + 1);
          currentCollection = collectionKey;
          currentCategory = 'notes';
          updateDropdownText(notesBtnEl, item.textContent.trim());
          updateDropdownText(brandsBtnEl, BRANDS_CATEGORY);
          brandsItems.forEach(i => i.classList.remove('active'));
          showLayout(collectionKey);
          setTimeout(() => closeAllPopups(), 100);
        });
      });

      // Close popup if click outside
      const closeButtons = section.querySelectorAll('.mvps-popup-close');
      closeButtons.forEach(btn => btn.addEventListener('click', closeAllPopups));
      document.addEventListener('click', e => {
        if (!section.contains(e.target)) closeAllPopups();
      });

      // --- Show layout & dots ---
      function createDots(productCount) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < productCount; i++) {
          const dot = document.createElement('span');
          dot.className = 'mvps-dot';
          if (i === 0) dot.classList.add('active');
          dotsContainer.appendChild(dot);
        }
      }

      function showLayout(collectionKey) {
        layouts.forEach(l => {
          if (l.getAttribute('data-collection') === collectionKey) {
            l.style.display = 'flex';
            l.scrollTo({ left: 0 });
            const productCount = l.querySelectorAll('.fragrance-item:not(.empty)').length;
            createDots(productCount);
            initVariants(l); // Initialize variants whenever layout is shown
          } else l.style.display = 'none';
        });
      }

      // --- Scroll dots ---
      layouts.forEach(layout => {
        layout.addEventListener('scroll', function () {
          if (this.style.display === 'flex') {
            const scrollLeft = this.scrollLeft;
            const itemWidth = this.querySelector('.fragrance-item')?.offsetWidth || 283;
            const currentIndex = Math.round(scrollLeft / (itemWidth + 18));
            const dots = Array.from(dotsContainer.querySelectorAll('.mvps-dot'));
            dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
          }
        });
      });

      // --- Variant logic ---
      function initVariants(layout) {
        const fragranceItems = layout.querySelectorAll('.fragrance-item');

        fragranceItems.forEach(card => {
          const variantBtns = card.querySelectorAll('.variant-option-btn');
          const variantIdInput = card.querySelector('.variant-id-input');
          const priceDisplay = card.querySelector('[data-price]');
          let firstAvailable = null;

          variantBtns.forEach(btn => {
            const totalInventory = parseInt(btn.dataset.inventory || 0);
            const cartItem = cart.items.find(item => item.id == btn.dataset.variantId);
            const cartQty = cartItem ? cartItem.quantity : 0;
            const remaining = totalInventory - cartQty;

            btn.classList.remove('disabled', 'active');
            btn.style.textDecoration = '';
            btn.style.cursor = '';

            if (remaining <= 0) {
              btn.classList.add('disabled');
              btn.style.textDecoration = 'line-through';
              btn.style.cursor = 'not-allowed';
              btn.disabled = true;
            } else if (!firstAvailable) firstAvailable = btn;

            if (!btn.dataset.listenerAttached) {
              btn.addEventListener('click', () => {
                if (btn.classList.contains('disabled')) return;
                variantBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (variantIdInput) variantIdInput.value = btn.dataset.variantId;
                const price = parseInt(btn.dataset.variantPriceRaw, 10);
                const compare = parseInt(btn.dataset.variantCompare, 10) || null;

                priceDisplay.textContent = currSym + (price / 100).toFixed(2);

                let compareEl = card.querySelector('[data-compare-price]');
                let badgeEl = card.querySelector('[data-sale-badge]');

                // The theme's one sale rule (layout/theme.liquid).
                const showsWasPrice = window.ScentspiredSale.showsWasPrice(price, compare);
                const saleBadgeText = window.ScentspiredSale.badge(price, compare);

                if (showsWasPrice) {
                  if (!compareEl) {
                    compareEl = document.createElement('span');
                    compareEl.className = 'original-price';
                    compareEl.setAttribute('data-compare-price', '');
                    priceDisplay.after(compareEl);
                  }
                  compareEl.textContent = currSym + (compare / 100).toFixed(2);
                  compareEl.style.display = 'inline';
                } else if (compareEl) {
                  compareEl.remove();
                }

                if (saleBadgeText) {
                  if (!badgeEl) {
                    badgeEl = document.createElement('span');
                    badgeEl.className = 'price-badge';
                    badgeEl.setAttribute('data-sale-badge', '');
                    (compareEl || priceDisplay).after(badgeEl);
                  }
                  badgeEl.textContent = saleBadgeText;
                  badgeEl.style.display = 'inline';
                } else if (badgeEl) {
                  badgeEl.remove();
                }
              });
              btn.dataset.listenerAttached = true;
            }
          });

          // Auto-select first available
          if (firstAvailable) {
            variantBtns.forEach(b => b.classList.remove('active'));
            firstAvailable.classList.add('active');
            if (variantIdInput) variantIdInput.value = firstAvailable.dataset.variantId;
            if (priceDisplay)
              priceDisplay.textContent = currSym + (parseInt(firstAvailable.dataset.variantPriceRaw) / 100).toFixed(2);
          }

          // Disable Add to Cart + Sold Out text handling
          const submitBtn = card.querySelector('.cart-button');

          if (submitBtn) {
            if (!firstAvailable) {
              submitBtn.disabled = true;
              submitBtn.textContent = cardStrings.soldOut;
              submitBtn.style.cursor = 'not-allowed';
              submitBtn.style.opacity = '0.6';
            } else {
              submitBtn.disabled = false;
              submitBtn.textContent = cardStrings.addToCart;
              submitBtn.style.cursor = 'pointer';
              submitBtn.style.opacity = '1';
            }
          }
        });
      }

      // --- Initialize first layout & dropdown text ---
      updateDropdownText(brandsBtnEl, firstBrandText);
      updateDropdownText(notesBtnEl, NOTES_CATEGORY);
      showLayout('collection_1');
    })();
  

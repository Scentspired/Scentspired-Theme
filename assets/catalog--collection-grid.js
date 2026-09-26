/* The collection grid: sidebar, columns, recent searches, the search overlay and the filters. Wording from #collectionGridStrings. Moved from sections/catalog--collection-grid.liquid. */
  // This script handles the interactive elements of the collection page, including sidebar toggling, search functionality, and filtering.
  document.addEventListener('DOMContentLoaded', () => {
    const gridStrings = JSON.parse((document.getElementById('collectionGridStrings') || {}).textContent || '{}');
    const currSym = (window.__STORE_CONFIG && window.__STORE_CONFIG.currencySymbol) || '';
    // DOM Element References
    const filterToggleButton = document.getElementById('filterToggleButton');
    const filterToggleDesktop = document.getElementById('filterToggleDesktop');
    const filterToggleText = document.getElementById('filterToggleText');
    const filterToggleTextDesktop = document.getElementById('filterToggleTextDesktop');
    const filterToggleIcon = document.getElementById('filterToggleIcon');
    const filterToggleIconDesktop = document.getElementById('filterToggleIconDesktop');
    const scentSidebar = document.getElementById('scentSidebar');
    const scentLayout = document.querySelector('.scent-layout');
    const scentGrid = document.getElementById('scentGrid');
    const mainSearchInput = document.getElementById('mainSearchInput');
    const openSearchFromPlus = document.getElementById('openSearchFromPlus');
    const initialSearchBar = document.getElementById('initialSearchBar');
    const searchExpandedOverlay = document.getElementById('searchExpandedOverlay');
    const closeSearchOverlayButton = document.getElementById('closeSearchOverlay');
    const overlaySearchInput = document.getElementById('overlaySearchInput');
    const overlaySearchButton = document.getElementById('overlaySearchButton');
    const searchTags = document.querySelectorAll('.scent-search-tag');
    const recentSearchesGrid = document.getElementById('recentSearchesGrid');
    const searchResultsContainer = document.querySelector('.scent-overlay-search-results-container');
    const overlayCategoryButtonsContainer = document.createElement('div');
    overlayCategoryButtonsContainer.className = 'scent-overlay-category-buttons';
    const overlaySearchResultsTitle = document.createElement('div');
    overlaySearchResultsTitle.className = 'scent-overlay-section-title';
    const overlayProductGrid = document.createElement('div');
    overlayProductGrid.className = 'scent-overlay-product-grid';

    // ========== STATE VARIABLES ==========
    let isSidebarVisible = false;
    let currentSearchTerm = '';
    let activeCategoryFilter = 'all';
    let mobileColumnsCount = 1; // Default to 1 column on mobile
    
    // Initialize allProducts array by extracting data from product cards in the DOM
    let allProducts = [];

    function initializeProductsArray() {
      allProducts = [];
      const productCards = document.querySelectorAll('.fragrance-item.product-card');
      
      productCards.forEach(card => {
        const title = card.querySelector('.fragrance-name')?.textContent.trim() || '';
        const vendor = card.querySelector('.fragrance-brand')?.textContent.trim() || '';
        const priceText = card.querySelector('[data-price-display]')?.textContent.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
        const imageUrl = card.querySelector('img')?.src || '';
        const productUrl = card.querySelector('a')?.href || '';
        const dataGender = card.getAttribute('data-gender') || '';
        const dataIngredient = card.getAttribute('data-ingredient') || '';
        const dataType = card.getAttribute('data-type') || '';
        
        // Parse tags from data attributes
        let tags = [];
        if (dataGender) tags = tags.concat(dataGender.split(' ').filter(t => t));
        if (dataIngredient) tags = tags.concat(dataIngredient.split(' ').filter(t => t));
        if (dataType) tags = tags.concat(dataType.split(' ').filter(t => t));
        
        // Remove duplicates and filter tags
        tags = [...new Set(tags.map(t => t.toLowerCase()))];
        
        // Extract scent notes from the card if available
        const notesElement = card.querySelector('.scent-notes, [data-notes]');
        const notes = notesElement?.textContent.trim() || '';
        
        // Only add if we have essential data
        if (title && (vendor || price > 0)) {
          allProducts.push({
            title: title,
            vendor: vendor,
            price: price,
            image: imageUrl,
            url: productUrl,
            tags: tags,
            notes: notes
          });
        }
      });
      
      console.log('[v0] Products loaded:', allProducts.length, 'products');
    }
    
    // Call initialization function after DOM is ready
    initializeProductsArray();

    // ========== UTILITY FUNCTIONS ==========
    function getScreenSize() {
      const width = window.innerWidth;
      if (width >= 1200) return 'desktop';
      if (width >= 1024) return 'laptop';
      return 'mobile';
    }

    // ========== MOBILE COLUMN HANDLER ==========
    function handleMobileColumnChange(columns) {
      mobileColumnsCount = columns;
      // Update active button
      selectorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.columns) === columns) {
          btn.classList.add('active');
        }
      });

      // Apply grid changes
      if (getScreenSize() === 'mobile') {
        if (columns === 1) {
          scentGrid.classList.add('mobile-single-column');
        } else {
          scentGrid.classList.remove('mobile-single-column');
        }
      }
    }

    // Add event listeners for mobile column selector
    const selectorButtons = document.querySelectorAll('.selector-button'); // Re-declare here to ensure it's accessible
    selectorButtons.forEach(button => {
      button.addEventListener('click', () => {
        const columns = parseInt(button.dataset.columns);
        handleMobileColumnChange(columns);
      });
    });

    // ========== SIDEBAR TOGGLE FUNCTION ==========
  function toggleSidebar() {
    const screenSize = getScreenSize();

    if (isSidebarVisible) {
      // Hide sidebar
      scentLayout.classList.add('sidebar-hidden');

      // Update button text and icon for both buttons
      if (filterToggleText) {
        filterToggleText.textContent = gridStrings.showFilters;
      }
      if (filterToggleTextDesktop) {
        filterToggleTextDesktop.textContent = gridStrings.showFilters;
      }
      if (filterToggleIcon) {
        filterToggleIcon.innerHTML = '<path d="m6 9 6 6 6-6"/>';
      }
      if (filterToggleIconDesktop) {
        filterToggleIconDesktop.innerHTML = '<path d="m6 9 6 6 6-6"/>';
      }
    } else {
      // Show sidebar
      if (screenSize !== 'mobile') {
        scentLayout.classList.remove('sidebar-hidden');
      }

      // Update button text and icon for both buttons
      if (filterToggleText) {
        filterToggleText.textContent = gridStrings.hideFilters;
      }
      if (filterToggleTextDesktop) {
        filterToggleTextDesktop.textContent = gridStrings.hideFilters;
      }
      if (filterToggleIcon) {
        filterToggleIcon.innerHTML = '<path d="m18 15-6-6-6 6"/>';
      }
      if (filterToggleIconDesktop) {
        filterToggleIconDesktop.innerHTML = '<path d="m18 15-6-6-6 6"/>';
      }
    }

    isSidebarVisible = !isSidebarVisible;
  }

  // ========== RESIZE HANDLER ==========
  function handleResize() {
    const screenSize = getScreenSize();

    if (screenSize === 'mobile') {
      scentLayout.classList.add('sidebar-hidden');

      // Apply mobile column settings
      if (mobileColumnsCount === 1) {
        scentGrid.classList.add('mobile-single-column');
      } else {
        scentGrid.classList.remove('mobile-single-column');
      }
    } else {
      scentGrid.classList.remove('mobile-single-column');
      
      if (isSidebarVisible) {
        scentLayout.classList.remove('sidebar-hidden');
      } else {
        scentLayout.classList.add('sidebar-hidden');
      }
    }
  }

    // ========== EVENT LISTENERS ==========
    if (filterToggleButton) {
      filterToggleButton.addEventListener('click', toggleSidebar);
    }
    if (filterToggleDesktop) {
      filterToggleDesktop.addEventListener('click', toggleSidebar);
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    // ========== RECENT SEARCHES LOGIC ==========
    const MAX_RECENT_SEARCHES = 5;
    const RECENT_SEARCHES_KEY = 'shopify_recent_searches';

    function getRecentSearches() {
      try {
        const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
        return Array.isArray(searches) ? searches : [];
      } catch (e) {
        console.error("Failed to parse recent searches from localStorage", e);
        return [];
      }
    }

    function saveSearchTerm(term) {
      if (!term || typeof term !== 'string' || term.trim() === '') return;
      
      term = term.trim().toLowerCase();
      let searches = getRecentSearches();
      searches = searches.filter(s => s !== term);
      searches.unshift(term);
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
      
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      renderRecentSearches();
    }

    function renderRecentSearches() {
      if (!recentSearchesGrid) return;
      
      const searches = getRecentSearches();
      recentSearchesGrid.innerHTML = '';
      
      if (searches.length === 0) {
        recentSearchesGrid.innerHTML = '<span style="color: #888;"></span>';
        recentSearchesGrid.firstChild.textContent = gridStrings.noRecentSearches;
        return;
      }
      
      searches.forEach(term => {
        const span = document.createElement('span');
        span.classList.add('scent-overlay-tag');
        span.textContent = term.charAt(0).toUpperCase() + term.slice(1);
        span.dataset.searchTerm = term;
        span.addEventListener('click', () => {
          setOverlaySearchTerm(term);
          performSearch(term);
        });
        recentSearchesGrid.appendChild(span);
      });
    }

    // ========== SEARCH OVERLAY FUNCTIONALITY ==========
    function renderSearchProducts(productsToRender) {
      overlayProductGrid.innerHTML = '';
      
      if (productsToRender.length === 0) {
        overlayProductGrid.innerHTML = '<p class="text-center text-gray-600"></p>';
        overlayProductGrid.firstChild.textContent = gridStrings.noProducts;
        return;
      }
      
      productsToRender.forEach(product => {
        const priceFormatted = `${currSym} ${product.price.toLocaleString()}`;
        const imageUrl = product.image || '/placeholder.svg?height=600&width=600';
        const productUrl = product.url;
        
        const productCardHtml = `
          <a href="${productUrl}" class="scent-search-result-item">
            <div class="image-wrapper">
              <img src="${imageUrl}" alt="${product.title}">
            </div>
            <div class="title-price-row">
  <div class="title">${product.title}</div>
  <div class="price">${priceFormatted}</div>
</div>
           <div class="fragrance-brand">${product.vendor}</div>
          </a>
        `;
        
        overlayProductGrid.insertAdjacentHTML('beforeend', productCardHtml);
      });
    }

    function performSearch(term) {
      currentSearchTerm = term;
      saveSearchTerm(term);
      
      const filtered = allProducts.filter(product => {
        const matchesSearch =
          product.title.toLowerCase().includes(term.toLowerCase()) ||
          product.vendor.toLowerCase().includes(term.toLowerCase()) ||
          product.notes.toLowerCase().includes(term.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()));
        
        const matchesCategory =
          activeCategoryFilter === 'all' || product.tags.includes(`gender-${activeCategoryFilter}`);
        
        return matchesSearch && matchesCategory;
      });
      
      searchResultsContainer.innerHTML = '';
      overlaySearchResultsTitle.innerHTML = `See All Results for &quot;${term}&quot; (${filtered.length})`;
      searchResultsContainer.appendChild(overlaySearchResultsTitle);
      
      const allCount = allProducts.filter(p =>
        (p.title.toLowerCase().includes(term.toLowerCase()) || p.vendor.toLowerCase().includes(term.toLowerCase()) || p.notes.toLowerCase().includes(term.toLowerCase()) || p.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase())))
      ).length;
      
      const menCount = allProducts.filter(p =>
        (p.title.toLowerCase().includes(term.toLowerCase()) || p.vendor.toLowerCase().includes(term.toLowerCase()) || p.notes.toLowerCase().includes(term.toLowerCase()) || p.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))) && p.tags.includes('gender-men')
      ).length;
      
      const unisexCount = allProducts.filter(p =>
        (p.title.toLowerCase().includes(term.toLowerCase()) || p.vendor.toLowerCase().includes(term.toLowerCase()) || p.notes.toLowerCase().includes(term.toLowerCase()) || p.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))) && p.tags.includes('gender-unisex')
      ).length;

      const womenCount = allProducts.filter(p =>
  (
    p.title.toLowerCase().includes(term.toLowerCase()) ||
    p.vendor.toLowerCase().includes(term.toLowerCase()) ||
    p.notes.toLowerCase().includes(term.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
  ) && p.tags.includes('gender-women')
).length;
      
     overlayCategoryButtonsContainer.innerHTML = `
  <button class="scent-overlay-category-button ${activeCategoryFilter === 'all' ? 'active' : ''}" data-category="all">
    All (${allCount})
  </button>

  <button class="scent-overlay-category-button ${activeCategoryFilter === 'men' ? 'active' : ''}" data-category="men">
    Men (${menCount})
  </button>

  <button class="scent-overlay-category-button ${activeCategoryFilter === 'women' ? 'active' : ''}" data-category="women">
    Women (${womenCount})
  </button>

  <button class="scent-overlay-category-button ${activeCategoryFilter === 'unisex' ? 'active' : ''}" data-category="unisex">
    Unisex (${unisexCount})
  </button>
`;
      
      searchResultsContainer.appendChild(overlayCategoryButtonsContainer);
      
      overlayCategoryButtonsContainer.querySelectorAll('.scent-overlay-category-button').forEach(button => {
        button.addEventListener('click', (e) => {
          activeCategoryFilter = e.target.dataset.category;
          performSearch(currentSearchTerm);
        });
      });
      
      searchResultsContainer.appendChild(overlayProductGrid);
      renderSearchProducts(filtered);
      
      const recentSearches = document.querySelector('.scent-overlay-recent-searches');
      if (recentSearches) recentSearches.style.display = 'none';
      const sec3 = document.querySelector('.scent-overlay-section:nth-of-type(3)');
      if (sec3) sec3.style.display = 'none';
      const sec4 = document.querySelector('.scent-overlay-section:nth-of-type(4)');
      if (sec4) sec4.style.display = 'none';
      const sec5 = document.querySelector('.scent-overlay-section:nth-of-type(5)');
      if (sec5) sec5.style.display = 'none';
    }

    function resetSearchOverlayContent() {
      searchResultsContainer.innerHTML = '';
      const recentSearches = document.querySelector('.scent-overlay-recent-searches');
      if (recentSearches) recentSearches.style.display = 'block';
      const sec3 = document.querySelector('.scent-overlay-section:nth-of-type(3)');
      if (sec3) sec3.style.display = 'block';
      const sec4 = document.querySelector('.scent-overlay-section:nth-of-type(4)');
      if (sec4) sec4.style.display = 'block';
      const sec5 = document.querySelector('.scent-overlay-section:nth-of-type(5)');
      if (sec5) sec5.style.display = 'block';
    }

    function openSearchOverlay(searchTerm = '', shouldFocus = true) {
      initialSearchBar.style.display = 'none';
      searchExpandedOverlay.classList.add('open');
      overlaySearchInput.value = searchTerm;
      
      // Only focus if shouldFocus is true (prevents keyboard from opening on mobile when clicking +)
      if (shouldFocus) {
        overlaySearchInput.focus();
      }
      
      renderRecentSearches();
      currentSearchTerm = searchTerm;
      activeCategoryFilter = 'all';
      
      if (searchTerm.trim() !== '') {
        performSearch(searchTerm);
      } else {
        resetSearchOverlayContent();
      }
    }

    function closeSearchOverlay() {
      searchExpandedOverlay.classList.remove('open');
      searchExpandedOverlay.addEventListener('transitionend', () => {
        initialSearchBar.style.display = 'flex';
        overlaySearchInput.value = '';
        currentSearchTerm = '';
        resetSearchOverlayContent();
      }, { once: true });
    }

    function setOverlaySearchTerm(term) {
      overlaySearchInput.value = term;
      performSearch(term);
    }

    // ========== SEARCH EVENT LISTENERS ==========
    if (mainSearchInput) {
      mainSearchInput.addEventListener('focus', () => openSearchOverlay(mainSearchInput.value, true));
    }

    if (openSearchFromPlus) {
      openSearchFromPlus.addEventListener('click', () => openSearchOverlay(mainSearchInput.value, false)); // Don't auto-focus when clicking +
    }

    if (closeSearchOverlayButton) {
      closeSearchOverlayButton.addEventListener('click', closeSearchOverlay);
    }

    if (overlaySearchInput) {
      overlaySearchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          performSearch(overlaySearchInput.value);
        } else {
          if (overlaySearchInput.value.trim() !== '') {
            performSearch(overlaySearchInput.value);
          } else {
            resetSearchOverlayContent();
          }
        }
      });
    }

    if (overlaySearchButton) {
      overlaySearchButton.addEventListener('click', () => {
        performSearch(overlaySearchInput.value);
      });
    }

    searchTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const searchTerm = tag.dataset.searchTerm || tag.textContent.trim();
        openSearchOverlay(searchTerm, true);
      });
    });

    renderRecentSearches();

    // ========== FILTER LOGIC ==========
    const filterCheckboxes = document.querySelectorAll('.scent-sidebar input[type=checkbox]');
    filterCheckboxes.forEach(cb => {
      cb.addEventListener('change', applyFilters);
    });

    function applyFilters() {
      // The grid's cards only: other sections on the page (a featured scent below the
      // grid) carry no filter data, and reading theirs threw before the counts ran.
      const cards = document.querySelectorAll('#scentGrid .fragrance-item');
      const ranges = Array.from(document.querySelectorAll('.filter-range:checked'))
        .map(cb => ({min: parseInt(cb.dataset.min), max: parseInt(cb.dataset.max), variantIndex: parseInt(cb.dataset.variantIndex)}));
      const sizes = Array.from(document.querySelectorAll('.filter-size:checked'))
        .map(cb => ({value: cb.value, variantIndex: parseInt(cb.dataset.variantIndex)}));
      const genders = Array.from(document.querySelectorAll('.filter-gender:checked')).map(cb => cb.value);
      const types = Array.from(document.querySelectorAll('.filter-type:checked')).map(cb => cb.value);
      const ingredients = Array.from(document.querySelectorAll('.filter-ingredient:checked')).map(cb => cb.value);

      let currentFilterCount = 0;
      if (ranges.length > 0) currentFilterCount++;
      if (sizes.length > 0) currentFilterCount++;
      if (genders.length > 0) currentFilterCount++;
      if (types.length > 0) currentFilterCount++;
      if (ingredients.length > 0) currentFilterCount++;

      const fc = document.getElementById('filterCount');
      if (fc) fc.textContent = `(${currentFilterCount})`;
      const fcd = document.getElementById('filterCountDesktop');
      if (fcd) fcd.textContent = `(${currentFilterCount})`;

      cards.forEach(card => {
        const price = parseInt(card.dataset.price);
        const genderTags = card.dataset.gender;
        const typeTags = card.dataset.type;
        const ingredientTags = card.dataset.ingredient;

        const matchPrice = ranges.length === 0 || ranges.some(r => price >= r.min && price <= r.max);
        const matchGender = genders.length === 0 || genders.some(g => genderTags.includes(g));
        const matchType = types.length === 0 || types.some(t => typeTags.includes(t));
        const matchIngredient = ingredients.length === 0 || ingredients.some(i => ingredientTags.includes(i));
        
        const matchSize = sizes.length === 0 || sizes.some(s => {
          const variantBtns = card.querySelectorAll('.variant-option-btn');
          // Ensure the variant button exists at the specified index
          return variantBtns.length > s.variantIndex && variantBtns[s.variantIndex] !== undefined;
        });

        // '' hands display back to the card's own CSS (flex), as on every other page
        card.style.display = (matchPrice && matchGender && matchType && matchIngredient && matchSize) ? '' : 'none';

        if (matchPrice && matchGender && matchType && matchIngredient && matchSize) {
          const variantBtns = card.querySelectorAll('.variant-option-btn');
          
          // Reset to the first variant if only size is selected, or if no specific price/size filter is active
          // This ensures a default selection when other filters are applied/removed.
          if (sizes.length > 0) {
            const selectedSize = sizes[0];
            const targetBtn = variantBtns[selectedSize.variantIndex];
            if (targetBtn) {
              variantBtns.forEach(btn => btn.classList.remove('active'));
              targetBtn.classList.add('active');
              const priceElement = card.querySelector('[data-price-display]');
              if (priceElement) {
                priceElement.textContent = targetBtn.dataset.variantPriceRaw ? currSym + (parseInt(targetBtn.dataset.variantPriceRaw) / 100).toFixed(2) : priceElement.textContent;
              }
            }
          } else if (ranges.length > 0) {
            // If price range is selected, try to match the variant that falls within that range
            const selectedRange = ranges[0];
            let targetBtn = variantBtns.find(btn => {
              const variantPrice = parseInt(btn.dataset.variantPriceRaw);
              return variantPrice >= selectedRange.min * 100 && variantPrice <= selectedRange.max * 100;
            });

            // Fallback to the variant defined by the variantIndex if no price match found directly
            if (!targetBtn) {
              targetBtn = variantBtns[selectedRange.variantIndex];
            }

            if (targetBtn) {
              variantBtns.forEach(btn => btn.classList.remove('active'));
              targetBtn.classList.add('active');
              const priceElement = card.querySelector('[data-price-display]');
              if (priceElement) {
                priceElement.textContent = targetBtn.dataset.variantPriceRaw ? currSym + (parseInt(targetBtn.dataset.variantPriceRaw) / 100).toFixed(2) : priceElement.textContent;
              }
            }
          } else if (genders.length === 0 && types.length === 0 && ingredients.length === 0 && sizes.length === 0) {
             // When no filters are active or when gender, scent families, or ingredients are unticked, reset to the first variant
             if (variantBtns[0]) {
                variantBtns.forEach(btn => btn.classList.remove('active'));
                variantBtns[0].classList.add('active');
                const priceElement = card.querySelector('[data-price-display]');
                if (priceElement && variantBtns[0].dataset.variantPriceRaw) {
                  priceElement.textContent = currSym + (parseInt(variantBtns[0].dataset.variantPriceRaw) / 100).toFixed(2);
                }
              }
          } else {
             // Default case: if no specific filter logic applies above, reset to the first variant
             // This handles cases where filters are cleared or changed
              if (variantBtns[0]) {
                variantBtns.forEach(btn => btn.classList.remove('active'));
                variantBtns[0].classList.add('active');
                const priceElement = card.querySelector('[data-price-display]');
                if (priceElement && variantBtns[0].dataset.variantPriceRaw) {
                  priceElement.textContent = currSym + (parseInt(variantBtns[0].dataset.variantPriceRaw) / 100).toFixed(2);
                }
              }
          }
        }
      });
    }
    
    applyFilters(); // Initial application of filters on load
  });

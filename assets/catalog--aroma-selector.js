/* The scent notes selector. Its data from #aromaData, wording from #aromaStrings. Moved from sections/catalog--aroma-selector.liquid. */
      const aromaData = JSON.parse((document.getElementById('aromaData') || {}).textContent || '{}');
      const aromaStrings = JSON.parse((document.getElementById('aromaStrings') || {}).textContent || '{}');

      let activeExpandedContent = null;
      let currentProductIndex = {};

      // Initialize current product index for each category
      Object.keys(aromaData).forEach(category => {
        currentProductIndex[category] = 0;
      });

      function setBlockBackgrounds() {
        const isMobile = window.innerWidth <= 1024;
        document.querySelectorAll('.aroma-block').forEach(block => {
          const category = block.dataset.category;
          if (aromaData[category] && aromaData[category].length > 0) {
            const currentIndex = currentProductIndex[category] || 0;
            const imageUrl = isMobile
              ? aromaData[category][currentIndex].categoryImageMobile
              : aromaData[category][currentIndex].categoryImage;
            block.style.backgroundImage = `url('${imageUrl}')`;
          }
        });
      }

      function resetDesktopView() {
        const centerImage = document.getElementById('aromaImage');
        const productTitle = document.getElementById('productTitle');
        const aromaDetails = document.getElementById('aromaDetails');
        const paginationNumbers = document.getElementById('paginationNumbers');
        const categoryDots = document.getElementById('categoryDots');

        centerImage.style.backgroundImage = 'none';
        centerImage.classList.add('default-state');
        productTitle.textContent = productTitle.dataset.defaultTitle;

        paginationNumbers.style.display = 'none';
        categoryDots.style.display = 'flex';

        aromaDetails.innerHTML = '';
      }

      function selectProduct(category, productIndex) {
        currentProductIndex[category] = productIndex;

        // Update block background
        setBlockBackgrounds();

        // If this category is currently selected, update the main display
        const activeBlock = document.querySelector('.aroma-block.active');
        if (activeBlock && activeBlock.dataset.category === category) {
          selectAroma(category, activeBlock, productIndex);
        }
      }

      // Prevent body scroll function - only prevent if not scrolling inside modal
      function preventScroll(e) {
        const modalContent = document.getElementById('modalContent');
        const modalOverlay = document.getElementById('modalOverlay');

        // Allow scroll inside modal content
        if (modalContent && modalContent.contains(e.target)) {
          return;
        }

        // Prevent scroll on overlay background
        if (modalOverlay && modalOverlay.classList.contains('active')) {
          e.preventDefault();
        }
      }

      function disableBodyScroll() {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.addEventListener('touchmove', preventScroll, { passive: false });
        document.documentElement.addEventListener('touchmove', preventScroll, { passive: false });
        document.addEventListener('touchmove', preventScroll, { passive: false });
      }

      function enableBodyScroll() {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.removeEventListener('touchmove', preventScroll);
        document.documentElement.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      }

      function closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
        // Re-enable body scrolling
        enableBodyScroll();
      }

      function selectAroma(category, element, productIndex = null) {
        const isMobile = window.innerWidth <= 1024;

        if (productIndex === null) {
          productIndex = currentProductIndex[category] || 0;
        } else {
          currentProductIndex[category] = productIndex;
        }

        const data = aromaData[category][productIndex];

        // Remove active class from all blocks
        document.querySelectorAll('.aroma-block').forEach(block => block.classList.remove('active'));

        // Add active class to clicked element
        if (element) {
          element.classList.add('active');
        }

        if (isMobile) {
          // Create modal content
          const modalContent = document.getElementById('modalContent');
          if (!modalContent) return;

          // Clear existing content (except close button)
          const closeBtn = modalContent.querySelector('.modal-close-btn');
          modalContent.innerHTML = '';
          if (closeBtn) modalContent.appendChild(closeBtn);

          // Get all products for this category
          const categoryProducts = aromaData[category];

          const carouselContainer = document.createElement('div');
          carouselContainer.className = 'modal-carousel-container';

          const carouselTrack = document.createElement('div');
          carouselTrack.className = 'modal-carousel-track';

          let currentCarouselIndex = productIndex;
          let startX = 0;
          let isDragging = false;

          // Create carousel items for all products in category
          categoryProducts.forEach((product, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'modal-carousel-item';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'modal-product-image-container';
            imageContainer.style.backgroundImage = `url('${product.productImage}')`; // Changed to product.productImage
            imageContainer.style.cursor = 'pointer';
            imageContainer.onclick = () => (window.location.href = product.productUrl);

            const productTitle = document.createElement('div');
            productTitle.className = 'modal-product-title';
            productTitle.textContent = product.productName;

            imageContainer.appendChild(productTitle);
            carouselItem.appendChild(imageContainer);

            carouselTrack.appendChild(carouselItem);
          });

          carouselContainer.appendChild(carouselTrack);
          modalContent.appendChild(carouselContainer);

          let touchStartX = 0;
          let touchEndX = 0;

          function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
              if (diff > 0 && currentCarouselIndex < categoryProducts.length - 1) {
                // Swiped left - go to next product
                currentCarouselIndex++;
              } else if (diff < 0 && currentCarouselIndex > 0) {
                // Swiped right - go to previous product
                currentCarouselIndex--;
              }
              updateCarouselPosition();
              updatePaginationNumbers();
            }
          }

          function updateCarouselPosition() {
            const offset = -currentCarouselIndex * 100;
            carouselTrack.style.transform = `translateX(${offset}%)`;
          }

          function updatePaginationNumbers() {
            // Update number indicators
            const numbers = modalContent.querySelectorAll('.modal-pagination-number');
            numbers.forEach((num, idx) => {
              num.classList.remove('active');
              if (idx === currentCarouselIndex) {
                num.classList.add('active');
              }
            });

            // Update details content
            const detailsDiv = modalContent.querySelector('.modal-details-content');
            const currentProduct = categoryProducts[currentCarouselIndex];
            if (detailsDiv) {
              detailsDiv.innerHTML = `
                            <div class="fragrance-notes">
                                <div class="note-row">
                                    <span class="note-label">${aromaStrings.top}</span>
                                    <span class="note-value">${currentProduct.topNote}</span>
                                </div>
                                <div class="note-row">
                                    <span class="note-label">${aromaStrings.heart}</span>
                                    <span class="note-value">${currentProduct.heartNote}</span>
                                </div>
                                <div class="note-row">
                                    <span class="note-label">${aromaStrings.base}</span>
                                    <span class="note-value">${currentProduct.baseNote}</span>
                                </div>
                            </div>
                            <div class="mood-section">
                                <div class="mood-label">${aromaStrings.mood}</div>
                                <div class="mood-description">
                                    ${currentProduct.moodDescription}
                                </div>
                            </div>
                            <a href="${currentProduct.productUrl}" class="shop-button">
                                ${aromaStrings.shop.replace('[name]', () => currentProduct.productName)}
                            </a>
                        `;
            }
          }

          carouselContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            isDragging = true;
          });

          carouselContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (isDragging) {
              handleSwipe();
              isDragging = false;
            }
          });

          // Support mouse drag as well
          carouselContainer.addEventListener('mousedown', e => {
            touchStartX = e.clientX;
            isDragging = true;
          });

          carouselContainer.addEventListener('mouseup', e => {
            touchEndX = e.clientX;
            if (isDragging) {
              handleSwipe();
              isDragging = false;
            }
          });

          // Create pagination numbers container
          const paginationContainer = document.createElement('div');
          paginationContainer.className = 'modal-pagination-numbers';

          categoryProducts.forEach((_, index) => {
            const numberElement = document.createElement('div');
            numberElement.className = 'modal-pagination-number';
            if (index === currentCarouselIndex) {
              numberElement.classList.add('active');
            }
            numberElement.textContent = String(index + 1).padStart(2, '0');
            numberElement.onclick = e => {
              e.stopPropagation();
              currentCarouselIndex = index;
              updateCarouselPosition();
              updatePaginationNumbers();
            };
            paginationContainer.appendChild(numberElement);
          });

          carouselContainer.appendChild(paginationContainer);

          // Add details content
          const detailsContent = document.createElement('div');
          detailsContent.className = 'modal-details-content';
          const initialProduct = categoryProducts[productIndex];
          detailsContent.innerHTML = `
                    <div class="fragrance-notes">
                        <div class="note-row">
                            <span class="note-label">${aromaStrings.top}</span>
                            <span class="note-value">${initialProduct.topNote}</span>
                        </div>
                        <div class="note-row">
                            <span class="note-label">${aromaStrings.heart}</span>
                            <span class="note-value">${initialProduct.heartNote}</span>
                        </div>
                        <div class="note-row">
                            <span class="note-label">${aromaStrings.base}</span>
                            <span class="note-value">${initialProduct.baseNote}</span>
                        </div>
                    </div>
                    <div class="mood-section">
                        <div class="mood-label">${aromaStrings.mood}</div>
                        <div class="mood-description">
                            ${initialProduct.moodDescription}
                        </div>
                    </div>
                    <a href="${initialProduct.productUrl}" class="shop-button">
                        ${aromaStrings.shop.replace('[name]', () => initialProduct.productName)}
                    </a>
                `;
          modalContent.appendChild(detailsContent);

          // Show modal and prevent scrolling
          const modalOverlay = document.getElementById('modalOverlay');
          if (modalOverlay) modalOverlay.classList.add('active');
          // Disable body scrolling on mobile
          disableBodyScroll();
        } else {
          // Desktop logic (unchanged)
          const centerImage = document.getElementById('aromaImage');
          const productTitle = document.getElementById('productTitle');
          const aromaDetails = document.getElementById('aromaDetails');
          const paginationNumbers = document.getElementById('paginationNumbers');
          const categoryDots = document.getElementById('categoryDots');

          if (centerImage) {
            centerImage.classList.remove('default-state');
            centerImage.style.backgroundImage = `url('${data.productImage}')`;
            centerImage.style.backgroundSize = 'cover';
            centerImage.style.backgroundPosition = 'center';
            centerImage.style.backgroundRepeat = 'no-repeat';
          }

          if (productTitle) productTitle.textContent = data.productName;

          // Show/hide pagination based on product count
          if (aromaData[category].length > 1) {
            if (paginationNumbers) {
              paginationNumbers.style.display = 'flex';
              paginationNumbers.innerHTML = '';
              aromaData[category].forEach((product, index) => {
                const numberElement = document.createElement('div');
                numberElement.classList.add('pagination-number');
                if (index === productIndex) {
                  numberElement.classList.add('active');
                }
                numberElement.textContent = String(index + 1).padStart(2, '0');
                numberElement.onclick = e => {
                  e.stopPropagation();
                  selectProduct(category, index);
                };
                paginationNumbers.appendChild(numberElement);
              });
            }
            if (categoryDots) categoryDots.style.display = 'none';
          } else {
            if (paginationNumbers) paginationNumbers.style.display = 'none';
            if (categoryDots) categoryDots.style.display = 'flex';
          }

          if (aromaDetails) {
            aromaDetails.innerHTML = `
                        <div class="fragrance-notes">
                            <div class="note-row">
                                <span class="note-label">${aromaStrings.top}</span>
                                <span class="note-value">${data.topNote}</span>
                            </div>
                            <div class="note-row">
                                <span class="note-label">${aromaStrings.heart}</span>
                                <span class="note-value">${data.heartNote}</span>
                            </div>
                            <div class="note-row">
                                <span class="note-label">${aromaStrings.base}</span>
                                <span class="note-value">${data.baseNote}</span>
                            </div>
                        </div>
                        <div class="mood-section">
                            <div class="mood-label">${aromaStrings.mood}</div>
                            <div class="mood-description">
                                ${data.moodDescription}
                            </div>
                        </div>
                        <a href="${data.productUrl}" class="shop-button">
                            ${aromaStrings.shop.replace('[name]', () => data.productName)}
                        </a>
                    `;
          }

          // Update category pagination dot for desktop
          document.querySelectorAll('.pagination-dot').forEach(dot => dot.classList.remove('active'));
          const blocks = Array.from(document.querySelectorAll('.aroma-block'));
          const index = blocks.findIndex(block => block.dataset.category === category);
          if (index !== -1) {
            const dots = document.querySelectorAll('.pagination-dot');
            if (dots[index]) dots[index].classList.add('active');
          }
        }
      }

      // Initial setup on page load
      document.addEventListener('DOMContentLoaded', function () {
        setBlockBackgrounds();
        const isMobile = window.innerWidth <= 1024;
        if (!isMobile) {
          const firstBlock = document.querySelector('.aroma-block.active') || document.querySelector('.aroma-block');
          if (firstBlock) {
            selectAroma(firstBlock.dataset.category, firstBlock);
          }
        } else {
          const aromaImg = document.getElementById('aromaImage');
          if (aromaImg) aromaImg.style.display = 'none';
          const aromaDet = document.getElementById('aromaDetails');
          if (aromaDet) aromaDet.style.display = 'none';
        }
      });

      // Handle window resize
      window.addEventListener('resize', function () {
        setBlockBackgrounds();
        const isMobile = window.innerWidth <= 1024;
        const aromaImg = document.getElementById('aromaImage');
        const aromaDet = document.getElementById('aromaDetails');
        if (!isMobile) {
          if (aromaImg) aromaImg.style.display = 'flex';
          if (aromaDet) aromaDet.style.display = 'flex';
          if (activeExpandedContent) {
            activeExpandedContent.remove();
            activeExpandedContent = null;
          }
          const firstBlock = document.querySelector('.aroma-block');
          if (firstBlock) {
            selectAroma(firstBlock.dataset.category, firstBlock);
          }
        } else {
          if (aromaImg) aromaImg.style.display = 'none';
          if (aromaDet) aromaDet.style.display = 'none';
          if (activeExpandedContent) {
            activeExpandedContent.remove();
            activeExpandedContent = null;
          }
        }
      });

      // Prevent mobile expanded content from closing on scroll
      document.addEventListener(
        'scroll',
        function (e) {
          // Don't close expanded content on scroll
        },
        { passive: true }
      );

      // Prevent touch events from closing expanded content
      document.addEventListener(
        'touchmove',
        function (e) {
          // Don't close expanded content on touch move
        },
        { passive: true }
      );

      const modalOverlayEl = document.getElementById('modalOverlay');
      if (modalOverlayEl) {
        modalOverlayEl.addEventListener('click', function (e) {
          if (e.target === this) {
            closeModal();
          }
        });
      }
    

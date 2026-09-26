/* The product page's image modal. Moved from sections/catalog--product-custom.liquid. */
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('psImageModal');
  const modalImage = document.getElementById('psModalImage');
  const modalClose = document.querySelector('.ps-modal-close');

  document.querySelectorAll('.ps-gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const video = item.querySelector('video');

      modal.classList.add('active');

      if (video) {
        modalImage.style.display = 'none';
        document.getElementById('psModalVideo').style.display = 'block';

        document.getElementById('psModalVideo').src = video.currentSrc || video.querySelector('source')?.src;
        document.getElementById('psModalVideo').play();
      } else if (img) {
        document.getElementById('psModalVideo').pause();
        document.getElementById('psModalVideo').style.display = 'none';

        modalImage.style.display = 'block';
        modalImage.src = img.dataset.full || img.src;
      }
    });
  });

  modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  function updatePaginationDots() {
    const gallery = document.getElementById('psProductGallery');
    const dotsContainer = document.getElementById('psPaginationDots');
    
    if (window.innerWidth > 1080) return; // Only on mobile
    
    dotsContainer.innerHTML = '';
    const itemCount = document.querySelectorAll('.ps-gallery-item').length;
    
    for (let i = 0; i < itemCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'ps-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        const item = document.querySelectorAll('.ps-gallery-item')[i];
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
      dotsContainer.appendChild(dot);
    }
    
    // improved scroll event handling with debouncing for better mobile detection
    let scrollTimeout;
    const updateActiveDot = () => {
      const scrollLeft = gallery.scrollLeft;
      const itemWidth = gallery.offsetWidth;
      const currentIndex = Math.round(scrollLeft / itemWidth);
      
      document.querySelectorAll('.ps-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    };
    
    gallery.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveDot, 50);
    }, { passive: true });
    
    let touchStartX = 0;
    gallery.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    gallery.addEventListener('touchend', () => {
      updateActiveDot();
    }, { passive: true });
  }
  
  updatePaginationDots();
  window.addEventListener('resize', updatePaginationDots);
});

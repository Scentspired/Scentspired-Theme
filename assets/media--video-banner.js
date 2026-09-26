/* The homepage video banner: loads the video by device and connection. Moved from sections/media--video-banner.liquid. */
  // Smart video loading based on device and network
  function initializeVideoBanners() {
    const isMobile = window.innerWidth < 768;
    const videoId = isMobile ? 'main-video-mobile' : 'main-video-desktop';
    const posterId = isMobile ? 'poster-mobile' : 'poster-desktop';
    const video = document.getElementById(videoId);
    const poster = document.getElementById(posterId);

    if (!video) return;

    video.muted = true;

    // Desktop: Autoplay immediately
    if (!isMobile) {
      video.preload = 'auto';
      // Slight delay to ensure poster is visible first
      setTimeout(() => {
        video.play().catch(e => {
          console.warn('[v0] Desktop autoplay skipped');
        });
      }, 100);
    }
    // Mobile: Load on first interaction to save bandwidth
    else {
      video.preload = 'none';

      const playVideoOnInteraction = () => {
        // Add loading state
        video.style.opacity = '0';
        video.preload = 'auto';
        video.load();

        video.addEventListener(
          'canplay',
          () => {
            video.style.opacity = '1';
            video.play().catch(e => {
              console.warn('[v0] Mobile play failed');
            });
          },
          { once: true }
        );

        document.removeEventListener('click', playVideoOnInteraction);
        document.removeEventListener('touchstart', playVideoOnInteraction);
      };

      document.addEventListener('click', playVideoOnInteraction, { once: true });
      document.addEventListener('touchstart', playVideoOnInteraction, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVideoBanners);
  } else {
    initializeVideoBanners();
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initializeVideoBanners, 300);
  });

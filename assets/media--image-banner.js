/* Makes a linked image banner clickable. Reads its section id from its script tag (data-section-id). Moved from sections/media--image-banner.liquid. */
    (function () {
      var banner = document.getElementById('Banner-' + document.currentScript.dataset.sectionId);
      if (!banner) return;

      function go(newTab) {
        var url = banner.getAttribute('data-banner-link');
        if (!url) return;
        if (newTab === 'true') {
          window.open(url, '_blank', 'noopener');
        } else {
          window.location.href = url;
        }
      }

      banner.addEventListener('click', function (event) {
        // If the click landed on a real link/button inside the banner
        // (e.g. the CTA buttons), let that link do its own thing.
        if (event.target.closest('a, button')) return;
        go(banner.getAttribute('data-banner-link-new-tab'));
      });

      banner.addEventListener('keydown', function (event) {
        if (event.target !== banner) return; // ignore keydown from focused children
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          go(banner.getAttribute('data-banner-link-new-tab'));
        }
      });
    })();
  

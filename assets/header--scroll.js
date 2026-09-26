/* The header on scroll: hidden scrolling down, shown scrolling up (desktop), and the mobile bottom bar kept out of the header. Two handlers, as they were. Moved from layout/theme.liquid. */
      (function () {
        let lastScroll = 0;
        const header = document.querySelector('.header');

        if (!header) return;

        window.addEventListener('scroll', () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

          if (window.innerWidth <= 768) return;

          if (scrollTop > lastScroll && scrollTop > 50) {
            header.classList.add('scroll-hidden');
          } else if (scrollTop < lastScroll) {
            header.classList.remove('scroll-hidden');
          }

          if (scrollTop <= 0) {
            header.classList.remove('scroll-hidden');
          }

          lastScroll = scrollTop;
        });
      })();
    

      (function () {
        // Wait for DOM ready
        document.addEventListener('DOMContentLoaded', function () {
          // 1) Find header candidates and decide which is main desktop header
          // Try to find .section-header .header first (common in Dawn-like themes)
          var candidate =
            document.querySelector('.section-header .header') ||
            document.querySelector('.section-header') ||
            document.querySelector('.header');
          if (!candidate) return;

          // Ensure a stable "main-desktop-header" class exists
          // If candidate is nested (like .section-header .header), we want the topmost header element.
          var mainHeader = candidate.closest('.section-header') || candidate;
          mainHeader.classList.add('main-desktop-header');

          // 2) Locate mobile bottom nav element(s)
          var mobileNav =
            document.querySelector('.mobile-bottom-nav') || document.querySelector('[data-mobile-bottom-nav]');

          // If mobile nav exists and is inside the header, move it to body so it doesn't get hidden with header
          if (mobileNav) {
            if (mainHeader.contains(mobileNav)) {
              // move node to body end
              document.body.appendChild(mobileNav);
            }
            // ensure the mobile nav has the class
            mobileNav.classList.add('mobile-bottom-nav');
          }

          // 3) Scroll-up behavior only affects desktop header
          var header = document.querySelector('.main-desktop-header');
          if (!header) return;

          var lastScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
          var ticking = false;

          // Debounced rAF-driven scroll handler for smoothness
          function onScroll() {
            if (window.innerWidth <= 768) {
              // On mobile we don't hide the header — ensure visible
              header.classList.remove('scroll-hidden');
              lastScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
              return;
            }

            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

            if (scrollTop > lastScroll && scrollTop > 60) {
              // scrolling down -> hide
              header.classList.add('scroll-hidden');
            } else if (scrollTop < lastScroll) {
              // scrolling up -> show
              header.classList.remove('scroll-hidden');
            }

            // always show at very top
            if (scrollTop <= 0) {
              header.classList.remove('scroll-hidden');
            }

            lastScroll = scrollTop;
            ticking = false;
          }

          window.addEventListener(
            'scroll',
            function () {
              if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
              }
            },
            { passive: true }
          );

          // Extra safety: if the header is re-rendered by theme scripts later,
          // re-apply class and re-append mobile nav (in case DOM was replaced)
          var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
              // if header lost the class, re-add it
              if (!document.querySelector('.main-desktop-header')) {
                var newCandidate =
                  document.querySelector('.section-header .header') ||
                  document.querySelector('.section-header') ||
                  document.querySelector('.header');
                if (newCandidate) {
                  var newMain = newCandidate.closest('.section-header') || newCandidate;
                  newMain.classList.add('main-desktop-header');
                  header = document.querySelector('.main-desktop-header');
                }
              }
              if (mobileNav && !document.body.contains(mobileNav)) {
                // re-append if removed
                document.body.appendChild(mobileNav);
              }
            });
          });

          observer.observe(document.body, { childList: true, subtree: true });
        }); // DOMContentLoaded
      })();
    

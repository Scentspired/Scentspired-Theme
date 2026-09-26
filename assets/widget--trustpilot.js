/* Moves the Trustpilot widget between its desktop and mobile slots. Moved from snippets/widget--trustpilot.liquid. */
        (function () {
          function moveTrustpilotWidget() {
            var widget = document.getElementById('trustpilot-widget-trustbox-0-wrapper');
            if (!widget) return;

            var isDesktop = window.matchMedia('(min-width: 1025px)').matches;
            var targetSlot = document.getElementById(
              isDesktop ? 'trustpilot-desktop-slot' : 'trustpilot-mobile-slot'
            );

            if (targetSlot && widget.parentElement !== targetSlot) {
              targetSlot.appendChild(widget);
            }
          }

          // Trustpilot injects its widget asynchronously, so poll briefly until it appears
          var attempts = 0;
          var poll = setInterval(function () {
            attempts++;
            if (document.getElementById('trustpilot-widget-trustbox-0-wrapper')) {
              moveTrustpilotWidget();
              clearInterval(poll);
            }
            if (attempts > 40) clearInterval(poll); // give up after ~10s
          }, 250);

          var resizeTimer;
          window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(moveTrustpilotWidget, 200);
          });
        })();
      

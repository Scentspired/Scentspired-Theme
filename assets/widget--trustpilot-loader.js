/* Loads Trustpilot's widget script once. Moved from snippets/widget--trustpilot-embed.liquid. */
      if (!window.Trustpilot && !document.querySelector('script[src*="tp.widget.bootstrap"]')) {
        var tp = document.createElement('script');
        tp.type = 'text/javascript';
        tp.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
        tp.async = true;
        document.head.appendChild(tp);
      }
    

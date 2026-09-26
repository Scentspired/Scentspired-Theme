/* Sends a visitor to their country's storefront (not crawlers). The country -> storefront table is #regionGeoMap, generated from the published regions. Moved from layout/theme.liquid. */
      (async function () {
        // Country -> storefront table, generated from the published regions.
        // Adding a storefront changes this data, never this code.
        var REGIONS = JSON.parse((document.getElementById('regionGeoMap') || {}).textContent || '[]');

        // Skip redirect for search engine crawlers so each storefront stays indexable
        var ua = navigator.userAgent.toLowerCase();
        var isBot =
          /bot|googlebot|crawler|spider|crawling|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit/.test(
            ua
          );
        if (isBot) return;

        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (!data || !data.country) return;

          const match = REGIONS.find(function (r) { return r.country === data.country; });
          if (!match) return;

          const host = match.url.replace(/^https?:\/\//, '');
          if (!location.hostname.includes(host)) {
            location.replace(match.url + location.pathname);
          }
        } catch (e) {}
      })();
    

/* Page classes set before the page paints: shopify-design-mode in the theme editor, and the header colour by page (black-header / white-header). Moved from layout/theme.liquid. */
      if (Shopify.designMode) {
        document.documentElement.classList.add('shopify-design-mode');
      }
    

      (function () {
        // Normalize URL
        const currentUrl = window.location.pathname.replace(/\/$/, '') || '/';

        // Pages that should have BLACK header
        const blackHeaderExact = [
          '/',
          '/pages/privacy-policy',
          '/pages/faq',
          '/pages/faqs',
          '/pages/contact',
          '/pages/terms',
          '/pages/terms-and-conditions',
          '/pages/return',
          '/pages/returns',
          '/pages/fragrance-finder',
          '/pages/bundle-1',
          '/pages/disclaimer',
          '/account',
          '/account/login',
          '/account/register',
          '/account/addresses',
          '/cart',
        ];

        // Pages that should be black if URL starts with this
        const blackHeaderStartsWith = ['/products/'];

        const shouldBeBlack =
          blackHeaderExact.includes(currentUrl) || blackHeaderStartsWith.some(path => currentUrl.startsWith(path));

        if (shouldBeBlack) {
          document.documentElement.classList.add('black-header');
          document.documentElement.classList.remove('white-header');
        } else {
          document.documentElement.classList.add('white-header');
          document.documentElement.classList.remove('black-header');
        }
      })();
    

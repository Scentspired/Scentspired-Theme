/* Telemetry set-up: the page's context for Sentry and the error reporter, from #telemetryConfig. Moved from snippets/core--telemetry.liquid. */
  var telemetry = JSON.parse((document.getElementById('telemetryConfig') || {}).textContent || '{}');
  window.__SCENTSPIRED_TELEMETRY__ = telemetry;

  // Initialize Sentry SDK on load
  if (window.Sentry && window.Sentry.onLoad) {
    window.Sentry.onLoad(function() {
      window.Sentry.init({
        dsn: "https://314455254b3e53ad0250625ccba3fd29@o4511982699806720.ingest.us.sentry.io/4511982711275520",
        tracesSampleRate: 1.0,
        ignoreErrors: [
          'Failed to fetch dynamically imported module',
          'Importing a module script failed',
          'asset.fwcdn3.com',
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',
          'Script error.',
          'NetworkError: Load failed',
          'Load failed',
          'network error',
          'Failed to fetch'
        ],
        denyUrls: [
          /asset\.fwcdn3\.com/i,
          /connect\.facebook\.net/i,
          /clarity\.ms/i,
          /google-analytics\.com/i,
          /doubleclick\.net/i,
          /azurefd\.net/i,
          /linktr\.ee/i,
          /googletagmanager\.com/i
        ],
        beforeSend(event, hint) {
          const error = hint && hint.originalException;
          const msg = error && (error.message || String(error)) || '';
          if (
            /fwcdn3|azurefd|clarity|facebook|doubleclick|linktr\.ee|Script error/i.test(msg) ||
            (event.message && /Script error|Load failed/i.test(event.message))
          ) {
            return null;
          }
          return event;
        }
      });

      if (telemetry.customerId) {
        window.Sentry.setUser({ id: telemetry.customerId, email: telemetry.customerEmail });
      }

      window.Sentry.setContext('Shopify', {
        template: telemetry.template,
        cartItemCount: telemetry.cartItemCount,
        currency: telemetry.currency
      });
    });
  }

  // ── GitHub Issues Auto-Filer (Secure Private Repo Ingestion) ────────────
  window.__SCENTSPIRED_GITHUB_CONFIG__ = {
    endpoint: 'https://scentspired-telemetry.ahmadhassan-bted.workers.dev'
  };

/* iOS WebKit bridge shield: keeps window.webkit.messageHandlers defined so in-app browsers do not throw. Runs in the page head, before anything else. Moved from snippets/core--telemetry.liquid. */
  (function () {
    try {
      if (typeof window !== 'undefined') {
        if (!window.webkit) {
          window.webkit = { messageHandlers: {} };
        } else if (!window.webkit.messageHandlers) {
          window.webkit.messageHandlers = {};
        }
      }
    } catch (_) {}
  })();

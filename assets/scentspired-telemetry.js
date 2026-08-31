/**
 * ============================================================================
 * SCENTSPIRED GUARDIAN TELEMETRY & LIVE CRASH DISPATCHER
 * ============================================================================
 * 
 * Real-time storefront health & diagnostic telemetry:
 * 1. Global JS Runtime Error & Promise Rejection Interception
 * 2. Shopify Network Fetch Interception (/cart/add.js, /cart.js, /account)
 * 3. Breadcrumb & User Action Trail (Last 25 Interactions)
 * 4. Rage-Click & Frustration Detection (3+ taps within 1.5s)
 * 5. Instant Forwarding to Microsoft Clarity & Google Analytics (GA4)
 * 6. Local Storage Persistent Crash Vault (Last 50 Incidents)
 * 7. Live Diagnostic Floating HUD (Active via Ctrl+Shift+L or ?telemetry=live)
 * ============================================================================
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__SCENTSPIRED_GUARDIAN_INITIALIZED__) return;
  window.__SCENTSPIRED_GUARDIAN_INITIALIZED__ = true;

  const CONFIG = Object.assign({
    maxBreadcrumbs: 25,
    maxStoredLogs: 50,
    rageClickThreshold: 3,
    rageClickWindowMs: 1500,
    endpoint: window.__SCENTSPIRED_TELEMETRY_ENDPOINT__ || null,
    enableConsoleHUD: true
  }, window.__SCENTSPIRED_TELEMETRY_CONFIG__ || {});

  // Generate unique session ID for customer session correlation
  const SESSION_ID = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  const breadcrumbs = [];
  const sessionLogs = [];

  // Helper: Record a user breadcrumb
  function addBreadcrumb(category, message, metadata = {}) {
    const crumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      metadata,
      url: window.location.pathname + window.location.search
    };
    breadcrumbs.push(crumb);
    if (breadcrumbs.length > CONFIG.maxBreadcrumbs) {
      breadcrumbs.shift();
    }
  }

  // Helper: Format error payload
  function buildErrorPayload(type, errorData) {
    const context = window.__SCENTSPIRED_TELEMETRY__ || {};
    return {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sessionId: SESSION_ID,
      timestamp: new Date().toISOString(),
      type,
      message: errorData.message || String(errorData),
      stack: errorData.stack || null,
      source: errorData.source || errorData.filename || null,
      lineno: errorData.lineno || null,
      colno: errorData.colno || null,
      url: window.location.href,
      pathname: window.location.pathname,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      userAgent: navigator.userAgent,
      shopContext: {
        template: context.template || null,
        customerId: context.customerId || null,
        cartItemCount: context.cartItemCount || 0,
        currency: context.currency || 'USD',
        themeId: context.themeId || null
      },
      breadcrumbs: [...breadcrumbs]
    };
  }

  // Helper: Persist log to LocalStorage Vault
  function persistLog(payload) {
    try {
      sessionLogs.push(payload);
      const storedRaw = localStorage.getItem('scentspired_telemetry_vault');
      const stored = storedRaw ? JSON.parse(storedRaw) : [];
      stored.unshift(payload);
      if (stored.length > CONFIG.maxStoredLogs) {
        stored.length = CONFIG.maxStoredLogs;
      }
      localStorage.setItem('scentspired_telemetry_vault', JSON.stringify(stored));
    } catch (e) {
      // Storage quota exceeded or disabled in private browsing
    }
  }

  // Helper: Dispatch telemetry beacon to remote endpoint & analytics
  function dispatchTelemetry(payload) {
    persistLog(payload);

    // 1. Forward to Microsoft Clarity Custom Event & Tags
    if (typeof window.clarity === 'function') {
      try {
        window.clarity('set', 'last_error_type', payload.type);
        window.clarity('set', 'last_error_msg', (payload.message || '').substring(0, 255));
        window.clarity('event', 'scentspired_crash', {
          type: payload.type,
          message: (payload.message || '').substring(0, 100)
        });
      } catch (e) {}
    }

    // 2. Forward to Google Analytics 4 (gtag)
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'exception', {
          description: payload.message,
          fatal: payload.type === 'UNHANDLED_EXCEPTION'
        });
      } catch (e) {}
    }

    // 3. Forward to Sentry.io Enterprise Cloud
    if (typeof window.Sentry !== 'undefined' && window.Sentry.captureMessage) {
      try {
        window.Sentry.withScope(scope => {
          scope.setTag('crash_type', payload.type);
          scope.setExtra('breadcrumbs', payload.breadcrumbs);
          scope.setExtra('shopContext', payload.shopContext);
          scope.setExtra('sessionId', payload.sessionId);
          window.Sentry.captureMessage(`[Guardian] ${payload.type}: ${payload.message}`);
        });
      } catch (e) {}
    }

    // 3. Remote Webhook / Logger Dispatch (if endpoint configured)
    if (CONFIG.endpoint) {
      try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(CONFIG.endpoint, body);
        } else {
          fetch(CONFIG.endpoint, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
          }).catch(() => {});
        }
      } catch (e) {}
    }

    /*
    // Optional: WhatsApp Alert Dispatch (Commented out)
    if (window.__SCENTSPIRED_WHATSAPP_CONFIG__ && window.__SCENTSPIRED_WHATSAPP_CONFIG__.apikey && (window.__SCENTSPIRED_WHATSAPP_CONFIG__.phone || window.__SCENTSPIRED_WHATSAPP_CONFIG__.group)) {
      try {
        const apikey = window.__SCENTSPIRED_WHATSAPP_CONFIG__.apikey;
        const msg = `🚨 *SCENTSPIRED STORE ALERT*%0A• *Type:* ${payload.type}%0A• *Error:* ${encodeURIComponent((payload.message || '').substring(0, 120))}%0A• *Page:* ${encodeURIComponent(payload.pathname || '/')}%0A• *Cart:* $${((payload.shopContext && payload.shopContext.cartItemCount) || 0)} items%0A• *Device:* ${encodeURIComponent(navigator.userAgent.substring(0, 50))}`;
        let waUrl = window.__SCENTSPIRED_WHATSAPP_CONFIG__.group ? `https://api.callmebot.com/whatsapp.php?group=${encodeURIComponent(window.__SCENTSPIRED_WHATSAPP_CONFIG__.group)}&text=${msg}&apikey=${apikey}` : `https://api.callmebot.com/whatsapp.php?phone=${window.__SCENTSPIRED_WHATSAPP_CONFIG__.phone}&text=${msg}&apikey=${apikey}`;
        const img = new Image();
        img.src = waUrl;
      } catch (e) {}
    }
    */

    // ── Primary Remote Dispatch: GitHub Issues Auto-Filer ──────────────────
    if (window.__SCENTSPIRED_GITHUB_CONFIG__ && window.__SCENTSPIRED_GITHUB_CONFIG__.endpoint) {
      try {
        const ghPayload = {
          title: `🚨 [Live Telemetry] ${payload.type}: ${(payload.message || '').substring(0, 80)}`,
          body: `### Real-Time Live Session Crash Report\n\n| Attribute | Value |\n| :--- | :--- |\n| **Session ID** | \`${payload.sessionId}\` |\n| **Type** | \`${payload.type}\` |\n| **URL** | \`${payload.url}\` |\n| **Cart Items** | ${payload.shopContext ? payload.shopContext.cartItemCount : 0} |\n| **User Agent** | \`${payload.userAgent}\` |\n\n#### Error Details\n\`\`\`\n${payload.message}\n${payload.stack || ''}\n\`\`\`\n\n#### Customer Breadcrumbs (Last 10 Actions)\n\`\`\`json\n${JSON.stringify((payload.breadcrumbs || []).slice(-10), null, 2)}\n\`\`\``,
          labels: ['bug', 'live-telemetry', 'priority-high']
        };
        fetch(window.__SCENTSPIRED_GITHUB_CONFIG__.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ghPayload),
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    }

    // Update Live HUD if active
    updateLiveHUD();
  }

  // Helper: Check if error originates from noisy third-party tracking/app scripts or OS WebView bridges
  function isThirdPartyAppNoise(msg, filename) {
    const text = String(msg || '') + ' ' + String(filename || '');
    return /fwcdn3|firework|facebook\.net|doubleclick|clarity\.ms|google-analytics|googletagmanager|azurefd|linktr\.ee|monorail|shop_events_listener|ResizeObserver|Script error\.|Importing a module script failed|Failed to fetch|java object is gone|postmessage|_autofillCallbackHandler|autofillcallbackhandler/i.test(text);
  }

  // ── 1. Global Runtime Error Handler ─────────────────────────────────────────

  window.addEventListener('error', function (event) {
    if (isThirdPartyAppNoise(event.message, event.filename)) return;

    const payload = buildErrorPayload('UNHANDLED_EXCEPTION', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null
    });
    console.error('[Scentspired Guardian Telemetry] Trapped Error:', payload);
    dispatchTelemetry(payload);
  });

  // ── 2. Unhandled Promise Rejection Handler ──────────────────────────────────

  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    const msg = reason ? (reason.message || String(reason)) : 'Unhandled Promise Rejection';
    if (isThirdPartyAppNoise(msg, reason && reason.stack)) return;

    const payload = buildErrorPayload('UNHANDLED_PROMISE_REJECTION', {
      message: msg,
      stack: reason && reason.stack ? reason.stack : null
    });
    console.error('[Scentspired Guardian Telemetry] Trapped Promise Rejection:', payload);
    dispatchTelemetry(payload);
  });

  // ── 3. Shopify Network Fetch Interception ───────────────────────────────────

  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
      const isShopifyCartRoute = url.includes('/cart') || url.includes('/checkout') || url.includes('/account');
      
      const startTime = performance.now();
      addBreadcrumb('network_request', `Fetch dispatched: ${url}`);

      try {
        const response = await originalFetch.apply(this, args);
        const duration = Math.round(performance.now() - startTime);

        // Check for Shopify Cart HTTP Errors (400, 422, 500)
        if (!response.ok && isShopifyCartRoute) {
          const cloned = response.clone();
          cloned.text().then(bodyText => {
            const payload = buildErrorPayload('COMMERCE_NETWORK_ERROR', {
              message: `HTTP ${response.status} on ${url}: ${bodyText.substring(0, 300)}`,
              source: url,
              status: response.status,
              durationMs: duration
            });
            dispatchTelemetry(payload);
          }).catch(() => {});
        } else if (duration > 3500 && isShopifyCartRoute) {
          // Slow Network Warning (>3.5s)
          addBreadcrumb('network_slow', `Slow response on ${url} (${duration}ms)`);
        }

        return response;
      } catch (networkError) {
        const duration = Math.round(performance.now() - startTime);
        if (isShopifyCartRoute) {
          const payload = buildErrorPayload('NETWORK_DISCONNECTION', {
            message: `Network failure on ${url}: ${networkError.message}`,
            stack: networkError.stack,
            source: url,
            durationMs: duration
          });
          dispatchTelemetry(payload);
        }
        throw networkError;
      }
    };
  }

  // ── 4. Rage Click & Interaction Tracker ─────────────────────────────────────

  let lastClickTarget = null;
  let clickCount = 0;
  let clickTimer = null;

  document.addEventListener('click', function (e) {
    const target = e.target;
    const tagName = target.tagName ? target.tagName.toLowerCase() : '';
    const textSnippet = (target.innerText || target.value || target.getAttribute('aria-label') || '').substring(0, 30).trim();
    const identifier = target.id ? `#${target.id}` : (target.className && typeof target.className === 'string' ? `.${target.className.trim().split(/\s+/).join('.')}` : tagName);

    addBreadcrumb('click', `Clicked <${tagName}> ${identifier}: "${textSnippet}"`);

    // Rage click tracking on interactive elements
    if (target === lastClickTarget) {
      clickCount++;
      if (clickCount >= CONFIG.rageClickThreshold) {
        const payload = buildErrorPayload('RAGE_CLICK_DETECTED', {
          message: `Rage click detected (${clickCount} clicks in <${tagName}> ${identifier})`,
          source: identifier
        });
        dispatchTelemetry(payload);
        clickCount = 0;
      }
    } else {
      lastClickTarget = target;
      clickCount = 1;
    }

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      clickCount = 0;
      lastClickTarget = null;
    }, CONFIG.rageClickWindowMs);
  }, { passive: true });

  // ── 5. Form Submission Tracking ─────────────────────────────────────────────

  document.addEventListener('submit', function (e) {
    const form = e.target;
    const formId = form.id ? `#${form.id}` : '';
    const formAction = form.action || '';
    addBreadcrumb('form_submit', `Submitted form ${formId} action="${formAction}"`);
  }, { passive: true });

  // ── 6. Live Diagnostic HUD (Floating Admin Interface) ──────────────────────

  let hudContainer = null;

  function createLiveHUD() {
    if (hudContainer || document.getElementById('scentspired-telemetry-hud')) return;

    hudContainer = document.createElement('div');
    hudContainer.id = 'scentspired-telemetry-hud';
    hudContainer.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 320px;
      max-height: 420px;
      background: #121212;
      color: #00ff66;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 11px;
      border: 1px solid #00ff66;
      border-radius: 8px;
      padding: 12px;
      z-index: 999999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
      overflow-y: auto;
      line-height: 1.4;
    `;

    hudContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:6px; margin-bottom:8px;">
        <span style="font-weight:bold; color:#fff;">🛡️ GUARDIAN TELEMETRY</span>
        <button id="scentspired-hud-close" style="background:none; border:none; color:#888; cursor:pointer; font-size:14px;">✕</button>
      </div>
      <div id="scentspired-hud-body">Loading...</div>
      <div style="margin-top:10px; display:flex; gap:6px;">
        <button id="scentspired-hud-export" style="background:#00ff66; color:#000; font-weight:bold; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:10px; flex:1;">EXPORT LOGS</button>
        <button id="scentspired-hud-clear" style="background:#333; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:10px;">CLEAR</button>
      </div>
    `;

    document.body.appendChild(hudContainer);

    const closeBtn = document.getElementById('scentspired-hud-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (hudContainer) hudContainer.remove();
        hudContainer = null;
      });
    }

    const exportBtn = document.getElementById('scentspired-hud-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (typeof window.__SCENTSPIRED_EXPORT_TELEMETRY__ === 'function') {
          window.__SCENTSPIRED_EXPORT_TELEMETRY__();
        }
      });
    }

    const clearBtn = document.getElementById('scentspired-hud-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        try {
          localStorage.removeItem('scentspired_telemetry_vault');
        } catch (e) {}
        updateLiveHUD();
      });
    }

    updateLiveHUD();
  }

  function updateLiveHUD() {
    const bodyEl = document.getElementById('scentspired-hud-body');
    if (!bodyEl) return;

    const storedRaw = localStorage.getItem('scentspired_telemetry_vault');
    const stored = storedRaw ? JSON.parse(storedRaw) : [];
    const errorCount = stored.length;

    let html = `
      <div style="color:#aaa; margin-bottom:4px;">Session: <span style="color:#fff;">${SESSION_ID.substring(0, 16)}...</span></div>
      <div style="color:#aaa; margin-bottom:6px;">Vault Status: <span style="color:${errorCount > 0 ? '#ff4444' : '#00ff66'}; font-weight:bold;">${errorCount} Recorded Incidents</span></div>
    `;

    if (stored.length === 0) {
      html += `<div style="color:#666; font-style:italic;">No crashes detected. Storefront running zero-defect.</div>`;
    } else {
      html += `<div style="max-height:160px; overflow-y:auto; border:1px solid #222; border-radius:4px; padding:4px;">`;
      stored.slice(0, 5).forEach((item, idx) => {
        html += `
          <div style="border-bottom:1px solid #222; padding:4px 0;">
            <div style="color:#ff4444; font-weight:bold;">[${item.type}]</div>
            <div style="color:#ddd; word-break:break-all;">${(item.message || '').substring(0, 80)}</div>
            <div style="color:#666; font-size:9px;">${new Date(item.timestamp).toLocaleTimeString()}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    bodyEl.innerHTML = html;
  }

  // Shortcut to toggle HUD: Ctrl+Shift+L
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
      if (hudContainer) {
        hudContainer.remove();
        hudContainer = null;
      } else {
        createLiveHUD();
      }
    }
  });

  // Auto-launch HUD if URL param contains ?telemetry=live or ?guardian=1
  if (window.location.search.includes('telemetry=live') || window.location.search.includes('guardian=1')) {
    window.addEventListener('DOMContentLoaded', createLiveHUD);
  }

  // ── 7. Global Export Utilities (Accessible from console) ───────────────────

  window.__SCENTSPIRED_EXPORT_TELEMETRY__ = function () {
    const storedRaw = localStorage.getItem('scentspired_telemetry_vault');
    const stored = storedRaw ? JSON.parse(storedRaw) : [];
    const fullDump = {
      exportTime: new Date().toISOString(),
      sessionId: SESSION_ID,
      url: window.location.href,
      userAgent: navigator.userAgent,
      recentBreadcrumbs: breadcrumbs,
      recordedErrors: stored
    };

    const blob = new Blob([JSON.stringify(fullDump, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `scentspired_telemetry_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    console.log('📦 Telemetry export complete:', fullDump);
  };

  window.__SCENTSPIRED_GET_LOGS__ = function () {
    const storedRaw = localStorage.getItem('scentspired_telemetry_vault');
    return storedRaw ? JSON.parse(storedRaw) : [];
  };

  addBreadcrumb('lifecycle', 'Guardian Telemetry initialized successfully');
  console.log('[Scentspired Guardian Telemetry] Active & Monitoring Storefront Health.');
})();

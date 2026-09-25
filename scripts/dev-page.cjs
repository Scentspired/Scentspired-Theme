/**
 * Fetching a page from a running `shopify theme dev` server, for the tools that
 * read pages (snapshot-pages, asset-usage). One place for what the dev server
 * gets wrong, so every tool reads the same page or none:
 *
 * - the CLI session flaps: the same URL answers 200, then 401 or an error page
 *   ("access token provided is expired", Bad Gateway) — retried, and a page that
 *   never renders is an error, never an empty page;
 * - /password is not rendered by the preview theme on a store without a password:
 *   Shopify answers it from another theme and the CLI exits on the theme-id
 *   mismatch, taking the dev server down — refused before any request;
 * - Git Bash rewrites an argument like /pages/faqs into C:/Program Files/Git/… —
 *   a page must be a path starting with /.
 */
const ERROR_PAGE = /Failed to Upload Theme Files|access token provided is expired|Failed to render storefront|Bad Gateway/;
const NOT_PREVIEWABLE = /^\/password(?:[/?#]|$)/;

function checkPaths(pages) {
  const notPath = pages.find((p) => !p.startsWith('/'));
  if (notPath) throw new Error(`a page is a path starting with /: ${notPath} (Git Bash rewrites /x into C:/…; set MSYS_NO_PATHCONV=1)`);
  if (pages.some((p) => NOT_PREVIEWABLE.test(p))) throw new Error('/password cannot be previewed on the dev server (it stops the CLI). Leave it out.');
}

// A rendered page: 200, or the theme's 404 page for a missing URL.
async function fetchPage(base, page, country) {
  const u = new URL(page, base);
  u.searchParams.set('country', country);
  for (let attempt = 0; attempt < 24; attempt++) {   // up to two minutes: the session can flap that long
    try {
      const r = await fetch(u);
      const html = await r.text();
      if ((r.status === 200 || r.status === 404) && html && !ERROR_PAGE.test(html)) return html;   // 401 = the session flapping
    } catch {
      // the dev server drops a connection now and then
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`${page}: the dev server returned no rendered page (is it running? npm run dev:<region>)`);
}

module.exports = { checkPaths, fetchPage };

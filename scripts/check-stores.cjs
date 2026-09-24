#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED — Store Reachability Check
 * ============================================================================
 *
 * Answers the question "why does `shopify theme dev` say I don't have access?"
 * without reading a wall of CLI output.
 *
 * For each store it reports two separate things, which fail for different
 * reasons and want different fixes:
 *
 *   EXISTS   the handle resolves as a storefront at all. A 404 here means the
 *            handle is wrong, not that permissions are missing.
 *   ACCESS   the Shopify account you are currently logged in as can see the
 *            store's themes. "no access" here is an account problem — log in
 *            as an account with staff access, or get added to the store.
 *
 * Every call is read-only: a storefront GET, and `shopify theme list`, which
 * lists themes and changes nothing. The live-store lockdown is unaffected.
 *
 *   npm run stores:check            existence only, no Shopify login needed
 *   npm run stores:check -- --auth  also check what the current login reaches
 * ============================================================================
 */

const https = require('https');
const { spawnSync } = require('child_process');

const { listRegions, readRegionFile } = require('./region-engine.cjs');
const { LOCKED_STORES } = require('./guard-live-repos.cjs');

/**
 * Every store a region declares, plus any locked handle no region claims (the
 * lockdown's typo guards). Read from regions/, so a new region is checked
 * without editing this file.
 */
const STORES = (() => {
  const rows = listRegions()
    .map((id) => ({ id, ...readRegionFile(id) }))
    .filter((r) => r.myshopify_domain)
    .map((r) => {
      const handle = r.myshopify_domain.toLowerCase();
      const locked = LOCKED_STORES.includes(handle);
      return {
        handle,
        locked,
        note: `${r.name || r.id} ${locked ? 'live' : 'dev store'} — ${r.domain || 'no domain'}`,
      };
    });
  for (const handle of LOCKED_STORES) {
    if (!rows.some((r) => r.handle === handle)) {
      rows.push({ handle, locked: true, note: 'claimed by no region; kept locked as a typo guard' });
    }
  }
  return rows;
})();

const withAuth = process.argv.includes('--auth');

/**
 * Shopify answers 403 to a request without a browser User-Agent, which looks
 * the same for every handle and tells us nothing — so send one. A real store
 * then answers 200 (or a redirect to its primary domain); a handle that was
 * never a store answers 404.
 */
function exists(handle, hops = 0) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        method: 'GET',
        host: handle,
        path: '/',
        timeout: 20000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        },
      },
      (res) => {
        const loc = res.headers.location;
        if (res.statusCode >= 300 && res.statusCode < 400 && loc && hops < 3) {
          try {
            const next = new URL(loc, `https://${handle}/`);
            res.resume();
            return resolve(exists(next.host, hops + 1));
          } catch { /* fall through */ }
        }
        res.resume();
        resolve(res.statusCode);
      }
    );
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
    req.end();
  });
}

function access(handle) {
  // shell: true is required on Windows — spawning npx.cmd directly fails with
  // EINVAL and returns no output at all, which reads as "unknown" for every
  // store and is worse than no check.
  const r = spawnSync(`npx shopify theme list --store=${handle}`, {
    encoding: 'utf8',
    timeout: 120000,
    shell: true,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.error && r.error.code === 'ETIMEDOUT') return 'timed out';
  if (!out.trim()) return `no output (${r.error ? r.error.code : 'status ' + r.status})`;
  if (/don't have access/i.test(out)) return 'NO ACCESS';
  if (/log in to Shopify/i.test(out)) return 'not logged in';
  if (/\[live\]|\[unpublished/i.test(out)) return 'ok';
  return 'unknown';
}

(async () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   SCENTSPIRED — Store Reachability                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(
    `  ${'store'.padEnd(32)} ${'exists'.padEnd(8)} ${withAuth ? 'access'.padEnd(14) : ''}lock`
  );
  console.log('  ' + '-'.repeat(withAuth ? 70 : 56));

  for (const s of STORES) {
    const code = await exists(s.handle);
    // A development store redirects to its password page, which is still a
    // store that exists — only a 404 means the handle was never one.
    const ex =
      code === 200
        ? 'yes'
        : code === 404
          ? 'NO (404)'
          : code >= 300 && code < 400
            ? 'yes (pw)'
            : String(code || 'error');
    const ac = withAuth ? access(s.handle).padEnd(14) : '';
    console.log(`  ${s.handle.padEnd(32)} ${ex.padEnd(8)} ${ac}${s.locked ? 'LOCKED' : 'dev'}`);
    console.log(`  ${''.padEnd(32)} ${s.note}`);
  }

  console.log('');
  if (!withAuth) {
    console.log('  Re-run with --auth to see what the current Shopify login can reach.\n');
  } else {
    console.log('  "no access" is an account problem, not a theme problem: the store');
    console.log('  exists but the account you are logged in as is not staff on it.');
    console.log('  Fix: npx shopify auth logout, then sign in as the account that owns');
    console.log('  that store — the browser flow uses whichever account is already');
    console.log('  signed in, so switch there first.\n');
  }
})();

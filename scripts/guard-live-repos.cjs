#!/usr/bin/env node
/**
 * Scentspired Live-Deployment Lockdown
 *
 * Single source of truth for what this repository is forbidden to touch.
 * Scentspired-UK and Scentspired-USA are live storefronts kept as read-only
 * reference. Only a region that is not published may receive a deployment,
 * and only as a development theme.
 *
 * Usable as a module or directly as a CLI gate:
 *   node scripts/guard-live-repos.cjs --remote <url>
 *   node scripts/guard-live-repos.cjs --store <handle>
 *   node scripts/guard-live-repos.cjs --cwd
 */

const path = require('path');

const LOCKED_REPOS = ['scentspired-uk', 'scentspired-usa'];

/**
 * Live storefronts. Writes are refused; reads need an explicit --read.
 *
 *   scentspired.myshopify.com     USA. Primary domain scentspired.com, and
 *                                 www.scentspired.com. Confirmed against the
 *                                 store's own domain settings.
 *   scentspireduk.myshopify.com   United Kingdom, scentspired.co.uk.
 *   scentspired-usa.myshopify.com does NOT exist — the handle 404s. Kept in
 *                                 the list deliberately: it costs nothing and
 *                                 refuses a plausible typo for the real USA
 *                                 store above.
 *
 * Verify with: npm run stores:check
 */
const LOCKED_STORE_FLOOR = [
  'scentspired.myshopify.com',
  'scentspired-usa.myshopify.com',
  'scentspireduk.myshopify.com',
];

/**
 * A region that goes live locks itself: any region.json with
 * "published": true adds its store here, so region #101 needs no edit to this
 * file to be protected.
 *
 * Data can only ADD locks. The floor above is hardcoded on purpose and is not
 * read from regions/ — flipping UK to "published": false by mistake must not
 * make the UK store writable.
 */
function regionsWithStores() {
  // Required lazily: region-engine must stay loadable even if this guard is
  // used from a context where regions/ is absent.
  try {
    const { listRegions, readRegionFile } = require('./region-engine.cjs');
    return listRegions()
      .map((id) => ({ id, ...readRegionFile(id) }))
      .filter((r) => r.myshopify_domain);
  } catch {
    return [];
  }
}

const LOCKED_STORES = [
  ...new Set([
    ...LOCKED_STORE_FLOOR,
    ...regionsWithStores()
      .filter((r) => r.published === true)
      .map((r) => r.myshopify_domain.toLowerCase()),
  ]),
];

/** Stores of regions that are not live. The only ones a write may target. */
const ALLOWED_STORES = regionsWithStores()
  .filter((r) => r.published !== true)
  .map((r) => r.myshopify_domain.toLowerCase())
  .filter((s) => !LOCKED_STORES.includes(s));

const ALLOWED_STORE = ALLOWED_STORES.join(', ') || '(none — no unpublished region declares a store)';

function fail(lines) {
  console.error('');
  console.error('🚫 ═══════════════════════════════════════════════════════════════');
  console.error('   SCENTSPIRED LIVE-DEPLOYMENT LOCKDOWN — OPERATION REFUSED');
  console.error('═══════════════════════════════════════════════════════════════');
  for (const line of lines) console.error(`   ${line}`);
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
  process.exit(1);
}

/** Refuse any git remote that points at a live regional storefront. */
function assertRemoteAllowed(remoteUrl) {
  if (!remoteUrl) return;
  const normalized = remoteUrl.toLowerCase();
  const hit = LOCKED_REPOS.find(repo => normalized.includes(repo));
  if (hit) {
    fail([
      `Push target resolves to a LOCKED live repository: ${hit}`,
      `Remote: ${remoteUrl}`,
      '',
      'Scentspired-UK and Scentspired-USA are read-only reference copies of',
      'live production code. Nothing may ever be pushed to them.',
    ]);
  }
}

/**
 * Refuse any Shopify CLI operation aimed at a live regional store.
 *
 * `mode` separates reading a storefront from changing one:
 *   'write' (default) — push/publish/delete. Always refused for a live store.
 *   'read'            — dev/pull/list/info. Permitted, because verifying the
 *                       theme against real catalog data requires attaching to
 *                       a store that has it. `theme dev` creates a separate
 *                       UNPUBLISHED development theme and never touches the
 *                       published one.
 */
function assertStoreAllowed(store, mode = 'write') {
  if (!store) {
    fail([
      'No --store was supplied to a Shopify CLI operation.',
      'Unpinned commands inherit whatever store the CLI is logged into,',
      `which may be live. Pin it explicitly: --store=<one of: ${ALLOWED_STORE}>`,
    ]);
  }

  const normalized = String(store).toLowerCase();
  const isLocked = LOCKED_STORES.some(locked => normalized.includes(locked));
  if (!isLocked) return;

  if (mode === 'write') {
    fail([
      `Store is a LOCKED live storefront: ${store}`,
      '',
      'Writing to a live storefront is never permitted from here.',
      `Deployable stores (unpublished regions, development themes only): ${ALLOWED_STORE}`,
    ]);
  }

  console.warn('');
  console.warn(`⚠️  Attaching to LIVE storefront ${store} in read mode.`);
  console.warn('   A separate unpublished development theme will be created.');
  console.warn('   The published theme is not modified. Delete the dev theme when done.');
  console.warn('');
}

/** Refuse to operate while sitting inside a locked reference checkout. */
function assertCwdNotLocked(cwd = process.cwd()) {
  const segments = path.resolve(cwd).toLowerCase().split(/[\\/]/);
  const hit = LOCKED_REPOS.find(repo => segments.includes(repo));
  if (hit) {
    fail([
      `Current working directory is inside the locked repository: ${hit}`,
      `Path: ${cwd}`,
      '',
      'All work belongs in Scentspired-Theme. Change directory and retry.',
    ]);
  }
}

module.exports = {
  LOCKED_REPOS,
  LOCKED_STORES,
  LOCKED_STORE_FLOOR,
  ALLOWED_STORES,
  ALLOWED_STORE,
  assertRemoteAllowed,
  assertStoreAllowed,
  assertCwdNotLocked,
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const valueFor = flag => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };

  assertCwdNotLocked();
  if (args.includes('--remote')) assertRemoteAllowed(valueFor('--remote'));
  if (args.includes('--store')) {
    assertStoreAllowed(valueFor('--store'), args.includes('--read') ? 'read' : 'write');
  }

  console.log('✅ Lockdown guard: operation permitted.');
}

#!/usr/bin/env node
/**
 * Scentspired Live-Deployment Lockdown
 *
 * Single source of truth for what this repository is forbidden to touch.
 * Scentspired-UK and Scentspired-USA are live storefronts kept as read-only
 * reference. UAE is the only region that may ever receive a deployment.
 *
 * Usable as a module or directly as a CLI gate:
 *   node scripts/guard-live-repos.cjs --remote <url>
 *   node scripts/guard-live-repos.cjs --store <handle>
 *   node scripts/guard-live-repos.cjs --cwd
 */

const path = require('path');

const LOCKED_REPOS = ['scentspired-uk', 'scentspired-usa'];

const LOCKED_STORES = [
  'scentspired.myshopify.com',
  'scentspired-usa.myshopify.com',
  'scentspireduk.myshopify.com',
];

const ALLOWED_STORE = 'scentspiredae.myshopify.com';

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

/** Refuse any Shopify CLI operation aimed at a live regional store. */
function assertStoreAllowed(store) {
  if (!store) {
    fail([
      'No --store was supplied to a Shopify CLI operation.',
      'Unpinned commands inherit whatever store the CLI is logged into,',
      `which may be live. Pin it explicitly: --store=${ALLOWED_STORE}`,
    ]);
  }
  const normalized = String(store).toLowerCase();
  if (LOCKED_STORES.some(locked => normalized.includes(locked))) {
    fail([
      `Store is a LOCKED live storefront: ${store}`,
      `The only deployable store is ${ALLOWED_STORE} (UAE, development themes only).`,
    ]);
  }
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
  if (args.includes('--store')) assertStoreAllowed(valueFor('--store'));

  console.log('✅ Lockdown guard: operation permitted.');
}

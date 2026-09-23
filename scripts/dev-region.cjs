#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED — Regional Dev Server
 * ============================================================================
 *
 * Compiles a region and previews it against THAT REGION'S OWN STORE.
 *
 * Every dev:* script used to point at the UAE dev store, whichever region was
 * being built, because that store was the sandbox. That is wrong twice over:
 * dist/usa previewed against the UAE store shows UAE's products, prices and
 * market, and it breaks outright for anyone without access to that one store.
 * The store a region belongs to is region data like everything else, so it
 * lives in regions/<id>/region.json as myshopify_domain.
 *
 *   node scripts/dev-region.cjs usa            preview USA on the USA store
 *   node scripts/dev-region.cjs usa --store=X  override, for a sandbox
 *   SHOPIFY_DEV_STORE=X node scripts/dev-region.cjs usa   same, via env
 *
 * `shopify theme dev` creates an UNPUBLISHED development theme and serves it
 * locally. It never touches the published theme. The live-store lockdown is
 * still consulted in read mode, which warns and permits; writes stay refused.
 * ============================================================================
 */

const path = require('path');
const { spawnSync } = require('child_process');
const { resolveRegion } = require('./region-engine.cjs');
const { assertStoreAllowed } = require('./guard-live-repos.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const region = (args.find((a) => !a.startsWith('-')) || 'uk').toLowerCase();
const storeArg = args.find((a) => a.startsWith('--store='));

let resolved;
try {
  resolved = resolveRegion(region);
} catch (err) {
  if (!err.handled) throw err;
  process.exit(1);
}

const store =
  (storeArg && storeArg.slice('--store='.length)) ||
  process.env.SHOPIFY_DEV_STORE ||
  resolved.myshopify_domain;

if (!store) {
  console.error(`\n❌ Region "${region}" has no myshopify_domain.`);
  console.error('   Add it to regions/' + region + '/region.json, or pass --store=<handle>.\n');
  process.exit(1);
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   🚀 DEV SERVER: ${region.toUpperCase().padEnd(44)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Store:    ${store}`);
console.log(`  Currency: ${resolved.currency_code} ${resolved.currency_symbol}`);
console.log(`  Domain:   ${resolved.home_url}`);
if (storeArg || process.env.SHOPIFY_DEV_STORE) {
  console.log('  (store overridden; the region\'s own store is ' + resolved.myshopify_domain + ')');
}
console.log('');

// Serving a build is a read. Writes to a live store remain refused.
assertStoreAllowed(store, 'read');

const compile = spawnSync('node', [path.join(THEME_ROOT, 'scripts', 'compile-region.cjs'), region], {
  stdio: 'inherit',
  cwd: THEME_ROOT,
});
if (compile.status !== 0) process.exit(compile.status || 1);

const rest = args.filter((a) => a !== region && !a.startsWith('--store='));

// shell: true is required on Windows — spawning npx.cmd directly fails with
// EINVAL before the CLI ever starts, which looks exactly like the CLI
// refusing, except there is no Shopify error to read.
const cmd = ['npx', 'shopify', 'theme', 'dev', `--path=dist/${region}`, `--store=${store}`, ...rest]
  .join(' ');
console.log(`  $ ${cmd}\n`);
const dev = spawnSync(cmd, { stdio: 'inherit', cwd: THEME_ROOT, shell: true });

if (dev.error) {
  console.error(`\n❌ Could not start the Shopify CLI: ${dev.error.code || dev.error.message}`);
  console.error('   This is a spawn failure, not Shopify refusing. Try the command above directly.\n');
  process.exit(1);
}

if (dev.status !== 0) {
  console.error('');
  console.error('  The Shopify CLI refused. If it says you do not have access to the store:');
  console.error('  that is an account problem, not a theme one — run `npm run stores:check -- --auth`');
  console.error('  to see which stores this login can reach, and preview against one of those');
  console.error(`  with:  npm run dev:${region} -- --store=<handle>`);
  console.error('');
}
process.exit(dev.status || 0);

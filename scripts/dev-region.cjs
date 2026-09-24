#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED — Regional Dev Server
 * ============================================================================
 *
 * Compiles a region and previews it against THAT REGION'S OWN STORE, on THAT
 * REGION'S OWN PORT.
 *
 * Both used to be fixed. Every dev:* script pointed at the UAE dev store
 * whichever region was being built, so dist/usa previewed against UAE's
 * products and market — and broke outright for a login without access to that
 * one store. Every one of them also defaulted to port 9292, so the second
 * server you started died with EADDRINUSE.
 *
 * A region's store and port are region data like its domain and currency, so
 * they live in regions/<id>/region.json as myshopify_domain and dev_port.
 * Running UK and USA side by side is then just two terminals.
 *
 *   node scripts/dev-region.cjs usa             USA build, USA store, its port
 *   node scripts/dev-region.cjs usa --port=9400 override the port
 *   node scripts/dev-region.cjs usa --store=X   override the store
 *   SHOPIFY_DEV_PORT / SHOPIFY_DEV_STORE        same, via env
 *
 * `shopify theme dev` creates an UNPUBLISHED development theme and serves it
 * locally. It never touches the published theme. The live-store lockdown is
 * still consulted in read mode, which permits reads; writes stay refused.
 * ============================================================================
 */

const net = require('net');
const path = require('path');
const { spawnSync } = require('child_process');
const { resolveRegion, listRegions, DEFAULT_REGION } = require('./region-engine.cjs');
const { assertStoreAllowed } = require('./guard-live-repos.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const region = (args.find((a) => !a.startsWith('-')) || DEFAULT_REGION).toLowerCase();
const storeArg = args.find((a) => a.startsWith('--store='));
const portArg = args.find((a) => a.startsWith('--port='));

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
  console.error(`   Add it to regions/${region}/region.json, or pass --store=<handle>.\n`);
  process.exit(1);
}

const port =
  (portArg && Number(portArg.slice('--port='.length))) ||
  Number(process.env.SHOPIFY_DEV_PORT) ||
  resolved.dev_port ||
  9292;

/** Every region's port, for the collision message. */
function portTable() {
  const rows = [];
  for (const id of listRegions()) {
    try {
      rows.push({ id, port: resolveRegion(id).dev_port || 9292 });
    } catch {
      /* a region that does not resolve is reported by the compiler, not here */
    }
  }
  return rows;
}

/**
 * The CLI's EADDRINUSE arrives buried in a node stack trace, under a heading
 * about Shopify — so check first and say plainly what is holding the port.
 */
function portInUse(p) {
  return new Promise((resolve) => {
    const srv = net
      .createServer()
      .once('error', (e) => resolve(e.code === 'EADDRINUSE'))
      .once('listening', () => srv.close(() => resolve(false)))
      .listen(p, '127.0.0.1');
  });
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   🚀 DEV SERVER: ${region.toUpperCase().padEnd(44)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Store:    ${store}`);
console.log(`  Currency: ${resolved.currency_code} ${resolved.currency_symbol}`);
console.log(`  Domain:   ${resolved.home_url}`);
console.log(`  Port:     ${port}  ->  http://127.0.0.1:${port}`);
if (storeArg || process.env.SHOPIFY_DEV_STORE) {
  console.log(`  (store overridden; this region's own store is ${resolved.myshopify_domain})`);
}
if (portArg || process.env.SHOPIFY_DEV_PORT) {
  console.log(`  (port overridden; this region's own port is ${resolved.dev_port})`);
}
console.log('');

// Serving a build is a read. Writes to a live store remain refused.
assertStoreAllowed(store, 'read');

const compile = spawnSync(
  'node',
  [path.join(THEME_ROOT, 'scripts', 'compile-region.cjs'), region],
  { stdio: 'inherit', cwd: THEME_ROOT }
);
if (compile.status !== 0) process.exit(compile.status || 1);

const rest = args.filter(
  (a) => a !== region && !a.startsWith('--store=') && !a.startsWith('--port=')
);

(async () => {
  if (await portInUse(port)) {
    const clash = portTable().find((r) => r.port === port && r.id !== region);

    console.error(`\n❌ Port ${port} is already in use.`);
    console.error(`   Something is serving http://127.0.0.1:${port} — most likely another`);
    console.error('   dev server you have running. Nothing to do with Shopify or the theme.');
    if (clash) {
      console.error(`   regions/${clash.id} also claims this port.`);
    }
    console.error('');
    console.error('   Each region has its own port so they can run side by side:');
    for (const r of portTable()) {
      console.error(`     ${r.id.padEnd(5)} ${r.port}`);
    }
    console.error('');
    console.error(`   Stop whatever holds ${port}, or pick another:`);
    console.error(`     npm run dev:${region} -- --port=<n>\n`);
    process.exit(1);
  }

  // shell: true is required on Windows — spawning npx.cmd directly fails with
  // EINVAL before the CLI ever starts, which looks exactly like the CLI
  // refusing, except there is no Shopify error to read.
  const cmd = [
    'npx',
    'shopify',
    'theme',
    'dev',
    `--path=dist/${region}`,
    `--store=${store}`,
    `--port=${port}`,
    ...rest,
  ].join(' ');

  console.log(`  $ ${cmd}\n`);
  const dev = spawnSync(cmd, { stdio: 'inherit', cwd: THEME_ROOT, shell: true });

  if (dev.error) {
    console.error(`\n❌ Could not start the Shopify CLI: ${dev.error.code || dev.error.message}`);
    console.error('   This is a spawn failure, not Shopify refusing. Try the command above.\n');
    process.exit(1);
  }

  if (dev.status !== 0) {
    console.error('');
    console.error('  The Shopify CLI exited non-zero. Its own error above is the authoritative');
    console.error('  one — read that first. If it says you do not have access to the store,');
    console.error('  that is an account problem rather than a theme one:');
    console.error('    npm run stores:check -- --auth');
    console.error(`    npm run dev:${region} -- --store=<handle>`);
    console.error('');
  }
  process.exit(dev.status || 0);
})();

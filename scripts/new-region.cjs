#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — New Region Scaffolder
 * ============================================================================
 *
 *   npm run region:new -- <id>          e.g.  npm run region:new -- fr
 *
 * Adding a storefront is ONE folder: regions/<id>/region.json. No Liquid, no
 * JavaScript, no script, test or npm alias needs editing — the compiler, the
 * test runner, the parity harness, the dev server and the live-store lock all
 * discover regions from regions/.
 *
 * This writes that file with every value the region must supply set to "TODO".
 * The list is not maintained here: it comes from regionContract() in
 * scripts/region-engine.cjs — the schema's required keys, the identity keys a
 * region may never inherit, and every key shared code renders that
 * _defaults.json does not supply. The compiler refuses to build while any TODO
 * remains and names each one, so the file is a checklist that cannot ship
 * half-filled.
 *
 * The region starts unpublished: it is not advertised in hreflang, not a
 * geo-redirect target, and its store is a permitted dev target. Setting
 * "published": true launches it AND locks its store against writes.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const {
  listRegions,
  readRegionFile,
  regionContract,
  resolveRegion,
  CORE_REGION,
  REGIONS_DIR,
} = require('./region-engine.cjs');

const id = (process.argv[2] || '').toLowerCase();
if (!/^[a-z][a-z0-9-]{1,15}$/.test(id)) {
  console.error('\n  Usage: npm run region:new -- <id>   (lowercase, e.g. fr, de, ca)\n');
  process.exit(1);
}
const dir = path.join(REGIONS_DIR, id);
if (fs.existsSync(dir)) {
  console.error(`\n  ✗ regions/${id}/ already exists — refusing to overwrite it.\n`);
  process.exit(1);
}

// Placeholder shapes follow the core region's real values, so a numeric key
// is obviously numeric and a list is obviously a list.
const reference = resolveRegion(CORE_REGION);
const get = (o, k) => k.split('.').reduce((v, p) => (v == null ? undefined : v[p]), o);
const placeholder = (key) => (Array.isArray(get(reference, key)) ? ['TODO'] : 'TODO');

const set = (obj, key, value) => {
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] = cur[p] || {};
  cur[parts[parts.length - 1]] = value;
};

const contract = regionContract();
const keys = [...new Set([...contract.identity, ...contract.required, ...contract.consumed])];

const ports = listRegions().map((r) => (readRegionFile(r) || {}).dev_port).filter(Number.isInteger);
const region = {
  $comment:
    `Region ${id}. Replace every "TODO" — npm run compile -- ${id} lists any left. ` +
    'Optional overrides, all data: trustpilot and analytics (see regions/_schema.json), ' +
    'and regions/<id>/templates|locales|config|sections for content that differs from core. ' +
    'Put only what DIFFERS there — npm run region:prune removes copies of core.',
};
for (const key of keys) set(region, key, placeholder(key));
region.id = id;
region.published = false;
region.is_default = false;
region.myshopify_domain = 'TODO';
region.dev_port = (ports.length ? Math.max(...ports) : 9291) + 1;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'region.json'), JSON.stringify(region, null, 2) + '\n');

const todo = keys.filter((k) => k !== 'id').length + 1;
console.log(`\n  ✅ regions/${id}/region.json created — ${todo} value(s) to fill in.\n`);
console.log('  Next:');
console.log(`    1. Replace every "TODO" in regions/${id}/region.json`);
console.log(`    2. npm run compile -- ${id}      builds dist/${id}; names any TODO left`);
console.log(`    3. npm run dev -- ${id}          serves it on port ${region.dev_port}`);
console.log(`    4. npm run test:region -- ${id}  runs its test suite`);
console.log('\n  Nothing outside regions/ needs editing.\n');

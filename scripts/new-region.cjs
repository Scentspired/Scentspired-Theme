#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — New Region Scaffolder
 * ============================================================================
 *
 *   npm run region:new -- <id>                 e.g.  npm run region:new -- fr
 *   npm run region:new -- <id> --from=usa      start from another region's pages
 *
 * Adding a storefront is ONE folder: regions/<id>/. No Liquid, no JavaScript,
 * no script, test or npm alias needs editing — the compiler, the test runner,
 * the parity harness, the dev server and the live-store lock all discover
 * regions from regions/.
 *
 * It creates:
 *
 *   region.json   every value the region must supply, set to "TODO". The list
 *                 comes from regionContract() in scripts/region-engine.cjs —
 *                 the schema's required keys, the identity keys a region may
 *                 never inherit, and every key shared code renders that
 *                 _defaults.json does not supply. The compiler refuses to build
 *                 while any TODO remains and names each one.
 *
 *   everything    the theme holds no page content, so the region gets its own
 *   else          copy of every page (templates/), header and footer
 *                 (sections/) and theme settings (config/), taken from --from
 *                 (the default region otherwise). They are this region's from
 *                 then on: edit them like any other region's.
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
  regionContentFiles,
  resolveRegion,
  DEFAULT_REGION,
  REGIONS_DIR,
} = require('./region-engine.cjs');

const args = process.argv.slice(2);
const id = (args.find((a) => !a.startsWith('-')) || '').toLowerCase();
const fromArg = args.find((a) => a.startsWith('--from='));
const from = fromArg ? fromArg.slice('--from='.length).toLowerCase() : DEFAULT_REGION;

if (!/^[a-z][a-z0-9-]{1,15}$/.test(id)) {
  console.error('\n  Usage: npm run region:new -- <id> [--from=<region>]   (lowercase, e.g. fr, de, ca)\n');
  process.exit(1);
}
const dir = path.join(REGIONS_DIR, id);
if (fs.existsSync(dir)) {
  console.error(`\n  ✗ regions/${id}/ already exists — refusing to overwrite it.\n`);
  process.exit(1);
}
if (!readRegionFile(from)) {
  console.error(`\n  ✗ --from=${from}: no such region. Regions: ${listRegions().join(', ')}\n`);
  process.exit(1);
}

// Placeholder shapes follow a real region's values, so a numeric key is
// obviously numeric and a list is obviously a list.
const reference = resolveRegion(from);
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
    `Region ${id}. Replace every "TODO"; npm run compile -- ${id} lists any left. ` +
    `Its pages (templates/), header and footer (sections/) and theme settings (config/) were ` +
    `copied from ${from}: edit them for this region. Every key this file accepts is in regions/_schema.json.`,
};
for (const key of keys) set(region, key, placeholder(key));
region.id = id;
region.published = false;
region.is_default = false;
region.myshopify_domain = 'TODO';
region.dev_port = (ports.length ? Math.max(...ports) : 9291) + 1;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'region.json'), JSON.stringify(region, null, 2) + '\n');

const content = regionContentFiles(from);
for (const rel of content) {
  const dest = path.join(dir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(REGIONS_DIR, from, rel), dest);
}

const todo = keys.filter((k) => k !== 'id').length + 1;
console.log(`\n  ✅ regions/${id}/ created:`);
console.log(`     region.json with ${todo} value(s) to fill in`);
console.log(`     ${content.length} page / header / footer / settings file(s), copied from ${from}, to edit\n`);
console.log('  Next:');
console.log(`    1. Replace every "TODO" in regions/${id}/region.json`);
console.log(`    2. Edit this region's pages in regions/${id}/templates/ (and sections/, config/)`);
console.log(`    3. npm run compile -- ${id}      builds dist/${id}; names anything missing`);
console.log(`    4. npm run dev -- ${id}          serves it on port ${region.dev_port}`);
console.log(`    5. npm run test:region -- ${id}  runs its test suite`);
console.log('\n  Nothing outside regions/ needs editing.\n');

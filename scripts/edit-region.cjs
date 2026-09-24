#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Give a region its own copy of an inherited file
 * ============================================================================
 *
 *   npm run region:edit -- usa templates/page.contact.json
 *   npm run region:edit -- uae sections/footer-group.json
 *
 * Copies core's file into regions/<id>/ so that region can differ. Edit the
 * copy; every other region keeps core's version. Only DATA can be copied —
 * page templates, section groups (header/footer), theme settings and
 * translations. Section and snippet .liquid files are code and stay shared;
 * a regional value belongs in region.json instead.
 *
 * An unedited copy is a frozen fork of core, so the gate reports it until it
 * differs (or `npm run region:prune` removes it).
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { readRegionFile, listRegions, CORE_REGION, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const [idArg, fileArg] = process.argv.slice(2);
const id = (idArg || '').toLowerCase();
const file = (fileArg || '').replace(/\\/g, '/').replace(/^\/+/, '');

const fail = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};

if (!readRegionFile(id) || !file) {
  fail(`Usage: npm run region:edit -- <region> <file>   e.g. usa templates/page.contact.json\n    regions: ${listRegions().join(', ')}`);
}
if (id === CORE_REGION) {
  fail(`${id} is the core: edit ${file} in place at the repository root (it is shared with every region that inherits it).`);
}
const DATA = [/^templates\/.+\.(json|liquid)$/, /^sections\/[^/]+\.json$/, /^config\/settings_data\.json$/, /^locales\/[^/]+\.json$/];
if (!DATA.some((re) => re.test(file))) {
  fail(
    `${file} is not regional data. A region may own templates/*, sections/*.json (header/footer groups),\n` +
      '    config/settings_data.json and locales/*.json. Code stays shared — put a differing value in region.json.'
  );
}
const src = path.join(THEME_ROOT, file);
if (!fs.existsSync(src)) fail(`core has no ${file}. To add a page only this region has, create regions/${id}/${file} directly.`);
const dest = path.join(REGIONS_DIR, id, file);
if (fs.existsSync(dest)) fail(`regions/${id}/${file} already exists — edit it in place.`);

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log(`\n  ✅ regions/${id}/${file} created from core's ${file}.`);
console.log(`     Edit it — ${id} now uses this copy; other regions keep core's.`);
if (file.startsWith('locales/')) {
  console.log('     Change only the keys that differ; npm run region:prune strips the rest.');
}
console.log(`     npm run compile -- ${id} to build it.\n`);

#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Return a standard string from region JSON to the theme
 * ============================================================================
 *
 *   node scripts/restore-inline.cjs --keys=<key>,<key>… [--dry]
 *
 * Region JSON is for what a region genuinely configures: marketing copy,
 * menu items, offers, sizes, the images and links that go with them. UI
 * wording — "Add to cart", "Adding...", "Go back", alerts, search labels — is
 * the product's standard and belongs in the theme, the same everywhere.
 *
 * For each key this puts the value back where every read of it stands, in its
 * original form (escaped again inside JavaScript strings), and removes the key
 * from every region's content file. A key whose value differs between regions
 * is refused: it is regional after all, and moving it would erase that.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { listRegions, readRegionContent, flattenContent, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const KEYS = ((process.argv.find((a) => a.startsWith('--keys=')) || '').slice(7) || '').split(',').filter(Boolean);
const DRY = process.argv.includes('--dry');
const fail = (m) => {
  console.error(`\n  ✗ ${m}\n`);
  process.exit(1);
};
if (!KEYS.length) fail('Usage: --keys=<page.section.field>,… [--dry]');

const jsEscape = (s) =>
  s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\r?\n/g, '\\n').replace(/<\//g, '<\\/');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const regions = listRegions();
const flat = Object.fromEntries(regions.map((id) => [id, flattenContent(readRegionContent(id))]));

const values = {};
for (const key of KEYS) {
  const seen = new Set(regions.map((id) => flat[id][key]));
  if (seen.has(undefined)) fail(`${key} is missing in some region`);
  if (seen.size > 1) fail(`${key} differs between regions (${[...seen].map((v) => JSON.stringify(v)).join(' / ')}) — it is regional`);
  values[key] = [...seen][0];
}

// Every theme file, every read of each key.
const files = ['sections', 'snippets', 'blocks', 'layout']
  .flatMap((d) => (fs.existsSync(path.join(THEME_ROOT, d)) ? fs.readdirSync(path.join(THEME_ROOT, d)).map((f) => `${d}/${f}`) : []))
  .filter((f) => f.endsWith('.liquid') && !path.basename(f).startsWith('region--'));

const counts = Object.fromEntries(KEYS.map((k) => [k, 0]));
const changed = {};
for (const rel of files) {
  let src = fs.readFileSync(path.join(THEME_ROOT, rel), 'utf8');
  const before = src;
  for (const key of KEYS) {
    const re = new RegExp(`\\{%-?\\s*render\\s+'region--content',\\s*key:\\s*'${esc(key)}'(\\s*,\\s*js:\\s*true)?\\s*-?%\\}`, 'g');
    src = src.replace(re, (_, js) => {
      counts[key]++;
      return js ? jsEscape(values[key]) : values[key];
    });
  }
  if (src !== before) changed[rel] = src;
}
for (const key of KEYS) if (!counts[key]) fail(`${key} is read nowhere in the theme`);

// Remove the keys from every region's file; drop objects left empty.
function unset(obj, parts) {
  const [head, ...rest] = parts;
  if (!(head in obj)) return;
  if (!rest.length) delete obj[head];
  else {
    unset(obj[head], rest);
    if (obj[head] && typeof obj[head] === 'object' && !Object.keys(obj[head]).length) delete obj[head];
  }
}
const regionWrites = {};
for (const id of regions) {
  const dir = path.join(REGIONS_DIR, id, 'content');
  for (const key of KEYS) {
    const [page, ...rest] = key.split('.');
    const file = path.join(dir, `${page}.json`);
    const doc = regionWrites[file] || JSON.parse(fs.readFileSync(file, 'utf8'));
    unset(doc, rest);
    regionWrites[file] = doc;
  }
}

for (const key of KEYS) console.log(`  ${key.padEnd(62)} ${counts[key]}x  -> theme: ${JSON.stringify(values[key]).slice(0, 50)}`);
console.log(`\n  ${Object.keys(changed).length} theme file(s), ${Object.keys(regionWrites).length} region file(s)`);
if (DRY) {
  console.log('  (dry run — nothing written)\n');
  process.exit(0);
}
for (const [rel, src] of Object.entries(changed)) fs.writeFileSync(path.join(THEME_ROOT, rel), src);
for (const [file, doc] of Object.entries(regionWrites)) fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
console.log('  written\n');

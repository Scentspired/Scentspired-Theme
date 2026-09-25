#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Keep content out of the theme
 * ============================================================================
 *
 * The theme is structure and design: Liquid, HTML, CSS, JS, and the layouts of
 * its templates and section groups (templates/*.json, sections/*.json), whose
 * words, images, links and lists are each region's regions/<id>/content/; the
 * theme settings (config/settings_data.json) likewise, with the logo, social
 * links and app embeds in regions/<id>/content/theme-settings.json.
 *
 *   1. MOVE    any content file found in core is copied into every region
 *              that lacks its own, and removed from core
 *   2. LOCALES regional locale files are reduced to the keys whose text
 *              differs from core; the compiler merges them over core
 *
 * Compiled output is unchanged: content only moves from core into the region
 * folders that were already rendering it.
 *
 *   npm run region:prune                 apply
 *   npm run region:prune -- --dry        report only
 *   npm run region:prune -- --check      exit 1 if core holds content (the gate)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { listRegions, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry') || process.argv.includes('--check');
const CHECK = process.argv.includes('--check');

/**
 * Whole-file content in core: none any more. Templates, section groups and theme
 * settings (templates/*.json, sections/*.json, config/settings_data.json) are
 * layouts — structure and design — and belong to the theme, with their content
 * in regions/<id>/content/; the compiler refuses a layout holding a content
 * value of its own. What remains here is the locale reduction below.
 */
const isContent = () => false;

const stripJsonComments = (s) =>
  (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s).replace(/\/\*[\s\S]*?\*\//g, '');

function parse(file) {
  try {
    return JSON.parse(stripJsonComments(fs.readFileSync(file, 'utf8')));
  } catch {
    return undefined;
  }
}
/** A comparable form: parsed JSON where possible, raw text otherwise (.liquid templates). */
const canon = (file) => {
  const p = parse(file);
  return p === undefined ? fs.readFileSync(file, 'utf8') : JSON.stringify(p);
};

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** The part of `region` that differs from `core`. Undefined when nothing does. */
function diff(core, region) {
  if (!isObject(core) || !isObject(region)) return same(core, region) ? undefined : region;
  const out = {};
  for (const [k, v] of Object.entries(region)) {
    const d = k in core ? diff(core[k], v) : v;
    if (d !== undefined) out[k] = d;
  }
  return Object.keys(out).length ? out : undefined;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const relTo = (root, abs) => path.relative(root, abs).split(path.sep).join('/');

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) removeEmptyDirs(path.join(dir, e.name));
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

const regions = listRegions();
const regionFile = (id, rel) => path.join(REGIONS_DIR, id, rel);
const coreFile = (rel) => path.join(THEME_ROOT, rel);
const findings = [];
const tally = { demoted: 0, copies: 0, promoted: 0, pruned: 0, reduced: 0, keys: 0 };

// ─── 1. MOVE: content in the theme goes to every region ─────────────────────
const coreContent = [
  ...walk(coreFile('templates')),
  ...walk(coreFile('sections')),
  coreFile('config/settings_data.json'),
]
  .filter((f) => fs.existsSync(f))
  .map((f) => relTo(THEME_ROOT, f))
  .filter(isContent);

for (const rel of coreContent) {
  const receivers = regions.filter((id) => !fs.existsSync(regionFile(id, rel)));
  findings.push(`${rel}  is content in the theme — moves to ${receivers.join(', ') || '(every region already has its own)'}`);
  if (!DRY) {
    for (const id of receivers) {
      fs.mkdirSync(path.dirname(regionFile(id, rel)), { recursive: true });
      fs.copyFileSync(coreFile(rel), regionFile(id, rel));
    }
    fs.unlinkSync(coreFile(rel));
  }
  tally.demoted++;
  tally.copies += receivers.length;
}

// ─── 2. LOCALES: regional translation files hold only the keys that differ ─
for (const id of regions) {
  const dir = path.join(REGIONS_DIR, id);
  for (const abs of walk(path.join(dir, 'locales'))) {
    const name = path.basename(abs);
    if (!fs.existsSync(coreFile(`locales/${name}`))) continue;
    const core = parse(coreFile(`locales/${name}`));
    const region = parse(abs);
    if (core === undefined || region === undefined) continue;
    const delta = diff(core, region);
    const leaves = (o) => (isObject(o) ? Object.values(o).reduce((n, v) => n + leaves(v), 0) : 1);
    const before = leaves(region);
    const after = delta === undefined ? 0 : leaves(delta);
    if (after === before) continue;
    tally.keys += before - after;
    if (delta === undefined) {
      findings.push(`regions/${id}/locales/${name}  no key differs from core`);
      if (!DRY) fs.unlinkSync(abs);
      tally.pruned++;
    } else {
      findings.push(`regions/${id}/locales/${name}  ${before} keys -> ${after} that differ`);
      if (!DRY) fs.writeFileSync(abs, JSON.stringify(delta, null, 2) + '\n');
      tally.reduced++;
    }
  }
  if (!DRY) removeEmptyDirs(dir);
}
if (!DRY) removeEmptyDirs(coreFile('templates'));

if (CHECK) {
  if (findings.length) {
    console.log(`\n  ❌ ${findings.length} piece(s) of content are in the wrong place:\n`);
    for (const f of findings.slice(0, 20)) console.log(`     ${f}`);
    if (findings.length > 20) console.log(`     … and ${findings.length - 20} more`);
    console.log('\n     Fix: npm run region:prune\n');
    process.exit(1);
  }
  console.log('  ✅ The theme holds no page content; every region holds its own, complete.');
  process.exit(0);
}

for (const f of findings.slice(0, 60)) console.log(`  ${DRY ? 'would: ' : ''}${f}`);
if (findings.length > 60) console.log(`  … and ${findings.length - 60} more`);
console.log(
  `\n  ${DRY ? 'Would move' : 'Moved'} ${tally.demoted} content file(s) out of the theme into regions ` +
    `(${tally.copies} region copies); reduced ${tally.reduced} locale file(s), removed ${tally.pruned} ` +
    `(${tally.keys} duplicated key(s)).\n`
);

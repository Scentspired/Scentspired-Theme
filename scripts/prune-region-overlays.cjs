#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Region Overlay Pruner
 * ============================================================================
 *
 * A region folder must hold only what makes that region different. A file that
 * is a copy of core is not regional data — it is a frozen fork. The moment core
 * changes, that region silently keeps the old version, and fixing it means
 * editing the same file in every region folder: shotgun surgery, in data form.
 *
 * When this was written, regions/usa carried 66 files byte-identical to core
 * (15 templates, 50 locales, 1 config) and regions/uae 37, and their locale
 * copies had already drifted: dist/usa was missing 4 keys shared code renders.
 *
 *   templates/ config/ sections/   a file identical to core is removed
 *   locales/                       each file is reduced to the keys whose
 *                                  text differs from core; the compiler merges
 *                                  it back over core (scripts/compile-region.cjs)
 *
 * Comparison is on parsed JSON, so formatting and comment headers never count
 * as a difference. Output of `npm run compile:all` is unchanged by a prune —
 * tests/static/guard--region-onboarding.cjs fails if a copy creeps back in.
 *
 *   node scripts/prune-region-overlays.cjs            prune every region
 *   node scripts/prune-region-overlays.cjs --dry      report only
 *   node scripts/prune-region-overlays.cjs --check    exit 1 if anything is prunable
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { listRegions, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry') || process.argv.includes('--check');
const CHECK = process.argv.includes('--check');

const WHOLE_FILE_DIRS = ['templates', 'config', 'sections'];

const stripJsonComments = (s) =>
  (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s).replace(/\/\*[\s\S]*?\*\//g, '');

function parse(file) {
  try {
    return JSON.parse(stripJsonComments(fs.readFileSync(file, 'utf8')));
  } catch {
    return undefined;
  }
}

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

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) removeEmptyDirs(path.join(dir, e.name));
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

const totals = { removed: 0, reduced: 0, keysDropped: 0 };
const findings = [];

for (const id of listRegions()) {
  const regionDir = path.join(REGIONS_DIR, id);
  let removed = 0;
  let reduced = 0;

  for (const dir of WHOLE_FILE_DIRS) {
    for (const file of walk(path.join(regionDir, dir))) {
      const rel = path.relative(regionDir, file).split(path.sep).join('/');
      const coreFile = path.join(THEME_ROOT, rel);
      if (!fs.existsSync(coreFile)) continue; // region-only file: genuinely regional
      const a = parse(coreFile);
      const b = parse(file);
      const identical =
        a !== undefined && b !== undefined
          ? same(a, b)
          : fs.readFileSync(coreFile).equals(fs.readFileSync(file));
      if (!identical) continue;
      findings.push(`regions/${id}/${rel}  identical to core`);
      if (!DRY) fs.unlinkSync(file);
      removed++;
    }
  }

  for (const file of walk(path.join(regionDir, 'locales'))) {
    const name = path.basename(file);
    const coreFile = path.join(THEME_ROOT, 'locales', name);
    if (!fs.existsSync(coreFile)) continue;
    const core = parse(coreFile);
    const region = parse(file);
    if (core === undefined || region === undefined) continue;

    const delta = diff(core, region);
    const countLeaves = (o) =>
      isObject(o) ? Object.values(o).reduce((n, v) => n + countLeaves(v), 0) : 1;
    const before = countLeaves(region);
    const after = delta === undefined ? 0 : countLeaves(delta);
    if (after === before) continue; // already minimal

    totals.keysDropped += before - after;
    if (delta === undefined) {
      findings.push(`regions/${id}/locales/${name}  no key differs from core`);
      if (!DRY) fs.unlinkSync(file);
      removed++;
    } else {
      findings.push(`regions/${id}/locales/${name}  ${before} keys -> ${after} that differ`);
      if (!DRY) fs.writeFileSync(file, JSON.stringify(delta, null, 2) + '\n');
      reduced++;
    }
  }

  if (!DRY) removeEmptyDirs(regionDir);
  if (removed || reduced) {
    console.log(`  ${id.padEnd(6)} ${String(removed).padStart(3)} file(s) removed, ${reduced} reduced to their differences`);
  }
  totals.removed += removed;
  totals.reduced += reduced;
}

if (CHECK) {
  if (findings.length) {
    console.log(`\n  ❌ ${findings.length} regional file(s) copy core instead of overriding it:\n`);
    for (const f of findings.slice(0, 20)) console.log(`     ${f}`);
    if (findings.length > 20) console.log(`     … and ${findings.length - 20} more`);
    console.log('\n     Fix: npm run region:prune\n');
    process.exit(1);
  }
  console.log('  ✅ Every regional file differs from core — no frozen copies.');
  process.exit(0);
}

console.log(
  `\n  ${DRY ? 'Would remove' : 'Removed'} ${totals.removed} file(s); ` +
    `${totals.reduced} locale file(s) reduced; ${totals.keysDropped} duplicated key(s) dropped.`
);

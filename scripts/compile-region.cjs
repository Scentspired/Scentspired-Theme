#!/usr/bin/env node
/**
 * Scentspired Regional Theme Compiler
 *
 * Assembles a standalone, deployable Shopify theme for one region into
 * dist/<region>, by overlaying that region's data payload on top of the
 * shared core.
 *
 *   core (shared code)  +  regions/<id> (pure data)  =  dist/<id>
 *
 * Never reads from or writes to the live regional repositories.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { assertCwdNotLocked } = require('./guard-live-repos.cjs');
const {
  emitRegionSnippet,
  emitRegistrySnippet,
  deepMerge,
  consumedKeys,
  unresolvedKeys,
  listRegions,
  regionContentFiles,
  DEFAULT_REGION,
  REGIONS_DIR,
} = require('./region-engine.cjs');

assertCwdNotLocked();

const THEME_ROOT = path.resolve(__dirname, '..');
const target = (process.argv[2] || DEFAULT_REGION).toLowerCase();
// Both roots are overridable only for the onboarding probe, which builds a
// synthetic region in a temp directory. See tests/static/guard--region-onboarding.cjs.
const DIST_DIR = path.join(
  process.env.SCENTSPIRED_DIST_ROOT ? path.resolve(process.env.SCENTSPIRED_DIST_ROOT) : path.join(THEME_ROOT, 'dist'),
  target
);
const REGION_DIR = path.join(REGIONS_DIR, target);

// Core theme directories shared by every region.
const CORE_DIRS = ['assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];

// Region payload directories overlaid on top of the core, in this order.
// All of these hold DATA: page content and section settings (templates),
// translated strings (locales), and theme settings (config).
//
// snippets/ is deliberately absent. A snippet is code, and letting a region
// drop one in would let it fork a component — the same hole that is closed for
// sections below. Everything a region needs is in its region.json, resolved at
// build time into snippets/region--active.liquid.
const OVERLAY_DIRS = ['templates', 'locales', 'config'];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   📦 COMPILING REGIONAL THEME: ${target.toUpperCase().padEnd(30)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Core:    ${THEME_ROOT}`);
console.log(`  Region:  ${REGION_DIR}`);
console.log(`  Output:  ${DIST_DIR}\n`);

if (!fs.existsSync(REGION_DIR)) {
  console.error(`❌ Regional definition not found: ${REGION_DIR}`);
  process.exit(1);
}

fs.mkdirSync(DIST_DIR, { recursive: true });

// Every path this build intends to produce, so stale files can be removed at the
// end. The output is synced rather than wiped and rebuilt: `shopify theme dev`
// watches this directory, and a mass delete makes it strip files from the
// development theme before they are rewritten.
const emitted = new Set();

function copyTree(src, dest) {
  if (!fs.existsSync(src)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyTree(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      const next = fs.readFileSync(from);
      if (!fs.existsSync(to) || !fs.readFileSync(to).equals(next)) {
        fs.writeFileSync(to, next);
      }
      emitted.add(path.relative(DIST_DIR, to).replace(/\\/g, '/'));
      count++;
    }
  }
  return count;
}

function removeStale(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += removeStale(p);
      if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
      continue;
    }
    const rel = path.relative(DIST_DIR, p).replace(/\\/g, '/');
    if (rel === '.compilation-metadata.json' || emitted.has(rel)) continue;
    fs.unlinkSync(p);
    removed++;
  }
  return removed;
}

const stats = {};

console.log('>>> [1/6] Copying shared core...');
for (const dir of CORE_DIRS) {
  stats[dir] = copyTree(path.join(THEME_ROOT, dir), path.join(DIST_DIR, dir));
  console.log(`  + ${dir.padEnd(12)}: ${stats[dir]} files`);
}

/**
 * Locales MERGE rather than replace. A region's locale file carries only the
 * keys whose text differs; every other key comes from core.
 *
 * Replacing the whole file meant a region's copy silently dropped any key core
 * added after the copy was taken — dist/usa was missing four keys that
 * layout/ecom.liquid renders, and dist/uae 961. It also meant every region
 * held 51 full copies of core's translations, so one new core string had to be
 * pasted into every region folder. Now a new key reaches every region with no
 * edit anywhere else.
 */
const stripJsonComments = (s) =>
  (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s).replace(/\/\*[\s\S]*?\*\//g, '');

function mergeLocales(src, dest) {
  if (!fs.existsSync(src)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    const coreFile = path.join(THEME_ROOT, 'locales', entry.name);
    const regional = JSON.parse(stripJsonComments(fs.readFileSync(from, 'utf8')));
    const merged = fs.existsSync(coreFile)
      ? deepMerge(JSON.parse(stripJsonComments(fs.readFileSync(coreFile, 'utf8'))), regional)
      : regional;
    const next = JSON.stringify(merged, null, 2) + '\n';
    if (!fs.existsSync(to) || fs.readFileSync(to, 'utf8') !== next) fs.writeFileSync(to, next);
    emitted.add(path.relative(DIST_DIR, to).replace(/\\/g, '/'));
    count++;
  }
  return count;
}

/**
 * The theme holds no page content, so a region must bring all of its own.
 * Every page, header, footer and settings file the default region has is the
 * standard set, and is required here — without one the storefront would ship
 * with that page missing, and nothing would say so. A region may have extra
 * pages of its own (USA's robots.txt, UAE's waitlist).
 */
if (target !== DEFAULT_REGION && listRegions().includes(DEFAULT_REGION)) {
  const standard = regionContentFiles(DEFAULT_REGION);
  const mine = new Set(regionContentFiles(target));
  const missing = standard.filter((f) => !mine.has(f));
  {
    if (missing.length) {
      console.error(`\n❌ regions/${target}/ is missing ${missing.length} of the standard content file(s):\n`);
      for (const f of missing.slice(0, 25)) console.error(`   ${f}`);
      if (missing.length > 25) console.error(`   … and ${missing.length - 25} more`);
      console.error(`\n   Copy them from a region to start from, then edit:`);
      console.error(`     cp regions/${DEFAULT_REGION}/<file> regions/${target}/<file>\n`);
      process.exit(1);
    }
  }
}

console.log(`\n>>> [2/6] Overlaying ${target.toUpperCase()} data payload...`);
const overlaid = {};
for (const dir of OVERLAY_DIRS) {
  const n =
    dir === 'locales'
      ? mergeLocales(path.join(REGION_DIR, dir), path.join(DIST_DIR, dir))
      : copyTree(path.join(REGION_DIR, dir), path.join(DIST_DIR, dir));
  if (n > 0) {
    overlaid[dir] = n;
    console.log(`  ~ ${dir.padEnd(12)}: ${n} files overridden`);
  }
}

/**
 * Section GROUPS are data — which sections appear, in what order, with which
 * settings — so a region may override them. Section .liquid files are code and
 * may not be overridden: allowing that would let a region fork a component,
 * which is exactly the duplication this architecture exists to remove.
 */
/**
 * Snippets are code. A region that could ship one could fork any component,
 * which is the duplication this architecture exists to remove.
 */
const regionSnippets = path.join(REGION_DIR, 'snippets');
if (fs.existsSync(regionSnippets) && fs.readdirSync(regionSnippets).length > 0) {
  console.error(`\n❌ regions/${target}/snippets/ may not exist.`);
  console.error(`   Found: ${fs.readdirSync(regionSnippets).join(', ')}`);
  console.error('   A snippet is code. Put the value in region.json and read it');
  console.error("   with {% render 'region--active', key: '<key>' %}.\n");
  process.exit(1);
}

const regionSections = path.join(REGION_DIR, 'sections');
if (fs.existsSync(regionSections)) {
  const forked = fs.readdirSync(regionSections).filter(f => f.endsWith('.liquid'));
  if (forked.length > 0) {
    console.error(`\n❌ regions/${target}/sections/ may only contain .json section groups.`);
    console.error(`   Found component code: ${forked.join(', ')}`);
    console.error('   A region overrides section DATA, never section CODE.\n');
    process.exit(1);
  }
  const n = copyTree(regionSections, path.join(DIST_DIR, 'sections'));
  if (n > 0) {
    overlaid.sections = n;
    console.log(`  ~ ${'sections'.padEnd(12)}: ${n} section group(s) overridden`);
  }
}

if (Object.keys(overlaid).length === 0) {
  console.log('  (no regional overrides present)');
}

// Resolve the region at build time so the shipped theme carries one region's
// values and no conditionals. See scripts/region-engine.cjs.
console.log(`\n>>> [3/6] Resolving ${target.toUpperCase()} region data...`);
let resolvedRegion;
try {
  resolvedRegion = emitRegionSnippet(target, DIST_DIR);
} catch (err) {
  if (!err.handled) throw err;
  process.exit(1);
}
emitted.add('snippets/region--active.liquid');

/**
 * Every key shared code reads must resolve for this region. An unresolved key
 * renders as an empty string — a bundle with no price, a link with no href —
 * and nothing errors. Failing here turns onboarding a region into a checklist
 * the compiler prints, rather than a hunt through the storefront.
 *
 * A key may be absent only when its feature is switched off: trustpilot.url is
 * irrelevant while trustpilot.enabled is false, because the code reading it is
 * never rendered.
 */
{
  const missing = unresolvedKeys(resolvedRegion);
  if (missing.length) {
    console.error(`\n❌ regions/${target}/region.json does not define ${missing.length} key(s) shared code renders:\n`);
    for (const [key, files] of missing) console.error(`   ${key.padEnd(40)} read by ${[...files].join(', ')}`);
    console.error('\n   Add them to the region (or to regions/_defaults.json if every region shares them).\n');
    process.exit(1);
  }
  console.log(`  ✓ all ${consumedKeys().size} region keys read by shared code resolve`);
}
console.log(
  `  + snippets/region--active.liquid  (${resolvedRegion.currency_code} ${resolvedRegion.currency_symbol}, ${resolvedRegion.home_url})`
);

const publishedCount = emitRegistrySnippet(DIST_DIR);
emitted.add('snippets/region--registry.liquid');
console.log(`  + snippets/region--registry.liquid (${publishedCount} published storefront(s))`);

// Shopify's uploader rejects any template whose `sections` contains an id that
// is absent from `order`. Live storefronts accumulate these, and regions/**
// mirrors live byte for byte, so the prune happens here on the way out. The
// pruned sections were never rendered, so output is unchanged.
console.log('\n>>> [4/6] Pruning orphan sections for upload...');
let prunedSections = 0;
let prunedFiles = 0;

function pruneOrphans(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneOrphans(p);
      continue;
    }
    if (!p.endsWith('.json')) continue;

    const raw = fs.readFileSync(p, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/\/\*[\s\S]*?\*\//g, ''));
    } catch {
      continue;
    }
    if (!Array.isArray(parsed.order) || !parsed.sections) continue;

    const order = new Set(parsed.order);
    const orphans = Object.keys(parsed.sections).filter(id => !order.has(id));
    if (orphans.length === 0) continue;

    for (const id of orphans) delete parsed.sections[id];
    fs.writeFileSync(p, JSON.stringify(parsed, null, 2) + '\n');
    prunedSections += orphans.length;
    prunedFiles++;
  }
}

pruneOrphans(path.join(DIST_DIR, 'templates'));
console.log(
  prunedSections > 0
    ? `  - pruned ${prunedSections} orphan section(s) across ${prunedFiles} template(s)`
    : '  (no orphan sections)'
);

const staleRemoved = removeStale(DIST_DIR);
if (staleRemoved > 0) console.log(`  - removed ${staleRemoved} stale file(s)`);

console.log('\n>>> [5/6] Writing compilation metadata...');
fs.writeFileSync(
  path.join(DIST_DIR, '.compilation-metadata.json'),
  JSON.stringify(
    {
      region: target,
      compiledAt: new Date().toISOString(),
      source: 'Scentspired-Theme',
      core: stats,
      overlaid,
      prunedOrphanSections: prunedSections,
      resolved: { currency: resolvedRegion.currency_code, home: resolvedRegion.home_url },
    },
    null,
    2
  ) + '\n'
);
console.log('  + .compilation-metadata.json');

console.log('\n>>> [6/6] Validating compiled output...');
const result = spawnSync('node', [path.join(THEME_ROOT, 'tests/static/json-schema-validator.cjs')], {
  stdio: 'inherit',
  env: { ...process.env, THEME_TARGET_DIR: DIST_DIR, SCENTSPIRED_MIRROR_SOURCE: '1' },
  cwd: THEME_ROOT,
});

if (result.status !== 0) {
  console.error(`\n❌ Compilation gate FAILED for ${target.toUpperCase()}.\n`);
  process.exit(1);
}

console.log(`\n✅ dist/${target} compiled and validated.\n`);

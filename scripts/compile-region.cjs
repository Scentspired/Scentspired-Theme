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
  emitDataSnippet,
  consumedDataNames,
  emitContentSnippet,
  consumedContentKeys,
  readRegionContent,
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
  // data/ is excluded: a region without a data file reads that data live from
  // its store instead (UAE's finder), which is a choice, not a gap.
  const standard = regionContentFiles(DEFAULT_REGION).filter((f) => !f.startsWith('data/'));
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

// Structured content (catalogues, lists) from regions/<id>/data/*.json, read by
// code through {% render 'region--data', name: '…' %}. A data set the code
// reads but the region lacks would render `null` and break the component, so
// it is a build failure, named.
{
  let names;
  try {
    names = emitDataSnippet(target, DIST_DIR);
  } catch (err) {
    if (!err.handled) throw err;
    process.exit(1);
  }
  emitted.add('snippets/region--data.liquid');
  const consumed = [...consumedDataNames().entries()];
  const missing = consumed.filter(([name, e]) => !names.includes(name) && !e.optional);
  if (missing.length) {
    console.error(`\n❌ regions/${target}/data/ lacks ${missing.length} data file(s) shared code reads:\n`);
    for (const [name, e] of missing) console.error(`   ${(name + '.json').padEnd(32)} read by ${[...e.files].join(', ')}`);
    console.error('');
    process.exit(1);
  }
  const live = consumed.filter(([name, e]) => !names.includes(name) && e.optional).map(([name]) => name);
  console.log(`  + snippets/region--data.liquid    (${names.length} data file(s): ${names.join(', ') || 'none'})`);
  if (live.length) console.log(`  ~ read live from the store (no data file): ${live.join(', ')}`);
}

// Page content from regions/<id>/content/*.json, read through
// {% render 'region--content', key: '<page>.<section>.<field>' %}. Every path
// the theme reads must exist in this region's files: shoppers see the
// region's own words, never a fallback.
{
  let flat;
  try {
    flat = emitContentSnippet(target, DIST_DIR);
  } catch (err) {
    if (!err.handled) throw err;
    process.exit(1);
  }
  emitted.add('snippets/region--content.liquid');
  const missing = [...consumedContentKeys().entries()].filter(([key]) => !(key in flat));
  if (missing.length) {
    console.error(`\n❌ regions/${target}/content/ lacks ${missing.length} value(s) the theme shows:\n`);
    for (const [key, files] of missing.slice(0, 30)) {
      const [page, ...rest] = key.split('.');
      console.error(`   content/${page}.json  ${rest.join('.').padEnd(40)} read by ${[...files].join(', ')}`);
    }
    if (missing.length > 30) console.error(`   … and ${missing.length - 30} more`);
    console.error('');
    process.exit(1);
  }
  const pages = [...new Set(Object.keys(flat).map((k) => k.split('.')[0]))];
  console.log(`  + snippets/region--content.liquid (${Object.keys(flat).length} value(s) in ${pages.length} page file(s))`);

  /*
   * One page per box. Every entry in content/boxes.json becomes
   * templates/page.<page_template>.json, laid out by page-layouts/box.json —
   * so a new box is a new entry, and its template appears in Shopify's list
   * for a page to use, with no file added to the theme.
   */
  const boxes = readRegionContent(target).boxes || {};
  const boxErrors = [];
  const boxLayoutFile = path.join(THEME_ROOT, 'page-layouts', 'box.json');
  const boxLayout = JSON.parse(stripJsonComments(fs.readFileSync(boxLayoutFile, 'utf8')));
  const templatesDir = path.join(DIST_DIR, 'templates');
  const fieldOf = (obj, dotted) => dotted.split('.').reduce((v, k) => (v == null ? v : v[k]), obj);

  // "@box", "@box.<field>" and "@content:<path>" in a layout become the
  // values they name. One that names nothing fails the build, naming it —
  // a page is never shipped with a blank heading or a missing image.
  function fillLayout(node, box, boxId, where, errors) {
    if (Array.isArray(node)) return node.map((x) => fillLayout(x, box, boxId, where, errors));
    if (node && typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = fillLayout(v, box, boxId, where, errors);
      return out;
    }
    // Only these three forms are references; anything else starting with "@"
    // (a CSS @media rule) is kept as written.
    if (typeof node !== 'string' || !/^@(box$|box\.|content:)/.test(node)) return node;
    if (node === '@box') return boxId;
    const value = node.startsWith('@box.')
      ? fieldOf(box, node.slice('@box.'.length))
      : node.startsWith('@content:')
        ? flat[node.slice('@content:'.length)]
        : undefined;
    if (value === undefined || value === null || value === '' || typeof value === 'object') {
      errors.push(`${where}: ${node} has no value`);
      return '';
    }
    return value;
  }

  const requiredText = ['page_template', 'page_url', 'builder_heading', 'box_name', 'product_handle'];
  const templatesUsed = new Map();
  for (const [boxId, box] of Object.entries(boxes)) {
    const where = `boxes.json "${boxId}"`;
    for (const field of requiredText) {
      if (typeof box[field] !== 'string' || !box[field].trim()) boxErrors.push(`${where}: needs "${field}"`);
    }
    if (!(Number.isInteger(box.perfumes_per_box) && box.perfumes_per_box >= 1)) {
      boxErrors.push(`${where}: "perfumes_per_box" must be a whole number, 1 or more`);
    }
    const oneCollection = typeof box.perfume_collection === 'string' && box.perfume_collection.trim();
    const perSize = box.perfume_collection_per_size && typeof box.perfume_collection_per_size === 'object';
    if (!oneCollection === !perSize) {
      boxErrors.push(`${where}: needs "perfume_collection" (one for every size) or "perfume_collection_per_size" — one of them`);
    }
    // "menu" is optional: a box without it is in no menu. With it, every place
    // it names must be one the header has (snippets/header--box-menu-items.liquid).
    if (box.menu !== undefined) {
      const menuPlaces = ['shop_menu_more_ways_to_shop', 'shop_menu_bundles', 'bundles_menu', 'mobile_menu_own_link'];
      for (const field of ['label', 'image', 'image_alt']) {
        if (typeof (box.menu || {})[field] !== 'string' || !box.menu[field].trim()) boxErrors.push(`${where}: "menu" needs "${field}"`);
      }
      const shownIn = (box.menu || {}).shown_in;
      if (!Array.isArray(shownIn) || !shownIn.length) {
        boxErrors.push(`${where}: "menu"."shown_in" lists where the box appears: ${menuPlaces.join(', ')}`);
      } else {
        for (const p of shownIn) if (!menuPlaces.includes(p)) boxErrors.push(`${where}: "menu"."shown_in" has "${p}" — the header has ${menuPlaces.join(', ')}`);
      }
    }
    // "homepage_card" is optional: the box's card in the homepage bundles slider
    // (sections/bundle--collection.liquid).
    if (box.homepage_card !== undefined) {
      const card = box.homepage_card || {};
      for (const field of ['title', 'button_text', 'image_mobile']) {
        if (typeof card[field] !== 'string' || !card[field].trim()) boxErrors.push(`${where}: "homepage_card" needs "${field}"`);
      }
      if (!(card.image_desktop || '').trim() && !(card.video_desktop || '').trim()) {
        boxErrors.push(`${where}: "homepage_card" needs "image_desktop" (or "video_desktop")`);
      }
    }
    if (typeof box.page_url === 'string' && !box.page_url.startsWith('/')) {
      boxErrors.push(`${where}: "page_url" is the page's address on the store, e.g. "/pages/trio"`);
    }
    if (typeof box.page_template !== 'string' || !/^[a-z0-9][a-z0-9_-]*$/.test(box.page_template)) {
      if (typeof box.page_template === 'string') {
        boxErrors.push(`${where}: "page_template" may use only a-z, 0-9, - and _ (it becomes a file name)`);
      }
      continue;
    }
    if (templatesUsed.has(box.page_template)) {
      boxErrors.push(`${where}: "page_template" "${box.page_template}" is already used by "${templatesUsed.get(box.page_template)}"`);
      continue;
    }
    templatesUsed.set(box.page_template, boxId);

    const file = `page.${box.page_template}.json`;
    if (fs.existsSync(path.join(REGION_DIR, 'templates', file))) {
      boxErrors.push(`${where}: regions/${target}/templates/${file} also exists — the box page is generated; remove that file`);
      continue;
    }
    const page = fillLayout(boxLayout, box, boxId, where, boxErrors);
    const header =
      `/*\n * GENERATED — do not edit. The "${boxId}" box page: page-layouts/box.json\n` +
      ` * filled from regions/${target}/content/boxes.json. Edit those instead.\n */\n`;
    const out = header + JSON.stringify(page, null, 2) + '\n';
    const to = path.join(templatesDir, file);
    fs.mkdirSync(templatesDir, { recursive: true });
    if (!fs.existsSync(to) || fs.readFileSync(to, 'utf8') !== out) fs.writeFileSync(to, out);
    emitted.add(`templates/${file}`);
  }

  // The builder's "Box" setting becomes a list of this region's boxes, so the
  // theme editor offers every box in boxes.json, and only those.
  const builderFile = path.join(DIST_DIR, 'sections', 'bundle--box.liquid');
  if (fs.existsSync(builderFile) && Object.keys(boxes).length) {
    const src = fs.readFileSync(builderFile, 'utf8');
    const m = src.match(/(\{%-?\s*schema\s*-?%\})([\s\S]*?)(\{%-?\s*endschema\s*-?%\})/);
    const schema = JSON.parse(m[2]);
    const setting = schema.settings.find((s) => s.id === 'box');
    Object.assign(setting, {
      type: 'select',
      options: Object.entries(boxes).map(([value, b]) => ({ value, label: b.box_name || value })),
      default: Object.keys(boxes)[0],
      info: "The boxes in this region's content/boxes.json.",
    });
    const next = src.replace(m[0], `${m[1]}\n${JSON.stringify(schema, null, 2)}\n${m[3]}`);
    if (next !== src) fs.writeFileSync(builderFile, next);
  }

  if (boxErrors.length) {
    console.error(`\n❌ regions/${target}/content/boxes.json:\n`);
    for (const e of boxErrors) console.error(`   ${e}`);
    console.error('');
    process.exit(1);
  }
  console.log(
    `  + ${templatesUsed.size} box page(s) from boxes.json: ` +
      [...templatesUsed].map(([t, id]) => `page.${t} (${id})`).join(', ')
  );
}

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

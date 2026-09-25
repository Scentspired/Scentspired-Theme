#!/usr/bin/env node
/**
 * Scentspired Region Engine
 *
 * Resolves a region at BUILD time, not runtime. `_defaults.json` is deep-merged
 * with `regions/<id>/region.json`, validated against `_schema.json`, and emitted
 * as a single `snippets/region--active.liquid` into the compiled theme.
 *
 * Why build time: a runtime `{% case region %}` would ship every region's data
 * to every store and grow a branch per region. Resolving here means each store
 * carries exactly its own values, with zero conditionals — the same cost at 3
 * regions as at 300.
 *
 * Consumers never branch on region. They ask for a value:
 *   {%- capture sym -%}{%- render 'region--active', key: 'currency_symbol' -%}{%- endcapture -%}
 * or take the whole object for JS:
 *   <script>window.__STORE_CONFIG = {% render 'region--active' %};</script>
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');

/**
 * Where regions are read from. Overridable only so the onboarding probe
 * (tests/static/guard--region-onboarding.cjs) can build a synthetic region in a
 * temp directory without writing into the repository.
 */
const REGIONS_DIR = process.env.SCENTSPIRED_REGIONS_DIR
  ? path.resolve(process.env.SCENTSPIRED_REGIONS_DIR)
  : path.join(THEME_ROOT, 'regions');

/**
 * The region a command uses when it is given none, the one a new region copies
 * its content from (`npm run region:new -- fr` starts from uk's pages, header
 * and footer), and the one whose parity baseline is the unsuffixed one.
 *
 * It is an ordinary region: its content lives in regions/uk/ exactly like
 * every other region's. Core (the repository root) holds only what is
 * identical for every region.
 *
 * This is the only place tooling may name a region. Everything else discovers
 * regions from regions/<id>/region.json — adding region #101 edits no script.
 */
const DEFAULT_REGION = 'uk';

/**
 * Content a region can own, whole-file: pages, section groups (header/footer)
 * and theme settings. Core holds the ones identical for every region; the rest
 * live in each region's folder (scripts/prune-region-overlays.cjs keeps it so).
 */
const isContentFile = (rel) =>
  /^templates\//.test(rel) ||
  /^sections\/[^/]+\.json$/.test(rel) ||
  /^data\/[^/]+\.json$/.test(rel) ||
  /^content\/[^/]+\.json$/.test(rel) ||
  rel === 'config/settings_data.json';

/** Every content file a region folder holds, as paths relative to the folder. */
function regionContentFiles(id) {
  const root = path.join(REGIONS_DIR, id);
  const walk = (d) =>
    fs.existsSync(d)
      ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
          e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
        )
      : [];
  return walk(root)
    .map((f) => path.relative(root, f).split(path.sep).join('/'))
    .filter(isContentFile);
}

/** The region.json of one region, or null. Tooling reads data from here, never a hardcoded table. */
function readRegionFile(id) {
  const file = path.join(REGIONS_DIR, id, 'region.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Strip $comment keys so documentation never reaches the storefront. */
function stripComments(value) {
  if (Array.isArray(value)) return value.map(stripComments);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '$comment') continue;
      out[k] = stripComments(v);
    }
    return out;
  }
  return value;
}

/** Objects merge key by key; arrays and scalars are replaced wholesale. */
function deepMerge(base, override) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const isPlainObject = v => v && typeof v === 'object' && !Array.isArray(v);
    out[key] = isPlainObject(value) && isPlainObject(base[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

/**
 * Keys a region must declare in its OWN file, never inherit.
 *
 * These are storefront identity. Validating them against the merged object
 * only proves *someone* supplied them — which is how _defaults.json, itself a
 * copy of the USA storefront, came to hand its domain, locale, currency and
 * contact addresses to every region that forgot to set them. UK and UAE both
 * shipped USA's support address for exactly that reason.
 *
 * Requiring them per-file means region #101 fails loudly on a missing domain
 * instead of quietly going live as the United States.
 */
const MUST_DECLARE = [
  'id',
  'code',
  'name',
  'domain',
  'home_url',
  'hreflang',
  'geo_countries',
  'currency_code',
  'currency_symbol',
  'support_email',
  'returns_email',
];

const TODO = 'TODO';
const isTodo = (s) => s === TODO || s.startsWith(`${TODO}:`);

function validate(region, schema, regionId, own) {
  const errors = [];
  const props = schema.properties || {};

  for (const key of schema.required || []) {
    const value = region[key];
    if (value === undefined || value === null || value === '') {
      errors.push(`missing required key "${key}"`);
    }
  }

  if (own) {
    for (const key of MUST_DECLARE) {
      const value = own[key];
      if (value === undefined || value === null || value === '') {
        errors.push(
          `"${key}" must be declared in regions/${regionId}/region.json, not inherited — ` +
            'it identifies this storefront'
        );
      }
    }
  }

  // `npm run region:new` scaffolds every value a region must supply as "TODO".
  // Name each one still unfilled, so the scaffold is a checklist that cannot
  // ship half-done — rather than a string rendering on the storefront.
  const todos = [];
  const scanTodo = (v, k) => {
    if (typeof v === 'string' && isTodo(v)) todos.push(k);
    else if (Array.isArray(v)) v.forEach((x, i) => scanTodo(x, `${k}[${i}]`));
    else if (v && typeof v === 'object') for (const [kk, vv] of Object.entries(v)) scanTodo(vv, `${k}.${kk}`);
  };
  for (const [key, value] of Object.entries(region)) scanTodo(value, key);
  if (todos.length) {
    errors.push(`${todos.length} value(s) are still the TODO placeholder: ${todos.join(', ')}`);
  }

  for (const [key, value] of Object.entries(region)) {
    const spec = props[key];
    if (!spec) {
      errors.push(`unknown key "${key}" — add it to regions/_schema.json first`);
      continue;
    }
    if (typeof value === 'string' && isTodo(value)) continue; // reported above
    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (spec.type && actual !== spec.type) {
      errors.push(`key "${key}" should be ${spec.type}, got ${actual}`);
    }
  }

  if (errors.length > 0) {
    console.error(`\n❌ Region "${regionId}" does not satisfy regions/_schema.json:`);
    errors.forEach(e => console.error(`   - ${e}`));
    console.error('');
    const err = new Error(`invalid region: ${regionId}`);
    err.handled = true;
    throw err;
  }
}

/** Escape a value for safe literal output inside Liquid markup. */
const esc = value => String(value).replace(/\{\{/g, '{ {').replace(/\{%/g, '{ %');

function renderSnippet(region, regionId) {
  const scalars = Object.entries(region).filter(([, v]) => typeof v !== 'object' || Array.isArray(v));

  const cases = scalars
    .map(([key, value]) => {
      const out = Array.isArray(value) ? value.join(',') : value;
      return `    {%- when '${key}' -%}${esc(out)}`;
    })
    .join('\n');

  /*
   * Nested objects are addressed with a dotted key, e.g. 'trustpilot.url'.
   *
   * This recurses to any depth. It used to stop after one level, which meant
   * a two-level key like 'analytics.ga4_id' inside a nested object was never emitted
   * and silently resolved to nothing — the caller got an empty string and no
   * error.
   */
  const flatten = (obj, prefix) =>
    Object.entries(obj).flatMap(([k, v]) => {
      const key = `${prefix}.${k}`;
      if (v && typeof v === 'object' && !Array.isArray(v)) return flatten(v, key);
      const out = Array.isArray(v) ? v.join(',') : v;
      return [`    {%- when '${key}' -%}${esc(out)}`];
    });

  const nested = Object.entries(region)
    .filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v))
    .flatMap(([group, obj]) => flatten(obj, group))
    .join('\n');

  return `{%- comment -%}
  ============================================================================
  SCENTSPIRED — Active Region: ${region.name} (${regionId})
  ============================================================================
  GENERATED FILE — do not edit.
  Source: regions/_defaults.json + regions/${regionId}/region.json
  Regenerate with: npm run compile:${regionId}

  This storefront carries exactly one region's data and zero conditionals.
  Adding a region never changes this contract, only the values behind it.

  Usage:
    {%- capture v -%}{%- render 'region--active', key: 'currency_symbol' -%}{%- endcapture -%}
    {% render 'region--active' %}   -> the whole object as JSON, for JavaScript
  ============================================================================
{%- endcomment -%}
{%- if key != blank -%}
  {%- case key -%}
${cases}
${nested}
  {%- endcase -%}
{%- else -%}
${JSON.stringify(region, null, 2)}
{%- endif -%}
`;
}

/** Merge + validate a region, returning the resolved object. */
function resolveRegion(regionId) {
  const defaults = stripComments(readJson(path.join(REGIONS_DIR, '_defaults.json')));
  const schema = readJson(path.join(REGIONS_DIR, '_schema.json'));

  const regionFile = path.join(REGIONS_DIR, regionId, 'region.json');
  if (!fs.existsSync(regionFile)) {
    const err = new Error(`No region.json for "${regionId}" (expected ${regionFile})`);
    err.handled = true;
    throw err;
  }

  const own = stripComments(readJson(regionFile));
  const region = deepMerge(defaults, own);
  validate(region, schema, regionId, own);
  return region;
}

/** Resolve a region and write its generated snippet into a compiled theme. */
function emitRegionSnippet(regionId, distDir) {
  const region = resolveRegion(regionId);
  const target = path.join(distDir, 'snippets', 'region--active.liquid');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, renderSnippet(region, regionId));
  return region;
}

/**
 * The cross-region registry: hreflang alternates and the geo-redirect table.
 * These are the only facts that require knowing every storefront at once, so
 * they are generated from all region files rather than hand-maintained. Only
 * published regions appear — an unlaunched storefront is never advertised to
 * search engines nor used as a redirect target.
 */
function renderRegistry(regions) {
  const published = regions.filter(r => r.published !== false);
  const fallback = published.find(r => r.is_default) || published[0];

  const alternates = published
    .map(r => `    <link rel="alternate" hreflang="${r.hreflang}" href="${r.home_url}{{ request.path }}">`)
    .join('\n');

  const xDefault = fallback
    ? `    <link rel="alternate" hreflang="x-default" href="${fallback.home_url}{{ request.path }}">`
    : '';

  const geoMap = JSON.stringify(
    published.flatMap(r => (r.geo_countries || []).map(c => ({ country: c, url: r.home_url })))
  );

  return `{%- comment -%}
  ============================================================================
  SCENTSPIRED — Storefront Registry (${published.length} published region(s))
  ============================================================================
  GENERATED FILE — do not edit. Regenerate with: npm run compile:all

  Usage:
    {% render 'region--registry', mode: 'hreflang' %}   -> alternate link tags
    {% render 'region--registry', mode: 'geo_map' %}    -> [{country,url}] JSON
  ============================================================================
{%- endcomment -%}
{%- case mode -%}
  {%- when 'hreflang' -%}
${alternates}
${xDefault}
  {%- when 'geo_map' -%}
${geoMap}
{%- endcase -%}
`;
}

/**
 * Only published regions reach the registry, so only they are resolved here.
 * Resolving every region meant one half-onboarded region — a scaffold still
 * holding TODOs — failed validation inside every OTHER region's build.
 */
function publishedRegions() {
  return listRegions()
    .filter((id) => (readRegionFile(id) || {}).published === true)
    .map(resolveRegion);
}

/** Write the shared registry (published regions only) into a compiled theme. */
function emitRegistrySnippet(distDir) {
  const regions = publishedRegions();
  const target = path.join(distDir, 'snippets', 'region--registry.liquid');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, renderRegistry(regions));
  return regions.filter(r => r.published !== false).length;
}

/**
 * Write the default (unspecialized) region modules into the repo's own
 * snippets/. Core must be self-contained: it references region--active and
 * region--registry, so those files have to exist and be valid before any
 * compile. The build overwrites them per region in dist/, leaving core
 * untouched. Regenerate with `npm run region:sync`.
 */
/**
 * Structured content — catalogues, lists, tables — lives in
 * regions/<id>/data/<name>.json and reaches code through one generated snippet:
 *
 *   const perfumes = {% render 'region--data', name: 'hero-perfumes' %};
 *
 * It used to be JavaScript literals inside sections: the same perfume
 * catalogue three times over, in media--hero, catalog--aroma-selector and
 * catalog--aroma-notes, so one corrected note meant three edits, and no region
 * could change a word of it.
 */
function readRegionData(regionId) {
  const dir = path.join(REGIONS_DIR, regionId, 'data');
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    out[f.replace(/\.json$/, '')] = readJson(path.join(dir, f));
  }
  return out;
}

/**
 * JSON safe to drop inside a <script> through Liquid: `</` cannot close the
 * script, and U+2028/9 cannot end a JS string. A value containing Liquid
 * delimiters is refused rather than altered — Liquid would execute it.
 */
function dataLiteral(name, value) {
  const json = JSON.stringify(value)
    .replace(/<\//g, '<\\/')
    // U+2028 / U+2029 end a JS string literal, so escape them. Built from char
    // codes: no raw separator character may sit in this source file.
    .split(String.fromCharCode(0x2028)).join('\\u2028')
    .split(String.fromCharCode(0x2029)).join('\\u2029');
  if (/\{\{|\{%/.test(json)) {
    const err = new Error(`data/${name}.json contains "{{" or "{%" — Liquid would execute it`);
    err.handled = true;
    console.error(`\n❌ ${err.message}\n`);
    throw err;
  }
  return json;
}

function renderDataSnippet(data, regionId) {
  const cases = Object.entries(data)
    .map(([name, value]) => `  {%- when '${name}' -%}${dataLiteral(name, value)}`)
    .join('\n');
  const source = regionId
    ? `Region: ${regionId}. Source: regions/${regionId}/data/*.json`
    : "Empty on purpose: the theme holds no data. Each region's build generates this from regions/<id>/data/*.json";
  return `{%- comment -%}
  GENERATED — do not edit. ${source}
  Usage: render 'region--data' with name set to a data file's name, without .json
{%- endcomment -%}
{%- case name -%}
${cases}
  {%- else -%}null
{%- endcase -%}
`;
}

function emitDataSnippet(regionId, distDir) {
  const data = readRegionData(regionId);
  const target = path.join(distDir, 'snippets', 'region--data.liquid');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, renderDataSnippet(data, regionId));
  return Object.keys(data);
}

/**
 * Every data set shared code reads, mapped to the files that read it.
 *
 * A read marked `optional: true` has a live fallback: when the region has no
 * data file, the component reads the store instead. That is how a region
 * chooses its source without any region-name condition in code —
 *
 *   regions/uk/data/hero-perfumes.json  present  -> the finder uses the file
 *   regions/uae/data/hero-perfumes.json absent   -> the finder reads the store
 *
 * and moving a region to live data later is deleting one file.
 */
function consumedDataNames() {
  const out = new Map();
  for (const dir of ['sections', 'snippets', 'blocks', 'layout']) {
    const abs = path.join(THEME_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.liquid') || f.startsWith('region--')) continue;
      const src = fs.readFileSync(path.join(abs, f), 'utf8');
      for (const m of src.matchAll(/render\s+['"]region--data['"]\s*,\s*name:\s*['"]([^'"]+)['"]([^%]*)%\}/g)) {
        if (!out.has(m[1])) out.set(m[1], { files: new Set(), optional: true });
        const entry = out.get(m[1]);
        entry.files.add(`${dir}/${f}`);
        // required as soon as any reader lacks a fallback
        if (!/optional:\s*true/.test(m[2])) entry.optional = false;
      }
    }
  }
  return out;
}

/**
 * Page content — every title, description, label, image and link a shopper
 * sees — lives in human-friendly files, one per page, per region:
 *
 *   regions/<id>/content/global.json    header, footer, cart drawer (every page)
 *   regions/<id>/content/boxes.json     { "five_favourites": { "box_name": …, "banner": {…} } }
 *
 * The theme reads a value by its path, page first:
 *
 *   {% render 'region--content', key: 'global.cart_drawer.empty.heading' %}
 *   '{% render 'region--content', key: 'boxes.five_favourites.box_name', js: true %}'
 *
 * `js: true` returns the value escaped for use inside a JavaScript string. The
 * build fails, naming it, when the theme reads a path a region does not have —
 * so a region's own file, never a fallback, is what shoppers see.
 */
function readRegionContent(regionId) {
  const dir = path.join(REGIONS_DIR, regionId, 'content');
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    out[f.replace(/\.json$/, '')] = stripComments(readJson(path.join(dir, f)));
  }
  return applyLook(out, regionId);
}

/**
 * Looks: regions/<id>/looks/<name>.json, a site theme for a season or a sale
 * (Christmas, a men's sale, Black Friday). A look mirrors the region's content
 * files; every value in it that is not null replaces the same value in the
 * content — a banner image, a headline, the announcement bar, the sale badge's
 * wording. Null keeps the normal value.
 *
 * regions/<id>/looks/_active.json names the look the region shows
 * ("active_look": "christmas"), or "" for none. Prices are never here: which
 * products are on sale, and by how much, is Shopify's (compare-at prices).
 *
 * Every look is checked, active or not: a path that names no content fails the
 * build, so a typo never silently does nothing. npm run looks:refresh writes
 * looks/_blank.json (every field, null) to copy, and adds new fields to each look.
 */
function applyLook(content, regionId) {
  const dir = path.join(REGIONS_DIR, regionId, 'looks');
  if (!fs.existsSync(dir)) return content;
  const errors = [];
  const names = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => f.replace(/\.json$/, ''));
  const activeFile = path.join(dir, '_active.json');
  const active = fs.existsSync(activeFile) ? String(stripComments(readJson(activeFile)).active_look || '').trim() : '';
  if (active && !names.includes(active)) errors.push(`_active.json names "${active}", but there is no looks/${active}.json (looks: ${names.join(', ') || 'none'})`);
  const merge = (base, over, where, apply) => {
    for (const [k, v] of Object.entries(over)) {
      if (v === null || k === '$comment') continue;
      const here = `${where}.${k}`;
      if (base === null || typeof base !== 'object' || !(k in base)) {
        if (Array.isArray(base) && /^\d+$/.test(k)) { if (apply) base.push(v); continue; }   // an extra list item
        errors.push(`${here} names nothing in the region's content`);
        continue;
      }
      if (v && typeof v === 'object' && base[k] && typeof base[k] === 'object') merge(base[k], v, here, apply);
      else if (apply) base[k] = v;
    }
  };
  for (const name of names) {
    const look = stripComments(readJson(path.join(dir, `${name}.json`)));
    for (const [page, over] of Object.entries(look)) {
      if (!over || typeof over !== 'object') continue;
      if (!(page in content)) { errors.push(`looks/${name}.json: ${page}: there is no content/${page}.json`); continue; }
      const apply = name === active;
      merge(apply ? content[page] : JSON.parse(JSON.stringify(content[page])), over, `looks/${name}.json: ${page}`, apply);
    }
  }
  if (errors.length) {
    const err = new Error(`regions/${regionId}/looks/:\n   ${errors.slice(0, 20).join('\n   ')}`);
    console.error(`\n❌ ${err.message}\n`);
    err.handled = true;
    throw err;
  }
  return content;
}

/** { 'global.cart_drawer.empty.heading': 'Oops...', … } — arrays by index. */
function flattenContent(content) {
  const out = {};
  const walk = (v, key) => {
    if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) walk(x, key ? `${key}.${k}` : k);
    } else if (v !== null && v !== undefined) out[key] = String(v);
  };
  walk(content, '');
  return out;
}

/**
 * For every object and list in the content, '<path>.__keys' lists its entries,
 * comma-separated: 'boxes.__keys' -> 'five_favourites,signature_trio,discovery_set'.
 * Theme code loops over that list, so adding an entry to a file (a box, a menu
 * item) reaches every place that lists them, with no code change:
 *
 *   capture ids
 *     render 'region--content', key: 'boxes.__keys'
 *   endcapture
 *   for id in ids | strip | split: ','  …
 */
function listContentKeys(content) {
  const out = {};
  const walk = (v, key) => {
    if (!v || typeof v !== 'object') return;
    if (key) out[`${key}.__keys`] = Object.keys(v).join(',');
    for (const [k, x] of Object.entries(v)) walk(x, key ? `${key}.${k}` : k);
  };
  for (const [page, v] of Object.entries(content)) walk(v, page);
  return out;
}

/** A value made safe to sit inside a JavaScript string literal, either quote. */
const jsEscape = (s) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')
    .replace(/<\//g, '<\\/');

/*
 * Shopify refuses a Liquid file over 256 KB, and a page file of long content
 * (every article's text) passes that on its own. So a page whose lookup would
 * be large is split by its entries (each article, each box) into chunk
 * snippets — region--content--<page>-<n>.liquid, at most CHUNK_BYTES each —
 * and region--content forwards to the right one. Callers never see it: they
 * render 'region--content' with the same keys either way.
 */
const INLINE_BYTES = 40 * 1024;
const CHUNK_BYTES = 100 * 1024;
const LIQUID_FILE_LIMIT = 256 * 1024;

function renderContentSnippets(content, regionId) {
  const flat = { ...flattenContent(content), ...listContentKeys(content) };
  for (const [key, value] of Object.entries(flat)) {
    if (/\{\{|\{%/.test(value)) {
      const err = new Error(`content "${key}" contains "{{" or "{%" — Liquid would execute it`);
      err.handled = true;
      console.error(`\n❌ ${err.message}\n`);
      throw err;
    }
  }
  const whenLine = (key, v) => {
    const js = jsEscape(v);
    const out = js === v ? v : `{%- if js -%}${js}{%- else -%}${v}{%- endif -%}`;
    return `      {%- when '${key}' -%}${out}`;
  };
  // Dispatch on the page first, so each lookup scans one page's keys.
  const pages = {};
  for (const [key, value] of Object.entries(flat)) {
    const page = key.split('.')[0];
    (pages[page] = pages[page] || []).push([key, whenLine(key, value)]);
  }
  const files = {};
  const body = Object.entries(pages)
    .map(([page, entries]) => {
      const size = entries.reduce((n, [, line]) => n + Buffer.byteLength(line) + 1, 0);
      if (size <= INLINE_BYTES) {
        return `  {%- when '${page}' -%}\n    {%- case key -%}\n${entries.map(([, l]) => l).join('\n')}\n    {%- endcase -%}`;
      }
      // group by entry (the key's second part), then pack entries into chunks
      const groups = new Map();
      for (const [key, line] of entries) {
        const entry = key.split('.')[1];
        if (!groups.has(entry)) groups.set(entry, []);
        groups.get(entry).push(line);
      }
      const chunks = [];
      let current = null;
      for (const [entry, lines] of groups) {
        const bytes = lines.reduce((n, l) => n + Buffer.byteLength(l) + 1, 0);
        if (!current || current.bytes + bytes > CHUNK_BYTES) chunks.push((current = { entries: [], lines: [], bytes: 0 }));
        current.entries.push(entry);
        current.lines.push(...lines);
        current.bytes += bytes;
      }
      const routes = chunks.map((c, i) => {
        const name = `region--content--${page}-${i + 1}`;
        const text = `{%- comment -%} GENERATED — do not edit. Part of ${page}.json (${regionId ? `regions/${regionId}` : 'core'}); read through region--content. {%- endcomment -%}\n{%- case key -%}\n${c.lines.join('\n')}\n{%- endcase -%}\n`;
        if (Buffer.byteLength(text) > LIQUID_FILE_LIMIT) {
          const err = new Error(`content "${page}.${c.entries[0]}" alone is over Shopify's 256 KB file limit`);
          err.handled = true;
          console.error(`\n❌ ${err.message}\n`);
          throw err;
        }
        files[name] = text;
        return `      {%- when ${c.entries.map((e) => `'${e}'`).join(', ')} -%}{%- render '${name}', key: key, js: js -%}`;
      });
      return `  {%- when '${page}' -%}\n    {%- assign content_entry = key | remove_first: '${page}.' | split: '.' | first -%}\n    {%- case content_entry -%}\n${routes.join('\n')}\n    {%- endcase -%}`;
    })
    .join('\n');
  const source = regionId
    ? `Region: ${regionId}. Source: regions/${regionId}/content/*.json`
    : "Empty on purpose: the theme holds no content. Each region's build generates this from regions/<id>/content/*.json";
  files['region--content'] = `{%- comment -%}
  GENERATED — do not edit. ${source}
  Usage: render 'region--content' with key set to '<page>.<section>.<field>' (add js: true inside a JS string)
{%- endcomment -%}
{%- assign content_page = key | split: '.' | first -%}
{%- case content_page -%}
${body}
{%- endcase -%}
`;
  return files;
}

/** The single lookup snippet, for callers that need only the main file (the core stub). */
function renderContentSnippet(content, regionId) {
  return renderContentSnippets(content, regionId)['region--content'];
}

/**
 * Writes region--content (and any chunks) for a region. Returns the content
 * as { key: value } and the snippet files written, for the build to keep.
 */
/**
 * The content pages theme code reads at render time: a page is read when some
 * Liquid names a key under it ('global.…', 'boxes.' | append: …). Pages only a
 * template layout reads (home, page-faqs, …) are filled in at build time and
 * stay out of the lookup, which Liquid would otherwise search on every render.
 */
function liquidReadPages(pages) {
  const read = new Set();
  for (const dir of ['sections', 'snippets', 'blocks', 'layout']) {
    const abs = path.join(THEME_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.liquid') || f.startsWith('region--')) continue;
      const src = fs.readFileSync(path.join(abs, f), 'utf8');
      for (const p of pages) if (src.includes(`'${p}.`) || src.includes(`"${p}.`)) read.add(p);
    }
  }
  return read;
}

function emitContentSnippet(regionId, distDir) {
  const content = readRegionContent(regionId);
  const dir = path.join(distDir, 'snippets');
  fs.mkdirSync(dir, { recursive: true });
  const read = liquidReadPages(Object.keys(content));
  const files = renderContentSnippets(Object.fromEntries(Object.entries(content).filter(([p]) => read.has(p))), regionId);
  for (const [name, text] of Object.entries(files)) {
    const target = path.join(dir, `${name}.liquid`);
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text) fs.writeFileSync(target, text);
  }
  return { flat: { ...flattenContent(content), ...listContentKeys(content) }, snippets: Object.keys(files).map((n) => `snippets/${n}.liquid`) };
}

/** Every content path the theme reads, mapped to the files that read it. */
function consumedContentKeys() {
  const out = new Map();
  for (const dir of ['sections', 'snippets', 'blocks', 'layout']) {
    const abs = path.join(THEME_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.liquid') || f.startsWith('region--')) continue;
      const src = fs.readFileSync(path.join(abs, f), 'utf8');
      for (const m of src.matchAll(/render\s+['"]region--content['"]\s*,\s*key:\s*['"]([^'"]+)['"]/g)) {
        if (!out.has(m[1])) out.set(m[1], new Set());
        out.get(m[1]).add(`${dir}/${f}`);
      }
    }
  }
  return out;
}

function syncCoreStubs() {
  // Core is the DEFAULT_REGION theme, so its stub resolves that region. This read
  // _defaults.json's id, which stopped existing when _defaults became neutral —
  // leaving the command broken and core's stub frozen on the USA values
  // _defaults used to impersonate.
  const defaults = resolveRegion(DEFAULT_REGION);
  const snippetsDir = path.join(THEME_ROOT, 'snippets');
  fs.writeFileSync(
    path.join(snippetsDir, 'region--active.liquid'),
    renderSnippet(defaults, defaults.id)
  );
  // The theme holds no content, so its data stub is empty: every region's
  // build generates the real one from regions/<id>/data/.
  fs.writeFileSync(
    path.join(snippetsDir, 'region--data.liquid'),
    renderDataSnippet({}, null)
  );
  fs.writeFileSync(path.join(snippetsDir, 'region--content.liquid'), renderContentSnippet({}, null));
  fs.writeFileSync(
    path.join(snippetsDir, 'region--registry.liquid'),
    renderRegistry(publishedRegions())
  );
  return defaults.id;
}

/**
 * Every region key shared code reads, mapped to the files that read it.
 * Found by scanning for {% render 'region--active', key: '<key>' %}, so a new
 * consumer is picked up with no registration anywhere.
 */
function consumedKeys() {
  const out = new Map();
  for (const dir of ['sections', 'snippets', 'blocks', 'layout']) {
    const abs = path.join(THEME_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.liquid') || f.startsWith('region--')) continue;
      const src = fs.readFileSync(path.join(abs, f), 'utf8');
      for (const m of src.matchAll(/render\s+['"]region--active['"]\s*,\s*key:\s*['"]([^'"]+)['"]/g)) {
        if (!out.has(m[1])) out.set(m[1], new Set());
        out.get(m[1]).add(`${dir}/${f}`);
      }
    }
  }
  return out;
}

const getPath = (obj, key) => key.split('.').reduce((v, p) => (v == null ? undefined : v[p]), obj);

/**
 * Consumed keys this resolved region cannot supply. A key under a feature
 * whose `enabled` is false is exempt: the code reading it never renders.
 */
function unresolvedKeys(region) {
  const disabled = (key) => {
    const parts = key.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parent = getPath(region, parts.slice(0, i).join('.'));
      if (parent && parent.enabled === false) return true;
    }
    return false;
  };
  return [...consumedKeys().entries()].filter(([key]) => getPath(region, key) == null && !disabled(key));
}

/**
 * What a new region must put in its region.json — the single answer to "what
 * do I need to add a region". Used by the compiler's check, the onboarding
 * probe and `npm run region:new`, so they can never disagree.
 *
 *   identity   keys a region must declare itself, never inherit (MUST_DECLARE)
 *   required   keys the schema requires, from _defaults or the region
 *   consumed   keys shared code renders that _defaults does not supply
 */
function regionContract() {
  const schema = readJson(path.join(REGIONS_DIR, '_schema.json'));
  const defaults = stripComments(readJson(path.join(REGIONS_DIR, '_defaults.json')));
  const consumed = [...consumedKeys().keys()].filter((k) => {
    if (getPath(defaults, k) != null) return false;
    // exempt when _defaults switches the feature off
    const parts = k.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parent = getPath(defaults, parts.slice(0, i).join('.'));
      if (parent && parent.enabled === false) return false;
    }
    return true;
  });
  return {
    identity: [...MUST_DECLARE],
    required: (schema.required || []).filter((k) => getPath(defaults, k) == null),
    consumed,
  };
}

/** Every region folder that carries a region.json. */
function listRegions() {
  if (!fs.existsSync(REGIONS_DIR)) return [];
  return fs
    .readdirSync(REGIONS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(REGIONS_DIR, e.name, 'region.json')))
    .map(e => e.name)
    .sort();
}

module.exports = {
  resolveRegion,
  emitRegionSnippet,
  emitRegistrySnippet,
  syncCoreStubs,
  listRegions,
  readRegionFile,
  isContentFile,
  regionContentFiles,
  consumedKeys,
  unresolvedKeys,
  readRegionData,
  emitDataSnippet,
  consumedDataNames,
  readRegionContent,
  flattenContent,
  emitContentSnippet,
  consumedContentKeys,
  regionContract,
  deepMerge,
  DEFAULT_REGION,
  REGIONS_DIR,
};

if (require.main === module) {
  const target = process.argv[2];
  if (target === '--sync') {
    const id = syncCoreStubs();
    console.log('  ✅ core region stubs regenerated from defaults (' + id + ')');
    process.exit(0);
  }
  try {
    if (target) {
      console.log(JSON.stringify(resolveRegion(target), null, 2));
    } else {
      for (const id of listRegions()) {
        const r = resolveRegion(id);
        console.log(`  ✅ ${id.padEnd(6)} ${r.name} — ${r.currency_code} ${r.currency_symbol} — ${r.home_url}`);
      }
    }
  } catch (err) {
    if (!err.handled) throw err;
    process.exit(1);
  }
}

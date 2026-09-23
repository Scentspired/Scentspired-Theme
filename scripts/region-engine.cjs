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
const REGIONS_DIR = path.join(THEME_ROOT, 'regions');

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

  for (const [key, value] of Object.entries(region)) {
    const spec = props[key];
    if (!spec) {
      errors.push(`unknown key "${key}" — add it to regions/_schema.json first`);
      continue;
    }
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

  // Nested objects are addressed with a dotted key, e.g. 'social.instagram'.
  const nested = Object.entries(region)
    .filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v))
    .flatMap(([group, obj]) =>
      Object.entries(obj).map(([k, v]) => `    {%- when '${group}.${k}' -%}${esc(v)}`)
    )
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

/** Resolve every region and write the shared registry into a compiled theme. */
function emitRegistrySnippet(distDir) {
  const regions = listRegions().map(resolveRegion);
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
function syncCoreStubs() {
  const defaults = resolveRegion(readJson(path.join(REGIONS_DIR, '_defaults.json')).id);
  const snippetsDir = path.join(THEME_ROOT, 'snippets');
  fs.writeFileSync(
    path.join(snippetsDir, 'region--active.liquid'),
    renderSnippet(defaults, defaults.id)
  );
  fs.writeFileSync(
    path.join(snippetsDir, 'region--registry.liquid'),
    renderRegistry(listRegions().map(resolveRegion))
  );
  return defaults.id;
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

module.exports = { resolveRegion, emitRegionSnippet, emitRegistrySnippet, syncCoreStubs, listRegions, deepMerge };

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

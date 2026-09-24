#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Move hardcoded content out of a theme file into region JSON
 * ============================================================================
 *
 *   node scripts/extract-content.cjs --file=snippets/cart--drawer.liquid --map=<map.json> [--dry]
 *
 * The map names each piece of content in human terms:
 *
 *   {
 *     "page": "global",                 -> regions/<id>/content/global.json
 *     "section": "cart_drawer",         -> { "cart_drawer": { … } }
 *     "values": {
 *       "empty.heading": "Oops...",     -> { "empty": { "heading": "Oops..." } }
 *       "empty.button.link": "/collections/shop"
 *     }
 *   }
 *
 * Each value is the EXACT text now in the theme file. Every place it appears is
 * replaced by a read from the region's file:
 *
 *   visible text between tags          {% render 'region--content', key: '…' %}
 *   alt / title / placeholder / aria-label / href / src / value / content
 *                                      attr="{% render 'region--content', key: '…' %}"
 *   a string inside JavaScript         '{% render 'region--content', key: '…', js: true %}'
 *   text inside HTML in a JS template  >{% render 'region--content', key: '…', js: true %}<
 *
 * Never inside {% schema %}, {% comment %}, <style>, HTML comments or a Liquid
 * tag. Whitespace is untouched, so the rendered page stays byte-identical.
 *
 * The value is written to regions/<every region>/content/<page>.json. Every
 * region starts with today's text — UK and USA render exactly as before — and
 * each is then free to change its own. A value already present with different
 * text is refused, never overwritten. A mapped text that is not found fails.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { listRegions, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const FILE = arg('file');
const MAP = arg('map');
const DRY = process.argv.includes('--dry');
const fail = (m) => {
  console.error(`\n  ✗ ${m}\n`);
  process.exit(1);
};
if (!FILE || !MAP) fail('Usage: --file=<theme file> --map=<map.json> [--dry]');

const map = JSON.parse(fs.readFileSync(path.resolve(MAP), 'utf8'));
if (!/^[a-z0-9_-]+$/.test(map.page || '')) fail('map.page must be a file name like "global" or "bundles"');
if (!/^[a-z0-9_]+$/.test(map.section || '')) fail('map.section must be snake_case, like "cart_drawer"');
const abs = path.join(THEME_ROOT, FILE);
if (!fs.existsSync(abs)) fail(`${FILE} does not exist`);
let src = fs.readFileSync(abs, 'utf8');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const keyOf = (field) => `${map.page}.${map.section}.${field}`;
const tag = (field, js) => `{% render 'region--content', key: '${keyOf(field)}'${js ? ', js: true' : ''} %}`;

/** Ranges that are never content: schema, Liquid comments, CSS, HTML comments, Liquid tags. */
function protectedRanges(text) {
  const ranges = [];
  const add = (re) => {
    for (const m of text.matchAll(re)) ranges.push([m.index, m.index + m[0].length]);
  };
  add(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g);
  add(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g);
  add(/<style[^>]*>[\s\S]*?<\/style>/g);
  add(/\{%-?\s*style\s*-?%\}[\s\S]*?\{%-?\s*endstyle\s*-?%\}/g);
  add(/<!--[\s\S]*?-->/g);
  add(/\{\{[\s\S]*?\}\}/g);
  add(/\{%[\s\S]*?%\}/g);
  return ranges;
}
const scriptRanges = (text) =>
  [...text.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
    const start = m.index + m[0].indexOf('>') + 1;
    return [start, start + m[1].length];
  });
const inside = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);

/*
 * A value is the exact text, or { "text": …, "only": "markup" | "attr" | "js" }
 * when the same string is also used as logic elsewhere in the file — "50ml" is
 * a label on the page but a comparison in the script (activeSize === '50ml'),
 * and replacing that would break size selection.
 */
const spec = (v) => (typeof v === 'string' ? { text: v, only: null } : { text: v && v.text, only: v && v.only });
const valueOf = (v) => spec(v).text;

// Longest texts first, so "View Account" is placed before a bare "Account".
const entries = Object.entries(map.values).sort((a, b) => valueOf(b[1]).length - valueOf(a[1]).length);
const report = [];

for (const [field, raw] of entries) {
  const { text, only } = spec(raw);
  if (only && !['markup', 'attr', 'js'].includes(only)) fail(`values["${field}"].only must be markup, attr or js`);
  const allow = (ctx) => !only || only === ctx;
  if (typeof text !== 'string' || !text.length) fail(`values["${field}"] must be the exact text in ${FILE}`);
  if (!/^[a-z0-9_]+(\.[a-z0-9_]+)*$/.test(field)) fail(`"${field}": use snake_case paths like empty.button.label`);
  const prot = protectedRanges(src);
  const scripts = scriptRanges(src);
  const edits = []; // [start, end, replacement]
  const t = esc(text);
  const boundary = (i, j) => !/[A-Za-z0-9]/.test(src[i - 1] || '') && !/[A-Za-z0-9]/.test(src[j] || '');

  // JavaScript: a quoted string that is exactly the text, or HTML text inside a template.
  for (const [a, b] of allow('js') ? scripts : []) {
    const body = src.slice(a, b);
    for (const m of body.matchAll(new RegExp(`(['"])${t}\\1`, 'g'))) {
      const s = a + m.index;
      if (inside(prot, s)) continue;
      edits.push([s + 1, s + 1 + text.length, tag(field, true)]);
    }
    for (const m of body.matchAll(new RegExp(`>(\\s*)${t}(\\s*)<`, 'g'))) {
      const s = a + m.index + 1 + m[1].length;
      if (inside(prot, s)) continue;
      edits.push([s, s + text.length, tag(field, true)]);
    }
  }
  // Attributes a shopper sees or follows.
  for (const m of allow('attr') ? src.matchAll(new RegExp(`\\s(?:alt|title|placeholder|aria-label|href|src|value|content|data-[\\w-]+)=(["'])${t}\\1`, 'g')) : []) {
    const s = m.index + m[0].length - 1 - text.length;
    if (inside(prot, m.index) || inside(scripts, m.index)) continue;
    edits.push([s, s + text.length, tag(field, false)]);
  }
  // Visible text between tags.
  for (const m of allow('markup') ? src.matchAll(new RegExp(t, 'g')) : []) {
    const s = m.index;
    const e = s + text.length;
    if (inside(prot, s) || inside(scripts, s)) continue;
    if (edits.some(([a, b]) => s < b && e > a)) continue;
    const before = src.lastIndexOf('<', s);
    const close = src.lastIndexOf('>', s);
    if (before > close) continue; // inside an HTML tag (attributes handled above)
    if (!boundary(s, e)) continue;
    edits.push([s, e, tag(field, false)]);
  }

  if (!edits.length) fail(`"${text}" (${field}) not found as content in ${FILE}`);
  edits.sort((x, y) => y[0] - x[0]);
  for (const [a, b, r] of edits) src = src.slice(0, a) + r + src.slice(b);
  report.push([field, text, edits.length]);
}

// Write the values, nested and in the order the map lists them.
function setPath(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) {
    if (cur[p] !== undefined && (typeof cur[p] !== 'object' || cur[p] === null)) fail(`"${dotted}" collides with a value at "${p}"`);
    cur = cur[p] = cur[p] || {};
  }
  const last = parts[parts.length - 1];
  if (cur[last] !== undefined && cur[last] !== value) return false;
  cur[last] = value;
  return true;
}

const regions = listRegions();
const updated = {};
for (const id of regions) {
  const file = path.join(REGIONS_DIR, id, 'content', `${map.page}.json`);
  const doc = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  doc[map.section] = doc[map.section] || {};
  for (const [field, raw] of Object.entries(map.values)) {
    if (!setPath(doc[map.section], field, valueOf(raw))) {
      fail(`regions/${id}/content/${map.page}.json already has ${map.section}.${field} with different text`);
    }
  }
  updated[file] = JSON.stringify(doc, null, 2) + '\n';
}

console.log(`\n  ${FILE}  ->  content/${map.page}.json › ${map.section}`);
for (const [field, text, n] of report.sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`    ${field.padEnd(34)} ${String(n).padStart(2)}x  ${JSON.stringify(text).slice(0, 60)}`);
}
if (DRY) {
  console.log('    (dry run — nothing written)\n');
  process.exit(0);
}
for (const [file, body] of Object.entries(updated)) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}
fs.writeFileSync(abs, src);
console.log(`    written to ${regions.length} region(s)\n`);

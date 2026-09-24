#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Move a hardcoded JavaScript data literal into region JSON
 * ============================================================================
 *
 *   node scripts/extract-js-data.cjs --file=sections/media--hero.liquid \
 *        --var=perfumeDatabase --as=hero-perfumes [--dry]
 *
 * Finds `const|let|var <var> = [ … ]` (or `{ … }`) in a theme file, evaluates
 * the literal exactly as the browser would, writes it to
 * regions/<every region>/data/<as>.json, and replaces the literal with
 *
 *   {% render 'region--data', name: '<as>' %}
 *
 * which the build fills from that region's JSON. The JavaScript around it is
 * untouched: the variable holds the same value, now owned by each region.
 *
 * Refuses anything that is not pure data — a literal that references a
 * variable, calls a function, or contains Liquid — and anything that does not
 * survive a JSON round trip unchanged (functions, undefined, NaN).
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const util = require('util');
const { listRegions, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const FILE = arg('file');
const VAR = arg('var');
const AS = arg('as');
const DRY = process.argv.includes('--dry');

const fail = (m) => {
  console.error(`\n  ✗ ${m}\n`);
  process.exit(1);
};
if (!FILE || !VAR || !/^[a-z0-9-]+$/.test(AS)) {
  fail('Usage: --file=<theme file> --var=<js variable> --as=<data-name (a-z0-9-)> [--dry]');
}

const abs = path.join(THEME_ROOT, FILE);
if (!fs.existsSync(abs)) fail(`${FILE} does not exist`);
const src = fs.readFileSync(abs, 'utf8');

const decl = new RegExp(`\\b(?:const|let|var)\\s+${VAR}\\s*=\\s*`, 'g');
const matches = [...src.matchAll(decl)];
if (matches.length !== 1) fail(`expected exactly one declaration of ${VAR} in ${FILE}, found ${matches.length}`);
const start = matches[0].index + matches[0][0].length;
if (!'[{'.includes(src[start])) fail(`${VAR} is not initialised with an array or object literal`);

/** Index just past the literal's closing bracket, skipping strings and comments. */
function literalEnd(text, i) {
  const stack = [];
  for (; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      for (i++; i < text.length && text[i] !== q; i++) if (text[i] === '\\') i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (c === '/' && text[i + 1] === '*') { i = text.indexOf('*/', i + 2) + 1; continue; }
    if (c === '[' || c === '{') stack.push(c);
    else if (c === ']' || c === '}') {
      stack.pop();
      if (!stack.length) return i + 1;
    }
  }
  return -1;
}
const end = literalEnd(src, start);
if (end < 0) fail(`could not find the end of ${VAR}'s literal`);
const literal = src.slice(start, end);
if (/\{\{|\{%/.test(literal)) fail(`${VAR} contains Liquid — it is not pure data and cannot move to JSON as-is`);

let value;
try {
  value = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
} catch (e) {
  fail(`${VAR} is not a pure data literal (${e.message}) — it references code`);
}
/**
 * Only values JSON represents exactly: strings, finite numbers, booleans,
 * null, arrays and plain objects. Anything else (a function, undefined, NaN,
 * a Date, a RegExp) would change on the way through JSON.
 */
function notJsonSafe(v, at) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? null : `${at} is ${v}`;
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      if (!(i in v)) return `${at}[${i}] is a hole`;
      const bad = notJsonSafe(v[i], `${at}[${i}]`);
      if (bad) return bad;
    }
    return null;
  }
  if (typeof v === 'object' && Object.prototype.toString.call(v) === '[object Object]') {
    for (const [k, x] of Object.entries(v)) {
      const bad = notJsonSafe(x, `${at}.${k}`);
      if (bad) return bad;
    }
    return null;
  }
  return `${at} is a ${typeof v === 'object' ? Object.prototype.toString.call(v) : typeof v}`;
}
const unsafe = notJsonSafe(value, VAR);
if (unsafe) fail(`${VAR} cannot be JSON unchanged: ${unsafe}`);
const roundTrip = JSON.parse(JSON.stringify(value));
if (!util.isDeepStrictEqual(roundTrip, JSON.parse(JSON.stringify(roundTrip)))) fail(`${VAR} does not round-trip`);

const json = JSON.stringify(roundTrip, null, 2) + '\n';
const regions = listRegions();
const count = Array.isArray(roundTrip) ? `${roundTrip.length} entries` : `${Object.keys(roundTrip).length} keys`;

for (const id of regions) {
  const out = path.join(REGIONS_DIR, id, 'data', `${AS}.json`);
  if (fs.existsSync(out) && fs.readFileSync(out, 'utf8') !== json) {
    fail(`regions/${id}/data/${AS}.json already exists with different content — pick another --as`);
  }
}
const replaced = src.slice(0, start) + `{% render 'region--data', name: '${AS}' %}` + src.slice(end);

console.log(`\n  ${FILE}  ${VAR}  (${count}, ${literal.split('\n').length} lines)`);
console.log(`    -> regions/{${regions.join(',')}}/data/${AS}.json`);
if (DRY) {
  console.log('    (dry run — nothing written)\n');
  process.exit(0);
}
for (const id of regions) {
  const out = path.join(REGIONS_DIR, id, 'data', `${AS}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, json);
}
fs.writeFileSync(abs, replaced);
console.log(`    ${FILE}: ${src.split('\n').length} -> ${replaced.split('\n').length} lines\n`);

#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Guard: Heading Structure
 * ============================================================================
 *
 * Checks the RENDERED pages in tests/parity/baseline, not the source.
 *
 * A section does not know what page it lands on, so "one H1 per page" is not a
 * question any single .liquid file can answer — it is a property of the
 * composed output. The parity baselines are that output, already captured, so
 * this reads them.
 *
 *   H1   exactly one <h1> per page
 *   UI   no interface label marked up as a heading
 *
 * Interface chrome — "YOUR CART", "Menu", "Recent Searches" — sits near the
 * top of the DOM on every page, so marking it up as a heading pushed every
 * real content heading down the outline. Those are divs carrying .ui-label
 * now; this keeps them that way.
 *
 * Accepted exceptions live in baseline-headings.json with the reason. Articles
 * are there: a designed article's title is the hero part's <h2> (live UK's
 * markup), so no article page has an H1. See docs/COMPATIBILITY.md (25).
 *
 * Usage
 *   node tests/static/guard--headings.cjs            gate
 *   node tests/static/guard--headings.cjs --list     show every page
 *   node tests/static/guard--headings.cjs --update   re-record the baseline
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..', '..');
const PAGES_DIR = path.join(THEME_ROOT, 'tests', 'parity', 'baseline');
const BASELINE = path.join(__dirname, 'baseline-headings.json');

/**
 * Labels that are interface chrome, never page content. Matched against the
 * full text of a heading element, trimmed and case-insensitive.
 */
const UI_LABELS = [
  'your cart',
  'order summary',
  'menu',
  'recent searches',
  'oops...',
  'you might like to add',
  'close',
  'search',
  'filter',
  'sort by',
];

function headings(html) {
  const out = [];
  const re = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      tag: m[1].toLowerCase(),
      text: m[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
  }
  return out;
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Heading Structure Guard       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Pages: ${PAGES_DIR}\n`);

if (!fs.existsSync(PAGES_DIR)) {
  console.log('  No parity baseline captured yet — nothing to check.');
  console.log('  Run: npm run parity:baseline\n');
  process.exit(0);
}

const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html'));
if (files.length === 0) {
  console.log('  No baseline pages found — nothing to check.\n');
  process.exit(0);
}

const results = {};
for (const f of files) {
  const name = f.replace(/\.html$/, '');
  const hs = headings(fs.readFileSync(path.join(PAGES_DIR, f), 'utf8'));
  const h1 = hs.filter((h) => h.tag === 'h1');
  /*
   * h1 is exempt from the label rule. An h1 is the page's main heading by
   * definition, so if a page's heading happens to read "ORDER SUMMARY" — as
   * the cart page's does — that is the page being titled, not chrome leaking
   * into the outline. The chrome case is the same words as an h2 inside the
   * cart drawer, which is still caught.
   */
  const ui = hs.filter((h) => h.tag !== 'h1' && UI_LABELS.includes(h.text.toLowerCase()));
  results[name] = { h1: h1.length, ui: ui.map((u) => `${u.tag} "${u.text}"`) };
}

const baseline = fs.existsSync(BASELINE)
  ? JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
  : { accepted: {} };
const accepted = baseline.accepted || {};

if (process.argv.includes('--list')) {
  for (const [name, r] of Object.entries(results)) {
    const note = accepted[name] ? '  (accepted: ' + accepted[name].reason + ')' : '';
    console.log(`  ${name.padEnd(24)} h1=${r.h1}  ui-headings=${r.ui.length}${note}`);
  }
  console.log('');
}

if (process.argv.includes('--update')) {
  const next = { accepted: {} };
  for (const [name, r] of Object.entries(results)) {
    if (r.h1 === 1 && r.ui.length === 0) continue;
    next.accepted[name] = {
      h1: r.h1,
      ui: r.ui.length,
      reason: accepted[name] ? accepted[name].reason : 'inherited — see TODO.md',
    };
  }
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`  Baseline written: ${Object.keys(next.accepted).length} accepted page(s).\n`);
  process.exit(0);
}

const problems = [];
for (const [name, r] of Object.entries(results)) {
  const a = accepted[name];
  if (r.h1 !== 1 && !(a && a.h1 === r.h1)) {
    problems.push(
      `${name}: ${r.h1} <h1> element(s), expected exactly 1` +
        (a ? ` (baseline allows ${a.h1})` : '')
    );
  }
  if (r.ui.length > 0 && !(a && a.ui >= r.ui.length)) {
    problems.push(`${name}: interface label marked up as a heading — ${r.ui.join(', ')}`);
  }
}

const clean = Object.values(results).filter((r) => r.h1 === 1 && r.ui.length === 0).length;
console.log(`  Pages checked:        ${files.length}`);
console.log(`  Exactly one H1, no UI headings: ${clean}`);
console.log(`  Accepted exceptions:  ${Object.keys(accepted).length}`);
console.log(`  Problems:             ${problems.length}\n`);

if (problems.length) {
  console.log('  ❌ Heading structure regressed:\n');
  for (const p of problems) console.log(`     ${p}`);
  console.log('');
  console.log('  One H1 per page, and interface chrome is not a heading:');
  console.log('  use a div with .ui-label, which carries the same typography.\n');
  process.exit(1);
}

console.log('  ✅ Heading structure holds.\n');
process.exit(0);

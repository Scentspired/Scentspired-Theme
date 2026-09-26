#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — one wording, one key: no label exists in two casings or spellings
 * ============================================================================
 *
 * The same button said "Add to Cart", "Add to cart" and "ADD TO CART" depending
 * on which section drew it, because each section had its own translation key.
 * This finds every storefront translation key the theme reads (| t in Liquid)
 * and fails when two of them hold the same words in a
 * different casing or punctuation ("Search" / "SEARCH", "FAQs" / "FAQ's"):
 * such a label must be one key, used everywhere. With --duplicates it also lists
 * keys whose wording is identical (a second key for the same words).
 *
 *   node tests/static/guard--wording.cjs [--root=<theme>] [--duplicates]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');
const SHOW_DUPLICATES = process.argv.includes('--duplicates');

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
const flatten = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const q = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, q, out);
    else out[q] = String(v);
  }
  return out;
};

// every key the theme reads
const used = new Set();
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(liquid|json)$/.test(e.name) && !e.name.startsWith('region--')) {
      const s = fs.readFileSync(f, 'utf8');
      // storefront wording only: "t:" keys in schemas and JSON name the schema locale
      if (e.name.endsWith('.liquid')) for (const m of s.matchAll(/['"]([a-z0-9_]+(?:\.[a-z0-9_-]+)+)['"]\s*\|\s*t\b/g)) used.add(m[1]);
    }
  }
};
for (const d of ['layout', 'sections', 'snippets', 'blocks', 'templates', 'config']) walk(path.join(ROOT, d));

const storefront = flatten(readJson(path.join(ROOT, 'locales', 'en.default.json')));
// the words of a label, ignoring casing and punctuation; a link is part of the message
const words = (s) => s.toLowerCase().replace(/<a\b[^>]*>/g, ' link ').replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9{}[\]]+/g, ' ').trim();

const groups = {};
for (const [k, v] of Object.entries(storefront)) {
  if (!used.has(k)) continue;
  const w = words(v);
  if (!w) continue;
  (groups[w] = groups[w] || []).push([k, v]);
}

const variants = [], duplicates = [];
for (const g of Object.values(groups)) {
  if (g.length < 2) continue;
  (new Set(g.map(([, v]) => v)).size > 1 ? variants : duplicates).push(g);
}

if (SHOW_DUPLICATES && duplicates.length) {
  console.log(`\n  ${duplicates.length} wording(s) held in more than one key:`);
  for (const g of duplicates) console.log('   ' + g.map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join('  |  '));
}
if (variants.length) {
  console.error(`\n❌ ${variants.length} label(s) in more than one casing or spelling — make each one key:\n`);
  for (const g of variants) console.error('   ' + g.map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join('  |  '));
  console.error('');
  process.exit(1);
}
console.log(`  ✅ ${used.size} translation keys read by the theme: no label in two casings or spellings.`);

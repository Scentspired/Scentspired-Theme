#!/usr/bin/env node
/**
 * Before/after proof that a refactor changed nothing on the page.
 *
 * Saves the rendered HTML of any list of pages from a dev server — normalised
 * with the parity harness's own normaliser (theme ids, block ids, CDN hashes) —
 * and compares two saved sets byte for byte. Identical HTML with unchanged CSS
 * is an unchanged page.
 *
 *   node scripts/snapshot-pages.cjs save <dir> --url=http://127.0.0.1:9293 --country=US <path> <path> …
 *   node scripts/snapshot-pages.cjs compare <before-dir> <after-dir> [--ws]
 *
 * --ws ignores whitespace between tags and collapses runs of whitespace: for a
 * change that removes Liquid tags, whose whitespace control shifts line breaks
 * without changing any element, attribute or text. Read the strict diff first.
 *
 * A path may carry ?view=<template> to render an alternate template.
 */
const fs = require('fs');
const path = require('path');
const { checkPaths, fetchPage } = require('./dev-page.cjs');

// the harness's normaliser, lifted out of render-snapshot.cjs without running it
const src = fs.readFileSync(path.join(__dirname, 'render-snapshot.cjs'), 'utf8');
const start = src.indexOf('function normalize(html)');
let depth = 0, end = start;
for (let i = src.indexOf('{', start); i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
}
// eslint-disable-next-line no-new-func
const normalize = new Function(`${src.slice(start, end)}; return normalize;`)();
// What the dev server varies on top of that: it serves assets from /cdn/… or
// //<shop>.myshopify.com/cdn/… at random, and a restart gives templates new ids,
// which the article parts fold into class names (template21386080125111partsp0).
const normalizeDev = (html) => normalize(html)
  .replace(/(https?:)?\/\/[a-z0-9-]+\.myshopify\.com(\/cdn\/)/g, '$2')
  .replace(/https?:\/cdn\//g, '/cdn/')
  .replace(/template\d{8,}/g, 'templateX');

const [cmd, ...rest] = process.argv.slice(2);
const opt = (n) => (rest.find((a) => a.startsWith(`--${n}=`)) || '').split('=').slice(1).join('=');
const slug = (p) => p.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_') || 'home';

async function save(dir, base, country, pages) {
  checkPaths(pages);
  fs.mkdirSync(dir, { recursive: true });
  for (const p of pages) {
    const html = await fetchPage(base, p, country);
    fs.writeFileSync(path.join(dir, `${slug(p)}.html`), normalizeDev(html));
    console.log(`  saved ${p}`);
  }
}

function compare(a, b, ws) {
  let same = 0, diff = 0;
  const read = (file) => {
    const t = fs.readFileSync(file, 'utf8');
    return ws ? t.replace(/>\s+</g, '><').replace(/\s+/g, ' ').replace(/></g, '>\n<') : t;
  };
  for (const f of fs.readdirSync(a).filter((f) => f.endsWith('.html'))) {
    const x = read(path.join(a, f));
    const y = fs.existsSync(path.join(b, f)) ? read(path.join(b, f)) : null;
    if (x === y) { same++; console.log(`  ✓ ${f}`); continue; }
    diff++;
    if (y === null) { console.log(`  ✗ ${f}: missing after`); continue; }
    const xl = x.split('\n'), yl = y.split('\n');
    const setY = new Set(yl), setX = new Set(xl);
    console.log(`  ✗ ${f}: ${y.length - x.length >= 0 ? '+' : ''}${y.length - x.length} bytes`);
    xl.filter((l) => !setY.has(l)).slice(0, 4).forEach((l) => console.log(`      - ${l.trim().slice(0, 150)}`));
    yl.filter((l) => !setX.has(l)).slice(0, 4).forEach((l) => console.log(`      + ${l.trim().slice(0, 150)}`));
  }
  console.log(`\n${same} identical, ${diff} changed`);
  process.exit(diff ? 1 : 0);
}

(async () => {
  if (cmd === 'save') await save(rest[0], opt('url') || 'http://127.0.0.1:9293', opt('country') || 'US', rest.slice(1).filter((a) => !a.startsWith('--')));
  else if (cmd === 'compare') compare(rest[0], rest[1], rest.includes('--ws'));
  else { console.error('usage: save <dir> --url= --country= <paths…> | compare <before> <after>'); process.exit(2); }
})().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });

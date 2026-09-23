#!/usr/bin/env node
/**
 * Point every font-family declaration at a typography token.
 *
 * The theme names the same family five different ways, differing only in the
 * fallback chain. They render identically whenever the webfont loads, so they
 * collapse to one canonical token — which is what makes typography editable in
 * one place instead of across 72 files.
 *
 * This only rewrites families listed in MAP. Anything unlisted is left exactly
 * as it is rather than guessed at.
 *
 *   node scripts/migrate-fonts.cjs --dry-run
 *   node scripts/migrate-fonts.cjs
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

/**
 * Declared stack (normalised, lowercase, unquoted) -> token.
 * Several entries map to one token on purpose: that is the consolidation.
 */
const MAP = new Map([
  // PP Mori Regular, declared five ways
  ['ppmori regular, sans-serif', '--font-body'],
  ['ppmori regular', '--font-body'],
  ['ppmori regular, arial, sans-serif', '--font-body'],
  ['ppmori regular, -apple-system, blinkmacsystemfont, segoe ui, roboto, sans-serif', '--font-body'],
  ['ppmori regular, -apple-system, blinkmacsystemfont, sans-serif', '--font-body'],
  // NOTE: bare 'PPMori' (no 'Regular') is deliberately NOT mapped. No @font-face
  // declares it, so it falls back to the system font; pointing it at
  // --font-body would start rendering PPMori Regular — a real visual change.

  ['ppmori extralight, sans-serif', '--font-body-light'],
  ['ppmori extralight', '--font-body-light'],
  ['ppmori semibold, sans-serif', '--font-body-semibold'],
  ['ppmori semibold', '--font-body-semibold'],

  // A different @font-face from PPMori Regular — its own token.
  ['pp mori, sans-serif', '--font-mori-alt'],
  ['pp mori', '--font-mori-alt'],

  // PP Editorial New
  ['pp editorial new, serif', '--font-display'],
  ['pp editorial new', '--font-display'],
  ['pp editorial new, georgia, serif', '--font-display'],
  ['ppeditorialnew italic, serif', '--font-display-italic'],
  ['ppeditorialnew italic, georgia, serif', '--font-display-italic'],
  ['ppeditorialnew italic, pp editorial new, georgia, serif', '--font-display-italic'],
  ['ppeditorialnew ultralight italic, serif', '--font-display-ultralight-italic'],
  ['ppeditorialnew ultralight italic', '--font-display-ultralight-italic'],
  ['ppeditorial new ultrabold, serif', '--font-display-ultrabold'],

  // Platform stack
  ['-apple-system, blinkmacsystemfont, segoe ui, roboto, sans-serif', '--font-system'],
]);

const normalise = v =>
  v.replace(/!important/g, '').replace(/["']/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

function targets() {
  const out = [];
  const walk = dir => {
    const full = path.join(THEME_ROOT, dir);
    if (!fs.existsSync(full)) return;
    for (const e of fs.readdirSync(full, { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (/\.(css|liquid)$/.test(e.name)) out.push(rel);
    }
  };
  ['assets', 'sections', 'snippets', 'blocks', 'layout'].forEach(walk);
  // The token file defines the values; it must not point at itself.
  return out.filter(f => !f.includes('token--typography'));
}

let replaced = 0;
let filesChanged = 0;
const perToken = new Map();
const unmapped = new Map();

for (const file of targets()) {
  const full = path.join(THEME_ROOT, file);
  const original = fs.readFileSync(full, 'utf8');

  // Skip @font-face blocks: those declare the family, they do not consume it.
  const fontFaceRanges = [];
  for (const m of original.matchAll(/@font-face\s*\{[^}]*\}/g)) {
    fontFaceRanges.push([m.index, m.index + m[0].length]);
  }
  const inFontFace = i => fontFaceRanges.some(([s, e]) => i >= s && i < e);

  let text = original;
  let offset = 0;
  const edits = [];

  for (const m of original.matchAll(/font-family\s*:\s*([^;}"']*(?:["'][^"']*["'][^;}]*)*)/g)) {
    if (inFontFace(m.index)) continue;
    const raw = m[1];
    if (raw.includes('var(')) continue;
    const key = normalise(raw);
    const token = MAP.get(key);
    if (!token) {
      if (key && key !== 'inherit') unmapped.set(key, (unmapped.get(key) || 0) + 1);
      continue;
    }
    const important = /!important/.test(raw) ? ' !important' : '';
    edits.push({ start: m.index, end: m.index + m[0].length, text: `font-family: var(${token})${important}` });
    perToken.set(token, (perToken.get(token) || 0) + 1);
  }

  if (edits.length === 0) continue;
  for (const e of edits) {
    text = text.slice(0, e.start + offset) + e.text + text.slice(e.end + offset);
    offset += e.text.length - (e.end - e.start);
  }

  replaced += edits.length;
  filesChanged++;
  if (!DRY) fs.writeFileSync(full, text);
}

console.log(`\n  ${DRY ? 'Would rewrite' : 'Rewrote'} ${replaced} declaration(s) across ${filesChanged} file(s)\n`);
[...perToken.entries()].sort((a, b) => b[1] - a[1]).forEach(([t, n]) => {
  console.log(`    ${String(n).padStart(4)}  var(${t})`);
});

if (unmapped.size) {
  console.log(`\n  Left untouched (${unmapped.size} stack(s) not in the map):`);
  [...unmapped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
    .forEach(([k, n]) => console.log(`    ${String(n).padStart(4)}  ${k}`));
}
console.log('');

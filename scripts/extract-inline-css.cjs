#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED — Inline CSS Extractor
 * ============================================================================
 *
 * Moves Liquid-free <style> blocks out of sections, snippets and blocks into
 * assets/, and replaces them with a stylesheet_tag in the same place.
 *
 * Why: 46% of the theme's Liquid is inline CSS and JS. Inline CSS cannot be
 * cached — the browser re-downloads it inside the HTML on every page that
 * renders the section — and it makes the files too big to read. header.liquid
 * is 5,604 lines, of which 2,213 are CSS.
 *
 * What it will NOT touch:
 *
 *   A <style> block containing {{ or {% stays put. It is generated per
 *   section or per settings, and a static file cannot express it.
 *
 *   Position is preserved exactly: the <link> goes where the <style> was, so
 *   cascade order does not move. That is the whole reason this is safe for
 *   CSS and not automatically safe for JS, where extraction would change
 *   execution timing.
 *
 * Usage:
 *   node scripts/extract-inline-css.cjs --file=sections/x.liquid [--dry]
 *   node scripts/extract-inline-css.cjs --all --min=100 [--dry]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const ALL = args.includes('--all');
const fileArg = args.find((a) => a.startsWith('--file='));
const minArg = args.find((a) => a.startsWith('--min='));
const MIN = minArg ? Number(minArg.slice('--min='.length)) : 40;

const LIQUID = /\{\{|\{%/;

function targets() {
  if (fileArg) return [fileArg.slice('--file='.length)];
  if (!ALL) {
    console.error('\n  Usage: --file=<path> or --all [--min=N] [--dry]\n');
    process.exit(1);
  }
  const out = [];
  for (const d of ['sections', 'snippets', 'blocks']) {
    for (const f of fs.readdirSync(path.join(THEME_ROOT, d))) {
      if (f.endsWith('.liquid')) out.push(`${d}/${f}`);
    }
  }
  return out;
}

/** assets/ name for a source file: sections/catalog--best-sellers.liquid -> catalog--best-sellers.css */
function assetName(rel) {
  return path.basename(rel, '.liquid') + '.css';
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   INLINE CSS EXTRACTION${DRY ? ' (dry run)' : ''}                                 ║`);
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let movedFiles = 0;
let movedLines = 0;
const skipped = [];

for (const rel of targets()) {
  const full = path.join(THEME_ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`  x ${rel} does not exist`);
    process.exit(1);
  }

  const src = fs.readFileSync(full, 'utf8');
  const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  if (!blocks.length) continue;

  const staticBlocks = blocks.filter((m) => !LIQUID.test(m[1]));
  if (!staticBlocks.length) {
    skipped.push({ rel, why: 'every <style> contains Liquid' });
    continue;
  }

  const lines = staticBlocks.reduce((n, m) => n + m[1].split('\n').length, 0);
  if (lines < MIN) {
    skipped.push({ rel, why: `only ${lines} static line(s), below --min=${MIN}` });
    continue;
  }

  const asset = assetName(rel);
  const assetPath = path.join(THEME_ROOT, 'assets', asset);

  // One asset per source file; several static blocks concatenate in order.
  const css = staticBlocks
    .map((m) => m[1].replace(/^\n+/, '').replace(/\s+$/, ''))
    .join('\n\n');

  const header =
    `/* Extracted from ${rel}.\n` +
    ` * Inline CSS is re-downloaded with the HTML on every page that renders\n` +
    ` * that file and can never be cached. Edit this file, not the .liquid.\n` +
    ` * Blocks still in the .liquid are the ones that contain Liquid. */\n\n`;

  let out = src;
  let first = true;
  for (const m of staticBlocks) {
    const replacement = first
      ? `{{ '${asset}' | asset_url | stylesheet_tag }}`
      : '';
    out = out.replace(m[0], replacement);
    first = false;
  }

  if (!DRY) {
    if (fs.existsSync(assetPath)) {
      console.error(`  x assets/${asset} already exists — refusing to overwrite`);
      process.exit(1);
    }
    fs.writeFileSync(assetPath, header + css + '\n');
    fs.writeFileSync(full, out);
  }

  const before = src.split('\n').length;
  const after = out.split('\n').length;
  console.log(
    `  ${rel.padEnd(46)} ${String(before).padStart(5)} -> ${String(after).padStart(5)} lines   assets/${asset}`
  );
  movedFiles++;
  movedLines += lines;
}

console.log(`\n  ${movedFiles} file(s), ${movedLines} CSS line(s) moved to assets/.`);
if (skipped.length && args.includes('--verbose')) {
  console.log('\n  skipped:');
  for (const s of skipped) console.log(`    ${s.rel.padEnd(46)} ${s.why}`);
}
if (DRY) console.log('  (dry run — nothing written)\n');

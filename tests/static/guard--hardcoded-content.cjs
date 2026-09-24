#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Hardcoded Content Ratchet
 * ============================================================================
 *
 * The goal: the theme is a thin template. Liquid, HTML, CSS and JS give
 * structure; every word, image, link and product a shopper sees comes from the
 * region's JSON (regions/<id>/templates, sections, region.json, data/).
 *
 * This counts what is still written into theme code, per file, by kind:
 *
 *   text      visible text in markup, and alt / title / placeholder / aria-label
 *   js-text   sentences and labels inside JavaScript
 *   media     image and video URLs
 *   links     links to pages, products, collections and other sites
 *   fallback  Liquid fallback text — | default: '…'
 *   ids       product and variant IDs
 *
 * It is a RATCHET: a file may not gain hardcoded content, and a new file may
 * not have any. The recorded counts are debt to pay down, not permission; when
 * a file improves, re-record so the gain is locked in:
 *
 *   node tests/static/guard--hardcoded-content.cjs            check
 *   node tests/static/guard--hardcoded-content.cjs --list     show every file's debt
 *   node tests/static/guard--hardcoded-content.cjs --update   re-record after paying some off
 *
 * Counting is heuristic and conservative; a false positive sits in the
 * baseline harmlessly. What it must never do is miss an increase.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const rootArg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = path.resolve(rootArg ? rootArg.slice('--root='.length) : path.join(__dirname, '../..'));
const BASELINE = rootArg ? null : path.join(__dirname, 'baseline-hardcoded-content.json');

// Third-party and platform code we do not author (Dawn base JS, app output).
const THIRD_PARTY =
  /^(assets\/(global|pubsub|constants|details-|cart|product-|facets|predictive-search|quick-add|search-form|share|show-more|localization|media-gallery|animations|magnify|customer|price-per-item|recipient-form|theme-editor)|sections\/(pagefly|ecom-)|snippets\/(pagefly|ecom))/;

function themeFiles() {
  const out = [];
  for (const d of ['sections', 'snippets', 'blocks', 'layout', 'assets']) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      const rel = `${d}/${f}`;
      if (f.startsWith('region--') || THIRD_PARTY.test(rel)) continue; // region-- snippets are generated from region data
      if (d === 'assets' ? !/\.js$/.test(f) || /\.min\.js$/.test(f) : !f.endsWith('.liquid')) continue;
      out.push(rel);
    }
  }
  return out;
}

function count(src, isJs) {
  const c = { text: 0, 'js-text': 0, media: 0, links: 0, fallback: 0, ids: 0 };
  // {% javascript %} is script too (Shopify bundles it); counting it as markup
  // read every `<` comparison in the header's 2,300 lines of code as page text.
  const scripts = isJs
    ? [src]
    : [
        ...[...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]),
        ...[...src.matchAll(/\{%-?\s*javascript\s*-?%\}([\s\S]*?)\{%-?\s*endjavascript\s*-?%\}/g)].map((m) => m[1]),
      ];
  const noSchema = src.replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, '');

  if (!isJs) {
    const markup = noSchema
      .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .replace(/\{%-?\s*style\s*-?%\}[\s\S]*?\{%-?\s*endstyle\s*-?%\}/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/\{%-?\s*javascript\s*-?%\}[\s\S]*?\{%-?\s*endjavascript\s*-?%\}/g, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    c.text += markup
      // JSON keys ("name": …) in a snippet that emits data are structure, not
      // words a shopper reads — snippets/catalog--finder-products.liquid.
      .replace(/"[A-Za-z_][A-Za-z0-9_]*"\s*:/g, '')
      .replace(/\{\{[\s\S]*?\}\}/g, '\u0000')
      .replace(/\{%[\s\S]*?%\}/g, '\u0000')
      .split(/<[^>]*>/)
      .flatMap((t) => t.split('\u0000'))
      .map((t) => t.replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim())
      .filter((t) => /[A-Za-z]{2,}/.test(t)).length;
    c.text += [...markup.matchAll(/\b(?:alt|title|placeholder|aria-label)="([^"{]*[A-Za-z]{2,}[^"{]*)"/g)].length;
  }

  for (const s of scripts) {
    const body = s.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
    for (const m of body.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.){2,120})\1/g)) {
      const v = m[2].trim();
      if (/[.#\[:>]|^\s*$|\$\{|https?:|\/|=|\(|;|^[A-Z_]+$/.test(v)) continue;
      if (/^[A-Z][a-z]+( [A-Za-z']+)+[.!?]?$|^[A-Z ]{3,}$|^[A-Z][a-z']+[.!?]?$/.test(v)) c['js-text']++;
    }
    c['js-text'] += [...body.matchAll(/>([^<>${}\n]*[A-Za-z]{2,}[^<>${}\n]*)</g)].filter((m) => m[1].trim()).length;
  }

  c.media += [
    ...noSchema.matchAll(
      /(https?:)?\/\/[^\s"'`)]+\.(?:jpe?g|png|webp|gif|svg|mp4|webm|avif)(\?[^\s"'`)]*)?|\/cdn\/shop\/files\/[^\s"'`)]+/gi
    ),
  ].length;
  c.links += [...noSchema.matchAll(/href=["'](\/(?:pages|collections|products|blogs|policies)\/[^"'{]+|https?:\/\/[^"'{]+)["']/g)].length;
  c.links += [...noSchema.matchAll(/(?:location\.href|window\.location)\s*=\s*['"`](\/[a-z][^'"`]*)['"`]/g)].length;
  c.fallback += [...noSchema.matchAll(/\|\s*default:\s*['"]([^'"]*[A-Za-z]{2,}[^'"]*)['"]/g)].length;
  c.ids += [...noSchema.matchAll(/\b\d{13,14}\b/g)].length;
  return c;
}

const current = {};
for (const rel of themeFiles()) {
  const c = count(fs.readFileSync(path.join(ROOT, rel), 'utf8'), rel.endsWith('.js'));
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  if (total) current[rel] = { total, ...c };
}
const sum = (o) => Object.values(o).reduce((n, v) => n + v.total, 0);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Hardcoded Content Ratchet     ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

if (process.argv.includes('--update') && BASELINE) {
  fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n');
  console.log(`  Baseline recorded: ${sum(current)} item(s) in ${Object.keys(current).length} file(s).\n`);
  process.exit(0);
}

const baseline = BASELINE && fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
const grew = [];
const repaid = [];
for (const [rel, c] of Object.entries(current)) {
  const was = baseline[rel] ? baseline[rel].total : 0;
  if (c.total > was) {
    const kinds = Object.entries(c)
      .filter(([k, n]) => k !== 'total' && n > ((baseline[rel] || {})[k] || 0))
      .map(([k, n]) => `${k} ${(baseline[rel] || {})[k] || 0}->${n}`);
    grew.push(`${rel}: ${was} -> ${c.total}  (${kinds.join(', ')})`);
  } else if (c.total < was) repaid.push(`${rel}: ${was} -> ${c.total}`);
}
for (const [rel, b] of Object.entries(baseline)) if (!current[rel]) repaid.push(`${rel}: ${b.total} -> 0`);

console.log(`  Hardcoded content in theme code: ${sum(current)} item(s) in ${Object.keys(current).length} file(s)`);
console.log(`  Accepted baseline:               ${sum(baseline)}\n`);

if (process.argv.includes('--list')) {
  for (const [rel, c] of Object.entries(current).sort((a, b) => b[1].total - a[1].total)) {
    const kinds = Object.entries(c).filter(([k, n]) => k !== 'total' && n).map(([k, n]) => `${k} ${n}`).join(', ');
    console.log(`    ${String(c.total).padStart(5)}  ${rel.padEnd(52)} ${kinds}`);
  }
  console.log('');
}
if (repaid.length) {
  console.log('  ✅ Paid off since the baseline:');
  for (const r of repaid.slice(0, 12)) console.log(`     ${r}`);
  console.log('     Re-record to lock it in: node tests/static/guard--hardcoded-content.cjs --update\n');
}
if (grew.length) {
  console.log('  ❌ Hardcoded content was ADDED to the theme. Put it in region JSON instead');
  console.log('     (a section setting in the page JSON, region.json, or regions/<id>/data/):\n');
  for (const g of grew) console.log(`     ${g}`);
  console.log('');
  process.exit(1);
}
console.log('  ✅ No hardcoded content added.\n');
process.exit(0);

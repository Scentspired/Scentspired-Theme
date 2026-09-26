#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Hardcoded Content Ratchet
 * ============================================================================
 *
 * The rule: regional copy — titles, descriptions, offers, menu items, the
 * images, links and prices that go with them — comes from the region's JSON.
 * Standard UI wording ("Add to cart", "Go back", alerts, labels), layout and
 * styling belong in the theme, the same everywhere.
 *
 * A counter cannot tell those apart, so this does not judge. It counts text
 * written into theme code, per file, by kind, and stops any increase from
 * slipping in unnoticed — a person then decides which it is:
 *
 *   text      visible text in markup, and alt / title / placeholder / aria-label
 *   js-text   sentences and labels inside JavaScript
 *   media     image and video URLs
 *   links     links to pages, products, collections and other sites
 *   fallback  Liquid fallback text — | default: '…'
 *   ids       product and variant IDs
 *
 * It is a RATCHET: a file may not gain text unnoticed, and a new file starts
 * at zero. Regional copy found in the theme is moved out; standard UI wording
 * is accepted by re-recording:
 *
 *   node tests/static/guard--hardcoded-content.cjs            check
 *   node tests/static/guard--hardcoded-content.cjs --list     show every file's debt
 *   node tests/static/guard--hardcoded-content.cjs --update   re-record after paying some off
 *   node tests/static/guard--hardcoded-content.cjs --items=sections/x.liquid   every item in one file
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
  /^assets\/(core--global|core--pubsub|core--constants|ui--details-disclosure|ui--details-modal|catalog--facets|search--form|ui--show-more|core--localization-form|account--customer|core--theme-editor)\.js$/;

// Code whose words no shopper reads: the telemetry's error texts are browser
// messages it matches, its 'Shopify' a Sentry context name, and its panel an
// admin HUD opened only by Ctrl+Shift+L. Not content, and the same everywhere.
const DEVELOPER_ONLY = /^(assets\/core--telemetry\.js|assets\/core--telemetry-config\.js|snippets\/core--telemetry\.liquid)$/;

function themeFiles() {
  const out = [];
  for (const d of ['sections', 'snippets', 'blocks', 'layout', 'assets']) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      const rel = `${d}/${f}`;
      if (f.startsWith('region--') || THIRD_PARTY.test(rel) || DEVELOPER_ONLY.test(rel)) continue; // region-- snippets are generated from region data
      if (d === 'assets' ? !/\.js$/.test(f) || /\.min\.js$/.test(f) : !f.endsWith('.liquid')) continue;
      out.push(rel);
    }
  }
  return out;
}

function count(src, isJs, items) {
  const c = { text: 0, 'js-text': 0, media: 0, links: 0, fallback: 0, ids: 0 };
  // counts a list, and with --items records what was counted
  const note = (kind, list) => {
    if (items) list.forEach((v) => items.push(`${kind.padEnd(8)} ${String(v).replace(/\s+/g, ' ').trim().slice(0, 140)}`));
    return list.length;
  };
  // {% javascript %} is script too (Shopify bundles it); counting it as markup
  // read every `<` comparison in the header's 2,300 lines of code as page text.
  const scripts = isJs
    ? [src]
    : [
        ...[...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]),
        ...[...src.matchAll(/\{%-?\s*javascript\s*-?%\}([\s\S]*?)\{%-?\s*endjavascript\s*-?%\}/g)].map((m) => m[1]),
      ];
  const noSchema = src.replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, '');
  // what renders: a comment (a usage note's example URLs) is never sent to a shopper
  const rendered = noSchema.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');

  if (!isJs) {
    const markup = noSchema
      .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .replace(/\{%-?\s*style\s*-?%\}[\s\S]*?\{%-?\s*endstyle\s*-?%\}/g, '')
      .replace(/\{%-?\s*stylesheet\s*-?%\}[\s\S]*?\{%-?\s*endstylesheet\s*-?%\}/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/\{%-?\s*javascript\s*-?%\}[\s\S]*?\{%-?\s*endjavascript\s*-?%\}/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      // a capture that builds class names ({% capture label_class %}facets__label …) is not words
      .replace(/\{%-?\s*capture\s+\w*class(?:es)?\s*-?%\}[\s\S]*?\{%-?\s*endcapture\s*-?%\}/g, '')
      // an event handler attribute is script (its "=>" is not the end of a tag)
      .replace(/\son[a-z]+="[^"]*"/g, '');
    c.text += note('text', markup
      // JSON keys ("name": …) in a snippet that emits data are structure, not
      // words a shopper reads — snippets/catalog--finder-products.liquid.
      .replace(/"[A-Za-z_][A-Za-z0-9_]*"\s*:/g, '')
      .replace(/\{\{[\s\S]*?\}\}/g, '\u0000')
      .replace(/\{%[\s\S]*?%\}/g, '\u0000')
      .split(/<[^>]*>/)
      .flatMap((t) => t.split('\u0000'))
      .map((t) => t.replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim())
      // an image's sizes list captured into a variable ("(min-width: 750px) calc((100vw - …px) / 2)") is CSS, not words
      .filter((t) => !/^(?:[\s\d(),:.%/*+-]|(?:min|max)-width|px|vw|calc)+$/.test(t))
      .filter((t) => /[A-Za-z]{2,}/.test(t)));
    c.text += note('attr', [...markup.matchAll(/\b(?:alt|title|placeholder|aria-label)="([^"{]*[A-Za-z]{2,}[^"{]*)"/g)]
      // alt="' | append: box_image_alt | append: '" is Liquid building the attribute, not its words
      .filter((m) => !/'\s*\|/.test(m[1]))
      .map((m) => m[0]));
  }

  for (const s of scripts) {
    const body = s
      .replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')
      // structured data's vocabulary ("@type": "Product") is schema.org's, not words
      .replace(/"@(?:type|context)"\s*:\s*"[^"]*"/g, '')
      // not shown to a shopper: console messages, and key names a handler compares
      // (a thrown message is still counted: bundle--five-favourites alerts err.message)
      .replace(/console\.(?:log|warn|error|info|debug)\((?:[^()]|\([^()]*\))*\)/g, '')
      .replace(/\.key\s*[!=]==?\s*(['"])[A-Za-z]+\1|(['"])(?:Enter|Escape|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)\2\s*[!=]==?\s*[\w.]*key\b/g, '')
      // a >= / <= comparison, not markup
      .replace(/[<>]=/g, ' ');
    for (const m of body.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.){2,120})\1/g)) {
      const v = m[2].trim();
      // an object's key ({ 'Accept': 'application/json' }), not text; a ternary's
      // branch (? 'FREE' : …) follows a ?, so it still counts
      if (/[{,]\s*$/.test(body.slice(0, m.index)) && /^\s*:/.test(body.slice(m.index + m[0].length))) continue;
      if (/[.#\[:>]|^\s*$|\$\{|https?:|\/|=|\(|;|^[A-Z_]+$/.test(v)) continue;
      if (/^[A-Z][a-z]+( [A-Za-z']+)+[.!?]?$|^[A-Z ]{3,}$|^[A-Z][a-z']+[.!?]?$/.test(v)) c['js-text'] += note('js-text', [v]);
    }
    c['js-text'] += note('js-html', [...body.matchAll(/>([^<>${}\n]*[A-Za-z]{2,}[^<>${}\n]*)</g)]
      // "> 0 && index <" is two comparisons, and "' + el.innerHTML + '" joins
      // strings: neither is markup around words
      .filter((m) => m[1].trim() && !/&&|\|\||[=;()]|['"`]\s*\+|\+\s*['"`]/.test(m[1]))
      .map((m) => m[1]));
  }

  c.media += note('media', [
    ...rendered.matchAll(
      /(https?:)?\/\/[^\s"'`)]+\.(?:jpe?g|png|webp|gif|svg|mp4|webm|avif)(\?[^\s"'`)]*)?|\/cdn\/shop\/files\/[^\s"'`)]+/gi
    ),
  ].map((m) => m[0]));
  c.links += note('link', [...rendered
    // a preconnect / dns-prefetch hint names a host to warm up, not a page to visit
    .replace(/<link[^>]*rel=["'](?:preconnect|dns-prefetch)["'][^>]*>/g, '')
    .matchAll(/href=["'](\/(?:pages|collections|products|blogs|policies)\/[^"'{]+|https?:\/\/[^"'{]+)["']/g)].map((m) => m[1]));
  c.links += note('link', [...rendered.matchAll(/(?:location\.href|window\.location)\s*=\s*['"`](\/[a-z][^'"`]*)['"`]/g)].map((m) => m[1]));
  c.fallback += note('fallback', [...rendered.matchAll(/\|\s*default:\s*['"]([^'"]*[A-Za-z]{2,}[^'"]*)['"]/g)]
    .map((m) => m[1])
    // a style's default ('light', 'left', '#ffffff') or an id's ('cta') is a design value, not words
    .filter((v) => !/^[a-z0-9_-]+$|^#[0-9a-f]{3,8}$/i.test(v)));
  c.ids += note('id', [...rendered.matchAll(/\b\d{13,14}\b/g)].map((m) => m[0]));
  return c;
}

const itemsArg = process.argv.find((a) => a.startsWith('--items='));
if (itemsArg) {
  const rel = itemsArg.slice('--items='.length);
  const items = [];
  count(fs.readFileSync(path.join(ROOT, rel), 'utf8'), rel.endsWith('.js'), items);
  items.forEach((i) => console.log(i));
  process.exit(0);
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
  console.log('  ❌ New text was written into theme code. Decide what it is:');
  console.log('     - regional copy (titles, descriptions, offers, menu items, images, links, prices)');
  console.log('       -> regions/<id>/content/<page>.json, read with region--content');
  console.log('     - standard UI wording (Add to cart, Go back, alerts, labels) -> it belongs in');
  console.log('       the theme: accept it with --update\n');
  for (const g of grew) console.log(`     ${g}`);
  console.log('');
  process.exit(1);
}
console.log('  ✅ No hardcoded content added.\n');
process.exit(0);

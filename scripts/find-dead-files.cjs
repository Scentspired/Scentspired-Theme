#!/usr/bin/env node
/**
 * Finds theme files nothing uses.
 *
 * Starts from what Shopify renders — every layout a template asks for, every
 * region's templates and section groups, and page-layouts/ — and follows each
 * reference outward: a template's section and block types, and in Liquid,
 * render / include / section / content_for, and every asset file named. A file
 * this never reaches is dead to the storefront.
 *
 * A second, independent check guards against a reference the walk cannot see:
 * for every unreached file, every mention of its name anywhere else in the
 * repository is listed. A dead file should have none outside its own
 * dead neighbours.
 *
 *   node scripts/find-dead-files.cjs            report
 *   node scripts/find-dead-files.cjs --json     machine-readable
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const list = (dir, re = /./) => (exists(dir) ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => re.test(f)).map((f) => `${dir}/${f}`) : []);
const walkDir = (dir) => {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkDir(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
};
const parseJson = (rel) => {
  try {
    return JSON.parse(read(rel).replace(/^﻿/, '').replace(/\/\*[\s\S]*?\*\//g, ''));
  } catch {
    return null;
  }
};

// ── the theme's files ───────────────────────────────────────────────────────
const THEME = [
  ...list('layout', /\.liquid$/),
  ...list('sections', /\.(liquid|json)$/),
  ...list('blocks', /\.liquid$/),
  ...list('snippets', /\.liquid$/),
  ...list('assets'),
];
const assetNames = new Set(list('assets').map((f) => path.basename(f)));

// ── roots: what Shopify renders ─────────────────────────────────────────────
// The theme's layouts (templates, section groups, theme settings) are what every
// region renders; a region holds only its content.
const templates = walkDir('templates').filter((f) => f.endsWith('.json'));   // nested too: customers/
const regionGroups = list('sections', /\.json$/);
const pageLayouts = list('page-layouts', /\.json$/);
// Liquid templates render on their own: the theme's (gift_card) and each
// region's standalone pages (robots.txt, a waitlist page).
const liquidTemplates = [...walkDir('templates'), ...walkDir('regions').filter((f) => /\/templates\/[^/]+\.liquid$/.test(f))].filter((f) => f.endsWith('.liquid'));
const roots = [...templates, ...liquidTemplates, ...regionGroups, ...pageLayouts, 'config/settings_data.json', 'layout/theme.liquid'];

const reached = new Map(); // file -> the file that first reached it
const queue = [];
const reach = (file, from) => {
  if (!exists(file) || reached.has(file)) return;
  reached.set(file, from);
  queue.push(file);
};
roots.forEach((r) => reach(r, '(root)'));

function edgesOfJson(rel) {
  const doc = parseJson(rel);
  if (!doc) return [];
  const out = [];
  if (typeof doc.layout === 'string' && doc.layout !== 'none') out.push(`layout/${doc.layout}.liquid`);
  const blocks = (b) => {
    for (const x of Object.values(b || {})) {
      if (!x || typeof x !== 'object') continue;
      if (x.type && !x.type.startsWith('@')) out.push(`blocks/${x.type}.liquid`);
      blocks(x.blocks);
    }
  };
  for (const s of Object.values(doc.sections || {})) {
    if (!s || typeof s !== 'object') continue;
    if (s.type && s.type !== '_blocks' && !s.type.startsWith('@')) out.push(`sections/${s.type}.liquid`);
    if (typeof s.blocks === 'object') blocks(s.blocks);
    for (const t of Object.keys(s.block_designs || {})) out.push(`blocks/${t}.liquid`);   // a content list's block types
  }
  return out;
}

function edgesOfText(rel, text) {
  const out = [];
  const liquid = rel.endsWith('.liquid');
  if (liquid) {
    for (const m of text.matchAll(/\{%-?\s*(?:render|include)\s+['"]([^'"]+)['"]/g)) out.push(`snippets/${m[1]}.liquid`);
    for (const m of text.matchAll(/\n\s*(?:render|include)\s+['"]([^'"]+)['"]/g)) out.push(`snippets/${m[1]}.liquid`); // inside {% liquid %}
    for (const m of text.matchAll(/\{%-?\s*section\s+['"]([^'"]+)['"]/g)) out.push(`sections/${m[1]}.liquid`);
    for (const m of text.matchAll(/\{%-?\s*sections\s+['"]([^'"]+)['"]/g)) {
      out.push(`sections/${m[1]}.json`);
      for (const g of regionGroups.filter((f) => f.endsWith(`/${m[1]}.json`))) out.push(g);
    }
    for (const m of text.matchAll(/content_for\s+['"]block['"]\s*,\s*type:\s*['"]([^'"]+)['"]/g)) out.push(`blocks/${m[1]}.liquid`);
    for (const m of text.matchAll(/\{%-?\s*layout\s+['"]([^'"]+)['"]/g)) out.push(`layout/${m[1]}.liquid`);
  }
  // any asset named anywhere in a used file (Liquid, CSS url(), JS) counts
  for (const m of text.matchAll(/[A-Za-z0-9_.@-]+\.(?:css|js|mjs|json|svg|png|jpe?g|gif|webp|woff2?|ttf|otf|eot|mp4|webm|ico|txt)(?:\.liquid)?/g)) {
    const name = path.basename(m[0]);
    if (assetNames.has(name)) out.push(`assets/${name}`);
  }
  // an asset name built at runtime — prepend: "icon-" … append: ".svg" — from a
  // setting's value: every asset that name could be is an option, so all count
  if (liquid) {
    for (const m of text.matchAll(/prepend:\s*['"]([^'"]+)['"][^%}\n]*append:\s*['"](\.[a-z0-9]+)['"]/g)) {
      for (const a of assetNames) if (a.startsWith(m[1]) && a.endsWith(m[2])) out.push(`assets/${a}`);
    }
  }
  // Shopify's Section Rendering API: code that asks for a section by name —
  // ?section_id=x, sections=x,y, { id: …, section: 'x' } — uses that section
  // though no template places it.
  for (const id of requestedSections(text)) {
    if (exists(`sections/${id}.liquid`)) {
      out.push(`sections/${id}.liquid`);
      continue;
    }
    // Asked for by an old name: the section was renamed <domain>-<rest> ->
    // <domain>--<rest>. The file is needed — the request is what is broken.
    const renamed = `sections/${id.replace('-', '--')}.liquid`;
    if (exists(renamed)) out.push(renamed);
    brokenRequests.push({ from: rel, id, renamed: exists(renamed) ? renamed : null });
  }
  return out;
}

const brokenRequests = [];
function requestedSections(text) {
  const ids = new Set();
  for (const m of text.matchAll(/section_id=([a-z0-9_-]+)/g)) ids.add(m[1]);
  for (const m of text.matchAll(/sections=([a-z0-9_,-]+)/g)) m[1].split(',').forEach((x) => x && ids.add(x));
  for (const m of text.matchAll(/section:\s*['"]([a-z0-9_-]+)['"]/g)) ids.add(m[1]);
  // sections: ['a', 'b'] in a request body, or a list built first: const sections = [..., 'a']
  for (const m of text.matchAll(/\bsections\s*[:=]\s*\[([^\]]*)\]/g)) for (const s of m[1].matchAll(/['"]([a-z0-9_-]+)['"]/g)) ids.add(s[1]);
  // Dawn's getSectionsToRender(): { id: 'x', section: 'y' } asks for y; an entry
  // with only { id: 'x' } asks for x itself (cart-notification.js).
  const at = text.indexOf('getSectionsToRender');
  if (at !== -1) {
    const body = text.slice(at, at + 2000);
    // each entry runs from one `id:` to the next; one with no `section:` asks for its id
    const entries = body.split(/\bid:\s*/).slice(1);
    for (const entry of entries) {
      const m = entry.match(/^['"]([a-z0-9_-]+)['"]/);
      if (m && !/section:/.test(entry.split(/\}\s*,?\s*(?:\{|\])/)[0])) ids.add(m[1]);
    }
  }
  return [...ids].filter((id) => !/^\d|^err/.test(id));
}

while (queue.length) {
  const file = queue.shift();
  const text = read(file);
  const edges = file.endsWith('.json') ? [...edgesOfJson(file), ...edgesOfText(file, text)] : edgesOfText(file, text);
  for (const e of edges) reach(e, file);
}

// ── unreached theme files, and every mention of their names ─────────────────
const unreached = THEME.filter((f) => !reached.has(f));
const SEARCH = [
  ...THEME,
  ...walkDir('regions'),
  ...pageLayouts,
  ...walkDir('scripts'),
  ...walkDir('tests').filter((f) => !/tests\/(reporting|parity\/baseline)/.test(f) && !/baseline-[^/]+\.json$|font-inventory\.json$/.test(f)),
  ...walkDir('engine'),
  ...list('config'),
  ...['package.json', 'runner.cjs', 'TODO.md', 'README.md', 'CLAUDE.md'].filter(exists),
].filter((f) => /\.(liquid|json|js|cjs|mjs|css|md|txt)$/.test(f));
const texts = new Map(SEARCH.map((f) => [f, read(f)]));
const nameOf = (f) => (f.startsWith('assets/') ? path.basename(f) : path.basename(f).replace(/\.(liquid|json)$/, ''));
const mentions = {};
for (const f of unreached) {
  const name = nameOf(f);
  const re = new RegExp(`(^|[^A-Za-z0-9_-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9_-])`);
  mentions[f] = SEARCH.filter((g) => g !== f && re.test(texts.get(g)));
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ unreached, mentions, brokenRequests }, null, 2));
} else {
  if (brokenRequests.length) {
    console.log('Sections code asks Shopify for, which do not exist (a broken request, not a dead file):');
    for (const b of brokenRequests) console.log(`  "${b.id}"  requested in ${b.from}`);
    console.log('');
  }
  const byDir = {};
  for (const f of unreached) (byDir[f.split('/')[0]] = byDir[f.split('/')[0]] || []).push(f);
  console.log(`Reached ${reached.size} files from ${roots.length} roots. Theme files never reached: ${unreached.length} of ${THEME.length}.\n`);
  for (const [dir, files] of Object.entries(byDir)) {
    console.log(`${dir}/ (${files.length})`);
    for (const f of files) {
      const m = mentions[f];
      console.log(`  ${path.basename(f).padEnd(52)} ${m.length ? `mentioned in: ${m.slice(0, 4).join(', ')}${m.length > 4 ? ` +${m.length - 4}` : ''}` : 'no mention anywhere'}`);
    }
  }
}

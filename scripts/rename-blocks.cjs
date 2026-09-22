#!/usr/bin/env node
/**
 * One-shot codemod: give every theme block a name that says what it is.
 *
 * The theme shipped 40 blocks called ai_gen_block_<hash>, which say nothing
 * about their purpose and hide the fact that several are near-duplicates of
 * each other. This renames them to `<domain>--<component>` and rewrites every
 * reference in the same pass.
 *
 * Unlike snippets, a theme block's FILENAME IS ITS TYPE — Shopify resolves
 * `"type": "x"` to `blocks/x.liquid`, and there is no forwarding-shim
 * mechanism. So the file rename and every template reference must move
 * together or the block silently disappears from the page.
 *
 *   node scripts/rename-blocks.cjs --dry-run   preview
 *   node scripts/rename-blocks.cjs             apply
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

// Which domain each block's schema name belongs to. Domains follow the
// registry in CRITICAL.md, extended where the editorial work needed it.
const DOMAIN = {
  'aroma notes': 'catalog',
  'bundle builder': 'bundle',
  'coming soon': 'editorial',
  'comparison table': 'editorial',
  'editorial banner': 'editorial',
  'editorial content': 'editorial',
  'editorial section': 'editorial',
  'editorial text section': 'editorial',
  'footer copyright': 'footer',
  'fragrance guide': 'catalog',
  'fragrance showcase': 'catalog',
  'instagram feed': 'social',
  'instagram gallery': 'social',
  'instagram grid': 'social',
  'luxury perfume banner': 'editorial',
  'product collection grid': 'catalog',
  'scent video banner': 'media',
  'split text editorial': 'editorial',
  'staggered typography': 'editorial',
  'tabbed collections': 'catalog',
};

const stripLiquidDocs = s => s.replace(/\{%-?\s*(comment|doc)[\s\S]*?end\1\s*-?%\}/g, '');
const slug = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Every .json that can reference a block type. */
function referenceFiles() {
  const out = [];
  const walk = dir => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.json')) out.push(p);
    }
  };
  walk(path.join(THEME_ROOT, 'templates'));
  walk(path.join(THEME_ROOT, 'regions'));
  const sections = path.join(THEME_ROOT, 'sections');
  for (const f of fs.readdirSync(sections).filter(x => x.endsWith('.json'))) {
    out.push(path.join(sections, f));
  }
  return out;
}

const blocksDir = path.join(THEME_ROOT, 'blocks');
const files = fs.readdirSync(blocksDir).filter(f => f.startsWith('ai_gen_block_') && f.endsWith('.liquid'));

if (files.length === 0) {
  console.log('  Nothing to rename — no ai_gen_block_* files remain.');
  process.exit(0);
}

const refFiles = referenceFiles();
const refText = new Map(refFiles.map(f => [f, fs.readFileSync(f, 'utf8')]));

// Collect each block's schema name and how often it is referenced.
const blocks = files.map(file => {
  const id = file.replace(/\.liquid$/, '');
  const src = fs.readFileSync(path.join(blocksDir, file), 'utf8');
  const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema/);
  let name = 'unnamed';
  if (m) {
    try { name = JSON.parse(stripLiquidDocs(m[1])).name || 'unnamed'; } catch { /* keep default */ }
  }
  // Shopify writes these files with and without a space after the colon, so
  // the reference match must tolerate any whitespace.
  const re = new RegExp(`"type"\\s*:\\s*"${id}"`, 'g');
  let refs = 0;
  for (const text of refText.values()) refs += (text.match(re) || []).length;
  return { id, name, refs };
});

// Group by concept. The most-referenced variant keeps the clean name; the
// rest get -2, -3 ... which is deliberate: the numbering marks duplicates
// that should later collapse into one parameterised component.
const byConcept = new Map();
for (const b of blocks) {
  const key = b.name.toLowerCase().trim();
  if (!byConcept.has(key)) byConcept.set(key, []);
  byConcept.get(key).push(b);
}

const mapping = [];
for (const [concept, group] of byConcept) {
  group.sort((a, b) => b.refs - a.refs || a.id.localeCompare(b.id));
  const domain = DOMAIN[concept] || 'editorial';
  // "editorial--editorial-banner" reads badly; drop the domain word when the
  // component name already repeats it.
  const component = slug(concept)
    .replace(new RegExp(`^${domain}-`), '')
    .replace(new RegExp(`-${domain}$`), '');
  const base = `${domain}--${component || slug(concept)}`;
  group.forEach((b, i) => {
    mapping.push({ ...b, to: i === 0 ? base : `${base}-${i + 1}`, concept, variant: i + 1, total: group.length });
  });
}
mapping.sort((a, b) => a.to.localeCompare(b.to));

console.log(`\n  ${mapping.length} blocks -> ${byConcept.size} concepts\n`);
for (const m of mapping) {
  const dup = m.total > 1 ? `  [${m.variant}/${m.total} of "${m.concept}"]` : '';
  console.log(`  ${m.id.padEnd(24)} -> ${m.to.padEnd(38)} refs=${String(m.refs).padStart(3)}${dup}`);
}

if (DRY) {
  console.log('\n  (dry run — nothing written)\n');
  process.exit(0);
}

// Apply: rename files, then rewrite every reference.
let renamed = 0;
for (const m of mapping) {
  fs.renameSync(path.join(blocksDir, `${m.id}.liquid`), path.join(blocksDir, `${m.to}.liquid`));
  renamed++;
}

let rewritten = 0;
let edited = 0;
for (const [file, original] of refText) {
  let text = original;
  for (const m of mapping) {
    const re = new RegExp(`"type"\\s*:\\s*"${m.id}"`, 'g');
    const hits = (text.match(re) || []).length;
    if (!hits) continue;
    rewritten += hits;
    text = text.replace(re, `"type": "${m.to}"`);
  }
  if (text !== original) {
    fs.writeFileSync(file, text);
    edited++;
  }
}

console.log(`\n  renamed ${renamed} block file(s)`);
console.log(`  rewrote ${rewritten} reference(s) across ${edited} file(s)\n`);

const leftover = fs
  .readdirSync(blocksDir)
  .filter(f => f.startsWith('ai_gen_block_'));
if (leftover.length) {
  console.error(`  ❌ ${leftover.length} ai_gen_block_* file(s) remain`);
  process.exit(1);
}

const danglingFiles = referenceFiles().filter(f => /"type": "ai_gen_block_/.test(fs.readFileSync(f, 'utf8')));
if (danglingFiles.length) {
  console.error(`  ❌ ${danglingFiles.length} file(s) still reference an ai_gen_block_ type`);
  danglingFiles.slice(0, 10).forEach(f => console.error(`     ${path.relative(THEME_ROOT, f)}`));
  process.exit(1);
}

console.log('  ✅ no opaque block names or references remain\n');

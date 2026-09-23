#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED — Snippet Renamer
 * ============================================================================
 *
 * Renames snippets to the domain--component grammar and rewrites every
 * {% render %} and {% include %} that names them.
 *
 * Both quote styles are matched. The theme uses both, and a reference guard
 * that only looked for single quotes reported 37 renders where there are 158
 * — so a renamer with the same blind spot would leave half the call sites
 * pointing at a file that no longer exists.
 *
 * Unlike a section, a snippet name never appears in template JSON, so this is
 * a narrower change than rename-sections. Verify with:
 *   node tests/static/guard--section-refs.cjs
 *
 * Usage:
 *   node scripts/rename-snippets.cjs --map=old:new[,old2:new2] [--dry]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const mapArg = process.argv.find((a) => a.startsWith('--map='));
if (!mapArg) {
  console.error('\n  Usage: node scripts/rename-snippets.cjs --map=old:new[,old2:new2] [--dry]\n');
  process.exit(1);
}

const pairs = mapArg
  .slice('--map='.length)
  .split(',')
  .filter(Boolean)
  .map((p) => {
    const [from, to] = p.split(':');
    return { from: from.trim(), to: to.trim() };
  });

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function collect() {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        if (!/^(node_modules|\.git|dist)$/.test(f)) walk(p);
        continue;
      }
      if (/\.(liquid|json|js)$/.test(f)) out.push(p);
    }
  };
  for (const d of ['sections', 'snippets', 'blocks', 'templates', 'layout', 'assets', 'regions']) {
    walk(path.join(THEME_ROOT, d));
  }
  return out;
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   SNIPPET RENAME${DRY ? ' (dry run)' : ''}                                       ║`);
console.log('╚══════════════════════════════════════════════════════════════╝\n');

for (const { from } of pairs) {
  if (!fs.existsSync(path.join(THEME_ROOT, 'snippets', from + '.liquid'))) {
    console.error(`  ❌ snippets/${from}.liquid does not exist.\n`);
    process.exit(1);
  }
}

let total = 0;
const touched = new Set();

for (const { from, to } of pairs) {
  // Either quote style, render or include.
  const re = new RegExp(
    `(\\{%-?\\s*(?:render|include)\\s+)(['"])${esc(from)}\\2`,
    'g'
  );

  let refs = 0;
  for (const file of collect()) {
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, 'utf8');
    const m = before.match(re);
    if (!m) continue;
    refs += m.length;
    touched.add(path.relative(THEME_ROOT, file).replace(/\\/g, '/'));
    if (!DRY) fs.writeFileSync(file, before.replace(re, `$1$2${to}$2`));
  }

  if (!DRY) {
    fs.renameSync(
      path.join(THEME_ROOT, 'snippets', from + '.liquid'),
      path.join(THEME_ROOT, 'snippets', to + '.liquid')
    );
  }

  console.log(`  ${from.padEnd(30)} -> ${to.padEnd(34)} ${refs} reference(s)`);
  total += refs;
}

console.log(`\n  ${pairs.length} snippet(s), ${total} reference(s), ${touched.size} file(s) touched.`);

if (!DRY) {
  const stragglers = [];
  for (const { from } of pairs) {
    const re = new RegExp(`\\{%-?\\s*(?:render|include)\\s+['"]${esc(from)}['"]`, 'g');
    for (const f of collect()) {
      const src = fs
        .readFileSync(f, 'utf8')
        .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
      const m = src.match(re);
      if (m) stragglers.push(`${path.relative(THEME_ROOT, f).replace(/\\/g, '/')}: ${m.length}x '${from}'`);
    }
  }
  if (stragglers.length) {
    console.log('\n  ❌ references left behind:');
    for (const s of stragglers) console.log(`     ${s}`);
    console.log('');
    process.exit(1);
  }
  console.log('  ✅ no references to the old names remain.\n');
} else {
  console.log('  (dry run — nothing written)\n');
}

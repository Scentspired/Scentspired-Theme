#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED — Section Renamer
 * ============================================================================
 *
 * Renames sections to the domain--component grammar and rewrites every
 * reference with them.
 *
 * A section's name is its `type` in every template, every section group and
 * every region overlay — around 2,300 references across the theme — so this is
 * done in batches with a render diff after each, never in one sweep. The block
 * rename that preceded this missed three references because it matched
 * `"type": "x"` with exactly one space, and Shopify writes both forms; the
 * matcher here is whitespace-tolerant for that reason.
 *
 * Reference forms it follows:
 *
 *   "type": "<name>"          templates/, sections/*.json, regions/**
 *   {% section '<name>' %}    layout/
 *   section_id=<name>         Section Rendering API calls in JS — REFUSED,
 *                             because renaming one of those silently breaks a
 *                             fetch that no render diff will catch.
 *
 * Usage:
 *   node scripts/rename-sections.cjs --map=old:new,old2:new2
 *   node scripts/rename-sections.cjs --map=... --dry
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const mapArg = process.argv.find((a) => a.startsWith('--map='));
if (!mapArg) {
  console.error('\n  Usage: node scripts/rename-sections.cjs --map=old:new[,old2:new2] [--dry]\n');
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

/** Every file a reference could live in. */
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
  for (const d of ['sections', 'snippets', 'blocks', 'templates', 'layout', 'assets', 'regions', 'config']) {
    walk(path.join(THEME_ROOT, d));
  }
  return out;
}

const files = collect();

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   SECTION RENAME${DRY ? ' (dry run)' : ''.padEnd(10)}                                     ║`);
console.log('╚══════════════════════════════════════════════════════════════╝\n');

/* -------------------------------------------------- refuse unsafe renames */

for (const { from } of pairs) {
  const src = path.join(THEME_ROOT, 'sections', from + '.liquid');
  if (!fs.existsSync(src)) {
    console.error(`  ❌ sections/${from}.liquid does not exist.\n`);
    process.exit(1);
  }

  const api = new RegExp('section[_-]?id=' + esc(from) + '\\b', 'i');
  const hits = files.filter((f) => /\.(js|liquid)$/.test(f) && api.test(fs.readFileSync(f, 'utf8')));
  if (hits.length) {
    console.error(`  ❌ "${from}" is fetched through the Section Rendering API from:`);
    for (const h of hits) console.error(`       ${path.relative(THEME_ROOT, h).replace(/\\/g, '/')}`);
    console.error('     Renaming it would break that fetch, and no render diff would catch it.');
    console.error('     Update the call site in the same change, then re-run.\n');
    process.exit(1);
  }
}

/* ------------------------------------------------------------- rewrite */

let totalRefs = 0;
const touched = new Set();

for (const { from, to } of pairs) {
  /*
   * `"type"` is not only a section type. Inside a {% schema %} it is a SETTING
   * type, and several of Shopify's — page, video, product, blog, article,
   * collection — are ordinary words that collide with section names. Renaming
   * `page` rewrote three page-picker settings into `"type":
   * "content--page-legacy"`, which is a schema Shopify would reject.
   *
   * So: in .json files only `sections.<id>.type` is a section type, read
   * structurally. In .liquid files `"type"` is never rewritten at all — the
   * only section reference there is {% section 'name' %}.
   */
  const sectionTag = new RegExp("(\\{%-?\\s*section\\s+')" + esc(from) + "(')", 'g');

  let refs = 0;
  // Re-read the file list each pair: an earlier rename in this same batch has
  // already moved a file, and the stale path throws ENOENT mid-run — which
  // leaves the batch half applied.
  for (const file of collect()) {
    if (file.endsWith(path.join('sections', from + '.liquid'))) continue;
    if (!fs.existsSync(file)) continue;

    const before = fs.readFileSync(file, 'utf8');
    let src = before;
    let n = 0;

    if (file.endsWith('.json')) {
      const lead = (src.match(/^\s*\/\*[\s\S]*?\*\/\s*/) || [''])[0];
      let parsed;
      try {
        parsed = JSON.parse(src.slice(lead.length));
      } catch {
        parsed = null;
      }
      if (parsed && parsed.sections && typeof parsed.sections === 'object') {
        for (const sec of Object.values(parsed.sections)) {
          if (sec && sec.type === from) {
            sec.type = to;
            n++;
          }
        }
        if (n) src = lead + JSON.stringify(parsed, null, 2) + '\n';
      }
    } else {
      const m = src.match(sectionTag);
      if (m) {
        n = m.length;
        src = src.replace(sectionTag, `$1${to}$2`);
      }
    }

    if (!n) continue;
    refs += n;
    touched.add(path.relative(THEME_ROOT, file).replace(/\\/g, '/'));
    if (!DRY) fs.writeFileSync(file, src);
  }

  const src = path.join(THEME_ROOT, 'sections', from + '.liquid');
  const dst = path.join(THEME_ROOT, 'sections', to + '.liquid');
  if (!DRY) fs.renameSync(src, dst);

  console.log(`  ${from.padEnd(34)} -> ${to.padEnd(38)} ${refs} reference(s)`);
  totalRefs += refs;
}

console.log(`\n  ${pairs.length} section(s), ${totalRefs} reference(s), ${touched.size} file(s) touched.`);

/* ------------------------------------------------------------- verify */

if (!DRY) {
  const after = collect();
  const stragglers = [];
  for (const { from } of pairs) {
    // Narrowed the same way as the rewrite: a `"type"` inside a {% schema %}
    // is a setting type, not a section, and reporting those as leftovers sent
    // the first version chasing a rename it should never have made.
    const tagRe = new RegExp("\\{%-?\\s*section\\s+'" + esc(from) + "'", 'g');
    for (const f of after) {
      const rel = path.relative(THEME_ROOT, f).replace(/\\/g, '/');
      const src = fs.readFileSync(f, 'utf8');

      const tags = src.match(tagRe);
      if (tags) stragglers.push(`${rel}: ${tags.length}x {% section '${from}' %}`);

      if (!f.endsWith('.json')) continue;
      try {
        const parsed = JSON.parse(src.replace(/^\s*\/\*[\s\S]*?\*\//, ''));
        const n = Object.values(parsed.sections || {}).filter((s) => s && s.type === from).length;
        if (n) stragglers.push(`${rel}: ${n}x section type "${from}"`);
      } catch { /* not a template */ }
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

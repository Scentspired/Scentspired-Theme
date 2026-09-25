#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Guard: Section & Snippet References Resolve
 * ============================================================================
 *
 * Every section referenced by a template, section group or region overlay must
 * exist on disk, and every rendered snippet must exist too.
 *
 * This is the guard for renaming. A section whose `type` no longer matches a
 * file does not error — Shopify renders the page with that section simply
 * missing. The block rename earlier in this project did exactly that: three
 * references kept the old name, blocks vanished from the homepage and footer,
 * and it only surfaced as a 500 later. A render diff catches it only if the
 * affected page happens to be in the snapshot set; this catches it always,
 * and without a dev server.
 *
 * Usage
 *   node tests/static/guard--section-refs.cjs
 *   node tests/static/guard--section-refs.cjs --root=<dir>
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const rootArg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = path.resolve(
  rootArg ? rootArg.slice('--root='.length) : process.env.THEME_TARGET_DIR || process.cwd()
);

function listNames(dir) {
  const p = path.join(ROOT, dir);
  if (!fs.existsSync(p)) return new Set();
  return new Set(
    fs.readdirSync(p).filter((f) => f.endsWith('.liquid')).map((f) => f.replace(/\.liquid$/, ''))
  );
}

const sections = listNames('sections');
const snippets = listNames('snippets');
const blocks = listNames('blocks');

/** Shopify's own section types, which have no file in the theme. */
const BUILTIN = new Set(['_blocks']);

function walk(dir, out = []) {
  const p = path.join(ROOT, dir);
  if (!fs.existsSync(p)) return out;
  const rec = (d) => {
    for (const f of fs.readdirSync(d)) {
      const full = path.join(d, f);
      if (fs.statSync(full).isDirectory()) {
        rec(full);
        continue;
      }
      if (/\.(json|liquid)$/.test(f)) out.push(full);
    }
  };
  rec(p);
  return out;
}

const files = [
  ...walk('templates'),
  ...walk('sections'),
  ...walk('layout'),
  ...walk('regions'),
  ...walk('snippets'),
  ...walk('blocks'),
];

const problems = [];
let checkedSections = 0;
let checkedSnippets = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  /*
   * Comments are not code. A first run flagged {% render 'cart-drawer-complete' %}
   * as a broken reference when it was a usage example inside a {% comment %}
   * documenting the snippet — a guard that reports documentation as a defect
   * gets ignored, so they are stripped first.
   */
  const src = fs
    .readFileSync(file, 'utf8')
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
    .replace(/\{%-?\s*doc\s*-?%\}[\s\S]*?\{%-?\s*enddoc\s*-?%\}/g, '');

  /*
   * A section type has to be read structurally, not by regex. Both a section
   * and a block inside it are spelled `"type"`, and a first pass that matched
   * the text reported 1,042 failures — every one of them a block type like
   * "heading" or "text" that was never meant to be a section. Only
   * `sections.<id>.type` names a section.
   */
  if (rel.endsWith('.json')) {
    let parsed;
    try {
      parsed = JSON.parse(src.replace(/^\s*\/\*[\s\S]*?\*\//, ''));
    } catch {
      parsed = null;
    }
    if (parsed && parsed.sections && typeof parsed.sections === 'object') {
      for (const [id, sec] of Object.entries(parsed.sections)) {
        const name = sec && sec.type;
        if (!name || BUILTIN.has(name)) continue;
        checkedSections++;
        if (!sections.has(name)) {
          problems.push(`${rel}: section "${id}" has type "${name}" but sections/${name}.liquid does not exist`);
        }
      }
    }
  }

  /*
   * Liquid accepts single OR double quotes, and the theme uses both. Matching
   * only one style made this guard report 37 renders when the real number is
   * several times that — it walked straight past every
   * {% render "blog--article--header" %} in editorial--article.liquid.
   */
  for (const m of src.matchAll(/\{%-?\s*section\s+['"]([^'"]+)['"]/g)) {
    checkedSections++;
    if (!sections.has(m[1]) && !BUILTIN.has(m[1])) {
      problems.push(`${rel}: {% section '${m[1]}' %} but sections/${m[1]}.liquid does not exist`);
    }
  }

  // {% render %} and the older {% include %}; literal names only, since a
  // variable name cannot be resolved statically.
  for (const m of src.matchAll(/\{%-?\s*(?:render|include)\s+['"]([^'"]+)['"]/g)) {
    const name = m[1];
    checkedSnippets++;
    if (!snippets.has(name)) {
      problems.push(`${rel}: {% render '${name}' %} but snippets/${name}.liquid does not exist`);
    }
  }

  /*
   * Inside a {% liquid %} block the tag braces are dropped, so a render looks
   * like a bare `render "header-drawer"` on its own line. Missing this shape
   * is how the mobile menu drawer silently vanished from every page after a
   * snippet rename: header.liquid calls it from inside {% liquid %}, the
   * rename did not rewrite it, and this guard reported zero unresolved
   * references while the drawer was gone. Parity caught it; the guard should
   * have.
   */
  for (const block of src.matchAll(/\{%-?\s*liquid\b([\s\S]*?)-?%\}/g)) {
    for (const m of block[1].matchAll(/^\s*(?:render|include)\s+['"]([^'"]+)['"]/gm)) {
      const name = m[1];
      checkedSnippets++;
      if (!snippets.has(name)) {
        problems.push(
          `${rel}: render '${name}' inside {% liquid %} but snippets/${name}.liquid does not exist`
        );
      }
    }
  }
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Reference Resolution Guard    ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);
console.log(`  sections on disk:     ${sections.size}`);
console.log(`  snippets on disk:     ${snippets.size}`);
console.log(`  section references:   ${checkedSections}`);
console.log(`  snippet renders:      ${checkedSnippets}`);
console.log(`  unresolved:           ${problems.length}\n`);

if (problems.length) {
  console.log('  ❌ References that point at nothing:\n');
  for (const p of problems.slice(0, 40)) console.log(`     ${p}`);
  if (problems.length > 40) console.log(`     …and ${problems.length - 40} more`);
  console.log('');
  console.log('  Shopify does not error on these — it renders the page with the section');
  console.log('  or snippet silently missing. Fix the reference or restore the file.\n');
  process.exit(1);
}

console.log('  ✅ Every section and snippet reference resolves to a file.\n');
process.exit(0);

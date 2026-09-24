#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Guard: Colliding Top-Level Script Bindings
 * ============================================================================
 *
 * Two sections on the same page, each with an inline <script> that declares
 * `const currSym` at the top level, is a SyntaxError:
 *
 *   Uncaught SyntaxError: Identifier 'currSym' has already been declared
 *
 * A top-level const or let in a classic script is a GLOBAL lexical binding,
 * shared across every script on the page. The second declaration throws, and
 * everything after it in that script never runs — so a section silently stops
 * working while each file on its own is perfectly valid JavaScript.
 *
 * That is why the AST syntax validator cannot catch this: it checks each block
 * in isolation, and each block is fine. Only the combination fails, and only
 * at runtime, in the browser console.
 *
 * `var` is exempt: redeclaring it is legal, which is the fix.
 *
 * Usage
 *   node tests/static/guard--script-globals.cjs
 *   node tests/static/guard--script-globals.cjs --list
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const rootArg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = path.resolve(
  rootArg ? rootArg.slice('--root='.length) : process.env.THEME_TARGET_DIR || process.cwd()
);
const BASELINE = path.join(__dirname, 'baseline-script-globals.json');

const files = [];
for (const dir of ['sections', 'snippets', 'blocks', 'layout']) {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (f.endsWith('.liquid')) files.push(path.join(d, f));
  }
}

/** Top-level const/let names inside each inline <script> of a file. */
function topLevelBindings(src) {
  const names = [];
  for (const m of src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const body = m[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/\{%[\s\S]*?%\}/g, '')
      .replace(/\{\{[\s\S]*?\}\}/g, '0');

    let depth = 0;
    for (const line of body.split('\n')) {
      const decl = line.match(/^\s*(?:const|let)\s+([A-Za-z_$][\w$]*)/);
      if (decl && depth === 0) names.push(decl[1]);
      depth += (line.match(/\{/g) || []).length;
      depth -= (line.match(/\}/g) || []).length;
      if (depth < 0) depth = 0;
    }
  }
  return names;
}

const byName = new Map();
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  for (const name of topLevelBindings(fs.readFileSync(file, 'utf8'))) {
    if (!byName.has(name)) byName.set(name, new Set());
    byName.get(name).add(rel);
  }
}

const collisions = [...byName.entries()]
  .filter(([, fileSet]) => fileSet.size > 1)
  .map(([name, fileSet]) => ({ name, files: [...fileSet].sort() }))
  .sort((a, b) => b.files.length - a.files.length);

const baseline = fs.existsSync(BASELINE)
  ? JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
  : { accepted: {} };
const accepted = baseline.accepted || {};

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Script Global Collision Guard ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);
console.log(`  files scanned:            ${files.length}`);
console.log(`  top-level const/let names: ${byName.size}`);
console.log(`  names declared in >1 file: ${collisions.length}\n`);

if (process.argv.includes('--list')) {
  for (const c of collisions) {
    console.log(`  ${accepted[c.name] ? '[accepted]' : '[NEW]'} ${c.name}`);
    for (const f of c.files) console.log(`      ${f}`);
  }
  console.log('');
}

if (process.argv.includes('--update')) {
  const next = { accepted: {} };
  for (const c of collisions) {
    next.accepted[c.name] = {
      files: c.files,
      reason: accepted[c.name] ? accepted[c.name].reason : 'inherited — see TODO.md',
    };
  }
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`  Baseline written: ${Object.keys(next.accepted).length} accepted name(s).\n`);
  process.exit(0);
}

const fresh = collisions.filter((c) => !accepted[c.name]);

if (fresh.length) {
  console.log('  ❌ The same top-level const/let is declared in more than one file:\n');
  for (const c of fresh) {
    console.log(`     ${c.name}`);
    for (const f of c.files) console.log(`       ${f}`);
    console.log('');
  }
  console.log('  If two of these render on one page the second throws');
  console.log('  "Identifier ... has already been declared", and the rest of that');
  console.log('  script never runs — so a section silently stops working while every');
  console.log('  file on its own is valid JavaScript.');
  console.log('  Use var, or move the declaration inside a function.\n');
  process.exit(1);
}

console.log('  ✅ No new top-level script bindings collide.\n');
process.exit(0);

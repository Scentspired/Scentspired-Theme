#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — every region has the same shape, and pages differ by content only
 * ============================================================================
 *
 * USA and UAE once carried config/markets.json and the theme a market override
 * (templates/index.context.pk.json) that UK did not: a regional difference kept
 * outside the regions' content, in a file one region lacked. The compiler
 * refuses these; this checks them before a build:
 *   - a region holds only region.json, content/, data/, looks/, translations/,
 *     templates/ (no config/, no locales/, nothing else);
 *   - no template is a market override ("parent" / "context").
 *
 *   node tests/static/guard--region-shape.cjs [--root=<theme>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');
const ENTRIES = ['region.json', 'content', 'data', 'looks', 'translations', 'templates'];

const problems = [];
const regions = path.join(ROOT, 'regions');
for (const id of fs.existsSync(regions) ? fs.readdirSync(regions, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('_')).map((e) => e.name) : []) {
  for (const e of fs.readdirSync(path.join(regions, id))) {
    if (!ENTRIES.includes(e) && !e.startsWith('_')) problems.push(`regions/${id}/${e}: a region holds only ${ENTRIES.join(', ')}`);
  }
}
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])) : []);
for (const f of walk(path.join(ROOT, 'templates')).filter((f) => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  if (j.parent || j.context) problems.push(`${path.relative(ROOT, f).split(path.sep).join('/')}: a market override; a region's page differs by its content ("@shown", "@content")`);
}

if (problems.length) {
  console.error(`\n❌ ${problems.length} region inconsistenc${problems.length === 1 ? 'y' : 'ies'}:\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log('  ✅ Every region has the same shape; no market overrides.');

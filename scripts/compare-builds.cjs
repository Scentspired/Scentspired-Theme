#!/usr/bin/env node
/**
 * Compare two builds of the theme, file by file, every folder, recursively.
 *
 *   node scripts/compare-builds.cjs save <dir>              copy dist/ to <dir> (a baseline)
 *   node scripts/compare-builds.cjs compare <before> [after] after defaults to dist/
 *
 * For every region: files gone, files new, files changed (byte comparison; JSON is
 * compared parsed, so formatting alone is not a change). Nothing is filtered by type
 * or depth: a check that filters the way a change does cannot see what it missed.
 */
const fs = require('fs');
const path = require('path');

const walk = (root, sub = '') => {
  const abs = path.join(root, sub);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const rel = sub ? `${sub}/${e.name}` : e.name;
    return e.isDirectory() ? walk(root, rel) : [rel];
  });
};
const same = (a, b) => {
  const x = fs.readFileSync(a), y = fs.readFileSync(b);
  if (x.equals(y)) return true;
  if (/\.json$/.test(a)) {
    const parse = (buf) => { try { return JSON.parse(buf.toString('utf8').replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')); } catch { return undefined; } };
    const p = parse(x), q = parse(y);
    if (p !== undefined && JSON.stringify(p) === JSON.stringify(q)) return true;
  }
  return x.toString('utf8').replace(/\r\n/g, '\n') === y.toString('utf8').replace(/\r\n/g, '\n');   // line endings alone are not a change
};
const groupByDir = (files) => {
  const out = {};
  for (const f of files) { const [d, ...rest] = f.split('/'); (out[d] = out[d] || []).push(rest.join('/')); }
  return Object.entries(out).map(([d, list]) => `${d}: ${list.length > 6 ? `${list.length} files` : list.join(', ')}`).join(' | ') || 'none';
};

const [cmd, a, b = 'dist'] = process.argv.slice(2);
if (cmd === 'save') {
  if (!a) throw new Error('usage: save <dir>');
  fs.rmSync(a, { recursive: true, force: true });
  fs.cpSync('dist', a, { recursive: true });
  console.log(`saved dist/ to ${a}`);
} else if (cmd === 'compare') {
  if (!a) throw new Error('usage: compare <before> [after]');
  let changes = 0;
  for (const region of fs.readdirSync(a).filter((d) => fs.statSync(path.join(a, d)).isDirectory())) {
    const A = path.join(a, region), B = path.join(b, region);
    const before = walk(A).filter((f) => !f.startsWith('.')), after = new Set(walk(B).filter((f) => !f.startsWith('.')));
    const gone = before.filter((f) => !after.has(f));
    const added = [...after].filter((f) => !before.includes(f));
    const changed = before.filter((f) => after.has(f) && !same(path.join(A, f), path.join(B, f)));
    changes += gone.length + added.length + changed.length;
    console.log(`\n${region.toUpperCase()}  (${before.length} -> ${after.size} files)`);
    console.log(`  gone    (${gone.length}): ${groupByDir(gone)}`);
    console.log(`  new     (${added.length}): ${groupByDir(added)}`);
    console.log(`  changed (${changed.length}): ${groupByDir(changed)}`);
  }
  process.exit(changes ? 1 : 0);
} else {
  console.error('usage: save <dir> | compare <before> [after]');
  process.exit(2);
}

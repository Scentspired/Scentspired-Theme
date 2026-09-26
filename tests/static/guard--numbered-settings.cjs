#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — no numbered setting families: a list is blocks, not setting_1, _2, _3
 * ============================================================================
 *
 * The image banner offered exactly two buttons (button_label_1 / _2, button_link_1
 * / _2, ...): a third meant a code change. A list is blocks, one per item, filled
 * from a content list ("@list:"), so it grows with the content. And a name that
 * says "part 1" hides what the setting is (the video banner's title parts were
 * an editorial-font part and a sans part: now named so).
 *
 * Fails when a section or block schema (its own settings, or one block type's)
 * has two or more setting ids that differ only by a trailing number.
 *
 *   node tests/static/guard--numbered-settings.cjs [--root=<theme>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');

const problems = [];
const families = (where, settings) => {
  const byBase = {};
  for (const s of settings || []) {
    if (!s || !s.id) continue;
    const m = /^(.*?)_?(\d+)$/.exec(s.id);
    if (m) (byBase[m[1]] = byBase[m[1]] || []).push(s.id);
  }
  for (const [base, ids] of Object.entries(byBase)) if (ids.length > 1) problems.push(`${where}: ${ids.join(', ')} (a list of "${base}": make it blocks)`);
};

for (const dir of ['sections', 'blocks']) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs).filter((f) => f.endsWith('.liquid'))) {
    const m = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/.exec(fs.readFileSync(path.join(abs, f), 'utf8'));
    if (!m) continue;
    let schema;
    try { schema = JSON.parse(m[1]); } catch (e) { continue; } // Theme Check reports broken schemas
    families(`${dir}/${f}`, schema.settings);
    for (const b of schema.blocks || []) families(`${dir}/${f} block "${b.type}"`, b.settings);
  }
}

if (problems.length) {
  console.error(`\n❌ ${problems.length} numbered setting famil${problems.length === 1 ? 'y' : 'ies'}:\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log('  ✅ No numbered setting families: lists are blocks.');

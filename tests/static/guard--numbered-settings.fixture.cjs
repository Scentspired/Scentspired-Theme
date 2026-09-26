#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--numbered-settings catches what it claims
 * ============================================================================
 *
 * Plants the two shapes that were removed (button_label_1 / button_label_2 in a
 * block; main_title_part1 / main_title_part2 in a section) and asserts the guard
 * fails; then asserts a list of blocks, one numbered setting alone, and settings
 * named by their role pass.
 *
 *   node tests/static/guard--numbered-settings.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--numbered-settings.cjs');
const section = (schema) => `<div></div>\n{% schema %}\n${JSON.stringify(schema, null, 2)}\n{% endschema %}\n`;

const MUST_FLAG = [
  { name: 'two numbered buttons in a block', schema: { name: 'x', blocks: [{ type: 'buttons', name: 'b', settings: [{ type: 'text', id: 'button_label_1' }, { type: 'text', id: 'button_label_2' }] }] } },
  { name: 'a title in numbered parts', schema: { name: 'x', settings: [{ type: 'text', id: 'main_title_part1' }, { type: 'text', id: 'main_title_part2' }] } },
];
const MUST_NOT_FLAG = [
  { name: 'a list of button blocks', schema: { name: 'x', blocks: [{ type: 'button', name: 'b', settings: [{ type: 'text', id: 'label' }, { type: 'url', id: 'link' }] }] } },
  { name: 'one numbered setting alone', schema: { name: 'x', settings: [{ type: 'range', id: 'columns_2', min: 1, max: 4, step: 1, default: 2 }] } },
  { name: 'settings named by their role', schema: { name: 'x', settings: [{ type: 'text', id: 'main_title_editorial' }, { type: 'text', id: 'main_title_sans' }] } },
];

function run(schema) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'numbered-fixture-'));
  try {
    fs.mkdirSync(path.join(root, 'sections'));
    fs.writeFileSync(path.join(root, 'sections', 'probe.liquid'), section(schema));
    return spawnSync('node', [GUARD, `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) { const r = run(c.schema); const ok = r.status === 1; console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`); if (!ok) { failures++; console.log(r.stdout, r.stderr); } }
for (const c of MUST_NOT_FLAG) { const r = run(c.schema); const ok = r.status === 0; console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`); if (!ok) { failures++; console.log(r.stdout, r.stderr); } }
process.exit(failures ? 1 : 0);

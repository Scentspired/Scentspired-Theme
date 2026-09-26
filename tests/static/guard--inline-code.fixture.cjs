#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--inline-code catches what it claims
 * ============================================================================
 *
 * Plants each kind of Liquid-free inline block phase 6 moved out (a <script>, a
 * <style>, a {% stylesheet %}, a {% javascript %}) and asserts the guard fails;
 * then asserts that blocks needing Liquid, JSON data blocks and external
 * scripts pass.
 *
 *   node tests/static/guard--inline-code.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--inline-code.cjs');

const MUST_FLAG = [
  { name: 'a script with no Liquid', body: '<div></div>\n<script>\n  document.body.classList.add("x");\n</script>\n' },
  { name: 'a style block with no Liquid', body: '<style>\n  .a { color: red; }\n</style>\n' },
  { name: 'a {% stylesheet %} tag', body: '{% stylesheet %}\n  .a { color: red; }\n{% endstylesheet %}\n' },
  { name: 'a {% javascript %} tag', body: '{% javascript %}\n  console.log(1);\n{% endjavascript %}\n' },
];
const MUST_NOT_FLAG = [
  { name: 'a style block that needs a setting', body: '<style>\n  #shopify-section-{{ section.id }} { padding-top: {{ section.settings.padding_top }}px; }\n</style>\n' },
  { name: 'a script that needs a translation', body: "<script>\n  window.x = {{ 'a.b' | t | json }};\n</script>\n" },
  { name: 'a JSON data block', body: '<script type="application/json" id="d">{"a": 1}</script>\n' },
  { name: 'an external script', body: "<script src=\"{{ 'x.js' | asset_url }}\" defer></script>\n" },
];

function run(body) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-fixture-'));
  try {
    fs.mkdirSync(path.join(root, 'sections'));
    fs.writeFileSync(path.join(root, 'sections', 'probe.liquid'), body);
    return spawnSync('node', [GUARD, `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) { const r = run(c.body); const ok = r.status === 1; console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`); if (!ok) { failures++; console.log(r.stdout, r.stderr); } }
for (const c of MUST_NOT_FLAG) { const r = run(c.body); const ok = r.status === 0; console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`); if (!ok) { failures++; console.log(r.stdout, r.stderr); } }
process.exit(failures ? 1 : 0);

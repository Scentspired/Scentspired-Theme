#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves the dead-file check (scripts/find-dead-files.cjs --check)
 * catches what it claims
 * ============================================================================
 *
 * A throwaway theme whose home template uses one section, which links one
 * stylesheet. An unused section, an unused snippet and an unlinked asset must
 * each fail the check; the theme without them must pass.
 *
 *   node tests/static/guard--dead-files.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CHECK = path.join(__dirname, '..', '..', 'scripts', 'find-dead-files.cjs');

const BASE = {
  'layout/theme.liquid': '<!doctype html><html><head>{{ content_for_header }}</head><body>{{ content_for_layout }}</body></html>\n',
  'templates/index.json': JSON.stringify({ sections: { main: { type: 'hero' } }, order: ['main'] }),
  'sections/hero.liquid': "{{ 'hero.css' | asset_url | stylesheet_tag }}\n<div class=\"hero\"></div>\n{% schema %}{\"name\": \"Hero\"}{% endschema %}\n",
  'assets/hero.css': '.hero { color: red; }\n',
  'config/settings_data.json': '{"current": {}}\n',
};

const MUST_FLAG = [
  { name: 'a section no template uses', extra: { 'sections/unused.liquid': '<div></div>\n{% schema %}{"name": "Unused"}{% endschema %}\n' } },
  { name: 'a snippet nothing renders', extra: { 'snippets/orphan.liquid': '<p>orphan</p>\n' } },
  { name: 'an asset nothing links', extra: { 'assets/orphan.js': 'console.log(1);\n' } },
];

function run(extra) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dead-files-fixture-'));
  try {
    for (const [rel, body] of Object.entries({ ...BASE, ...extra })) {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      fs.writeFileSync(path.join(root, rel), body);
    }
    return spawnSync('node', [CHECK, '--check', `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) {
  const r = run(c.extra);
  const ok = r.status === 1;
  console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
{
  const r = run({});
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} passes: a theme where everything is used`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

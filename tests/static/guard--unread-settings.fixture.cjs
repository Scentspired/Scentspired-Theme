#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--unread-settings catches what it claims
 * ============================================================================
 *
 * Plants a section setting nothing reads, a block setting nothing reads and a
 * theme setting nothing reads, and asserts the guard fails; then asserts that a
 * setting read in the section, one read only in a snippet it renders (from a
 * {% liquid %} tag), and a theme setting read in the layout all pass.
 *
 *   node tests/static/guard--unread-settings.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--unread-settings.cjs');
const section = (body, schema) => `${body}\n{% schema %}\n${JSON.stringify(schema)}\n{% endschema %}\n`;
const themeSchema = (ids) => JSON.stringify([{ name: 'theme_info', settings: [] }, { name: 'x', settings: ids.map((id) => ({ type: 'text', id })) }]);

const MUST_FLAG = [
  { name: 'a section setting nothing reads', files: { 'sections/s.liquid': section('<h2>{{ section.settings.heading }}</h2>', { name: 's', settings: [{ type: 'text', id: 'heading' }, { type: 'text', id: 'unused' }] }) } },
  { name: 'a block setting nothing reads', files: { 'sections/s.liquid': section('{% for block in section.blocks %}{{ block.settings.label }}{% endfor %}', { name: 's', blocks: [{ type: 'b', name: 'b', settings: [{ type: 'text', id: 'label' }, { type: 'url', id: 'link' }] }] }) } },
  { name: 'a theme setting nothing reads', files: { 'config/settings_schema.json': themeSchema(['logo_width', 'brand_description']), 'layout/theme.liquid': '{{ settings.logo_width }}' } },
];
const MUST_NOT_FLAG = [
  { name: 'a setting read in the section', files: { 'sections/s.liquid': section('{{ section.settings.heading }}', { name: 's', settings: [{ type: 'text', id: 'heading' }] }) } },
  {
    name: 'a setting read only in a snippet the section renders from {% liquid %}',
    files: {
      'sections/s.liquid': section("{%- liquid\n  render 'drawer'\n-%}", { name: 's', settings: [{ type: 'color_scheme', id: 'menu_color_scheme' }] }),
      'snippets/drawer.liquid': '<div class="color-{{ section.settings.menu_color_scheme }}"></div>',
    },
  },
  { name: 'a theme setting read in the layout', files: { 'config/settings_schema.json': themeSchema(['logo_width']), 'layout/theme.liquid': "{{ settings['logo_width'] }}" } },
];

function run(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unread-fixture-'));
  try {
    for (const [rel, body] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      fs.writeFileSync(path.join(root, rel), body);
    }
    return spawnSync('node', [GUARD, `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) { const r = run(c.files); const ok = r.status === 1; console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`); if (!ok) { failures++; console.log(r.stdout, r.stderr); } }
for (const c of MUST_NOT_FLAG) { const r = run(c.files); const ok = r.status === 0; console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`); if (!ok) { failures++; console.log(r.stdout, r.stderr); } }
process.exit(failures ? 1 : 0);

#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves the Shopify Theme Check gate (Layer 12) catches what it claims
 * ============================================================================
 *
 * Theme Check sat in the gate for months without being installed: its runner
 * reported "skipping" and the gate was green. When it finally ran it found 33
 * errors per theme. So this plants each defect it found (a parser-blocking
 * script, markup closed in the wrong order, an <div> opened in each branch of an
 * if), plus a missing asset and an unknown filter, in a throwaway theme, and
 * asserts the runner fails on each; then asserts that correct code, and the
 * documented exception form, pass.
 *
 *   node tests/static/tooling--theme-check.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RUNNER = path.join(__dirname, 'theme-check-runner.cjs');
const CONFIG = path.join(__dirname, '..', '..', '.theme-check.yml');

const LAYOUT =
  '<!doctype html>\n<html><head>{{ content_for_header }}</head>\n<body>{{ content_for_layout }}</body></html>\n';

const MUST_FLAG = [
  { name: 'parser-blocking script', body: "<script src=\"{{ 'present.js' | asset_url }}\"></script>\n" },
  { name: 'a link closed inside a div it opened', body: '<a href="/x"><div class="d">text</a></div>\n' },
  {
    name: 'a different <div> opened in each branch, one shared close',
    body: '{% if cart.item_count == 0 %}<div id="a">{% else %}<div id="b">{% endif %}\n  <p>x</p>\n</div>\n',
  },
  { name: 'missing asset', body: "{{ 'not-there.css' | asset_url | stylesheet_tag }}\n" },
  { name: 'unknown filter', body: '{{ product.title | no_such_filter }}\n' },
  // TranslationKeyExists: the locale below holds customer.addresses.title only
  { name: 'a translation key the default locale does not have', body: "{{ 'customer.addresses.no_such_key' | t }}\n" },
];

const MUST_NOT_FLAG = [
  { name: 'deferred script', body: "<script src=\"{{ 'present.js' | asset_url }}\" defer></script>\n" },
  {
    name: 'documented exception: a synchronous script between disable/enable',
    body:
      '{% # theme-check-disable ParserBlockingScript %}\n' +
      "<script src=\"{{ 'present.js' | asset_url }}\"></script>\n" +
      '{% # theme-check-enable ParserBlockingScript %}\n',
  },
  {
    name: 'one <div>, its attribute conditional',
    body: '<div id="a"{% if cart.item_count == 0 %} style="display: none;"{% endif %}>\n  <p>x</p>\n</div>\n',
  },
  // the default locale starts with the comment header Shopify writes; it must still be read
  { name: 'a translation key the default locale has', body: "{{ 'customer.addresses.title' | t }}\n" },
];

function run(body) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-fixture-'));
  try {
    for (const d of ['layout', 'sections', 'snippets', 'templates', 'assets', 'config', 'locales']) fs.mkdirSync(path.join(root, d));
    fs.writeFileSync(path.join(root, 'layout', 'theme.liquid'), LAYOUT);
    fs.writeFileSync(path.join(root, 'assets', 'present.js'), '// present\n');
    fs.writeFileSync(
      path.join(root, 'locales', 'en.default.json'),
      '/*\n * IMPORTANT: The contents of this file are auto-generated.\n */\n{ "customer": { "addresses": { "title": "Addresses" } } }\n'
    );
    fs.writeFileSync(path.join(root, 'config', 'settings_schema.json'), '[]\n');
    fs.writeFileSync(path.join(root, 'snippets', 'probe.liquid'), body);
    fs.writeFileSync(path.join(root, 'templates', 'index.liquid'), "{% render 'probe' %}\n");
    return spawnSync('node', [RUNNER, `--path=${root}`, `--config=${CONFIG}`, '--fail-level=error'], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) {
  const r = run(c.body);
  const ok = r.status === 1 && /errors?, /.test(r.stdout);
  console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
for (const c of MUST_NOT_FLAG) {
  const r = run(c.body);
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

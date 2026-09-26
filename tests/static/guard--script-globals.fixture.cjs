#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURES — prove guard--script-globals catches what it claims
 * ============================================================================
 *
 * Two files whose inline scripts both declare a top-level const (or let) of the
 * same name fail: on a page rendering both, the second throws "Identifier has
 * already been declared". The legitimate forms pass: var (redeclaring it is
 * legal), a const inside a function, a name declared in one file only, and a
 * script loaded by src (an asset, not inline).
 *
 *   node tests/static/guard--script-globals.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--script-globals.cjs');
// A name the recorded baseline does not accept, so the fixture sees the guard's own verdict.
const NAME = 'fixtureSharedTotal';
const inline = (body) => `<div></div>\n<script>\n${body}\n</script>\n`;

const CASES = [
  { flag: true, name: 'a top-level const in two sections', files: { 'sections/a.liquid': inline(`const ${NAME} = 1;`), 'sections/b.liquid': inline(`const ${NAME} = 2;`) } },
  { flag: true, name: 'a top-level let in a section and a snippet', files: { 'sections/a.liquid': inline(`let ${NAME} = 1;`), 'snippets/b.liquid': inline(`let ${NAME} = 2;`) } },
  { flag: false, name: 'var in both (redeclaring is legal)', files: { 'sections/a.liquid': inline(`var ${NAME} = 1;`), 'sections/b.liquid': inline(`var ${NAME} = 2;`) } },
  { flag: false, name: 'a const inside a function in both', files: { 'sections/a.liquid': inline(`(function () {\n  const ${NAME} = 1;\n})();`), 'sections/b.liquid': inline(`function f() {\n  const ${NAME} = 2;\n}`) } },
  { flag: false, name: 'a name declared in one file only', files: { 'sections/a.liquid': inline(`const ${NAME} = 1;`), 'sections/b.liquid': inline('const somethingElse = 2;') } },
  { flag: false, name: 'a script loaded by src', files: { 'sections/a.liquid': inline(`const ${NAME} = 1;`), 'sections/b.liquid': `<script src="{{ 'b.js' | asset_url }}">const ${NAME} = 2;</script>\n` } },
];

function run(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'script-globals-fixture-'));
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
for (const c of CASES) {
  const r = run(c.files);
  const ok = r.status === (c.flag ? 1 : 0);
  console.log(`  ${ok ? '✅' : '❌'} ${c.flag ? 'flags' : 'passes'}: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

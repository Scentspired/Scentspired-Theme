#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--section-refs catches a broken rename
 * ============================================================================
 *
 * This guard exists to make renaming safe, so it has to be seen failing on
 * exactly the shape a bad rename produces: a template still naming the old
 * section, with only the new file on disk.
 *
 * It also has to stay quiet on the two things that previously made it cry
 * wolf — a block type nested inside a section, and a render inside a comment.
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--section-refs.cjs');

function theme(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'secrefs-fixture-'));
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return dir;
}

function run(dir) {
  const r = spawnSync('node', [GUARD, '--root=' + dir], { encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

const CASES = [
  {
    name: 'template names a section that was renamed away',
    shouldFail: true,
    files: {
      'sections/catalog--grid.liquid': '<div>grid</div>',
      'templates/index.json': JSON.stringify({
        sections: { main: { type: 'product-grid' } },
        order: ['main'],
      }),
    },
  },
  {
    name: "{% section 'x' %} with no such file",
    shouldFail: true,
    files: {
      'sections/footer.liquid': '<footer></footer>',
      'layout/theme.liquid': "{% section 'header' %}",
    },
  },
  {
    name: "{% render 'x' %} with no such snippet",
    shouldFail: true,
    files: {
      'sections/a.liquid': "{% render 'missing-thing' %}",
      'snippets/present.liquid': 'ok',
    },
  },
  {
    // Liquid takes either quote style and this theme uses both. A version
    // that only matched single quotes saw 37 renders where there are 158.
    name: 'a double-quoted render is still a reference',
    shouldFail: true,
    files: {
      'sections/a.liquid': '{% render "missing-thing" %}',
      'snippets/present.liquid': 'ok',
    },
  },
  {
    /*
     * The shape that actually bit. Inside {% liquid %} there are no tag
     * braces, so a render is a bare word on its own line. A guard blind to
     * this reported zero unresolved references while the mobile menu drawer
     * was missing from every page.
     */
    name: 'a braceless render inside {% liquid %} is still a reference',
    shouldFail: true,
    files: {
      'sections/header.liquid':
        '{%- liquid\n  if section.settings.menu != blank\n    render "header--drawer"\n  endif\n-%}',
      'snippets/other.liquid': 'ok',
    },
  },
  {
    name: 'block type nested in a section is not a section',
    shouldFail: false,
    files: {
      'sections/catalog--grid.liquid': '<div>grid</div>',
      'blocks/heading.liquid': '<h2></h2>',
      'templates/index.json': JSON.stringify({
        sections: {
          main: { type: 'catalog--grid', blocks: { b1: { type: 'heading' } }, block_order: ['b1'] },
        },
        order: ['main'],
      }),
    },
  },
  {
    name: 'a render inside a comment is documentation, not a reference',
    shouldFail: false,
    files: {
      'sections/a.liquid': "{% comment %}Usage: {% render 'not-real' %}{% endcomment %}<div></div>",
    },
  },
  {
    name: 'everything resolves',
    shouldFail: false,
    files: {
      'sections/catalog--grid.liquid': "{% render 'card--product' %}",
      'snippets/card--product.liquid': '<div></div>',
      'templates/index.json': JSON.stringify({
        sections: { main: { type: 'catalog--grid' } },
        order: ['main'],
      }),
    },
  },
];

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   FIXTURE — guard--section-refs red/green verification       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let failures = 0;
const dirs = [];

for (const c of CASES) {
  const dir = theme(c.files);
  dirs.push(dir);
  const { status, out } = run(dir);
  const failed = status === 1;
  const ok = failed === c.shouldFail;
  console.log(`  ${ok ? '✓' : '✗'} ${c.shouldFail ? 'flags  ' : 'allows '} ${c.name}`);
  if (!ok) {
    failures++;
    console.log(`      expected exit ${c.shouldFail ? 1 : 0}, got ${status}`);
    console.log(out.split('\n').map((l) => '      ' + l).join('\n'));
  }
}

for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });

console.log('');
if (failures > 0) {
  console.log(`  ❌ ${failures} fixture assertion(s) failed.\n`);
  process.exit(1);
}
console.log('  ✅ Guard verified: catches a broken rename, ignores blocks and comments.\n');
process.exit(0);

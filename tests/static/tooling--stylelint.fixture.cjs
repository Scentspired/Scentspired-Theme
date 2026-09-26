#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves the Stylelint gate (Layer 13) catches what it claims
 * ============================================================================
 *
 * Stylelint, like Theme Check, sat in the gate uninstalled and "skipping". When
 * it ran it found CSS that browsers silently drop: a stray } that swallowed the
 * next @media block, a stray word, a // comment that killed the rule after it, a
 * media query with a unitless width, and Tailwind source (@apply) pasted into a
 * browser stylesheet. This plants each in a throwaway theme's assets and asserts
 * the runner fails; then asserts that correct CSS passes.
 *
 *   node tests/static/tooling--stylelint.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RUNNER = path.join(__dirname, 'stylelint-runner.cjs');

const MUST_FLAG = [
  { name: 'a stray } at the top level', css: '.a { color: red; }\n}\n@media (max-width: 800px) { .b { color: blue; } }\n' },
  { name: 'a stray word in a block', css: '.a {\n  color: red;\n  c\n}\n' },
  { name: 'a // comment', css: '@media (min-width: 900px) {\n  // note\n  .a { color: red; }\n}\n' },
  { name: 'a unitless media width', css: '@media screen and (min-width: 1024) { .a { color: red; } }\n' },
  { name: 'Tailwind @apply', css: '.a { @apply bg-background; }\n' },
];

const MUST_NOT_FLAG = [
  { name: 'plain rules and a media query', css: '.a { color: red; }\n@media screen and (min-width: 1024px) { .a { color: blue; } }\n' },
  { name: 'custom properties and var()', css: '.a { --gap: 8px; gap: var(--gap); }\n' },
];

function run(css) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stylelint-fixture-'));
  try {
    fs.mkdirSync(path.join(root, 'assets'));
    fs.writeFileSync(path.join(root, 'assets', 'probe.css'), css);
    return spawnSync('node', [RUNNER, `--target=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) {
  const r = run(c.css);
  const ok = r.status === 1 && /\[ERROR\]/.test(r.stderr + r.stdout);
  console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
for (const c of MUST_NOT_FLAG) {
  const r = run(c.css);
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--workflows catches what it claims
 * ============================================================================
 *
 * Plants the workflow line that took CI down (": " inside an unquoted run:),
 * and each missing piece Actions needs, in a throwaway workflows folder, and
 * asserts the guard fails; then asserts the fixed forms pass.
 *
 *   node tests/static/guard--workflows.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--workflows.cjs');
const job = (steps) => `on:\n  push:\n    branches: [main]\njobs:\n  gate:\n    runs-on: ubuntu-latest\n    steps:\n${steps}`;

const MUST_FLAG = [
  {
    name: 'a colon and space inside an unquoted run: (the line that broke CI)',
    yml: job(`      - name: Assert\n        run: node -e "if (x) { console.error('testing_enabled false: the gate would bypass itself'); }"\n`),
  },
  { name: 'a duplicate key', yml: job(`      - name: A\n        run: echo a\n        run: echo b\n`) },
  { name: 'no jobs', yml: 'on:\n  push:\n' },
  { name: 'a job with no runs-on', yml: 'on: push\njobs:\n  gate:\n    steps:\n      - run: echo hi\n' },
  { name: 'a step with neither run nor uses', yml: job(`      - name: nothing\n`) },
];

const MUST_NOT_FLAG = [
  {
    name: 'the same command as a block scalar',
    yml: job(`      - name: Assert\n        run: |\n          node -e "if (x) { console.error('testing_enabled false: the gate would bypass itself'); }"\n`),
  },
  { name: 'uses and run steps', yml: job(`      - uses: actions/checkout@v4\n      - run: npm ci\n`) },
];

function run(yml) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflows-fixture-'));
  try {
    fs.writeFileSync(path.join(dir, 'probe.yml'), yml);
    return spawnSync('node', [GUARD, `--dir=${dir}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) {
  const r = run(c.yml);
  const ok = r.status === 1;
  console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
for (const c of MUST_NOT_FLAG) {
  const r = run(c.yml);
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

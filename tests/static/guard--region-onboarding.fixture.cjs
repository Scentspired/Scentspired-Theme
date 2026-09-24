#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--region-onboarding catches region branching
 * ============================================================================
 *
 * Builds a throwaway theme with two regions and plants the branches that would
 * make region #3 an edit across many files: a JS comparison on a region id, a
 * Liquid `when` on a region code, an `.includes()` on a store domain. The
 * guard must fail and name each. The same theme without them must pass.
 *
 * Only the static half is exercised here; the onboarding probe builds the real
 * theme and was seen red during development (7 genuine leaks it then led to
 * fixing). Everything is written under the OS temp directory.
 *
 *   node tests/static/guard--region-onboarding.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--region-onboarding.cjs');

const REGIONS = {
  aa: { id: 'aa', code: 'AA', currency_code: 'AAD', domain: 'shop-aa.invalid', myshopify_domain: 'aa.myshopify.com', hreflang: 'en-aa' },
  bb: { id: 'bb', code: 'BB', currency_code: 'BBD', domain: 'shop-bb.invalid', myshopify_domain: 'bb.myshopify.com', hreflang: 'en-bb' },
};

const PLANTED = [
  { file: 'scripts/runner.cjs', body: "if (scope === 'aa') { runAaSuite(); }\n", lit: 'aa' },
  { file: 'sections/footer.liquid', body: "{% case region %}{% when 'BB' %}bb only{% endcase %}\n", lit: 'BB' },
  { file: 'assets/app.js', body: "if (location.hostname.includes('shop-aa.invalid')) { go(); }\n", lit: 'shop-aa.invalid' },
];

function theme(withViolations) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'onboarding-fixture-'));
  for (const [id, r] of Object.entries(REGIONS)) {
    fs.mkdirSync(path.join(root, 'regions', id), { recursive: true });
    fs.writeFileSync(path.join(root, 'regions', id, 'region.json'), JSON.stringify(r));
  }
  // Clean code that READS region data rather than branching on it.
  const clean = {
    'sections/header.liquid': "{% render 'region--active', key: 'currency_symbol' %}\n",
    'assets/theme.js': 'const store = window.__STORE_CONFIG || {};\n',
  };
  for (const [f, body] of Object.entries(clean)) {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), body);
  }
  if (withViolations) {
    for (const p of PLANTED) {
      fs.mkdirSync(path.dirname(path.join(root, p.file)), { recursive: true });
      fs.writeFileSync(path.join(root, p.file), p.body);
    }
  }
  return root;
}

const run = (root) =>
  spawnSync('node', [GUARD, '--static-only', `--root=${root}`], { encoding: 'utf8' });

let ok = true;
const dirty = theme(true);
const clean = theme(false);
try {
  const bad = run(dirty);
  if (bad.status === 0) {
    console.log('  ❌ guard passed a theme that branches on regions');
    ok = false;
  }
  for (const p of PLANTED) {
    if (!bad.stdout.includes(`${p.file}:1 branches on region "${p.lit}"`)) {
      console.log(`  ❌ guard did not name the branch in ${p.file}`);
      ok = false;
    }
  }
  const good = run(clean);
  if (good.status !== 0) {
    console.log('  ❌ guard failed a theme that only reads region data');
    console.log(good.stdout);
    ok = false;
  }
} finally {
  fs.rmSync(dirty, { recursive: true, force: true });
  fs.rmSync(clean, { recursive: true, force: true });
}

console.log(ok ? '  ✅ guard--region-onboarding: red on 3 planted branches, green on clean code' : '');
process.exit(ok ? 0 : 1);

#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Region Onboarding Guard
 * ============================================================================
 *
 * The architecture's promise: adding a storefront is one folder,
 * regions/<id>/, and nothing else. No Liquid, JS, script, test or npm alias is
 * edited, and no if/case/switch grows a branch. This guard keeps the promise
 * true rather than documented.
 *
 *   1. NO REGION BRANCHING. Theme code and tooling may not compare anything
 *      against a region's id, code, currency, domain or store. Every such
 *      literal is read from regions/*, so region #101 is covered the moment
 *      its folder exists. Finding one means some file would need editing for
 *      the next region: shotgun surgery.
 *
 *   2. ONBOARDING PROBE. In a temp directory — the repository is never
 *      written — it does what a person would:
 *        npm run region:new      scaffold a region
 *        compile                 must REFUSE while TODOs remain, and other
 *                                regions must still build meanwhile
 *        fill in the values      synthetic ones
 *        compile                 must pass
 *      then checks the build carries the new region's identity and none of
 *      another region's in its code, and that publishing it locks its store.
 *
 *   3. NO FROZEN COPIES. A region file identical to core is a fork that stops
 *      tracking core (scripts/prune-region-overlays.cjs --check).
 *
 *   node tests/static/guard--region-onboarding.cjs
 *   node tests/static/guard--region-onboarding.cjs --static-only --root=<dir>
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const THEME_ROOT = path.resolve(__dirname, '../..');
const rootArg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = rootArg ? path.resolve(rootArg.slice('--root='.length)) : THEME_ROOT;
const STATIC_ONLY = process.argv.includes('--static-only');

const failures = [];
const fail = (msg) => failures.push(msg);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Region Onboarding             ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ─── 1. No branching on region identity ─────────────────────────────────────

const regionsDir = path.join(ROOT, 'regions');
const regionIds = fs.existsSync(regionsDir)
  ? fs.readdirSync(regionsDir).filter((d) => fs.existsSync(path.join(regionsDir, d, 'region.json')))
  : [];
const identity = new Set();
for (const id of regionIds) {
  const r = JSON.parse(fs.readFileSync(path.join(regionsDir, id, 'region.json'), 'utf8'));
  for (const v of [id, r.code, r.currency_code, r.domain, r.myshopify_domain, r.hreflang]) {
    if (typeof v === 'string' && v) identity.add(v);
  }
}

/**
 * Deliberate exceptions, each with its reason. Kept to safety floors: code
 * whose job is to refuse writes to the live stores names them on purpose, so
 * that no edit to region data can ever lift the lock.
 */
const ALLOWED = [
  { file: 'engine/sync-regions.cjs', literals: ['uk', 'usa'], why: 'push-lockdown floor for the live repos' },
  {
    file: 'tests/dynamic/rigorous-integration-tests.cjs',
    literals: ['GBP', 'USD'],
    why: 'exercises a currency formatter defined inside the test itself, not theme code',
  },
];

const SCAN_DIRS = ['sections', 'snippets', 'blocks', 'layout', 'assets', 'scripts', 'engine', 'tests'];
const SKIP = [
  /^snippets\/region--(active|registry)\.liquid$/, // generated from region data
  /^tests\/parity\//, // captured storefront HTML
  /^tests\/reporting\/reports\//,
  /\.fixture\.cjs$/, // fixtures plant violations on purpose
  /\/fixtures\//,
  /^tests\/dynamic\/verify-live-output-parity\.cjs$/, // independent oracle of live values
  /\.min\.(js|css)$/,
];
const EXT = /\.(liquid|js|cjs|mjs|css)$/;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const branchPatterns = (lit) => {
  const q = `['"\`]${esc(lit)}['"\`]`;
  return [
    new RegExp(`(===|!==|==|!=)\\s*${q}`, 'i'),
    new RegExp(`${q}\\s*(===|!==|==|!=)`, 'i'),
    new RegExp(`\\bcase\\s+${q}`, 'i'),
    new RegExp(`\\bwhen\\s+${q}`, 'i'),
    new RegExp(`\\.(includes|startsWith|endsWith)\\(\\s*${q}\\s*\\)`, 'i'),
    new RegExp(`\\bcontains\\s+${q}`, 'i'),
  ];
};
const patterns = [...identity].map((lit) => [lit, branchPatterns(lit)]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const files = [
  ...SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d))),
  ...fs.readdirSync(ROOT).filter((f) => /\.(cjs|js)$/.test(f)).map((f) => path.join(ROOT, f)),
]
  .map((f) => path.relative(ROOT, f).split(path.sep).join('/'))
  .filter((rel) => EXT.test(rel) && !SKIP.some((re) => re.test(rel)));

let branches = 0;
for (const rel of files) {
  const lines = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [lit, res] of patterns) {
      if (!res.some((re) => re.test(line))) continue;
      const allow = ALLOWED.find((a) => a.file === rel && a.literals.some((l) => l.toLowerCase() === lit.toLowerCase()));
      if (allow) continue;
      branches++;
      fail(`${rel}:${i + 1} branches on region "${lit}": ${line.trim().slice(0, 110)}`);
    }
  });
}
console.log(
  branches
    ? `  ❌ ${branches} branch(es) on a region's identity in ${files.length} file(s)`
    : `  ✅ No code or tooling branches on a region — ${identity.size} identity literal(s) from ${regionIds.length} region(s), ${files.length} file(s) scanned`
);

if (STATIC_ONLY) finish();

// ─── 2. Onboarding probe ────────────────────────────────────────────────────

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scentspired-onboard-'));
const T_REGIONS = path.join(tmp, 'regions');
const T_DIST = path.join(tmp, 'dist');
const PROBE = 'zz';
const env = { ...process.env, SCENTSPIRED_REGIONS_DIR: T_REGIONS, SCENTSPIRED_DIST_ROOT: T_DIST };
const node = (args, extraEnv = {}) =>
  spawnSync('node', args, { cwd: THEME_ROOT, env: { ...env, ...extraEnv }, encoding: 'utf8' });

const gitState = () => {
  try {
    return execSync('git status --porcelain', { cwd: THEME_ROOT, encoding: 'utf8' });
  } catch {
    return '';
  }
};
const before = gitState();

try {
  // A copy of every region's data, so the registry and lock see real regions.
  fs.mkdirSync(T_REGIONS, { recursive: true });
  for (const f of ['_defaults.json', '_schema.json']) {
    fs.copyFileSync(path.join(THEME_ROOT, 'regions', f), path.join(T_REGIONS, f));
  }
  for (const id of regionIds) {
    fs.mkdirSync(path.join(T_REGIONS, id));
    fs.copyFileSync(path.join(regionsDir, id, 'region.json'), path.join(T_REGIONS, id, 'region.json'));
  }
  const other = regionIds.map((id) => JSON.parse(fs.readFileSync(path.join(regionsDir, id, 'region.json'), 'utf8')));

  // Scaffold.
  const scaffold = node([path.join(THEME_ROOT, 'scripts/new-region.cjs'), PROBE]);
  const probeFile = path.join(T_REGIONS, PROBE, 'region.json');
  if (scaffold.status !== 0 || !fs.existsSync(probeFile)) {
    fail(`region:new could not scaffold a region: ${(scaffold.stderr || scaffold.stdout).trim().slice(0, 200)}`);
    throw new Error('stop');
  }

  // A half-filled region must be refused, by name…
  const early = node([path.join(THEME_ROOT, 'scripts/compile-region.cjs'), PROBE]);
  if (early.status === 0) fail('compile accepted a region still full of TODO placeholders');
  else if (!/TODO placeholder/.test(early.stderr + early.stdout)) fail('compile refused the scaffold but did not name its TODOs');

  // …without blocking any other region's build.
  const bystander = regionIds[0];
  if (bystander) {
    const b = node([path.join(THEME_ROOT, 'scripts/compile-region.cjs'), bystander]);
    if (b.status !== 0) fail(`a half-onboarded region broke the build of "${bystander}"`);
  }

  // Fill every TODO with synthetic values shaped like the placeholder.
  const P = {
    code: 'ZZ',
    name: 'Probeland',
    domain: 'probe.invalid',
    home_url: 'https://probe.invalid',
    hreflang: 'en-zz',
    currency_code: 'XTS',
    currency_symbol: '¤',
    support_email: 'support@probe.invalid',
    returns_email: 'returns@probe.invalid',
    myshopify_domain: 'probe-zz.myshopify.com',
  };
  const region = JSON.parse(fs.readFileSync(probeFile, 'utf8'));
  const fill = (o, prefix) => {
    for (const [k, v] of Object.entries(o)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (Array.isArray(v) && v[0] === 'TODO') o[k] = ['ZZ'];
      else if (v === 'TODO') o[k] = key in P ? P[key] : /_cents$|variant|price|standard|saving|fee/.test(key) ? 1 : `probe ${key}`;
      else if (v && typeof v === 'object' && !Array.isArray(v)) fill(v, key);
    }
  };
  fill(region, '');
  fs.writeFileSync(probeFile, JSON.stringify(region, null, 2) + '\n');

  const built = node([path.join(THEME_ROOT, 'scripts/compile-region.cjs'), PROBE]);
  if (built.status !== 0) {
    fail(`a region defined only by region.json does not compile:\n      ${(built.stderr || built.stdout).trim().split('\n').slice(-6).join('\n      ')}`);
    throw new Error('stop');
  }
  const dist = path.join(T_DIST, PROBE);
  const active = fs.readFileSync(path.join(dist, 'snippets/region--active.liquid'), 'utf8');
  for (const [k, v] of Object.entries({ domain: P.domain, currency_code: P.currency_code, hreflang: P.hreflang })) {
    if (!active.includes(`when '${k}' -%}${v}`)) fail(`the new region's ${k} did not reach its build`);
  }

  // No other region's identity in the new region's CODE. Templates, locales
  // and config are content inherited from core until the region overrides
  // them; the registry lists every published region by design.
  const CODE = /^(sections|snippets|blocks|layout|assets)\//;
  const leakLiterals = other.flatMap((r) =>
    [r.domain, r.myshopify_domain].filter(Boolean).concat(
      [r.currency_code, r.hreflang].filter(Boolean).flatMap((v) => [`'${v}'`, `"${v}"`])
    )
  );
  let leaks = 0;
  for (const abs of walk(dist)) {
    const rel = path.relative(dist, abs).split(path.sep).join('/');
    if (!CODE.test(rel) || rel === 'snippets/region--registry.liquid' || !EXT.test(rel)) continue;
    // A {% schema %} block is editor metadata: setting defaults and help text.
    // Like templates, it is content a region overrides through its own
    // templates, so it is not code the next region would have to edit.
    const src = fs
      .readFileSync(abs, 'utf8')
      .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, '');
    for (const lit of leakLiterals) {
      if (src.includes(lit)) {
        leaks++;
        fail(`a new region's build carries another region's ${lit} in ${rel}`);
      }
    }
  }
  if (!leaks) console.log('  ✅ A region defined only by region.json compiles, carries its own identity, and no other region\'s');

  // Publishing locks the store. Load the lock with the probe marked live.
  region.published = true;
  fs.writeFileSync(probeFile, JSON.stringify(region, null, 2) + '\n');
  const lock = node([
    '-e',
    `const g=require(${JSON.stringify(path.join(THEME_ROOT, 'scripts/guard-live-repos.cjs'))});` +
      `process.stdout.write(JSON.stringify({locked:g.LOCKED_STORES,floor:g.LOCKED_STORE_FLOOR}))`,
  ]);
  const { locked = [], floor = [] } = JSON.parse(lock.stdout || '{}');
  if (!locked.includes(P.myshopify_domain)) fail('publishing a region did not lock its store against writes');
  else if (!floor.every((s) => locked.includes(s))) fail('the hardcoded live-store floor was lifted');
  else console.log('  ✅ Publishing a region locks its store; the live-store floor stays in place');
} catch (e) {
  if (e.message !== 'stop') fail(`probe crashed: ${e.message}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (gitState() !== before) fail('the onboarding probe changed the repository — it must only write to a temp directory');

// ─── 3. No frozen copies of core ────────────────────────────────────────────

const prune = spawnSync('node', [path.join(THEME_ROOT, 'scripts/prune-region-overlays.cjs'), '--check'], {
  cwd: THEME_ROOT,
  encoding: 'utf8',
});
if (prune.status !== 0) fail(`regional files copy core instead of overriding it — run npm run region:prune\n${prune.stdout}`);
else console.log('  ✅ Every regional file differs from core — no frozen copies');

finish();

function finish() {
  console.log('');
  if (failures.length) {
    for (const f of failures) console.log(`  ❌ ${f}`);
    console.log(`\n  ❌ Adding a region would need edits outside regions/ (${failures.length} finding(s)).\n`);
    process.exit(1);
  }
  console.log('  ✅ Adding a region touches regions/<id>/ only.\n');
  process.exit(0);
}

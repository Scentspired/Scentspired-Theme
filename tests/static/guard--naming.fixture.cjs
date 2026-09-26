#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURES — prove guard--naming and guard--region-shape catch what they claim
 * ============================================================================
 *
 * Naming: a three-level name (blog--article--share), a name with no domain, a
 * camel-case name fail; domain--component names and Shopify's section groups
 * pass. Region shape: a region config/markets.json, a stray region folder and a
 * market override template fail; a region with the six allowed entries passes.
 *
 *   node tests/static/guard--naming.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const NAMING = path.join(__dirname, 'guard--naming.cjs');
const SHAPE = path.join(__dirname, 'guard--region-shape.cjs');

const CASES = [
  { guard: NAMING, flag: true, name: 'a three-level name', files: { 'snippets/blog--article--share.liquid': '' } },
  { guard: NAMING, flag: true, name: 'a name with no domain', files: { 'sections/best-sellers.liquid': '' } },
  { guard: NAMING, flag: true, name: 'a camel-case name', files: { 'assets/card--productCarousel.css': '' } },
  { guard: NAMING, flag: false, name: 'domain--component names and a section group', files: { 'snippets/blog--article-share.liquid': '', 'assets/card--product-carousel.css': '', 'sections/footer-group.json': '{}' } },
  { guard: SHAPE, flag: true, name: 'a region config/markets.json', files: { 'regions/usa/region.json': '{}', 'regions/usa/config/markets.json': '{"markets": {"pk": {"parent": "@default"}}}' } },
  { guard: SHAPE, flag: true, name: 'a stray region folder', files: { 'regions/uk/region.json': '{}', 'regions/uk/sections/footer-group.json': '{}' } },
  { guard: SHAPE, flag: true, name: 'a market override template', files: { 'templates/index.context.pk.json': '{"parent": "index.json", "context": {"market": "pk"}, "sections": {}}' } },
  { guard: SHAPE, flag: false, name: 'a region with the allowed entries', files: { 'regions/uk/region.json': '{}', 'regions/uk/content/home.json': '{}', 'regions/uk/data/x.json': '{}', 'regions/uk/looks/_active.json': '{}', 'regions/uk/translations/en.default.json': '{}', 'regions/uk/templates/page.x.liquid': '', 'templates/index.json': '{"sections": {}, "order": []}' } },
];

function run(guard, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-fixture-'));
  try {
    for (const [rel, body] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      fs.writeFileSync(path.join(root, rel), body);
    }
    return spawnSync('node', [guard, `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of CASES) {
  const r = run(c.guard, c.files);
  const ok = r.status === (c.flag ? 1 : 0);
  console.log(`  ${ok ? '✅' : '❌'} ${c.flag ? 'flags' : 'passes'}: ${path.basename(c.guard, '.cjs').replace('guard--', '')} — ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

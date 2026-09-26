#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--card-look catches what it claims
 * ============================================================================
 *
 * Plants each way the card drifted (a host stylesheet setting the price size,
 * a bare .fragrance-item rule, template custom CSS on the brand line) in a
 * throwaway theme and asserts the guard fails; then asserts that the card's own
 * stylesheet, a host sizing its own cards from its section, and custom CSS on
 * the card root pass.
 *
 *   node tests/static/guard--card-look.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--card-look.cjs');

const MUST_FLAG = [
  { name: 'a host stylesheet sets the price size', css: { 'media--banner.css': '.product-price-display { font-size: 17px; }\n' } },
  { name: 'a bare .fragrance-item rule in a host stylesheet', css: { 'media--banner.css': '@media (max-width: 990px) { .fragrance-item { border-radius: 12px; } }\n' } },
  { name: 'template custom CSS on the brand line', template: { sections: { grid: { type: 'catalog--collection-grid', custom_css: ['@media screen and (max-width: 990px) {.fragrance-brand {font-size: 10px; }}'] } } } },
];

const MUST_NOT_FLAG = [
  { name: "the card's own stylesheet", css: { 'card--product-carousel.css': '.product-price-display { font-size: 18px; }\n.fragrance-item { display: flex; }\n' } },
  { name: 'a host sizing its own cards from its section', css: { 'media--banner.css': '.mvps-section .fragrance-item { flex: 0 0 100%; width: 100%; }\n' } },
  { name: 'template custom CSS on the card root', template: { sections: { bs: { type: 'catalog--best-sellers', custom_css: ['@media only screen and (max-width: 1024px) {.fragrance-item {width: 100% !important; }}'] } } } },
];

function run(c) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'card-look-fixture-'));
  try {
    fs.mkdirSync(path.join(root, 'assets'));
    fs.mkdirSync(path.join(root, 'templates'));
    for (const [f, s] of Object.entries(c.css || {})) fs.writeFileSync(path.join(root, 'assets', f), s);
    if (c.template) fs.writeFileSync(path.join(root, 'templates', 'index.json'), JSON.stringify(c.template));
    return spawnSync('node', [GUARD, `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) {
  const r = run(c);
  const ok = r.status === 1;
  console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
for (const c of MUST_NOT_FLAG) {
  const r = run(c);
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

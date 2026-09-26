#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--wording catches what it claims
 * ============================================================================
 *
 * Plants the inconsistency that was fixed ("Add to Cart" in one key, "ADD TO
 * CART" in another, both read by the theme) and a punctuation variant, and
 * asserts the guard fails; then asserts that one key read everywhere, a variant
 * nothing reads, and two messages that differ by a link, all pass.
 *
 *   node tests/static/guard--wording.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--wording.cjs');

const MUST_FLAG = [
  {
    name: 'one label in two casings, both read',
    locale: { a: { add_to_cart: 'Add to Cart' }, b: { add_to_cart_upper: 'ADD TO CART' } },
    liquid: "{{ 'a.add_to_cart' | t }}\n{{ \"b.add_to_cart_upper\" | t }}\n",
  },
  {
    name: 'one label with and without punctuation',
    locale: { a: { no_products: 'No products found' }, b: { empty: 'No products found.' } },
    liquid: "{{ 'a.no_products' | t }} {{ 'b.empty' | t }}\n",
  },
];

const MUST_NOT_FLAG = [
  { name: 'one key read everywhere', locale: { products: { product: { add_to_cart: 'Add to Cart' } } }, liquid: "{{ 'products.product.add_to_cart' | t }}\n{{ 'products.product.add_to_cart' | t }}\n" },
  { name: 'a variant nothing reads', locale: { a: { x: 'Search' }, b: { y: 'SEARCH' } }, liquid: "{{ 'a.x' | t }}\n" },
  {
    name: 'two messages that differ by a link',
    locale: { c: { with_html: 'Discounts and <a href="{{ link }}">shipping</a> calculated at checkout.', without: 'Discounts and shipping calculated at checkout.' } },
    liquid: "{{ 'c.with_html' | t: link: '/x' }} {{ 'c.without' | t }}\n",
  },
];

function run(locale, liquid) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wording-fixture-'));
  try {
    fs.mkdirSync(path.join(root, 'locales'));
    fs.mkdirSync(path.join(root, 'snippets'));
    fs.writeFileSync(path.join(root, 'locales', 'en.default.json'), '/*\n * auto-generated\n */\n' + JSON.stringify(locale));
    fs.writeFileSync(path.join(root, 'snippets', 'probe.liquid'), liquid);
    return spawnSync('node', [GUARD, `--root=${root}`], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

let failures = 0;
for (const c of MUST_FLAG) {
  const r = run(c.locale, c.liquid);
  const ok = r.status === 1;
  console.log(`  ${ok ? '✅' : '❌'} flags: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
for (const c of MUST_NOT_FLAG) {
  const r = run(c.locale, c.liquid);
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} passes: ${c.name}`);
  if (!ok) { failures++; console.log(r.stdout, r.stderr); }
}
process.exit(failures ? 1 : 0);

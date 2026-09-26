#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — every file we name is named <domain>--<component>
 * ============================================================================
 *
 * The architecture is read from the file names: catalog--best-sellers.liquid,
 * card--product-carousel.css, core--region-redirect.js. Sections, snippets,
 * blocks and assets follow it (0 exceptions today); layouts, templates and
 * section groups keep the names Shopify gives them.
 *
 *   node tests/static/guard--naming.cjs [--root=<theme>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');
const NAME = /^[a-z0-9]+--[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+(\.[a-z0-9]+)*$/;

const problems = [];
for (const dir of ['sections', 'snippets', 'blocks', 'assets']) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs)) {
    if (dir === 'sections' && f.endsWith('.json')) continue; // section groups: Shopify's names
    if (!NAME.test(f)) problems.push(`${dir}/${f}`);
  }
}

if (problems.length) {
  console.error(`\n❌ ${problems.length} file(s) not named <domain>--<component> (lowercase, hyphens):\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log('  ✅ Every section, snippet, block and asset is named <domain>--<component>.');

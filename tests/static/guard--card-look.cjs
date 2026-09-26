#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — the product card looks the same on every page
 * ============================================================================
 *
 * The card (snippets/card--product-carousel.liquid) is one component, but its
 * price was 17px on the home page and 18px elsewhere, its brand line 10px in
 * the collection grid, its corners 12px wherever the mobile video banner's CSS
 * loaded: host stylesheets and the templates' per-section custom CSS restyled
 * its insides, and unscoped host rules resized every host's cards.
 *
 * The rule, checked here:
 *   - only assets/card--product-carousel.css styles the card's insides
 *     (badges, name, brand, price, sizes, button, image, info, rating);
 *   - a host may size and place its own cards, with a selector that starts at
 *     its own section (".mvps-section .fragrance-item"), never a bare
 *     ".fragrance-item" / ".fragrance-layout" that reaches other hosts' cards.
 *
 *   node tests/static/guard--card-look.cjs [--root=<theme>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');
const CARD_CSS = 'card--product-carousel.css';

const INSIDE = /\.(fragrance-info|fragrance-name|fragrance-brand|fragrance-rating|product-price-display|original-price|price-badge|product-badges?|badge-(men|women|unisex|coming-soon)|variant-options|variant-option-btn|cart-button|fragrance-image-wrap|price-section|rating-star|product-hover-image|product-main-image|secondary-image)(?![\w-])/;
const BARE_ROOT = /^\.(fragrance-item|fragrance-layout|product-card)(?![\w-])/;

const problems = [];
const selectorsOf = (css) => {
  const out = [];
  const s = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of s.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    const sel = m[1].replace(/^[\s\S]*@media[^{]*\{/, '').trim();
    if (!sel || sel.startsWith('@')) continue;
    for (const one of sel.split(',')) out.push(one.trim().replace(/\s+/g, ' '));
  }
  return out;
};
const check = (where, selectors) => {
  for (const sel of selectors) {
    if (INSIDE.test(sel)) problems.push(`${where}: "${sel}" styles inside the card (only ${CARD_CSS} may)`);
    else if (BARE_ROOT.test(sel)) problems.push(`${where}: "${sel}" reaches every host's cards (start it at this section's own root)`);
  }
};

const assets = path.join(ROOT, 'assets');
for (const f of fs.existsSync(assets) ? fs.readdirSync(assets).filter((f) => f.endsWith('.css') && f !== CARD_CSS) : []) {
  check(`assets/${f}`, selectorsOf(fs.readFileSync(path.join(assets, f), 'utf8')));
}
const templates = path.join(ROOT, 'templates');
for (const f of fs.existsSync(templates) ? fs.readdirSync(templates).filter((f) => f.endsWith('.json')) : []) {
  const j = JSON.parse(fs.readFileSync(path.join(templates, f), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  // Shopify scopes a section's custom CSS to that section, so only the insides matter here
  for (const [id, sec] of Object.entries(j.sections || {})) {
    for (const css of sec.custom_css || []) {
      for (const sel of selectorsOf(css)) if (INSIDE.test(sel)) problems.push(`templates/${f} ${id}: custom CSS "${sel}" styles inside the card`);
    }
  }
}

if (problems.length) {
  console.error(`\n❌ ${problems.length} rule(s) change how the product card looks on one page only:\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log(`  ✅ Only ${CARD_CSS} styles the card; hosts size their own cards from their own section.`);

#!/usr/bin/env node
/**
 * Writes regions/<id>/content/sale.json for every region: the sale switch, the
 * badge texts, and "overrides" — every field of the region's content files
 * (except articles), each null. Fill in only what the sale changes; null keeps
 * the normal value. While "sale_is_on" is false the overrides do nothing. See
 * applySale in scripts/region-engine.cjs.
 *
 * Re-run after content gains fields: values already filled in are kept.
 *
 *   npm run sale:skeleton
 */
const fs = require('fs');
const path = require('path');
const { listRegions, REGIONS_DIR } = require('./region-engine.cjs');

const SKIP_PAGES = new Set(['sale', 'articles']);          // articles: long editorial, not sale content
const SKIP_KEYS = new Set(['$comment', 'app_embeds']);     // app_embeds: the store's integrations

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const shape = (v) => {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => !SKIP_KEYS.has(k)).map(([k, x]) => [k, shape(x)]));
  return null;
};
const keep = (skeleton, filled) => {                        // carry filled-in values over
  if (filled === null || filled === undefined) return skeleton;
  if (Array.isArray(skeleton) && Array.isArray(filled)) return filled.map((x, i) => keep(skeleton[i] === undefined ? null : skeleton[i], x));
  if (skeleton && typeof skeleton === 'object' && filled && typeof filled === 'object') {
    const out = { ...skeleton };
    for (const [k, v] of Object.entries(filled)) out[k] = keep(k in skeleton ? skeleton[k] : null, v);
    return out;
  }
  return filled;
};

for (const id of listRegions()) {
  const dir = path.join(REGIONS_DIR, id, 'content');
  if (!fs.existsSync(dir)) continue;
  const file = path.join(dir, 'sale.json');
  const current = fs.existsSync(file) ? read(file) : {};
  const skeleton = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const page = f.replace(/\.json$/, '');
    if (SKIP_PAGES.has(page)) continue;
    skeleton[page] = shape(read(path.join(dir, f)));
  }
  const doc = {
    $comment: [
      'THE SALE. Turn it on or off with "sale_is_on"; everything below follows.',
      '',
      'sale_is_on              true: products Shopify marks as on sale (compare-at price above the price) show the',
      '                        struck-through compare-at price and the badge, and the overrides below apply.',
      '                        false: prices only, no badges, no struck-through prices, and the overrides do nothing.',
      'badge_text              the badge on a product on sale. [percent] is its saving, worked out from Shopify\'s',
      '                        prices, e.g. "[percent]% OFF" shows "38% OFF". Prices are always Shopify\'s: set a',
      '                        product\'s sale price and compare-at price in Shopify.',
      'badge_on_every_product  "" for none. For a store-wide discount set up in Shopify (Discounts > automatic',
      '                        discount, which also puts it in the cart and checkout), the badge every other',
      '                        product shows while the sale is on, e.g. "20% OFF at checkout".',
      'overrides               every field of this region\'s content files, each null. Fill in only what the sale',
      '                        changes (a banner image, a heading, the announcement bar, a cart message); null keeps',
      '                        the normal value. A path that names no content fails the build.',
      '                        npm run sale:skeleton adds fields new content has, keeping what is filled in.',
    ],
    sale_is_on: current.sale_is_on !== undefined ? current.sale_is_on : true,
    badge_text: current.badge_text !== undefined ? current.badge_text : 'Sale',
    badge_on_every_product: current.badge_on_every_product !== undefined ? current.badge_on_every_product : '',
    overrides: keep(skeleton, current.overrides),
  };
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
  const fields = JSON.stringify(doc.overrides).split('null').length - 1;
  console.log(`  regions/${id}/content/sale.json: sale ${doc.sale_is_on ? 'on' : 'off'}, ${fields} overridable field(s)`);
}

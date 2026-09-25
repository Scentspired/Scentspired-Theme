#!/usr/bin/env node
/**
 * Keeps every region's looks (regions/<id>/looks/) in step with its content:
 *
 *   looks/_blank.json    every field of the region's content files (except
 *                        articles and the store's app embeds), each null — copy
 *                        it to start a new look
 *   looks/<name>.json    each look gains any field its content gained, as null;
 *                        values already filled in are kept
 *   looks/_active.json   created with "active_look": "" when missing
 *
 * See applyLook in scripts/region-engine.cjs for how a look is applied.
 *
 *   npm run looks:refresh
 */
const fs = require('fs');
const path = require('path');
const { listRegions, REGIONS_DIR } = require('./region-engine.cjs');

const SKIP_PAGES = new Set(['articles']);                  // long editorial, not a look's business
const SKIP_KEYS = new Set(['$comment', 'app_embeds']);     // app_embeds: the store's integrations

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const write = (f, doc) => fs.writeFileSync(f, JSON.stringify(doc, null, 2) + '\n');
const shape = (v) => {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => !SKIP_KEYS.has(k)).map(([k, x]) => [k, shape(x)]));
  return null;
};
const keep = (skeleton, filled) => {                        // the skeleton, with filled-in values carried over
  if (filled === null || filled === undefined) return skeleton;
  if (Array.isArray(skeleton) && Array.isArray(filled)) return filled.map((x, i) => keep(skeleton[i] === undefined ? null : skeleton[i], x));
  if (skeleton && typeof skeleton === 'object' && filled && typeof filled === 'object') {
    const out = { ...skeleton };
    for (const [k, v] of Object.entries(filled)) out[k] = keep(k in skeleton ? skeleton[k] : null, v);
    return out;
  }
  return filled;
};

const LOOK_COMMENT = [
  'A LOOK: how the site looks during a season or a sale (Christmas, a men\'s sale, Black Friday).',
  'Every field of this region\'s content files is here, null. Fill in only what this look changes: a banner',
  'image, a headline, the announcement bar, the sale badge\'s wording (global.sale_badge.text, where [percent]',
  'is a product\'s saving from its Shopify prices). Null keeps the normal value.',
  'Switch it on in looks/_active.json. Prices are never here: put products on sale in Shopify (their price and',
  'compare-at price); the site shows the badge and the struck-through price on exactly those products.',
];

for (const id of listRegions()) {
  const contentDir = path.join(REGIONS_DIR, id, 'content');
  if (!fs.existsSync(contentDir)) continue;
  const dir = path.join(REGIONS_DIR, id, 'looks');
  fs.mkdirSync(dir, { recursive: true });
  const skeleton = {};
  for (const f of fs.readdirSync(contentDir).filter((f) => f.endsWith('.json')).sort()) {
    const page = f.replace(/\.json$/, '');
    if (!SKIP_PAGES.has(page)) skeleton[page] = shape(read(path.join(contentDir, f)));
  }
  write(path.join(dir, '_blank.json'), { $comment: [...LOOK_COMMENT, '', 'This is the blank look: copy it to <name>.json and fill in what the new look changes.'], ...skeleton });
  const looks = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  for (const f of looks) {
    const look = read(path.join(dir, f));
    const { $comment, ...values } = look;
    write(path.join(dir, f), { $comment: $comment || LOOK_COMMENT, ...keep(skeleton, values) });
  }
  const activeFile = path.join(dir, '_active.json');
  if (!fs.existsSync(activeFile)) {
    write(activeFile, {
      $comment: [
        'The look this region shows: the name of a file in this folder (without .json), or "" for the normal look.',
        'Looks change only how the site looks. Which products are on sale, and by how much, is set in Shopify.',
      ],
      active_look: '',
    });
  }
  const active = read(activeFile).active_look || '(none)';
  console.log(`  regions/${id}/looks/: ${looks.length} look(s) [${looks.map((f) => f.replace('.json', '')).join(', ')}], active: ${active}`);
}

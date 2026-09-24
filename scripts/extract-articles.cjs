#!/usr/bin/env node
/**
 * Moves each live article's content out of its template
 * (regions/<id>/templates/article.<name>.json) into
 * regions/<id>/content/articles.json — one entry per article, its parts in
 * order, with the field names the article parts read
 * (snippets/article--part-<kind>.liquid).
 *
 * One-off migration tool, kept so it can be read and re-run.
 *
 *   node scripts/extract-articles.cjs <region> <handles.json>
 *
 * handles.json maps a template to the live article(s) using it:
 *   { "article.blog-1": [{ "handle": "why-we-started-…" }], … }
 * Templates no live article uses are not carried over.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const [region, handlesFile] = process.argv.slice(2);
if (!region || !handlesFile) {
  console.error('usage: node scripts/extract-articles.cjs <region> <handles.json>');
  process.exit(1);
}
const parse = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '').replace(/\/\*[\s\S]*?\*\//g, ''));

// block/section type -> part kind, and setting id -> JSON field (the parts' names)
const HERO = { heading: 'heading', paragraph: 'subheading', desktop_image: 'image_desktop', mobile_image: 'image_mobile' };
const FEATURE = { background_image: 'image', text_line_1: 'line_1', brand_name_regular: 'line_2_regular', brand_name_italic: 'line_2_italic', text_line_2: 'line_3' };
const COLUMNS = { heading: 'heading', column_1_text: 'column_1', column_2_text: 'column_2' };
const BOX = { heading: 'heading', box_paragraph_1: 'box_paragraph_1', box_paragraph_2: 'box_paragraph_2', box_paragraph_3: 'box_paragraph_3', subheading: 'subheading', bottom_text: 'subheading_text' };
const TABLE = 'table';
const CALLOUT = { heading: 'heading', image: 'image', body_text: 'text' };
const CLOSING = { prefix_text: 'line_1', brand_scent_text: 'line_1_brand_scent', brand_spired_text: 'line_1_brand_spired', start_text: 'line_2_start', bestsellers_text: 'line_2_end', body_text: 'text' };
const STAGGERED = { line_1_text: 'line_1', line_2_text: 'line_2', line_3_text: 'line_3', body_text: 'text' };
const PRODUCTS = { collection: 'collection' };
const TEXT = { text_content: 'text' };

const KIND = {
  'editorial--luxury-perfume-banner': ['hero_banner', HERO],
  'editorial--luxury-perfume-banner-4': ['hero_banner', HERO],
  'editorial--luxury-perfume-banner-2': ['feature_banner', FEATURE],
  'editorial--luxury-perfume-banner-3': ['feature_banner', FEATURE],
  'editorial--text-section': ['two_columns', COLUMNS],
  'editorial--text-section-2': ['two_columns', COLUMNS],
  'editorial--content': ['content_box', BOX],
  'editorial--content-2': ['content_box', BOX],
  'editorial--comparison-table': ['comparison_table', TABLE],
  'editorial--comparison-table-5': ['comparison_table', TABLE],
  'editorial--section': ['callout', CALLOUT],
  'editorial--section-2': ['callout', CALLOUT],
  'editorial--section-3': ['callout', CALLOUT],
  'editorial--split-text': ['closing', CLOSING],
  'editorial--split-text-2': ['closing', CLOSING],
  'editorial--staggered-typography': ['staggered_heading', STAGGERED],
  'editorial--staggered-typography-2': ['staggered_heading', STAGGERED],
  'catalog--product-collection-grid': ['products', PRODUCTS],
  'catalog--product-collection-grid-2': ['products', PRODUCTS],
  'editorial--blog-text': ['text', TEXT],
  'editorial--blog-text-liquid': ['text', TEXT],
  // other table shapes: 3 columns without row labels; 2 columns (label, value)
  'editorial--comparison-table-2': ['comparison_table', 'table-3col'],
  'editorial--comparison-table-3': ['comparison_table', 'table-2col'],
  'editorial--banner': ['image_banner', { desktop_image: 'image_desktop', mobile_image: 'image_mobile' }],
  'editorial--banner-2': ['image_banner', { desktop_image: 'image_desktop', mobile_image: 'image_mobile', heading_line_1_part_1: 'line_1', heading_line_1_part_2: 'line_1_italic', heading_line_2: 'line_2' }],
  'catalog--fragrance-guide': ['fragrance_guide', 'guide'],
  // text typed into the section's own code, not a setting
  'editorial--text-blog': ['text', 'hardcoded-text'],
  // UAE's templates name renamed copies of the same blocks (same settings)
  'blog--luxury-perfume-banner': ['hero_banner', HERO],
  'blog--perfume-feature-banner': ['feature_banner', FEATURE],
  'blog--editorial-text-section': ['two_columns', COLUMNS],
  'blog--narrative-content': ['content_box', BOX],
  'blog--fragrance-comparison-table': ['comparison_table', TABLE],
  'blog--editorial-callout-section': ['callout', CALLOUT],
  'blog--split-editorial-text': ['closing', CLOSING],
  'blog--staggered-typography': ['staggered_heading', STAGGERED],
  'blog--product-collection-grid': ['products', PRODUCTS],
};

const blank = (v) => v === undefined || v === null || String(v).trim() === '';

// The text colour over a photo tells whether the photo is dark or light.
const toneOf = (kind, s) => {
  const color = kind === 'hero_banner' ? s.heading_color : kind === 'feature_banner' ? s.text_color : null;
  if (!color) return undefined;
  return /^#fff(fff)?$/i.test(String(color).trim()) ? 'dark' : 'light';
};

function part(type, settings) {
  const [kind, fields] = KIND[type] || [];
  if (!kind) return { unknown: type };
  const out = { part: kind };
  if (fields === TABLE) {
    out.column_headings = [1, 2, 3].map((c) => settings[`header_${c}`] || '');
    out.rows = [1, 2, 3, 4]
      .map((r) => ({ label: settings[`row_${r}_label`] || '', cells: [1, 2, 3].map((c) => settings[`row_${r}_col_${c}`] || '') }))
      .filter((row) => row.label || row.cells.some(Boolean));
  } else if (fields === 'table-3col') {
    // the first column is the row label
    out.label_heading = settings.header_col_1 || '';
    out.column_headings = [2, 3].map((c) => settings[`header_col_${c}`] || '');
    out.rows = [1, 2, 3]
      .map((r) => ({ label: settings[`row_${r}_col_1`] || '', cells: [2, 3].map((c) => settings[`row_${r}_col_${c}`] || '') }))
      .filter((row) => row.label || row.cells.some(Boolean));
  } else if (fields === 'table-2col') {
    out.label_heading = settings.header_column_1 || '';
    out.column_headings = [settings.header_column_2 || ''];
    out.rows = [1, 2, 3, 4, 5]
      .map((r) => ({ label: settings[`row_${r}_label`] || '', cells: [settings[`row_${r}_value`] || ''] }))
      .filter((row) => row.label || row.cells.some(Boolean));
  } else if (fields === 'guide') {
    for (const [id, field] of [['title', 'title'], ['subtitle', 'subtitle'], ['body_illustration', 'illustration'], ['protip_heading', 'tip_heading'], ['protip_text', 'tip_text']]) {
      if (!blank(settings[id])) out[field] = settings[id];
    }
    out.points = [1, 2, 3, 4]
      .map((n) => Object.fromEntries([['title', settings[`point_${n}_title`]], ['description', settings[`point_${n}_description`]], ['sketch', settings[`sketch_${n}`]]].filter(([, v]) => !blank(v))))
      .filter((pt) => Object.keys(pt).length);
  } else if (fields === 'hardcoded-text') {
    const src = fs.readFileSync(path.join(ROOT, 'sections', `${type}.liquid`), 'utf8');
    const m = src.match(/<div class="shopify-hardcoded-text-section-content">([\s\S]*?)<\/div>\s*<\/div>/);
    if (!m) throw new Error(`${type}: its text could not be found`);
    // its paragraphs were separated by <br><br>; as a text part they are <p>s
    out.text = m[1].trim().split(/\s*<br>\s*<br>\s*/).map((p) => `<p>${p.replace(/\s+/g, ' ').trim()}</p>`).join('');
  } else {
    for (const [id, field] of Object.entries(fields)) {
      const v = settings[id];
      if (v !== undefined && v !== null && String(v).trim() !== '') out[field] = v;
    }
  }
  const tone = toneOf(kind, settings);
  if (tone) out.image_tone = tone;
  return out;
}

const dir = path.join(ROOT, 'regions', region, 'templates');
// --by-template: the region's articles cannot be looked up (UAE's store is closed),
// so every article template is carried over and its entry names the template the
// article is assigned in Shopify instead of its address.
const byTemplate = handlesFile === '--by-template';
const handles = byTemplate
  ? Object.fromEntries(fs.readdirSync(dir).filter((f) => /^article\.blog.*\.json$/.test(f)).map((f) => [f.replace(/\.json$/, ''), [{ template: f.replace(/^article\.|\.json$/g, '') }]]))
  : JSON.parse(fs.readFileSync(handlesFile, 'utf8'));
const entries = {};
const unknown = new Map();
const used = [];
for (const [template, articles] of Object.entries(handles)) {
  if (!template.startsWith('article.')) continue; // "?" — plain Shopify articles, no template content
  const t = parse(path.join(dir, `${template}.json`));
  const parts = [];
  for (const id of t.order) {
    const s = t.sections[id];
    if (!s || s.disabled) continue;
    if (s.type === '_blocks') {
      for (const bid of s.block_order || Object.keys(s.blocks || {})) {
        const b = s.blocks[bid];
        if (!b || b.disabled) continue;
        const p = part(b.type, b.settings || {});
        if (p.unknown) unknown.set(p.unknown, (unknown.get(p.unknown) || []).concat(template));
        else parts.push(p);
      }
    } else {
      const p = part(s.type, s.settings || {});
      if (p.unknown) unknown.set(p.unknown, (unknown.get(p.unknown) || []).concat(template));
      else parts.push(p);
    }
  }
  for (const a of articles) {
    // a readable key: the article's handle — or, by template, its hero heading —
    // cut at a word boundary
    const title = a.handle || String((parts.find((p) => p.part === 'hero_banner') || {}).heading || a.template).replace(/<[^>]+>/g, ' ');
    const words = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-');
    let key = words[0];
    for (const w of words.slice(1)) {
      if (key.length + 1 + w.length > 40) break;
      key += `_${w}`;
    }
    while (entries[key]) key += '_';
    entries[key] = a.handle ? { article_handle: a.handle, parts } : { article_template: a.template, parts };
    used.push(template);
  }
}

const file = path.join(ROOT, 'regions', region, 'content', 'articles.json');
fs.writeFileSync(file, JSON.stringify(entries, null, 2) + '\n');
console.log(`regions/${region}/content/articles.json: ${Object.keys(entries).length} article(s) from ${new Set(used).size} template(s)`);
for (const [k, e] of Object.entries(entries)) console.log(`  ${k.padEnd(40)} ${e.parts.map((p) => p.part).join(' > ')}`);
if (unknown.size) {
  console.log('\n  NOT CARRIED OVER — no part for these types yet:');
  for (const [type, where] of unknown) console.log(`    ${type}  in ${[...new Set(where)].join(', ')}`);
}

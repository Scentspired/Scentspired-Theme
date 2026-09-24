#!/usr/bin/env node
/**
 * Builds the article parts — snippets/article--part-<kind>.liquid — from the
 * newer article blocks (the design chosen as the standard for every article).
 *
 * One-off tool, kept so the conversion can be read and re-run. For each part:
 *   - every DESIGN setting becomes its fixed value, written into the Liquid —
 *     the design lives in the theme, once, the same for every article;
 *   - every CONTENT setting reads the article's entry in
 *     regions/<id>/content/articles.json (field names below);
 *   - the custom CSS the articles' templates carried, where it was live, is
 *     folded in;
 *   - two things follow the content rather than being fixed: text colour over a
 *     photo (the entry's "image_tone": "light" | "dark"), and the feature
 *     banner's shape (the image's own proportions).
 *
 *   node scripts/build-article-parts.cjs
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// The fixed design: the newer articles' values (7a, 11a, 15a), most common first.
// Generated once by comparing the three templates; recorded here, not re-derived.
const DESIGN = JSON.parse(fs.readFileSync(path.join(__dirname, 'article-parts-design.json'), 'utf8'));

const PARTS = {
  hero_banner: {
    from: 'blocks/editorial--luxury-perfume-banner-4',
    fields: { heading: 'heading', paragraph: 'subheading', desktop_image: 'image_desktop', mobile_image: 'image_mobile' },
    images: ['desktop_image', 'mobile_image'],
    tone: { settings: ['heading_color', 'paragraph_color'], light: '#000000', dark: '#ffffff', default: 'light' },
    css: `  .ai-luxury-banner-heading-{{ ai_gen_id }} { margin-bottom: -53px; }
  @media screen and (max-width: 749px) {
    .ai-luxury-banner-heading-{{ ai_gen_id }} { margin-bottom: -19px; }
  }`,
  },
  feature_banner: {
    from: 'blocks/editorial--luxury-perfume-banner-3',
    fields: { background_image: 'image', text_line_1: 'line_1', brand_name_regular: 'line_2_regular', brand_name_italic: 'line_2_italic', text_line_2: 'line_3' },
    images: ['background_image'],
    tone: { settings: ['text_color'], light: '#000000', dark: '#ffffff', default: 'dark' },
    imageShape: { setting: 'aspect_ratio', image: 'background_image' },
    // Read by the block but defined nowhere, so it renders empty: the spotlight's
    // "breathe" script then reads `const baseOpacity = ;`, a syntax error, and
    // never runs on live. The part keeps that look and drops the dead script.
    empty: ['spotlight_opacity'],
    dropScript: true,
    css: `  @media screen and (max-width: 768px) {
    .lux-line2-{{ ai_gen_id }} { position: absolute; top: 2%; left: 15%; }
  }`,
  },
  two_columns: {
    from: 'blocks/editorial--text-section-2',
    fields: { heading: 'heading', column_1_text: 'column_1', column_2_text: 'column_2' },
    css: `  .ai-editorial-heading-{{ ai_gen_id }} { max-width: 625px; }`,
  },
  content_box: {
    from: 'blocks/editorial--content-2',
    fields: { heading: 'heading', box_paragraph_1: 'box_paragraph_1', box_paragraph_2: 'box_paragraph_2', box_paragraph_3: 'box_paragraph_3', subheading: 'subheading', bottom_text: 'subheading_text' },
    css: `  .ai-editorial-section-{{ ai_gen_id }} a { color: #fff; }`,
  },
  comparison_table: {
    from: 'blocks/editorial--comparison-table-5',
    // Any number of columns and rows: the block's fixed 3 x 4 table becomes a
    // loop over the entry's column_headings and rows.
    fields: {},
    doc: 'label_heading (over the row labels, optional), column_headings: [...], rows: [{ label, cells: [...] }]',
    markup: [/<table class="ai-comparison-table-\{\{ ai_gen_id \}\}">[\s\S]*?<\/table>/, `<table class="ai-comparison-table-{{ ai_gen_id }}">
      {%- liquid
        assign k = content_key | append: 'label_heading'
        capture table_label_heading
          render 'region--content', key: k
        endcapture
        assign k = content_key | append: 'column_headings.__keys'
        capture table_columns
          render 'region--content', key: k
        endcapture
        assign table_columns = table_columns | strip | split: ','
        assign k = content_key | append: 'rows.__keys'
        capture table_rows
          render 'region--content', key: k
        endcapture
        assign table_rows = table_rows | strip | split: ','
      -%}
      <thead>
        <tr>
          <th>{{ table_label_heading | strip }}</th>
          {%- for column in table_columns %}
            {%- assign k = content_key | append: 'column_headings.' | append: column %}
          <th>{% render 'region--content', key: k %}</th>
          {%- endfor %}
        </tr>
      </thead>
      <tbody>
        {%- for row in table_rows %}
          {%- assign row_key = content_key | append: 'rows.' | append: row | append: '.' %}
        <tr>
          {%- assign k = row_key | append: 'label' %}
          <td>{% render 'region--content', key: k %}</td>
          {%- for column in table_columns %}
            {%- assign k = row_key | append: 'cells.' | append: column %}
          <td>{% render 'region--content', key: k %}</td>
          {%- endfor %}
        </tr>
        {%- endfor %}
      </tbody>
    </table>`],
  },
  image_banner: {
    from: 'blocks/editorial--banner-2',
    fields: { desktop_image: 'image_desktop', mobile_image: 'image_mobile', heading_line_1_part_1: 'line_1', heading_line_1_part_2: 'line_1_italic', heading_line_2: 'line_2' },
    images: ['desktop_image', 'mobile_image'],
  },
  fragrance_guide: {
    from: 'blocks/catalog--fragrance-guide',
    fields: {
      title: 'title',
      subtitle: 'subtitle',
      body_illustration: 'illustration',
      ...Object.fromEntries([1, 2, 3, 4].flatMap((n) => [[`point_${n}_title`, `points.${n - 1}.title`], [`point_${n}_description`, `points.${n - 1}.description`], [`sketch_${n}`, `points.${n - 1}.sketch`]])),
      protip_heading: 'tip_heading',
      protip_text: 'tip_text',
    },
    images: ['body_illustration', 'sketch_1', 'sketch_2', 'sketch_3', 'sketch_4'],
  },
  callout: {
    from: 'blocks/editorial--section-2',
    fields: { heading: 'heading', image: 'image', body_text: 'text' },
    images: ['image'],
    // a Shopify font picker; its "serif" value renders weight 400, style normal
    literal: { 'heading_font.weight': '400', 'heading_font.style': 'normal' },
  },
  closing: {
    from: 'blocks/editorial--split-text-2',
    fields: { prefix_text: 'line_1', brand_scent_text: 'line_1_brand_scent', brand_spired_text: 'line_1_brand_spired', start_text: 'line_2_start', bestsellers_text: 'line_2_end', body_text: 'text' },
  },
  staggered_heading: {
    from: 'blocks/editorial--staggered-typography-2',
    fields: { line_1_text: 'line_1', line_2_text: 'line_2', line_3_text: 'line_3', body_text: 'text' },
  },
  products: {
    from: 'blocks/catalog--product-collection-grid-2',
    fields: { collection: 'collection' },
    collections: ['collection'],
  },
  text: {
    from: 'sections/editorial--blog-text',
    fields: { text_content: 'text' },
    css: `  .blog-richtext-wrapper a { color: #000; }`,
  },
};

// Liquid strings have no escapes: a value holding single quotes (a font list)
// is wrapped in double quotes instead.
const liquidLiteral = (v) => {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v === null || v === undefined) return 'nil';
  const s = String(v);
  if (!s.includes("'")) return `'${s}'`;
  if (!s.includes('"')) return `"${s}"`;
  throw new Error(`a value holds both quote kinds: ${s}`);
};

const written = [];
for (const [kind, p] of Object.entries(PARTS)) {
  let src = fs.readFileSync(path.join(ROOT, `${p.from}.liquid`), 'utf8').replace(/\r\n/g, '\n');
  const owner = p.from.startsWith('sections/') ? 'section' : 'block';
  const design = (DESIGN[kind] || {}).design || {};

  if (p.dropScript) {
    const before = src;
    src = src.replace(/\n?<script>[\s\S]*?<\/script>\n?/, '\n');
    if (src === before) throw new Error(`${kind}: no <script> to drop`);
  }
  if (p.markup) {
    const before = src;
    src = src.replace(p.markup[0], p.markup[1]);
    if (src === before) throw new Error(`${kind}: the markup to replace was not found`);
  }
  // drop the editor-only parts
  src = src
    .replace(/\{%-?\s*doc\s*-?%\}[\s\S]*?\{%-?\s*enddoc\s*-?%\}\s*/g, '')
    .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}\s*/g, '')
    .replace(new RegExp(`\\s*\\{\\{\\s*${owner}\\.shopify_attributes\\s*\\}\\}`, 'g'), '')
    .replace(/block\.id \| replace: (['"])_\1, \1\1 \| downcase/g, 'part_id');

  const used = new Set();
  src = src.replace(new RegExp(`${owner}\\.settings\\.([a-z_0-9]+)(\\.[a-z_]+)?`, 'g'), (m, id, prop) => {
    if (p.literal && prop && p.literal[id + prop]) return p.literal[id + prop];
    if (p.fields[id]) { used.add(id); return `part_${id}${prop || ''}`; }
    if (p.tone && p.tone.settings.includes(id)) return 'part_text_color';
    if (p.imageShape && id === p.imageShape.setting) return 'part_image_shape';
    if ((p.empty || []).includes(id)) return 'nil';
    if (!(id in design)) throw new Error(`${kind}: ${owner}.settings.${id} is neither content nor a known design value`);
    return liquidLiteral(design[id]) + (prop || '');
  });
  if (/\b(block|section)\.(settings|id|type)\b/.test(src)) throw new Error(`${kind}: a ${owner} reference is left`);
  // a fixed value on its own reads as plain CSS: {{ 20 }}px -> 20px
  src = src
    .replace(/\{\{\s*'([^'{}]*)'\s*\}\}/g, '$1')
    .replace(/\{\{\s*"([^"{}]*)"\s*\}\}/g, '$1')
    .replace(/\{\{\s*(-?\d+(?:\.\d+)?|true|false)\s*\}\}/g, '$1');

  // read the content
  const reads = [];
  for (const [id, field] of Object.entries(p.fields)) {
    reads.push(`  assign k = content_key | append: '${field}'`, `  capture part_${id}`, `    render 'region--content', key: k`, '  endcapture', `  assign part_${id} = part_${id} | strip`);
    if ((p.images || []).includes(id)) {
      reads.push(
        `  # an image is named as in Shopify ("shopify://shop_images/<file>") and read from the store's files`,
        `  assign image_file = part_${id} | remove_first: 'shopify://shop_images/'`,
        `  assign part_${id} = nil`,
        '  if image_file != blank',
        '    # a file the store does not have comes back as an empty image: treat it',
        '    # as no image, as Shopify does for a missing image setting',
        '    assign image_found = images[image_file]',
        '    if image_found.width > 0',
        `      assign part_${id} = image_found`,
        '    endif',
        '  endif'
      );
    }
    if ((p.collections || []).includes(id)) reads.push(`  assign part_${id} = collections[part_${id}]`);
  }
  if (p.tone) {
    reads.push(
      '  # text over a photo: dark photo, light text; light photo, dark text',
      "  assign k = content_key | append: 'image_tone'",
      '  capture part_image_tone',
      "    render 'region--content', key: k",
      '  endcapture',
      `  assign part_image_tone = part_image_tone | strip | default: '${p.tone.default}'`,
      `  assign part_text_color = '${p.tone.light}'`,
      "  if part_image_tone == 'dark'",
      `    assign part_text_color = '${p.tone.dark}'`,
      '  endif'
    );
  }
  if (p.imageShape) {
    reads.push(
      "  # the banner takes its image's own shape (height as a % of width)",
      `  assign part_image_shape = ${liquidLiteral(design[p.imageShape.setting])}`,
      `  if part_${p.imageShape.image} != blank`,
      `    assign part_image_shape = 100.0 | divided_by: part_${p.imageShape.image}.aspect_ratio | round: 1`,
      '  endif'
    );
  }

  const fieldsDoc = Object.values(p.fields).map((f) => f.replace(/\.\d+/g, '.N')).filter((f, i, a) => a.indexOf(f) === i);
  const header = `{%- comment -%}
  GENERATED by scripts/build-article-parts.cjs from ${p.from}.liquid — the
  "${kind}" part of an article. Edit the design here (or regenerate); an
  article's words, images and links are in regions/<id>/content/articles.json.

  Fields: ${p.doc || fieldsDoc.join(', ')}${p.tone ? ', image_tone ("light" | "dark")' : ''}
  Params: content_key ('articles.<entry>.parts.<n>.'), part_id (unique on the page)
{%- endcomment -%}
{%- liquid
${reads.join('\n')}
-%}
`;
  let out = header + src.trimStart();
  if (p.css) {
    const at = Math.max(out.lastIndexOf('{% endstyle %}'), out.lastIndexOf('</style>'));
    if (at === -1) throw new Error(`${kind}: no style block to fold the custom CSS into`);
    out = out.slice(0, at) + `\n  /* Was per-article custom CSS in every template using this part. */\n${p.css}\n` + out.slice(at);
  }
  const file = `snippets/article--part-${kind.replace(/_/g, '-')}.liquid`;
  fs.writeFileSync(path.join(ROOT, file), out);
  written.push(`${file}  (${used.size}/${Object.keys(p.fields).length} fields used)`);
}
console.log(written.join('\n'));

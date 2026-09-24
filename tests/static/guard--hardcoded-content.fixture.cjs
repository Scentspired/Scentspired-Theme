#!/usr/bin/env node

/**
 * FIXTURE — proves guard--hardcoded-content catches content written into code.
 *
 * A throwaway theme with one section that reads everything from settings must
 * pass with an empty baseline. Planting each kind of hardcoded content — text,
 * a JS label, an image URL, a page link, a fallback string, a variant ID —
 * must fail and name the kind. Written under the OS temp directory only.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--hardcoded-content.cjs');

const CLEAN = [
  '<div class="banner">',
  '  <h2>{{ section.settings.heading }}</h2>',
  "  <img src=\"{{ section.settings.image | image_url: width: 800 }}\" alt=\"{{ section.settings.image.alt }}\">",
  '  <a href="{{ section.settings.link }}">{{ section.settings.button_label }}</a>',
  '</div>',
  '<script>const data = {% render \'region--data\', name: \'x\' %};</script>',
  '',
].join('\n');

const PLANTED = [
  ['text', '<p>Free delivery on every order</p>\n'],
  ['js-text', '<script>button.textContent = "Add to Cart";</script>\n'],
  ['media', '<img src="https://cdn.shopify.com/s/files/1/0000/0000/files/hero.jpg">\n'],
  ['links', '<a href="/collections/best-sellers">x</a>\n'],
  ['fallback', "{{ section.settings.title | default: 'Our Bestsellers' }}\n"],
  ['ids', '<input type="hidden" name="id" value="57083185922393">\n'],
];

function theme(extra) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hardcoded-fixture-'));
  fs.mkdirSync(path.join(root, 'sections'));
  fs.writeFileSync(path.join(root, 'sections', 'banner.liquid'), CLEAN + (extra || ''));
  return root;
}
const run = (root) => spawnSync('node', [GUARD, `--root=${root}`], { encoding: 'utf8' });

let ok = true;
const roots = [];
try {
  const clean = theme('');
  roots.push(clean);
  if (run(clean).status !== 0) {
    console.log('  ❌ guard failed a section that reads everything from settings');
    ok = false;
  }
  for (const [kind, body] of PLANTED) {
    const dirty = theme(body);
    roots.push(dirty);
    const r = run(dirty);
    if (r.status === 0 || !new RegExp(`${kind} 0->\\d`).test(r.stdout)) {
      console.log(`  ❌ guard did not catch planted ${kind}: ${body.trim()}`);
      ok = false;
    }
  }
} finally {
  for (const r of roots) fs.rmSync(r, { recursive: true, force: true });
}
if (ok) console.log('  ✅ guard--hardcoded-content: green on settings-driven code, red on each of 6 planted kinds');
process.exit(ok ? 0 : 1);

#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — no setting the code never reads
 * ============================================================================
 *
 * A setting nothing reads is a control in the theme editor that does nothing,
 * and a value in the content that goes nowhere (brand_description sat empty in
 * every region's theme settings; the footer reads its own). Fails when:
 *   - a section or block schema declares a setting that neither the file nor a
 *     snippet it renders (render '…', in {% liquid %} too, followed through)
 *     reads as settings.<id> / settings['<id>'];
 *   - config/settings_schema.json declares a theme setting that no theme code
 *     reads as settings.<id>.
 *
 *   node tests/static/guard--unread-settings.cjs [--root=<theme>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const list = (dir, ext) => (fs.existsSync(path.join(ROOT, dir)) ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(ext)) : []);
const reads = (code, id) => new RegExp(String.raw`settings(\.|\[['"])` + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + String.raw`(?![A-Za-z0-9_])`).test(code);

const snippets = Object.fromEntries(list('snippets', '.liquid').map((f) => [f.replace(/\.liquid$/, ''), read(`snippets/${f}`)]));
const reach = (src, seen = new Set()) => {
  let all = src;
  for (const m of src.matchAll(/\brender\s+['"]([^'"]+)['"]/g)) {
    if (seen.has(m[1]) || !snippets[m[1]]) continue;
    seen.add(m[1]);
    all += '\n' + reach(snippets[m[1]], seen);
  }
  return all;
};

const problems = [];
for (const dir of ['sections', 'blocks']) {
  for (const f of list(dir, '.liquid')) {
    const src = read(`${dir}/${f}`);
    const m = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/.exec(src);
    if (!m) continue;
    let schema;
    try { schema = JSON.parse(m[1]); } catch (e) { continue; } // Theme Check reports broken schemas
    const code = reach(src.replace(m[0], ''));
    const check = (settings, scope) => {
      for (const s of settings || []) if (s.id && !reads(code, s.id)) problems.push(`${dir}/${f}${scope}: "${s.id}" is never read`);
    };
    check(schema.settings, '');
    for (const b of schema.blocks || []) check(b.settings, ` block "${b.type}"`);
  }
}

// theme settings: read anywhere in the theme's code
if (fs.existsSync(path.join(ROOT, 'config', 'settings_schema.json'))) {
  let code = '';
  const walk = (dir) => {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${dir}/${e.name}`);
      else if (e.name.endsWith('.liquid')) code += read(`${dir}/${e.name}`) + '\n';
    }
  };
  for (const d of ['layout', 'sections', 'snippets', 'blocks', 'templates', 'assets']) walk(d);
  for (const g of JSON.parse(read('config/settings_schema.json'))) {
    for (const s of g.settings || []) if (s.id && !reads(code, s.id)) problems.push(`config/settings_schema.json: theme setting "${s.id}" is never read`);
  }
}

if (problems.length) {
  console.error(`\n❌ ${problems.length} setting(s) nothing reads — remove each, with its value in the templates and content:\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log('  ✅ Every section, block and theme setting is read by the code.');

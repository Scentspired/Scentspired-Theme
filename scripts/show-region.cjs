#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Where is everything for this region?
 * ============================================================================
 *
 *   npm run region:show -- usa
 *
 * The theme is a thin template that holds no content. Everything a storefront
 * shows comes from its own folder, regions/<id>/. This prints what is there
 * and which file to edit for each thing.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { listRegions, readRegionFile, resolveRegion, regionContentFiles, REGIONS_DIR } = require('./region-engine.cjs');

const id = (process.argv[2] || '').toLowerCase();
const own = readRegionFile(id);
if (!own) {
  console.error(`\n  Usage: npm run region:show -- <id>     regions: ${listRegions().join(', ')}\n`);
  process.exit(1);
}
const r = resolveRegion(id);
const dir = `regions/${id}`;
const content = regionContentFiles(id);
const has = (rel) => content.includes(rel);

const L = (s = '') => console.log(s);
L('');
L(`  ${r.name} (${id})   ${r.published ? 'LIVE — store locked against writes' : 'not published'}   ` +
  `${r.myshopify_domain || ''}   dev port ${r.dev_port || '-'}`);
L('  ' + '─'.repeat(78));

L(`\n  SETTINGS — ${dir}/region.json`);
L(`    domain, currency  ${r.domain}, ${r.currency_code} ${r.currency_symbol}`);
L(`    shipping          free over ${r.free_shipping_threshold_display}, else ${r.shipping_cost_display}`);
L(`    emails            ${r.support_email}, ${r.returns_email}`);
const tp = r.trustpilot || {};
L(`    trustpilot        ${tp.enabled ? `ON  (embed: ${tp.embed})  ${tp.url || ''}` : 'OFF'}` +
  '    → "trustpilot": { "enabled", "embed": "app"|"widget", "url", "businessunit_id", ... }');
const ga = r.analytics || {};
L(`    analytics         GA4 ${ga.ga4_id || '(none)'}${own.analytics ? '' : '  (from regions/_defaults.json)'}` +
  '    → "analytics": { "ga4_id", ... }');
L('    every key and what it does: regions/_schema.json');

L(`\n  CONTENT — all in ${dir}/`);
for (const [label, rel] of [
  ['footer', 'sections/footer-group.json'],
  ['header', 'sections/header-group.json'],
  ['theme settings', 'config/settings_data.json'],
]) {
  L(`    ${label.padEnd(16)}${has(rel) ? `${dir}/${rel}` : '(none)'}`);
}
const templates = content.filter((f) => f.startsWith('templates/')).map((f) => f.slice('templates/'.length));
const kinds = {
  pages: templates.filter((t) => /^page\./.test(t)),
  'blog articles': templates.filter((t) => /^article\./.test(t)),
  'customer account': templates.filter((t) => /^customers\//.test(t)),
};
const listed = new Set(Object.values(kinds).flat());
kinds.other = templates.filter((t) => !listed.has(t));
L(`    templates       ${templates.length} in ${dir}/templates/`);
for (const [k, list] of Object.entries(kinds)) {
  if (!list.length) continue;
  const names = list.map((t) => t.replace(/\.(json|liquid)$/, '').replace(/^page\./, ''));
  L(`      ${(k + ':').padEnd(18)}${names.join(', ')}`);
}
const locales = fs.existsSync(path.join(REGIONS_DIR, id, 'locales')) ? fs.readdirSync(path.join(REGIONS_DIR, id, 'locales')) : [];
L(`    translations    ${locales.length ? `${dir}/locales/ (${locales.join(', ')}) over the theme's` : "the theme's locales/"}`);

L('\n  TO CHANGE SOMETHING');
L(`    a setting or Trustpilot   ${dir}/region.json`);
L(`    a page                    ${dir}/templates/<page>.json`);
L(`    footer / header           ${dir}/sections/footer-group.json / header-group.json`);
L(`    then                      npm run compile -- ${id}`);
L('');

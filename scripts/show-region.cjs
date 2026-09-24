#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED — Where is everything for this region?
 * ============================================================================
 *
 *   npm run region:show -- usa
 *
 * A region folder holds only what makes it DIFFERENT, so an almost-empty
 * folder does not mean an almost-empty storefront: everything else is
 * inherited from core (the repository root, which is the UK storefront). This
 * prints the whole picture — every setting, page, header, footer and feature
 * the region uses, whether it has its own copy or inherits core's, and the
 * exact file to edit for each.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { listRegions, readRegionFile, resolveRegion, CORE_REGION, REGIONS_DIR } = require('./region-engine.cjs');

const THEME_ROOT = path.resolve(__dirname, '..');
const id = (process.argv[2] || '').toLowerCase();
const own = readRegionFile(id);
if (!own) {
  console.error(`\n  Usage: npm run region:show -- <id>     regions: ${listRegions().join(', ')}\n`);
  process.exit(1);
}
const r = resolveRegion(id);
const isCore = id === CORE_REGION;
const rel = (p) => path.relative(THEME_ROOT, p).split(path.sep).join('/');
const regionDir = path.join(REGIONS_DIR, id);
const files = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? files(path.join(dir, e.name)).map((f) => `${e.name}/${f}`) : [e.name]
      )
    : [];

/** Where this region gets a content file from: its own copy, or core's. */
function source(sub) {
  const mine = path.join(regionDir, sub);
  if (!isCore && fs.existsSync(mine)) return { file: rel(mine), own: true };
  return { file: sub, own: isCore };
}
const tag = (s) => (s.own ? 'own     ' : 'inherits');

const L = (s = '') => console.log(s);
L('');
L(`  ${r.name} (${id})   ${r.published ? 'LIVE — store locked against writes' : 'not published'}   ` +
  `${r.myshopify_domain || ''}   dev port ${r.dev_port || '-'}`);
L('  ' + '─'.repeat(78));

L('\n  SETTINGS — one file: ' + rel(path.join(regionDir, 'region.json')));
L(`    domain, currency  ${r.domain}, ${r.currency_code} ${r.currency_symbol}`);
L(`    shipping          free over ${r.free_shipping_threshold_display}, else ${r.shipping_cost_display}`);
L(`    emails            ${r.support_email}, ${r.returns_email}`);
const tp = r.trustpilot || {};
L(`    trustpilot        ${tp.enabled ? `ON  (embed: ${tp.embed})  ${tp.url || ''}` : 'OFF'}` +
  `    → "trustpilot": { "enabled", "embed": "app"|"widget", "url", "businessunit_id", ... }`);
const ga = r.analytics || {};
L(`    analytics         GA4 ${ga.ga4_id || '(none)'}${own.analytics ? '' : '  (from regions/_defaults.json)'}` +
  `    → "analytics": { "ga4_id", ... }`);
if (r.bundles) L(`    bundle prices     ${Object.keys(r.bundles).join(', ')}    → "bundles": { ... }`);
if (r.social) L(`    social links      ${Object.keys(r.social).join(', ')}    → "social": { ... }`);
L('    Every key and what it does: regions/_schema.json');

L('\n  CONTENT — "own" = this region\'s copy; "inherits" = core\'s file, shared with other regions');
if (isCore) {
  L(`    ${id} IS the core, so its content is the repository root. Editing these`);
  L('    also changes every region that inherits the same file.');
}
for (const [label, sub] of [
  ['footer', 'sections/footer-group.json'],
  ['header', 'sections/header-group.json'],
  ['theme settings', 'config/settings_data.json'],
]) {
  const s = source(sub);
  L(`    ${label.padEnd(16)}${tag(s)}  ${s.file}`);
}

const coreTemplates = files(path.join(THEME_ROOT, 'templates'));
const ownTemplates = isCore ? [] : files(path.join(regionDir, 'templates'));
const inherited = coreTemplates.filter((t) => !ownTemplates.includes(t));
L(`    pages           own ${String(ownTemplates.length).padStart(3)}  ${isCore ? 'templates/' : `regions/${id}/templates/`}`);
L(`                    inherits ${String(inherited.length).padStart(3)}  templates/   (core)`);
const pages = (list) => list.filter((t) => /^page\./.test(t)).map((t) => t.replace(/\.(json|liquid)$/, ''));
if (!isCore && ownTemplates.length) L(`      own pages:       ${pages(ownTemplates).join(', ') || '(articles and others only)'}`);
if (!isCore && inherited.length) L(`      inherited pages: ${pages(inherited).join(', ')}`);

const ownLocales = isCore ? [] : files(path.join(regionDir, 'locales'));
L(`    translations    ${ownLocales.length ? `own keys in ${ownLocales.join(', ')}` : 'inherits all'}  (merged over core locales/)`);

if (!isCore) {
  L('\n  TO CHANGE SOMETHING');
  L(`    a setting or Trustpilot   edit regions/${id}/region.json`);
  L('    an "own" file             edit it in place');
  const example = inherited.find((t) => /^page\./.test(t)) || inherited[0] || 'page.contact.json';
  L(`    an "inherits" file        npm run region:edit -- ${id} templates/${example}`);
  L('                              copies core\'s file into this region; edit the copy');
}
L('');

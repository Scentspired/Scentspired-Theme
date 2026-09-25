#!/usr/bin/env node
/**
 * Which template renders each URL? A template no URL renders is dead, even
 * though the static dead-file check sees it as a root.
 *
 *   node scripts/template-usage.cjs --dist=dist/usa --url=http://127.0.0.1:9293 --country=US <urls-file>
 *
 * <urls-file> holds one path per line — the live sitemap's pages, collections,
 * blogs and articles (products carry their template in /products/<handle>.json).
 * Each URL is fetched from the dev server and matched by the template sections it
 * renders (shopify-section-template--<n>__<key>) against every built template:
 * the template whose enabled sections are exactly those, else every template that
 * holds them all. Templates with the same sections (collection.men and collection)
 * differ only in content: tell them apart by what the page shows.
 */
const fs = require('fs');
const path = require('path');
const { checkPaths, fetchPage } = require('./dev-page.cjs');

const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=').slice(1).join('=');
const dist = opt('dist', 'dist/usa');
const base = opt('url', 'http://127.0.0.1:9293');
const country = opt('country', 'US');
const list = args.find((a) => !a.startsWith('--'));

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const templates = walk(path.join(dist, 'templates')).filter((f) => f.endsWith('.json')).map((f) => {
  const j = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  const all = Object.keys(j.sections || {});
  return {
    name: path.relative(path.join(dist, 'templates'), f).split(path.sep).join('/').replace(/\.json$/, ''),
    all: new Set(all),
    on: all.filter((k) => !j.sections[k].disabled).sort().join(','),
  };
});

(async () => {
  if (!list) throw new Error('usage: --dist= --url= --country= <urls-file>');
  const urls = fs.readFileSync(list, 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  checkPaths(urls);
  const used = {};
  for (const u of urls) {
    const html = await fetchPage(base, u, country);
    const keys = [...new Set([...html.matchAll(/shopify-section-template--\d+__([A-Za-z0-9_-]+)/g)].map((m) => m[1]))];
    const exact = templates.filter((t) => t.on === [...keys].sort().join(','));
    const fits = exact.length ? exact : templates.filter((t) => keys.length && keys.every((k) => t.all.has(k))).sort((a, b) => a.all.size - b.all.size);
    const name = fits.length ? fits.map((t) => t.name).join(' | ') : `(no template sections: a Liquid template) ${keys.join(',')}`;
    (used[name] = used[name] || []).push(u);
  }
  for (const [k, v] of Object.entries(used).sort()) console.log(`${k}: ${v.length}  ${v.slice(0, 4).join(' ')}${v.length > 4 ? ' …' : ''}`);
  const hit = new Set(Object.keys(used).flatMap((k) => k.split(' | ')));
  console.log(`\nNo URL rendered with: ${templates.map((t) => t.name).filter((n) => !hit.has(n)).join(', ') || 'none'}`);
})().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });

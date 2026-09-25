#!/usr/bin/env node
/**
 * Which assets do real pages load? The static dead-file check counts a file as used
 * when it is *mentioned* by a used file; this one asks a running dev store.
 *
 *   node scripts/asset-usage.cjs --url=http://127.0.0.1:9293 --country=US <path> <path> …
 *
 * Fetches each page, collects every theme asset it references (script src, link
 * href, img src, inline url()), then follows asset names inside the loaded CSS and
 * JS files. An SVG pasted into the page by inline_asset_content leaves no name
 * behind, so an SVG also counts as used when its markup appears in a page.
 *
 * Prints the assets none of the pages used, each with the theme files that name
 * it: candidates to check by hand (a page outside the list — password, gift card —
 * may be the one that loads them). Assets that are only the options of a picker
 * (an icon chosen by a setting: prepend "icon-" … append ".svg") are counted apart:
 * they are the palette of a setting, not code a page forgot.
 */
const fs = require('fs');
const path = require('path');
const { checkPaths, fetchPage } = require('./dev-page.cjs');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=').slice(1).join('=');
const base = opt('url', 'http://127.0.0.1:9293');
const country = opt('country', 'US');
const pages = args.filter((a) => !a.startsWith('--'));
const ASSETS = fs.readdirSync(path.join(ROOT, 'assets'));
const names = new Set(ASSETS);
const readAsset = (a) => fs.readFileSync(path.join(ROOT, 'assets', a), 'utf8');

// the theme's own files, to say who names an asset
const walk = (dir) => (fs.existsSync(path.join(ROOT, dir))
  ? fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))
  : []);
const SOURCES = ['layout', 'sections', 'blocks', 'snippets', 'templates', 'assets', 'config'].flatMap(walk)
  .map((f) => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')]);
const pickerOptions = new Set();
for (const [f, text] of SOURCES) {
  if (!f.endsWith('.liquid')) continue;
  for (const m of text.matchAll(/prepend:\s*['"]([^'"]+)['"][^%}\n]*append:\s*['"](\.[a-z0-9]+)['"]/g)) {
    for (const a of ASSETS) if (a.startsWith(m[1]) && a.endsWith(m[2])) pickerOptions.add(a);
  }
}
const namedBy = (a) => SOURCES.filter(([f, text]) => f !== `assets/${a}` && text.includes(a)).map(([f]) => f);

const mentioned = (text) => {
  const out = new Set();
  for (const m of text.matchAll(/[A-Za-z0-9_.@-]+\.(?:css|js|svg|png|jpe?g|gif|webp|woff2?|ttf|otf|mp4|json)/g)) if (names.has(path.basename(m[0]))) out.add(path.basename(m[0]));
  return out;
};

(async () => {
  checkPaths(pages);
  const loaded = new Set();
  const perPage = {};
  const squash = (t) => t.replace(/\s+/g, '');
  const inlineSvgs = ASSETS.filter((a) => a.endsWith('.svg')).map((a) => [a, squash(readAsset(a)).slice(0, 400)]);
  for (const p of pages) {
    const html = await fetchPage(base, p, country);
    const found = mentioned(html);
    perPage[p] = found.size;
    found.forEach((a) => loaded.add(a));
    const flat = squash(html);
    for (const [a, sig] of inlineSvgs) if (sig.length > 40 && flat.includes(sig)) loaded.add(a);
  }
  // follow names inside loaded CSS and JS (fonts, icons, dynamically loaded scripts)
  const queue = [...loaded].filter((a) => /\.(css|js)$/.test(a));
  while (queue.length) {
    const a = queue.shift();
    for (const x of mentioned(readAsset(a))) if (!loaded.has(x)) { loaded.add(x); if (/\.(css|js)$/.test(x)) queue.push(x); }
  }
  const unused = ASSETS.filter((a) => !loaded.has(a) && !a.endsWith('.liquid'));
  const options = unused.filter((a) => pickerOptions.has(a) && !namedBy(a).length);
  const never = unused.filter((a) => !options.includes(a));
  console.log(`${pages.length} page(s) on ${base}; assets used: ${loaded.size} of ${ASSETS.length}`);
  for (const [p, n] of Object.entries(perPage)) console.log(`  ${String(n).padStart(3)}  ${p}`);
  console.log(`\nOnly options of a picker, unused by these pages (${options.length}): ${options.join(', ') || 'none'}`);
  console.log(`\nUsed by none of these pages (${never.length}) — asset: files that name it`);
  never.forEach((a) => console.log(`  ${a}: ${namedBy(a).join(', ') || '(nothing names it)'}`));
})().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });

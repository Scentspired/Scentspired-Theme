#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Guard: Unguarded image_url
 * ============================================================================
 *
 * `{{ section.settings.foo | image_url: width: 100 }}` raises a Liquid error
 * when the setting is blank, and Shopify renders the error in place of the
 * page. A merchant clearing an image in the theme editor is enough to break a
 * template — that is how running-text.liquid took down every page carrying it.
 *
 * A usage is considered guarded when the setting is checked for emptiness on
 * the way in: an enclosing `{% if setting %}` / `{% unless setting == blank %}`
 * / `{% elsif setting %}`, a `| default:` on the same expression, or a ternary
 * on the setting.
 *
 * Runs against the CORE. Accepted exceptions live in baseline-image-url.json
 * and the guard fails only on NEW ones, so inherited debt is frozen rather
 * than blocking.
 *
 * Usage
 *   node tests/static/guard--image-url.cjs            gate
 *   node tests/static/guard--image-url.cjs --list     show each unguarded use
 *   node tests/static/guard--image-url.cjs --update   re-record the baseline
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const rootArg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = path.resolve(
  rootArg ? rootArg.slice('--root='.length) : process.env.THEME_TARGET_DIR || process.cwd()
);
const BASELINE = path.join(__dirname, 'baseline-image-url.json');

const SCAN_DIRS = ['sections', 'snippets', 'blocks', 'layout'];

/** Comments and doc blocks are not code. Blank them, preserving line numbers. */
function stripComments(src) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return src
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, blank)
    .replace(/\{%-?\s*doc\s*-?%\}[\s\S]*?\{%-?\s*enddoc\s*-?%\}/g, blank);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.liquid')) out.push(p);
  }
  return out;
}

// `<scope>.settings.<id> | image_url`
const USE = /\b((?:section|block|settings)\.settings\.[a-z0-9_]+)\s*\|\s*image_url/g;

/**
 * Is this specific usage protected against a blank setting?
 *
 * Looks for a guard on the same line first, then walks backwards for an
 * enclosing conditional that tests the same setting, stopping at the tag that
 * closes it so an unrelated earlier `{% if %}` cannot count.
 */
function isGuarded(lines, lineIdx, expr) {
  const setting = expr.trim();
  const short = setting.split('.').pop();
  const line = lines[lineIdx];

  // `| default:` on the way in, or a ternary on the setting.
  if (/\|\s*default\s*:/.test(line)) return true;

  const sameLineGuard = new RegExp(
    `\\{%-?\\s*(?:if|unless|elsif)\\b[^%]*\\b${short}\\b|\\b${short}\\s*[!=]=\\s*blank|\\b${short}\\s*\\?`
  );
  if (sameLineGuard.test(line)) return true;

  // Walk back through enclosing tags.
  let depth = 0;
  for (let i = lineIdx - 1; i >= 0 && lineIdx - i < 120; i--) {
    const l = lines[i];
    if (/\{%-?\s*end(if|unless|case)\b/.test(l)) depth++;
    const opens = /\{%-?\s*(if|unless|case)\b/.exec(l);
    if (opens) {
      if (depth > 0) {
        depth--;
      } else if (new RegExp(`\\b${short}\\b`).test(l)) {
        // An enclosing conditional that names this setting.
        return true;
      }
    }
    // `{% elsif setting %}` guards the branch that follows it.
    if (depth === 0 && /\{%-?\s*elsif\b/.test(l) && new RegExp(`\\b${short}\\b`).test(l)) {
      return true;
    }
    // An assign that gives the setting a fallback before use.
    if (new RegExp(`assign\\s+[a-z0-9_]+\\s*=\\s*${setting.replace(/\./g, '\\.')}[^\\n]*default`).test(l)) {
      return true;
    }
  }
  return false;
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Unguarded image_url Guard     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);

const found = {};
const detail = [];
let scanned = 0;

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const rel = toPosix(path.relative(ROOT, file));
    const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n');

    lines.forEach((line, i) => {
      let m;
      USE.lastIndex = 0;
      while ((m = USE.exec(line)) !== null) {
        scanned++;
        if (isGuarded(lines, i, m[1])) continue;
        found[rel] = (found[rel] || 0) + 1;
        if (detail.length < 60) {
          detail.push({ rel, line: i + 1, expr: m[1], sample: line.trim().slice(0, 100) });
        }
      }
    });
  }
}

const baseline = fs.existsSync(BASELINE)
  ? JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
  : { accepted: {} };
const accepted = baseline.accepted || {};

const regressions = [];
for (const [rel, count] of Object.entries(found)) {
  const allowed = accepted[rel] ? accepted[rel].count : 0;
  if (count > allowed) regressions.push({ rel, count, allowed });
}

const totalFound = Object.values(found).reduce((a, b) => a + b, 0);
const totalAccepted = Object.values(accepted).reduce((a, b) => a + b.count, 0);

console.log(`  image_url usages scanned: ${scanned}`);
console.log(`  Unguarded:                ${totalFound}`);
console.log(`  Accepted baseline:        ${totalAccepted}`);
console.log(`  New violations:           ${regressions.length}\n`);

if (process.argv.includes('--list') && detail.length) {
  for (const d of detail) {
    console.log(`  [${accepted[d.rel] ? 'accepted' : 'NEW'}] ${d.rel}:${d.line}  ${d.expr}`);
    console.log(`         ${d.sample}`);
  }
  console.log('');
}

if (process.argv.includes('--update')) {
  const next = { accepted: {} };
  for (const [rel, count] of Object.entries(found)) {
    next.accepted[rel] = {
      count,
      reason: accepted[rel] ? accepted[rel].reason : 'inherited — see TODO.md',
    };
  }
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`  Baseline written: ${Object.keys(next.accepted).length} file(s).\n`);
  process.exit(0);
}

const repaid = Object.keys(accepted).filter((k) => (found[k] || 0) < accepted[k].count);
if (repaid.length) {
  console.log('  ✅ Debt repaid since the baseline was taken:');
  for (const k of repaid) console.log(`     ${k}  ${accepted[k].count} -> ${found[k] || 0}`);
  console.log('     Re-run with --update to tighten the ratchet.\n');
}

if (regressions.length) {
  console.log('  ❌ image_url used on a setting that may be blank:\n');
  for (const r of regressions) {
    console.log(`     ${r.rel}  found ${r.count}, allowed ${r.allowed}`);
    for (const d of detail.filter((x) => x.rel === r.rel).slice(0, 4)) {
      console.log(`       line ${d.line}: ${d.sample}`);
    }
    console.log('');
  }
  console.log('  A blank image setting raises a Liquid error and Shopify renders it');
  console.log('  instead of the page. Wrap the usage in {% if <setting> %}.\n');
  process.exit(1);
}

console.log('  ✅ No new unguarded image_url usages.\n');
process.exit(0);

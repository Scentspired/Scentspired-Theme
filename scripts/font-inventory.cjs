#!/usr/bin/env node
/**
 * Font declaration inventory.
 *
 * Tokenising typography must not change what any element renders: if a heading
 * is Arial today it must be Arial afterwards. An HTML diff cannot prove that,
 * because a token swap changes CSS, not markup.
 *
 * So this records every typography declaration in the theme — selector, the
 * property, and the RESOLVED value — and fails if any resolved value changes.
 * Introducing `--font-display: 'PP Mori'` and pointing a rule at it is
 * invisible here, which is the point. Changing 'PP Mori' to something else is
 * not.
 *
 *   node scripts/font-inventory.cjs              capture/refresh the baseline
 *   node scripts/font-inventory.cjs --check      fail on any resolved change
 *   node scripts/font-inventory.cjs --report     show fonts in use, grouped
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const BASELINE = path.join(THEME_ROOT, 'tests/parity/font-inventory.json');

const args = process.argv.slice(2);
const isCheck = args.includes('--check');
const isReport = args.includes('--report');
/**
 * --painted compares only the FIRST family in each stack — the one the browser
 * actually paints when the webfont loads. Consolidating fallbacks changes the
 * declaration but not the painted result, so this is the mode that answers
 * "did anything visibly move?".
 */
const isPainted = args.includes('--painted');

const PROPS = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'];

/** Every file that can carry CSS: stylesheets plus Liquid with inline styles. */
function sources() {
  const out = [];
  const walk = dir => {
    const full = path.join(THEME_ROOT, dir);
    if (!fs.existsSync(full)) return;
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (/\.(css|liquid)$/.test(entry.name)) out.push(rel);
    }
  };
  ['assets', 'sections', 'snippets', 'blocks', 'layout'].forEach(walk);
  return out.sort();
}

/**
 * Resolve `var(--x)` one level using the custom properties defined in the same
 * file, so an alias reads as the value it produces rather than as its name.
 * That is what makes tokenisation invisible to this check.
 */
function buildVarMap(text) {
  const map = new Map();
  for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+)[;}]/g)) {
    map.set(m[1].trim(), m[2].trim());
  }
  return map;
}

function resolve(value, vars, depth = 0) {
  if (depth > 6) return value;
  const next = value.replace(/var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)/g, (all, name, fallback) => {
    if (vars.has(name)) return vars.get(name);
    return fallback !== undefined ? fallback.trim() : all;
  });
  return next === value ? value : resolve(next, vars, depth + 1);
}

const normalize = v =>
  v
    .replace(/!important/g, '')
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * Tokens are defined in one file and used in many, so resolution needs a
 * global map as well as the per-file one. Without it, migrating a rule to
 * var(--font-body) would look like the declaration vanished.
 */
function globalVars() {
  const map = new Map();
  for (const file of ['snippets/token--typography.liquid', 'layout/theme.liquid', 'assets/base.css']) {
    const full = path.join(THEME_ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const [k, v] of buildVarMap(fs.readFileSync(full, 'utf8'))) {
      if (!map.has(k)) map.set(k, v);
    }
  }
  return map;
}

function collect() {
  const inventory = {};
  const fontsInUse = new Map();
  const globals = globalVars();

  for (const file of sources()) {
    const raw = fs.readFileSync(path.join(THEME_ROOT, file), 'utf8');
    // Liquid comments and schema blocks are not CSS.
    const text = raw
      .replace(/\{%-?\s*(comment|doc)[\s\S]*?end\1\s*-?%\}/g, '')
      .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, '');

    const vars = new Map([...globals, ...buildVarMap(text)]);
    const entries = [];

    // selector { ... } blocks, plus inline style="..." attributes
    for (const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = m[1].split('\n').pop().trim();
      if (!selector || selector.startsWith('@')) continue;
      for (const prop of PROPS) {
        const re = new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;{}]+)`, 'gi');
        for (const d of m[2].matchAll(re)) {
          const value = normalize(resolve(d[1], vars));
          if (!value || value.includes('var(')) continue;
          entries.push(`${selector} { ${prop}: ${value} }`);
          if (prop === 'font-family') {
            if (!fontsInUse.has(value)) fontsInUse.set(value, new Set());
            fontsInUse.get(value).add(file);
          }
        }
      }
    }

    for (const m of text.matchAll(/style\s*=\s*"([^"]*)"/g)) {
      for (const prop of PROPS) {
        const re = new RegExp(`${prop}\\s*:\\s*([^;"]+)`, 'gi');
        for (const d of m[1].matchAll(re)) {
          const value = normalize(resolve(d[1], vars));
          if (!value || value.includes('var(')) continue;
          entries.push(`[inline] { ${prop}: ${value} }`);
          if (prop === 'font-family') {
            if (!fontsInUse.has(value)) fontsInUse.set(value, new Set());
            fontsInUse.get(value).add(file);
          }
        }
      }
    }

    if (entries.length) inventory[file] = entries.sort();
  }

  return { inventory, fontsInUse };
}

const { inventory, fontsInUse } = collect();
const totalDeclarations = Object.values(inventory).reduce((a, e) => a + e.length, 0);

if (isReport) {
  console.log(`\n  Typography declarations: ${totalDeclarations} across ${Object.keys(inventory).length} files`);
  console.log(`  Distinct font stacks in use: ${fontsInUse.size}\n`);
  [...fontsInUse.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .forEach(([font, files]) => {
      console.log(`  ${String(files.size).padStart(3)} file(s)  ${font}`);
    });
  console.log('');
  process.exit(0);
}

if (!isCheck) {
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(inventory, null, 1) + '\n');
  console.log(`\n  📌 Font baseline captured: ${totalDeclarations} declarations, ${fontsInUse.size} distinct stacks.\n`);
  process.exit(0);
}

if (!fs.existsSync(BASELINE)) {
  console.error('\n  ❌ No baseline. Run: node scripts/font-inventory.cjs\n');
  process.exit(1);
}

const before = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const changes = [];

/** Reduce "sel { font-family: a, b, c }" to "sel { font-family: a }". */
const toPainted = entry =>
  entry.replace(/(\{\s*font-family:\s*)([^}]+)(\})/, (all, head, value, tail) => head + value.split(',')[0].trim() + ' ' + tail);

for (const file of new Set([...Object.keys(before), ...Object.keys(inventory)])) {
  let a = before[file] || [];
  let b = inventory[file] || [];
  if (isPainted) {
    a = a.map(toPainted);
    b = b.map(toPainted);
  }
  const countOf = list => list.reduce((m, e) => m.set(e, (m.get(e) || 0) + 1), new Map());
  const ca = countOf(a);
  const cb = countOf(b);
  for (const [entry, n] of ca) {
    const m = cb.get(entry) || 0;
    if (m < n) changes.push(`- ${file}  ${entry}`);
  }
  for (const [entry, n] of cb) {
    const m = ca.get(entry) || 0;
    if (m < n) changes.push(`+ ${file}  ${entry}`);
  }
}

console.log(`\n  Typography declarations: ${totalDeclarations}`);
if (changes.length === 0) {
  console.log(
    isPainted
      ? '  ✅ No painted font changed — only fallback chains differ.\n'
      : '  ✅ Every resolved typography value is unchanged.\n'
  );
  process.exit(0);
}

console.log(`  ❌ ${changes.length} resolved typography value(s) changed:\n`);
changes.slice(0, 40).forEach(c => console.log(`     ${c}`));
if (changes.length > 40) console.log(`     ... and ${changes.length - 40} more`);
console.log('');
process.exit(1);

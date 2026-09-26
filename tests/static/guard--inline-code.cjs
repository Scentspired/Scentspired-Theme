#!/usr/bin/env node

/**
 * ============================================================================
 * GUARD — no inline script or style block without Liquid
 * ============================================================================
 *
 * Code with no Liquid in it is a file in assets/: cached once, linted by the
 * gate (Stylelint, the AST checks), and not shipped again inside every page's
 * HTML. Phase 6 moved 52 script blocks and 25 style blocks out of the markup;
 * this keeps them out. An inline block stays only when it needs Liquid (a
 * setting, a section id, a translation) or is on the list below, with why.
 *
 *   node tests/static/guard--inline-code.cjs [--root=<theme>]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv.find((a) => a.startsWith('--root='));
const ROOT = arg ? path.resolve(arg.slice(7)) : path.resolve(__dirname, '..', '..');

// file -> why its Liquid-free inline block stays inline
const ALLOWED = {
  'layout/theme.liquid': "the brand's @font-face, first in the head: the browser finds the fonts without waiting for a stylesheet",
  'snippets/token--typography.liquid': 'the typography tokens (--font-*), rendered in the head for the same reason',
};

const problems = [];
for (const dir of ['layout', 'sections', 'snippets', 'blocks']) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs).filter((f) => f.endsWith('.liquid') && !f.startsWith('region--'))) {
    const rel = `${dir}/${f}`;
    const s = fs.readFileSync(path.join(abs, f), 'utf8').replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, (c) => c.replace(/[^\n]/g, ' '));
    const line = (i) => s.slice(0, i).split('\n').length;
    const found = [];
    for (const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(m[1]) || /type=["'](application\/(ld\+)?json|text\/template)/.test(m[1])) continue;
      if (m[2].trim() && !/\{\{|\{%/.test(m[2])) found.push(`${rel}:${line(m.index)} <script>`);
    }
    for (const m of s.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>|\{%-?\s*(style|stylesheet|javascript)\s*-?%\}([\s\S]*?)\{%-?\s*end\2\s*-?%\}/g)) {
      const body = m[1] !== undefined ? m[1] : m[3];
      if (body.trim() && !/\{\{|\{%/.test(body)) found.push(`${rel}:${line(m.index)} ${m[2] ? `{% ${m[2]} %}` : '<style>'}`);
    }
    if (found.length && ALLOWED[rel] && found.length === 1) continue;
    problems.push(...found);
  }
}

if (problems.length) {
  console.error(`\n❌ ${problems.length} inline block(s) with no Liquid — move each to assets/<component>.css or .js, linked where it was:\n`);
  problems.forEach((p) => console.error('   ' + p));
  console.error('');
  process.exit(1);
}
console.log(`  ✅ Every inline script and style block needs its Liquid (allowed without: ${Object.keys(ALLOWED).length}, each documented).`);

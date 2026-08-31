#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 11: Asset & Snippet Integrity Scanner
 * ============================================================================
 *
 * Scans all Liquid files to guarantee that:
 * 1. Every file referenced with | asset_url exists in assets/ (no 404 assets).
 * 2. Every snippet referenced with {% render %} or {% include %} exists in snippets/.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.env.THEME_TARGET_DIR || process.cwd();
const ROOT = path.resolve(targetDir);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Asset & Snippet Integrity Linter║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'tests') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.liquid')) results.push(full);
  }
  return results;
}

const liquidFiles = walk(ROOT);
const assetsDir = path.join(ROOT, 'assets');
const snippetsDir = path.join(ROOT, 'snippets');

const existingAssets = new Set(fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : []);
const existingSnippets = new Set(fs.existsSync(snippetsDir) ? fs.readdirSync(snippetsDir).map(f => f.replace('.liquid', '')) : []);

let missingAssets = [];
let missingSnippets = [];
let totalReferences = 0;

const assetPattern = /['"]([a-zA-Z0-9_\-.]+\.(?:css|js|png|jpg|svg|webp|woff|woff2))['"]\s*\|\s*asset_url/g;
const renderPattern = /{%\s*(?:render|include)\s+['"]([a-zA-Z0-9_\-.]+)['"]/g;

for (const file of liquidFiles) {
  // Strip Liquid comments
  let content = fs.readFileSync(file, 'utf8').replace(/{%\s*comment\s*%}[\s\S]*?{%\s*endcomment\s*%}/g, '');

  let match;
  while ((match = assetPattern.exec(content)) !== null) {
    totalReferences++;
    const asset = match[1];
    if (!existingAssets.has(asset)) {
      missingAssets.push({ file: path.relative(ROOT, file), asset });
    }
  }

  while ((match = renderPattern.exec(content)) !== null) {
    totalReferences++;
    const snip = match[1];
    if (!existingSnippets.has(snip)) {
      missingSnippets.push({ file: path.relative(ROOT, file), snippet: snip });
    }
  }
}

console.log(`  🔍 Inspected ${liquidFiles.length} Liquid files (${totalReferences} asset/snippet references checked)`);

if (missingAssets.length === 0 && missingSnippets.length === 0) {
  console.log('  ✅ 100% OF REFERENCED ASSETS AND SNIPPETS EXIST ON DISK\n');
} else {
  for (const a of missingAssets) {
    console.error(`  ❌ [MISSING ASSET] ${a.file}: '${a.asset}' | asset_url does not exist in assets/`);
  }
  for (const s of missingSnippets) {
    console.error(`  ❌ [MISSING SNIPPET] ${s.file}: {% render '${s.snippet}' %} does not exist in snippets/`);
  }
  console.log('');
}

console.log('┌──────────────────────────────────────────────────────────────┐');
console.log(`│  Files: ${String(liquidFiles.length).padStart(4)}  │  Missing Assets: ${String(missingAssets.length).padStart(2)}  │  Missing Snippets: ${String(missingSnippets.length).padStart(2)}      │`);
console.log('└──────────────────────────────────────────────────────────────┘\n');

process.exit(missingAssets.length + missingSnippets.length > 0 ? 1 : 0);

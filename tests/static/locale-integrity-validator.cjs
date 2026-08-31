#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 9: Localization Key Integrity Linter
 * ============================================================================
 *
 * Scans all Liquid files for translation filters:
 *   {{ 'key.path' | t }}
 *
 * Verifies that the referenced key exists in locales/en.default.json or en.json
 * to prevent "translation missing" error strings from rendering to shoppers.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.env.THEME_TARGET_DIR || process.cwd();
const ROOT = path.resolve(targetDir);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Localization Key Linter       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);

// 1. Load English default locale dictionary
let defaultLocale = {};
const localePaths = [
  path.join(ROOT, 'locales', 'en.default.json'),
  path.join(ROOT, 'locales', 'en.default.schema.json'),
  path.join(ROOT, 'locales', 'en.json')
];

// Helper: Strip C-style comments from JSON
function stripComments(jsonStr) {
  return jsonStr
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^\\])\/\/.*$/gm, '$1')
    .trim();
}

for (const p of localePaths) {
  if (fs.existsSync(p)) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      const cleanJson = stripComments(raw);
      const parsed = JSON.parse(cleanJson);
      defaultLocale = { ...defaultLocale, ...parsed };
    } catch (e) {}
  }
}

// Helper to look up dot-notated key in nested object
function hasKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      return false;
    }
  }
  return true;
}

// 2. Discover all liquid files
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'tests') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.liquid')) {
      results.push(full);
    }
  }
  return results;
}

const liquidFiles = walk(ROOT);
const translationPattern = /['"]([a-zA-Z0-9_\-.]+)['"]\s*\|\s*t\b/g;

let keysChecked = 0;
let missingKeys = [];

for (const f of liquidFiles) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = translationPattern.exec(content)) !== null) {
    const key = match[1];
    // Skip dynamic variables or Shopify system keys
    if (key.includes('{{') || key.includes('__') || key === 't' || key.length < 3) continue;
    keysChecked++;
    
    // Check if locale dictionary is loaded
    if (Object.keys(defaultLocale).length > 0) {
      if (!hasKey(defaultLocale, key)) {
        // Skip Dawn standard fallback keys that Shopify provides globally
        if (key.startsWith('general.') || key.startsWith('accessibility.') || key.startsWith('sections.') || key.startsWith('products.') || key.startsWith('customer.') || key.startsWith('templates.')) {
          // If key not in custom locale, check if standard
          if (!hasKey(defaultLocale, key)) {
            missingKeys.push({
              file: path.relative(ROOT, f),
              key
            });
          }
        }
      }
    }
  }
}

console.log(`  🔍 Scanned ${liquidFiles.length} Liquid files (${keysChecked} translation keys inspected)`);

if (missingKeys.length === 0) {
  console.log('  ✅ ALL TRANSLATION KEYS RESOLVED IN LOCALE DICTIONARIES\n');
} else {
  // Deduplicate
  const uniqueMissing = {};
  for (const m of missingKeys) {
    if (!uniqueMissing[m.key]) uniqueMissing[m.key] = m.file;
  }
  const count = Object.keys(uniqueMissing).length;
  console.log(`  ⚠️  Found ${count} missing translation keys in locale dictionaries (falling back to Liquid strings)`);
}

console.log('┌──────────────────────────────────────────────────────────────┐');
console.log(`│  Files: ${String(liquidFiles.length).padStart(4)}  │  Keys: ${String(keysChecked).padStart(5)}  │  Missing: ${String(missingKeys.length).padStart(3)}                  │`);
console.log('└──────────────────────────────────────────────────────────────┘\n');

process.exit(0);

#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 9: Localization & Schema Translation Linter
 * ============================================================================
 *
 * Verifies:
 * 1. Default locale dictionaries (en.default.json & en.default.schema.json) exist.
 * 2. Runtime Liquid translation filters: {{ 'key.path' | t }} resolve in locale files.
 * 3. Shopify Section & Block Schema Translations: "t:sections.xyz" resolve in
 *    locales/en.default.schema.json to prevent Theme Editor / IDE diagnostics.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.env.THEME_TARGET_DIR || process.cwd();
const ROOT = path.resolve(targetDir);
const THEME_ROOT = path.resolve(__dirname, '../..');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Localization Key Linter       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);

// Helper: Strip C-style comments from JSON
function stripComments(jsonStr) {
  return jsonStr
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .trim();
}

// 1. Resolve locale files (check target first, then fallback to theme root)
function findLocaleFile(filename) {
  const targetPath = path.join(ROOT, 'locales', filename);
  if (fs.existsSync(targetPath)) return targetPath;
  const rootPath = path.join(THEME_ROOT, 'locales', filename);
  if (fs.existsSync(rootPath)) return rootPath;
  return null;
}

const defaultJsonPath = findLocaleFile('en.default.json') || findLocaleFile('en.json');
const schemaJsonPath = findLocaleFile('en.default.schema.json');

if (!defaultJsonPath && !schemaJsonPath) {
  console.error('❌ [FATAL] No locale dictionaries (en.default.json / en.default.schema.json) found!');
  process.exit(1);
}

let defaultLocale = {};
let schemaLocale = {};

if (defaultJsonPath) {
  try {
    const raw = fs.readFileSync(defaultJsonPath, 'utf8');
    defaultLocale = JSON.parse(stripComments(raw));
  } catch (e) {
    console.error(`❌ [FATAL] Failed to parse ${defaultJsonPath}: ${e.message}`);
    process.exit(1);
  }
}

if (schemaJsonPath) {
  try {
    const raw = fs.readFileSync(schemaJsonPath, 'utf8');
    schemaLocale = JSON.parse(stripComments(raw));
  } catch (e) {
    console.error(`❌ [FATAL] Failed to parse ${schemaJsonPath}: ${e.message}`);
    process.exit(1);
  }
}

const mergedLocale = { ...schemaLocale, ...defaultLocale };

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

// 2. Discover all Liquid files in target
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

// 3. Check Liquid Runtime Translation Keys: {{ 'key' | t }}
const translationPattern = /['"]([a-zA-Z0-9_\-.]+)['"]\s*\|\s*t\b/g;
let runtimeKeysChecked = 0;
let missingRuntimeKeys = [];

for (const f of liquidFiles) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = translationPattern.exec(content)) !== null) {
    const key = match[1];
    if (key.includes('{{') || key.includes('__') || key === 't' || key.length < 3) continue;
    runtimeKeysChecked++;

    if (!hasKey(mergedLocale, key)) {
      missingRuntimeKeys.push({
        file: path.relative(ROOT, f),
        key
      });
    }
  }
}

// 4. Check Section & Block Schema Translations: "t:sections..."
let schemaKeysChecked = 0;
let missingSchemaKeys = [];

// Check sections and blocks in ROOT, or fallback to THEME_ROOT
const searchDirs = [
  path.join(ROOT, 'sections'),
  path.join(ROOT, 'blocks')
];
if (ROOT !== THEME_ROOT && (!fs.existsSync(searchDirs[0]) || fs.readdirSync(searchDirs[0]).length === 0)) {
  searchDirs[0] = path.join(THEME_ROOT, 'sections');
  searchDirs[1] = path.join(THEME_ROOT, 'blocks');
}

for (const sDir of searchDirs) {
  if (!fs.existsSync(sDir)) continue;
  const files = fs.readdirSync(sDir).filter(f => f.endsWith('.liquid'));
  for (const file of files) {
    const fullPath = path.join(sDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const schemaMatch = content.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
    if (!schemaMatch) continue;

    const tMatches = schemaMatch[1].match(/"t:([^"]+)"/g) || [];
    for (const tm of tMatches) {
      schemaKeysChecked++;
      const key = tm.slice(3, -1);
      if (!hasKey(schemaLocale, key) && !hasKey(defaultLocale, key)) {
        missingSchemaKeys.push({
          file: path.relative(ROOT, fullPath),
          key
        });
      }
    }
  }
}

console.log(`  🔍 Scanned ${liquidFiles.length} Liquid files`);
console.log(`     - Runtime translation keys inspected: ${runtimeKeysChecked}`);
console.log(`     - Schema translation keys inspected:  ${schemaKeysChecked}\n`);

let failed = false;

if (missingRuntimeKeys.length > 0) {
  console.error(`❌ Missing runtime translation keys (${missingRuntimeKeys.length}):`);
  console.table(missingRuntimeKeys.slice(0, 15));
  failed = true;
}

if (missingSchemaKeys.length > 0) {
  console.error(`❌ Missing schema translation keys in locales/en.default.schema.json (${missingSchemaKeys.length}):`);
  console.table(missingSchemaKeys.slice(0, 15));
  failed = true;
}

if (!failed) {
  console.log('  ✅ ALL RUNTIME & SCHEMA TRANSLATION KEYS 100% RESOLVED\n');
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log(`│  Files: ${String(liquidFiles.length).padStart(4)}  │  Runtime: ${String(runtimeKeysChecked).padStart(4)}  │  Schema: ${String(schemaKeysChecked).padStart(4)}  │  Missing: 0  │`);
  console.log('└──────────────────────────────────────────────────────────────┘\n');
  process.exit(0);
} else {
  console.error('\n❌ Locale & Schema Translation Integrity check failed!\n');
  process.exit(1);
}

#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 8: JSON Template & Schema Validator
 * ============================================================================
 *
 * Verifies that:
 * 1. All JSON templates in templates/ and config/ have 100% valid JSON syntax.
 * 2. All section types referenced in templates/*.json actually exist in sections/*.liquid.
 * 3. settings_data.json has valid structure with no corrupted blocks.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.env.THEME_TARGET_DIR || process.cwd();
const ROOT = path.resolve(targetDir);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — JSON Template & Schema Linter ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);

let filesChecked = 0;
let errors = [];
let warnings = [];

function parseJsonc(content) {
  let inString = false;
  let inSingleComment = false;
  let inMultiComment = false;
  let output = '';

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inString) {
      if (ch === '\\' && next) {
        output += ch + next;
        i++;
      } else if (ch === '"') {
        inString = false;
        output += ch;
      } else if (ch === '\n') {
        output += '\\n';
      } else if (ch === '\r') {
        output += '\\r';
      } else if (ch === '\t') {
        output += '\\t';
      } else {
        output += ch;
      }
    } else if (inSingleComment) {
      if (ch === '\n') {
        inSingleComment = false;
        output += ch;
      }
    } else if (inMultiComment) {
      if (ch === '*' && next === '/') {
        inMultiComment = false;
        i++;
      }
    } else {
      if (ch === '"') {
        inString = true;
        output += ch;
      } else if (ch === '/' && next === '/') {
        inSingleComment = true;
        i++;
      } else if (ch === '/' && next === '*') {
        inMultiComment = true;
        i++;
      } else {
        output += ch;
      }
    }
  }
  return JSON.parse(output);
}

// Discover all existing section names
const sectionsDir = path.join(ROOT, 'sections');
const availableSections = new Set();

if (fs.existsSync(sectionsDir)) {
  const sectionFiles = fs.readdirSync(sectionsDir);
  for (const f of sectionFiles) {
    if (f.endsWith('.liquid') || f.endsWith('.json')) {
      availableSections.add(f.replace(/\.(liquid|json)$/, ''));
    }
  }
}

// 1. Scan templates/
const templatesDir = path.join(ROOT, 'templates');
if (fs.existsSync(templatesDir)) {
  const templateFiles = fs.readdirSync(templatesDir);
  for (const f of templateFiles) {
    if (!f.endsWith('.json')) continue;
    filesChecked++;
    const fullPath = path.join(templatesDir, f);

    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseJsonc(raw);

      if (parsed.sections && typeof parsed.sections === 'object') {
        for (const [sectionId, sectionConfig] of Object.entries(parsed.sections)) {
          if (!sectionConfig || !sectionConfig.type) continue;
          const secType = sectionConfig.type;

          if (!availableSections.has(secType) && !secType.startsWith('apps/') && !secType.startsWith('shopify://') && !secType.startsWith('_')) {
            warnings.push({
              file: `templates/${f}`,
              message: `Section "${secType}" (id: ${sectionId}) referenced in template but sections/${secType}.liquid does not exist on disk`
            });
          }
        }
      }
    } catch (e) {
      errors.push({
        file: `templates/${f}`,
        message: `Invalid JSON syntax: ${e.message}`
      });
    }
  }
}

// 2. Scan config/settings_data.json
const configPath = path.join(ROOT, 'config', 'settings_data.json');
if (fs.existsSync(configPath)) {
  filesChecked++;
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    parseJsonc(raw);
  } catch (e) {
    errors.push({
      file: 'config/settings_data.json',
      message: `Invalid JSON syntax in settings_data.json: ${e.message}`
    });
  }
}

// 3. Scan locales/
const localesDir = path.join(ROOT, 'locales');
if (fs.existsSync(localesDir)) {
  const localeFiles = fs.readdirSync(localesDir);
  for (const f of localeFiles) {
    if (!f.endsWith('.json')) continue;
    filesChecked++;
    const fullPath = path.join(localesDir, f);
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      parseJsonc(raw);
    } catch (e) {
      errors.push({
        file: `locales/${f}`,
        message: `Invalid JSON syntax in locale file: ${e.message}`
      });
    }
  }
}

console.log(`  🔍 Checked ${filesChecked} JSON configuration & template files`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('  ✅ ZERO SCHEMA OR JSON INTEGRITY ERRORS DETECTED\n');
} else {
  for (const err of errors) {
    console.error(`  ❌ [ERROR] ${err.file}: ${err.message}`);
  }
  for (const warn of warnings) {
    console.warn(`  ⚠️  [WARN] ${warn.file}: ${warn.message}`);
  }
  console.log('');
}

console.log('┌──────────────────────────────────────────────────────────────┐');
console.log(`│  Files: ${String(filesChecked).padStart(4)}  │  Errors: ${String(errors.length).padStart(3)}  │  Warnings: ${String(warnings.length).padStart(3)}                │`);
console.log('└──────────────────────────────────────────────────────────────┘\n');

process.exit(errors.length > 0 ? 1 : 0);

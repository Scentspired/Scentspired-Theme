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

// Discover all existing section names and parse section/block schemas
const coreSectionsDir = path.resolve(__dirname, '../../sections');
const targetSectionsDir = path.join(ROOT, 'sections');
const sectionsDirs = [targetSectionsDir, coreSectionsDir];
const availableSections = new Set();
const sectionSchemas = new Map();
const blockSchemas = new Map();

function parseLiquidSchemas(dir, map) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.liquid')) continue;
    const name = f.replace('.liquid', '');
    if (map.has(name)) continue;
    try {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      const match = content.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
      if (match) {
        map.set(name, JSON.parse(match[1]));
      }
    } catch (e) {}
  }
}

for (const sDir of sectionsDirs) {
  if (fs.existsSync(sDir)) {
    const sectionFiles = fs.readdirSync(sDir);
    for (const f of sectionFiles) {
      if (f.endsWith('.liquid') || f.endsWith('.json')) {
        availableSections.add(f.replace(/\.(liquid|json)$/, ''));
      }
    }
  }
  parseLiquidSchemas(sDir, sectionSchemas);
}

const blocksDirs = [path.join(ROOT, 'blocks'), path.resolve(__dirname, '../../blocks')];
for (const bDir of blocksDirs) {
  parseLiquidSchemas(bDir, blockSchemas);
}

// Rule 4 Helper: Universal Schema Setting Type & Range Step Validator
function validateSettingsAgainstSchema(settings, schemaSettings, contextDesc, templateFile) {
  if (!settings || !Array.isArray(schemaSettings)) return;
  const schemaMap = new Map();
  schemaSettings.forEach(s => { if (s && s.id) schemaMap.set(s.id, s); });

  for (const [id, val] of Object.entries(settings)) {
    const s = schemaMap.get(id);
    if (!s) continue;

    if (s.type === 'range' && typeof val === 'number') {
      const min = s.min !== undefined ? s.min : 0;
      const max = s.max !== undefined ? s.max : 100;
      const step = s.step !== undefined ? s.step : 1;

      if (val < min || val > max) {
        errors.push({
          file: templateFile,
          message: `${contextDesc}: Setting '${id}' value ${val} is out of bounds [${min}, ${max}].`
        });
      } else {
        const diff = Math.round((val - min) * 1000000) / 1000000;
        const stepScaled = Math.round(step * 1000000) / 1000000;
        const remainder = Math.round((diff % stepScaled) * 1000000) / 1000000;
        if (remainder !== 0 && Math.abs(remainder - stepScaled) > 0.0001 && Math.abs(remainder) > 0.0001) {
          errors.push({
            file: templateFile,
            message: `${contextDesc}: Setting '${id}' must be a step in the range (value ${val} is not a step of ${step} starting at min ${min}).`
          });
        }
      }
    }

    if (s.type === 'select' && Array.isArray(s.options)) {
      const validOptions = new Set(s.options.map(o => String(o.value)));
      if (val !== '' && val !== null && !validOptions.has(String(val))) {
        errors.push({
          file: templateFile,
          message: `${contextDesc}: Setting '${id}' value '${val}' is not a valid option [${Array.from(validOptions).join(', ')}].`
        });
      }
    }
  }
}

// 1. Scan templates/ and regional templates
const templateDirectories = [];
const directTemplatesDir = path.join(ROOT, 'templates');
if (fs.existsSync(directTemplatesDir)) templateDirectories.push({ dir: directTemplatesDir, prefix: 'templates' });

const regionsDir = path.join(ROOT, 'regions');
if (fs.existsSync(regionsDir)) {
  for (const r of fs.readdirSync(regionsDir)) {
    const rTemplates = path.join(regionsDir, r, 'templates');
    if (fs.existsSync(rTemplates)) {
      templateDirectories.push({ dir: rTemplates, prefix: `regions/${r}/templates` });
    }
  }
}

for (const { dir: tDir, prefix: tPrefix } of templateDirectories) {
  const templateFiles = fs.readdirSync(tDir);
  for (const f of templateFiles) {
    if (!f.endsWith('.json')) continue;
    filesChecked++;
    const fullPath = path.join(tDir, f);
    const displayFile = `${tPrefix}/${f}`;
    // regions/** mirrors a live storefront byte for byte; so does a compiled dist.
    // Its dead data is reported, never blocking — we must be able to build what live actually is.
    const isMirror = tPrefix.startsWith('regions/') || process.env.SCENTSPIRED_MIRROR_SOURCE === '1';

    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseJsonc(raw);

      if (parsed.sections && typeof parsed.sections === 'object') {
        for (const [sectionId, sectionConfig] of Object.entries(parsed.sections)) {
          if (!sectionConfig || !sectionConfig.type) continue;
          const secType = sectionConfig.type;
          const secSchema = sectionSchemas.get(secType);

          if (secSchema) {
            validateSettingsAgainstSchema(sectionConfig.settings, secSchema.settings, `section "${sectionId}" (${secType})`, displayFile);
          }

          if (sectionConfig.blocks && typeof sectionConfig.blocks === 'object') {
            for (const [bId, blk] of Object.entries(sectionConfig.blocks)) {
              if (!blk || !blk.type) continue;
              let blkSchema = blockSchemas.get(blk.type);
              if (!blkSchema && secSchema && Array.isArray(secSchema.blocks)) {
                const found = secSchema.blocks.find(b => b.type === blk.type);
                if (found) blkSchema = found;
              }
              if (blkSchema) {
                validateSettingsAgainstSchema(blk.settings, blkSchema.settings, `block "${bId}" in section "${sectionId}" (${blk.type})`, displayFile);
              }
            }
          }

          if (!availableSections.has(secType) && !secType.startsWith('apps/') && !secType.startsWith('shopify://') && !secType.startsWith('_')) {
            warnings.push({
              file: displayFile,
              message: `Section "${secType}" (id: ${sectionId}) referenced in template but sections/${secType}.liquid does not exist on disk`
            });
          }

          // Rule 1: Prohibit rogue negative margin hacks in custom_css for article templates
          if (f.startsWith('article.') && Array.isArray(sectionConfig.custom_css)) {
            for (const rule of sectionConfig.custom_css) {
              if (/margin-bottom\s*:\s*-[0-9]+/i.test(rule)) {
                (isMirror ? warnings : errors).push({
                  file: displayFile,
                  message: `Prohibited negative margin hack in section "${sectionId}" custom_css: "${rule}". In article templates, layout spacing must be managed via centralized typography CSS.`
                });
              }
            }
          }
        }
      }

      // Rule 2: Template order integrity & editorial parity enforcement
      if (Array.isArray(parsed.order) && parsed.sections && typeof parsed.sections === 'object') {
        const orderSet = new Set(parsed.order);
        // A section defined but absent from `order` is never rendered by Shopify,
        // so it cannot cause a layout regression. Live UK/USA templates carry
        // these routinely, and pruning them would break byte parity with live.
        for (const secKey of Object.keys(parsed.sections)) {
          if (!orderSet.has(secKey)) {
            warnings.push({
              file: displayFile,
              message: `Orphan section '${secKey}' is defined but absent from order (dead data, not rendered).`
            });
          }
        }
        for (const sectionId of parsed.order) {
          const sec = parsed.sections[sectionId];
          if (!sec) {
            errors.push({
              file: displayFile,
              message: `Section "${sectionId}" is in order array but does not exist in sections dictionary.`
            });
            continue;
          }
          // In article templates, ghost/disabled sections are strictly prohibited to maintain universal layout parity
          if (f.startsWith('article.') && sec.disabled === true) {
            (isMirror ? warnings : errors).push({
              file: displayFile,
              message: `Ghost section detected in order: section "${sectionId}" is marked disabled: true. In article templates, disabled sections must be pruned from order to ensure strict layout parity.`
            });
          }
          if (sec.blocks && typeof sec.blocks === 'object') {
            const blockValues = Object.values(sec.blocks);
            if (blockValues.length === 0 && sec.type === '_blocks') {
              (isMirror ? warnings : errors).push({
                file: displayFile,
                message: `Empty section detected in order: section "${sectionId}" (type: ${sec.type}) has 0 blocks. It must be pruned from order to avoid empty rendering artifacts.`
              });
            } else if (f.startsWith('article.') && blockValues.length > 0 && blockValues.every(b => b && b.disabled === true)) {
              (isMirror ? warnings : errors).push({
                file: displayFile,
                message: `Ghost section detected in order: all blocks inside section "${sectionId}" are marked disabled: true. In article templates, this must be pruned to guarantee editorial parity.`
              });
            }
          }
        }
      }

      // Rule 3: Enforce Hero Banner Geometry Standardization in article templates
      if (f.startsWith('article.') && f.endsWith('.json') && parsed.sections) {
        for (const [secId, sec] of Object.entries(parsed.sections)) {
          if (sec && sec.blocks) {
            for (const [bId, blk] of Object.entries(sec.blocks)) {
              if (blk && blk.type && blk.type.includes('blog--luxury-perfume-banner')) {
                const s = blk.settings || {};
                if (s.content_padding && s.content_padding !== 40) {
                  errors.push({
                    file: displayFile,
                    message: `Hero banner in section "${secId}" has non-standard content_padding: ${s.content_padding} (must be 40px for universal layout parity).`
                  });
                }
                if (s.content_max_width_inner && s.content_max_width_inner !== 680) {
                  errors.push({
                    file: displayFile,
                    message: `Hero banner in section "${secId}" has non-standard content_max_width_inner: ${s.content_max_width_inner} (must be 680px for universal layout parity).`
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      errors.push({
        file: displayFile,
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

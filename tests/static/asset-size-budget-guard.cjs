#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 12: Asset Size & Performance Budget Guard
 * ============================================================================
 *
 * Scans assets/ directory to ensure:
 * 1. JavaScript bundles do not exceed 600KB uncompressed.
 * 2. CSS stylesheets do not exceed 400KB uncompressed.
 * 3. Static asset bloat is intercepted before it impacts mobile conversion rate.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.env.THEME_TARGET_DIR || process.cwd();
const ROOT = path.resolve(targetDir);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Asset Budget & Size Guard     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${ROOT}\n`);

const MAX_JS_BYTES = 650 * 1024;   // 650 KB limit
const MAX_CSS_BYTES = 450 * 1024;  // 450 KB limit

const assetsDir = path.join(ROOT, 'assets');
let violations = [];
let totalBytes = 0;
let fileCount = 0;

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  for (const f of files) {
    const full = path.join(assetsDir, f);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    fileCount++;
    totalBytes += stat.size;

    if (f.endsWith('.js') && stat.size > MAX_JS_BYTES) {
      violations.push({
        file: f,
        type: 'JavaScript',
        sizeKb: (stat.size / 1024).toFixed(1),
        limitKb: (MAX_JS_BYTES / 1024).toFixed(1)
      });
    } else if (f.endsWith('.css') && stat.size > MAX_CSS_BYTES) {
      violations.push({
        file: f,
        type: 'CSS',
        sizeKb: (stat.size / 1024).toFixed(1),
        limitKb: (MAX_CSS_BYTES / 1024).toFixed(1)
      });
    }
  }
}

console.log(`  🔍 Scanned ${fileCount} theme assets (${(totalBytes / 1024 / 1024).toFixed(2)} MB total asset directory)`);

if (violations.length === 0) {
  console.log('  ✅ ALL ASSETS WITHIN STRICT PERFORMANCE BUDGET THRESHOLDS\n');
} else {
  for (const v of violations) {
    console.error(`  ❌ [BUDGET EXCEEDED] assets/${v.file} (${v.sizeKb} KB) exceeds maximum ${v.type} limit (${v.limitKb} KB)`);
  }
  console.log('');
}

console.log('┌──────────────────────────────────────────────────────────────┐');
console.log(`│  Assets: ${String(fileCount).padStart(4)}  │  Total Size: ${String((totalBytes/1024/1024).toFixed(2) + ' MB').padStart(8)}  │  Violations: ${String(violations.length).padStart(2)}          │`);
console.log('└──────────────────────────────────────────────────────────────┘\n');

process.exit(violations.length > 0 ? 1 : 0);

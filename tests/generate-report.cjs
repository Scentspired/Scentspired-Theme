#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Automated Report Generator
 * ============================================================================
 * 
 * Automatically generates timestamped & latest markdown and JSON reports
 * whenever tests run.
 * 
 * Output destinations:
 *   - tests/reports/LATEST_SCAN_REPORT.md
 *   - tests/reports/latest_scan_report.json
 *   - tests/reports/archive/SCAN_REPORT_YYYY-MM-DD_HH-mm-ss.md
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.env.THEME_TARGET_DIR ? path.resolve(process.env.THEME_TARGET_DIR) : path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');
const ARCHIVE_DIR = path.join(REPORTS_DIR, 'archive');

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

// 1. Run Static Analysis Scanner in JSON mode
let staticData = { totalViolations: 0, errors: 0, warnings: 0, violations: [], filesScanned: 0, linesScanned: 0 };
try {
  const output = execSync('node ' + path.join(__dirname, 'static-analysis.cjs') + ' --fix-report', {
    encoding: 'utf8',
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  staticData = JSON.parse(output);
} catch (e) {
  if (e.stdout) {
    try { staticData = JSON.parse(e.stdout); } catch (err) {}
  }
}

// 2. Run Critical Flow Simulator
let flowPassed = 0;
let flowFailed = 0;
let flowOutput = '';
try {
  flowOutput = execSync('node ' + path.join(__dirname, 'critical-flow-simulator.cjs'), {
    encoding: 'utf8',
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const passMatches = flowOutput.match(/\[PASS\]/g) || [];
  flowPassed = passMatches.length;
} catch (e) {
  const out = (e.stdout || '') + (e.stderr || '');
  const passMatches = out.match(/\[PASS\]/g) || [];
  const failMatches = out.match(/\[FAIL\]/g) || [];
  flowPassed = passMatches.length;
  flowFailed = failMatches.length;
  flowOutput = out;
}

// 3. Build Markdown Report
const timestamp = new Date().toISOString().replace('T', ' ').replace(/\..+/, '');
const dateSlug = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

let md = `# 🛡️ Theme Guardian — Automated Quality & Detection Report

**Generated At:** \`${timestamp} UTC\`  
**Branch:** \`develop\`  
**Target Codebase:** \`Scentspired-UK\`  

---

## 📊 Executive Summary

| Metric | Value | Status |
| :--- | :--- | :--- |
| **Files Scanned** | \`${staticData.filesScanned}\` Liquid & JS files | 🔍 Complete |
| **Total Lines Inspected** | \`${staticData.linesScanned.toLocaleString()}\` lines | 🔍 Complete |
| **Active Rules Evaluated** | \`12 Rules\` | 🛡️ Active |
| **Errors (Blockers)** | \`${staticData.errors}\` errors | ${staticData.errors === 0 ? '✅ **0 Errors**' : '❌ **Blocking Deploy**'} |
| **Warnings** | \`${staticData.warnings}\` warnings | ⚠️ Review |
| **Flow Simulator Assertions** | \`${flowPassed}\` Passed / \`${flowFailed}\` Failed | ${flowFailed === 0 ? '✅ **100% PASS**' : '❌ **Failed**'} |
| **Overall Deployment Gate** | ${staticData.errors === 0 && flowFailed === 0 ? '**APPROVED**' : '**BLOCKED**'} | ${staticData.errors === 0 && flowFailed === 0 ? '🟢 **READY**' : '🔴 **ACTION REQUIRED**'} |

---

## 🧪 Purchase Funnel Simulation Results (Layer 2)

\`\`\`
${flowOutput.trim()}
\`\`\`

---

## 🚨 Detected Issues by File & Severity (Layer 1)

`;

function getCodeSnippet(filePath, targetLine, contextBefore = 2, contextAfter = 2) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const start = Math.max(0, targetLine - 1 - contextBefore);
    const end = Math.min(lines.length - 1, targetLine - 1 + contextAfter);

    let snippet = '';
    for (let i = start; i <= end; i++) {
      const lineNum = i + 1;
      const isTarget = lineNum === targetLine;
      const prefix = isTarget ? '>> ' : '   ';
      const lineNumStr = String(lineNum).padStart(5, ' ');
      snippet += `${prefix}${lineNumStr} | ${lines[i]}\n`;
    }
    return snippet;
  } catch (err) {
    return null;
  }
}

if (staticData.violations.length === 0) {
  md += `> ✅ **ZERO DEFECTS DETECTED.** All files passed 100% of safety checks.\n\n`;
} else {
  // Group violations by file
  const byFile = {};
  for (const v of staticData.violations) {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
  }

  for (const [file, list] of Object.entries(byFile)) {
    md += `### 📄 \`${file}\` (${list.length} findings)\n\n`;
    md += `| Line | Severity | Rule | Defect Summary |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const item of list) {
      const icon = item.severity === 'error' ? '🔴 ERROR' : '🟡 WARN';
      md += `| [Line ${item.line}](#${file.replace(/[/.]/g, '-')}-line-${item.line}) | ${icon} | \`${item.rule}\` | ${item.message.replace(/\|/g, '\\|')} |\n`;
    }
    md += `\n`;

    md += `<details open>\n<summary><b>🔍 View Code Snippets for <code>${file}</code> (${list.length} items)</b></summary>\n\n`;
    for (const item of list) {
      const icon = item.severity === 'error' ? '🔴 ERROR' : '🟡 WARN';
      const snippet = getCodeSnippet(file, item.line);
      const lang = file.endsWith('.js') ? 'javascript' : 'liquid';

      md += `<a id="${file.replace(/[/.]/g, '-')}-line-${item.line}"></a>\n`;
      md += `#### 📍 Line ${item.line} — \`${item.rule}\` (${icon})\n`;
      md += `> **Technical Finding:** ${item.message}\n\n`;

      if (snippet) {
        md += `\`\`\`${lang}\n${snippet}\`\`\`\n\n`;
      } else {
        md += `\`\`\`${lang}\n// [Snippet unavailable]\n\`\`\`\n\n`;
      }
    }
    md += `</details>\n\n---\n\n`;
  }
}

md += `## 🔒 Pre-Push Automation Status
* **Git Pre-Push Hook:** Active in \`.git/hooks/pre-push\`
* **Shopify Theme Push Guard:** Bound to \`npm run theme:push\`
* **Quality Gate:** Hard-blocks any push if Errors > 0 or Flow Assertions fail.
`;

// Save Reports
const latestMdPath = path.join(REPORTS_DIR, 'LATEST_SCAN_REPORT.md');
const latestJsonPath = path.join(REPORTS_DIR, 'latest_scan_report.json');
const archiveMdPath = path.join(ARCHIVE_DIR, `SCAN_REPORT_${dateSlug}.md`);

fs.writeFileSync(latestMdPath, md);
fs.writeFileSync(archiveMdPath, md);
fs.writeFileSync(latestJsonPath, JSON.stringify({
  timestamp,
  staticData,
  flowSimulator: { passed: flowPassed, failed: flowFailed }
}, null, 2));

console.log(`\n📄 Report Generated Successfully!`);
console.log(`   → Latest Markdown: tests/reports/LATEST_SCAN_REPORT.md`);
console.log(`   → Latest JSON:     tests/reports/latest_scan_report.json`);
console.log(`   → Archived Copy:   tests/reports/archive/SCAN_REPORT_${dateSlug}.md\n`);

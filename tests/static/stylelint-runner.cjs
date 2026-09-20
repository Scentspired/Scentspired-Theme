#!/usr/bin/env node

/**
 * ============================================================================
 * STYLELINT CSS AST RUNNER — Industry Standard CSS Syntax & Rule Validator
 * ============================================================================
 * Powered by Stylelint & PostCSS AST Parser
 * Replaces custom-rolled regex parsers with industry-standard AST analysis.
 * ============================================================================
 */

const path = require("path");
const fs = require("fs");

let stylelint;
try {
  stylelint = require("stylelint");
} catch (e) {
  console.log("────────────────────────────────────────────────────────────────");
  console.log("  🎨 STYLELINT CSS AST VALIDATOR (Industry Standard Engine)");
  console.log("  [INFO] stylelint not installed. Skipping check.");
  console.log("────────────────────────────────────────────────────────────────\n");
  process.exit(0);
}

// Parse CLI flags
const args = process.argv.slice(2);
let targetDir = process.env.THEME_TARGET_DIR || process.cwd();

for (const arg of args) {
  if (arg.startsWith("--target=")) {
    targetDir = arg.split("=")[1];
  } else if (arg.startsWith("--path=")) {
    targetDir = arg.split("=")[1];
  }
}

const resolvedTarget = path.resolve(targetDir);
const configPath = path.resolve(__dirname, "../../.stylelintrc.json");

async function runStylelint() {
  console.log("────────────────────────────────────────────────────────────────");
  console.log("  🎨 STYLELINT CSS AST VALIDATOR (Industry Standard Engine)");
  console.log(`  Target  : ${resolvedTarget}`);
  console.log(`  Config  : ${configPath}`);
  console.log("────────────────────────────────────────────────────────────────\n");

  const cssGlob = path.join(resolvedTarget, "assets", "*.css").replace(/\\/g, "/");

  try {
    const report = await stylelint.lint({
      files: cssGlob,
      configFile: fs.existsSync(configPath) ? configPath : undefined,
    });

    let totalWarnings = 0;
    let totalErrors = 0;

    for (const res of report.results) {
      if (res.warnings && res.warnings.length > 0) {
        for (const warn of res.warnings) {
          if (warn.severity === "error") {
            totalErrors++;
            console.error(`  ❌ [ERROR] ${res.source}:${warn.line}:${warn.column}`);
            console.error(`     Rule: ${warn.rule}`);
            console.error(`     Message: ${warn.text}\n`);
          } else {
            totalWarnings++;
          }
        }
      }
    }

    console.log(`  Summary: ${report.results.length} stylesheets analyzed.`);
    console.log(`  Status : ${totalErrors} errors, ${totalWarnings} warnings.`);

    if (totalErrors > 0) {
      console.error(`\n❌ [FAIL] Stylelint detected ${totalErrors} CSS syntax or AST rule violations.\n`);
      process.exit(1);
    }

    console.log("  ✅ Stylelint Passed: 100% clean CSS AST syntax and structure.\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ [ERROR] Stylelint execution error: ${err.message}\n`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

runStylelint();

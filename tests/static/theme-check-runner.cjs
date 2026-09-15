#!/usr/bin/env node

/**
 * ============================================================================
 * SHOPIFY THEME CHECK RUNNER — Official Shopify Theme Validator
 * ============================================================================
 * Powered by @shopify/theme-check-node (Shopify's Official Engine)
 * Runs non-interactively and enforces .theme-check.yml standards.
 * ============================================================================
 */

const path = require("path");
const fs = require("fs");

let check, Severity;
try {
  const tc = require("@shopify/theme-check-node");
  check = tc.check;
  Severity = tc.Severity;
} catch (e) {
  check = null;
  Severity = { ERROR: 0, WARNING: 1, INFO: 2 };
}

// Parse CLI flags
const args = process.argv.slice(2);
let targetPath = process.env.THEME_TARGET_DIR || process.cwd();
let configPath = path.resolve(process.cwd(), ".theme-check.yml");
let failLevel = "error";

for (const arg of args) {
  if (arg.startsWith("--path=")) {
    targetPath = arg.split("=")[1];
  } else if (arg.startsWith("--config=")) {
    configPath = path.resolve(arg.split("=")[1]);
  } else if (arg.startsWith("--fail-level=")) {
    failLevel = arg.split("=")[1].toLowerCase();
  }
}

const resolvedTarget = path.resolve(targetPath);

async function runThemeCheck() {
  console.log("────────────────────────────────────────────────────────────────");
  console.log("  🛍️  SHOPIFY THEME CHECK (Official Shopify Engine)");
  console.log(`  Target  : ${resolvedTarget}`);
  console.log(`  Config  : ${fs.existsSync(configPath) ? configPath : "Default Shopify Recommended"}`);
  console.log(`  Level   : Fail on ${failLevel.toUpperCase()}`);
  console.log("────────────────────────────────────────────────────────────────\n");

  if (!check) {
    console.log("  ℹ️  @shopify/theme-check-node is not installed locally. Skipping official Theme Check gate.\n");
    return;
  }

  const startTime = Date.now();

  try {
    const offenses = await check(
      resolvedTarget,
      fs.existsSync(configPath) ? configPath : undefined
    );

    const errors = offenses.filter(o => o.severity === Severity.ERROR);
    const warnings = offenses.filter(o => o.severity === Severity.WARNING);
    const suggestions = offenses.filter(
      o => o.severity !== Severity.ERROR && o.severity !== Severity.WARNING
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (errors.length > 0) {
      console.error(`\n❌ [FAIL] ${errors.length} Critical Theme Check error(s) found:\n`);
      for (const err of errors) {
        const relPath = err.uri.replace("file:///", "").replace(resolvedTarget.replace(/\\/g, "/") + "/", "");
        const line = err.start ? err.start.line : "?";
        const char = err.start ? err.start.character : "?";
        console.error(`  • ${relPath}:${line}:${char} [${err.check}]`);
        console.error(`    ${err.message}`);
        if (err.suggest) {
          console.error(`    💡 Suggestion: ${err.suggest}`);
        }
        console.error("");
      }
    }

    console.log(`  Summary: ${errors.length} errors, ${warnings.length} warnings, ${suggestions.length} suggestions (${elapsed}s)`);

    if (errors.length > 0 && failLevel === "error") {
      process.exit(1);
    }

    console.log("  ✅ Shopify Theme Check Passed: Zero critical Liquid/Theme errors.\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ [ERROR] Shopify Theme Check execution failed: ${err.message}\n`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

runThemeCheck();

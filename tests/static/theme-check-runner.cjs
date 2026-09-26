#!/usr/bin/env node

/**
 * ============================================================================
 * SHOPIFY THEME CHECK RUNNER — Official Shopify Theme Validator
 * ============================================================================
 * Powered by @shopify/theme-check-node (Shopify's Official Engine)
 * Runs non-interactively and enforces .theme-check.yml standards.
 *
 * Checks the theme at --path and, when that is this repository, every compiled
 * region under dist/: a region is what ships, and its generated snippets and
 * resolved templates exist only there.
 * ============================================================================
 */

const path = require("path");
const fs = require("fs");

let themeCheck;
try {
  themeCheck = require("@shopify/theme-check-node");
} catch (e) {
  console.log("────────────────────────────────────────────────────────────────");
  console.log("  🛍️  SHOPIFY THEME CHECK (Official Shopify Engine)");
  // A checker that is not there has not passed: it is a devDependency, so a missing one
  // means npm ci was not run, and the gate must say so instead of reporting green.
  console.log("  [FAIL] @shopify/theme-check-node is not installed. Run npm ci (it is in devDependencies).");
  console.log("────────────────────────────────────────────────────────────────\n");
  process.exit(1);
}
const { check, Severity } = themeCheck;

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
const REPO_ROOT = path.resolve(__dirname, "../..");

// The themes to check: the target, and each compiled region when the target is the repo.
function targets() {
  const list = [resolvedTarget];
  const dist = path.join(REPO_ROOT, "dist");
  if (resolvedTarget === REPO_ROOT && fs.existsSync(dist)) {
    for (const id of fs.readdirSync(dist).sort()) {
      if (fs.existsSync(path.join(dist, id, "layout", "theme.liquid"))) list.push(path.join(dist, id));
    }
  }
  return list;
}

async function checkOne(themeRoot) {
  const offenses = await check(themeRoot, fs.existsSync(configPath) ? configPath : undefined);
  const errors = offenses.filter((o) => o.severity === Severity.ERROR);
  const warnings = offenses.filter((o) => o.severity === Severity.WARNING);
  const label = path.relative(REPO_ROOT, themeRoot) || "core";
  for (const err of errors) {
    const rel = decodeURIComponent(err.uri.replace(/^file:\/\/\/?/, "")).replace(/\\/g, "/").replace(themeRoot.replace(/\\/g, "/") + "/", "");
    const line = err.start ? err.start.line + 1 : "?";
    console.error(`  ❌ [${label}] ${rel}:${line} [${err.check}]`);
    console.error(`     ${err.message}\n`);
  }
  console.log(`  ${label.padEnd(10)} ${errors.length} errors, ${warnings.length} warnings`);
  return errors.length;
}

async function runThemeCheck() {
  console.log("────────────────────────────────────────────────────────────────");
  console.log("  🛍️  SHOPIFY THEME CHECK (Official Shopify Engine)");
  console.log(`  Config  : ${fs.existsSync(configPath) ? configPath : "Default Shopify Recommended"}`);
  console.log(`  Level   : Fail on ${failLevel.toUpperCase()}`);
  console.log("────────────────────────────────────────────────────────────────\n");

  const startTime = Date.now();
  try {
    let errors = 0;
    for (const t of targets()) errors += await checkOne(t);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n  Summary: ${errors} errors (${elapsed}s)`);
    if (errors > 0 && failLevel === "error") {
      console.error(`\n❌ [FAIL] ${errors} Theme Check error(s).\n`);
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

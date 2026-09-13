#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Universal CLI Quality Gate Runner
 * ============================================================================
 *
 * Centralized, multi-store quality gate execution engine for Scentspired.
 * Evaluates any target Shopify theme directory across all 7 Quality Gate layers.
 *
 * Usage:
 *   node runner.cjs --target=/path/to/theme
 *   node runner.cjs --target=../Scentspired-USA
 *   node runner.cjs --target=../Scentspired-UK
 *   THEME_TARGET_DIR=../Scentspired-USA node runner.cjs
 *
 * Exit codes:
 *   0 = 100% Quality Gate Passed (Zero Errors, Zero Regressions)
 *   1 = Quality Gate Failed (Deployment Strictly Blocked)
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// Parse CLI Arguments
const args = process.argv.slice(2);
let targetDir = process.env.THEME_TARGET_DIR || null;
let scope = null;

for (const arg of args) {
  if (arg.startsWith("--target=")) {
    targetDir = arg.split("=")[1];
  } else if (arg.startsWith("--target-dir=")) {
    targetDir = arg.split("=")[1];
  } else if (arg === "--target" && args[args.indexOf(arg) + 1]) {
    targetDir = args[args.indexOf(arg) + 1];
  } else if (arg.startsWith("--scope=")) {
    scope = arg.split("=")[1].toLowerCase();
  }
}

if (!targetDir) {
  // Default to current working directory
  targetDir = process.cwd();
}

const resolvedTarget = path.resolve(targetDir);

// Auto-detect scope if not explicitly passed
if (!scope) {
  if (resolvedTarget.toLowerCase().includes("usa")) {
    scope = "usa";
  } else if (resolvedTarget.toLowerCase().includes("uk")) {
    scope = "uk";
  } else {
    scope = "core";
  }
}

if (!fs.existsSync(resolvedTarget)) {
  console.error(`\n[FATAL] Specified theme target directory does not exist: ${resolvedTarget}\n`);
  process.exit(1);
}

// Ensure theme elements exist
const hasThemeFiles = ["layout", "sections", "snippets", "assets", "templates"].some(dir =>
  fs.existsSync(path.join(resolvedTarget, dir))
);

if (!hasThemeFiles) {
  console.error(
    `\n[FATAL] Target directory does not appear to be a valid Shopify theme: ${resolvedTarget}\n`
  );
  console.error("Expected at least one of: layout/, sections/, snippets/, assets/, templates/\n");
  process.exit(1);
}

// Export target path to child processes
process.env.THEME_TARGET_DIR = resolvedTarget;

const GUARDIAN_ROOT = __dirname;
const TESTS_DIR = path.join(GUARDIAN_ROOT, "tests");

console.log("");
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║   SCENTSPIRED THEME GUARDIAN — MASTER QUALITY GATE           ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log(`  Target Theme : ${resolvedTarget}`);
console.log(`  Engine Root  : ${GUARDIAN_ROOT}`);
console.log(`  Scope        : ${scope.toUpperCase()}`);
console.log(`  Timestamp    : ${new Date().toISOString()}`);
console.log("────────────────────────────────────────────────────────────────");

// Regional Scope Fast-Path
if (scope === "usa") {
  const usaSuite = path.join(TESTS_DIR, "regions", "usa", "regional-test-suite.cjs");
  const res = spawnSync("node", [usaSuite], { stdio: "inherit", cwd: GUARDIAN_ROOT });
  process.exit(res.status);
}

if (scope === "uk") {
  const ukSuite = path.join(TESTS_DIR, "regions", "uk", "regional-test-suite.cjs");
  const res = spawnSync("node", [ukSuite], { stdio: "inherit", cwd: GUARDIAN_ROOT });
  process.exit(res.status);
}

// Core Engine Layers
const CORE_LAYERS = [
  {
    name: "Layer 1: Prettier & Liquid Formatting Gate",
    cmd: "npx",
    args: ["--yes", "prettier", "--check", `${resolvedTarget}/**/*.{liquid,json,js,css}`],
    optional: true,
    failMsg: "Liquid formatting inconsistencies detected",
  },
  {
    name: "Layer 2: AST JavaScript & Script Block Compiler",
    cmd: "node",
    args: [path.join(TESTS_DIR, "static", "syntax-validator.cjs")],
    failMsg: "JavaScript AST syntax errors found",
  },
  {
    name: "Layer 3: Theme Guardian Static Code Analysis",
    cmd: "node",
    args: [path.join(TESTS_DIR, "static", "static-analysis.cjs")],
    failMsg: "Static analysis rule violations detected",
  },
  {
    name: "Layer 4: Storefront Critical Funnel Simulator",
    cmd: "node",
    args: [path.join(TESTS_DIR, "dynamic", "critical-flow-simulator.cjs")],
    failMsg: "Critical purchase funnel simulations failed",
  },
  {
    name: "Layer 5: Chaos, Fuzzing & Concurrency Engine",
    cmd: "node",
    args: [path.join(TESTS_DIR, "dynamic", "chaos-simulation-tests.cjs")],
    failMsg: "Chaos & fuzzing assertions failed",
  },
  {
    name: "Layer 6: Clarity & Sentry Crash Defense Verification",
    cmd: "node",
    args: [path.join(TESTS_DIR, "dynamic", "verify-clarity-detection.cjs")],
    failMsg: "Historical crash defense verification failed",
  },
  {
    name: "Layer 7: Automated Master Scan Report Generator",
    cmd: "node",
    args: [path.join(TESTS_DIR, "reporting", "generate-report.cjs")],
    failMsg: "Report generation failed",
  },
  {
    name: "Layer 8: JSON Template & Schema Validator",
    cmd: "node",
    args: [path.join(TESTS_DIR, "static", "json-schema-validator.cjs")],
    failMsg: "JSON template or schema inconsistencies detected",
  },
  {
    name: "Layer 9: Localization Key Integrity Linter",
    cmd: "node",
    args: [path.join(TESTS_DIR, "static", "locale-integrity-validator.cjs")],
    failMsg: "Localization translation key check failed",
  },
  {
    name: "Layer 10: Asset & Snippet Physical Integrity Linter",
    cmd: "node",
    args: [path.join(TESTS_DIR, "static", "asset-snippet-integrity.cjs")],
    failMsg: "Referenced asset or snippet missing from disk",
  },
  {
    name: "Layer 11: Asset Performance & Size Budget Guard",
    cmd: "node",
    args: [path.join(TESTS_DIR, "static", "asset-size-budget-guard.cjs")],
    failMsg: "Asset file size exceeded performance budget",
  },
];

let totalPassed = 0;
let totalFailed = 0;
const startTime = Date.now();

for (let i = 0; i < CORE_LAYERS.length; i++) {
  const layer = CORE_LAYERS[i];
  console.log(`\n>>> RUNNING [${i + 1}/${CORE_LAYERS.length}]: ${layer.name}...`);

  const result = spawnSync(layer.cmd, layer.args, {
    stdio: "inherit",
    env: { ...process.env, THEME_TARGET_DIR: resolvedTarget },
    cwd: GUARDIAN_ROOT,
  });

  if (result.status !== 0) {
    if (layer.optional) {
      console.log(`\n[WARN] ${layer.name} non-zero exit, continuing...`);
    } else {
      console.error(`\n❌ [FAILED] ${layer.name}: ${layer.failMsg}`);
      totalFailed++;
      break;
    }
  } else {
    totalPassed++;
  }
}

// If scope is ALL, also run USA and UK suites
if (totalFailed === 0 && scope === "all") {
  console.log("\n==================================================================");
  console.log("   🌐 RUNNING REGIONAL TEST SUITES (USA & UK)");
  console.log("==================================================================");

  const usaSuite = path.join(TESTS_DIR, "regions", "usa", "regional-test-suite.cjs");
  const ukSuite = path.join(TESTS_DIR, "regions", "uk", "regional-test-suite.cjs");

  const usaRes = spawnSync("node", [usaSuite], { stdio: "inherit", cwd: GUARDIAN_ROOT });
  if (usaRes.status !== 0) {
    totalFailed++;
  }

  const ukRes = spawnSync("node", [ukSuite], { stdio: "inherit", cwd: GUARDIAN_ROOT });
  if (ukRes.status !== 0) {
    totalFailed++;
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

if (totalFailed === 0) {
  console.log("\n==================================================================");
  console.log(`   ✅ ALL QUALITY GATES PASSED (100% CLEAN & SECURE) — ${duration}s`);
  console.log("   🚀 APPROVED FOR LIVE PRODUCTION DEPLOYMENT");
  console.log("==================================================================\n");
  process.exit(0);
} else {
  console.error("\n==================================================================");
  console.error(`   ❌ QUALITY GATE FAILED (${totalFailed} errors) — ${duration}s`);
  console.error("   🚫 DEPLOYMENT STRICTLY BLOCKED");
  console.error("==================================================================\n");
  process.exit(1);
}

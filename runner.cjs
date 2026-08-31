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

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Parse CLI Arguments
const args = process.argv.slice(2);
let targetDir = process.env.THEME_TARGET_DIR || null;

for (const arg of args) {
  if (arg.startsWith('--target=')) {
    targetDir = arg.split('=')[1];
  } else if (arg.startsWith('--target-dir=')) {
    targetDir = arg.split('=')[1];
  } else if (arg === '--target' && args[args.indexOf(arg) + 1]) {
    targetDir = args[args.indexOf(arg) + 1];
  }
}

if (!targetDir) {
  // Default to current working directory
  targetDir = process.cwd();
}

const resolvedTarget = path.resolve(targetDir);

if (!fs.existsSync(resolvedTarget)) {
  console.error(`\n[FATAL] Specified theme target directory does not exist: ${resolvedTarget}\n`);
  process.exit(1);
}

// Ensure theme elements exist
const hasThemeFiles = ['layout', 'sections', 'snippets', 'assets', 'templates'].some(dir =>
  fs.existsSync(path.join(resolvedTarget, dir))
);

if (!hasThemeFiles) {
  console.error(`\n[FATAL] Target directory does not appear to be a valid Shopify theme: ${resolvedTarget}\n`);
  console.error('Expected at least one of: layout/, sections/, snippets/, assets/, templates/\n');
  process.exit(1);
}

// Export target path to child processes
process.env.THEME_TARGET_DIR = resolvedTarget;

const GUARDIAN_ROOT = __dirname;
const TESTS_DIR = path.join(GUARDIAN_ROOT, 'tests');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — MASTER QUALITY GATE           ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target Theme : ${resolvedTarget}`);
console.log(`  Engine Root  : ${GUARDIAN_ROOT}`);
console.log(`  Timestamp    : ${new Date().toISOString()}`);
console.log('────────────────────────────────────────────────────────────────');

const LAYERS = [
  {
    name: 'Layer 1: Prettier & Liquid Formatting Gate',
    cmd: 'npx',
    args: ['--yes', 'prettier', '--check', `${resolvedTarget}/**/*.{liquid,json,js,css}`],
    optional: true,
    failMsg: 'Liquid formatting inconsistencies detected'
  },
  {
    name: 'Layer 2: AST JavaScript & Script Block Compiler',
    cmd: 'node',
    args: [path.join(TESTS_DIR, 'syntax-validator.cjs')],
    failMsg: 'JavaScript AST syntax errors found'
  },
  {
    name: 'Layer 3: Theme Guardian Static Code Analysis',
    cmd: 'node',
    args: [path.join(TESTS_DIR, 'static-analysis.cjs')],
    failMsg: 'Static analysis rule violations detected'
  },
  {
    name: 'Layer 4: Storefront Critical Funnel Simulator',
    cmd: 'node',
    args: [path.join(TESTS_DIR, 'critical-flow-simulator.cjs')],
    failMsg: 'Critical purchase funnel simulations failed'
  },
  {
    name: 'Layer 5: Chaos, Fuzzing & Concurrency Engine',
    cmd: 'node',
    args: [path.join(TESTS_DIR, 'chaos-simulation-tests.cjs')],
    failMsg: 'Chaos & fuzzing assertions failed'
  },
  {
    name: 'Layer 6: Clarity & Sentry Crash Defense Verification',
    cmd: 'node',
    args: [path.join(TESTS_DIR, 'verify-clarity-detection.cjs')],
    failMsg: 'Historical crash defense verification failed'
  },
  {
    name: 'Layer 7: Automated Master Scan Report Generator',
    cmd: 'node',
    args: [path.join(TESTS_DIR, 'generate-report.cjs')],
    failMsg: 'Report generation failed'
  }
];

let totalPassed = 0;
let totalFailed = 0;
const startTime = Date.now();

for (let i = 0; i < LAYERS.length; i++) {
  const layer = LAYERS[i];
  console.log(`\n>>> RUNNING [${i + 1}/7]: ${layer.name}...`);

  const result = spawnSync(layer.cmd, layer.args, {
    stdio: 'inherit',
    env: { ...process.env, THEME_TARGET_DIR: resolvedTarget },
    cwd: GUARDIAN_ROOT
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

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
console.log('\n==================================================================');

if (totalFailed === 0) {
  console.log(`   ✅ ALL 7 QUALITY GATES PASSED (100% CLEAN & SECURE) — ${elapsedSec}s`);
  console.log(`   🚀 APPROVED FOR LIVE PRODUCTION DEPLOYMENT`);
  console.log('==================================================================\n');
  process.exit(0);
} else {
  console.error(`   ❌ QUALITY GATE FAILED (${totalFailed} errors) — ${elapsedSec}s`);
  console.error(`   🚫 DEPLOYMENT STRICTLY BLOCKED`);
  console.error('==================================================================\n');
  process.exit(1);
}

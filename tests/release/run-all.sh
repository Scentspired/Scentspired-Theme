#!/usr/bin/env bash

# ============================================================================
# SCENTSPIRED THEME GUARDIAN — 7-Layer Master Quality Gate & Test Runner
# ============================================================================
# 
# Runs all 7 detection, verification, and simulation layers:
#   Layer 1: Static Code Vulnerability Scanner (AST/Regex rule analyzer)
#   Layer 2: JavaScript & Liquid Script AST Syntax Engine (Node vm.Script compiler)
#   Layer 3: Critical Purchase Flow Simulator (Suites A-T E2E journeys)
#   Layer 4: Deep Component & Logic Integration Suite (Suites U-AD)
#   Layer 5: Chaos, Fuzzing & Edge-Case Simulator (Suites AE-AJ)
#   Layer 6: Clarity & Sentry Historical Crash Defense Verifier
#   Layer 7: Automated Master Scan Report Generator
#
# Usage:
#   npm test
#   bash tests/run-all.sh
#   bash tests/run-all.sh --skip-scanner
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$TESTS_DIR/.." && pwd)"

echo ""
echo "=================================================================="
echo "   🛡️  SCENTSPIRED THEME GUARDIAN: 7-LAYER ULTRA QUALITY GATE"
echo "=================================================================="
echo ""

EXIT_CODE=0

# ── LAYER 1: Static Code Scanner ───────────────────────────────────────────
if [[ "$*" != *"--skip-scanner"* ]]; then
  echo ">>> RUNNING LAYER 1: Static Code Vulnerability Scanner..."
  node "$TESTS_DIR/static/static-analysis.cjs" || EXIT_CODE=$?
else
  echo ">>> LAYER 1: Skipped (--skip-scanner)"
fi

echo ""

# ── LAYER 2: JavaScript & Liquid Script AST Syntax Engine ──────────────────
echo ">>> RUNNING LAYER 2: JavaScript & Liquid Script AST Syntax Engine..."
node "$TESTS_DIR/static/syntax-validator.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 3: Critical Flow Simulator ───────────────────────────────────────
echo ">>> RUNNING LAYER 3: Critical Purchase Flow Simulator (Suites A-U)..."
node "$TESTS_DIR/dynamic/critical-flow-simulator.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 4: Deep Component & Logic Integration Suite ──────────────────────
echo ">>> RUNNING LAYER 4: Deep Logic & Component Integration Suite (Suites U-AD)..."
node "$TESTS_DIR/dynamic/rigorous-integration-tests.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 5: Chaos, Fuzzing & Edge-Case Simulator ──────────────────────────
echo ">>> RUNNING LAYER 5: Chaos, Fuzzing & Edge-Case Simulator (Suites AE-AJ)..."
node "$TESTS_DIR/dynamic/chaos-simulation-tests.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 6: Clarity Historical Detection Verifier ─────────────────────────
echo ">>> RUNNING LAYER 6: Clarity & Sentry Historical Crash Defense..."
node "$TESTS_DIR/dynamic/verify-clarity-detection.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 7: GENERATE AUTOMATED REPORT ─────────────────────────────────────
echo ">>> RUNNING LAYER 7: Generating Automated Master Scan Report..."
node "$TESTS_DIR/reporting/generate-report.cjs" || true

echo ""
echo "=================================================================="
if [ $EXIT_CODE -eq 0 ]; then
  echo "   ✅ ALL 7 QUALITY GATES PASSED (100% CLEAN & SECURE)"
else
  echo "   ❌ VIOLATIONS / ANOMALIES DETECTED — DEPLOYMENT BLOCKED"
  echo "   📄 Review report: tests/reporting/reports/LATEST_SCAN_REPORT.md"
fi
echo "=================================================================="
echo ""

exit $EXIT_CODE

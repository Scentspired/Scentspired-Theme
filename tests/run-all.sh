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
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "=================================================================="
echo "   🛡️  SCENTSPIRED THEME GUARDIAN: 7-LAYER ULTRA QUALITY GATE"
echo "=================================================================="
echo ""

EXIT_CODE=0

# ── LAYER 1: Static Code Scanner ───────────────────────────────────────────
if [[ "$*" != *"--skip-scanner"* ]]; then
  echo ">>> RUNNING LAYER 1: Static Code Vulnerability Scanner..."
  node "$SCRIPT_DIR/static-analysis.cjs" || EXIT_CODE=$?
else
  echo ">>> LAYER 1: Skipped (--skip-scanner)"
fi

echo ""

# ── LAYER 2: JavaScript & Liquid Script AST Syntax Engine ──────────────────
echo ">>> RUNNING LAYER 2: JavaScript & Liquid Script AST Syntax Engine..."
node "$SCRIPT_DIR/syntax-validator.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 3: Critical Flow Simulator ───────────────────────────────────────
echo ">>> RUNNING LAYER 3: Critical Purchase Flow Simulator (Suites A-T)..."
node "$SCRIPT_DIR/critical-flow-simulator.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 4: Deep Component & Logic Integration Suite ──────────────────────
echo ">>> RUNNING LAYER 4: Deep Logic & Component Integration Suite (Suites U-AD)..."
node "$SCRIPT_DIR/rigorous-integration-tests.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 5: Chaos, Fuzzing & Edge-Case Simulator ──────────────────────────
echo ">>> RUNNING LAYER 5: Chaos, Fuzzing & Edge-Case Simulator (Suites AE-AJ)..."
node "$SCRIPT_DIR/chaos-simulation-tests.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 6: Clarity Historical Detection Verifier ─────────────────────────
echo ">>> RUNNING LAYER 6: Clarity & Sentry Historical Crash Defense..."
node "$SCRIPT_DIR/verify-clarity-detection.cjs" || EXIT_CODE=$?

echo ""

# ── LAYER 7: GENERATE AUTOMATED REPORT ─────────────────────────────────────
echo ">>> RUNNING LAYER 7: Generating Automated Master Scan Report..."
node "$SCRIPT_DIR/generate-report.cjs" || true

echo ""
echo "=================================================================="
if [ $EXIT_CODE -eq 0 ]; then
  echo "   ✅ ALL 7 QUALITY GATES PASSED (100% CLEAN & SECURE)"
else
  echo "   ❌ VIOLATIONS / ANOMALIES DETECTED — DEPLOYMENT BLOCKED"
  echo "   📄 Review report: tests/reports/LATEST_SCAN_REPORT.md"
fi
echo "=================================================================="
echo ""

exit $EXIT_CODE

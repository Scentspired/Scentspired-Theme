#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Testing Toggle Controller
 * ============================================================================
 * Controls the master switch in tests/config/test-settings.json:
 *   node scripts/toggle-testing.cjs --on      Turn all testing ON
 *   node scripts/toggle-testing.cjs --off     Turn all testing OFF (Acceleration Mode)
 *   node scripts/toggle-testing.cjs --toggle  Toggle between ON and OFF
 *   node scripts/toggle-testing.cjs --status  Display current test state
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.resolve(__dirname, "../tests/config/test-settings.json");

const args = process.argv.slice(2);
const isTurnOn = args.includes("--on") || args.includes("on") || args.includes("--enable");
const isTurnOff = args.includes("--off") || args.includes("off") || args.includes("--disable");
const isToggle = args.includes("--toggle") || args.includes("toggle");

let settings = {
  testing_enabled: false,
  description: "Master switch to turn all testing and quality gates ON or OFF across Theme Guardian, git hooks, and runner.",
  git_hook_enforcement: false,
  runner_enforcement: false,
  skip_layers: [],
  updated_at: new Date().toISOString()
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    settings = { ...settings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")) };
  } catch (e) {
    console.warn(`[WARN] Could not parse existing ${SETTINGS_FILE}: ${e.message}`);
  }
}

if (isTurnOn) {
  settings.testing_enabled = true;
  settings.git_hook_enforcement = true;
  settings.runner_enforcement = true;
  settings.updated_at = new Date().toISOString();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║    🟢 TESTING IS NOW TURNED ON (ALL GATES ENFORCED)          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Target Config : ${SETTINGS_FILE}`);
  console.log(`  Quality Gates : STRICT ACTIVE (Pre-push hooks & runner enabled)`);
  console.log(`  Timestamp     : ${settings.updated_at}\n`);
} else if (isTurnOff) {
  settings.testing_enabled = false;
  settings.git_hook_enforcement = false;
  settings.runner_enforcement = false;
  settings.updated_at = new Date().toISOString();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║    🟡 TESTING IS NOW TURNED OFF (ACCELERATION MODE)          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Target Config : ${SETTINGS_FILE}`);
  console.log(`  Quality Gates : BYPASS ACTIVE (Pre-push hooks & runner bypassed)`);
  console.log(`  Timestamp     : ${settings.updated_at}\n`);
} else if (isToggle) {
  settings.testing_enabled = !settings.testing_enabled;
  settings.git_hook_enforcement = settings.testing_enabled;
  settings.runner_enforcement = settings.testing_enabled;
  settings.updated_at = new Date().toISOString();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
  const stateLabel = settings.testing_enabled
    ? "🟢 ON (STRICT GATES)"
    : "🟡 OFF (ACCELERATION MODE)";
  console.log(`\n🔄 [TESTING CONTROL] Toggled state to: ${stateLabel}`);
  console.log(`   Config saved to: ${SETTINGS_FILE}\n`);
} else {
  // Status mode
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║         SCENTSPIRED THEME GUARDIAN — TESTING STATUS          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(
    `  Master Switch : ${settings.testing_enabled ? "🟢 ON (All Testing Enforced)" : "🟡 OFF (Acceleration Mode Active)"}`
  );
  console.log(`  Config File   : ${SETTINGS_FILE}`);
  console.log(`  Last Updated  : ${settings.updated_at || "N/A"}`);
  console.log("────────────────────────────────────────────────────────────────\n");
}

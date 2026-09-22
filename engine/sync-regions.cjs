#!/usr/bin/env node
/**
 * Scentspired SSOT Theme Synchronization Engine
 * Projects core theme engine code and regional packages from
 * Scentspired-Theme (Single Source of Truth) down to regional stores (USA, UK),
 * or pulls live regional changes back into SSOT.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const THEME_ROOT = path.resolve(SCRIPT_DIR, '..');
const CONFIG_PATH = path.join(SCRIPT_DIR, 'sync-config.json');

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isPull = args.includes('--pull');
const skipPush = args.includes('--skip-push');
const skipTests = args.includes('--skip-tests');
const targetArg = args.find(a => a.startsWith('--target='));
const targetRegion = targetArg ? targetArg.split('=')[1].toLowerCase() : null;

// Read config
if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`❌ Configuration file not found: ${CONFIG_PATH}`);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Helper: Run shell command
function run(cmd, cwd = THEME_ROOT, silent = false) {
  try {
    return execSync(cmd, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      env: { ...process.env, SCENTSPIRED_SYNC_ENGINE: '1', ALLOW_UAE_LIVE_SYNC: '1' }
    });
  } catch (err) {
    if (!silent) {
      console.error(`❌ Command failed: ${cmd} in ${cwd}`);
    }
    throw err;
  }
}

function runSilent(cmd, cwd = THEME_ROOT) {
  try {
    return execSync(cmd, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, SCENTSPIRED_SYNC_ENGINE: '1', ALLOW_UAE_LIVE_SYNC: '1' }
    }).trim();
  } catch {
    return '';
  }
}

// Helper: Recursively get all files
function getAllFiles(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

// Helper: Check if relative path is protected
function isProtected(relPath, protectedPatterns) {
  const norm = relPath.replace(/\\/g, '/');
  for (const pattern of protectedPatterns) {
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3);
      if (norm.startsWith(prefix)) return true;
    } else if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (norm.endsWith(ext)) return true;
    } else if (norm === pattern) {
      return true;
    }
  }
  return false;
}

// Helper: Sync single file
function syncFile(srcFile, destFile, dryRun = false) {
  let changed = false;
  let isNew = false;
  if (!fs.existsSync(destFile)) {
    isNew = true;
    changed = true;
  } else {
    const srcBuf = fs.readFileSync(srcFile);
    const destBuf = fs.readFileSync(destFile);
    if (!srcBuf.equals(destBuf)) {
      changed = true;
    }
  }
  if (changed && !dryRun) {
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(srcFile, destFile);
  }
  return { changed, isNew };
}

// Helper: Sync directory tree
function syncDirectory(srcDir, destDir, dryRun = false) {
  let added = 0, updated = 0;
  if (!fs.existsSync(srcDir)) return { added, updated };
  if (!fs.existsSync(destDir) && !dryRun) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const srcFiles = getAllFiles(srcDir);
  for (const relFile of srcFiles) {
    const srcFile = path.join(srcDir, relFile);
    const destFile = path.join(destDir, relFile);
    const res = syncFile(srcFile, destFile, dryRun);
    if (res.isNew) added++;
    else if (res.changed) updated++;
  }

  return { added, updated };
}

// Determine active targets (defaults to UAE for live push operations)
const activeTargetRegion = targetRegion || (isPull ? null : (config.defaultTarget || 'uae'));

// 🔒 STRICT ZERO-PUSH GUARANTEE FOR UK AND USA
if (!isPull && !skipPush && !isDryRun) {
  if (targetRegion === 'uk' || targetRegion === 'usa') {
    console.error('\n🚨 ==============================================================');
    console.error(`🚨 FATAL SAFETY VIOLATION: Target '${targetRegion.toUpperCase()}' is in PERMANENT DEPLOYMENT LOCKDOWN.`);
    console.error('🚨 ZERO-PUSH POLICY: Pushing to UK or USA live stores is strictly forbidden.');
    console.error('🚨 Only the UAE storefront is authorized for live updates.');
    console.error('🚨 ==============================================================\n');
    process.exit(1);
  }
}

// Filter targets
const targets = config.downstreamTargets.filter(t => {
  if (!activeTargetRegion) return true;
  return t.id === activeTargetRegion || t.name.toLowerCase().includes(activeTargetRegion);
});

if (targets.length === 0) {
  console.error(`❌ No downstream target found matching: ${activeTargetRegion || targetRegion}`);
  process.exit(1);
}

// STRICT LOCKDOWN POLICY: pull-only targets are live storefronts kept as
// read-only reference. They may be read from, never written to.
if (!isPull) {
  const locked = targets.filter(t => t.mode === 'pull-only');
  if (locked.length > 0) {
    console.error(`\n🚫 [LOCKED] ${locked.map(t => t.name).join(', ')} is pull-only (live storefront).`);
    console.error(`   Push refused. Use --pull to read its regional payload into regions/<id>/.\n`);
    process.exit(1);
  }
}

// ==================================================================
// MODE 1: PULL MODE (Downstream Live Store -> SSOT regions/)
// ==================================================================
if (isPull) {
  console.log('\n==================================================================');
  console.log('   📥 SCENTSPIRED REGIONAL THEME PULL (Downstream -> SSOT)');
  console.log('==================================================================');
  console.log(`  Mode:        ${isDryRun ? '🔍 DRY RUN (Simulating)' : '⚡ LIVE PULL'}`);
  console.log(`  Destination: ${path.join(THEME_ROOT, 'regions')}`);
  console.log(`  Target:      ${targetRegion ? targetRegion.toUpperCase() : 'ALL REGIONS'}`);
  console.log('------------------------------------------------------------------\n');

  const pullSummary = [];

  for (const target of targets) {
    const targetPath = path.resolve(THEME_ROOT, target.path);
    const localRegionDir = path.join(THEME_ROOT, 'regions', target.id);
    console.log(`>>> Pulling regional package from ${target.name} into regions/${target.id}...`);

    if (!fs.existsSync(targetPath)) {
      console.error(`⚠️  Target directory not found: ${targetPath}. Skipping.`);
      continue;
    }

    let pulledTemplates = syncDirectory(path.join(targetPath, 'templates'), path.join(localRegionDir, 'templates'), isDryRun);
    let pulledLocales = syncDirectory(path.join(targetPath, 'locales'), path.join(localRegionDir, 'locales'), isDryRun);

    let pulledSettings = 0;
    for (const confFile of ['settings_data.json', 'markets.json']) {
      const srcSettings = path.join(targetPath, 'config', confFile);
      const destSettings = path.join(localRegionDir, 'config', confFile);
      if (fs.existsSync(srcSettings)) {
        const res = syncFile(srcSettings, destSettings, isDryRun);
        if (res.changed) pulledSettings++;
      }
    }

    console.log(`  Templates: ${pulledTemplates.added} added, ${pulledTemplates.updated} updated`);
    console.log(`  Locales:   ${pulledLocales.added} added, ${pulledLocales.updated} updated`);
    console.log(`  Config:    ${pulledSettings} updated\n`);

    pullSummary.push({
      region: target.id.toUpperCase(),
      templatesChanged: pulledTemplates.added + pulledTemplates.updated,
      localesChanged: pulledLocales.added + pulledLocales.updated,
      settingsUpdated: pulledSettings > 0
    });
  }

  console.log('==================================================================');
  console.log('   🎉 REGIONAL PULL COMPLETE');
  console.log('==================================================================');
  console.table(pullSummary);
  console.log('==================================================================\n');
  process.exit(0);
}

// ==================================================================
// MODE 2: PUSH MODE (SSOT Core & Regional -> Downstream Targets)
// ==================================================================
console.log('\n==================================================================');
console.log('   🚀 SCENTSPIRED SSOT THEME SYNCHRONIZATION ENGINE');
console.log('==================================================================');
console.log(`  Mode:        ${isDryRun ? '🔍 DRY RUN (Simulating, no disk writes)' : '⚡ LIVE SYNCHRONIZATION'}`);
console.log(`  Source SSOT: ${THEME_ROOT}`);
console.log(`  Skip Push:   ${skipPush}`);
console.log(`  Target:      ${targetRegion ? targetRegion.toUpperCase() : 'ALL REGIONS'}`);
console.log('------------------------------------------------------------------\n');

// 1. Get Upstream Commit Hash
const upstreamCommit = runSilent('git rev-parse --short HEAD', THEME_ROOT) || 'unknown';
const upstreamBranch = runSilent('git rev-parse --abbrev-ref HEAD', THEME_ROOT) || 'develop';
console.log(`📌 Upstream State: Branch '${upstreamBranch}' @ ${upstreamCommit}\n`);

// 2. Run Quality Gates on Core Theme (if not skipped)
if (!skipTests && !isDryRun) {
  console.log('>>> [1/4] Running Comprehensive Quality Gates on All Scopes (Core, USA, UK)...');
  try {
    run('node runner.cjs --scope=all', THEME_ROOT);
    console.log('✅ All Core & Regional Quality Gates passed.\n');
  } catch (e) {
    console.error('❌ Core Theme Quality Gates failed. Synchronization aborted.');
    process.exit(1);
  }
} else {
  console.log('⏭️  Skipping Theme Guardian pre-checks (--skip-tests or --dry-run).\n');
}

const summary = [];

// 3. Process each downstream target
for (const target of targets) {
  const targetPath = path.resolve(THEME_ROOT, target.path);
  console.log(`==================================================================`);
  console.log(`  📦 Synchronizing target: ${target.name} (${targetPath})`);
  console.log(`==================================================================`);

  if (!fs.existsSync(targetPath)) {
    console.error(`⚠️  Target directory not found: ${targetPath}. Skipping.`);
    continue;
  }

  // 🔒 HARD LOCKDOWN ENFORCEMENT: Never write or push to locked/read-only targets in push mode
  if (!isPull && (target.locked || target.readOnly || target.pushDisabled || target.id === 'uk' || target.id === 'usa')) {
    if (!skipPush && !isDryRun) {
      console.log(`\n🔒 [LOCKED] ${target.name} is in strict READ-ONLY lockdown. Zero-push policy enforced.`);
      summary.push({
        target: target.name,
        added: 0,
        updated: 0,
        pruned: 0,
        commit: 'LOCKED (READ-ONLY MIRROR)'
      });
      continue;
    }
  }

  let updatedCount = 0;
  let addedCount = 0;
  let prunedCount = 0;

  // A. Synchronize Core Directories
  for (const syncDir of config.coreSyncDirs) {
    const srcDir = path.join(THEME_ROOT, syncDir);
    const destDir = path.join(targetPath, syncDir);

    if (!fs.existsSync(srcDir)) continue;
    if (!fs.existsSync(destDir)) {
      if (!isDryRun) fs.mkdirSync(destDir, { recursive: true });
    }

    const srcFiles = getAllFiles(srcDir);
    const destFiles = getAllFiles(destDir);

    // Copy / update files from source to dest
    for (const relFile of srcFiles) {
      const fullRelPath = path.join(syncDir, relFile);
      if (isProtected(fullRelPath, config.protectedRegionalPatterns)) {
        continue;
      }

      const srcFile = path.join(srcDir, relFile);
      const destFile = path.join(destDir, relFile);

      let needsCopy = false;
      if (!fs.existsSync(destFile)) {
        needsCopy = true;
        addedCount++;
      } else {
        const srcBuf = fs.readFileSync(srcFile);
        const destBuf = fs.readFileSync(destFile);
        if (!srcBuf.equals(destBuf)) {
          needsCopy = true;
          updatedCount++;
        }
      }

      if (needsCopy) {
        if (!isDryRun) {
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
          fs.copyFileSync(srcFile, destFile);
        }
        console.log(`  + [${needsCopy ? 'SYNC' : 'KEEP'}] ${fullRelPath}`);
      }
    }

    // Prune files in destination that no longer exist in source
    for (const relFile of destFiles) {
      const fullRelPath = path.join(syncDir, relFile);
      if (isProtected(fullRelPath, config.protectedRegionalPatterns)) {
        continue;
      }

      const srcFile = path.join(srcDir, relFile);
      const destFile = path.join(destDir, relFile);

      if (!fs.existsSync(srcFile)) {
        prunedCount++;
        if (!isDryRun) {
          fs.unlinkSync(destFile);
        }
        console.log(`  - [PRUNE] ${fullRelPath}`);
      }
    }
  }

  // B. Synchronize Regional Package from SSOT regions/<id>/
  const localRegionDir = path.join(THEME_ROOT, 'regions', target.id);
  if (fs.existsSync(localRegionDir)) {
    const regionalDirs = ['templates', 'locales', 'snippets'];
    for (const rDir of regionalDirs) {
      const srcDir = path.join(localRegionDir, rDir);
      const destDir = path.join(targetPath, rDir);
      const stats = syncDirectory(srcDir, destDir, isDryRun);
      addedCount += stats.added;
      updatedCount += stats.updated;
    }

    for (const confFile of ['settings_data.json', 'markets.json']) {
      const srcSettings = path.join(localRegionDir, 'config', confFile);
      const destSettings = path.join(targetPath, 'config', confFile);
      if (fs.existsSync(srcSettings)) {
        const res = syncFile(srcSettings, destSettings, isDryRun);
        if (res.isNew) addedCount++;
        else if (res.changed) updatedCount++;
      }
    }
  }

  // 4. Update sync metadata in target repo
  if (!isDryRun) {
    const metaPath = path.join(targetPath, '.upstream-sync-metadata.json');
    const metadata = {
      upstreamSource: config.upstreamName,
      upstreamCommit,
      syncedAt: new Date().toISOString(),
      stats: {
        added: addedCount,
        updated: updatedCount,
        pruned: prunedCount
      }
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2) + '\n');
  }

  console.log(`\n  Target ${target.name} Diff Summary:`);
  console.log(`    New Files:     ${addedCount}`);
  console.log(`    Updated Files: ${updatedCount}`);
  console.log(`    Pruned Files:  ${prunedCount}\n`);

  // 5. Downstream schema validation
  if (!skipTests) {
    console.log(`>>> Validating regional JSON templates in ${target.name}...`);
    const validatorScript = path.join(THEME_ROOT, 'tests/static/json-schema-validator.cjs');
    try {
      run(`node "${validatorScript}"`, targetPath, true);
      console.log(`✅ ${target.name} regional schemas 100% valid.`);
    } catch (err) {
      console.error(`❌ Validation failed in ${target.name}:`, err.message);
      process.exit(1);
    }
  } else {
    console.log(`⏭️  Skipping downstream schema validation for ${target.name} (--skip-tests active).`);
  }

  // 6. Git lifecycle for downstream repo
  let commitHash = 'no-changes';
  if (!isDryRun) {
    const gitStatus = runSilent('git status --porcelain', targetPath);
    const unpushedCommits = parseInt(runSilent('git rev-list --count @{u}..HEAD 2>/dev/null || echo 0', targetPath) || '0', 10);

    if (gitStatus.length > 0) {
      console.log(`\n>>> Staging & committing changes in ${target.name}...`);
      run('git add .', targetPath);
      const commitMsg = `chore(core): sync upstream theme engine from Scentspired-Theme@${upstreamCommit}`;
      run(`git commit -m "${commitMsg}"`, targetPath);
      commitHash = runSilent('git rev-parse --short HEAD', targetPath);
      console.log(`✅ Committed to '${target.branch}' @ ${commitHash}`);
    } else {
      console.log(`ℹ️  ${target.name} working tree is already 100% up to date with upstream.`);
      commitHash = runSilent('git rev-parse --short HEAD', targetPath);
    }

    if (!skipPush && (gitStatus.length > 0 || unpushedCommits > 0)) {
      if (target.locked || target.readOnly || target.pushDisabled || target.id === 'uk' || target.id === 'usa') {
        console.error(`\n🚨 FATAL ERROR: Attempted to push to locked target '${target.name}'. Aborted.`);
        process.exit(1);
      }
      console.log(`>>> Synchronizing branches and pushing '${target.name}' to remote...`);
      const currBranch = runSilent('git rev-parse --abbrev-ref HEAD', targetPath);
      if (target.branch && target.branch !== target.mainBranch) {
        run(`git checkout ${target.mainBranch}`, targetPath, true);
        try {
          run(`git merge ${target.branch} --ff-only`, targetPath, true);
        } catch {
          run(`git merge ${target.branch} -m "chore(sync): merge ${target.branch} into ${target.mainBranch}"`, targetPath, true);
        }
        run(`git push ${target.remote} ${target.branch} ${target.mainBranch}`, targetPath);
        run(`git checkout ${currBranch}`, targetPath, true);
        console.log(`🚀 Successfully pushed ${target.name} (${target.branch} + ${target.mainBranch}) to GitHub!`);
      } else {
        run(`git push ${target.remote} ${target.mainBranch}`, targetPath);
        console.log(`🚀 Successfully pushed ${target.name} (${target.mainBranch}) to GitHub!`);
      }
    }
  }

  summary.push({
    target: target.name,
    added: addedCount,
    updated: updatedCount,
    pruned: prunedCount,
    commit: commitHash
  });
}

// Print Executive Summary Table
console.log('\n==================================================================');
console.log('   🎉 SYNCHRONIZATION EXECUTION REPORT');
console.log('==================================================================');
console.table(summary);
console.log('==================================================================\n');

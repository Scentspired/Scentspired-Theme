#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Automated Git Hook Installer
 * ============================================================================
 *
 * Installs pre-commit and pre-push git hooks into .git/hooks
 * guaranteeing that every developer runs the 10-Layer Master Quality Gate
 * before any commit or push is allowed to leave their machine.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const gitHooksDir = path.resolve(__dirname, '..', '.git', 'hooks');

if (fs.existsSync(gitHooksDir)) {
  const prePushScript = `#!/usr/bin/env bash
# ============================================================================
# SCENTSPIRED THEME GUARDIAN — Pre-Push Quality Gate Interceptor
# ============================================================================
echo ""
echo "🛡️  Intercepting Git Push: Running 10-Layer Master Quality Gate..."
echo ""

node runner.cjs --target=.

STATUS=$?
if [ $STATUS -ne 0 ]; then
  echo ""
  echo "❌ [STRICT REJECTION] Quality Gate Failed. Git push has been aborted."
  echo "👉 Run 'npm test' locally to inspect and fix all violations."
  echo ""
  exit 1
fi

echo ""
echo "✅ Quality Gate Passed. Proceeding with Git push..."
echo ""
exit 0
`;

  const hookPath = path.join(gitHooksDir, 'pre-push');
  fs.writeFileSync(hookPath, prePushScript, { mode: 0o755 });
  console.log('  🛡️  Pre-push Quality Gate Hook installed successfully at .git/hooks/pre-push');
}

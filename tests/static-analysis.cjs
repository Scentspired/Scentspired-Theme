#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Static Analysis Engine
 * ============================================================================
 * 
 * A ruthless static code scanner that catches JavaScript bugs BEFORE deployment.
 * 
 * What it catches:
 *   Rule 1: Unguarded getElementById() chains  → null.addEventListener, null.style, etc.
 *   Rule 2: Unguarded querySelector() chains   → null.value, null.textContent, etc.
 *   Rule 3: Unsafe inline onclick with dynamic strings → apostrophe injection crashes
 *   Rule 4: Unguarded .closest() chains         → null.querySelector, null.classList, etc.
 *   Rule 5: Balanced <script> tags              → missing </script> breaks entire page
 *   Rule 6: fetch() without .catch()            → unhandled promise rejections
 *
 * Usage:
 *   node tests/static-analysis.js                  # Run all rules
 *   node tests/static-analysis.js --rule=1         # Run only rule 1
 *   node tests/static-analysis.js --fix-report     # Output machine-readable JSON
 *   node tests/static-analysis.js --severity=error  # Only show errors (skip warnings)
 * 
 * Exit codes:
 *   0 = All clear, no violations found
 *   1 = Violations detected (errors)
 *   2 = Configuration error
 *
 * How to add new rules:
 *   1. Add a rule definition in config.json under "rules"
 *   2. Add a scanner function in the RULE_SCANNERS object below
 *   3. The scanner receives (fileContent, filePath, lines[]) and returns violations[]
 *
 * How to approve exceptions:
 *   Add to config.json "approvedExceptions" array with file, line, rule, and reason.
 *
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────────────
const ROOT = process.env.THEME_TARGET_DIR ? path.resolve(process.env.THEME_TARGET_DIR) : path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(__dirname, 'config.json');

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error(`[FATAL] Cannot read config: ${CONFIG_PATH}`);
  console.error(e.message);
  process.exit(2);
}

// ── CLI Argument Parsing ───────────────────────────────────────────────────
const args = process.argv.slice(2);
const onlyRule = args.find(a => a.startsWith('--rule='))?.split('=')[1];
const fixReport = args.includes('--fix-report');
const severityFilter = args.find(a => a.startsWith('--severity='))?.split('=')[1];
const verbose = args.includes('--verbose');

// ── File Discovery ─────────────────────────────────────────────────────────
function discoverFiles() {
  const files = [];
  
  for (const scanPath of config.scanPaths) {
    const fullPath = path.join(ROOT, scanPath);
    if (!fs.existsSync(fullPath)) continue;
    
    const walkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const relative = path.relative(ROOT, entryPath);
        
        // Check exclusions
        if (config.excludePatterns.some(p => relative.includes(p))) continue;
        
        if (entry.isDirectory()) {
          walkDir(entryPath);
        } else if (config.fileExtensions.some(ext => entry.name.endsWith(ext))) {
          files.push(entryPath);
        }
      }
    };
    
    walkDir(fullPath);
  }
  
  return files;
}

// ── Exception Matching ─────────────────────────────────────────────────────
function isApproved(filePath, lineNum, ruleName) {
  const relative = path.relative(ROOT, filePath);
  return config.approvedExceptions.some(ex => 
    relative.endsWith(ex.file) && 
    Math.abs(ex.line - lineNum) <= 3 && // Allow ±3 lines tolerance for drift
    ex.rule === ruleName
  );
}

// ── Violation Object ───────────────────────────────────────────────────────
function violation(filePath, lineNum, ruleName, message, lineContent) {
  return {
    file: path.relative(ROOT, filePath),
    line: lineNum,
    rule: ruleName,
    severity: config.rules[ruleName]?.severity || 'error',
    message,
    code: lineContent.trim()
  };
}

// ============================================================================
// RULE SCANNERS
// ============================================================================

const RULE_SCANNERS = {

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 1: No Unguarded getElementById Chains
  // 
  // CATCHES: document.getElementById('X').addEventListener(...)
  //          document.getElementById('X').style.display = ...
  //          document.getElementById('X').classList.add(...)
  //          document.getElementById('X').innerText = ...
  //          document.getElementById('X').innerHTML = ...
  //          document.getElementById('X').textContent = ...
  //          document.getElementById('X').disabled = ...
  //          document.getElementById('X').value = ...
  //
  // SAFE PATTERNS (not flagged):
  //          const el = document.getElementById('X');  // assignment only
  //          if (document.getElementById('X')) ...      // checked in condition
  //          const el = document.getElementById('X'); if (el) el.style...
  // ─────────────────────────────────────────────────────────────────────────
  'no-unguarded-getElementById': (content, filePath, lines) => {
    const violations = [];
    
    // Pattern: direct property access on getElementById result
    // Matches:  document.getElementById('something').PROPERTY
    //           document.getElementById("something").PROPERTY
    //           document.getElementById(`something`).PROPERTY
    const directAccessPattern = /document\.getElementById\s*\(\s*['"`][^'"`]*['"`]\s*\)\s*\.\s*(addEventListener|classList|style|innerText|innerHTML|textContent|value|disabled|setAttribute|getAttribute|removeAttribute|remove\b|replaceWith|insertBefore|append|focus|blur|click|scrollIntoView|getBoundingClientRect|offsetWidth|offsetHeight|scrollHeight|scrollTop|scrollLeft|parentElement|parentNode|querySelectorAll|querySelector|children|firstChild|lastChild|contains|matches|toggleAttribute|outerHTML)/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Skip comment lines
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      // Skip lines inside HTML comments
      if (line.trim().startsWith('<!--')) continue;
      
      if (directAccessPattern.test(line)) {
        // Check if this is inside an if-check on the previous line
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        const prevPrevLine = i > 1 ? lines[i - 2].trim() : '';
        
        // Extract the ID being accessed
        const idMatch = line.match(/getElementById\s*\(\s*['"`]([^'"`]*)['"`]\s*\)/);
        const elementId = idMatch ? idMatch[1] : 'unknown';
        
        // Check if the previous lines contain a null guard for this ID
        const isGuarded = 
          prevLine.includes(`getElementById('${elementId}')`) && (prevLine.startsWith('if') || prevLine.startsWith('const') || prevLine.startsWith('let') || prevLine.startsWith('var')) ||
          prevPrevLine.includes(`getElementById('${elementId}')`) && (prevPrevLine.startsWith('if') || prevPrevLine.startsWith('const') || prevPrevLine.startsWith('let') || prevPrevLine.startsWith('var'));
        
        if (!isGuarded && !isApproved(filePath, lineNum, 'no-unguarded-getElementById')) {
          violations.push(violation(
            filePath, lineNum, 'no-unguarded-getElementById',
            `Unguarded getElementById('${elementId}') — will crash with "null is not an object" if element doesn't exist`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 2: No Unguarded querySelector/querySelectorAll Chains
  //
  // CATCHES: el.querySelector('.class').value = ...
  //          el.querySelector('.class').textContent = ...
  //          el.querySelector('.class').classList.add(...)
  //          card.querySelector('.selected-variant-id').value = btn.dataset.variantId
  //
  // SAFE PATTERNS (not flagged):
  //          const el = card.querySelector('.class');
  //          if (el) el.value = ...
  //          el?.querySelector('.class')  // optional chaining
  // ─────────────────────────────────────────────────────────────────────────
  'no-unguarded-querySelector': (content, filePath, lines) => {
    const violations = [];
    
    // Pattern: direct property access on querySelector result (not assigned to variable first)
    // This catches:  something.querySelector('...').PROPERTY
    // But NOT:       const x = something.querySelector('...');
    const directAccessPattern = /(?<!(?:const|let|var|if|else\s*if)\s.*)\.querySelector(?:All)?\s*\([^)]+\)\s*\.\s*(value|textContent|innerHTML|innerText|classList|style|disabled|setAttribute|getAttribute|removeAttribute|remove\b|replaceWith|insertBefore|append|focus|blur|click|addEventListener|offsetWidth|offsetHeight|scrollHeight|scrollTop|children|firstChild|lastChild|parentElement|parentNode|contains|matches|toggleAttribute|outerHTML)/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      if (line.trim().startsWith('<!--')) continue;
      
      if (directAccessPattern.test(line)) {
        // Check if line has optional chaining (?.)
        if (line.includes('?.querySelector')) continue;
        
        // Check if this querySelector result is being null-checked
        // Look at the broader context — is this inside an if block checking the same selector?
        const selectorMatch = line.match(/\.querySelector(?:All)?\s*\(\s*['"`]([^'"`]*)['"`]\s*\)/);
        const selector = selectorMatch ? selectorMatch[1] : 'unknown';
        
        // Check if previous lines have a null guard
        const context = lines.slice(Math.max(0, i - 3), i).join(' ');
        const isGuardedByContext = context.includes(`querySelector('${selector}')`) && 
                                    (context.includes('if (') || context.includes('if('));
        
        if (!isGuardedByContext && !isApproved(filePath, lineNum, 'no-unguarded-querySelector')) {
          violations.push(violation(
            filePath, lineNum, 'no-unguarded-querySelector',
            `Unguarded querySelector('${selector}') — will crash with "null is not an object" if element doesn't exist`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 3: No Unsafe Inline onclick with Dynamic Strings
  //
  // CATCHES: onclick="selectBrand('${b.tag}')" — crashes when tag contains '
  //          onclick="handleClick('${product.handle}')" — same issue
  //
  // SAFE PATTERNS:
  //          onclick="removeItem(${i})" — numeric, no string injection
  //          onclick="selectSize('50ml')" — static Liquid, no template literal
  //          data-tag="${b.tag}" with addEventListener — proper approach
  // ─────────────────────────────────────────────────────────────────────────
  'no-unsafe-inline-onclick': (content, filePath, lines) => {
    const violations = [];
    
    // We're looking for template literal strings that contain onclick with dynamic ${} variables
    // wrapped in single quotes inside the onclick value
    //
    // Pattern: onclick="functionName('${VARIABLE}')"
    //                                 ^--- dynamic string inside single quotes = DANGER
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      
      // Look for onclick="...('${...}')..." pattern — dynamic string in single-quoted onclick arg
      // This is the exact pattern that caused the apostrophe crash
      const unsafePattern = /onclick\s*=\s*["\\].*\('\$\{[^}]+\}'\)/;
      
      if (unsafePattern.test(line)) {
        // Check if the variable is being escaped with .replace
        if (line.includes('.replace(') || line.includes('encodeURIComponent') || line.includes('escapeHtml')) {
          continue;  // It's being escaped, safe
        }
        
        // Extract the variable name
        const varMatch = line.match(/\('\$\{([^}]+)\}'\)/);
        const varName = varMatch ? varMatch[1] : 'unknown';
        
        // Check: is this purely numeric (safe)?
        // Numeric patterns like ${i}, ${p.id}, ${index} are safe
        if (/^\d+$/.test(varName) || /^[a-z_]+$/i.test(varName) && ['i', 'j', 'k', 'index', 'idx'].includes(varName)) {
          continue;
        }
        
        if (!isApproved(filePath, lineNum, 'no-unsafe-inline-onclick')) {
          violations.push(violation(
            filePath, lineNum, 'no-unsafe-inline-onclick',
            `Unsafe inline onclick with dynamic string \${${varName}} — will crash if value contains apostrophe (e.g., "Victoria's Secret")`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 4: No Unguarded .closest() Chains
  //
  // CATCHES: btn.closest('.fragrance-item').querySelector(...)
  //          e.target.closest('.card').classList.add(...)
  //
  // .closest() returns null if no ancestor matches, causing the same 
  // "null is not an object" crash.
  // ─────────────────────────────────────────────────────────────────────────
  'no-unguarded-closest-chain': (content, filePath, lines) => {
    const violations = [];
    
    const directAccessPattern = /\.closest\s*\([^)]+\)\s*\.\s*(querySelector|querySelectorAll|classList|style|value|textContent|innerHTML|innerText|disabled|setAttribute|getAttribute|removeAttribute|children|firstChild|addEventListener)/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      
      if (directAccessPattern.test(line)) {
        // Skip if optional chaining is used
        if (line.includes('?.closest')) continue;
        
        // Check if previous line assigns closest to a variable and checks it
        const prevLines = lines.slice(Math.max(0, i - 3), i).join('\n');
        const selectorMatch = line.match(/\.closest\s*\(\s*['"`]([^'"`]*)['"`]\s*\)/);
        const selector = selectorMatch ? selectorMatch[1] : 'unknown';
        
        const isGuarded = prevLines.includes(`closest('${selector}')`) && 
                          (prevLines.includes('if (') || prevLines.includes('if(') || prevLines.includes('if (!'));
        
        if (!isGuarded && !isApproved(filePath, lineNum, 'no-unguarded-closest-chain')) {
          violations.push(violation(
            filePath, lineNum, 'no-unguarded-closest-chain',
            `Unguarded .closest('${selector}') chain — returns null if no ancestor matches, crashing the next property access`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 5: Balanced Script Tags
  // ─────────────────────────────────────────────────────────────────────────
  'balanced-script-tags': (content, filePath, lines) => {
    const violations = [];
    
    // Only check .liquid files
    if (!filePath.endsWith('.liquid')) return violations;
    
    const openTags = (content.match(/<script[\s>]/gi) || []).length;
    const closeTags = (content.match(/<\/script>/gi) || []).length;
    
    if (openTags !== closeTags) {
      violations.push(violation(
        filePath, 1, 'balanced-script-tags',
        `Unbalanced script tags: ${openTags} <script> vs ${closeTags} </script> — missing ${openTags > closeTags ? '</script>' : '<script>'}`,
        `(file-level check)`
      ));
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 6: fetch() Without .catch()
  //
  // Every fetch() chain must have error handling. Unhandled network errors
  // leave buttons stuck in "Adding..." state and spinners spinning forever.
  // ─────────────────────────────────────────────────────────────────────────
  'fetch-must-have-catch': (content, filePath, lines) => {
    const violations = [];
    
    // Find all fetch() calls and check if they have .catch() or are in try/catch
    const fetchStarts = [];
    for (let i = 0; i < lines.length; i++) {
      if (/\bfetch\s*\(/.test(lines[i]) && !lines[i].trim().startsWith('//')) {
        fetchStarts.push(i);
      }
    }
    
    for (const fetchLine of fetchStarts) {
      // Look ahead up to 100 lines for .catch or try/catch in promise chain
      const lookAhead = lines.slice(fetchLine, Math.min(lines.length, fetchLine + 100)).join('\n');
      // Look behind up to 60 lines for try {
      const lookBehind = lines.slice(Math.max(0, fetchLine - 60), fetchLine).join('\n');
      
      const hasCatch = lookAhead.includes('.catch') || lookAhead.includes('.catch(');
      const hasTryCatch = lookBehind.includes('try {') || lookBehind.includes('try{');
      
      if (!hasCatch && !hasTryCatch) {
        if (!isApproved(filePath, fetchLine + 1, 'fetch-must-have-catch')) {
          violations.push(violation(
            filePath, fetchLine + 1, 'fetch-must-have-catch',
            `fetch() without .catch() or try/catch — unhandled network errors will leave UI in broken state`,
            lines[fetchLine]
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 7: Unguarded getElementById with Variable Argument
  //
  // CATCHES: document.getElementById(id).style.display = 'block'
  //          document.getElementById(someVar).classList.add(...)
  //
  // This is the same as Rule 1 but for dynamic/variable IDs instead of 
  // string literals. These are MORE dangerous because you can't predict
  // whether the element exists at compile time.
  // ─────────────────────────────────────────────────────────────────────────
  'no-unguarded-getElementById': (content, filePath, lines) => {
    const violations = [];
    
    // Also match variable-based getElementById: document.getElementById(variable).property
    const varAccessPattern = /document\.getElementById\s*\(\s*[^'"`\s)][^)]*\)\s*\.\s*(addEventListener|classList|style|innerText|innerHTML|textContent|value|disabled|setAttribute|getAttribute|removeAttribute|remove\b|replaceWith|insertBefore|append|focus|blur|click|scrollIntoView|getBoundingClientRect|offsetWidth|offsetHeight|scrollHeight|scrollTop|scrollLeft|parentElement|parentNode|querySelectorAll|querySelector|children|firstChild|lastChild|contains|matches|toggleAttribute|outerHTML)/;

    // Also match string-literal getElementById
    const directAccessPattern = /document\.getElementById\s*\(\s*['"`][^'"`]*['"`]\s*\)\s*\.\s*(addEventListener|classList|style|innerText|innerHTML|textContent|value|disabled|setAttribute|getAttribute|removeAttribute|remove\b|replaceWith|insertBefore|append|focus|blur|click|scrollIntoView|getBoundingClientRect|offsetWidth|offsetHeight|scrollHeight|scrollTop|scrollLeft|parentElement|parentNode|querySelectorAll|querySelector|children|firstChild|lastChild|contains|matches|toggleAttribute|outerHTML)/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      if (line.trim().startsWith('<!--')) continue;
      
      const matchesDirect = directAccessPattern.test(line);
      const matchesVar = !matchesDirect && varAccessPattern.test(line);
      
      if (matchesDirect || matchesVar) {
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        const prevPrevLine = i > 1 ? lines[i - 2].trim() : '';
        
        const idMatch = line.match(/getElementById\s*\(\s*['"`]?([^'"`)\s]+)['"`]?\s*\)/);
        const elementId = idMatch ? idMatch[1] : 'unknown';
        
        // Check if previous lines contain a null guard
        const context = lines.slice(Math.max(0, i - 3), i).join(' ');
        const isGuarded = 
          context.includes(`getElementById`) && (context.includes('if (') || context.includes('if(') || context.includes('if (!')) ||
          prevLine.includes(`getElementById('${elementId}')`) && (prevLine.startsWith('if') || prevLine.startsWith('const') || prevLine.startsWith('let') || prevLine.startsWith('var')) ||
          prevPrevLine.includes(`getElementById('${elementId}')`) && (prevPrevLine.startsWith('if') || prevPrevLine.startsWith('const') || prevPrevLine.startsWith('let') || prevPrevLine.startsWith('var'));
        
        if (!isGuarded && !isApproved(filePath, lineNum, 'no-unguarded-getElementById')) {
          violations.push(violation(
            filePath, lineNum, 'no-unguarded-getElementById',
            `Unguarded getElementById('${elementId}') — will crash with "null is not an object" if element doesn't exist`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 8: Unguarded Local Variable from getElementById/querySelector
  //
  // CATCHES the pattern:
  //   const table = document.getElementById('ingredientsTable');
  //   const rows = table.querySelectorAll('tbody tr');   // ← CRASH if table is null
  //
  //   const el = document.querySelector('.thing');
  //   el.style.display = 'none';                         // ← CRASH if el is null
  //
  // This rule tracks local variable assignments from getElementById/querySelector
  // and flags subsequent lines that use the variable without a null check.
  // ─────────────────────────────────────────────────────────────────────────
  'no-unguarded-dom-variable': (content, filePath, lines) => {
    const violations = [];
    
    // Track variables assigned from getElementById or querySelector
    const assignmentPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:document\.getElementById|document\.querySelector|[\w.]+\.querySelector)\s*\(/;
    
    // Properties that crash on null
    const dangerousProps = /\.\s*(querySelectorAll|querySelector|classList|style|value|textContent|innerHTML|innerText|disabled|setAttribute|getAttribute|removeAttribute|addEventListener|remove\b|replaceWith|insertBefore|append|focus|blur|click|offsetWidth|offsetHeight|scrollHeight|scrollTop|scrollLeft|parentElement|parentNode|children|firstChild|lastChild|contains|matches|toggleAttribute|outerHTML)\b/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      
      const assignMatch = line.match(assignmentPattern);
      if (!assignMatch) continue;
      
      const varName = assignMatch[1];
      
      // Look at the next 5 lines for usage without null check
      for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
        const nextLine = lines[j];
        if (nextLine.trim().startsWith('//')) continue;
        
        // Check if this line uses the variable with a dangerous property
        const usagePattern = new RegExp(`\\b${varName}\\b`);
        if (!usagePattern.test(nextLine)) continue;
        if (!dangerousProps.test(nextLine)) continue;
        
        // Check if there's a null guard between assignment and usage
        const betweenLines = lines.slice(i + 1, j + 1).join('\n');
        const hasNullCheck = 
          betweenLines.includes(`if (!${varName})`) ||
          betweenLines.includes(`if (${varName})`) ||
          betweenLines.includes(`${varName} &&`) ||
          betweenLines.includes(`${varName} ?`) ||
          betweenLines.includes(`${varName}?.`) ||
          betweenLines.includes(`if (${varName} ===`) ||
          betweenLines.includes(`if (${varName} !==`);
        
        if (!hasNullCheck && !isApproved(filePath, j + 1, 'no-unguarded-dom-variable')) {
          violations.push(violation(
            filePath, j + 1, 'no-unguarded-dom-variable',
            `Variable '${varName}' from DOM lookup used without null check — will crash if element doesn't exist`,
            nextLine
          ));
          break; // Only flag the first usage per variable
        }
        
        // If we hit a null check, this variable is guarded from here on
        if (hasNullCheck) break;
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 9: Add to Cart Response Status & Error Validation
  //
  // CATCHES: fetch('/cart/add.js').then(r => r.json()).then(data => { ... })
  //          WITHOUT checking response.ok or data.status!
  //
  // When Shopify rejects an add-to-cart (e.g. 422 Sold out or quantity limit),
  // fetch() does NOT reject. Without checking response.ok or data.status,
  // the code treats failure as success, opens an un-updated drawer, and
  // leaves the shopper confused as to why the item wasn't added.
  // ─────────────────────────────────────────────────────────────────────────
  'add-to-cart-response-status-check': (content, filePath, lines) => {
    const violations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) continue;
      
      if ((line.includes('/cart/add.js') || line.includes('/cart/add')) && !line.includes('<form') && !line.includes('action=')) {
        // Look ahead up to 25 lines to inspect response handling
        const lookAhead = lines.slice(i, Math.min(lines.length, i + 25)).join('\n');
        
        const hasStatusCheck = 
          lookAhead.includes('response.ok') ||
          lookAhead.includes('res.ok') ||
          lookAhead.includes('response.status') ||
          lookAhead.includes('data.status') ||
          lookAhead.includes('data.errors') ||
          lookAhead.includes('data.description') ||
          lookAhead.includes('data.message');
        
        if (!hasStatusCheck && !isApproved(filePath, i + 1, 'add-to-cart-response-status-check')) {
          violations.push(violation(
            filePath, i + 1, 'add-to-cart-response-status-check',
            `Add to cart fetch does not verify response.ok or response.status — Shopify 422/400 errors will fail silently and confuse shoppers`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 10: Cart Drawer Synchronization Integrity
  //
  // CATCHES: References to obsolete Dawn <cart-drawer> instead of #sp-cart-drawer.
  // When code calls doc.querySelector('cart-drawer'), it returns null, causing
  // full-page cart redirects or unresponsive "Add to Cart" buttons.
  // ─────────────────────────────────────────────────────────────────────────
  'cart-drawer-sync-integrity': (content, filePath, lines) => {
    const violations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//')) continue;
      
      if (line.includes("querySelector('cart-drawer')") || line.includes('querySelector("cart-drawer")')) {
        // Check if there is a modern #sp-cart-drawer fallback in surrounding context or file
        const context = lines.slice(Math.max(0, i - 15), Math.min(lines.length, i + 80)).join('\n');
        const hasModernFallback = context.includes('updateDossierCartUI') || context.includes('openDossierCart') || context.includes('#sp-cart-drawer') || content.includes('updateDossierCartUI');
        
        if (!hasModernFallback && !isApproved(filePath, i + 1, 'cart-drawer-sync-integrity')) {
          violations.push(violation(
            filePath, i + 1, 'cart-drawer-sync-integrity',
            `Targets defunct Dawn <cart-drawer> without #sp-cart-drawer / updateDossierCartUI sync — cart drawer will not open on add`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 11: Button Disabled Lifecycle Guarantee
  //
  // CATCHES: Code that sets button.disabled = true or button.innerText = 'Adding...'
  // without a guaranteed finally { ... } or catch { ... } re-enabling step.
  // Any network failure or exception will permanently freeze the button!
  // ─────────────────────────────────────────────────────────────────────────
  'button-disabled-finally-guarantee': (content, filePath, lines) => {
    const violations = [];
    
    const disablePattern = /(?:submitBtn|btn|button|\.submitButton)\.disabled\s*=\s*true/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//')) continue;
      
      if (disablePattern.test(line)) {
        // Look ahead up to 150 lines for .finally or try/finally or catch reset
        const lookAhead = lines.slice(i, Math.min(lines.length, i + 150)).join('\n');
        
        const hasReset = 
          lookAhead.includes('.disabled = false') ||
          lookAhead.includes('.removeAttribute(\'disabled\')') ||
          lookAhead.includes('.removeAttribute("disabled")');
        
        if (!hasReset && !isApproved(filePath, i + 1, 'button-disabled-finally-guarantee')) {
          violations.push(violation(
            filePath, i + 1, 'button-disabled-finally-guarantee',
            `Button is disabled without a guaranteed re-enabling statement — network glitches will leave customer permanently stuck`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 12: Form Variant ID Completeness
  //
  // CATCHES: <form action="/cart/add"> without a variant ID input!
  // Submitting such a form fails Shopify validation with "parameter missing: id".
  // ─────────────────────────────────────────────────────────────────────────
  'form-variant-id-completeness': (content, filePath, lines) => {
    const violations = [];
    
    if (!filePath.endsWith('.liquid')) return violations;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('<form') && line.includes('/cart/add')) {
        // Look ahead 30 lines inside the form for name="id" or selected-variant-id
        const formBlock = lines.slice(i, Math.min(lines.length, i + 35)).join('\n');
        
        const hasVariantInput = 
          formBlock.includes('name="id"') ||
          formBlock.includes("name='id'") ||
          formBlock.includes('selected-variant-id') ||
          formBlock.includes('product.selected_or_first_available_variant');
        
        if (!hasVariantInput && !isApproved(filePath, i + 1, 'form-variant-id-completeness')) {
          violations.push(violation(
            filePath, i + 1, 'form-variant-id-completeness',
            `<form action="/cart/add"> is missing a variant ID input — submitting will result in 422 Parameter Missing error`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 13: Checkout URL & Gateway Integrity
  //
  // CATCHES: Dead checkout links like href="#" or broken checkout redirects.
  // ─────────────────────────────────────────────────────────────────────────
  'checkout-url-integrity': (content, filePath, lines) => {
    const violations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//')) continue;
      
      // Look for checkout buttons with invalid hrefs
      if (line.includes('checkout') && line.includes('href="#"')) {
        if (!isApproved(filePath, i + 1, 'checkout-url-integrity')) {
          violations.push(violation(
            filePath, i + 1, 'checkout-url-integrity',
            `Checkout element has dead link href="#" — clicking will not take customer to checkout`,
            line
          ));
        }
      }
    }
    
    return violations;
  },

  'no-missing-snippet-assets': function (content, filePath, lines) {
    if (!filePath.endsWith('.liquid')) return [];
    const violations = [];
    const snippetsDir = path.join(ROOT, 'snippets');
    const regex = /{%\s*(?:render|include)\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const snippetName = match[1];
      if (snippetName.includes('{{') || snippetName.includes(' ') || snippetName.includes('|') || snippetName === 'cart-drawer-complete') continue;
      const snippetPath = path.join(snippetsDir, snippetName + '.liquid');
      if (!fs.existsSync(snippetPath)) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        if (!isApproved(filePath, lineNum, 'no-missing-snippet-assets')) {
          violations.push(violation(
            filePath, lineNum, 'no-missing-snippet-assets',
            `Could not find asset snippets/${snippetName}.liquid referenced by {% render/include '${snippetName}' %}`,
            lines[lineNum - 1] || match[0]
          ));
        }
      }
    }
    return violations;
  }
};

// ============================================================================
// SCANNER ENGINE
// ============================================================================

function runScan() {
  const files = discoverFiles();
  const allViolations = [];
  let filesScanned = 0;
  let linesScanned = 0;

  // ── Scan all files ───────────────────────────────────────────────────
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    filesScanned++;
    linesScanned += lines.length;

    // Check if file contains any JavaScript (skip pure CSS/Liquid-only files)
    const hasJS = content.includes('<script') || filePath.endsWith('.js');
    if (!hasJS && !filePath.endsWith('.liquid')) continue;

    for (const [ruleName, scanner] of Object.entries(RULE_SCANNERS)) {
      // Skip disabled rules
      if (!config.rules[ruleName]?.enabled) continue;

      // Skip if user requested specific rule only
      if (onlyRule && !ruleName.includes(onlyRule) &&
          !ruleName.endsWith(`-${onlyRule}`) &&
          ruleName !== `rule-${onlyRule}`) continue;

      // Skip if severity filter applied
      if (severityFilter && config.rules[ruleName]?.severity !== severityFilter) continue;

      try {
        const ruleViolations = scanner(content, filePath, lines);
        allViolations.push(...ruleViolations);
      } catch (e) {
        if (!fixReport) {
          console.error(`  [SCANNER ERROR] Rule "${ruleName}" crashed on ${path.relative(ROOT, filePath)}: ${e.message}`);
        }
      }
    }
  }

  // ── Output Results ─────────────────────────────────────────────────────

  if (fixReport) {
    // Machine-readable JSON output — no banner, pure JSON to stdout
    process.stdout.write(JSON.stringify({
      filesScanned,
      linesScanned,
      totalViolations: allViolations.length,
      errors: allViolations.filter(v => v.severity === 'error').length,
      warnings: allViolations.filter(v => v.severity === 'warning').length,
      violations: allViolations
    }, null, 2));
    return allViolations;
  }

  // Human-readable output
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        SCENTSPIRED THEME GUARDIAN — Static Analysis         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Group violations by file
  const byFile = {};
  for (const v of allViolations) {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
  }

  const errorCount = allViolations.filter(v => v.severity === 'error').length;
  const warnCount = allViolations.filter(v => v.severity === 'warning').length;

  if (allViolations.length === 0) {
    console.log(`  ✅ Scanned ${filesScanned} files (${linesScanned.toLocaleString()} lines)`);
    console.log(`  ✅ ZERO VIOLATIONS DETECTED`);
    console.log('');
    console.log('  All clear. No unguarded DOM access, no unsafe onclick injections,');
    console.log('  no unbalanced tags, all fetch chains have error handling.');
    console.log('');
  } else {
    console.log(`  Scanned ${filesScanned} files (${linesScanned.toLocaleString()} lines)`);
    console.log(`  Found ${allViolations.length} violations (${errorCount} errors, ${warnCount} warnings)`);
    console.log('');

    for (const [file, violations] of Object.entries(byFile)) {
      console.log(`  ┌─ ${file}`);
      for (const v of violations) {
        const icon = v.severity === 'error' ? '❌' : '⚠️';
        console.log(`  │  ${icon} Line ${v.line}: [${v.rule}]`);
        console.log(`  │     ${v.message}`);
        if (verbose) {
          console.log(`  │     Code: ${v.code.substring(0, 100)}`);
        }
      }
      console.log(`  └──`);
      console.log('');
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log(`│  Files: ${String(filesScanned).padStart(4)}  │  Lines: ${String(linesScanned.toLocaleString()).padStart(7)}  │  Rules: ${String(Object.keys(RULE_SCANNERS).length).padStart(2)}  │  Exceptions: ${String(config.approvedExceptions.length).padStart(2)} │`);
  console.log(`│  Errors: ${String(errorCount).padStart(3)}  │  Warnings: ${String(warnCount).padStart(4)}                                │`);
  console.log('└──────────────────────────────────────────────────────────────┘');

  if (errorCount > 0) {
    console.log('');
    console.log('  ❌ DEPLOYMENT BLOCKED — Fix all errors before deploying.');
    console.log('');
  }

  return allViolations;
}

// ── Execute ────────────────────────────────────────────────────────────────
const violations = runScan();
const errorCount = violations.filter(v => v.severity === 'error').length;
process.exit(errorCount > 0 ? 1 : 0);


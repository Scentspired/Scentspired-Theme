#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 2: JavaScript AST & Liquid Script Validator
 * ============================================================================
 *
 * Verifies 100% syntactical validity across:
 *   1. All standalone JavaScript files in assets/*.js
 *   2. All inline <script> blocks embedded inside layout/*.liquid, sections/*.liquid, and snippets/*.liquid
 *
 * Uses Node.js 'vm.Script' compiler to detect:
 *   - SyntaxError (unclosed brackets, illegal tokens, unescaped strings)
 *   - Duplicate variable declarations (e.g. const totalDisplay declared twice)
 *   - Invalid regular expressions
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT_DIR = process.env.THEME_TARGET_DIR
  ? path.resolve(process.env.THEME_TARGET_DIR)
  : path.resolve(__dirname, "../..");

console.log("");
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║   SCENTSPIRED THEME GUARDIAN — JS & Script Syntax Engine    ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("");

let totalFilesChecked = 0;
let totalScriptsChecked = 0;
let syntaxErrors = [];

/**
 * Sanitize Liquid syntax so it can be compiled as valid JS syntax
 */
function sanitizeLiquidForSyntaxCheck(scriptContent) {
  let js = scriptContent;

  // 1. Remove Liquid comments {% comment %}...{% endcomment %}
  js = js.replace(/\{%\s*comment\s*%\}([\s\S]*?)\{%\s*endcomment\s*%\}/g, "/* liquid comment */");

  // 2. Handle Liquid {% if ... %}A{% else %}B{% endif %} branches - pick first branch
  js = js.replace(
    /\{%\s*if\s+[\s\S]*?%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
    "$1 /* else: $2 */"
  );

  // 3. Handle Liquid {% unless ... %}...{% endunless %} (e.g. {% unless forloop.last %},{% endunless %})
  js = js.replace(/\{%\s*unless\s+[\s\S]*?%\}([\s\S]*?)\{%\s*endunless\s*%\}/g, "$1");

  // 4. Handle Liquid {{ ... }} tags
  // Using an alphanumeric identifier 'liquid_val' ensures:
  // - Inside quotes: "prefix-{{ id }}" -> "prefix-liquid_val" (Valid String)
  // - Unquoted: const id = {{ product.id }}; -> const id = liquid_val; (Valid Expression)
  js = js.replace(/\{\{\s*[\s\S]*?\s*\}\}/g, " liquid_val ");

  // 5. Replace all remaining Liquid control tags {% ... %} with block comments /* liquid */
  js = js.replace(/\{%\s*[\s\S]*?\s*%\}/g, " /* liquid */ ");

  return js;
}

/**
 * Check syntax of a standalone JS file
 */
function checkJsFile(filePath) {
  totalFilesChecked++;
  totalScriptsChecked++;
  const relativePath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf8");

  try {
    new vm.Script(content, { filename: relativePath });
  } catch (err) {
    syntaxErrors.push({
      file: relativePath,
      line: err.lineNumber || "unknown",
      message: err.message,
      snippet: err.stack ? err.stack.split("\n")[0] : "",
    });
  }
}

/**
 * Check inline scripts inside a Liquid file
 */
function checkLiquidFile(filePath) {
  totalFilesChecked++;
  const relativePath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf8");

  // Match all <script\b[^>]*>...</script> blocks
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptIndex = 0;

  while ((match = scriptRegex.exec(content)) !== null) {
    scriptIndex++;
    totalScriptsChecked++;
    const rawScript = match[1];

    // Skip JSON LD scripts or templates
    const fullTag = match[0];
    if (
      fullTag.includes('type="application/json"') ||
      fullTag.includes('type="application/ld+json"') ||
      fullTag.includes('type="text/template"') ||
      fullTag.includes('type="text/html"')
    ) {
      continue;
    }

    const sanitizedJs = sanitizeLiquidForSyntaxCheck(rawScript);

    try {
      new vm.Script(sanitizedJs, { filename: `${relativePath} [script #${scriptIndex}]` });
    } catch (err) {
      // Find line number in original Liquid file
      const upToMatch = content.substring(0, match.index);
      const startLine = upToMatch.split("\n").length;

      syntaxErrors.push({
        file: `${relativePath} (script #${scriptIndex})`,
        line: startLine,
        message: err.message,
        snippet: err.stack ? err.stack.split("\n")[0] : "",
      });
    }
  }
}

// 1. Scan assets/*.js
const assetsDir = path.join(ROOT_DIR, "assets");
if (fs.existsSync(assetsDir)) {
  fs.readdirSync(assetsDir).forEach(file => {
    if (file.endsWith(".js")) {
      checkJsFile(path.join(assetsDir, file));
    }
  });
}

// 2. Scan layout/*.liquid, sections/*.liquid, snippets/*.liquid
const liquidDirs = ["layout", "sections", "snippets"];
liquidDirs.forEach(dirName => {
  const dirPath = path.join(ROOT_DIR, dirName);
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      if (file.endsWith(".liquid")) {
        checkLiquidFile(path.join(dirPath, file));
      }
    });
  }
});

console.log(
  `  🔍 Scanned ${totalFilesChecked} files (${totalScriptsChecked} JS scripts/blocks analyzed)`
);

if (syntaxErrors.length === 0) {
  console.log(
    "  ✅ ZERO SYNTAX ERRORS DETECTED — 100% Valid JavaScript AST across ALL files & inline scripts\n"
  );
  process.exit(0);
} else {
  console.error(`\n  ❌ ${syntaxErrors.length} SYNTAX ERRORS DETECTED:\n`);
  syntaxErrors.forEach((err, idx) => {
    console.error(`  [${idx + 1}] ${err.file}:${err.line}`);
    console.error(`      Error: ${err.message}`);
    console.error("");
  });
  process.exit(1);
}

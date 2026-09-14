#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Layer 13: CSS AST & Syntax Integrity Linter
 * ============================================================================
 *
 * Enforces strict CSS syntax validity across:
 *   1. All standalone stylesheets in assets/*.css
 *   2. All inline <style> and {% style %} blocks in layout/, sections/, snippets/
 *
 * Verifies:
 *   - Balanced curly braces { and }
 *   - Zero illegal single-line JavaScript-style comments (// ...) in CSS
 *   - Properly closed block comments /* ... * /
 *   - Properly closed string literals ("...", '...')
 *   - Zero uncompiled / unknown preprocessor directives (@custom-variant, @apply, @theme)
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.env.THEME_TARGET_DIR
  ? path.resolve(process.env.THEME_TARGET_DIR)
  : path.resolve(__dirname, "../..");

console.log("");
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║   SCENTSPIRED THEME GUARDIAN — CSS AST & Syntax Linter       ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log(`  Target Directory: ${ROOT_DIR}`);
console.log("");

let totalFilesChecked = 0;
let totalBlocksChecked = 0;
let cssErrors = [];

/**
 * Validates a raw CSS string for syntax errors.
 */
function validateCssContent(cssText, filePath, contextName = "stylesheet", startLineOffset = 0) {
  totalBlocksChecked++;
  const lines = cssText.split(/\r?\n/);

  let inComment = false;
  let inString = false;
  let stringChar = "";
  let openBraces = 0;
  let braceStack = [];

  for (let l = 0; l < lines.length; l++) {
    const lineNum = l + 1 + startLineOffset;
    const line = lines[l];

    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const next = c + 1 < line.length ? line[c + 1] : "";

      // 1. Inside comment
      if (inComment) {
        if (ch === "*" && next === "/") {
          inComment = false;
          c++; // skip slash
        }
        continue;
      }

      // 2. Inside string
      if (inString) {
        if (ch === "\\") {
          c++; // skip escaped char
        } else if (ch === stringChar) {
          inString = false;
        }
        continue;
      }

      // 3. Start of block comment
      if (ch === "/" && next === "*") {
        inComment = true;
        c++;
        continue;
      }

      // 4. Start of string literal
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
        continue;
      }

      // 5. Illegal single-line comment (//) in CSS
      if (ch === "/" && next === "/") {
        // Guard against URL protocols like https://
        const prevChars = line.substring(Math.max(0, c - 6), c);
        if (!prevChars.endsWith("http:") && !prevChars.endsWith("https:") && !prevChars.endsWith("url(")) {
          cssErrors.push({
            file: filePath,
            context: contextName,
            line: lineNum,
            col: c + 1,
            message: `Illegal single-line comment (//) in CSS. Standard CSS requires /* ... */ comments.`,
            snippet: line.trim(),
          });
          break; // skip rest of line
        }
      }

      // 6. Check for uncompiled at-rules
      if (ch === "@") {
        const remaining = line.substring(c);
        const match = remaining.match(/^@(apply|custom-variant|theme\b)/);
        if (match) {
          cssErrors.push({
            file: filePath,
            context: contextName,
            line: lineNum,
            col: c + 1,
            message: `Uncompiled at-rule detected: '@${match[1]}'. Shopify serves raw CSS; preprocessor at-rules break browser parsers.`,
            snippet: line.trim(),
          });
        }
      }

      // 7. Brace matching
      if (ch === "{") {
        openBraces++;
        braceStack.push({ line: lineNum, col: c + 1 });
      } else if (ch === "}") {
        openBraces--;
        if (openBraces < 0) {
          cssErrors.push({
            file: filePath,
            context: contextName,
            line: lineNum,
            col: c + 1,
            message: `Unexpected closing brace '}' without matching opening brace.`,
            snippet: line.trim(),
          });
          openBraces = 0; // reset to avoid cascading false positives
        } else {
          braceStack.pop();
        }
      }
    }

    // End of line string check (multi-line strings without backslash are illegal in CSS)
    if (inString && !line.endsWith("\\")) {
      // In Liquid files, {{ ... }} might span or split quotes, so only flag if standalone .css
      if (filePath.endsWith(".css")) {
        cssErrors.push({
          file: filePath,
          context: contextName,
          line: lineNum,
          col: line.length,
          message: `Unterminated string literal (missing closing ${stringChar}).`,
          snippet: line.trim(),
        });
      }
      inString = false;
    }
  }

  // Check unclosed comments
  if (inComment) {
    cssErrors.push({
      file: filePath,
      context: contextName,
      line: lines.length + startLineOffset,
      col: 0,
      message: `Unclosed comment block (missing closing '*/').`,
      snippet: "",
    });
  }

  // Check unclosed braces
  if (openBraces > 0) {
    const firstUnclosed = braceStack[0] || { line: lines.length + startLineOffset, col: 0 };
    cssErrors.push({
      file: filePath,
      context: contextName,
      line: firstUnclosed.line,
      col: firstUnclosed.col,
      message: `Unclosed brace '{' (missing ${openBraces} closing brace(s) '}').`,
      snippet: "",
    });
  }
}

/**
 * Scan a standalone .css file
 */
function scanCssFile(filePath) {
  totalFilesChecked++;
  const relativePath = path.relative(ROOT_DIR, filePath);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    validateCssContent(content, relativePath, "standalone .css");
  } catch (err) {
    cssErrors.push({
      file: relativePath,
      context: "file read",
      line: 0,
      col: 0,
      message: `Failed to read CSS file: ${err.message}`,
      snippet: "",
    });
  }
}

/**
 * Scan inline <style> and {% style %} blocks in Liquid files
 */
function scanLiquidFile(filePath) {
  totalFilesChecked++;
  const relativePath = path.relative(ROOT_DIR, filePath);
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // 1. Match <style\b[^>]*>([\s\S]*?)<\/style>
    const htmlStyleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = htmlStyleRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      const linesBefore = content.substring(0, matchIndex).split("\n").length;
      validateCssContent(match[1], relativePath, "<style> tag", linesBefore);
    }

    // 2. Match {% style %}...{% endstyle %}
    const liquidStyleRegex = /\{%\s*style\s*%\}([\s\S]*?)\{%\s*endstyle\s*%\}/gi;
    while ((match = liquidStyleRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      const linesBefore = content.substring(0, matchIndex).split("\n").length;
      validateCssContent(match[1], relativePath, "{% style %} tag", linesBefore);
    }
  } catch (err) {
    cssErrors.push({
      file: relativePath,
      context: "file read",
      line: 0,
      col: 0,
      message: `Failed to read Liquid file: ${err.message}`,
      snippet: "",
    });
  }
}

// 1. Scan assets/*.css
const assetsDir = path.join(ROOT_DIR, "assets");
if (fs.existsSync(assetsDir)) {
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith(".css"));
  for (const f of cssFiles) {
    scanCssFile(path.join(assetsDir, f));
  }
}

// 2. Scan Liquid templates for style blocks
const liquidDirs = ["layout", "sections", "snippets"];
for (const dir of liquidDirs) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (fs.existsSync(fullDir)) {
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith(".liquid"));
    for (const f of files) {
      scanLiquidFile(path.join(fullDir, f));
    }
  }
}

// Print results
console.log(`  🔍 Scanned ${totalFilesChecked} files (${totalBlocksChecked} CSS stylesheets & style blocks)`);

if (cssErrors.length > 0) {
  console.log(`\n  ❌ ${cssErrors.length} CSS SYNTAX ERROR(S) DETECTED:\n`);
  for (const err of cssErrors) {
    console.log(`  [ERROR] ${err.file}:${err.line}:${err.col} (${err.context})`);
    console.log(`          ${err.message}`);
    if (err.snippet) {
      console.log(`          Snippet: "${err.snippet}"`);
    }
    console.log("");
  }
  process.exit(1);
} else {
  console.log("  ✅ ZERO CSS SYNTAX, BRACE, OR AT-RULE ERRORS DETECTED");
  console.log("");
  console.log("┌──────────────────────────────────────────────────────────────┐");
  console.log(`│  Files: ${String(totalFilesChecked).padStart(4)}  │  CSS Blocks: ${String(totalBlocksChecked).padStart(4)}  │  Errors: 0               │`);
  console.log("└──────────────────────────────────────────────────────────────┘");
  console.log("");
  process.exit(0);
}

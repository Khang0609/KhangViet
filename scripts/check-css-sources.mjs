import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NON_CODE_ROOT_DIRS = [".agents", ".gemini", ".github", "docs", "error-logs"];
const IGNORED_DIRS = new Set(["node_modules", ".next", "out", ".git", ".venv"]);

function findCssFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCssFiles(full, results);
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      results.push(full);
    }
  }
  return results;
}

const existingNonCodeDirs = NON_CODE_ROOT_DIRS.filter((d) =>
  fs.existsSync(path.join(ROOT, d))
);

if (existingNonCodeDirs.length === 0) {
  process.exit(0);
}

let hasError = false;
for (const cssFile of findCssFiles(ROOT)) {
  const content = fs.readFileSync(cssFile, "utf8");
  if (!/@import\s+["']tailwindcss["']/.test(content)) continue;

  const hasExplicitSource = /@source\s+(?!not\b)/.test(content);
  if (hasExplicitSource) continue;

  const missingExclusions = existingNonCodeDirs.filter((dir) => {
    const escaped = dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return !new RegExp(`@source\\s+not\\s+["'][^"']*${escaped}["']`).test(content);
  });

  if (missingExclusions.length > 0 && missingExclusions.includes(".agents")) {
    const rel = path.relative(ROOT, cssFile);
    console.error(
      `[check-css-sources] ${rel} imports tailwindcss without "@source not" for: ${missingExclusions.join(", ")}. ` +
        `Tailwind v4 scans markdown/docs in those folders and can generate invalid CSS.`
    );
    hasError = true;
  }
}

if (hasError) process.exit(1);

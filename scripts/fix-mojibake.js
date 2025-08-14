// Fix common mojibake (UTF-8 decoded as Latin-1) across text files
// Safe strategy: only rewrite files that contain suspicious sequences
// like 'Ã', 'Â', 'â€™', 'â€“', 'â€”', 'â€¦', 'â€', 'ðŸ', 'â˜…'

/* eslint-disable no-console */
import fs from "node:fs/promises";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".cjs",
  ".mjs",
  ".json",
  ".md",
  ".txt",
  ".html",
  ".xml",
  ".svg",
  ".css",
]);

const SUSPICIOUS_PATTERNS = [
  "Ã", // often indicates UTF-8 bytes interpreted as latin1
  "Â",
  "â€",
  "â€“",
  "â€”",
  "â€™",
  "â€œ",
  "â€\u009d", // sometimes appears as control variant
  "â€¦",
  "â€¢",
  "â˜…",
  "â˜†",
  "ðŸ", // emoji mojibake prefix
];

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function hasSuspiciousSequences(content) {
  return SUSPICIOUS_PATTERNS.some(p => content.includes(p));
}

function looksImproved(original, fixed) {
  // Heuristic: fixed should have fewer suspicious patterns and fewer lone 'Â'/'Ã'
  const score = s => SUSPICIOUS_PATTERNS.reduce((acc, p) => acc + (s.includes(p) ? 1 : 0), 0);
  return score(fixed) < score(original);
}

async function main() {
  const root = process.cwd();
  let changed = 0;
  for await (const file of walk(root)) {
    const ext = path.extname(file);
    if (!TEXT_EXTENSIONS.has(ext)) continue;

    const content = await fs.readFile(file, "utf8");
    if (!hasSuspiciousSequences(content)) continue;

    // Attempt to repair by reinterpreting current text as Latin-1 bytes to UTF-8
    const repaired = Buffer.from(content, "latin1").toString("utf8");

    if (looksImproved(content, repaired)) {
      await fs.writeFile(file, repaired, "utf8");
      console.log(`Repaired mojibake in ${path.relative(root, file)}`);
      changed++;
      continue;
    }

    // Fallback targeted replacements for common cases
    let replaced = content
      .replace(/Â£/g, "£")
      .replace(/â€™/g, "’")
      .replace(/â€œ/g, "“")
      .replace(/â€\u009d/g, "”")
      .replace(/â€/g, "”")
      .replace(/â€“/g, "–")
      .replace(/â€”/g, "—")
      .replace(/â€¦/g, "…")
      .replace(/â€¢/g, "•")
      .replace(/â˜…/g, "★")
      .replace(/â˜†/g, "☆");

    if (replaced !== content) {
      await fs.writeFile(file, replaced, "utf8");
      console.log(`Applied targeted fixes in ${path.relative(root, file)}`);
      changed++;
    }
  }

  console.log(`Done. Files changed: ${changed}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const base = path.resolve(__dirname, "..");
const dist = path.join(base, "dist");
const problems = [];
let localReferences = 0;
function checkReference(ref, owner) {
  if (!ref || /^(https?:|data:|#|blob:)/.test(ref)) return;
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
  localReferences++;
  if (!fs.existsSync(path.resolve(path.dirname(owner), clean)))
    problems.push(owner + " → " + ref);
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".css"))
      for (const match of fs
        .readFileSync(file, "utf8")
        .matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g))
        checkReference(match[1], file);
    else if (file.endsWith(".html"))
      for (const match of fs
        .readFileSync(file, "utf8")
        .matchAll(/(?:src|href)="([^"]+)"/g))
        checkReference(match[1], file);
  }
}
walk(dist);
for (const file of [
  "docs/教材覆盖说明.md",
  "docs/使用说明.md",
  "docs/开发交接.md",
  "docs/部署说明.md",
  "vendor/JSXGraph-LICENSE.txt",
  "vendor/jStat-LICENSE.txt",
  "vendor/simple-statistics-LICENSE.txt",
  "vendor/KaTeX-LICENSE.txt",
]) {
  if (!fs.existsSync(path.join(dist, file))) problems.push(file);
}
const pairs = [
  ["jsxgraph/distrib/jsxgraphcore.js", "jsxgraphcore.js"],
  ["jstat/dist/jstat.min.js", "jstat.min.js"],
  ["simple-statistics/dist/simple-statistics.min.js", "simple-statistics.min.js"],
  ["katex/dist/katex.min.js", "katex.min.js"],
];
const hash = (p) =>
  crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
for (const [source, dest] of pairs)
  if (
    hash(path.join(base, "node_modules", source)) !==
    hash(path.join(dist, "vendor", dest))
  )
    problems.push("Vendored bundle differs: " + dest);
for (const name of ["使用说明.md", "开发交接.md", "部署说明.md", "教材覆盖说明.md"])
  if (
    hash(path.join(base, "docs", name)) !== hash(path.join(dist, "docs", name))
  )
    problems.push("Documentation copies differ: " + name);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    JSON.stringify({
      localReferences,
      missing: 0,
      bundleCopiesVerified: pairs.length,
      documentCopiesVerified: 4,
    }),
  );

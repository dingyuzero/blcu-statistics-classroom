// Produces one HTML without runtime sibling files, CDN, fetch or module imports.
const fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve(__dirname, ".."),
  dist = path.join(root, "dist");
const out = path.resolve(
  process.argv[2] || path.join(root, "release", "统计课堂-单文件.html"),
);
const read = (p) => fs.readFileSync(path.join(dist, p.split(/[?#]/)[0]), "utf8");
const mime = (p) =>
  ({
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".svg": "image/svg+xml",
  })[path.extname(p)] || "application/octet-stream";
const data = (p) =>
  "data:" +
  mime(p) +
  ";base64," +
  fs.readFileSync(path.join(dist, p)).toString("base64");
let html = read("index.html");
const scripts = [];
html = html.replace(/<script defer src="([^"]+)"><\/script>/g, (_, p) => {
  scripts.push(
    read(p)
      .replace(/\/\/# sourceMappingURL=.*$/gm, "")
      .replace(/<\/script/gi, "<\\/script"),
  );
  return "";
});
html = html.replace(
  /<link rel="stylesheet" href="([^"]+)"\s*\/>/g,
  (_, p) =>
    "<style>" +
    read(p)
      .replace(/\/\*# sourceMappingURL=.*?\*\//g, "")
      .replace(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g, (all, ref) =>
        /^(data:|https?:)/.test(ref)
          ? all
          : 'url("' + data(path.posix.join(path.posix.dirname(p), ref)) + '")',
      ) +
    "</style>",
);
html = html.replace('href="favicon.svg"', 'href="' + data("favicon.svg") + '"');
const files = {};
for (const dir of ["docs", "vendor"])
  for (const name of fs.readdirSync(path.join(dist, dir))) {
    if (/\.(md|txt)$/.test(name))
      files[dir + "/" + name] = read(dir + "/" + name);
  }
// Keep complete licenses accessible inside the offline document as downloads.
files["LICENSE.txt"] = fs.readFileSync(path.join(root, "LICENSE"), "utf8");
files["THIRD_PARTY_NOTICES.md"] = fs.readFileSync(
  path.join(root, "THIRD_PARTY_NOTICES.md"),
  "utf8",
);
const bootstrap =
  "const portableFiles=" +
  JSON.stringify(files).replace(/</g, "\\u003c") +
  '; document.addEventListener("click",function(e){const a=e.target.closest("a[href]");if(!a)return;const key=decodeURIComponent(a.getAttribute("href"));if(!(key in portableFiles))return;e.preventDefault();e.stopPropagation();downloadArtifact(new Blob([portableFiles[key]],{type:"text/plain;charset=utf-8"}),a.download||key.split("/").pop(),"已从单文件版导出文档");},true);';
html = html.replace(
  "</body>",
  () => scripts.map((s) => "<script>" + s + "</script>").join("\n") +
    "\n<script>" +
    bootstrap +
    "</script>\n</body>",
);
// Validate script boundaries before delivering a blank or partially initialized page.
const embeddedScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (embeddedScripts.length !== scripts.length + 1) throw Error("Inline script boundary mismatch");
for (let i = 0; i < scripts.length; i++) {
  if (embeddedScripts[i] !== scripts[i]) throw Error("Inline script contents changed: " + i);
  new (require("node:vm").Script)(embeddedScripts[i]);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
const external =
  html.match(/<(?:script|link)[^>]*(?:src|href)="(?!data:)[^"]+"/g) || [];
if (external.length) throw Error("Unembedded assets: " + external.join(", "));
console.log(
  JSON.stringify({
    output: out,
    bytes: Buffer.byteLength(html),
    embeddedDocuments: Object.keys(files).length,
    externalRuntimeReferences: external.length,
  }),
);

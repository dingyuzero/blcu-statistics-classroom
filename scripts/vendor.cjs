const fs = require("node:fs");
fs.mkdirSync("dist/vendor", { recursive: true });
for (const [src, dst] of [
  ["jsxgraph/distrib/jsxgraphcore.js", "jsxgraphcore.js"],
  ["jsxgraph/distrib/jsxgraph.css", "jsxgraph.css"],
  ["jsxgraph/LICENSE.MIT", "JSXGraph-LICENSE.txt"],
  ["jstat/dist/jstat.min.js", "jstat.min.js"],
  ["jstat/LICENSE", "jStat-LICENSE.txt"],
  [
    "simple-statistics/dist/simple-statistics.min.js",
    "simple-statistics.min.js",
  ],
  ["simple-statistics/LICENSE", "simple-statistics-LICENSE.txt"],
  ["katex/dist/katex.min.js", "katex.min.js"],
  ["katex/dist/katex.min.css", "katex.min.css"],
  ["katex/LICENSE", "KaTeX-LICENSE.txt"],
])
  fs.copyFileSync("node_modules/" + src, "dist/vendor/" + dst);
fs.cpSync("node_modules/katex/dist/fonts", "dist/vendor/fonts", {
  recursive: true,
});
console.log("Four pinned libraries, licenses and formula fonts copied.");

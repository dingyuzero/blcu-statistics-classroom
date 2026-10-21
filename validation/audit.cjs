const fs = require("node:fs"),
  S = require("../dist/stats-core");
const rng = S.rng(20261020),
  out = { normal: [], binomial: [], welch: [], intervals: [], regression: [] };
for (let i = 0; i < 500; i++) {
  const a = -10 + rng() * 20,
    b = a + 0.001 + rng() * 3;
  out.normal.push({
    args: [a, b, 0, 1],
    actual: S.normalProbability(a, b, 0, 1),
  });
  const n = 1 + Math.floor(rng() * 60),
    p = rng(),
    k = Math.floor(rng() * (n + 1));
  out.binomial.push({
    args: [n, p, k],
    actual: S.binomial(n, p, k).probability,
  });
  const args = [
    5 + Math.floor(rng() * 146),
    50,
    2 + rng() * 28,
    5 + Math.floor(rng() * 146),
    30 + rng() * 40,
    2 + rng() * 28,
    [0.01, 0.05, 0.1][i % 3],
  ];
  out.welch.push({ args, actual: S.welch(...args) });
}
for (const n of [3, 5, 20, 100])
  for (const level of [0.9, 0.95, 0.99])
    out.intervals.push({ n, level, rows: S.intervals(n, level, 50, 2026) });
for (const rho of [-0.95, 0, 0.6, 0.95])
  for (const outlier of [false, true])
    out.regression.push({
      rho,
      outlier,
      ...S.correlation(rho, 40, 2026, outlier),
    });
process.stdout.write(JSON.stringify(out));

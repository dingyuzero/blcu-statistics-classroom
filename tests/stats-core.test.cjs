const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  S = require("../dist/stats-core.js");
function close(a, b, tol = 1e-9) {
  assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
}
test("parser accepts decimal and Chinese separators; rejects missing and non-numeric data", () => {
  assert.deepEqual(S.parseData("1， 2; -3.5\n4e1"), [1, 2, -3.5, 40]);
  for (const x of ["", "1", "1,NaN", "1,Infinity", "1,0x10", "1,10001"])
    assert.throws(() => S.parseData(x));
});
test("sample SD and type 7 quartiles differ from population SD / hinges", () => {
  const r = S.describe([1, 2, 3, 4]);
  close(r.sd, Math.sqrt(5 / 3));
  close(r.q1, 1.75);
  close(r.q3, 3.25);
  close(S.describe([3, 3, 3]).sd, 0);
});
test("histogram conserves counts and density including constant values", () => {
  for (const d of [
    [1, 1, 1],
    [0, 1, 2, 3, 4, 5],
    [-5, -4, 0, 3],
  ]) {
    const h = S.histogram(d, 3);
    assert.equal(
      h.reduce((s, b) => s + b.count, 0),
      d.length,
    );
    close(
      h.reduce((s, b) => s + b.density * (b.right - b.left), 0),
      1,
    );
  }
});
test("normal central probability and stable extreme right tail", () => {
  close(S.normalProbability(-1, 1, 0, 1), 0.6826894921370859, 2e-15);
  close(S.normalProbability(8, 9, 0, 1) / 6.21983198586583e-16, 1, 1e-11);
  close(
    S.normalProbability(-9, -8, 0, 1),
    S.normalProbability(8, 9, 0, 1),
    1e-29,
  );
  assert.throws(() => S.normalProbability(1, 0, 0, 1));
});
test("binomial endpoint p=0/1 and exact elementary probabilities", () => {
  close(S.binomial(10, 0.5, 5).probability, 0.623046875);
  assert.equal(S.binomial(10, 0, 0).probability, 1);
  assert.equal(S.binomial(10, 1, 9).probability, 0);
  assert.equal(S.binomial(10, 1, 10).probability, 1);
  assert.throws(() => S.binomial(10, 0.5, 11));
});
test("seeded simulation is repeatable and prefixes preserved when repetitions increase", () => {
  const a = S.sampleMeans("exponential", 5, 100, 2026),
    b = S.sampleMeans("exponential", 5, 200, 2026);
  assert.deepEqual(a, b.slice(0, 100));
  assert.notDeepEqual(a, S.sampleMeans("exponential", 5, 100, 2027));
});
test("t confidence intervals widen at fixed draws when confidence rises", () => {
  const a = S.intervals(20, 0.9, 50, 2026),
    b = S.intervals(20, 0.99, 50, 2026);
  a.forEach((r, i) => {
    assert.equal(r.mean, b[i].mean);
    assert.ok(b[i].lo < r.lo && b[i].hi > r.hi);
    assert.equal(r.covers, r.lo <= 50 && r.hi >= 50);
  });
});
test("Welch t independent SciPy reference and swap symmetry", () => {
  const r = S.welch(30, 50, 10, 35, 55, 12, 0.05),
    s = S.welch(35, 55, 12, 30, 50, 10, 0.05);
  close(r.t, 1.8321510564377976);
  close(r.p, 0.07165945300961937, 3e-10);
  close(r.lo, -0.453606146554, 1e-7);
  close(r.p, s.p, 1e-14);
  close(r.t, -s.t);
  close(r.lo, -s.hi);
});
test("zero effect means t=0 p=1 and effect size zero", () => {
  const r = S.welch(10, 50, 10, 20, 50, 20, 0.05);
  close(r.p, 1, 1e-14);
  assert.equal(r.t, 0);
  assert.equal(r.d, 0);
});
test("regression residuals obey least squares normal equations; outlier is explicitly additional", () => {
  const r = S.correlation(0.6, 40, 2026, false),
    s = S.correlation(0.6, 40, 2026, true);
  assert.deepEqual(s.points.slice(0, 40), r.points);
  assert.equal(s.points.length, 41);
  close(
    r.points.reduce((a, [x, y]) => a + y - r.intercept - r.slope * x, 0),
    0,
    1e-12,
  );
  close(
    r.points.reduce((a, [x, y]) => a + x * (y - r.intercept - r.slope * x), 0),
    0,
    1e-12,
  );
  assert.ok(Math.abs(r.r) <= 1);
});
test("simulation and inference input bounds reject invalid calls", () => {
  for (const run of [
    () => S.sampleMeans("bad", 5, 100, 1),
    () => S.sampleMeans("normal", 0, 100, 1),
    () => S.rng(-1),
    () => S.intervals(2, 0.95, 50, 1),
    () => S.welch(1, 0, 1, 5, 0, 1, 0.05),
    () => S.correlation(1, 20, 1, false),
  ])
    assert.throws(run);
});

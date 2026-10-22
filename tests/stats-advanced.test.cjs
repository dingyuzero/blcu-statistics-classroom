const test = require("node:test"),
  assert = require("node:assert/strict"),
  A = require("../dist/stats-advanced.js");
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)), `${a} != ${b}`);
test("inverse and symmetric eigenvalues agree with analytical matrices", () => {
  const M = [
      [2, 1],
      [1, 2],
    ],
    I = A.mul(M, A.inverse(M));
  I.forEach((r, i) => r.forEach((v, k) => close(v, +(i === k))));
  A.eigenvalues(M).forEach((v, i) => close(v, [3, 1][i]));
  const r = 0.3,
    L = 0.75,
    e = A.eigenvalues(A.factorMatrix(L, r));
  [
    1 + 2 * L * L + 3 * L * L * r,
    1 + 2 * L * L - 3 * L * L * r,
    ...Array(4).fill(1 - L * L),
  ].forEach((x, i) => close(e[i], x));
});
test("Hotelling zero and finite-sample known example", () => {
  const r = A.hotelling(1, -0.5, 0.5, 30, 30);
  close(r.d2, 7 / 3);
  close(r.T2, 35);
  close(r.F, (35 * 57) / 116);
  assert.equal(r.df2, 57);
  close(A.hotelling(0, 0, 0.5, 30, 30).p, 1);
  assert.ok(r.p > 0 && r.p < 0.001);
});
test("mean imputation preserves observed mean and contracts variance", () => {
  for (const k of ["mcar", "mar", "mnar"]) {
    const r = A.missing(k, 0.3);
    assert.ok(r.kept.length > 0 && r.kept.length < 160);
    close(r.filledSD ** 2, (r.observedSD ** 2 * (r.kept.length - 1)) / 159);
  }
});
test("Frisch Waugh Lovell and collinearity geometry", () => {
  for (const rho of [-0.95, 0, 0.95]) {
    const r = A.multiple(rho, 0.5, 1),
      b = A.dot(r.rx, r.ry) / A.dot(r.rx, r.rx);
    close(b, r.fit.beta[1]);
    assert.ok(r.vif >= 1);
    const res = r.fit.res;
    close(A.sum(res), 0, 1e-7);
    close(
      A.dot(
        res,
        r.rows.map((p) => p.x),
      ),
      0,
      1e-7,
    );
  }
});
test("logistic threshold changes errors monotonically while data remain fixed", () => {
  const low = A.logistic(0, 1, 0.2),
    high = A.logistic(0, 1, 0.8);
  assert.ok(low.tp >= high.tp && low.fp >= high.fp);
  close(low.tp + low.fp + low.tn + low.fn, 160);
  assert.deepEqual(
    low.rows.map((r) => r.y),
    high.rows.map((r) => r.y),
  );
  close(A.sigmoid(1000), 1);
  close(A.sigmoid(-1000), 0);
});
test("LDA prior changes boundary and equal-prior midpoint is on boundary", () => {
  close(A.lda(0.6).score(0, 0), 0);
  const r = A.lda(0.6, 0.8);
  close(r.score(1, r.boundary(1)), 0);
  assert.ok(r.score(0, 0) > 0);
});
test("Lloyd updates never increase SSE across K and starting points", () => {
  for (const k of [2, 3, 4])
    for (const init of [0, 1]) {
      const r = A.kmeans(k, 10, init);
      r.history.forEach((v, i) => {
        if (i) assert.ok(v <= r.history[i - 1] + 1e-10);
      });
      assert.equal(r.labels.length, 36);
      assert.ok(r.labels.every((x) => x >= 0 && x < k));
    }
});
test("hierarchical merges preserve all leaves and expected final heights", () => {
  close(A.linkage("single").merges.at(-1).height, 2.6);
  close(A.linkage("complete").merges.at(-1).height, 6.8);
  assert.equal(new Set(A.linkage("single").merges.at(-1).members).size, 6);
});
test("orthogonal rotations preserve communalities and reproduced covariance", () => {
  const r0 = A.rotate(0);
  for (const angle of [-90, -35, 50, 90]) {
    const r = A.rotate(angle);
    r.L.forEach((v, i) => close(A.dot(v, v), A.dot(r0.L[i], r0.L[i])));
    r.cov.flat().forEach((v, i) => close(v, r0.cov.flat()[i]));
  }
});
test("CFA reference and intercept effects", () => {
  close(A.cfa(0.75, 0.3).rms, 0);
  assert.ok(A.cfa(0.5, 0.7).rms > 0);
  const r = A.invariance(0, 0.6, 0.8);
  close(r.itemDifferences[0], 0.6);
  close(A.mean(r.itemDifferences), r.bias);
});
test("path cancellation, attenuation and nested-model null", () => {
  close(A.path(0.6, 0.5, -0.3).total, 0);
  close(A.attenuation(0.8, 0.64, 0.81).observed, 0.576);
  const r = A.nested(0.3, 100);
  close(r.chi, 9.336757267652888);
  close(A.nested(0, 100).p, 1);
  assert.ok(A.nested(0.8, 500).p > 0);
});
test("paired mediation bootstrap is deterministic and matches fitted product", () => {
  const r = A.mediation(0.5, 0.6, 0.1, 50, 2026, 100);
  close(r.estimate, r.aHat * r.bHat);
  assert.ok(r.lo <= r.hi);
  assert.deepEqual(r.boot, A.mediation(0.5, 0.6, 0.1, 50, 2026, 100).boot);
});
test("conditional slopes and indirect effects have correct derivatives", () => {
  const d = 1e-5;
  close(
    (A.conditional(0.5, 0.3, 0.6, d).effect -
      A.conditional(0.5, 0.3, 0.6, 0).effect) /
      d,
    0.18,
  );
  close(A.moderation(0.5, 0.2, 0.3, 2).slope, 1.1);
});
test("ICC and known-variance pooling limits", () => {
  close(A.icc(0, 5, 20).rho, 0);
  close(A.icc(5, 5, 20).deff, 10.5);
  A.pooling(0, 5).forEach((r) => {
    close(r.pooled, 50);
    close(r.weight, 0);
  });
  const rows = A.pooling(3, 5);
  assert.ok(rows[0].weight < rows.at(-1).weight);
  rows.forEach((r) =>
    assert.ok(Math.abs(r.pooled - 50) <= Math.abs(r.raw - 50)),
  );
});
test("centering time preserves predictions and transforms covariance", () => {
  const a = A.growth(4, 1, 0.3, 0),
    b = A.growth(4, 1, 0.3, 3);
  a.rows.forEach((r, i) =>
    r.points.forEach(([t, y], k) => {
      close(y, b.rows[i].points[k][1]);
      close(b.rows[i].centeredIntercept + b.rows[i].slope * (t - 3), y);
    }),
  );
  close(b.var0, 32.2);
  close(b.cov, 4.2);
});

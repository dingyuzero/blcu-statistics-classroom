/* Original teaching models. No textbook examples or participant data are embedded. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("jstat").jStat,
      require("./stats-core.js"),
    );
  else root.AdvancedStats = factory(root.jStat, root.Stats);
})(typeof globalThis !== "undefined" ? globalThis : this, function (j, Stats) {
  "use strict";
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const dot = (a, b) => sum(a.map((x, i) => x * b[i]));
  const transpose = (A) => A[0].map((_, i) => A.map((r) => r[i]));
  const mul = (A, B) => A.map((r) => transpose(B).map((c) => dot(r, c)));
  const identity = (n) =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, k) => +(i === k)),
    );
  function inverse(A) {
    const n = A.length,
      M = A.map((r, i) => [...r, ...identity(n)[i]]);
    for (let k = 0; k < n; k++) {
      let p = k;
      for (let i = k + 1; i < n; i++)
        if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
      if (Math.abs(M[p][k]) < 1e-11) throw Error("矩阵奇异，无法估计。");
      [M[p], M[k]] = [M[k], M[p]];
      const d = M[k][k];
      M[k] = M[k].map((x) => x / d);
      for (let i = 0; i < n; i++)
        if (i !== k) {
          const f = M[i][k];
          M[i] = M[i].map((x, q) => x - f * M[k][q]);
        }
    }
    return M.map((r) => r.slice(n));
  }
  function determinant(A) {
    const M = A.map((r) => r.slice());
    let det = 1;
    for (let k = 0; k < M.length; k++) {
      let p = k;
      for (let i = k + 1; i < M.length; i++)
        if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
      if (Math.abs(M[p][k]) < 1e-14) return 0;
      if (p !== k) {
        [M[p], M[k]] = [M[k], M[p]];
        det = -det;
      }
      const d = M[k][k];
      det *= d;
      for (let i = k + 1; i < M.length; i++) {
        const f = M[i][k] / d;
        for (let q = k + 1; q < M.length; q++) M[i][q] -= f * M[k][q];
      }
    }
    return det;
  }
  function eigenvalues(A) {
    const M = A.map((r) => r.slice()),
      n = A.length;
    for (let it = 0; it < 200; it++) {
      let p = 0,
        q = 1;
      for (let i = 0; i < n; i++)
        for (let k = i + 1; k < n; k++)
          if (Math.abs(M[i][k]) > Math.abs(M[p][q])) {
            p = i;
            q = k;
          }
      if (Math.abs(M[p][q]) < 1e-12) break;
      const theta = 0.5 * Math.atan2(2 * M[p][q], M[q][q] - M[p][p]),
        c = Math.cos(theta),
        s = Math.sin(theta),
        a = M[p][p],
        b = M[q][q],
        v = M[p][q];
      for (let k = 0; k < n; k++)
        if (k !== p && k !== q) {
          const x = M[k][p],
            y = M[k][q];
          M[k][p] = M[p][k] = c * x - s * y;
          M[k][q] = M[q][k] = s * x + c * y;
        }
      M[p][p] = c * c * a - 2 * s * c * v + s * s * b;
      M[q][q] = s * s * a + 2 * s * c * v + c * c * b;
      M[p][q] = M[q][p] = 0;
    }
    return M.map((r, i) => r[i]).sort((a, b) => b - a);
  }
  function normal(rng) {
    return Math.sqrt(-2 * Math.log(rng())) * Math.cos(2 * Math.PI * rng());
  }
  function sample(n, seed = 2026) {
    const rng = Stats.rng(seed);
    return Array.from({ length: n }, () => [
      normal(rng),
      normal(rng),
      normal(rng),
    ]);
  }
  function ols(X, y) {
    if (X.length <= X[0].length) throw Error("观测数不足。");
    const Xt = transpose(X),
      inv = inverse(mul(Xt, X)),
      beta = mul(
        mul(inv, Xt),
        y.map((v) => [v]),
      ).map((r) => r[0]),
      pred = X.map((r) => dot(r, beta)),
      res = y.map((v, i) => v - pred[i]),
      sse = dot(res, res),
      df = y.length - X[0].length,
      mse = sse / df;
    return {
      beta,
      pred,
      res,
      sse,
      df,
      mse,
      se: inv.map((r, i) => Math.sqrt(Math.max(0, r[i] * mse))),
    };
  }
  const quantile = (sorted, p) => {
    const h = (sorted.length - 1) * p,
      i = Math.floor(h);
    return (
      sorted[i] +
      (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (h - i)
    );
  };
  const sigmoid = (x) =>
    x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
  function missing(kind, rate, seed = 2026) {
    const base = sample(160, seed),
      rng = Stats.rng(seed + 17),
      rows = base.map(([x, e]) => {
        const y = 0.7 * x + Math.sqrt(0.51) * e,
          p =
            kind === "mcar"
              ? rate
              : sigmoid(
                  Math.log(rate / (1 - rate)) + 1.5 * (kind === "mar" ? x : y),
                );
        return { x, y, missing: rng() < p, p };
      }),
      kept = rows.filter((r) => !r.missing),
      observed = kept.map((r) => r.y),
      filled = rows.map((r) => (r.missing ? mean(observed) : r.y));
    return {
      rows,
      kept,
      fullMean: mean(rows.map((r) => r.y)),
      observedMean: mean(observed),
      fullSD: j.stdev(
        rows.map((r) => r.y),
        true,
      ),
      observedSD: j.stdev(observed, true),
      filledSD: j.stdev(filled, true),
    };
  }
  const mahalanobis = (x, y, r) =>
    (x * x - 2 * r * x * y + y * y) / (1 - r * r);
  function hotelling(dx, dy, r, n1, n2) {
    const d2 = mahalanobis(dx, dy, r),
      N = n1 + n2,
      pdim = 2,
      T2 = ((n1 * n2) / N) * d2,
      F = ((N - pdim - 1) / (pdim * (N - 2))) * T2,
      df2 = N - pdim - 1,
      p = j.centralF.cdf(1 / F, df2, pdim);
    return { d2, T2, F, p: F === 0 ? 1 : p, df1: pdim, df2 };
  }
  function multiple(rho, b1, b2, seed = 2026) {
    const rows = sample(100, seed).map(([x, e, z]) => ({
      x,
      z: rho * x + Math.sqrt(1 - rho * rho) * e,
      e: z,
    }));
    rows.forEach((r) => (r.y = b1 * r.x + b2 * r.z + r.e));
    const fit = ols(
        rows.map((r) => [1, r.x, r.z]),
        rows.map((r) => r.y),
      ),
      rx = ols(
        rows.map((r) => [1, r.z]),
        rows.map((r) => r.x),
      ),
      ry = ols(
        rows.map((r) => [1, r.z]),
        rows.map((r) => r.y),
      ),
      r = j.corrcoeff(
        rows.map((r) => r.x),
        rows.map((r) => r.z),
      );
    return { rows, fit, rx: rx.res, ry: ry.res, r, vif: 1 / (1 - r * r) };
  }
  function logistic(a, b, cut = 0.5) {
    const rows = sample(160, 2026).map(([x], i) => ({
      x: x * 1.3,
      u: Stats.rng(1000 + i)(),
    }));
    const rng = Stats.rng(8127);
    let tp = 0,
      fp = 0,
      tn = 0,
      fn = 0;
    for (const r of rows) {
      r.p = sigmoid(a + b * r.x);
      r.y = +(rng() < r.p);
      r.guess = +(r.p >= cut);
      if (r.y && r.guess) tp++;
      else if (!r.y && r.guess) fp++;
      else if (!r.y && !r.guess) tn++;
      else fn++;
    }
    return {
      rows,
      tp,
      fp,
      tn,
      fn,
      sensitivity: tp + fn ? tp / (tp + fn) : null,
      specificity: tn + fp ? tn / (tn + fp) : null,
    };
  }
  function lda(rho, prior = 0.5) {
    const w = [1 / (1 + rho), 1 / (1 + rho)],
      shift = Math.log(prior / (1 - prior));
    return {
      w,
      shift,
      score: (x, y) => w[0] * x + w[1] * y + shift,
      boundary: (x) => -(w[0] * x + shift) / w[1],
    };
  }
  function clusterPoints() {
    return sample(36, 309).map(([x, y], i) => [
      x * 0.45 + [-2, 0, 2][i % 3],
      y * 0.45 + [0, 1.8, -0.4][i % 3],
    ]);
  }
  function kmeans(k, steps, initial = 0) {
    const points = clusterPoints();
    let centers = (initial === 0 ? [0, 1, 2, 12] : [0, 3, 6, 9])
        .slice(0, k)
        .map((i) => points[i].slice()),
      labels = [],
      history = [];
    for (let it = 0; it <= steps; it++) {
      labels = points.map((p) =>
        centers
          .map((c) =>
            dot(
              p.map((x, d) => x - c[d]),
              p.map((x, d) => x - c[d]),
            ),
          )
          .reduce((best, x, i, a) => (x < a[best] ? i : best), 0),
      );
      const sse = sum(
        points.map((p, i) =>
          sum(p.map((x, d) => (x - centers[labels[i]][d]) ** 2)),
        ),
      );
      history.push(sse);
      if (it < steps)
        centers = centers.map((c, g) => {
          const members = points.filter((_, i) => labels[i] === g);
          return members.length
            ? [0, 1].map((d) => mean(members.map((p) => p[d])))
            : c;
        });
    }
    return { points, centers, labels, history, sse: history.at(-1) };
  }
  function linkage(method) {
    const x = [0, 1, 2.2, 4.8, 6, 6.8];
    let clusters = x.map((_, i) => [i]),
      nodes = x.map((_, i) => ({ pos: i + 1, height: 0 })),
      merges = [];
    while (clusters.length > 1) {
      let best = Infinity,
        a = 0,
        b = 1;
      for (let i = 0; i < clusters.length; i++)
        for (let k = i + 1; k < clusters.length; k++) {
          const ds = clusters[i].flatMap((p) =>
              clusters[k].map((q) => Math.abs(x[p] - x[q])),
            ),
            d = method === "single" ? Math.min(...ds) : Math.max(...ds);
          if (d < best) {
            best = d;
            a = i;
            b = k;
          }
        }
      const left = nodes[a],
        right = nodes[b],
        members = [...clusters[a], ...clusters[b]];
      merges.push({ left, right, height: best, members });
      clusters[a] = members;
      nodes[a] = { pos: (left.pos + right.pos) / 2, height: best };
      clusters.splice(b, 1);
      nodes.splice(b, 1);
    }
    return { x, merges };
  }
  const baseLoadings = [
    [0.8, 0.15],
    [0.75, 0.2],
    [0.7, 0.1],
    [0.1, 0.8],
    [0.2, 0.75],
    [0.15, 0.7],
  ];
  function rotate(deg) {
    const t = (deg * Math.PI) / 180,
      c = Math.cos(t),
      s = Math.sin(t),
      L = baseLoadings.map(([x, y]) => [c * x + s * y, -s * x + c * y]);
    return {
      L,
      original: baseLoadings,
      communalities: L.map((r) => dot(r, r)),
      cov: mul(L, transpose(L)),
    };
  }
  function factorMatrix(loading = 0.75, rho = 0.3) {
    return Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 6 }, (_, k) =>
        i === k
          ? 1
          : loading *
            loading *
            (Math.floor(i / 3) === Math.floor(k / 3) ? 1 : rho),
      ),
    );
  }
  function cfa(loading, rho) {
    const observed = factorMatrix(0.75, 0.3),
      implied = factorMatrix(loading, rho),
      res = observed.map((r, i) => r.map((x, k) => x - implied[i][k]));
    return {
      observed,
      implied,
      res,
      rms: Math.sqrt(mean(res.flat().map((x) => x * x))),
      errorVariance: 1 - loading * loading,
    };
  }
  function invariance(delta, intercept, loading) {
    return {
      latentDifference: delta,
      itemDifferences: [
        loading * delta + intercept,
        loading * delta,
        loading * delta,
      ],
      bias: intercept / 3,
    };
  }
  function path(a, b, c) {
    return { direct: c, indirect: a * b, total: c + a * b };
  }
  function equivalent(r) {
    return { rXY: r, rYZ: r, rXZ: r * r };
  }
  function attenuation(r, reliabilityX, reliabilityY) {
    return { observed: r * Math.sqrt(reliabilityX * reliabilityY), latent: r };
  }
  // Two-variable standardized Gaussian covariance model. Restricted r=0 vs one free r.
  function nested(r, n) {
    const discrepancy = -Math.log1p(-r * r),
      chi = (n - 1) * discrepancy;
    return {
      chi,
      df: 1,
      p: 2 * Stats.normalProbability(Math.sqrt(chi), 40, 0, 1),
      discrepancy,
    };
  }
  function mediation(a, b, c, n = 80, seed = 2026, B = 400) {
    const data = sample(n, seed).map(([x, e, z]) => {
        const m = a * x + e;
        return { x, m, y: c * x + b * m + z };
      }),
      fitA = ols(
        data.map((r) => [1, r.x]),
        data.map((r) => r.m),
      ),
      fitY = ols(
        data.map((r) => [1, r.x, r.m]),
        data.map((r) => r.y),
      ),
      estimate = fitA.beta[1] * fitY.beta[2];
    const rng = Stats.rng(seed + 81),
      boot = [];
    for (let i = 0; i < B; i++) {
      const d = Array.from({ length: n }, () => data[Math.floor(rng() * n)]),
        A = ols(
          d.map((r) => [1, r.x]),
          d.map((r) => r.m),
        ),
        Y = ols(
          d.map((r) => [1, r.x, r.m]),
          d.map((r) => r.y),
        );
      boot.push(A.beta[1] * Y.beta[2]);
    }
    boot.sort((x, y) => x - y);
    return {
      data,
      estimate,
      boot,
      lo: quantile(boot, 0.025),
      hi: quantile(boot, 0.975),
      aHat: fitA.beta[1],
      bHat: fitY.beta[2],
    };
  }
  function moderation(b1, b2, b3, w) {
    return { intercept: b2 * w, slope: b1 + b3 * w };
  }
  function conditional(a, interaction, b, w) {
    return { effect: (a + interaction * w) * b, index: interaction * b };
  }
  function icc(tau, sigma, m) {
    const rho = (tau * tau) / (tau * tau + sigma * sigma);
    return { rho, deff: 1 + (m - 1) * rho, effective: m / (1 + (m - 1) * rho) };
  }
  function pooling(tau, sigma) {
    const ns = [3, 5, 8, 12, 20, 40],
      zs = [-1.2, 0.7, -0.5, 1.1, 0.3, -0.8],
      es = [1, -1.2, 0.8, -0.6, 1.1, -0.7];
    return ns.map((n, i) => {
      const truth = 50 + tau * zs[i],
        raw = truth + (sigma / Math.sqrt(n)) * es[i],
        weight = (tau * tau) / (tau * tau + (sigma * sigma) / n);
      return { n, truth, raw, weight, pooled: 50 + weight * (raw - 50) };
    });
  }
  function growth(sd0, sd1, rho, center = 0) {
    const z = [
        [-1.2, -0.6],
        [-0.8, 0.8],
        [-0.3, -1.2],
        [0.3, 1.2],
        [0.8, -0.8],
        [1.2, 0.6],
      ],
      intercepts = z.map(([x]) => 50 + sd0 * x),
      slopes = z.map(
        ([x, y]) => 2 + sd1 * (rho * x + Math.sqrt(1 - rho * rho) * y),
      );
    return {
      rows: intercepts.map((v, i) => ({
        intercept: v,
        centeredIntercept: v + slopes[i] * center,
        slope: slopes[i],
        points: Array.from({ length: 7 }, (_, t) => [
          t - center,
          v + slopes[i] * t,
        ]),
      })),
      var0:
        sd0 * sd0 + 2 * center * rho * sd0 * sd1 + center * center * sd1 * sd1,
      cov: rho * sd0 * sd1 + center * sd1 * sd1,
    };
  }
  return {
    mean,
    sum,
    dot,
    transpose,
    mul,
    inverse,
    determinant,
    eigenvalues,
    sample,
    ols,
    sigmoid,
    missing,
    mahalanobis,
    hotelling,
    multiple,
    logistic,
    lda,
    kmeans,
    linkage,
    rotate,
    factorMatrix,
    cfa,
    invariance,
    path,
    equivalent,
    attenuation,
    nested,
    mediation,
    moderation,
    conditional,
    icc,
    pooling,
    growth,
  };
});

(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("jstat").jStat,
      require("simple-statistics"),
    );
  else root.Stats = factory(root.jStat, root.ss);
})(typeof window === "undefined" ? globalThis : window, function (jStat, ss) {
  "use strict";
  function finite(v, name = "数值") {
    if (!Number.isFinite(v)) throw Error(name + "必须是有限数。");
    return v;
  }
  function bounded(v, lo, hi, name) {
    finite(v, name);
    if (v < lo || v > hi)
      throw Error(name + "应在 " + lo + " 至 " + hi + " 之间。");
    return v;
  }
  function integer(v, lo, hi, name) {
    bounded(v, lo, hi, name);
    if (!Number.isInteger(v)) throw Error(name + "必须为整数。");
    return v;
  }
  function parseData(text) {
    const tokens = text
      .trim()
      .split(/[\s,，;；]+/)
      .filter(Boolean);
    if (tokens.length < 2 || tokens.length > 200)
      throw Error("请输入 2–200 个数，用逗号、空格或换行分隔。");
    return tokens.map((t) => {
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(t))
        throw Error("无法识别数值：" + t.slice(0, 20));
      return bounded(Number(t), -10000, 10000, "数据");
    });
  }
  function describe(data) {
    if (data.length < 2) throw Error("至少需要两个观测值。");
    data.forEach((x) => bounded(x, -10000, 10000, "数据"));
    // Hyndman-Fan type 7: linear interpolation at (n - 1) p.
    const sorted = [...data].sort((a, b) => a - b);
    const q = (p) => {
      const h = (sorted.length - 1) * p, i = Math.floor(h);
      return sorted[i] + (h - i) * ((sorted[i + 1] ?? sorted[i]) - sorted[i]);
    };
    const q1 = q(0.25), q3 = q(0.75);
    return {
      n: data.length,
      mean: ss.mean(data),
      median: ss.median(data),
      sd: ss.sampleStandardDeviation(data),
      q1,
      q3,
      iqr: q3 - q1,
      min: ss.min(data),
      max: ss.max(data),
    };
  }
  function histogram(data, bins = 12) {
    integer(bins, 1, 50, "组数");
    if (!data.length) throw Error("没有可绘制的数据。");
    data.forEach((x) => finite(x));
    let lo = Math.min(...data),
      hi = Math.max(...data);
    if (lo === hi) {
      lo -= 0.5;
      hi += 0.5;
    }
    const width = (hi - lo) / bins,
      counts = Array(bins).fill(0);
    data.forEach(
      (v) => counts[Math.min(bins - 1, Math.floor((v - lo) / width))]++,
    );
    return counts.map((count, i) => ({
      left: lo + i * width,
      right: lo + (i + 1) * width,
      count,
      density: count / (data.length * width),
    }));
  }
  function adaptiveIntegral(f, a, b, tol = 1e-12, maxDepth = 18) {
    const simpson = (a, b, fa, fm, fb) => ((b - a) * (fa + 4 * fm + fb)) / 6;
    function split(a, b, fa, fm, fb, whole, eps, depth) {
      const m = (a + b) / 2,
        fl = f((a + m) / 2),
        fr = f((m + b) / 2),
        left = simpson(a, m, fa, fl, fm),
        right = simpson(m, b, fm, fr, fb),
        delta = left + right - whole;
      if (depth === 0 || Math.abs(delta) <= 15 * eps)
        return left + right + delta / 15;
      return (
        split(a, m, fa, fl, fm, left, eps / 2, depth - 1) +
        split(m, b, fm, fr, fb, right, eps / 2, depth - 1)
      );
    }
    const fa = f(a),
      fb = f(b),
      fm = f((a + b) / 2);
    return split(a, b, fa, fm, fb, simpson(a, b, fa, fm, fb), tol, maxDepth);
  }
  // Integrate the scaled tail instead of subtracting two CDFs close to one.
  function normalSurvival(z) {
    if (z < 0) return 1 - normalSurvival(-z);
    if (z < 4) return 0.5 * (1 - jStat.erf(z / Math.SQRT2));
    if (z > 38) return 0; // Below the useful range of IEEE 754 double precision.
    const scaled = adaptiveIntegral(
      (u) => Math.exp(-u - (u * u) / (2 * z * z)),
      0,
      40,
    );
    return (Math.exp((-z * z) / 2) / (Math.sqrt(2 * Math.PI) * z)) * scaled;
  }
  function normalProbability(a, b, mu, sd) {
    [a, b, mu].forEach((x) => finite(x));
    bounded(sd, 0.1, 100, "标准差");
    if (a >= b) throw Error("区间左端必须小于右端。");
    const z1 = (a - mu) / sd,
      z2 = (b - mu) / sd;
    // A scaled tail integral avoids cancellation in 1-cdf for |z| >= 4.
    const tail = normalSurvival;
    return Math.max(
      0,
      Math.min(
        1,
        z1 >= 0
          ? tail(z1) - tail(z2)
          : z2 <= 0
            ? tail(-z2) - tail(-z1)
            : 1 - tail(-z1) - tail(z2),
      ),
    );
  }
  function binomial(n, p, k) {
    integer(n, 1, 60, "试验次数");
    bounded(p, 0, 1, "成功概率");
    integer(k, 0, n, "成功次数");
    const rows = Array.from({ length: n + 1 }, (_, x) => [
      x,
      jStat.binomial.pdf(x, n, p),
    ]);
    return {
      rows,
      probability: Math.min(
        1,
        rows.slice(0, k + 1).reduce((s, r) => s + r[1], 0),
      ),
    };
  }
  function rng(seed) {
    integer(seed, 0, 2147483647, "随机种子");
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return (state + 0.5) / 4294967296;
    };
  }
  function normalRandom(random) {
    return (
      Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random())
    );
  }
  function sampleOne(random, kind) {
    if (kind === "normal") return 50 + 10 * normalRandom(random);
    if (kind === "uniform") return 50 + 10 * Math.sqrt(12) * (random() - 0.5);
    if (kind === "exponential") return 50 + 10 * (-Math.log(random()) - 1);
    throw Error("未知总体分布。");
  }
  function sampleMeans(kind, n, repetitions, seed) {
    integer(n, 1, 100, "每次样本量");
    integer(repetitions, 20, 2000, "重复次数");
    const random = rng(seed);
    return Array.from({ length: repetitions }, () => {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += sampleOne(random, kind);
      return sum / n;
    });
  }
  function intervals(n, confidence, repetitions, seed) {
    integer(n, 3, 100, "样本量");
    bounded(confidence, 0.8, 0.999, "置信水平");
    integer(repetitions, 10, 200, "重复次数");
    const random = rng(seed),
      critical = jStat.studentt.inv((1 + confidence) / 2, n - 1);
    return Array.from({ length: repetitions }, (_, i) => {
      const x = Array.from({ length: n }, () => sampleOne(random, "normal")),
        mean = ss.mean(x),
        sd = ss.sampleStandardDeviation(x),
        margin = (critical * sd) / Math.sqrt(n);
      return {
        index: i + 1,
        mean,
        sd,
        lo: mean - margin,
        hi: mean + margin,
        covers: mean - margin <= 50 && mean + margin >= 50,
      };
    });
  }
  function welch(n1, m1, s1, n2, m2, s2, alpha) {
    integer(n1, 2, 1000, "A 组样本量");
    integer(n2, 2, 1000, "B 组样本量");
    [m1, m2].forEach((x) => bounded(x, -10000, 10000, "均值"));
    [s1, s2].forEach((x) => bounded(x, 0.1, 1000, "样本标准差"));
    bounded(alpha, 0.001, 0.2, "显著性水平");
    const a = (s1 * s1) / n1,
      b = (s2 * s2) / n2,
      se = Math.sqrt(a + b),
      df = (a + b) ** 2 / ((a * a) / (n1 - 1) + (b * b) / (n2 - 1)),
      difference = m2 - m1,
      t = difference / se,
      p = Math.min(1, 2 * jStat.studentt.cdf(-Math.abs(t), df)),
      critical = jStat.studentt.inv(1 - alpha / 2, df),
      pooled = Math.sqrt(
        ((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2),
      );
    return {
      difference,
      se,
      df,
      t,
      p,
      critical,
      lo: difference - critical * se,
      hi: difference + critical * se,
      d: difference / pooled,
    };
  }
  function correlation(rho, n, seed, outlier) {
    bounded(rho, -0.95, 0.95, "总体相关");
    integer(n, 10, 100, "样本量");
    const random = rng(seed),
      points = Array.from({ length: n }, () => {
        const x = normalRandom(random),
          z = normalRandom(random);
        return [x, rho * x + Math.sqrt(1 - rho * rho) * z];
      });
    if (outlier) points.push([4, -4]);
    const fit = ss.linearRegression(points),
      r = ss.sampleCorrelation(
        points.map((p) => p[0]),
        points.map((p) => p[1]),
      );
    return { points, slope: fit.m, intercept: fit.b, r, r2: r * r };
  }
  return {
    parseData,
    describe,
    histogram,
    normalProbability,
    binomial,
    rng,
    sampleMeans,
    intervals,
    welch,
    correlation,
    normalPDF: jStat.normal.pdf,
    tPDF: jStat.studentt.pdf,
    bounded,
    integer,
  };
});

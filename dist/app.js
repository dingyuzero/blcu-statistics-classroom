"use strict";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const teal = "#278b85",
  purple = "#8061b4",
  orange = "#d38c50",
  red = "#bf626b";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fmt = (v, d = 4) =>
  Number.isFinite(v)
    ? v === 0
      ? "0"
      : Math.abs(v) < 10 ** -d || Math.abs(v) >= 1e6
        ? v.toExponential(Math.min(d, 4))
        : String(Number(v.toFixed(d)))
    : "未定义";
const topics = [
  {
    id: "descriptive",
    title: "描述统计",
    en: "DESCRIPTIVE STATISTICS",
    desc: "用均值、中位数与离散程度，认识一组数据。",
    tags: "数据输入 · 异常值",
    time: "5–8 分钟",
    hint: "一个很慢的反应，会怎样改变平均数？",
  },
  {
    id: "distribution",
    title: "概率分布",
    en: "PROBABILITY DISTRIBUTIONS",
    desc: "从曲线下的面积，到离散事件的概率。",
    tags: "正态分布 · 二项分布",
    time: "8–10 分钟",
    hint: "曲线的高度，为什么不等于概率？",
  },
  {
    id: "sampling",
    title: "抽样与中心极限定理",
    en: "SAMPLING & THE CLT",
    desc: "重复抽样，让样本均值的分布逐渐显现。",
    tags: "随机种子 · 标准误",
    time: "8–12 分钟",
    hint: "总体偏斜，样本均值的分布也一定偏斜吗？",
  },
  {
    id: "confidence",
    title: "置信区间",
    en: "CONFIDENCE INTERVALS",
    desc: "重复构造区间，理解置信水平的长期含义。",
    tags: "覆盖率 · 区间宽度",
    time: "8–10 分钟",
    hint: "95% 置信，究竟在描述什么？",
  },
  {
    id: "hypothesis",
    title: "假设检验",
    en: "HYPOTHESIS TESTING",
    desc: "改变均值差与样本量，观察证据如何变化。",
    tags: "Welch t 检验 · 效应量",
    time: "10–12 分钟",
    hint: "同样的均值差，为什么会得到不同的 p 值？",
  },
  {
    id: "regression",
    title: "相关与回归",
    en: "CORRELATION & REGRESSION",
    desc: "在散点与回归线中，观察关系和异常值。",
    tags: "Pearson r · 最小二乘",
    time: "8–10 分钟",
    hint: "一个异常点，会怎样改变相关与回归？",
  },
];
let current = "",
  currentModule = "main",
  scene = null,
  toastTimer = null,
  exportUrl = null,
  currentTable = null,
  lastPlotParameters = "",
  formulaPlain = "",
  lastSignature = "",
  resourceFilter = "all",
  resourceQuery = "";
const storageKey = "blcu.statistics.v1";
function toast(msg) {
  $("#toast").textContent = msg;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3000);
}
function controls() {
  return Object.fromEntries(
    $$(
      ".control-panel input[id],.control-panel select[id],.control-panel textarea[id]",
    ).map((e) => [e.id, e.type === "checkbox" ? e.checked : e.value]),
  );
}
function readStore() {
  try {
    const x = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return x && typeof x === "object" && !Array.isArray(x) ? x : {};
  } catch {
    return {};
  }
}
function persist(snapshot) {
  try {
    const all = readStore();
    if (snapshot === null) delete all[stateKey()];
    else all[stateKey()] = snapshot;
    localStorage.setItem(storageKey, JSON.stringify(all));
  } catch {
    $("#saved-state").textContent =
      "浏览器未开放本地存储；当前页面内仍可使用。";
  }
}
function restore() {
  const saved = readStore()[stateKey()];
  if (saved && typeof saved === "object")
    for (const e of $$(
      ".control-panel input[id],.control-panel select[id],.control-panel textarea[id]",
    ))
      if (Object.hasOwn(saved, e.id)) {
        if (e.type === "checkbox") e.checked = saved[e.id] === true;
        else if (typeof saved[e.id] === "string" && saved[e.id].length <= 6000) {
          const value = saved[e.id];
          if (e.tagName === "SELECT" && ![...e.options].some(o => o.value === value)) continue;
          if (["range", "number"].includes(e.type) && (value.trim() === "" || !Number.isFinite(Number(value)) || Number(value) < Number(e.min) || Number(value) > Number(e.max))) continue;
          e.value = value;
        }
      }
  lastSignature = JSON.stringify(controls());
}
function num(id) {
  return Number($("#" + id).value);
}
function validate() {
  for (const el of $$(".control-panel input,.control-panel select"))
    if (!el.disabled && !el.checkValidity())
      throw Error(
        (el.getAttribute("aria-label") ||
          el.closest("label")?.querySelector(".field-top")?.textContent ||
          "参数") + "超出范围或未填写。",
      );
}
function syncOutputs() {
  $$("input[type=range]").forEach((el) => {
    $("#" + el.id + "-value").textContent = el.value;
  });
}
function bind(draw) {
  const update = () => {
    try {
      syncOutputs();
      validate();
      draw();
      $("#error").textContent = "";
      const snapshot = controls(),
        signature = JSON.stringify(snapshot);
      if (signature !== lastSignature) {
        persist(snapshot);
        lastSignature = signature;
      }
    } catch (e) {
      $("#error").textContent = e.message + " 图形与导出仍保留上一次有效结果。";
    }
  };
  $$(".control-panel input,.control-panel select").forEach((el) =>
    el.addEventListener("input", update),
  );
  $("#apply-data")?.addEventListener("click", update);
  $("#view-reset").onclick = update;
  update();
  return update;
}
function smallMetrics(items) {
  $("#mini-stats").innerHTML = items
    .map(
      ([v, l]) =>
        `<div class="mini-stat"><b>${esc(v)}</b><small>${esc(l)}</small></div>`,
    )
    .join("");
}
function values(main, detail = "") {
  $("#metric").textContent = main;
  $("#metric-detail").textContent = detail;
}
function setMath(plain, note, latex) {
  formulaPlain = plain;
  $("#formula").textContent = plain;
  if (latex)
    try {
      katex.render(latex, $("#formula"), {
        displayMode: true,
        throwOnError: true,
        trust: false,
      });
    } catch {}
  $("#formula-note").textContent = note;
  $("#formula-result").textContent = plain;
  lastPlotParameters = $$(
    ".control-panel input[id],.control-panel select[id],.control-panel textarea[id]",
  )
    .filter((el) => !el.disabled)
    .map((el) => {
      const label =
        el.getAttribute("aria-label") ||
        el.closest("label")?.querySelector(".field-top")?.firstChild
          ?.textContent ||
        el.id;
      const value =
        el.tagName === "SELECT"
          ? el.selectedOptions[0].textContent
          : el.type === "checkbox"
            ? el.checked
              ? "是"
              : "否"
            : el.tagName === "TEXTAREA"
              ? "见数值表"
              : el.value;
      return label + "：" + value;
    })
    .join("；");
}
function table(headers, rows) {
  currentTable = { headers, rows, parameters: lastPlotParameters };
  $("#data-table").innerHTML =
    "<thead><tr>" +
    headers.map((x) => '<th scope="col">' + esc(x) + "</th>").join("") +
    "</tr></thead><tbody>" +
    rows
      .slice(0, 200)
      .map(
        (row) =>
          "<tr>" +
          row
            .map(
              (v) =>
                "<td>" + esc(typeof v === "number" ? fmt(v, 6) : v) + "</td>",
            )
            .join("") +
          "</tr>",
      )
      .join("") +
    "</tbody>";
  $("#data-info").textContent =
    `共 ${rows.length} 行，页面最多显示 200 行；CSV 导出全部记录与当前参数。`;
}
function exportCSV() {
  if (!currentTable) return;
  const cell = (v) => '"' + String(v).replace(/"/g, '""') + '"',
    rows = [
      ["实验", activeTitle()],
      ["署名", "北京语言大学 Ding Lab"],
      ["说明", "课堂演示数据；除手工输入外均为模拟，非真实被试数据"],
      ["参数", currentTable.parameters],
      [],
      currentTable.headers,
      ...currentTable.rows,
    ];
  downloadArtifact(
    new Blob(["\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8",
    }),
    `统计课堂-${stateKey().replace(":", "-")}.csv`,
    "已导出完整数值表",
  );
}
function scaffold(controlsHTML, legend, steps, question, answer) {
  const t = topics.find((t) => t.id === current);
  $("#main").innerHTML =
    head(
      activeTitle(),
      `LAB / 0${topics.indexOf(t) + 1} — ${t.en}`,
      moduleInfo()[2],
      '<button class="button" id="reset">↺ 重置实验</button>',
    ) + chapterNav() +
    `<div class="lab-layout"><section class="plot-panel"><div class="plot-heading"><h2>${activeTitle()} · 交互画布</h2><div class="plot-tools"><button class="button" id="view-reset">刷新图形</button><button class="button" id="export">导出 SVG ↗</button></div></div><div class="plot-wrap"><div id="plot" class="jxgbox" aria-label="${activeTitle()}交互图形"></div></div><div class="legend">${legend.map((x) => "<span>" + x + "</span>").join("")}</div><div class="plot-caption" id="plot-caption"></div><div class="mini-stats" id="mini-stats"></div><details class="data-panel"><summary>查看数值表 · 把观察变成证据</summary><div class="data-tools"><p id="data-info"></p><button class="button" id="export-csv">导出 CSV</button></div><div class="table-scroll"><table id="data-table"></table></div></details></section><aside class="control-panel"><h2 class="panel-title"><span>☷</span>实验控制台</h2>${controlsHTML}${metric("当前观察")}<div class="error" id="error" role="alert"></div><p class="saved-state" id="saved-state">有效参数自动保存在本机 · 重置恢复默认</p></aside></div><div class="formula-band"><span class="label">统计表达</span><div><div id="formula" class="formula"></div><div id="formula-result" class="formula-result"></div><div id="formula-note" class="formula-note"></div></div></div>${notes(steps, question, answer)}<p class="source-note">图形：JSXGraph · 计算：jStat / simple-statistics · 内置示例及模拟均为课堂合成数据。<a href="#resources">查看开源来源</a></p>`;
  restore();
  $("#reset").onclick = () => {
    persist(null);
    route();
    toast("本实验已恢复默认参数");
  };
  $("#export").onclick = exportSVG;
  $("#export-csv").onclick = exportCSV;
}
function init(box) {
  if (!scene) scene = new ClassroomPlot("plot");
  scene.begin(box);
}
function line(xs, ys, color = teal, width = 2.5, dash = 0, fill = "none") {
  return scene.data(xs, ys, {
    strokeColor: color,
    strokeWidth: width,
    dash,
    fillColor: fill,
    fillOpacity: 0.18,
  });
}
function segment(a, b, color = orange, width = 2, dash = 0) {
  line([a[0], b[0]], [a[1], b[1]], color, width, dash);
}
function curve(f, lo, hi, color = teal) {
  const xs = Array.from({ length: 401 }, (_, i) => lo + ((hi - lo) * i) / 400);
  line(xs, xs.map(f), color);
}
function area(f, lo, hi, color = teal) {
  if (hi <= lo) return;
  const xs = Array.from({ length: 161 }, (_, i) => lo + ((hi - lo) * i) / 160);
  line([lo, ...xs, hi, lo], [0, ...xs.map(f), 0, 0], color, 0, 0, color);
}
function bars(rows, density = false) {
  const xs = [],
    ys = [];
  for (const b of rows) {
    xs.push(b.left, b.left, b.right, b.right, b.left, NaN);
    const h = density ? b.density : b.count;
    ys.push(0, h, h, 0, 0, NaN);
  }
  line(xs, ys, teal, 0.8, 0, teal);
}
function dot(x, y, color = teal, size = 2.4) {
  scene.point(x, y, {
    strokeColor: color,
    fillColor: color,
    size,
    strokeWidth: 1,
  });
}
function seedField(value = 2026) {
  return number("seed", "随机种子", value, 0, 2147483647, 1).replace(
    'step="any"',
    'step="1"',
  );
}
function descriptive() {
  scaffold(
    `<label class="field"><span class="field-top">输入数据</span><textarea id="data" aria-label="输入数据">420, 445, 460, 475, 480, 490, 500, 510, 520, 540, 560, 600</textarea><small>默认示例为反应时（ms）。可输入其他数值；2–200 个数，范围 −10000 至 10000。</small></label><button class="button primary full" id="apply-data">应用数据</button><button class="button full" id="outlier-data">加入一个 1500</button>${range("bins", "直方图组数", 8, 3, 20)}`,
    ["绿色：频数直方图", "橙色：均值", "紫色虚线：中位数"],
    [
      "比较均值与中位数的位置。",
      "加入一个很慢的反应，观察两者变化。",
      "修改数据，再点击“应用数据”。",
    ],
    "平均数能代表所有人吗？",
    "均值对极端值敏感，中位数更稳健；离散程度和分布形状同样重要。异常值是否排除需要研究设计与预先规则，不能只因影响结果就删除。",
  );
  const update = bind(() => {
    const data = Stats.parseData($("#data").value),
      s = Stats.describe(data),
      hist = Stats.histogram(data, num("bins")),
      span = s.max - s.min || 1,
      top = Math.max(...hist.map((x) => x.count)) * 1.25;
    init([
      hist[0].left - span * 0.08,
      top,
      hist.at(-1).right + span * 0.08,
      -top * 0.13,
    ]);
    bars(hist);
    segment([s.mean, 0], [s.mean, top * 0.92], orange);
    segment([s.median, 0], [s.median, top * 0.92], purple, 2, 2);
    values(fmt(s.mean, 2), "均值；样本标准差采用 n−1 作分母。");
    smallMetrics([
      [fmt(s.median, 2), "中位数"],
      [fmt(s.sd, 2), "样本标准差"],
      [fmt(s.iqr, 2), "四分位距"],
    ]);
    setMath(
      `n = ${s.n}；均值 = ${fmt(s.mean)}；s = ${fmt(s.sd)}`,
      "四分位数采用 type 7 线性插值，不同软件默认算法可能不同。",
      String.raw`\bar{x}=\frac{1}{n}\sum_{i=1}^{n}x_i,\quad s=\sqrt{\frac{\sum (x_i-\bar{x})^2}{n-1}}`,
    );
    table(
      ["序号", "输入值_原单位"],
      data.map((x, i) => [i + 1, x]),
    );
    $("#plot-caption").textContent =
      `横轴：数据值（默认示例为 ms） · 纵轴：频数 · n=${s.n} · Q₁=${fmt(s.q1)}，Q₃=${fmt(s.q3)}`;
  });
  $("#outlier-data").onclick = () => {
    try {
      const d = Stats.parseData($("#data").value);
      if (d.length >= 200) throw Error("数据已达 200 个，无法继续添加。");
      $("#data").value = d.concat(1500).join(", ");
      update();
    } catch (e) {
      $("#error").textContent = e.message;
    }
  };
}
function distribution() {
  scaffold(
    select("family", "分布类型", [
      ["normal", "正态分布"],
      ["binomial", "二项分布"],
    ]) +
      `<div id="normal-controls">${range("mu", "总体均值 μ", 0, -5, 5, 0.1)}${range("sigma", "总体标准差 σ", 1, 0.2, 3, 0.1)}<div class="paired-fields">${number("left", "区间左端 a", -1, -20, 20)}${number("right", "区间右端 b", 1, -20, 20)}</div></div><div id="binomial-controls">${range("trials", "试验次数 n", 10, 1, 60)}${range("prob", "成功概率 p", 0.5, 0, 1, 0.01)}${range("successes", "成功次数上限 k", 5, 0, 60)}</div>`,
    ["绿色：概率密度 / 概率质量", "阴影或橙色：所选事件"],
    [
      "正态分布中改变区间，比较面积。",
      "减小标准差，观察密度高度可大于 1。",
      "切换二项分布，观察成功次数的离散概率。",
    ],
    "密度超过 1，违反概率规则吗？",
    "不违反。连续型变量的概率是区间上的密度积分，单点概率为零；二项分布的每根柱高则是对应离散事件的概率。",
  );
  function toggle() {
    const isNormal = $("#family").value === "normal";
    for (const [id, show] of [
      ["normal-controls", isNormal],
      ["binomial-controls", !isNormal],
    ]) {
      $("#" + id).hidden = !show;
      $("#" + id)
        .querySelectorAll("input")
        .forEach((x) => (x.disabled = !show));
    }
    $("#successes").max = $("#trials").value;
    $("#successes")
      .closest("label")
      .querySelector(".range-ends span:last-child").textContent =
      $("#trials").value;
    if (num("successes") > num("trials"))
      $("#successes").value = $("#trials").value;
  }
  $("#family").addEventListener("input", toggle);
  $("#trials").addEventListener("input", toggle);
  toggle();
  bind(() => {
    if ($("#family").value === "normal") {
      const mu = num("mu"),
        sd = num("sigma"),
        a = num("left"),
        b = num("right"),
        p = Stats.normalProbability(a, b, mu, sd),
        lo = Math.min(mu - 4 * sd, a),
        hi = Math.max(mu + 4 * sd, b),
        peak = Stats.normalPDF(mu, mu, sd);
      init([lo, peak * 1.25, hi, -peak * 0.16]);
      area((x) => Stats.normalPDF(x, mu, sd), a, b);
      curve((x) => Stats.normalPDF(x, mu, sd), lo, hi);
      values(fmt(p, 6), "P(a ≤ X ≤ b)；连续型分布端点不影响概率。");
      smallMetrics([
        [fmt(mu), "总体均值 μ"],
        [fmt(sd), "总体标准差 σ"],
        [(p * 100).toFixed(3) + "%", "区间概率"],
      ]);
      setMath(
        `X ~ N(${mu}, ${sd}²)；P(${a} ≤ X ≤ ${b}) = ${fmt(p, 8)}`,
        "横轴为随机变量取值，纵轴为概率密度；图中仅显示有限区间；极端尾部可能低于双精度范围，显示 0 不表示数学上的严格零。",
        String.raw`P(a\le X\le b)=\int_a^b\frac{e^{-\frac{(x-\mu)^2}{2\sigma^2}}}{\sigma\sqrt{2\pi}}\,dx`,
      );
      table(["左端a", "右端b", "μ", "σ", "区间概率"], [[a, b, mu, sd, p]]);
      $("#plot-caption").textContent =
        "横轴：X · 纵轴：概率密度 · 阴影面积对应区间概率。";
    } else {
      const n = num("trials"),
        p = num("prob"),
        k = num("successes"),
        result = Stats.binomial(n, p, k),
        top = Math.max(...result.rows.map((r) => r[1])) * 1.25;
      init([-1, top, n + 1, -top * 0.14]);
      for (const [x, y] of result.rows) {
        segment([x, 0], [x, y], x <= k ? orange : teal, n > 30 ? 3 : 6);
        dot(x, y, x <= k ? orange : teal, 2);
      }
      values(fmt(result.probability, 6), "P(X ≤ k)，含 k。");
      smallMetrics([
        [fmt(n * p), "理论均值 np"],
        [fmt(Math.sqrt(n * p * (1 - p))), "理论标准差"],
        [String(k), "所选上限 k"],
      ]);
      setMath(
        `X ~ Bin(${n},${p})；P(X ≤ ${k}) = ${fmt(result.probability, 8)}`,
        "假设每次试验独立、成功概率保持不变；可类比固定正确率下的答对题数。",
        String.raw`P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}`,
      );
      table(
        ["成功次数k", "P(X=k)", "是否属于当前事件"],
        result.rows.map(([x, y]) => [x, y, x <= k ? "是" : "否"]),
      );
      $("#plot-caption").textContent =
        "横轴：成功次数 · 纵轴：概率质量 · 橙色柱的概率相加得到 P(X≤k)。";
    }
  });
}
function sampling() {
  scaffold(
    select("population", "总体形状", [
      ["exponential", "右偏：平移缩放的指数分布"],
      ["normal", "正态分布"],
      ["uniform", "均匀分布"],
    ]) +
      range("n", "每次样本量 n", 5, 1, 100) +
      range("reps", "重复抽样次数", 500, 100, 2000, 100) +
      seedField() +
      '<button class="button full" id="new-seed">换一组抽样</button>',
    ["绿色：样本均值的密度直方图", "橙色：理论正态近似"],
    [
      "先令 n=1，观察右偏总体的形状。",
      "保持种子不变，逐步增加每次样本量 n。",
      "增加重复次数，观察模拟直方图的稳定程度。",
    ],
    "中心极限定理让原始数据变成正态吗？",
    "近似正态的是独立同分布、有限方差条件下的大样本均值的标准化分布。原始总体形状不会改变。n 足够大取决于总体形状；这里的有限模拟也有随机波动。",
  );
  const update = bind(() => {
    const n = num("n"),
      reps = num("reps"),
      means = Stats.sampleMeans($("#population").value, n, reps, num("seed")),
      s = Stats.describe(means),
      se = 10 / Math.sqrt(n),
      hist = Stats.histogram(means, 20),
      lo = Math.min(hist[0].left, 50 - 4 * se),
      hi = Math.max(hist.at(-1).right, 50 + 4 * se),
      top =
        Math.max(...hist.map((b) => b.density), Stats.normalPDF(50, 50, se)) *
        1.25;
    init([lo, top, hi, -top * 0.14]);
    bars(hist, true);
    curve((x) => Stats.normalPDF(x, 50, se), lo, hi, orange);
    values(fmt(se, 4), "理论标准误 σ/√n；总体均值 50，标准差 10。");
    smallMetrics([
      [fmt(s.mean, 3), "样本均值的平均值"],
      [fmt(s.sd, 3), "样本均值的样本标准差"],
      [String(reps), "重复抽样次数"],
    ]);
    setMath(
      `E(X̄)=50；SE(X̄)=10/√${n}=${fmt(se)}`,
      "所有分布均被设为 μ=50、σ=10；直方图按密度归一化。相同参数与种子给出相同模拟。",
      String.raw`E(\bar X)=\mu,\quad\operatorname{SD}(\bar X)=\frac{\sigma}{\sqrt n}`,
    );
    table(
      ["重复序号", "样本均值"],
      means.map((m, i) => [i + 1, m]),
    );
    $("#plot-caption").textContent =
      "横轴：样本均值 · 纵轴：密度 · 橙线为近似参照，n 较小时未必贴合。";
  });
  $("#new-seed").onclick = () => {
    $("#seed").value = (num("seed") + 1) % 2147483648;
    update();
  };
}
function confidence() {
  scaffold(
    range("n", "每次样本量 n", 20, 3, 100) +
      select("level", "置信水平", [
        ["0.95", "95%"],
        ["0.9", "90%"],
        ["0.99", "99%"],
      ]) +
      range("reps", "重复区间数量", 50, 10, 200, 10) +
      seedField(2025) +
      '<button class="button full" id="new-seed">换一组区间</button>',
    ["绿色：覆盖真实均值", "红色：未覆盖真实均值", "橙色虚线：真实 μ=50"],
    [
      "观察哪些区间没有覆盖真实均值。",
      "保持种子，比较 90%、95% 和 99% 的区间宽度。",
      "更换种子，看覆盖率如何随机波动。",
    ],
    "某个 95% 区间包含真值的概率就是 95% 吗？",
    "频率学派中真均值是固定参数；95% 描述重复使用该程序时区间覆盖真值的长期比例。已经算出的某个区间要么覆盖、要么不覆盖。这里每次从正态总体独立抽样，使用未知方差的 t 区间。",
  );
  const update = bind(() => {
    const n = num("n"),
      level = num("level"),
      reps = num("reps"),
      rows = Stats.intervals(n, level, reps, num("seed")),
      coverage = rows.filter((r) => r.covers).length / reps,
      lo = Math.min(...rows.map((r) => r.lo), 50),
      hi = Math.max(...rows.map((r) => r.hi), 50),
      pad = (hi - lo) * 0.1;
    init([lo - pad, reps + 4, hi + pad, -4]);
    segment([50, 0], [50, reps + 2], orange, 1.5, 2);
    for (const r of rows) {
      segment([r.lo, r.index], [r.hi, r.index], r.covers ? teal : red, 1.8);
      dot(r.mean, r.index, r.covers ? teal : red, 1.3);
    }
    values(
      (coverage * 100).toFixed(1) + "%",
      "本批模拟覆盖率，不保证等于设定的置信水平。",
    );
    smallMetrics([
      [String(rows.filter((r) => r.covers).length), "覆盖真值的区间数"],
      [
        fmt(rows.reduce((s, r) => s + r.hi - r.lo, 0) / reps, 3),
        "平均区间宽度",
      ],
      [String(n - 1), "t 分布自由度"],
    ]);
    setMath(
      `${level * 100}% t 区间；总体 μ=50、σ=10，计算区间时用样本 s。`,
      "每条线是一个新样本的区间；点是该样本均值。总体正态保证此 t 区间的精确覆盖性质。",
      String.raw`\bar{x}\pm t_{1-\alpha/2,n-1}\frac{s}{\sqrt{n}}`,
    );
    table(
      ["重复序号", "样本均值", "样本SD", "区间下限", "区间上限", "覆盖μ=50"],
      rows.map((r) => [
        r.index,
        r.mean,
        r.sd,
        r.lo,
        r.hi,
        r.covers ? "是" : "否",
      ]),
    );
    $("#plot-caption").textContent =
      "横轴：均值及区间端点 · 纵轴：重复序号 · 横线长短表示区间宽度。";
  });
  $("#new-seed").onclick = () => {
    $("#seed").value = (num("seed") + 1) % 2147483648;
    update();
  };
}
function hypothesis() {
  scaffold(
    range("difference", "B−A 均值差", 5, -20, 20, 0.5) +
      range("n1", "A 组样本量", 30, 5, 150) +
      range("n2", "B 组样本量", 35, 5, 150) +
      range("s1", "A 组样本标准差", 10, 2, 30) +
      range("s2", "B 组样本标准差", 12, 2, 30) +
      select("alpha", "显著性水平 α", [
        [".05", "0.05"],
        [".01", "0.01"],
        [".1", "0.10"],
      ]),
    [
      "绿色：H₀ 下的参考 t 密度",
      "阴影：双侧 p 值区域",
      "橙色：观测 t / 紫色虚线：临界值",
    ],
    [
      "固定均值差，只增加两组样本量。",
      "固定样本量，增大标准差，观察 p 值。",
      "比较 p 值、均值差区间与 Cohen d。",
    ],
    "p≥0.05 能证明两组没有差异吗？",
    "不能。p 值是在零假设及模型假设成立时，得到至少同样极端统计量的概率，不是零假设为真的概率。结果还应结合效应量、区间、设计与测量质量。这里使用独立两组、双侧 Welch t 检验。",
  );
  bind(() => {
    const n1 = num("n1"),
      n2 = num("n2"),
      s1 = num("s1"),
      s2 = num("s2"),
      delta = num("difference"),
      alpha = num("alpha"),
      r = Stats.welch(n1, 50, s1, n2, 50 + delta, s2, alpha),
      bound = Math.min(12, Math.max(4, Math.abs(r.t) + 0.8, r.critical + 0.8)),
      peak = Stats.tPDF(0, r.df);
    init([-bound, peak * 1.22, bound, -peak * 0.13]);
    area((x) => Stats.tPDF(x, r.df), -bound, -Math.abs(r.t));
    area((x) => Stats.tPDF(x, r.df), Math.abs(r.t), bound);
    curve((x) => Stats.tPDF(x, r.df), -bound, bound);
    segment([-r.critical, 0], [-r.critical, peak * 0.75], purple, 1.5, 2);
    segment([r.critical, 0], [r.critical, peak * 0.75], purple, 1.5, 2);
    if (Math.abs(r.t) <= bound) segment([r.t, 0], [r.t, peak * 0.95], orange);
    values(
      "p = " + fmt(r.p, 6),
      r.p < alpha
        ? "本例在所选 α 水平下拒绝 H₀。"
        : "本例在所选 α 水平下不拒绝 H₀。",
    );
    smallMetrics([
      [fmt(r.t, 3), "Welch t"],
      [fmt(r.d, 3), "合并SD标准化 Cohen d"],
      [fmt(r.df, 2), "Welch 自由度"],
    ]);
    setMath(
      `均值差 B−A = ${delta}；${(1 - alpha) * 100}% CI [${fmt(r.lo, 3)}, ${fmt(r.hi, 3)}]`,
      "A 均值固定 50；所有输入为假设的样本摘要。d 使用合并样本 SD，作为描述性效应量。",
      String.raw`t=\frac{\bar x_B-\bar x_A}{\sqrt{s_A^2/n_A+s_B^2/n_B}}`,
    );
    table(
      ["均值差B-A", "t", "df", "双侧p", "α", "区间下限", "区间上限", "Cohen_d"],
      [[delta, r.t, r.df, r.p, alpha, r.lo, r.hi, r.d]],
    );
    $("#plot-caption").textContent =
      `横轴：t 统计量 · 纵轴：t 密度 · p 值计算包含图外尾部。${Math.abs(r.t) > bound ? "观测 t 超出当前 ±12 视窗，数值仍完整显示。" : ""}`;
  });
}
function regression() {
  scaffold(
    range("rho", "生成总体相关 ρ", 0.6, -0.95, 0.95, 0.05) +
      range("n", "基础样本量 n", 40, 10, 100) +
      seedField() +
      '<label class="check-field"><input type="checkbox" id="outlier" aria-label="加入异常点">加入异常点 (4, −4)</label><button class="button full" id="new-seed">换一组散点</button>',
    ["绿色：模拟样本", "橙色：最小二乘回归线", "红色：额外异常点"],
    [
      "比较生成用的总体 ρ 与样本 r。",
      "勾选异常点，观察回归斜率和 r。",
      "固定 ρ 更换种子，认识抽样波动。",
    ],
    "相关很强，就能说 X 导致 Y 吗？",
    "不能。相关也可能来自共同原因、选择偏差或反向关系。这里 X、Y 是按已知相关生成的标准化教学变量，没有真实心理测量含义。异常点是额外手工加入的，不属于原始生成总体。",
  );
  const update = bind(() => {
    const n = num("n"),
      rho = num("rho"),
      outlier = $("#outlier").checked,
      r = Stats.correlation(rho, n, num("seed"), outlier),
      xs = r.points.map((p) => p[0]),
      ys = r.points.map((p) => p[1]),
      lo = Math.min(...xs) - 0.6,
      hi = Math.max(...xs) + 0.6,
      yl = Math.min(...ys) - 0.6,
      yh = Math.max(...ys) + 0.6;
    init([lo, yh, hi, yl]);
    r.points.forEach((p, i) =>
      dot(p[0], p[1], outlier && i === r.points.length - 1 ? red : teal, 3),
    );
    segment(
      [lo, r.slope * lo + r.intercept],
      [hi, r.slope * hi + r.intercept],
      orange,
      2.5,
    );
    values(
      "r = " + fmt(r.r, 4),
      "Pearson 样本相关；加入异常点后总样本量为 n+1。",
    );
    smallMetrics([
      [fmt(r.r2, 4), "R²（含截距的一元回归）"],
      [fmt(r.slope, 4), "回归斜率 b"],
      [String(r.points.length), "实际点数"],
    ]);
    setMath(
      `ŷ = ${fmt(r.intercept)} + (${fmt(r.slope)})x；R² = ${fmt(r.r2)}`,
      "总体 ρ 是生成参数，样本 r 有抽样波动。R² 不是因果解释比例。",
      String.raw`\hat y=a+bx,\quad b=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}`,
    );
    table(
      ["序号", "X", "Y", "拟合Y", "残差", "额外异常点"],
      r.points.map(([x, y], i) => [
        i + 1,
        x,
        y,
        r.intercept + r.slope * x,
        y - r.intercept - r.slope * x,
        outlier && i === r.points.length - 1 ? "是" : "否",
      ]),
    );
    $("#plot-caption").textContent =
      "横轴：标准化教学变量 X · 纵轴：标准化教学变量 Y · 二元正态生成 + 可选额外异常点。";
  });
  $("#new-seed").onclick = () => {
    $("#seed").value = (num("seed") + 1) % 2147483648;
    update();
  };
}
function miniGraph(id, hero = false) {
  const w = hero ? 440 : 320,
    h = hero ? 280 : 140,
    c = hero ? 140 : 72;
  let marks = "";
  const path = (f) =>
    Array.from({ length: 120 }, (_, i) => {
      const x = (i / 119) * 6 - 3;
      return (
        (i ? "L" : "M") +
        ((i / 119) * w).toFixed(1) +
        "," +
        (c - f(x) * (hero ? 80 : 42)).toFixed(1)
      );
    }).join(" ");
  if (id === "regression") {
    for (let i = 0; i < 24; i++) {
      const x = 30 + (i * (w - 60)) / 23,
        y = c - (x - w / 2) * 0.22 + Math.sin(i * 2.7) * 22;
      marks += `<circle cx="${x}" cy="${y}" r="3" fill="${teal}" opacity=".7"/>`;
    }
    marks += `<path d="M25 ${c + (w / 2 - 25) * 0.22} L${w - 25} ${c - (w / 2 - 25) * 0.22}" stroke="${orange}" stroke-width="2"/>`;
  } else if (id === "confidence") {
    for (let i = 0; i < 7; i++) {
      const x = w * 0.45 + Math.sin(i * 3) * 20,
        y = 20 + (i * (h - 40)) / 6;
      marks += `<path d="M${x - 40 - i * 2} ${y}h${80 + i * 4}" stroke="${i === 3 ? red : teal}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2" fill="${teal}"/>`;
    }
    marks += `<path d="M${w * 0.45} 8V${h - 8}" stroke="${orange}" stroke-dasharray="4 4"/>`;
  } else {
    const fn = (x) => Math.exp((-x * x) / 2) * 1.2;
    marks = `<path d="${path(fn)} L${w} ${c} L0 ${c}Z" fill="#b8ddd1" opacity=".6"/><path d="${path(fn)}" stroke="${teal}" stroke-width="2.5" fill="none"/>`;
    if (id === "sampling" || hero)
      marks += `<path d="${path((x) => Math.exp((-x * x) / 0.65) * 1.65)}" stroke="${orange}" stroke-width="2.5" fill="none"/>`;
    if (id === "descriptive")
      for (let i = 0; i < 10; i++)
        marks += `<rect x="${30 + (i * (w - 60)) / 10}" y="${c - 18 - Math.sin(i * 0.4) * 26}" width="${(w - 65) / 10}" height="${18 + Math.sin(i * 0.4) * 26}" fill="${teal}" opacity=".6"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><pattern id="grid-${id}-${hero}" width="32" height="28" patternUnits="userSpaceOnUse"><path d="M32 0H0V28" fill="none" stroke="#cbded5" stroke-width=".5"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#grid-${id}-${hero})"/><path d="M0 ${c}H${w}" stroke="#b4cbc0"/>${marks}${hero ? `<text x="80" y="245" font-size="12" fill="#6d9484">从一次观察，到有依据的推断</text>` : ""}</svg>`;
}
function home() {
  $("#main").innerHTML =
    `<section class="hero"><div class="hero-text"><div class="eyebrow">FROM OBSERVATIONS TO UNDERSTANDING.</div><h1>让数据的故事，<br>变得<em>清晰。</em></h1><p>在随机中看见规律，在差异中理解证据。<br>把统计学，变成可以亲手探索的课堂。</p><a class="button primary" href="#descriptive">开始探索 ↗</a> <a class="button" href="#guide">课堂使用指南</a></div><div class="hero-art">${miniGraph("sampling", true)}<span class="hero-formula">SE = σ / √n</span><span class="hero-tag">从一组数据，走向一个好问题</span></div></section><div class="intro-strip"><span><strong>06</strong>交互主题</span><span><strong>18</strong>课堂演示</span><span><strong>04</strong>已集成工具</span><span class="strip-note">可重复模拟 · 可离线使用 · 支持课堂投影</span></div><div class="section-heading"><div><h2>把统计，放进实验室</h2><p>先预测，再操作，最后用数据解释观察。</p></div><span class="text-link">从描述走向推断 ↓</span></div><div class="lab-grid">${topics.map((t, i) => `<a class="lab-card" href="#${t.id}"><div class="card-art"><span class="card-index">LAB / 0${i + 1}</span><span class="card-chip">${t.time}</span>${miniGraph(t.id)}</div><div class="card-body"><h3>${t.title}</h3><p>${t.desc}</p><div class="card-bottom"><span>3 个演示 · ${t.tags}</span><span>进入章节 ↗</span></div></div></a>`).join("")}</div>${demoDirectory()}<div class="section-heading"><div><h2>一节课，从一个好问题开始</h2><p>建议演示路线 · 约 25 分钟</p></div></div><section class="class-path"><div class="path-icon">σ</div><div class="path-copy"><h3>样本越来越大，我们就越来越确定吗？</h3><p>从均值的波动出发，走向区间，再讨论显著性。</p></div><div class="path-steps"><span>抽样分布</span>→<span>置信区间</span>→<span>假设检验</span></div><a class="button" href="#guide">查看路线 ↗</a></section>`;
}
function guide() {
  $("#main").innerHTML =
    head(
      "课堂使用指南",
      "TEACHING WITH EXPLORATION",
      "从观察开始，把操作变成讨论。",
    ) +
    `<div class="notice">建议桌面浏览器投影。点击右上角“课堂演示”可收起导航；Esc 退出。所有模拟均可通过随机种子复现。有效参数仅保存在本机浏览器。</div><div class="section-heading"><div><h2>25 分钟：样本越大，结论越稳吗？</h2><p>先请学生预测，再揭示图形；让学生解释变化的原因。</p></div></div><div class="guide-examples">${[
      [
        "sampling",
        "01 · 8 分钟：抽样均值",
        "选择右偏总体，比较 n=1、5、30。区分总体分布、一次样本和抽样分布。",
      ],
      [
        "confidence",
        "02 · 8 分钟：重复区间",
        "固定 n=20，对比 90% 与 99%。讨论宽度与覆盖率的权衡。",
      ],
      [
        "hypothesis",
        "03 · 9 分钟：差异与证据",
        "将两组标准差都设为 10，保持均值差 5，再增大 n。此时 d 不变；标准差不同时，样本量权重也可能改变 d。",
      ],
      [
        "regression",
        "延伸：异常点与相关",
        "先预测加入异常点的影响，再观察 r 和回归线。讨论相关与因果。",
      ],
    ]
      .map(
        ([id, title, desc]) =>
          `<a href="#${id}"><h3>${title} ↗</h3><p>${desc}</p></a>`,
      )
      .join(
        "",
      )}</div><div class="section-heading"><div><h2>课前与课后</h2></div></div><section class="notes-panel"><ol><li>课前打开主题，点击“重置实验”，确认图形与公式正常显示。</li><li>调整参数后再导出 SVG；图中附带参数、结果、坐标说明与解释。</li><li>展开数值表可导出 CSV。模拟表包含随机种子和生成参数；不是实际研究数据。</li><li>描述统计输入完成后点击“应用数据”。不合法输入保留上次有效图形和导出。</li><li>离线包内置四个库与公式字体；外部资源链接需要联网。</li><li>本工具用于基础教学。真实分析还需处理设计、缺失值、独立性、模型诊断和多重比较。</li></ol><div class="resource-links"><a href="https://github.com/dingyuzero/blcu-statistics-classroom/releases/latest" target="_blank" rel="noopener noreferrer">单文件离线版下载 ↗</a><a href="docs/部署说明.md" download>下载部署说明 MD ↗</a><a href="docs/使用说明.md" download>下载使用说明书 MD ↗</a><a href="docs/开发交接.md" download>下载开发交接文档 MD ↗</a><a href="#resources">查看开源项目 ↗</a></div></section>`;
}
function route() {
  const [id, sub = "main"] = location.hash.slice(1).split("/");
  if (id === "main") {
    $("#main").focus();
    return;
  }
  current =
    topics.some((t) => t.id === id) || ["resources", "guide"].includes(id)
      ? id
      : "home";
  currentModule = chapterModules[current]?.some(m => m[0] === sub) ? sub : "main";
  if (scene) {
    scene.destroy();
    scene = null;
  }
  currentTable = null;
  $("#breadcrumb").textContent =
    (topics.find((t) => t.id === current) ? topics.find(t => t.id === current).title + " / " + activeTitle() : "") ||
    { home: "课程总览", resources: "开源资源库", guide: "课堂使用指南" }[
      current
    ];
  $$("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === current);
    if (a.dataset.nav === current) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#sidebar").classList.remove("open");
  $("#menu").setAttribute("aria-expanded", "false");
  document.title = $("#breadcrumb").textContent + " · 北京语言大学 Ding Lab · 统计课堂";
  const render = moduleInfo()?.[3] || ({
    home,
    descriptive,
    distribution,
    sampling,
    confidence,
    hypothesis,
    regression,
    resources: resourcePage,
    guide,
  })[current];
  render();
  window.scrollTo(0, 0);
}
$("#menu").setAttribute("aria-controls", "sidebar");
$("#menu").setAttribute("aria-expanded", "false");
$("#menu").onclick = () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#menu").setAttribute("aria-expanded", String(open));
};
$("#present").onclick = () => {
  const on = document.body.classList.toggle("presentation");
  $("#present span").textContent = on ? "退出演示" : "课堂演示";
  $("#present").setAttribute("aria-pressed", String(on));
  setTimeout(
    () =>
      scene?.board.resizeContainer(
        $("#plot").clientWidth,
        $("#plot").clientHeight,
      ),
    50,
  );
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.body.classList.remove("presentation");
    $("#present span").textContent = "课堂演示";
    $("#present").setAttribute("aria-pressed", "false");
    $("#sidebar").classList.remove("open");
    $("#menu").setAttribute("aria-expanded", "false");
  }
});
window.addEventListener("hashchange", route);
route();

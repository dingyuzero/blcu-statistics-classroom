"use strict";
const textbookChapters = [
  [
    "prepare",
    "数据的清理与准备",
    1,
    "缺失机制与均值填补",
    "单变量异常与马氏距离",
    prepareAdvanced,
  ],
  [
    "manova",
    "多元方差分析",
    36,
    "两个结果变量的联合差异",
    "两组 Hotelling T² 检验",
    manovaAdvanced,
  ],
  [
    "multiple-regression",
    "多元回归分析",
    58,
    "控制变量与偏回归",
    "共线性与 VIF",
    multipleAdvanced,
  ],
  [
    "logistic",
    "Logistic 回归分析",
    86,
    "从线性预测到概率",
    "分类阈值与两类错误",
    logisticAdvanced,
  ],
  [
    "discriminant",
    "判别分析",
    98,
    "Fisher 判别方向",
    "先验概率与分类边界",
    discriminantAdvanced,
  ],
  [
    "clustering",
    "聚类分析",
    112,
    "K-means 逐步迭代",
    "单链接与完整链接",
    clusteringAdvanced,
  ],
  [
    "efa",
    "探索性因素分析",
    130,
    "载荷旋转与共同度",
    "相关结构与碎石图",
    efaAdvanced,
  ],
  [
    "cfa",
    "验证性因素分析",
    173,
    "模型如何重现相关",
    "截距不变性与均值比较",
    cfaAdvanced,
  ],
  [
    "path",
    "路径分析",
    210,
    "直接、间接与总效应",
    "不同路径，相同相关",
    pathAdvanced,
  ],
  [
    "sem",
    "结构方程模型",
    241,
    "测量误差与潜变量关系",
    "嵌套模型与卡方差异",
    semAdvanced,
  ],
  [
    "mediation",
    "中介分析",
    273,
    "中介路径的效应分解",
    "间接效应的 Bootstrap",
    mediationAdvanced,
  ],
  [
    "moderation",
    "调节效应",
    301,
    "交互作用与简单斜率",
    "有调节的中介",
    moderationAdvanced,
  ],
  [
    "multilevel",
    "多层线性模型简介",
    351,
    "组内相关与有效信息",
    "小组均值的部分汇聚",
    multilevelAdvanced,
  ],
  [
    "longitudinal",
    "多层线性模型在追踪研究中的应用",
    385,
    "个体的不同增长轨迹",
    "改变时间零点",
    longitudinalAdvanced,
  ],
];
function installAdvanced() {
  textbookChapters.forEach(([id, title, page, one, two, render], i) => {
    topics.push({
      id,
      title,
      en: `ADVANCED PSYCHOLOGICAL STATISTICS · CHAPTER ${i + 1}`,
      desc: `教材第 ${i + 1} 章 · ${one} / ${two}`,
      tags: "教材概念演示",
      time: "8–12 分钟",
      hint: "先预测，再改变参数，用图形解释观察。",
      advanced: true,
    });
    chapterModules[id] = [
      [
        "main",
        one,
        `刘红云《高级心理统计》· 第 ${i + 1} 章（起始页 ${page}）`,
        () => render(false),
      ],
      [
        "explore",
        two,
        `刘红云《高级心理统计》· 第 ${i + 1} 章（起始页 ${page}）`,
        () => render(true),
      ],
    ];
  });
}
function textbookCards() {
  return `<div class="textbook-grid">${textbookChapters.map(([id, title, page, one, two], i) => `<section class="textbook-card"><div class="eyebrow">第 ${String(i + 1).padStart(2, "0")} 章 · p. ${page}</div><h3>${title}</h3><a href="#${id}"><span>01</span>${one} ↗</a><a href="#${id}/explore"><span>02</span>${two} ↗</a></section>`).join("")}</div>`;
}
function textbookPage() {
  $("#main").innerHTML =
    head(
      "高级心理统计 · 教材导航",
      "A CONCEPT-FIRST COMPANION",
      "依照刘红云《高级心理统计》（2019 年第 1 版）的 14 章组织，先理解模型在回答什么问题。",
    ) +
    `<section class="textbook-intro"><div><strong>14 章 · 28 个新增演示</strong><p>从数据准备，到潜变量与追踪模型。每个演示都有操作提示、课堂提问、公式与可导出数值表。</p></div><p>原有 <a href="#home">18 个基础演示</a> 全部保留。这里覆盖每章的核心概念；SPSS / Mplus 操作、完整模型估计和所有子方法仍需结合教材学习。</p><a class="button" href="docs/教材覆盖说明.md" download>下载教材覆盖说明 MD ↗</a></section>` +
    textbookCards() +
    `<section class="notes-panel textbook-reference"><h3>教材与学习路线</h3><p>刘红云（2019）.《高级心理统计》. 中国人民大学出版社. ISBN 978-7-300-26659-6。按用户提供的第 1 版目录核对；页码为书内页码。</p><p>建议先走一条概念线：<a href="#multiple-regression">控制变量</a> → <a href="#mediation">中介</a> → <a href="#moderation">调节</a>；再走一条测量线：<a href="#efa">探索性因素</a> → <a href="#cfa">验证性因素</a> → <a href="#sem">结构方程</a>。</p><p>演示图形、文字与合成数据为本网站原创；不提供教材扫描件或教材例题数据。参考资料与计算边界见覆盖说明。</p></section>`;
}
const AS = typeof AdvancedStats !== "undefined" ? AdvancedStats : null;
function advancedStart(fields, legend, steps, question, answer) {
  scaffold(fields, legend, steps, question, answer);
  $("#main .chapter-tabs").insertAdjacentHTML(
    "beforebegin",
    '<a class="text-link textbook-back" href="#textbook">← 返回教材 14 章导航</a>',
  );
}
function advancedEnd(
  main,
  detail,
  metrics,
  formula,
  note,
  caption,
  headers,
  rows,
  latex,
) {
  values(main, detail);
  smallMetrics(metrics);
  setMath(formula, note, latex);
  $("#plot-caption").textContent = caption;
  table(headers, rows);
}
function plotFit(xs, ys, pad = 0.18) {
  const [x0, x1] = spanFor(xs),
    [y0, y1] = spanFor(ys);
  init([x0, y1, x1, y0]);
}
function ellipse(mx, my, rho, color, radius = 2) {
  const t = Array.from({ length: 101 }, (_, i) => (i * 2 * Math.PI) / 100);
  line(
    t.map((t) => mx + radius * Math.cos(t)),
    t.map(
      (t) =>
        my +
        radius * (rho * Math.cos(t) + Math.sqrt(1 - rho * rho) * Math.sin(t)),
    ),
    color,
    2,
  );
}
function advBar(x, y, color = teal, width = 0.28) {
  line(
    [x - width, x - width, x + width, x + width, x - width],
    [0, y, y, 0, 0],
    color,
    1,
    0,
    color,
  );
}
function prepareAdvanced(outlier) {
  if (outlier) {
    advancedStart(
      range("rho", "两个变量的相关 ρ", 0.8, -0.9, 0.9, 0.05) +
        range("x", "观测的 X 标准分", 2, -3, 3, 0.1) +
        range("y", "观测的 Y 标准分", -2, -3, 3, 0.1),
      ["绿色：等马氏距离椭圆", "橙色：待观察个体"],
      [
        "保持 X=2、Y=−2，增加正相关。",
        "把 Y 改为 2，比较同样大的单变量分数。",
        "观察 D²，而不只看某个变量的 z 分数。",
      ],
      "单个变量都不特别极端，组合为什么可能异常？",
      "马氏距离考虑协方差。顺着点云长轴变化更常见，偏离点云方向更不寻常。这里假定已知标准化总体协方差，椭圆只是距离参照，不是自动剔除或诊断阈值。",
    );
    bind(() => {
      const r = num("rho"),
        x = num("x"),
        y = num("y"),
        d = AS.mahalanobis(x, y, r);
      init([-4, 4, 4, -4]);
      ellipse(0, 0, r, teal);
      dot(x, y, orange, 5);
      advancedEnd(
        `D² = ${fmt(d)}`,
        "相同的坐标，换一种协方差结构，联合距离就不同。",
        [
          [fmt(x), "X 标准分"],
          [fmt(y), "Y 标准分"],
          [fmt(x * x + y * y), "忽略相关的平方距离"],
        ],
        "D² = (x² − 2ρxy + y²) / (1 − ρ²)",
        "协方差必须可逆；本页不从小样本估计协方差。",
        "横轴 X；纵轴 Y；椭圆 D²=4。",
        ["X", "Y", "rho", "D_squared"],
        [[x, y, r, d]],
      );
    });
    return;
  }
  advancedStart(
    select("mechanism", "生成缺失的机制", [
      ["mcar", "MCAR：随机缺失"],
      ["mar", "MAR：依赖已观测 X"],
      ["mnar", "MNAR：依赖缺失的 Y"],
    ]) + range("rate", "基础缺失倾向", 0.3, 0.1, 0.7, 0.05),
    ["绿色：观测到的 Y", "红色：被隐藏的 Y（教学可见）"],
    [
      "比较完整数据与剩余数据的均值。",
      "切换机制，观察哪些位置更容易缺失。",
      "比较均值填补后的标准差。",
    ],
    "填上均值，是否就恢复了完整样本的信息？",
    "均值填补把缺失位置挤在中心，低估离散程度与不确定性。MAR 指给定已观测变量后缺失不依赖未观测值，并不保证完整案例分析无偏。真实数据中无法直接看见缺失的 Y，也不能仅凭观测数据区分 MAR 与 MNAR。",
  );
  bind(() => {
    const r = AS.missing($("#mechanism").value, num("rate"));
    plotFit(
      r.rows.map((r) => r.x),
      r.rows.map((r) => r.y),
    );
    r.rows.forEach((p) => dot(p.x, p.y, p.missing ? red : teal, 2));
    advancedEnd(
      `缺失 ${r.rows.length - r.kept.length} / 160`,
      `完整均值 ${fmt(r.fullMean)}；观测均值 ${fmt(r.observedMean)}。`,
      [
        [fmt(r.fullSD), "完整样本 s"],
        [fmt(r.observedSD), "观测样本 s"],
        [fmt(r.filledSD), "均值填补后 s"],
      ],
      "MAR：P(R=0 | X,Y) = P(R=0 | X)",
      "R=0 表示缺失。滑块控制概率模型的基础倾向，实际缺失比例由机制和固定随机数共同决定。",
      "横轴 X（始终观测）；纵轴 Y。红点仅在模拟教学中可见。",
      ["X", "完整Y（教学）", "是否缺失", "缺失概率"],
      r.rows.map((p) => [p.x, p.y, p.missing, p.p]),
    );
  });
}
function manovaAdvanced(test) {
  advancedStart(
    range("dx", "组均值差 ΔX", 1, -2, 2, 0.1) +
      range("dy", "组均值差 ΔY", -0.5, -2, 2, 0.1) +
      range("rho", "组内相关 ρ", 0.6, -0.9, 0.9, 0.05) +
      (test
        ? range("n", "每组样本量 n", 30, 5, 150)
        : range("angle", "观察方向（度）", 45, -90, 180, 5)),
    [
      "绿色：A 组",
      "紫色：B 组",
      test ? "椭圆：组内距离轮廓" : "橙线：所选投影方向",
    ],
    [
      "保持两组均值，改变组内相关。",
      "比较沿点云长轴和短轴的分离。",
      test
        ? "增加样本量，看 T² 与 p 值。"
        : "旋转观察方向，看投影后的标准化差异。",
    ],
    "分别做两个 t 检验，会遗漏什么？",
    "多元方法把结果变量之间的协方差纳入差异评估。本页只演示两个独立组、两个连续结果和共同协方差。Hotelling T² 是两组 MANOVA 的特例；不代表所有多组或重复测量设计。",
  );
  bind(() => {
    const dx = num("dx"),
      dy = num("dy"),
      rho = num("rho"),
      r = AS.hotelling(dx, dy, rho, test ? num("n") : 30, test ? num("n") : 30);
    init([-4, 4, 4, -4]);
    ellipse(-dx / 2, -dy / 2, rho, teal, 1.5);
    ellipse(dx / 2, dy / 2, rho, purple, 1.5);
    dot(-dx / 2, -dy / 2, teal, 5);
    dot(dx / 2, dy / 2, purple, 5);
    let projection = 0;
    if (!test) {
      const a = (num("angle") * Math.PI) / 180,
        c = Math.cos(a),
        s = Math.sin(a);
      projection = (dx * c + dy * s) / Math.sqrt(1 + 2 * rho * c * s);
      segment([-3 * c, -3 * s], [3 * c, 3 * s], orange, 3);
    }
    advancedEnd(
      test ? `F = ${fmt(r.F)}` : `投影差异 = ${fmt(projection)}`,
      test
        ? `df = (2, ${r.df2})；p = ${fmt(r.p)}。`
        : `联合平方距离 D² = ${fmt(r.d2)}；方向会改变可见的差异。`,
      [
        [fmt(r.d2), "D²"],
        [test ? fmt(r.T2) : fmt(dx), test ? "Hotelling T²" : "ΔX"],
        [test ? fmt(r.p) : fmt(dy), test ? "双变量检验 p" : "ΔY"],
      ],
      test
        ? "T² = n₁n₂/(n₁+n₂) · Δ′ Sₚ⁻¹ Δ；F = (N−p−1)T² / [p(N−2)]"
        : "投影差异 = w′Δ / √(w′Σw)",
      test
        ? "将控件视为样本均值差与合并样本协方差；F 参考分布要求独立、二元正态、相同协方差。椭圆不是置信区间。"
        : "投影是概念演示；不要根据最显著的方向再使用单次检验的 p 值。",
      "横轴结果 X；纵轴结果 Y；两组组内方差均为 1。",
      ["ΔX", "ΔY", "rho", "D2", "T2（每组n见参数）", "F", "p"],
      [[dx, dy, rho, r.d2, r.T2, r.F, r.p]],
    );
  });
}
function multipleAdvanced(vif) {
  advancedStart(
    range("rho", "预测变量相关（生成值）", 0.6, -0.95, 0.95, 0.05) +
      range("b1", "X 的真实回归系数", 0.5, -2, 2, 0.1) +
      range("b2", "Z 的真实回归系数", 1, -2, 2, 0.1),
    ["绿色：合成数据", "橙色：条件关系 / 不确定性"],
    [
      "固定回归系数，增大 X 与 Z 的相关。",
      vif ? "观察 VIF 与 X 系数的标准误。" : "比较原始 X 与剔除 Z 后的 X。",
      "解释‘控制 Z 不变’与普通相关的区别。",
    ],
    "相关的预测变量为什么让系数难以区分？",
    "模型需要用 X 中不能被 Z 解释的部分估计 X 的独立关系。共线性减少这一独立变异，增加系数方差；它本身不意味着 OLS 系数有偏，也不自动证明因果关系。",
  );
  bind(() => {
    const r = AS.multiple(num("rho"), num("b1"), num("b2"));
    if (vif) {
      const xs = Array.from({ length: 101 }, (_, i) => -0.98 + i * 0.0196);
      init([-1, 27, 1, -2]);
      line(
        xs,
        xs.map((x) => 1 / (1 - x * x)),
      );
      dot(r.r, r.vif, orange, 5);
    } else {
      plotFit(r.rx, r.ry);
      r.rx.forEach((x, i) => dot(x, r.ry[i]));
      const a = Math.min(...r.rx),
        b = Math.max(...r.rx);
      segment([a, r.fit.beta[1] * a], [b, r.fit.beta[1] * b], orange);
    }
    advancedEnd(
      vif ? `VIF = ${fmt(r.vif)}` : `控制 Z 后 b̂X = ${fmt(r.fit.beta[1])}`,
      `样本相关 rXZ=${fmt(r.r)}；X 系数标准误=${fmt(r.fit.se[1])}。`,
      [
        [fmt(r.fit.beta[1]), "估计 bX"],
        [fmt(r.fit.beta[2]), "估计 bZ"],
        [fmt(r.fit.se[1]), "SE(bX)"],
      ],
      vif ? "VIFX = 1 / (1 − rXZ²)" : "resid(Y ~ Z) = bX · resid(X ~ Z) + e",
      "同一组固定随机数，n=100，误差标准差=1；VIF 与标准误使用样本 X、Z 计算。",
      vif
        ? "横轴：两个预测变量的样本相关；纵轴：VIF。"
        : "横轴：X 对 Z 回归的残差；纵轴：Y 对 Z 回归的残差。",
      ["X", "Z", "Y", "X残差", "Y残差"],
      r.rows.map((p, i) => [p.x, p.z, p.y, r.rx[i], r.ry[i]]),
    );
  });
}
function logisticAdvanced(classify) {
  advancedStart(
    range("a", "截距 α", 0, -3, 3, 0.1) +
      range("b", "斜率 β", 1, -2, 2, 0.1) +
      (classify
        ? range("cut", "判为 1 的概率阈值", 0.5, 0.05, 0.95, 0.05)
        : range("x", "观察位置 X", 0, -3, 3, 0.1)),
    [
      "绿色：预测概率",
      "橙色：阈值 / 当前概率",
      "散点：固定随机数生成的二分类结果",
    ],
    [
      "改变 β，观察曲线方向与陡峭程度。",
      classify
        ? "降低阈值，比较假阳性与假阴性。"
        : "在不同 X 位置增加 1 单位，比较概率差与优势比。",
      "区分概率、优势和线性预测值。",
    ],
    classify ? "阈值越低就越好吗？" : "β=1 意味着概率增加 1 吗？",
    classify
      ? "更低的阈值通常提高敏感度，同时增加假阳性。阈值应结合代价、基础率和独立验证制定；本页是生成模型的同一批合成数据，不是预测性能的外部验证。"
      : "β 是对数优势的变化；X 每增加 1 单位，优势乘以 exp(β)。概率的增量依赖起点，因此在曲线中部通常更大。",
  );
  bind(() => {
    const a = num("a"),
      b = num("b"),
      r = AS.logistic(a, b, classify ? num("cut") : 0.5);
    init([-4, 1.15, 4, -0.15]);
    curve((x) => AS.sigmoid(a + b * x), -4, 4);
    r.rows.forEach((p) => dot(p.x, p.y, p.y ? purple : teal, 1.4));
    if (classify) segment([-4, num("cut")], [4, num("cut")], orange, 2, 2);
    else dot(num("x"), AS.sigmoid(a + b * num("x")), orange, 6);
    advancedEnd(
      classify ? `TP ${r.tp} · FP ${r.fp}` : `OR = ${fmt(Math.exp(b))}`,
      classify
        ? `TN ${r.tn}；FN ${r.fn}。`
        : `X=0 的概率 ${fmt(AS.sigmoid(a))}。`,
      classify
        ? [
            [r.sensitivity === null ? "未定义" : fmt(r.sensitivity), "敏感度"],
            [r.specificity === null ? "未定义" : fmt(r.specificity), "特异度"],
            [r.tp + r.fn, "实际正例数"],
          ]
        : [
            [fmt(AS.sigmoid(a + b * num("x"))), "p(X)"],
            [fmt(AS.sigmoid(a + b * (num("x") + 1))), "p(X+1)"],
            [fmt(b), "log(OR)"],
          ],
      "log[p/(1−p)] = α + βX；p = 1/(1+exp(−α−βX))",
      "参数由滑块设定，不是在散点上重新拟合。概率等于阈值时判为 1。",
      "横轴 X；纵轴概率 / 二分类结果（0、1）。",
      ["X", "概率", "实际Y", "预测Y"],
      r.rows.map((p) => [p.x, p.p, p.y, p.guess]),
    );
  });
}
function discriminantAdvanced(prior) {
  advancedStart(
    range("rho", "共同协方差中的相关 ρ", 0.5, -0.8, 0.8, 0.05) +
      (prior
        ? range("prior", "B 组先验概率", 0.5, 0.05, 0.95, 0.05)
        : range("angle", "对比投影方向（度）", 0, -90, 180, 5)),
    [
      "绿色：A 类均值 (−0.5,−0.5)",
      "紫色：B 类均值 (0.5,0.5)",
      "橙色：判别边界 / 投影方向",
    ],
    [
      "改变共同协方差，看点云轮廓。",
      prior
        ? "提高 B 的先验概率，看边界向哪边移动。"
        : "旋转对比方向，与最优标准化分离比较。",
      "说明已知类别的判别与无标签聚类的区别。",
    ],
    "为什么分类不仅由离哪组均值近决定？",
    "线性判别分析假设组内多元正态和相同协方差，并可纳入先验概率。先验越高的类别占据更大决策区域。协方差不同时通常需要二次边界；本页不演示 QDA 参数估计。",
  );
  bind(() => {
    const rho = num("rho"),
      r = AS.lda(rho, prior ? num("prior") : 0.5);
    init([-4, 4, 4, -4]);
    ellipse(-0.5, -0.5, rho, teal, 1.5);
    ellipse(0.5, 0.5, rho, purple, 1.5);
    dot(-0.5, -0.5, teal, 5);
    dot(0.5, 0.5, purple, 5);
    let sep = Math.sqrt(2 / (1 + rho));
    if (prior) segment([-4, r.boundary(-4)], [4, r.boundary(4)], orange);
    else {
      const a = (num("angle") * Math.PI) / 180,
        c = Math.cos(a),
        s = Math.sin(a);
      segment([-3 * c, -3 * s], [3 * c, 3 * s], orange);
      sep = Math.abs(c + s) / Math.sqrt(1 + 2 * rho * c * s);
      segment([-2, -2], [2, 2], purple, 2, 2);
    }
    advancedEnd(
      prior
        ? `边界 y = −x ${r.shift >= 0 ? "−" : "+"} ${fmt(Math.abs(r.shift * (1 + rho)))}`
        : `投影分离 = ${fmt(sep)}`,
      prior
        ? "边界上方判为 B，下方判为 A。"
        : "紫色虚线为本例 Fisher 方向；最优方向只确定到任意非零倍数。",
      [
        [fmt(r.w[0]), "wX"],
        [fmt(r.w[1]), "wY"],
        [fmt(Math.sqrt(2 / (1 + rho))), "最大标准化分离"],
      ],
      "w = Σ⁻¹(μB−μA)；δB−δA = w′x + log(πB/πA)",
      "本例两组均值关于原点对称，均值二次项抵消；误判代价设为相同。",
      "横轴 X；纵轴 Y；椭圆表示共同协方差的轮廓。",
      ["rho", "wX", "wY", "log先验比", "最大分离"],
      [[rho, ...r.w, r.shift, Math.sqrt(2 / (1 + rho))]],
    );
  });
}
function clusteringAdvanced(hierarchy) {
  advancedStart(
    hierarchy
      ? select("linkage", "类间距离定义", [
          ["single", "单链接：最近成员"],
          ["complete", "完整链接：最远成员"],
        ])
      : range("k", "聚类数 K", 3, 2, 4) +
          range("steps", "中心更新次数", 0, 0, 10) +
          select("initial", "初始中心", [
            ["0", "较分散的起点"],
            ["1", "同一片区域的起点"],
          ]),
    hierarchy
      ? ["绿色：合并树", "数字：原始观测位置"]
      : ["颜色：当前分组", "大点：当前中心"],
    hierarchy
      ? ["先看相邻点何时合并。", "切换类间距离定义。", "比较最后合并的高度。"]
      : [
          "从第 0 步开始，逐步增加更新次数。",
          "观察中心移动与 SSE 下降。",
          "更换起点或 K，比较最终分组。",
        ],
    hierarchy
      ? "‘两组之间的距离’只有一种定义吗？"
      : "SSE 最小的分组就是心理学上的真实类型吗？",
    hierarchy
      ? "单链接用最近成员距离，容易产生链式连接；完整链接用最远成员距离，倾向更紧凑的簇。树的高度代表所选规则的合并距离。"
      : "K-means 优化欧氏距离下的类内平方和，依赖尺度、K 与初值，可能落入局部最优。统计分组不自动等于真实类别；本页的空簇保留原中心。",
  );
  bind(() => {
    if (hierarchy) {
      const r = AS.linkage($("#linkage").value);
      init([0.3, 8, 6.7, -1]);
      r.x.forEach((x, i) => scene.text(i + 0.8, -0.5, String(x)));
      r.merges.forEach((m) =>
        line(
          [m.left.pos, m.left.pos, m.right.pos, m.right.pos],
          [m.left.height, m.height, m.height, m.right.height],
        ),
      );
      advancedEnd(
        `最终合并高度 ${fmt(r.merges.at(-1).height)}`,
        "六个点位于一维数轴；树的叶子顺序固定。",
        [
          [6, "初始个体数"],
          [5, "合并次数"],
          [$("#linkage").value, "链接规则"],
        ],
        "d(A,B) = min 或 max {|xi − xj| : i∈A, j∈B}",
        "这是距离驱动的层次聚类，不含显著性检验。",
        "横轴：叶节点顺序（下方标签是原始数值）；纵轴：合并距离。",
        ["步", "成员索引（从1计）", "距离"],
        r.merges.map((m, i) => [
          i + 1,
          m.members.map((x) => x + 1).join(" / "),
          m.height,
        ]),
      );
      return;
    }
    const r = AS.kmeans(num("k"), num("steps"), num("initial")),
      colors = [teal, purple, orange, red];
    init([-4, 4, 4, -2.5]);
    r.points.forEach((p, i) => dot(...p, colors[r.labels[i]], 2.8));
    r.centers.forEach((p, i) => {
      dot(...p, colors[i], 7);
      scene.text(p[0] + 0.13, p[1] + 0.18, `C${i + 1}`);
    });
    advancedEnd(
      `SSE = ${fmt(r.sse)}`,
      "每次中心更新后，重新分配观测到最近中心。",
      [
        [num("k"), "设定簇数"],
        [num("steps"), "中心更新次数"],
        [
          r.history.length > 1 ? fmt(r.history[0] - r.sse) : "0",
          "相对起点 SSE 降低",
        ],
      ],
      "SSE = Σi ‖xi − μcluster(i)‖²",
      "合成的二维数据在两个轴上使用相同尺度；固定种子使步骤可对照。",
      "横轴特征 1；纵轴特征 2。",
      ["点", "X", "Y", "类别", "中心X", "中心Y"],
      r.points.map((p, i) => [
        i + 1,
        ...p,
        r.labels[i] + 1,
        ...r.centers[r.labels[i]],
      ]),
    );
  });
}
function efaAdvanced(scree) {
  advancedStart(
    scree
      ? range("loading", "共同载荷 λ", 0.75, 0.1, 0.95, 0.05) +
          range("rho", "两个因子的相关", 0.3, 0, 0.9, 0.05)
      : range("rotation", "正交旋转角度", 0, -90, 90, 5),
    scree
      ? ["绿色：相关矩阵的特征值", "橙色虚线：特征值 1 参照"]
      : ["绿色：旋转前载荷", "紫色：旋转后载荷"],
    scree
      ? [
          "增大共同载荷，观察前几个特征值。",
          "增大因子相关，观察第二个特征值。",
          "讨论为什么不能只用一个阈值确定因子数。",
        ]
      : [
          "旋转载荷向量，观察坐标如何变化。",
          "比较每个向量的长度。",
          "打开数值表，检查共同度是否改变。",
        ],
    scree
      ? "特征值大于 1 就足以决定因子数吗？"
      : "旋转后载荷变了，模型重现的相关也变了吗？",
    scree
      ? "这是模型生成的总体相关矩阵的谱分解，用于理解碎石图；不是对样本执行共同因素提取。因子数需要结合理论、平行分析、残差和解释性，不能仅凭 Kaiser 规则。"
      : "正交旋转改变因子坐标轴，保持共同度与 ΛΛ′ 不变。斜交旋转还需同时考虑因子相关矩阵 Φ，不能直接用载荷平方和解释全部共同方差。",
  );
  bind(() => {
    if (scree) {
      const S = AS.factorMatrix(num("loading"), num("rho")),
        e = AS.eigenvalues(S);
      init([0.5, 6.5, 6.5, -0.5]);
      line([1, 2, 3, 4, 5, 6], e);
      e.forEach((v, i) => dot(i + 1, v));
      segment([0.5, 1], [6.5, 1], orange, 2, 2);
      advancedEnd(
        `前两个解释 ${fmt(((e[0] + e[1]) / 6) * 100, 1)}% 总方差`,
        "生成模型：6 个指标，两个各含 3 指标的因子。",
        [
          [fmt(e[0]), "第 1 特征值"],
          [fmt(e[1]), "第 2 特征值"],
          [fmt(AS.sum(e)), "特征值之和"],
        ],
        "R = ΛΦΛ′ + Θ；Σ eigenvalue = trace(R) = 6",
        "图中解释比例属于相关矩阵的主成分分解，不能等同于共同因素分析的方差贡献。",
        "横轴：特征值排序；纵轴：特征值。",
        ["顺序", "特征值", "占总方差比例"],
        e.map((v, i) => [i + 1, v, v / 6]),
      );
      return;
    }
    const r = AS.rotate(num("rotation"));
    init([-1.25, 1.25, 1.25, -1.25]);
    r.L.forEach((p, i) => {
      segment([0, 0], r.original[i], teal, 1.5, 2);
      segment([0, 0], p, purple, 2);
      dot(...p, purple);
      scene.text(p[0] + 0.025, p[1] + 0.045, `题${i + 1}`);
    });
    advancedEnd(
      "共同度保持不变",
      "改变坐标解释，而非创造新的共同方差。",
      [
        [fmt(r.communalities[0]), "题 1 共同度"],
        [fmt(r.communalities[3]), "题 4 共同度"],
        ["0", "重现协方差的理论变化"],
      ],
      "Λ* = ΛQ；Q Q′ = I；Λ*Λ*′ = ΛΛ′",
      "本页为正交旋转的几何演示，没有自动寻找 Varimax 最优解。",
      "横轴：因子 1 载荷；纵轴：因子 2 载荷。",
      ["题目", "原载荷1", "原载荷2", "新载荷1", "新载荷2", "共同度"],
      r.L.map((p, i) => [i + 1, ...r.original[i], ...p, r.communalities[i]]),
    );
  });
}
function cfaAdvanced(invariance) {
  advancedStart(
    invariance
      ? range("delta", "B−A 的潜变量均值差", 0.5, -1.5, 1.5, 0.1) +
          range("intercept", "题 1 的截距差（B−A）", 0, -1, 1, 0.1) +
          range("loading", "共同载荷", 0.8, 0.2, 0.95, 0.05)
      : range("loading", "候选模型的共同载荷 λ", 0.55, 0.1, 0.95, 0.05) +
          range("rho", "候选模型的因子相关", 0.6, -0.8, 0.8, 0.05),
    invariance
      ? ["绿色：仅由潜变量差异预测", "橙色：再加入题 1 截距差"]
      : ["绿色：模型重现相关", "紫色：教学参照相关"],
    invariance
      ? [
          "先令截距差为 0，改变潜均值差。",
          "保持潜均值差为 0，单独改变题 1 截距。",
          "讨论观测均值差来自哪里。",
        ]
      : [
          "把 λ 调到 .75、因子相关调到 .30。",
          "观察残差归零。",
          "分别改变载荷和因子相关，看哪些单元格变化。",
        ],
    invariance
      ? "量表均值不同就一定是潜在特质不同吗？"
      : "CFA 为什么要比较观测相关与模型隐含相关？",
    invariance
      ? "观测均值等于截距加上载荷乘潜均值。比较潜均值通常需要合适的标定、载荷和截距不变性约束；这只是连续指标的截距偏差演示，不是完整多组不变性检验。"
      : "模型通过少量载荷、因子相关和误差方差重现协方差结构。残差小只说明这个参照矩阵被重现，不证明模型唯一、因果正确或对新数据有效。",
  );
  bind(() => {
    if (invariance) {
      const r = AS.invariance(num("delta"), num("intercept"), num("loading")),
        expected = num("delta") * num("loading"),
        ys = [...r.itemDifferences, expected, 0];
      const [lo, hi] = spanFor(ys);
      init([0.4, hi, 3.6, lo]);
      r.itemDifferences.forEach((v, i) => {
        advBar(i + 0.85, expected, teal, 0.1);
        advBar(i + 1.15, v, orange, 0.1);
      });
      advancedEnd(
        `题 1 观测差 = ${fmt(r.itemDifferences[0])}`,
        "相同载荷并不足以保证均值比较公平。",
        [
          [fmt(num("delta")), "设定潜均值差"],
          [fmt(AS.mean(r.itemDifferences)), "3 题平均观测差"],
          [fmt(r.bias), "截距带来的平均偏移"],
        ],
        "E(yB) − E(yA) = (νB−νA) + λ(αB−αA)",
        "固定两组载荷相等；题 2、3 截距差为 0。潜变量单位已固定。",
        "横轴：题 1–3；纵轴：B−A 观测均值差。",
        ["题目", "仅潜均值差贡献", "截距差", "观测均值差"],
        r.itemDifferences.map((v, i) => [
          i + 1,
          expected,
          i === 0 ? num("intercept") : 0,
          v,
        ]),
      );
      return;
    }
    const r = AS.cfa(num("loading"), num("rho")),
      pairs = [];
    for (let i = 0; i < 6; i++)
      for (let k = i + 1; k < 6; k++)
        pairs.push([i, k, r.observed[i][k], r.implied[i][k], r.res[i][k]]);
    init([0.3, 1.05, 15.7, -0.9]);
    pairs.forEach(([i, k, o, m], idx) => {
      dot(idx + 1, o, purple, 3);
      dot(idx + 1, m, teal, 3);
      segment([idx + 1, o], [idx + 1, m], orange, 1.5);
    });
    advancedEnd(
      `相关残差 RMS = ${fmt(r.rms)}`,
      "参照：每个载荷 .75、因子相关 .30，指标方差均为 1。",
      [
        [fmt(r.errorVariance), "独特方差 1−λ²"],
        [15, "不同指标对"],
        [fmt(num("rho")), "模型因子相关"],
      ],
      "Σ(θ) = ΛΦΛ′ + Θ",
      "RMS 取完整 6×6 矩阵（含对角）残差的均方根，不是软件报告的 SRMR 或 RMSEA；没有执行参数估计。",
      "横轴：15 个题目对（见表）；纵轴：相关；连线是残差。",
      ["题目i", "题目j", "参照相关", "模型相关", "残差"],
      pairs.map(([i, k, ...rest]) => [i + 1, k + 1, ...rest]),
    );
  });
}
function pathAdvanced(equivalent) {
  advancedStart(
    equivalent
      ? range("r", "相邻节点的相关 r", 0.6, -0.9, 0.9, 0.05)
      : range("a", "路径 X → M", 0.6, -1, 1, 0.1) +
          range("b", "路径 M → Y", 0.5, -1, 1, 0.1) +
          range("c", "路径 X → Y", 0.2, -1, 1, 0.1),
    equivalent
      ? ["绿色：X → M → Y", "紫色：X ← M → Y"]
      : ["橙色：直接路径", "紫色：经 M 的路径"],
    equivalent
      ? [
          "改变相邻相关，比较两种生成结构。",
          "查看三个相关系数是否完全一致。",
          "讨论还需要哪些研究设计信息。",
        ]
      : [
          "改变任一路径，观察间接贡献的乘积。",
          "让直接与间接路径符号相反。",
          "把总效应解释为该线性生成模型中的变化。",
        ],
    equivalent ? "相同的相关矩阵能决定箭头方向吗？" : "为什么间接路径要相乘？",
    equivalent
      ? "在标准化线性高斯模型、独立残差和相同相邻相关下，这两种结构都产生 rXY=r²。观测协方差本身不能区分链式传递和共同原因；方向判断还需时间顺序、实验设计与实质理论。"
      : "X 增加 1 单位先让 M 改变 a，再使 Y 改变 ab；加上直接路径得到总效应。把这称为因果效应还需要无混杂等识别假设。",
  );
  bind(() => {
    if (equivalent) {
      const r = AS.equivalent(num("r"));
      init([-0.7, 3.4, 6.7, -0.8]);
      for (const y of [2, 0]) {
        for (const [i, l] of ["X", "M", "Y"].entries()) {
          dot(i * 3, y, y ? teal : purple, 6);
          scene.text(i * 3 - 0.1, y + 0.35, l, { fontSize: 18 });
        }
        segment([0.3, y], [2.7, y], y ? teal : purple);
        segment([3.3, y], [5.7, y], y ? teal : purple);
        scene.text(0.6, y + 0.35, y ? "→" : "←", { fontSize: 18 });
        scene.text(4, y + 0.35, "→", { fontSize: 18 });
      }
      advancedEnd(
        `rXY = r² = ${fmt(r.rXZ)}`,
        "上排：链式路径；下排：共同原因；两者的相关矩阵一致。",
        [
          [fmt(num("r")), "rXM"],
          [fmt(num("r")), "rMY"],
          [fmt(r.rXZ), "rXY"],
        ],
        "链：M=rX+εM，Y=rM+εY；叉：X=rM+εX，Y=rM+εY",
        "各变量方差为 1；每条方程残差方差为 1−r²，残差彼此独立。下方坐标仅用于布局。",
        "图示坐标不代表数据数值；箭头展示两种假设结构。",
        ["结构", "rXM", "rMY", "rXY"],
        [
          ["链式", num("r"), num("r"), r.rXZ],
          ["共同原因", num("r"), num("r"), r.rXZ],
        ],
      );
      return;
    }
    drawPathDiagram(num("a"), num("b"), num("c"));
  });
}
function drawPathDiagram(a, b, c) {
  const r = AS.path(a, b, c);
  init([-0.7, 3.3, 6.7, -0.7]);
  [
    [0, 0, "X"],
    [3, 2.3, "M"],
    [6, 0, "Y"],
  ].forEach(([x, y, l]) => {
    dot(x, y, teal, 7);
    scene.text(x - 0.1, y + 0.4, l, { fontSize: 18 });
  });
  function arrow(x1, y1, x2, y2, color) {
    segment([x1, y1], [x2, y2], color, 3);
    const a = Math.atan2(y2 - y1, x2 - x1),
      d = 0.19;
    line(
      [x2 - d * Math.cos(a - 0.5), x2, x2 - d * Math.cos(a + 0.5)],
      [y2 - d * Math.sin(a - 0.5), y2, y2 - d * Math.sin(a + 0.5)],
      color,
      3,
    );
  }
  arrow(0.25, 0.19, 2.75, 2.11, purple);
  arrow(3.25, 2.11, 5.75, 0.19, purple);
  arrow(0.35, 0, 5.65, 0, orange);
  scene.text(0.8, 1.4, `a = ${fmt(a)}`, { fontSize: 16 });
  scene.text(4.2, 1.4, `b = ${fmt(b)}`, { fontSize: 16 });
  scene.text(2.4, -0.32, `c′ = ${fmt(c)}`, { fontSize: 16 });
  advancedEnd(
    `总效应 = ${fmt(r.total)}`,
    "一条直接路径，加上一条经过 M 的间接路径。",
    [
      [fmt(c), "直接路径 c′"],
      [fmt(a * b), "路径乘积 ab"],
      [fmt(r.total), "总效应"],
    ],
    "c = c′ + ab",
    "给定线性、无交互的路径模型；图示不含参数估计和因果识别。",
    "坐标只用于路径布局；箭头表示假设方向，标注是设定的路径系数。",
    ["路径", "效应"],
    [
      ["X→Y", c],
      ["X→M→Y", a * b],
      ["总效应", r.total],
    ],
  );
}
function drawEffects(a, b, c, note) {
  const r = AS.path(a, b, c),
    v = [r.direct, r.indirect, r.total],
    [lo, hi] = spanFor([...v, 0]);
  init([0.3, hi, 3.7, lo]);
  v.forEach((v, i) => advBar(i + 1, v, [teal, purple, orange][i]));
  advancedEnd(
    `总效应 = ${fmt(r.total)}`,
    `直接 ${fmt(c)} + 间接 ${fmt(a * b)}。`,
    [
      [fmt(c), "直接效应 c′"],
      [fmt(a * b), "间接效应 ab"],
      [fmt(r.total), "总效应 c"],
    ],
    "M = aX + εM；Y = c′X + bM + εY；c = c′ + ab",
    note + " 线性、无交互、同一尺度的模型；不据此判定‘完全中介’。",
    "横轴 1：直接；2：间接；3：总效应。纵轴：X 增加 1 单位对应的 Y 变化。",
    ["a", "b", "c_prime", "indirect", "total"],
    [[a, b, c, a * b, r.total]],
  );
}
function semAdvanced(nested) {
  advancedStart(
    nested
      ? range("r", "样本相关 r", 0.3, -0.8, 0.8, 0.05) +
          range("n", "样本量", 100, 20, 500)
      : range("r", "设定潜变量相关", 0.7, -0.95, 0.95, 0.05) +
          range("relx", "X 测量信度", 0.7, 0.1, 1, 0.05) +
          range("rely", "Y 测量信度", 0.7, 0.1, 1, 0.05),
    nested
      ? ["绿色：自由相关模型", "橙色：限制相关为 0 的模型"]
      : ["绿色：潜变量相关（设定）", "橙色：观测相关"],
    nested
      ? [
          "保持 r，增加样本量。",
          "把相关调为 0，比较两模型差异。",
          "解释多一个参数换来了什么。",
        ]
      : [
          "固定潜变量相关，降低信度。",
          "比较观测关系如何衰减。",
          "说明把测量与结构分开有什么作用。",
        ],
    nested
      ? "更复杂模型总能拟合更好，就应该选它吗？"
      : "测量误差会把变量关系变弱多少？",
    nested
      ? "嵌套模型增加参数不会降低训练数据的最优拟合。差异检验比较拟合改善与自由度损失，也要考虑理论与简约性。这里是二变量正态协方差模型的可解特例，不是完整 SEM 拟合器。"
      : "经典测量误差在误差彼此独立、也独立于真分数时使相关衰减。这里的信度和潜相关已知；现实中不能把不可靠的信度代入公式就当作已经识别出潜变量模型。",
  );
  bind(() => {
    if (nested) {
      const r = AS.nested(num("r"), num("n"));
      init([0.2, Math.max(3, r.chi * 1.25), 2.8, -Math.max(0.5, r.chi * 0.12)]);
      advBar(1, 0, teal);
      advBar(2, r.chi, orange);
      advancedEnd(
        `Δχ² = ${fmt(r.chi)}`,
        `Δdf=1；渐近 p=${fmt(r.p)}。`,
        [
          ["0", "自由相关模型 χ²"],
          [fmt(r.chi), "零相关模型 χ²"],
          [fmt(r.p), "差异检验 p"],
        ],
        "Δχ² = (n−1)[−ln(1−r²)]；Δdf=1",
        "使用样本协方差与 (n−1) 约定的正态理论 ML 差异统计量；χ²₁ 参考是渐近近似。两个模型的方差都可自由估计；不适用非嵌套或稳健校正差异检验。",
        "横轴 1：自由相关（饱和）；2：限制相关为 0。纵轴：χ²。",
        ["n", "r", "delta_chi_square", "delta_df", "asymptotic_p"],
        [[num("n"), num("r"), r.chi, 1, r.p]],
      );
      return;
    }
    const r = AS.attenuation(num("r"), num("relx"), num("rely"));
    init([0.3, 1.2, 2.7, -1.2]);
    advBar(1, r.latent, teal);
    advBar(2, r.observed, orange);
    advancedEnd(
      `观测 r = ${fmt(r.observed)}`,
      "测量误差与结构关系分开描述。",
      [
        [fmt(r.latent), "潜变量相关"],
        [fmt(num("relx")), "X 信度"],
        [fmt(num("rely")), "Y 信度"],
      ],
      "rXY = r真分数 · √(RelX · RelY)",
      "经典测量误差模型的总体关系；不是样本校正估计，也不代表完整 SEM。",
      "横轴 1：潜变量相关；2：观测相关；纵轴相关系数。",
      ["潜相关", "X信度", "Y信度", "观测相关"],
      [[r.latent, num("relx"), num("rely"), r.observed]],
    );
  });
}
function mediationAdvanced(bootstrap) {
  advancedStart(
    range("a", "真实路径 a（X → M）", 0.5, -1, 1, 0.1) +
      range("b", "真实路径 b（M → Y）", 0.5, -1, 1, 0.1) +
      range("c", "真实直接路径 c′", 0.1, -1, 1, 0.1) +
      (bootstrap ? range("n", "独立个体数", 80, 30, 200, 10) : ""),
    bootstrap
      ? ["绿色：400 次成对重抽样的 ab", "橙色：百分位区间端点"]
      : ["绿色：直接效应", "紫色：间接效应", "橙色：总效应"],
    bootstrap
      ? [
          "固定路径，改变样本量。",
          "对比总体 ab 与样本估计。",
          "观察乘积分布和 95% 百分位区间。",
        ]
      : [
          "先把 a 或 b 设为 0。",
          "让 ab 与 c′ 相抵。",
          "讨论总效应很小为何不排除间接路径。",
        ],
    bootstrap
      ? "为什么要在每次重抽样后重新拟合两条路径？"
      : "没有显著总效应就不能有中介吗？",
    bootstrap
      ? "间接效应是两个估计系数的乘积，分布可能不对称。按个体成对抽取完整 (X,M,Y) 并重新拟合保留变量关系；单独打乱每列会破坏它。区间是有限 B 的模拟近似，不是因果识别的证明。"
      : "直接与间接作用可能抵消。不能仅用总效应显著性判断是否存在间接路径，也不能仅凭 c′ 不显著就宣布‘完全中介’。观察性中介仍依赖时间顺序和无混杂等强假设。",
  );
  bind(() => {
    if (!bootstrap) {
      drawEffects(
        num("a"),
        num("b"),
        num("c"),
        "本页展示总体生成系数；可切到 Bootstrap 看估计不确定性。",
      );
      return;
    }
    const r = AS.mediation(num("a"), num("b"), num("c"), num("n")),
      h = Stats.histogram(r.boot, 24),
      top = Math.max(...h.map((r) => r.count)) * 1.2;
    init([h[0].left - 0.03, top, h.at(-1).right + 0.03, -top * 0.1]);
    bars(h);
    [r.lo, r.hi].forEach((x) => segment([x, 0], [x, top * 0.85], orange, 2, 2));
    advancedEnd(
      `ab̂ = ${fmt(r.estimate)}`,
      `95% 百分位区间 [${fmt(r.lo)}, ${fmt(r.hi)}]；真实 ab=${fmt(num("a") * num("b"))}。`,
      [
        [fmt(r.aHat), "估计 a"],
        [fmt(r.bHat), "估计 b"],
        [400, "Bootstrap 次数"],
      ],
      "ab̂* = â* × b̂*；CI = [Q.025(ab̂*), Q.975(ab̂*)]",
      "固定种子 2026，两个独立标准正态残差；成对重抽样、OLS、type 7 分位数。B=400 供课堂响应，正式研究需更多重抽样及设计检查。",
      "横轴：间接效应的 Bootstrap 估计；纵轴：频数。",
      ["Bootstrap序号（按值排序）", "ab_star"],
      r.boot.map((v, i) => [i + 1, v]),
    );
  });
}
function moderationAdvanced(conditional) {
  advancedStart(
    conditional
      ? range("a", "a 路径主效应", 0.5, -1, 1, 0.1) +
          range("interaction", "X×W 对 M 的系数", 0.3, -1, 1, 0.1) +
          range("b", "b 路径", 0.6, -1, 1, 0.1)
      : range("b1", "X 主效应", 0.5, -1.5, 1.5, 0.1) +
          range("b2", "W 主效应", 0.2, -1, 1, 0.1) +
          range("b3", "X×W 交互系数", 0.5, -1, 1, 0.1),
    conditional
      ? ["绿色：间接效应随 W 变化"]
      : ["绿色：W=−1", "紫色：W=0", "橙色：W=1"],
    conditional
      ? [
          "先令交互系数为 0。",
          "改变交互系数，观察间接效应的斜率。",
          "把 b 设为 0，检查调节中介指数。",
        ]
      : [
          "把交互设为 0，看三条线是否平行。",
          "改变交互符号。",
          "比较三个 W 水平下 X 的简单斜率。",
        ],
    conditional
      ? "中介效应必须是一个固定数吗？"
      : "主效应是在什么 W 水平下的效应？",
    conditional
      ? "第一阶段被 W 调节时，间接效应为 (a1+a3W)b，调节中介指数为 a3b。这里只展示给定系数的函数，不计算置信区间，也没有实现所有调节中介模型。"
      : "在含交互项的模型中，X 系数是 W=0 时的简单斜率。中心化会改变主效应的参照点，不会消除交互或改变拟合预测。不能以某组显著、另一组不显著来替代交互检验。",
  );
  bind(() => {
    const xs = Array.from({ length: 61 }, (_, i) => -2 + i / 15);
    if (conditional) {
      const vals = xs.map(
        (w) => AS.conditional(num("a"), num("interaction"), num("b"), w).effect,
      );
      plotFit(xs, [...vals, 0]);
      line(xs, vals);
      advancedEnd(
        `调节中介指数 = ${fmt(num("interaction") * num("b"))}`,
        "W 改变 1 单位时，间接效应改变的量。",
        [-1, 0, 1].map((w) => [
          fmt(AS.conditional(num("a"), num("interaction"), num("b"), w).effect),
          `W=${w} 的间接效应`,
        ]),
        "M = a1X+a2W+a3XW+e；Y=c′X+bM+e；IE(W)=(a1+a3W)b",
        "仅演示第一阶段线性调节、连续 W、无其他交互；给定系数不是样本估计。",
        "横轴：调节变量 W；纵轴：条件间接效应。",
        ["W", "条件间接效应"],
        xs.map((w, i) => [w, vals[i]]),
      );
      return;
    }
    const models = [-1, 0, 1].map((w) =>
      AS.moderation(num("b1"), num("b2"), num("b3"), w),
    );
    plotFit(
      xs,
      models.flatMap((m) => [
        m.intercept - 2 * m.slope,
        m.intercept + 2 * m.slope,
      ]),
    );
    models.forEach((m, i) =>
      line(
        xs,
        xs.map((x) => m.intercept + m.slope * x),
        [teal, purple, orange][i],
      ),
    );
    advancedEnd(
      `交互系数 b3 = ${fmt(num("b3"))}`,
      "三条线展示同一模型在不同 W 水平的截面。",
      models.map((m, i) => [fmt(m.slope), `W=${i - 1} 的斜率`]),
      "Y = b0 + b1X + b2W + b3XW；∂Y/∂X = b1+b3W",
      "本页 b0=0。直线来自给定模型；不含标准误、显著性或 Johnson–Neyman 区间。",
      "横轴 X；纵轴模型预测 Y。",
      ["W", "截距", "简单斜率"],
      models.map((m, i) => [i - 1, m.intercept, m.slope]),
    );
  });
}
function multilevelAdvanced(pool) {
  advancedStart(
    range("tau", "组间随机截距标准差 τ", 3, 0, 8, 0.5) +
      range("sigma", "组内残差标准差 σ", 5, 1, 10, 0.5) +
      (pool ? "" : range("m", "每组人数 m", 20, 2, 80)),
    pool
      ? [
          "灰绿连线：原始均值 → 部分汇聚",
          "绿色：原始组均值",
          "紫色：部分汇聚估计",
        ]
      : ["绿色：ICC 随组间变异变化", "橙色：当前设置"],
    pool
      ? [
          "比较小组与大组收缩的幅度。",
          "增加组内噪声。",
          "把组间变异设为 0，看所有估计归向哪里。",
        ]
      : [
          "固定组内噪声，增加组间差异。",
          "固定 ICC，增加每组人数。",
          "比较实际人数和等效独立信息量。",
        ],
    pool
      ? "每组的观测均值都一样可靠吗？"
      : "一个班有 40 人，就相当于 40 个独立信息点吗？",
    pool
      ? "组均值误差越大，向总体均值收缩越多；组间真实差异越大，越保留各组均值。这是正态随机截距模型在总体均值与方差已知时的条件均值演示，未从数据估计方差。"
      : "随机截距使同组个体共享变异。ICC=τ²/(τ²+σ²)。等组大小的均值估计在这个模型下的设计效应是 1+(m−1)ICC；实际研究还取决于组数、抽样设计与模型。",
  );
  bind(() => {
    const tau = num("tau"),
      sigma = num("sigma");
    if (pool) {
      const r = AS.pooling(tau, sigma);
      const [lo, hi] = spanFor([50, ...r.flatMap((p) => [p.raw, p.pooled])]);
      init([0.3, hi, 6.7, lo]);
      segment([0.4, 50], [6.6, 50], orange, 2, 2);
      r.forEach((p, i) => {
        segment([i + 1, p.raw], [i + 1, p.pooled], teal, 2);
        dot(i + 1, p.raw, teal, 4);
        dot(i + 1, p.pooled, purple, 4);
      });
      advancedEnd(
        "小组更靠近总体均值",
        `已知总体均值 μ=50；组内 σ=${sigma}；组间 τ=${tau}。`,
        [
          [fmt(r[0].weight), "n=3 的保留权重"],
          [fmt(r.at(-1).weight), "n=40 的保留权重"],
          [50, "总体均值 μ"],
        ],
        "λj = τ²/(τ²+σ²/nj)；μ̂j = μ + λj(ȳj−μ)",
        "已知方差的正态条件均值 / BLUP 特例；不是从六组数据拟合出的经验贝叶斯估计。",
        "横轴：6 个组；纵轴：组均值。总体均值为橙色虚线。",
        ["组", "n", "生成真均值", "观测均值", "权重", "汇聚后"],
        r.map((p, i) => [i + 1, p.n, p.truth, p.raw, p.weight, p.pooled]),
      );
      return;
    }
    const r = AS.icc(tau, sigma, num("m")),
      xs = Array.from({ length: 81 }, (_, i) => i / 10);
    init([-0.5, 1.15, 8.5, -0.15]);
    line(
      xs,
      xs.map((t) => AS.icc(t, sigma, num("m")).rho),
    );
    dot(tau, r.rho, orange, 5);
    advancedEnd(
      `ICC = ${fmt(r.rho)}`,
      `设计效应 ${fmt(r.deff)}；该组的等效独立样本量约 ${fmt(r.effective)}。`,
      [
        [tau * tau, "组间方差 τ²"],
        [sigma * sigma, "组内方差 σ²"],
        [fmt(r.deff), "设计效应"],
      ],
      "ICC = τ²/(τ²+σ²)；DE = 1+(m−1)ICC",
      "方差非负，随机截距模型只产生非负 ICC；等效量 m/DE 是对均值精度的类比，不能代替多层模型自由度。",
      "横轴：组间标准差 τ；纵轴：ICC。",
      [
        "tau_squared",
        "sigma_squared",
        "m",
        "ICC",
        "design_effect",
        "effective_n",
      ],
      [[tau * tau, sigma * sigma, num("m"), r.rho, r.deff, r.effective]],
    );
  });
}
function longitudinalAdvanced(center) {
  advancedStart(
    range("sd0", "随机截距标准差", 4, 1, 8, 0.5) +
      range("sd1", "随机斜率标准差", 1, 0, 2, 0.1) +
      range("rho", "截距与斜率相关", 0.3, -0.9, 0.9, 0.1) +
      (center ? range("center", "时间零点（原时间）", 0, 0, 6) : ""),
    ["彩色线：6 个体的潜在轨迹", "黑灰线：总体平均轨迹"],
    center
      ? [
          "把时间零点从 0 移到 3。",
          "比较同一观测时刻的预测值。",
          "观察截距方差、截距—斜率协方差如何改变。",
        ]
      : [
          "设随机斜率标准差为 0，观察平行轨迹。",
          "逐步增加斜率差异。",
          "改变截距—斜率相关，看起点高者增长如何变化。",
        ],
    center
      ? "换了时间零点，人的真实变化变了吗？"
      : "每个人都可以用一条平均增长线描述吗？",
    center
      ? "时间中心化只是重新参数化：新截距是原时间 c 处的预期水平，斜率与同一时刻的预测不变。截距方差和与斜率的协方差会改变，因此解释随机效应时必须交代时间零点。"
      : "重复观测嵌套于个体。随机截距允许起点不同，随机斜率允许变化速率不同。本页画的是潜在轨迹，不含观测误差；固定的六个示例个体不是模型总体协方差的估计。",
  );
  bind(() => {
    const c = center ? num("center") : 0,
      r = AS.growth(num("sd0"), num("sd1"), num("rho"), c),
      xs = r.rows[0].points.map((p) => p[0]),
      ys = r.rows.flatMap((r) => r.points.map((p) => p[1]));
    plotFit(xs, ys);
    r.rows.forEach((r, i) =>
      line(
        r.points.map((p) => p[0]),
        r.points.map((p) => p[1]),
        [teal, purple, orange, red, "#4779ad", "#7e8e56"][i],
        2,
      ),
    );
    segment([-c, 50], [6 - c, 62], "#36434a", 3, 2);
    advancedEnd(
      center ? `新截距是原 t=${c} 的水平` : "每个人都有自己的斜率",
      `总体平均：Y=50+2t；展示 7 个时点、6 条个体轨迹。`,
      [
        [fmt(r.var0), "当前零点的截距方差"],
        [fmt(num("sd1") ** 2), "斜率方差"],
        [fmt(r.cov), "截距—斜率协方差"],
      ],
      "t*=t−c；β0*=β0+cβ1；Var(u0*)=τ00+2cτ01+c²τ11",
      "模型参数指定总体方差；六条确定性的示例轨迹不一定具有这些样本方差。原时间始终为 0–6。",
      "横轴：中心化时间 t−c；纵轴：模型预测的个体结果。",
      ["个体", "原始截距", "当前截距", "斜率", "原时间", "当前时间", "预测Y"],
      r.rows.flatMap((p, i) =>
        p.points.map(([t, y]) => [
          i + 1,
          p.intercept,
          p.centeredIntercept,
          p.slope,
          t + c,
          t,
          y,
        ]),
      ),
    );
  });
}

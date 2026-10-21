"use strict";
const resources = [
  {
    name: "jStat",
    symbol: "jS",
    category: "integrated",
    license: "MIT · 1.9.6",
    url: "https://github.com/jstat/jstat",
    docs: "https://jstat.github.io/distributions.html",
    licenseUrl: "https://github.com/jstat/jstat/blob/1.9.6/LICENSE",
    local: "vendor/jStat-LICENSE.txt",
    desc: "浏览器统计计算库：正态、二项、Student t 等概率分布。",
    use: "本站实际使用：密度、二项概率质量、t 分布累计概率与分位点。极小正态尾概率另加稳定数值包装。",
  },
  {
    name: "simple-statistics",
    symbol: "ss",
    category: "integrated",
    license: "ISC · 7.12.1",
    url: "https://github.com/simple-statistics/simple-statistics",
    docs: "https://simple-statistics.github.io/docs/",
    licenseUrl:
      "https://github.com/simple-statistics/simple-statistics/blob/v7.12.1/LICENSE",
    local: "vendor/simple-statistics-LICENSE.txt",
    desc: "轻量统计函数库：描述统计、相关与一元线性回归。",
    use: "本站实际使用：均值、中位数、样本标准差、Pearson r 和最小二乘回归。type 7 分位数在本站显式实现并与该库核对。",
  },
  {
    name: "JSXGraph",
    symbol: "JX",
    category: "integrated",
    license: "MIT 选项 · 1.14.0",
    url: "https://github.com/jsxgraph/jsxgraph",
    docs: "https://jsxgraph.org/",
    licenseUrl: "https://github.com/jsxgraph/jsxgraph/blob/main/LICENSE.MIT",
    local: "vendor/JSXGraph-LICENSE.txt",
    desc: "浏览器交互图形引擎，可在同一坐标系中呈现曲线、散点、线段和区域。",
    use: "本站实际使用：18 个演示的 SVG 图形与课堂导出。图形随参数更新。",
  },
  {
    name: "KaTeX",
    symbol: "TₑX",
    category: "integrated",
    license: "MIT · 0.19.0",
    url: "https://github.com/KaTeX/KaTeX",
    docs: "https://katex.org/docs/browser.html",
    licenseUrl: "https://github.com/KaTeX/KaTeX/blob/main/LICENSE",
    local: "vendor/KaTeX-LICENSE.txt",
    desc: "数学公式排版库，让均值、标准误、积分与回归公式更清楚。",
    use: "本站实际使用：公式及 MathML 排版；字体随离线包提供。",
  },
  {
    name: "Seeing Theory",
    symbol: "ST",
    category: "external",
    license: "根许可 Apache-2.0；另见 README",
    url: "https://github.com/seeingtheory/Seeing-Theory",
    docs: "https://github.com/seeingtheory/Seeing-Theory/blob/master/README.md",
    licenseUrl:
      "https://github.com/seeingtheory/Seeing-Theory/blob/master/LICENSE",
    desc: "概率与统计可视化教学项目，覆盖分布、推断和回归等概念。",
    use: "拓展阅读与教学设计参考。项目已停止维护，在线演示可用性未确认。README 另有非商用请求；本站仅提供链接，未复制可视化或教材。",
  },
  {
    name: "jamovi",
    symbol: "j",
    category: "external",
    license: "AGPL-3.0 / 部分 GPL-2.0+",
    url: "https://github.com/jamovi/jamovi",
    docs: "https://docs.jamovi.org/",
    licenseUrl: "https://github.com/jamovi/jamovi/blob/main/LICENSE.md",
    desc: "面向教学和研究的图形化统计软件，支持描述统计、t 检验、方差分析与回归。",
    use: "课后导入本站 CSV，比较样本标准差、相关和回归结果。属于外部完整软件，未嵌入本站。",
  },
  {
    name: "JASP",
    symbol: "J",
    category: "external",
    license: "Desktop AGPL-3.0+；组件另见说明",
    url: "https://github.com/jasp-stats/jasp-desktop",
    docs: "https://jasp-stats.org/features/",
    licenseUrl:
      "https://github.com/jasp-stats/jasp-desktop/blob/development/Docs/development/jasp-licensing.md",
    desc: "提供频率学派和贝叶斯分析的开源统计软件，适合课堂比较不同推断方法。",
    use: "课后复核描述统计、相关与回归，或扩展贝叶斯分析。Desktop、Engine 等组件许可不同；本站仅提供官方入口。",
  },
];
function resourcePage() {
  $("#main").innerHTML =
    head(
      "开源资源库",
      "THE OPEN SOURCE TOOLKIT",
      "把可用的统计工具，放在同一个课堂入口。",
    ) +
    `<div class="notice">4 个库已在本站实际集成，可离线运行；3 个项目作为外部拓展资源。许可证与版本核对日期：2026-10-20。</div><div class="resource-toolbar"><div class="filters">${[
      ["all", "全部资源"],
      ["integrated", "本站已集成"],
      ["external", "外部拓展"],
    ]
      .map(
        ([v, l]) =>
          `<button class="filter ${resourceFilter === v ? "active" : ""}" data-filter="${v}" aria-pressed="${resourceFilter === v}">${l}</button>`,
      )
      .join(
        "",
      )}</div><input type="search" id="resource-search" class="resource-search" aria-label="搜索开源资源" placeholder="搜索项目、统计方法或用途…" value="${esc(resourceQuery)}"></div><div id="resource-count" class="resource-count"></div><div id="resource-grid" class="resource-grid"></div><p class="source-note"><a href="LICENSE.txt" download>应用 MIT 许可</a> · <a href="THIRD_PARTY_NOTICES.md" download>第三方声明</a> · <a href="https://github.com/dingyuzero/blcu-statistics-classroom" target="_blank" rel="noopener">本站源码 ↗</a></p><p class="source-note">直接打包的代码与字体保留原许可证。外部项目的代码许可不自动涵盖所有内容或附带素材。Seeing Theory 的根许可与 README 非商用请求一并列出；未发现可据以声称内容属于 CC 授权的明确声明。</p>`;
  function filter() {
    const q = resourceQuery.toLowerCase().trim(),
      list = resources.filter(
        (r) =>
          (resourceFilter === "all" || r.category === resourceFilter) &&
          [r.name, r.desc, r.use].join(" ").toLowerCase().includes(q),
      );
    $("#resource-count").textContent =
      `共 ${list.length} 个项目 · 官方来源与许可证可直接查阅`;
    $("#resource-grid").innerHTML = list.length
      ? list
          .map(
            (r) =>
              `<article class="resource-card"><div class="resource-top"><div class="resource-logo">${r.symbol}</div><div><h3>${r.name}</h3><small>${r.license}</small></div><span class="resource-status">${r.category === "integrated" ? "本站已集成" : "外部拓展"}</span></div><p>${r.desc}</p><div class="resource-use">${r.use}</div><div class="resource-links"><a href="${r.url}" target="_blank" rel="noopener">GitHub ↗</a><a href="${r.docs}" target="_blank" rel="noopener">文档与示例 ↗</a><a href="${r.licenseUrl}" target="_blank" rel="noopener">许可证 ↗</a>${r.local ? `<a href="${r.local}" target="_blank" rel="noopener">本地副本</a>` : ""}</div></article>`,
          )
          .join("")
      : '<div class="empty">没有匹配的资源，请清空搜索或更换分类。</div>';
  }
  $$("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        resourceFilter = b.dataset.filter;
        $$("[data-filter]").forEach((x) => {
          x.classList.toggle("active", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        filter();
      }),
  );
  $("#resource-search").oninput = (e) => {
    resourceQuery = e.target.value;
    filter();
  };
  filter();
}

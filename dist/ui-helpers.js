"use strict";
function head(title, en, subtitle, action = "") {
  return `<div class="page-head"><div><div class="eyebrow">${en}</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function range(id, label, value, min, max, step = 1) {
  return `<label class="field"><span class="field-top"><span>${label}</span><output id="${id}-value">${value}</output></span><input type="range" id="${id}" aria-label="${label}" min="${min}" max="${max}" step="${step}" value="${value}"><span class="range-ends"><span>${min}</span><span>${max}</span></span></label>`;
}
function select(id, label, options) {
  return `<label class="field"><span class="field-top">${label}</span><select id="${id}">${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>`;
}
function number(id, label, value, min = -100, max = 100, step = 0.5) {
  return `<label class="field"><span class="field-top">${label}</span><input id="${id}" type="number" min="${min}" max="${max}" step="any" inputmode="decimal" value="${value}" required></label>`;
}
function metric(label) {
  return `<div class="control-rule"></div><div class="metric-label">${label}</div><div id="metric" class="metric-value" role="status"></div><div id="metric-detail" class="metric-detail"></div>`;
}
function notes(steps, question, answer) {
  return `<div class="notes-grid"><section class="notes-panel"><h3>↗ 这样探索</h3><ol>${steps.map((x) => `<li>${x}</li>`).join("")}</ol></section><section class="notes-panel"><div class="question-tag">PAUSE & THINK / 课堂提问</div><h3>${question}</h3><details><summary>展开讨论提示</summary><p>${answer}</p></details></section></div>`;
}
function downloadArtifact(blob, filename, message) {
  if (exportUrl) URL.revokeObjectURL(exportUrl);
  exportUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = exportUrl;
  link.download = filename;
  link.textContent = "再次下载";
  link.id = "download-last";
  link.click();
  toast(message);
  $("#toast").append(" · ", link);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 12000);
}
function exportSVG() {
  const svg = $("#plot svg");
  if (!svg) {
    toast("图形还未准备好");
    return;
  }
  const ns = "http://www.w3.org/2000/svg";
  const width = Math.round($("#plot").clientWidth),
    height = Math.round($("#plot").clientHeight);
  const copy = document.createElementNS(ns, "svg");
  copy.setAttribute("xmlns", ns);
  copy.setAttribute("width", width);
  copy.setAttribute("viewBox", `0 0 ${width} ${height + 190}`);
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", "white");
  copy.append(rect);
  let cursor = 28;
  const measure = document.createElement("canvas").getContext("2d");
  function writeLine(text, size = 12, fill = "#38384a") {
    measure.font = `${size}px "Microsoft YaHei", Arial, sans-serif`;
    const tokens = String(text).match(/[A-Za-z0-9_.^()+−-]+|\s+|./gu) || [];
    const lines = [];
    let buffer = "";
    for (const token of tokens) {
      if (buffer && measure.measureText(buffer + token).width > width - 40) {
        lines.push(buffer.trim());
        buffer = "";
      }
      if (measure.measureText(token).width > width - 40) {
        for (const char of token) {
          if (measure.measureText(buffer + char).width > width - 40) {
            lines.push(buffer);
            buffer = "";
          }
          buffer += char;
        }
      } else buffer += token;
    }
    if (buffer.trim()) lines.push(buffer.trim());
    for (const content of lines) {
      const line = document.createElementNS(ns, "text");
      line.setAttribute("x", "20");
      line.setAttribute("y", cursor);
      line.setAttribute("fill", fill);
      line.setAttribute("font-size", size);
      line.setAttribute("font-family", "Microsoft YaHei, Arial, sans-serif");
      line.textContent = content;
      copy.append(line);
      cursor += size * 1.6;
    }
  }
  writeLine(activeTitle(), 18);
  writeLine(lastPlotParameters, 12);
  writeLine(formulaPlain, 13);
  writeLine(
    $(".metric-label").textContent + " = " + $("#metric").textContent,
    13,
  );
  writeLine($("#metric-detail").textContent, 12);
  cursor += 12;
  const graph = svg.cloneNode(true);
  graph.querySelectorAll("foreignObject").forEach((el) => {
    if (!el.childNodes.length) el.remove();
  });
  graph.setAttribute("x", "0");
  graph.setAttribute("y", cursor);
  graph.setAttribute("width", width);
  graph.setAttribute("height", height);
  copy.append(graph);
  cursor += height + 22;
  writeLine(
    $$(".legend span")
      .map((x) => x.textContent)
      .join("  /  "),
    11,
  );
  writeLine($("#formula-note").textContent, 11);
  writeLine($("#plot-caption").textContent, 11);
  writeLine(
    "北京语言大学 Ding Lab统计学课程 · 课堂展示版 · JSXGraph / jStat / simple-statistics",
    10,
    "#666677",
  );
  copy.setAttribute("height", cursor + 12);
  copy.setAttribute("viewBox", `0 0 ${width} ${cursor + 12}`);
  const desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
  desc.textContent = formulaPlain + " " + $("#formula-note").textContent;
  copy.prepend(desc);
  downloadArtifact(
    new Blob([new XMLSerializer().serializeToString(copy)], {
      type: "image/svg+xml;charset=utf-8",
    }),
    `统计课堂-${stateKey().replace(":", "-")}.svg`,
    "已导出当前图形 SVG",
  );
}

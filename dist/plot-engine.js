/* Small retained SVG scene for classroom interactions. JSXGraph remains the renderer. */
(function (root) {
  "use strict";
  class ClassroomPlot {
    constructor(container) {
      this.container = container;
      this.items = new Map();
      this.pending = false;
      this.board = JXG.JSXGraph.initBoard(container, {
        boundingbox: [-5, 3, 5, -3],
        axis: true,
        grid: false,
        showCopyright: false,
        showNavigation: false,
        keepaspectratio: false,
        pan: { enabled: false },
        zoom: { enabled: false },
        resize: { enabled: true },
        keyboard: { enabled: false },
        defaultAxes: {
          x: {
            strokeColor: "#a8afbe",
            strokeWidth: 1,
            ticks: {
              strokeColor: "#c7cddb",
              minorTicks: 0,
              majorHeight: 6,
              label: { fontSize: 12, offset: [-3, -17], display: "internal" },
            },
          },
          y: {
            strokeColor: "#a8afbe",
            strokeWidth: 1,
            ticks: {
              strokeColor: "#c7cddb",
              minorTicks: 0,
              majorHeight: 6,
              label: { fontSize: 12, offset: [-32, 0], display: "internal" },
            },
          },
        },
      });
      this.board.create("grid", [], {
        majorStep: "auto",
        strokeColor: "#e7eaf1",
        strokeOpacity: 0.7,
        minorElements: 0,
      });
    }
    begin(box) {
      this.started = performance.now();
      this.used = new Set();
      this.index = 0;
      this.board.suspendUpdate();
      if (!this.box || box.some((x, i) => Math.abs(x - this.box[i]) > 1e-10)) {
        this.board.setBoundingBox(box, false);
        this.box = box.slice();
      }
      // The ordinary y-axis is off canvas for positive-only x ranges.
      // Draw an in-frame vertical scale without changing the data coordinates.
      if (box[0] > 0 || box[2] < 0) {
        const x = box[0] + (box[2] - box[0]) * 0.015;
        this.data([x, x], [0, box[1] * 0.94], {
          strokeColor: "#a8afbe",
          strokeWidth: 1,
          fillColor: "none",
        });
        const rough = box[1] / 5,
          magnitude = 10 ** Math.floor(Math.log10(rough));
        const step =
          ([5, 2, 1].find((v) => v * magnitude <= rough) || 1) * magnitude;
        for (let y = step; y < box[1] * 0.95; y += step) {
          this.text(
            x + (box[2] - box[0]) * 0.012,
            y,
            Number(y.toPrecision(3)).toString(),
          );
        }
      }
      if (!this.pending) {
        this.pending = true;
        queueMicrotask(() => this.finish());
      }
    }
    obtain(type, create) {
      const key = type + ":" + this.index++;
      this.used.add(key);
      if (!this.items.has(key)) this.items.set(key, create());
      return this.items.get(key);
    }
    data(xs, ys, attrs = {}) {
      const item = this.obtain("curve", () =>
        this.board.create("curve", [[], []], {
          highlight: false,
          strokeWidth: 2.7,
          fillColor: "none",
          ...attrs,
        }),
      );
      item.dataX = xs;
      item.dataY = ys;
      const signature = JSON.stringify(attrs);
      if (item._styleSignature !== signature) {
        item.setAttribute(attrs);
        item._styleSignature = signature;
      }
      item.needsUpdate = true;
      return item;
    }
    point(x, y, attrs = {}) {
      const valid = Number.isFinite(x) && Number.isFinite(y);
      const item = this.obtain("point", () =>
        this.board.create("point", [0, 0], {
          name: "",
          fixed: true,
          highlight: false,
          size: 4,
          label: { display: "internal", fontSize: 13, offset: [10, 10] },
          ...attrs,
        }),
      );
      item.setPosition(JXG.COORDS_BY_USER, [valid ? x : 0, valid ? y : 0]);
      item.setAttribute({ ...attrs, visible: valid });
      return item;
    }
    text(x, y, content) {
      const item = this.obtain("text", () =>
        this.board.create("text", [x, y, content], {
          display: "internal",
          fixed: true,
          highlight: false,
          fontSize: 11,
          strokeColor: "#687482",
          anchorX: "left",
          anchorY: "middle",
        }),
      );
      item.setPosition(JXG.COORDS_BY_USER, [x, y]);
      item.setText(content);
      return item;
    }
    finish() {
      if (!this.pending) return;
      this.pending = false;
      if (!this.board || !document.getElementById(this.container)) return;
      for (const [key, item] of this.items)
        if (!this.used.has(key)) {
          this.board.removeObject(item);
          this.items.delete(key);
        }
      this.board.unsuspendUpdate();
      this.board.fullUpdate();
      const host = document.getElementById(this.container);
      host.dataset.renderMs = (performance.now() - this.started).toFixed(2);
      host.dataset.sceneItems = this.items.size;
      host.dataset.bounds = JSON.stringify(this.box);
    }
    destroy() {
      this.pending = false;
      if (this.board) JXG.JSXGraph.freeBoard(this.board);
      this.board = null;
      this.items.clear();
    }
  }
  root.ClassroomPlot = ClassroomPlot;
})(window);

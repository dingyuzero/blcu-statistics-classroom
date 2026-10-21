# 北京语言大学 Ding Lab · 统计学交互课堂

6 章、18 个交互演示，面向心理学统计课的观察、提问和课堂讨论。纯静态网页，内置 JSXGraph、jStat、simple-statistics、KaTeX 及公式字体。

- [公开课堂网站](https://dingyuzero.github.io/blcu-statistics-classroom/)
- [下载单文件离线版和发布包](https://github.com/dingyuzero/blcu-statistics-classroom/releases/latest)
- [使用说明](docs/使用说明.md) · [开发交接](docs/开发交接.md) · [部署说明](docs/部署说明.md)
- [高数配套网站](https://dingyuzero.github.io/blcu-calculus-classroom/)

| 章节 | 演示 |
| --- | --- |
| 描述统计 | 直方图与异常值、箱线图与四分位数、标准分与单位变换 |
| 概率分布 | 正态与二项、t 与正态、贝叶斯与基础率 |
| 抽样 | 抽样分布与 CLT、标准误与样本量、Bootstrap |
| 置信区间 | 长期覆盖率、单样本均值区间、Wilson 与 Wald 比例区间 |
| 假设检验 | Welch t、已知 σ 的 z 检验功效、多重比较 |
| 相关与回归 | 相关与异常点、残差与最小二乘、分组与汇总相关 |

## 本地运行

直接打开 `dist/index.html`，或在仓库根目录运行：

```sh
python -m http.server 8080 --directory dist
```

再访问 `http://localhost:8080/`。页面无后端、无 CDN、无运行时网络请求；外部资源和 GitHub 下载链接需要联网。

```sh
npm ci
npm test
npm run check:assets
npm run build:portable -- "release/统计课堂-单文件.html"
```

Windows PowerShell 可使用 `npm.cmd`。发布到 GitHub Pages 的是 `gh-pages` 分支根目录（`dist` 的内容），`main` 分支保存完整源码与文档。

单文件版只需复制 HTML 到另一台电脑，用现代桌面浏览器打开。公式字体、脚本和 Markdown 文档均已内嵌；不需要 Python、Node 或安装统计软件。使用说明中列出浏览器限制和验证范围。

本项目用于基础教学；默认示例和模拟是合成数据。计算在本机浏览器完成，参数存储在本机浏览器，未设置账户、数据上传或分析服务。

应用代码与文档采用 MIT 许可；第三方库保留自身许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

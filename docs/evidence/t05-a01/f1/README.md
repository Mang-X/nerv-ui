# T05/A01 F1：安排展开后的宿主布局修复

PR [#65](https://github.com/Mang-X/nerv-ui/pull/65) / [#58](https://github.com/Mang-X/nerv-ui/issues/58)。独立 R1 对 `5fa83e8163266ea759022f761e06ceb2a4d28d97` / tree `077d02549393aa1117b4bce12e903f024b878668` 的结论仍为 **REQUEST CHANGES，material 1 / optional 1**。本页是 F1 实施回执，不是独立 R2 审核结论；不合并、不关闭 tracker。

## 对象与改动边界

- 唯一 shell workdir：`/Users/mang/Project/nerv-ui-worktrees/t05-a01-screen-stage`；分支 `feat/t05-a01-screen-stage`。旧源零写。
- fetch 后 integration 仍为 `d9a5c22390090afce05cc74d731340ed5fe34cc3` / tree `bb0b68d1060b9e4a220c26a3042f8978644a8eb3`；本分支 merge 返回 `Already up to date.`。最终 exact head/tree 在外部 `handoff/review-receipt.md`，不在本文件制造自身 SHA。
- 运行改动只在 `ScreenStageDemo.vue`：网格第一行 `minmax(0, 1fr)`；安排容器为可收缩双行网格，正文有具名、可 Tab 聚焦的原生滚动区。左侧面板也提供具名可聚焦滚动，保留阅读说明展开后的完整正文。字号、文案、1600 选项和展开能力均保留。
- 相对受拒 head 的 1113 份 frontend 跟踪文件中，1111 份逐字节相同；只有该宿主与 `ScreenDemo.test.ts` 改动。公共 Scaler 原修复、scale、六件外壳、tokens、主桶、CSS 入口、六个旧表面及冻结素材未动。`frontend-byte-boundary.json` 保存逐文件 SHA256。
- **O1/P3 延后**：不在本轮更名 `screen-scaler--width` / `screen-scaler__bounds`，也不改变旧 root/stage class 兼容表面。该非阻断建议仍存在，不计为 F1 未修或已修。

## 公开 RED → GREEN

原生产 bundle 刷新 `/#screen/stage` → 原生设计尺寸选 1600×900 → fit → 点击“查看今日安排”→收起→再展开。新鲜 RED 与 R1 坐标一致；`red-layout-public.log` exit1：`F1 frame must stay inside grid`。反例存在断言自身通过不代表产品通过。

在同一个真实 Chromium 上，新 production build 按相同公开交互通过。1366×768 下：

| 量（CSS px）          | RED 展开/再展开 | GREEN 展开/再展开 |
| --------------------- | --------------: | ----------------: |
| grid bottom           |          665.71 |            665.71 |
| panel / frame bottom  |          723.42 |            665.71 |
| TechFrame 正文 bottom |          700.52 |            642.81 |
| divider top           |          687.09 |            687.09 |
| footer top            |          709.22 |            709.22 |

GREEN 验证 panel/frame 在 grid 内，agenda 在 frame 前，frame/正文在 divider 前，divider 在 footer 前，footer 在 stage 内。没有以 hidden 裁正文；安排区 `scrollHeight=214 / clientHeight=138`，真实键盘 Home→End 为 `scrollTop 0→75`，独立真实 wheel 为 `0→75.5`。顶部标题/说明和底部三条安排分别完整进入可见区域；逐项正文矩形与对应滚动区的交集断言通过。阅读说明、切换展厅和留言也真实点击；左侧正文经 Home/End 完整可达。

[RED：分隔线穿过正文](red-1366.png) · [GREEN：三条安排滚动可达，外框与页脚分离](green-1366.png)。已实际查看截图；首轮未等待字体的截图保留在 raw，正式矩阵等待 `document.fonts.ready`。

## Requirement | Evidence

| Requirement                                    | Evidence                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 正式宿主回归，状态/完整内容/可聚焦             | 新测试 `keeps every schedule entry in a keyboard reachable region across collapse and reopen at 1600 by 900`：原实现 1 FAIL/2 PASS → 修后 3 PASS；断言两次展开状态、三条原文、具名 region/tabindex、TechFrame 正文与返回链接。jsdom **不证明布局或实际滚动**。                                                                               |
| 真实布局与正文可达                             | `probe-matrix.mjs`：1920×1080、1366×768、2560×1080、960×540 × 1600×900/1920×1080 共 8 组 fit；每组刷新→展开→收起→再展开，检查几何互斥、各正文可见或 Home/End 可达、操作中心命中。`matrix.json` / `layout-summary.json`。                                                                                                                     |
| width/stretch/fit、resize、observer、slots/Tab | `probe-modes.mjs`：1366×768 下两设计尺寸各三模式；1920×1440 width 真实 wheel `0→337.5`，底部返回命中，再 fit `scrollTop=0`；仅改容器800×600→0→640×360，observer恢复；四个 slots、两个可滚区域与12步真实 Tab。`modes-observer-slots.json`。原生输入来自 browser mouse/wheel/keyboard，不是物理设备认证。                                      |
| 原生 zoom                                      | `probe-zoom.mjs`：清除 viewport 仿真后通过 `chrome://settings/appearance` 原生网页缩放 select 设置 80/100/125%；每态1600×900 fit刷新→展开→收起→再展开、正文可达和几何检查。DPR1.6/2/2.5，viewport宽2860/2288/1830，CSS zoom1、visualViewport.scale1、root/body transform none；finally恢复100%。`native-zoom.json` 和三个原生设置 snapshot。 |
| 主题、motion、资源身份                         | `probe-themes.mjs`：light/dark × neutral/blue，共16份实际HTTP200的HTML/JS/CSS/Inter响应保存原字节，与当前dist逐字节相同；固定screen tokens、正常/flow关闭/reduced motion、SVG、实际字体均重新核验。`themes/themes-resources.json`。字体拉丁为Inter，中文为系统PingFang SC。                                                                  |

## 新鲜门禁

pnpm 经 task-local `/tmp/nerv-ui-t05-a01-f1/bin/pnpm` 调用 corepack 固定11.22.0；Python仅uv 3.12。无新依赖、未重装。

- `pnpm -C frontend test` exit0：UI45文件/656、mobile27文件/144、host10文件/90 PASS。
- UI `test:docs` 3文件/6；mobile `test:docs` 1文件/2 PASS；仅静态文档契约。
- `pnpm -C frontend build` exit0：三包vue-tsc与production build。VueUse INVALID_ANNOTATION、chunk>500kB、jsdom CSS解析提示保留。
- 维护范围 fmt/lint、base→head及R1→F1 diff check结果见外部最终回执；历史raw diffcheck2/冻结fmt1另列，未清洗。
- 16/16依赖输入与固定base全字节相同；三活动包Vue3.5.39同realpath、同模块对象。旧源固定HEAD/clean核验和库文件身份见 `dependencies.json`。

新 bundle（均是本轮浏览器实际响应=dist，不继承旧 JS/CSS 的运行结论）：

| 响应                                     |  Bytes | SHA256                                                             |
| ---------------------------------------- | -----: | ------------------------------------------------------------------ |
| HTML                                     |    427 | `80d24bbf9242534000cfdbabaedd781a50ab5943a35436c26378d829f5fdf710` |
| `index-BFPtinWT.js`                      | 527113 | `c7b2628ba5b7d7726c65048ef8785b55d21169eef538e41489869ff8d45f77f9` |
| `index-PzV4m5Mm.css`                     | 245370 | `9cccc73d1cae57ef0b565e9591a77ba663005b5b68941cde0f9c2bd53e56bf94` |
| `inter-latin-wght-normal-Dx4kXJAl.woff2` |  48256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |

## 继承、FAIL、UNRUN与交接

- 继承：原A01及R1历史证据保留身份。新旧bundle不同，**不宣称整个旧browser证据可按产物身份继承**；仅通过1111文件字节身份界定未变源码边界。原完整七入口往返/深链与全部主题组合返回未在F1全重跑；公共库测试与F1相关新bundle浏览器组合本轮已跑。
- 保留FAIL：R1产品F1；本轮公开布局RED与正式host RED；最初 `ego-browser nodejs <path>` 用法错误exit2（随后改stdin，原日志不覆盖）；首轮GREEN诊断的 `schedule` 字段误读阅读说明按钮，该字段无效，最终matrix按安排按钮与三条正文重新断言；原作者TS/工具/zoom快捷键/animationName失败、R1未reload harness失败、历史raw diffcheck2/冻结fmt1均未清洗。
- T3先status/open；about:blank被URL校验拒绝，首次服务尚未就绪为chrome-error，服务就绪后navigate成功；同一步snapshot连续两次原文均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，再切ego-browser TaskSpace5。无新浏览器框架。
- UNRUN：CI、packed/versioned #11、完整docs站 #10、设备/物理触控、旧消费者接入/发布、真实observer泄漏/长时稳定性、父 #6 与其它六组组合验收。frozen install继承原A01，本轮16输入未变，未重复安装。
- 原始脚本、RED/GREEN、几何JSON、原生zoom、HTTP原字节和门禁日志：`/tmp/nerv-ui-t05-a01-f1/handoff/raw`；脚本位于同任务临时目录。持久归档：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a01-f1`，过滤node_modules/cleancheckout/cache。
- PR保持OPEN；不merge/close #58/#6/#1，不ready #18，不监控；自有浏览器与4192服务收尾清理，worktree保留独立R2。

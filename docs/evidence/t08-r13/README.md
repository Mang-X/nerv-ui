# T08/R13：折线图范围标注与定位链接

仅 [#31](https://github.com/Mang-X/nerv-ui/issues/31)，scope M。目标 `integration/nerv-ui-extraction`；唯一 checkout `/Users/mang/Project/nerv-ui-worktrees/t08-r04-screen-composition`，branch `feat/t08-r13-line-annotations`。初始 clean，base `0072c1cec946b05a5744ae95f54097d608c12ef9`，tree `7dcc5dd72a51f6e96b55964f5ddd2ce14c6551d9`。结束 fetch 仍为相同 base，无 integration delta，不需 merge/reset。

## 来源与处置

T01 固定 source `79b1578f2b75f55709765b5e7882aaf33146c603`。`source-inventory.json` 对 source/reference 两棵树的 1322 个 tracked frontend 输入按六个符号有界扫描，命中 8 个文件，列出 SHA-256 与行数。reference 内无对应代码命中；不是全仓算法审计。

- `QualitySpcCharts.vue` 全文：来源多范围、标签与独立 locator；旧 `100 / count` 与固定 inset 覆盖层不迁入。
- `useBusinessQualityAnalysis.ts` 的展示行、marker/targetId 与完整控制限检查段：仅核实输入/身份来源，不移植计算、SDK、查询、认证或行业模型。
- 直接消费者 `pages/quality/analysis.vue` 的 SPC template、台账同 targetId 锚点：新宿主保留同 id 明细定位；旧应用接入退出为 NOT_PLANNED。
- `TelemetryTrendPanel.vue` 全文、`telemetry/oee.vue` 与 `maintenance/reliability.vue` 的直接折线图 template：沿用无 annotations 的现有 props；无额外局部 style 块需迁移。其业务查询、统计和其它页面段不迁入。
- `QualityAnalysisCharts.test.ts` 全文：来源使用 chart stub，不能证明真实几何。`telemetryPages.test.ts` 仅符号盘点，未全文审读/执行。

以上来源原字节零改动，`migration/t01/provenance.jsonl` 原记录保留。SPC 文件 SHA-256 `a467dd22edbfc1d23ec1da08ed66d748b3f01db13f69b5f7f19115149a71df56` 与 provenance 一致。活动新改动仅 PC chart 接缝、playground、设计文档与本证据；shadcn 冻结目录零改动。#21/PR130、#23/PR128、#37、#43/PR122 与 P15 均未推进。

## 真实 producer 依据与公开边界

安装的 `@unovis/ts` / `@unovis/vue` 为 1.6.7。读取真实 producer：

- `@unovis/vue/components/line/index.js` 用 `defineExpose({ component })` 暴露 Line。
- `@unovis/ts/core/xy-component/index.d.ts` 的公开 `xScale/yScale`；未读 DOM 私有属性。
- `containers/xy-container/index.js` 在轴 autoMargin 后同步 scales、传 plot size、render 官方 Plotband，最后调用 `onRenderComplete(svg, margin, bleed, containerWidth, containerHeight, width, height)`。
- `components/plotband/index.js/config.d.ts` 从真实 scale 投影并使用 plot 宽高。多个 bands 用官方 `VisPlotband`，排除 domain calculation，有限端点先裁剪；marker 只复用同一 Line scale + render callback margin。

新增可选 `bands: NvLineBand[]`、`markers: NvLineMarker[]`，事件 `markerClick(currentMarker, nativeEvent)`，无新组件/框架/运行时导出、无新增 slot。类型主桶导出与命名附录登记；原 `LineSeries` 保持兼容。完整 API/边界见[图表文档](../../../frontend/apps/design-system/docs/components/desktop/chart.md#折线图范围与定位)。标注模式关闭线/轴插值，避免最终位置的 marker 叠在运动中的曲线上。无标注时保留原始数值、动画与 tooltip 入口。

## Requirement / Evidence

测试文件 `frontend/packages/ui/src/components/pc/chart/LineAnnotations.test.ts`，describe `line annotations with actual Unovis producer`：

| 要求                                              | 精确 test 名                                                                                       | 证据              |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------- |
| 真实共享域、边界、重复 x 标签                     | `projects boundary and duplicate-label rows onto actual shared plot scales`                        | red-05 → final-ui |
| 多范围、反转、脱轴裁剪、大有限阈值                | `clips multiple reversed bands with official producer and never expands data domain`               | red-05 → final-ui |
| 替换重排、同 key label、当前 identity、删除与焦点 | `uses current identity after replacement and reorder without replacing focused marker DOM`         | red-05 → final-ui |
| 尺寸、系列隐藏、空数组、双实例                    | `updates resize and data/series domains and isolates a second chart`                               | red-05 → final-ui |
| 无默认标注、安全锚点、零                          | `omits unknown, invalid and unsafe targets and adds no default annotation`                         | red-05 → final-ui |
| 单点零、unknown、巨大有限数据差值                 | `keeps single zero points, omits unknown values and projects large finite differences without NaN` | red-05 → final-ui |
| actual axis 自动边距、单位/current tooltip        | `follows actual axis auto margins and formats current tooltip data with units`                     | red-05 → final-ui |

宿主 `frontend/apps/playground/src/LineAnnotationsDemo.test.ts`：`line annotation hosts > locates current same-id detail after reorder and replacement in library`、`... in garden`，host-red-01 → final-host。两种宿主真实明细、同 id focus 和 preventDefault 均断言；事件通过公共 chart emit 驱动，不能冒充浏览器圆点点击链验证。

几何测试仅替代 jsdom 缺失的 SVG getBBox、clientWidth/clientHeight、transform 平台布局边界，保留真实 Vue Unovis 组件、XYContainer、scale/domain、轴 autoMargin、Plotband 和布局回调。手算预期：600 px 容器、50 px 受控轴框，左 margin 为 58，Line 4 px bleed，首末点 62/584；轴框改 90 后首点 102；宽改 800 后末点 784。没有把 stub 自己返回的固定 scale 当图表结果。自动 margin 在真实字体、responsive/祖先缩放及浏览器 resize 下仍未验收。

## 执行与状态

Node v24.18.0；全部正式命令显式使用缓存 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，版本 11.22.0。根 PATH pnpm 为 12.0.0，仅读版本，不用于正式验证；无依赖安装升级。

每轮独立日志/JSON；带 `.command.json` 的轮次记录完整 cwd、argv 与 exit code。具体命令以 receipt 为准，测试均 `exec vp test run` 指定文件，无包 test 脚本追加路径。未提供 runtime unhandled 计数字段时保留 UNKNOWN；正常文本 runner 无 Errors 段与 exit 0 支持本轮无已报告未捕获异常，不伪造计数 0。

历史 FAIL 不抹除：red-01/green-01 为相对 import 错误（0 tests，非行为 RED）；red-02/green-02 为 exposed 访问；green-03–08 为测试布局/API搭建过程失败；green-04 有 13 个未捕获 getBBox 错误；green-07 另有缺少 toRaw import；green-10 虽 6 assertions 通过但有 2 个 d3 transform 未捕获错误，整体 FAIL；host-01 虽 2 assertions 通过但 1 个 getBBox 未捕获错误，整体 FAIL。types-01 FAIL 后已收窄类型修复。green-09/11、host-02 是随后本地通过，不覆盖历史。

fresh：最终 UI/命名/chart readiness、两宿主、docs contracts、UI/host types、playground build、scoped lint/fmt、根 Markdown stdin 非空/cmp、人工相对链接检查、diff check 见 final-\* receipt。green-only docs contract 与 build 不称 RED/GREEN。旧 C02 vendor 432 PASS + timeout 的完整日志缺失，保持继承 UNKNOWN/未重跑；global fmt3/main RAW2/docs alias ENOTDIR/parallel timeout 不顺修、不以本轮窄门禁洗绿。

UNRUN：browser/实际 plot 视觉与 resize、HTTP、docs Live/文档构建、CI、packed consumer、device、vendor 专项、APS/production。许可 UNKNOWN。旧应用接入 NOT_PLANNED。本票只交 draft 候选，必要真实运行 AC 缺口交父独立 review；不自签整票、不 ready/merge/close/watch、不安排审核、不启动后继代理。

## R1 返修

同色范围标签关联的 RED/GREEN、原字节 probe 和未运行边界见 [F1 记录](f1/README.md)。R1 指出的全段 raw diff-check exit 2 为原始日志空白，之前笼统的“diff check 通过”仅适用于实现限定范围；不以 scoped exit 0 覆盖此失败。

# T05/A07：主指标、比较摘要与时间分段

本记录仅覆盖 [#64](https://github.com/Mang-X/nerv-ui/issues/64)，依据已批准 [spec v1](https://github.com/Mang-X/nerv-ui/issues/1) 和父 [#6](https://github.com/Mang-X/nerv-ui/issues/6)。未执行父票完整组合验收；#25 三种新卡由同一 owner 后续复用，不是本票前置。

目标工作树 `/Users/mang/Project/nerv-ui-worktrees/t05-a07-screen-summary`，分支 `feat/t05-a07-screen-summary`。开工 HEAD/base `46052f3473e761378145506206ac96304aae0713`，tree `f1ede89382d503960f73d153749fabadb2210967`；交付前 fetch/merge 最新 `origin/integration/nerv-ui-extraction`。最终 PR/head/tree/base 固定在外部 handoff，避免在提交内自引用。旧源 `79b1578f2b75f55709765b5e7882aaf33146c603`、双 main、root checkout、自动 Nerv-IIP 工作树均未写入。

## 语义与 owner

- `NvOeeHero` 新增可选 `deltaTone: positive | negative | neutral`，只选变化文本的绿/红/弱色，业务好坏由宿主决定。未传仍使用旧的前导负号判断；主数字颜色不变，没有 OEE/费用/同比算法。spark 仍按原规则绘制；显式 `[]` 不恢复样例。两实例改用 Vue `useId` 维持各自 SVG defs/ref。
- `NvScreenStatusCard` 只加逐字段 `labels` 与 plan/actual 共用 `unit`。旧必填字符串 props、字段名、默认中文/件及三态 palette 保留。host adapter 明确 target→plan、visits→actual、progress→rate、duration→downtime；未知传 `—`，不推断 0。原组件自带 Panel，不再套第二层卡。
- `NvTaktGantt` 只加 `toneLabels`，统一控制图例和原生 title。旧 title/axis/rows/default、run/idle/stop/alarm palette 保留。宿主保证 name 唯一、有限 0–100 段宽及每行总和≤100；不足100留尾部空白，0宽与空 segs/rows/axis均明确。超界输入不支持，不归一化、不增加 ID/schema/日期轴/拖拽/排程规则。
- `/#screen/summary` 通过主桶与公共 CSS 展示文化空间、共享办公两份来源；维持所有已完成分组和旧表面。无领域 SDK/业务计算进库。A01–A06 组件/工具、tokens/globalCSS、导出、冻结素材、依赖与许可均无改动。#40/#43/#51 和 #63 宿主“内存中分页”P3 不扩修。

## Requirement | Evidence

公共测试位于 `frontend/packages/ui/src/components/screen/ScreenSummary.test.ts`（8项）与 `ScreenSummaryDocs.test.ts`（3项）；宿主测试位于 `frontend/apps/playground/src/screen/ScreenSummaryDemo.test.ts`（3项）。以下名称均为实际 test title，未使用全 DOM snapshot 或重写几何算法。

| Requirement                                                      | Evidence                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero 旧 props、前导负号与默认/空 spark                           | `hero legacy minus prefix and default spark remain while explicit empty removes spark`；旧文案带内嵌负号仍按原逻辑；显式空移除 SVG。                                                                                                                                                                                                                   |
| 下降但改善、色调独立于文本、未知与真实0、更新/清空 delta         | `hero explicit tone expresses improving decrease and updates independent of delta text`；positive→negative→neutral、—→0、空→非空 spark。                                                                                                                                                                                                               |
| 双 Hero defs/ref 不串，来源值/曲线更新不污染另一实例             | `two heroes retain separate gradient references while source and spark change`；两个唯一 ID、各自 url 引用、第一实例 value/spark 替换、第二实例值不变及 SVG aria-hidden。                                                                                                                                                                              |
| StatusCard 旧中文/件/原始字符串与三态边/灯/大字                  | `status legacy strings labels units and all three palette accents remain`，run/idle/alarm 逐态 setProps。                                                                                                                                                                                                                                              |
| 覆盖全部固定领域文案/单位，部分覆盖回落，—/0保留，无第二层 Panel | `status covers every fixed domain label and unit then restores omitted defaults`；显式空 unit、labels/单位移除后恢复旧默认。                                                                                                                                                                                                                           |
| Takt 旧三行、轴、标题、图例和 title 兼容                         | `takt legacy title axis rows palettes and hover text remain`。                                                                                                                                                                                                                                                                                         |
| Takt 中性四态图例/title/顺序/输入宽度、来源与轴/标题更新         | `takt neutral labels drive legend and every ordered segment title width and updates`；不同领域文案、行名和段序替换。                                                                                                                                                                                                                                   |
| 空 rows/axis/segs、0/50/100宽度及部分映射回落                    | `takt explicit empty axis rows and segments never restore industrial examples and partial labels fallback`；不自动混入工业示例。合同外负数/非有限/超100不硬塞测试。                                                                                                                                                                                    |
| 两行业来源与明确 legacy adapter、费用下降绿色                    | `summary switches culture and coworking sources with explicit legacy adapter and improving cost decrease`，真实文字、labels/单位、title 和数值关系。                                                                                                                                                                                                   |
| 宿主 unknown/empty/update/long/大数及恢复                        | `summary unknown empty large and long labels update visible values and segment input then recover`。                                                                                                                                                                                                                                                   |
| summary深链、全部旧入口、卸载/重入来源重置                       | `summary deep link preserves all previous routes and resets source on return`；旧 ScreenDemo/App suites 同时执行。                                                                                                                                                                                                                                     |
| Hero 实际文档输入清空/真实0恢复                                  | `hero documentation actual input clears to unknown and restores text zero without invented spark`；编译实际 Markdown 的 script setup 与首个 ScreenDemo，无 v-model.number 空字符串运算。                                                                                                                                                               |
| Status 实际文档输入未知/空单位/真实0                             | `status documentation actual inputs clear reading to unknown and allow unit suppression`；保留旧三态 demo。                                                                                                                                                                                                                                            |
| Takt 实际文档清空/恢复和四个中性 title                           | `takt documentation actual toggle empties axis and rows then restores all neutral segment titles`；保留零 props demo。                                                                                                                                                                                                                                 |
| 最终 dist 的 1920×1080 / 1366×768 / 960×540 / 精确 fit0.5        | `browser-06.mjs` / `browser/final-viewport-matrix.json`，真实 CSS viewport、toolbar、stage transform、卡片/读数矩形、字体与 scrollparent；fit0.5 使用960×659（控制栏占119，实际舞台540）。小视口为等比缩放，不是假装响应式重排。                                                                                                                       |
| 最终来源/长内容/大数/未知/空/段更新                              | `browser/final-source-states.json` 7态，双 Hero/StatusCard 多实例、scrollWidth≤clientWidth；`browser/final-inner-scroll.json` 键盘 End 等待实际终点、末条可见，`final-scroll-end.png` 已查看。                                                                                                                                                         |
| 四类首末行段的真实鼠标命中、hover title、色调/比例               | `browser-08.mjs` / `browser/final-hovers-and-gradients.json`：8段标题与输入一一对应、brightness实际收敛、两实例defs/ref、首行35/25/30/10实际宽度；不从时间文字计算。                                                                                                                                                                                   |
| 外层 light/dark × neutral/blue，screen固定深色；正常/低动效      | `browser/final-outer-themes.json` 4组合；`final-reduced-motion.json` 呼吸 animation=none，键盘 Enter 可切来源。正常状态保留呼吸。                                                                                                                                                                                                                      |
| 13条旧路由和 A01–A06 生命周期 smoke                              | `browser/final-route-roundtrips.json`：stage/controls/indicators/data/charts/tables/desktop/touch/5种mobile；控件 portal、指标连续更新、图表替换、表格下一页实际操作后返回summary，portal不残留、来源重置。完整旧领域流程未重验。                                                                                                                      |
| 原生 Chrome 125%，恢复100%                                       | `browser-07.mjs` / `browser/final-native-125.json`；真实 chrome://settings/appearance 选择125%，DPR2→2.5，实际1830×970，visualViewport.scale=1；原生鼠标命中/来源、长值/未知和键盘切换。`chrome-native-125.png`、`final-native-125.png` 已查看，均无clip的Page.captureScreenshot；`native-zoom-restored.json` DPR2/scale1。未用DPR/pageScale模拟zoom。 |
| 实际请求 HTML/JS/CSS/字体 = 最终 dist                            | `browser/final-dist-resources.json`：4个200响应，427 / 630430 / 298398 / 48256 B，逐字节与SHA256相等。只认证实际请求的 Inter Latin woff2，未请求 MiSans/其它字形资源不认证。                                                                                                                                                                           |

## 命令与完整门禁

每次 shell 命令显式 cwd 为上述 worktree。`run.mjs` 记录命令、cwd、exit、stdout/stderr。任务本地 `/tmp/nerv-ui-t05-a07/bin/pnpm` 内容为 `exec corepack pnpm@11.22.0 "$@"`；无全局升级。缺 node_modules，成功执行一次 frozen 安装；初次版本护栏拒绝后才使用显式版本。

```sh
PATH=/tmp/nerv-ui-t05-a07/bin:$PATH pnpm -C frontend install --frozen-lockfile
node /tmp/nerv-ui-t05-a07/handoff/gates.mjs
node /tmp/nerv-ui-t05-a07/handoff/run.mjs host -C frontend --filter @nerv-iip/playground test --reporter=json --outputFile=/tmp/nerv-ui-t05-a07/handoff/raw/host.json
node /tmp/nerv-ui-t05-a07/handoff/run.mjs docs-ui -C frontend --filter @nerv-iip/ui test:docs --reporter=json --outputFile=/tmp/nerv-ui-t05-a07/handoff/raw/docs-ui.json
node /tmp/nerv-ui-t05-a07/handoff/run.mjs docs-mobile -C frontend --filter @nerv-iip/ui-mobile test:docs --reporter=json --outputFile=/tmp/nerv-ui-t05-a07/handoff/raw/docs-mobile.json
node /tmp/nerv-ui-t05-a07/handoff/run.mjs build-final -C frontend build
node /tmp/nerv-ui-t05-a07/handoff/validate.mjs
node /tmp/nerv-ui-t05-a07/handoff/audit.mjs
ego-browser nodejs < /tmp/nerv-ui-t05-a07/handoff/browser-06.mjs
```

最终 UI **770** / mobile **144** / host **124** / docs-source **6+2**，JSON success=true，failed/pending/todo/失败suite均0，每个 assertion passed，exit0，日志没有 unhandled 标记。runner 未提供 numUnhandledErrors 字段，不能冒称字段0。host 相比119增加3项A07行为和现有 imports scanner 自动新增的2项（43→45），没有为凑数字添加测试。production build含三个活动包 vue-tsc；最后补强双Hero断言仅测试源码，另跑UI类型检查，未改变已认证dist。维护精确文件清单、fmt/lint/diffcheck与16份完整依赖字节/唯一Vue realpath见 `raw/audit.json`。

## RED / GREEN / FAIL / 继承 / UNRUN

- `raw/public-red.json`：3通过/5失败，其中4项是新API尚未生效的公共RED，另1项为VTU对子组件调用setProps的harness错误。`public-green.json`仍保留该harness失败；改为宿主prop驱动后 `summary-green2.json` 11/0。后续双Hero断言加强后全UI重新通过。
- `raw/host-red.json` 0/3、`docs-red.json` 0/3均为实际旧页面/空宿主不满足新公开行为。新宿主3/0，实际文档3/0。未把未知数补0、未静默删旧能力。
- 本票引入的 formatter 多语句事件处理器解析错误：`host-format-full-fail.json` 105 assertions通过但3 suite加载失败、整体success=false；`host-format-red.json`窄复现。移至具名 toggleLong 函数后完整host124/0；不把断言105/0冒称完整通过。首轮build-first的get().exists()类型错误同样保留。
- `install.log` 保留pnpm12被版本护栏拒绝；`install11.log`为11.22.0成功安装。`fmt-first.log`保留12文件格式FAIL，后续维护范围fmt/lint通过。
- T3 preview status/open/navigate先行；初次无效about:blank URL、resize缺mode与两次同一步snapshot timeout在 `raw/t3-preview-transcript.json`逐字转录。两次原文均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，随后按规则使用ego；不是未尝试preview即换工具。
- `browser-03.log`过早断言hover过渡的1.18903，`browser-04.log`过早断言End滚动中间值；均保留。改为等待实际brightness(1.3)/scroll终点后复核，最终dist `browser-06/08` fresh通过；不是组件缺陷RED。
- CSS parser、VueUse PURE/INVALID_ANNOTATION、chunk警告保留原日志。本轮维护范围与全仓历史维护FAIL分开；本轮staged全量raw diffcheck exit2（`raw/staged-raw-diff-check.log`，原样终端空行/ANSI尾空格）与维护源码diffcheck exit0分报，未清洗原始日志。历史RAW diffcheck exit2 /冻结fmt exit1继续继承 [A06记录](../t05-a06/README.md)，没有顺修冻结文件或擦除历史。
- Fresh：上述运行测试、类型/build、维护/依赖、最终dist浏览器矩阵、原生125%、四个响应体。旧工业兼容由本轮公共mount直接证明；迁移素材/来源身份继承既有固定基线，没有在旧库执行。
- UNRUN：CI、packed-install #11、完整文档站 #10、物理设备、旧库接入、父#6完整34组件+2工具+4类型组合验收、独立merger审查。这里是desktop mouse/keyboard Chromium，不是physical device认证；#64通过也不直接关闭#6/#1，不操作#18 ready/合并。

外部原始交付目录 `/tmp/nerv-ui-t05-a07/handoff`；持久副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a07-implementation/`。本目录的 `raw/`、`browser/` 和脚本是筛选后的同份证据，不含 node_modules、clean checkout、.vite/cache 或生成dist目录。资源响应体仅四份已请求文件。交付时清理自有browser/service与zoom，工作树保留给独立merger。

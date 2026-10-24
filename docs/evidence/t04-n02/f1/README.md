# T04/N02 F1 修复增量

对应 [PR #52](https://github.com/Mang-X/nerv-ui/pull/52) 的 R1 material F1/P2，仅修新宿主焦点所有权；不处理 [#51](https://github.com/Mang-X/nerv-ui/issues/51) 或 [#43](https://github.com/Mang-X/nerv-ui/issues/43)。R1 被拒绝对象为 head `3781ae845ec7e2d676b6e4a8f56d7a3552b8396e` / tree `33bf4bbde5f185f1dd25ae3964f35e22a8f6c41b`。开工任务树 clean。最终提交以 PR head 和 Git 为准，执行源码 SHA256 固定在 [runtime identity](runtime-identity.json)。

基线与同步后的 integration tip 均为 `a20825e0477f446737a6bfc07d84b8ec20a143b6` / tree `b5878a6c46faac1384ec15bc5de3a5dea0908cfc`；未修改 integration root。工作树 `/Users/mang/Project/nerv-ui-worktrees/t04-n02-mobile-input`，分支 `feat/t04-n02-mobile-input`，raw `/tmp/nerv-ui-t04-n02-f1`。未写旧 Nerv-IIP 仓库，未合并、关票或监控 PR。

## 根因与最窄修复

原宿主把普通 button/link/tabindex 限在 `data-form-region`，而扫码区三个动作是它的兄弟节点；主题按钮还在监听区域外。普通动作得到焦点后 editing 被清空，ScanBar 的真实排队 RAF 回抢。

`MobileInputDemo` 改为在当前页壳根监听 focusin/focusout，并按原生交互语义识别该页壳 DOM 内的控件。扫码区域自身继续排除；没有文字白名单。`host.contains(target)` 明确 DOM 所有权：Teleport 键盘/Sheet/Dialog 的生命周期仍由原有 open 状态负责，避免把已经移除的键盘按钮遗留为宿主编辑状态。ScanBar、各库控件、CSS、路由、依赖与其它事件实现均未改。

## 正式 RED → GREEN 与外部探针

本次是单文件焦点协调的 focused 测试工作。使用真实组件及 DOM focus，只控制 RAF；没有组件 stub、私有 vm 断言、新测试依赖或报告器。code-testing-extensions 在当前运行时未提供，沿用仓库 Vitest/VTU 约定。

| Requirement                                    | Evidence                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 三个遗漏动作保持焦点，离开恢复且保留手工草稿   | `yields scan focus to 'clear number' and resumes with the manual draft`、`yields scan focus to 'open number sheet' and resumes with the manual draft`、`yields scan focus to 'open reminder dialog' and resumes with the manual draft`；[formal RED](formal-red.log) → [最终 host GREEN](host-final.log) |
| 保存对照、同宿主 header/link 同语义让出        | `yields scan focus to 'save record control' and resumes with the manual draft`、`yields scan focus to 'header theme control' and resumes with the manual draft`、`yields scan focus to 'host navigation link' and resumes with the manual draft`；同一 RED 中保存 PASS，header/link FAIL；最终全部 PASS  |
| 扫码直接转入动作时取消排队回焦，回到扫码仍正常 | 上述六例均额外执行 scanner → action → blur → scanner，并断言状态与草稿；不是只验证从 readonly 输入转移                                                                                                                                                                                                   |
| Teleport 键盘确认后恢复，原生手工草稿保留      | `resumes scanning after focus leaves the host for the standalone keypad and confirmation removes it`；[首次局部改法的边界 RED](teleport-boundary-red.log) → 最终 host GREEN。该 RED 属于本轮局部实现中发现并修正的问题，不冒充 R1 原始失败                                                               |
| optional1：满长后独立 sign                     | `toggles the sign independently after the keypad reaches its append limit`；输入 1…7 得 `123456`，sign 得 `-123456`，再切回并确认；既有公开契约首次就是 GREEN，不伪造 RED，也未修改 maxlength/sign 实现                                                                                                  |

正式初始 RED：新增六例中 5 FAIL / 1 PASS（保存对照），筛选还命中已有浮层例 PASS，合计 5 FAIL / 2 PASS / 5 skipped。最终宿主文件 14 例全部 PASS，完整 host 5 files / 40 PASS。

原审外部 `capture-focus.test.ts` 与 `probe.config.mts` 原样执行：本席先 [3 FAIL / 1 PASS](external-red.log)，最终 [4 PASS](external-final-green.log)。文件执行前后 SHA256 一致，见 [probe identity](external-probe-sha256-before.txt) 与 [readback](external-probe-sha256-after.txt)。R1 原始 3 FAIL / 1 PASS 与完整拒绝回执另以 `r1-original-*` 保留；不覆盖为 PASS。

窄命令：`pnpm -C frontend --filter @nerv-iip/playground exec vp test run src/MobileInputDemo.test.ts`；最终完整命令 `pnpm -C frontend --filter @nerv-iip/playground test`。原审外部命令 `pnpm -C frontend exec vp test run --config /private/tmp/nerv-ui-t04-n02-merger-20261024/probe.config.mts`。

## Fresh 串行门禁

PATH 前置 `/tmp/nerv-ui-t04-n02/bin`，pnpm shim 固定 `corepack pnpm@11.22.0`，顶层/nested 实读均 11.22.0。现有 node_modules 上 frozen install PASS，`Already up to date`；不是空目录 clean-install。

| 分类                             | fresh 结果             | 记录                                         |
| -------------------------------- | ---------------------- | -------------------------------------------- |
| UI 行为                          | 43 files / 644 PASS    | [ui](ui.log)                                 |
| mobile 行为                      | 13 files / 75 PASS     | [mobile](mobile.log)                         |
| host 行为                        | 最终 5 files / 40 PASS | [host](host-final.log)                       |
| mobile 命名静态契约              | 6 PASS                 | [naming](naming.log)                         |
| mobile / UI 文档静态契约         | 2 / 6 PASS             | [mobile](mobile-docs.log)、[UI](ui-docs.log) |
| 三包 vue-tsc 与 production build | 最终 PASS              | [build](build-final.log)                     |
| 2 个变更源码 fmt / lint          | 最终 PASS              | [fmt](fmt-final.log)、[lint](lint-final.log) |

UI/mobile/命名/staticdocs 在首次修复后 fresh 执行；随后只改宿主 DOM 所有权与同文件测试，未再改库源码/配置，其最终 host、外部 probe、三包类型/build/fmt/lint 均重跑。命令和退出码见 [gates](gates.json) 与 [final gates](final-gates.json)。jsdom CSS parse、第三方 pure annotation 警告原样保留，不当布局证据。

[完整字节审计](dependency-source-audit.json) 比较 16 份保留 manifest/lock/workspace 的 base、R1 head 与工作区完整字节及 SHA256，全部相同，包含 inactive 材料；实际 Vue 身份仍唯一。相对 R1 的生产源码只改 MobileInputDemo，移动包文件全部不变。base 已有移动 68 文件中仍只有本 PR 原滑块一行守卫不同，其余 67 文件不变；新增 Slider test 单列。第一次复用旧审计脚本误把 PR 新测试当 base 文件的错误见 `audit-added-test-harness-error.log`；修正枚举基线文件后通过，不属于产品失败。

## Fresh 定向浏览器与继承边界

T3 同一步两次原始 `Preview automation snapshot timed out after 15000ms.` 见 [记录](preview-errors.txt)，随后按 brief 使用 ego TaskSpace 4 / p1，最终已 `finish({keep:[]})`。最终生产 JS 为 `assets/index-BuDJPcks.js`，SHA256 `5ff3a7fc69b9874b53a06bb715a171efd9b48d5358bdbbfaa634c26960253645`；与 R1 的 JS 不同。使用 Chromium desktop UA，CSS 视口 390×844；原生 CDP 按键/文本/点击，keydown 后立即 keyup，之后才观察两次真实 RAF。没有延后 keyup，更没有以此修复 #51。

- [part1](browser-final-part1.json)、[browser08 raw](browser-08.log)：扫码 → Tab 数字模式 → readonly 数值 → 清空动作 → 抽屉动作，焦点跨 RAF 保持且状态让出；Space 实际打开 Sheet，Tab/Enter 打开其数字键盘；点击 `0`、`1`，确认保留 Sheet/数值 `01`/补充草稿，Escape 关闭。该轮 raw 中旧 rawKeyDown Enter 的“clear retains focus”仅证明焦点保持，不计清空动作成功。
- [part2](browser-final-part2.json)、[browser13 raw](browser-13.log)：从实读 scanner 重新以 Tab 到提示动作，完整原生 Enter 序列实际打开 Dialog，备注输入与确认回显成功；退出普通动作后恢复扫码且保留 `手工草稿F1`。再经 Tab/Enter 打开独立键盘，实际输入并确认 `0123`，键盘移除后恢复 scanner。
- [part3](browser-final-part3.json)、[browser11 raw](browser-11.log)：Tab 到清空动作，Space 实际把非空 `0123` 清空并保持按钮焦点；真实 Tab 遍历到保存对照，Enter 保存第 1 次并保持焦点。离开后 scanner 恢复，手工草稿提交为第 1 次扫码。纯 document 捕获的 `XY` 残片在转入普通动作后清空，恢复后原生提交 `NEXT` 为第 2 次，无残片拼接。最后 Shift+Tab 到 header 主题动作、Space 切换主题、Tab 到导航链接，仍让出焦点。

[事件记录](browser-final-events.json) 有 249 个 trusted 事件与 2 个明确 `isTrusted=false` 的 `XY` 捕获键；后者在同一个 blur→RAF 窗口由脚本分发并程序聚焦动作，只用于验证公开捕获残片边界，不是物理扫码认证。浏览器生成的 trusted 焦点事件也不能等同真人设备操作。

[资源响应](browser-responses.json) 与 [产物身份](artifact-identity.json)：HTML/JS/CSS/字体 4 项 HTTP 200，实际 browser fetch 保存的完整响应字节/长度/SHA256 均与最终 dist 相同，原始 `.bin` 留 raw 目录；资源性能条目同时记录加载的新 JS。运行读回 scan=`2 次 · NEXT`、number=空。三个 PNG 均为实际 390×844，已查看：[Sheet+键盘](final-sheet-keypad.png)、[Dialog](final-dialog.png)、[导航焦点](final-link-focus.png)。

继承只限此前 [N02 四态记录](../README.md#fresh-浏览器) 的 CSS/静态布局部分：本次 CSS SHA256 `6e3b9322f55869f0708cb40dcbc07e1f57498448e46c4a3f3b30704167910193`、字体 SHA256 `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` 与原证据一致，DOM 类与结构未变；没有重跑四态完整几何/hit 矩阵，不把旧 JS 交互计为新 head fresh。原证据与 R1 FAIL 全部保留。

## 自动化失败、原始日志与未运行

所有尝试均在 raw，浏览器日志亦归档本目录。初始 browser01/02 使用首次局部改法的旧 dist，不计最终源码证据；round 间尺寸曾读到 2320×1245，不计移动视口验证。最终各交互行重新实读 390×844，PNG 也核对实际尺寸。

browser06 的四 RAF/2000ms 有界观察超时，browser07 记录了实际 RAF 调度间隔；最终观察使用两真实 RAF/5000ms 上限，超时就失败，不用 sleep 当通过判据。browser09 错误假定跨自动化 round 后焦点仍在 Sheet 入口，实际已恢复 scanner；保留断言失败，后续按实际 scanner 起点重新走 Tab。browser10 仅发 rawKeyDown Enter，未带回车文本，未触发 Chromium 默认激活；browser12 原始事件没有 click 且 Dialog 不存在。browser13 用原生 keyDown + 回车文本、立即 keyup 后，实际 Dialog 开关与保存回显通过。所有失败均未改写为 PASS。

原始 `.log` 保留 ANSI、空白和末尾空行；全量 diff whitespace 检查仍返回 2，见 `full-diff-check.log`。排除本票 raw `.log` 的源码/人工文档/其它数据 scoped 检查返回 0，见 `scoped-diff-check.log`；二者不是同一个结论。人工 Markdown 格式单独检查，不正常化 R1 原始 receipt/log。

UNRUN：CI、物理 PDA/扫码枪、系统软键盘不弹设备认证、非零 safe-area、#11 版本化安装产物、完整文档站、旧消费者/旧全栈、N03–N05 整组、#43 与 #51 修复。#51 原快速 keyup FAIL 及 #46→#51→#11 责任关系继续保留，本次未改 Radio wrappers/Reka；没有以延迟输入绕过。optional1 已补公开契约测试，无实现改动。

F1 已完成实施及本地/定向浏览器验证，独立 R2 审核结论尚未产生。本席不宣称 merger 批准、PR 合并或 tracker 完成；#46/#5/#1 仍保持 open。

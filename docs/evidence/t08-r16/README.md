# T08/R16 五态行动摘要卡实施证据

- 票据：[nerv-ui #34](https://github.com/Mang-X/nerv-ui/issues/34)，父票 [#9](https://github.com/Mang-X/nerv-ui/issues/9)，`scope:M`，单接缝、单 PR。当前 spec 是母票 #1 的 v2；旧应用接入与旧库退出已移出本轮。阻塞票 #3 在实施前为 `CLOSED`。
- 实际工作树：`/Users/mang/Project/nerv-ui-worktrees/t08-r16-action-summary`，分支 `feat/t08-r16-action-summary`。开工 base `f01b079c1ef333141a08247758c39593f2bd32aa` / tree `7d093f7e78c162577c2581e9f68ff7be5e470597`，clean。实现提交 `1babdd1b8db8f35b2aaeb158feba1ef5d955ed58` / tree `9f44de4dcbd9f1bdf24e8f853ea6c677e1340de1`。本证据文件随下一提交进入 PR；最终候选 HEAD/tree/clean 以外部 handoff 的 `git rev-parse` 与 `git status` 读回为准。
- T01 固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`。原始素材 `migration/materials/source/frontend/apps/business-console/src/components/workbench/WorkbenchFocusCard.vue` 与 provenance 记录均为 SHA-256 `1cb7bd5a60f8ec3bdc7d0f10b8207c121643327d7b2d5b38de4b0b088b89ff6f`；旧源 checkout HEAD 同为固定来源。旧应用 `pages/index.vue` 的三张卡是只读对照，未替换。

## 来源能力与公共接缝

| 来源可观察能力 | 新库公共能力 | 验证 |
| --- | --- | --- |
| 固定卡形、主张、图标、数值与底部出口 | `NvActionSummary` 固定 19rem 高，复用 `NvCard`、`NvButton`、`Skeleton` 和语义 token | `renders a fixed card with a trusted count, preview, and current action`；浏览器卡高 304px |
| pending 骨架、error 重试、unavailable 无重试、data 预览、empty 文案 | 宿主显式传 `state` 和各态文案；错误与不可用不退化成空态 | `keeps pending, error, and unavailable distinct from an empty result`；浏览器五态切换 |
| 不可信读数 `—`，真实零保留 | 可信状态仅显示非负安全整数，`0` 保留 | `treats invalid counts as unknown while preserving a real zero`；浏览器 `0项` / `—` |
| 最多四条预览、来源更新、CTA/重试 | `items` 只接人可读文本；`retry` / `action` 上抛，宿主决定当前卡片动作 | `replaces previews from new host input and caps the visible list at four`、`routes retry and action to the card currently used without crossing the other card` |

`NvMetricCard` 的单值结构不能表达最近预览；新件没有路由、DTO、SDK、认证、业务聚合或旧私有路径依赖。来源的 `to` 改为 `action` 事件，原应用消费者保留原状。桌面 playground `/#action-summary` 和文档站 `components/desktop/action-summary` 各有两张中性卡；文档站页是实时示例源码，运行验证见下方边界。

## Fresh 执行

- RED：在导出和实现前，包内 `vp test run src/components/pc/action-summary/NvActionSummary.test.ts` 退出 1，`renders a fixed card with a trusted count, preview, and current action` 因公共导出缺失而失败。初次从 frontend 根运行同一文件也退出 1，但因缺 Vue 插件未进入测试；该次不算行为 RED。GREEN：导出和实现后同命令 1/1；最终四条公共行为测试与治理聚焦命令 15/15，退出 0。
- 包内 `vp test run src/components/pc/action-summary/NvActionSummary.test.ts src/ui-primitives.contract.test.ts src/design-docs.contract.test.ts src/nvui-doc-coverage.contract.test.ts`：4 文件、15 测试 PASS，退出 0；CLI 打印 `Could not parse CSS stylesheet`，未作为无警告结论。
- playground `vp test run src/ActionSummaryDemo.test.ts src/nvui-imports.contract.test.ts`：2 文件、68 测试 PASS，退出 0；两张卡当前事件身份由宿主测试覆盖。
- `vue-tsc --noEmit -p tsconfig.json`：`packages/ui` 和 `apps/playground` 分别退出 0。`vp build` 于 `apps/playground` 退出 0，5623 modules transformed；保留 crypto externalized、Rolldown annotation 和大 chunk 警告。
- `vp fmt --check` 对 14 个本票前端文件退出 0；`vp lint` 对本票受影响源码退出 0、无输出；`git diff --cached --check` 退出 0。手工核对文档站导航、页与 `@include` 文件存在。锁文件、workspace/manifest 的 Git blob 与 base 相同；UI 与 playground 的 Vue realpath 同指 `vue@3.5.39_typescript@6.0.3`。
- 实际 HTTP `index.html`、主 JS `index-BcGa1JMh.js`、主 CSS `index-COMbziHq.css` 与 fresh dist 逐字节 `cmp` 相同，三对 SHA-256 分别为 `4ebfe24d…`、`f22cbc02…`、`8991351c…`；仅支持这三个响应的构建身份。
- 浏览器：T3 `preview_snapshot` 同一步连续两次原样超时 `Preview automation snapshot timed out after 15000ms.`，随后按规则转 ego-browser。Ego 在实际 1280×800 和 375×820 CSS viewport 下验证浅/深主题、五态、`0` 与 `—`、长条目省略、预览更替、当前卡片 retry/action。宽屏卡分别为 488×304px；窄屏卡为 343×304px，文档 scrollWidth 375px。截图和交互读数保存在外部 handoff 同目录 `browser/`，没有将截图文件名当作 viewport 证据。

## FAIL / UNRUN / UNKNOWN

- **继承 FAIL**：`nvui-naming.contract.test.ts` 最终 246/247，退出 1。唯一 `barrels export exactly the frozen Nv canonical set` 的差异是 base 已导出的 `NvScreenFlowLinesBg` 与 `NvScreenIsometricBlocksBg` 未进入冻结数组；`git show` 可从 base 同时读到导出与缺项。本票已登记 `NvActionSummary`，不替 R02 改旧清单，也不报全门禁 PASS。
- **继承/环境 FAIL**：`apps/design-system` 的 `vue-tsc` 退出 2；该 app 尚不在活动 workspace，`vitepress`/`vue` 等模块缺失，另有原 `schedulingDemo.ts` 三处参数错误。文档站全站构建与 live page 运行均 **UNRUN**；全站构建已知 `@nerv-iip/ui/schedule-model` alias ENOTDIR 属 #10，未跨 owner 修复。本票文档仅经源码、导航和 include 静态核对。
- **UNRUN**：全仓测试、全局 fmt、CI、真实第三方 vendor、版本化 packed consumer、生产与旧应用接入。历史 4 条 vendor policy skip 是零执行，不构成真实 vendor PASS。base 的全局 fmt 三个同 blob FAIL 与 main raw diff 两项保留，未用 scoped PASS 覆写。
- CLI 测试输出只有测试数与退出码；未产生 JSON reporter 字段，因此测试 JSON 的 unhandled-error/report 状态记为 **字段缺失**，不能补写为 0。第三方授权状态 **UNKNOWN**。

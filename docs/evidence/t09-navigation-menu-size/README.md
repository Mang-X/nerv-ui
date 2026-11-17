# T09 NavigationMenu 尺寸修复候选（#207，父 #10）

只交中文 draft PR 到 `integration/nerv-ui-extraction`，不代表独立审核或 runtime 验收。
基线 `1f963b9e6622fdb744e7a7895380a9fa8e2115ae`，tree
`b1ddfb9a64d8147dec11dd0b177c0c0794fd467b`；开工 clean、PR #206 MERGED。
实际写入 checkout：`/Users/mang/Project/nerv-ui-worktrees/t07-p15-saved-plan`。

## 根因与改动

当前安装的 Reka 2.10.1（含仓库既有补丁，本次不改）的
`NavigationMenuContent` 将内容 Teleport 进共享 Viewport。
`NavigationMenuViewport` 在 nextTick / requestAnimationFrame 后选择打开内容，
通过 VueUse `useResizeObserver(content)` 读取 `offsetWidth/offsetHeight`，
写入 `--reka-navigation-menu-viewport-width/height`。
VueUse 14.3.0 在目标变化时 disconnect/reobserve，flush 为 post，卸载时清理。
源码与实际消费的 `dist/NavigationMenu/NavigationMenuViewport.js` 尺寸链一致。

原品牌 Content 绝对定位，窄屏 `w-full` 依赖由其自身测量回写的 Viewport 宽度；
内部固定 420px 网格不能为这个百分比循环提供独立宽度。
F R3 已有真实浏览器 RED：390×844 亮/暗稳定 Viewport 和 Content 宽 24px，
生产网格 420px；亮色“排产”真实 click FAIL。1440 对照可读，不是完整桌面 PASS。
`nav-final.log` 的 23.65px 是动画中帧；稳定 24px 结论来自 R3 receipt 的独立观察。

本次仅改三个实现/消费文件：

- Content：共享 Viewport 的直接内容使用 `max-content`，上限独立于父宽度，
  为屏幕两侧各留 1rem，并预留 Viewport 两条 1px 边框。
  将原响应式宽度移入 `nv-components` 层；非共享内容仍是窄屏 100%、sm 起 auto。
  样式使用品牌类和 `data-slot` 定位，避免依赖 Teleport 的 scoped 属性转发。
- Viewport：保留 Reka 测量变量、原居中定位及宽高动画，增加屏幕宽度上限。
- 文档：生产 420px 桌面双列、窄屏单列；设备/质量 320px 单列，全部 `max-w-full`。
  原链接、说明、学习围栏和桌面例保留。未隐藏整页 overflow。

未改 props/emits、受控状态、root 定位、动效规则、token/CSS 层序、冻结原语、
Reka 依赖/补丁、锁文件、API 或治理。当前直接 live 消费仅此文档页；
主桶 → pc barrel → navigation-menu barrel、同族八件和 Demo/主题注册链已核实。
`viewport=false` 尺寸分支按原值保留，真实行为仍待独立 runtime 复验。

## 作者 fresh 门禁

Node `v24.18.0`；固定入口：
`node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`（11.22.0）。
下列命令均以该入口调用，全部 exit 0；完整命令/原始输出见外部 handoff/raw。

| cwd（相对仓库）               | 命令/证据                                                                                                                       | 实际结果                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `frontend/packages/ui`        | `exec vp test run`，ui-primitives / nvui-naming / blocks / design-system / design-docs / nvui-doc-coverage / docs-layout 七文件 | 7 文件、287/287                          |
| `frontend/apps/design-system` | `exec vitest run --config vitest.config.ts`                                                                                     | 27 文件、101/101                         |
| `frontend`                    | `--filter @nerv-iip/ui typecheck`                                                                                               | PASS                                     |
| `frontend`                    | `docs:typecheck`                                                                                                                | PASS                                     |
| `frontend`                    | `docs:build`                                                                                                                    | client/server/render 完成，33.23s        |
| `frontend`                    | `exec vp lint packages/ui/src/components/pc/navigation-menu apps/design-system/docs/components/desktop/navigation-menu.md`      | PASS                                     |
| `frontend`                    | `exec vp fmt --check packages/ui/src/components/pc/navigation-menu apps/design-system`                                          | 全部 281 文件 PASS，包含整 docs 格式门禁 |
| 仓库                          | `git diff --check`、基线与当前 Markdown 路径比较、菜单文字计数、源码副本 byte readback                                          | PASS；183/183 页路径保留                 |

两份 JSON 报告 success=true、failed/pending tests=0；runtime/unhandled 独立数字字段缺失，
均为 UNKNOWN，不推导成 0。日志保留 `Could not parse CSS stylesheet`、Rollup PURE 注解和
大 chunk 告警。jsdom setup 的 ResizeObserver 是空桩，不具备 CSS 布局能力；
本次不新增 class 字符串镜像测试，也不将这些合同测试当作尺寸 RED/GREEN。
没有修改或削弱原断言。F R3 真实 RED 是继承证据，修后几何尚未签署。

## 独立席待验与父 F 边界

- browser/HTTP、390 亮暗稳定尺寸与全部链接真实鼠标/键盘可达、1440/中宽、
  持续 resize、面板切换、关闭重开：UNRUN；修后尺寸 UNKNOWN。
- CI 未执行/空 checks 不是 PASS；packed #11 / device / production 各自 UNRUN。
- playground/vendor 大桶 policy-skipped，执行 0，不是 PASS；旧应用接入退出 NOT_PLANNED。
- 不自审、不 ready/merge/close/watch，不改父票，不启动 G/H 或后继。
- 父 F 的“packages 自 855c6da 无 diff”已不再适用于本候选；应只更新 NavigationMenu
  家族及其文档尺寸链的矩阵项，其他有界历史证据不能升级为 fresh。
  历史 81/82 FAIL 及原因未知、R1/R2/R3 的 FAIL/UNKNOWN 与本次告警全部保留，
  不因本地门禁通过而抹除。

## 外部证据

`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-navigation-menu-size-implementation-r1/handoff.md`
保存完整命令、raw 日志/JSON、最小 before/after 源码副本、SHA-256 与回读结果。
R3 原始 receipt/raw 保留在同日 `t09-f-parent-acceptance-r3/`，不复制 dist 或依赖树入仓。

## R1 中宽消费边界响应

390亮暗三面板全部链接真实可点击，原24px问题已闭合；640px生产面板444px仍以只占触发器宽的导航root居中，稳定left=-22导致左裁。当前唯一live消费是该文档页。仅将live及学习代码的NvNavigationMenu root铺满预览宽度，触发器仍居中、shared viewport仍按root居中，不新增全局碰撞定位/API。原R1 P2保留，新640及resize几何待独立复验。

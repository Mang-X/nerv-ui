# T08/R08 远距主状态灯实施证据

对象：[#26](https://github.com/Mang-X/nerv-ui/issues/26)，父票 [#9](https://github.com/Mang-X/nerv-ui/issues/9)，规格 [#1 v2](https://github.com/Mang-X/nerv-ui/issues/1)。级别 scope:M，单 PR；本页记录实施候选，独立审核、合并和票面关闭由后续 owner 决定。

## 固定来源与边界

- 指定工作树：`/Users/mang/Project/nerv-ui-worktrees/t08-r08-status-hero`，分支 `feat/t08-r08-status-hero`。开工基线 `f7c49f2bf6351894b9c7f6efe3f7287abbdde031`，tree `9ef8dd57f75bc845a7958ed8a5f0f71203b8ecf1`，当时 clean。最终提交 SHA、tree 与 clean 回读见同轮 durable `handoff.md`。
- 来源固定为 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`。`migration/materials/source/frontend/apps/screen/src/components/line/LineAndonHero.vue` 的 `git hash-object` 为 `82079cc1d116fed4618f2afac471796cd7655c19`，与 `migration/t01/provenance.jsonl` 一致。直接消费者是原应用 `src/pages/line/[id].vue`，给出 `state`、`stateLabel`、`offlineDevices`；宿主仍负责这些业务事实。
- 来源外圈 200px、核心 158px；状态节奏 4 / 2.4 / 1.2 秒；原失联角标只在非零时出现。现有 `NvScreenStatusLight` 是 10px 小灯。新公共 `NvScreenStatusHero` 保留主灯体量，以 `label`、`tone`、`rhythm` 和 `auxiliary` 插槽承载展示；中性静止为默认，不提供取数、认证、设备计算或路由。
- `/#screen/status-hero` 的两类来源仅为宿主内存数据。失联数 `0` 隐藏说明、`null` 显示待确认、正数显示宿主生成数量。公共组件不会把未知改成危险状态。活动 screen 组件 producer 从 37 增至 38，依据 `screen/index.ts` 的具名组件导出计数。

## RED → GREEN 与本地门禁

| 项                   | 实际命令、结果与边界                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公共组件 RED         | 在 `frontend/packages/ui` 执行 `../../node_modules/.bin/vp test run src/components/screen/ScreenStatusHero.test.ts`：exit 1，`NvScreenStatusHero` 尚未导出，公开宿主断言失败。首次误从 `frontend` 根运行同名目标，exit 1 为 Vite Vue 插件配置不匹配；不计行为 RED。                                                                                                                               |
| 宿主 RED             | 在 `frontend/apps/playground` 执行 `../../node_modules/.bin/vp test run src/screen/ScreenStatusHeroDemo.test.ts`：exit 1，待建宿主文件不存在。                                                                                                                                                                                                                                                    |
| 公共与文档契约 GREEN | 在 `frontend/packages/ui` 执行 `../../node_modules/.bin/vp test run src/components/screen/ScreenStatusHero.test.ts src/nvui-naming.contract.test.ts src/nvui-doc-coverage.contract.test.ts src/design-docs.contract.test.ts src/docs-layout.contract.test.ts`：exit 0，5 files、258 tests passed。公开组件测试覆盖色调/节奏/标签更新、全部色调、默认中性静止、插槽点击、attrs、多实例替换与卸载。 |
| 宿主 GREEN           | 在 `frontend/apps/playground` 执行 `../../node_modules/.bin/vp test run src/screen/ScreenStatusHeroDemo.test.ts src/ScreenDemo.test.ts`：exit 0，2 files、12 tests passed。验证零/未知/非零失联、双来源更替、深链离页。测试台输出 `Could not parse CSS stylesheet`，jsdom 不证明 CSS 视觉。                                                                                                       |
| 样式与原语契约       | 在 `frontend/packages/ui` 执行 `../../node_modules/.bin/vp test run src/ui-primitives.contract.test.ts src/design-system.contract.test.ts`：exit 0，2 files、29 tests passed。新组件样式位于 `nv-components` 层，仅引用 `--nv-scr-*` 场景令牌；无新字体或全局 token。                                                                                                                             |
| 类型                 | `vue-tsc --noEmit -p tsconfig.json` 分别在 ui 与 playground，均 exit 0。                                                                                                                                                                                                                                                                                                                          |
| 构建                 | `vp build` 在 playground，最终样式改动后 exit 0、5635 modules。保留既有 `crypto` browser externalization、`@vueuse/core` PURE 注释和大 chunk 警告；未当作本票失败或发布证明。                                                                                                                                                                                                                     |
| 格式与 lint          | 改动的 frontend 文件 `vp fmt --check` exit 0，scoped `vp lint` exit 0；根 `README.md` 与 `docs/screen-standalone.md` 用 `vp fmt --stdin-filepath` 输出逐字比较均 exit 0。`git diff --check` exit 0。                                                                                                                                                                                              |
| 文档链接             | `PYTHONUTF8=1 uv run python` 对本票 9 个维护 MD 的 71 个相对 Markdown 链接和 `@include` 目标检查：exit 0、缺失 0。证据页创建前两条指向本页的链接曾缺失，补页后重验。外部 URL 和锚点目标不在此脚本证明范围。                                                                                                                                                                                       |

上述 `vp test` 控制台给出文件/测试总数和退出码，未输出结构化 reporter 的 skipped、todo、unhandled-error 字段；这些字段为**缺失**，不推断为零。

| Requirement                | Evidence                                                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标签、色调、节奏独立更替   | `exports a large status hero with independent host label, tone, and rhythm updates`；`preserves every neutral palette tone and independent rhythm without deriving one from the other`。 |
| 辅助插槽动作与 attrs       | `keeps auxiliary actions interactive and forwards public root attributes`；浏览器 Enter 后出现“已查看现场说明”。                                                                         |
| 多实例、外部更新与卸载     | `updates one instance and replaces it without changing another instance`；`opens the public status hero deep link and leaves no display after returning to the stage`。                  |
| 零、非零、未知失联与双来源 | `keeps the host source, rhythm, and offline facts independent of the public display`；浏览器分别见无辅助、3 处失联、数量待确认。                                                         |
| 低动效、主灯几何与窄屏全文 | 浏览器最终 CSS 200×200 / 158×158、`reduce` 后动画 `none`；800×650 内部滚动到第二实例标签。jsdom 不替代此项。                                                                             |

## 浏览器与文档 live 页

- T3 preview 首次、重试均原样返回 `Too many server browser tabs are open. Close one with t3_preview_close, or reuse a tabId from preview_status tabs.`；`preview_status` 未给可复用 tab。按约定改走 ego-browser。首次浏览器检查发现低动效规则选择器权重不足：`reduce` 下 `animationName` 仍为呼吸动画、opacity 约 0.57；修正后重新构建并验证 `reduce` 为 `animationName=none`、opacity=1，恢复 normal 后为 1.2s。此失败保留，不用后续通过抹去。
- 最终产物在本地 HTTP `127.0.0.1:5176` 的独立 playground 运行。1440×900 下源 CSS 几何 200×200 / 158×158；normal 的 4s 透明度由约 0.99 变为约 0.82，慢 2.4s、快 1.2s，静止为 `none`。宿主外层缩放时屏幕像素相应缩放。浅色宿主设置下大屏层背景仍为 `rgb(3, 5, 11)`；800×650 下长标签、辅助说明和按钮未互压，内部可滚至第二实例全文。按钮 Enter 触发可见反馈；来源更换、离页与重入分别验证，重入回初始来源。
- 最终构建后通过 HTTP GET 将 `/`、入口 JS、runtime JS、入口 CSS 的响应体逐字节与本地 fresh `dist` 比较，4/4 相等、HTTP 200；入口 CSS SHA-256 为 `a4be0a52944acc94a50aa4f02f1e59d2711fefc2e4e5ca3acad33ae876cb0d15`。此比较不涵盖所有按需资源和正式打包消费者。
- 截图目视记录保存在 durable `screenshots/{wide-final,light-final,narrow-bottom-final,docs-live}.png`；仅证明本机浏览器所见。最终新包安装、真实设备和旧应用消费者不由这些截图证明。
- 目标文档站 `vitepress dev docs --host 127.0.0.1 --port 5181` 实测打开 `/components/screen/status-hero`，live 控件更改颜色、节奏、文字和辅助说明后显示 `amber`、`slow`、`通行情况待关注`、`2 处数据失联`，核心 158px。文档站不在活动 workspace；一次性工具的两次 pnpm 安装均 exit 1 `ERR_PNPM_IGNORED_BUILDS`，用临时依赖链接仍成功运行目标 dev 页。临时链接与服务已清理。未运行 full docs build；此前 `schedule-model` alias `ENOTDIR` 属历史 #10 车道，不改写为本票结果。

## 尚未证明

本轮未运行 CI、正式版本包消费者、Nerv-IIP 原应用接入、生产、真实设备或真实 vendor。全局 3 个 base fmt FAIL、main raw 2 个 FAIL 仅为交接历史事实，本轮未重跑也未覆盖；4 条 vendor policy 车道执行数为 0。#12–#16 旧应用接入和旧库退出依规格 v2 为 NOT_PLANNED，不是本票遗漏。本文不宣称父 #9、规格 #1 完成。

## PR117 R1 窄返修（2026-10-27）

- 独立 R1 回执指出 `ScreenStatusHeroDemo.vue` 的“现场来源与状态”普通 `div` 被命名但在 AX 树中仍是 `generic`。同一路由还包含宿主“舞台设置”普通 `div` 和有名、可聚焦的 `NvScreenScaler` 根容器。宿主分别给两组操作加 `role="group"`，给舞台加 `role="region"`；本页“现场状态展示”原生 `section` 在 Chromium AX 中已是 `region`。公共件及其 API 不变。
- “长标题”按钮改为可见的“显示完整状态”／“收起完整状态”，仍由原 `longLabel` 状态和 click handler 切换。未改组件标签、动画或失联计算。
- RED：在 `frontend/apps/playground` 执行 `../../node_modules/.bin/vp test run src/screen/ScreenStatusHeroDemo.test.ts src/ScreenDemo.test.ts`，旧模板下 2 files、13 tests 中 2 failed、11 passed，exit 1；失败分别是找不到有名 group 和按钮仍显示“长标题”。GREEN：同命令 2 files、13 tests passed，exit 0。宿主测试核三处角色及子控件，文案测试核展开、收起后的可见标签。控制台仍有 `Could not parse CSS stylesheet`；结构化 skipped、todo、unhandled-error 字段未提供，记为缺失。
- Fresh 受影响门禁：playground `vue-tsc --noEmit -p tsconfig.json`、4 个改动前端文件的 `vp fmt --check` 与 `vp lint` 均 exit 0；一次中途 typecheck 因测试对 `get().exists()` 的错误用法 exit 2，已修后重跑 exit 0。最终 playground `vp build` exit 0、5635 modules，保留既有 `crypto` externalized、VueUse PURE 注释和大 chunk 警告。未重跑不受影响的 UI 全套和文档站。
- Fresh 浏览器：T3 preview 两次原错均为 `Too many server browser tabs are open. Close one with t3_preview_close, or reuse a tabId from preview_status tabs.`，转 ego-browser。Chromium CDP AX 全树有 `group`“舞台设置”、`region`“现场主状态灯舞台”、`group`“现场来源与状态”、`region`“现场状态展示”；全树 named `generic` 为 0。按钮 click 后为“收起完整状态”与完整标签，聚焦按 Enter 后恢复“显示完整状态”与短标签；三处失联时原辅助按钮 Enter 后反馈“已查看现场说明”。TaskSpace 已关闭。
- Fresh dist HTTP：本机 `/`、入口 JS、runtime JS、入口 CSS 四个实际响应均 HTTP 200、正文与最终 dist 逐字节相等。入口 CSS SHA-256 `5b088a8b8834330a9e77d89e5714d25ac859efee32795a9b56b8d573ddded3d9`。本地 HTTP 服务已停，不以此证明正式包消费者。
- 继承依据：R1 输入 HEAD `006a8e6c703b281bbc670acb3650072d6e6b9580`；本次相对它仅改两个 playground 宿主文件及其测试。公共 `StatusHero.vue` blob `13640f99c7244018e1da8e7900007937cb439be0`、组件测试 blob `5572af300175c9eb2ec3603346edc7b050cbcdeb`、文档 live 页 blob `d686a5017edb3dc422542f43d3f3d674eb11dd73`、screen 导出 blob `f4486c96f81fe767596fa4e707b8a6708bd44103` 均未改；其 R1 组件、CSS、文档 live 证据只按原 producer 身份有界继承，不算本轮 fresh。早期 reduced 动画 FAIL、全局 fmt/main raw FAIL 仍为历史事实；完整 docs build、CI、packed/旧消费者、真设备、真 vendor、生产仍 UNRUN。
- 本次 fetch 后 integration 仍为 `f7c49f2bf6351894b9c7f6efe3f7287abbdde031` / tree `9ef8dd57f75bc845a7958ed8a5f0f71203b8ecf1`，merge-base 相同、delta 空；未 reset。最终候选 HEAD、tree、clean 与 PR 回读见同轮 durable handoff。

# T08/R04 #22：种子氛围层与大屏内容壳

> 本页记录 PR116 首轮候选；R1 独立审查指出跨独立 Vue 根 SVG ID 冲突和透明点阵。当前返修及 fresh 证据见 [f1](f1/README.md)。下方首轮 `useId()` 隔离与“点阵保留”描述只反映当时实现和结论，不作为返修后的验证结果。

## 固定对象与范围

- 实施 worktree：`/Users/mang/Project/nerv-ui-worktrees/t08-r04-screen-composition`，分支 `feat/t08-r04-screen-composition`；起点 `9bd4621cea462a9799d51a0d1db089d123a257be`，tree `6092d0ce4073dd4899a8edb485f36b0e11530e7b`。2026-10-27 fetch `origin/integration/nerv-ui-extraction` 后仍为同一提交，delta `0/0`。
- [#22](https://github.com/Mang-X/nerv-ui/issues/22) 为 scope M，依赖 #6 已关闭；[#9](https://github.com/Mang-X/nerv-ui/issues/9) 为 scope L 母项；[spec #1 v2](https://github.com/Mang-X/nerv-ui/issues/1) 不包含旧应用接入与旧库退出。#12–#16 为 NOT_PLANNED，未接入旧消费者。
- 只读固定来源 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603` 的 `frontend/apps/screen/src/layouts/ScreenLayout.vue` SHA-256 为 `cced562466a5332ac1eeededc6d33906e668f44621dffd042735af14ff622f93`；T01 素材同 SHA，provenance 行 1627 的 blob 为 `7474f858771dc91957d544bc5a658cbc994894f4`、8534 bytes、`needs-decoupling`。来源素材未编辑。
- 固定来源的直接消费者为 screen 的 `factory.vue`、`equipment.vue`、`quality.vue`、`warehouse.vue`、`andon.vue`、`line/index.vue`、`line/[id].vue`、`workshop/[id].vue`；本票未写任何旧应用。现有 `NvScreenScaler`、`NvScreenHeader` 保持 producer，R02 两背景没有重复实现。

## 来源到公开合同

| 来源行为                                                                  | 本票公开行为                                                                                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `route.path` 种子，hashStr + mulberry32、Catmull-Rom 双曲线、7×4 抖动星点 | 必填 `seed: string`；同 seed 几何稳定，不同 seed 的路径与星点可观察变化                                                                           |
| 固定 `sl-path-*` 渐变、路由哈希轨道 ID                                    | `useId()` 实例前缀覆盖两条轨道及两条渐变；引用只指向本实例，seed 更新不换 ID                                                                      |
| `NvScreenHeader` 与默认业务标题/区域/屏幕，`useNow` 秒级时钟              | 复用原页头；`title/time/date/line/screen` 默认空串并由宿主输入，`header` 可替换；没有计时器                                                       |
| 内嵌 `NvScreenScaler` 1920×1080                                           | `NvScreenLayout` 只持有 1920×1080 内容壳；宿主外层复用已有 scaler，fit/width/stretch 和 resize 归 scaler                                          |
| 点阵、光路、彗星、星点、默认 body slot、reduced-motion                    | 视觉几何、动效时长与色值保留；类名迁入 `nv-scr-*`、样式层迁入 `nv-components`；装饰 SVG `pointer-events:none`；body `main` 原生滚动保障长内容可达 |

新 Nv 名已登记在严格命名集合与独立新增映射，未放宽冻结断言；coverage、设计决策、API/live 文档、侧栏、playground 深链、README 与接入说明同步。未加 token、包入口、DTO、router、SDK 或业务算法；lockfile 和 manifest 的 base→候选 diff 为空。用户提供的 16 个 package/lock 输入与 973 对象基线不因本票升级，完整语义图未复跑；按本票相关身份核验，包与 playground 的 Vue 均指向同一 `vue@3.5.39_typescript@6.0.3` 实体。

## RED → GREEN 与本地门禁

- 首次误在 `frontend/` 执行单测，缺包内 Vue 插件，exit 1 / 0 tests；此为运行目录错误，**不计 RED**。改在 `frontend/packages/ui` 执行 `../../node_modules/.bin/vp test run src/components/screen/ScreenLayout.test.ts`：导出前 3/3 失败（公开组件 undefined），exit 1；实现后 3/3 通过，exit 0。加上空 seed、属性透传和 header slot 后，最终 4/4 通过，exit 0。
- 最终聚焦包内 `vp test run src/components/screen/ScreenLayout.test.ts src/nvui-naming.contract.test.ts src/nvui-doc-coverage.contract.test.ts src/docs-layout.contract.test.ts src/design-docs.contract.test.ts`：5 files、258 tests，exit 0。playground `vp test run src/ScreenDemo.test.ts src/App.test.ts`：2 files、19 tests，exit 0。Vitest 均打印 `Could not parse CSS stylesheet`；jsdom 不作为 CSS/命中测试证据。
- `vue-tsc --noEmit -p tsconfig.json` 分别在 ui 与 playground：exit 0。playground `vp build`：exit 0，5629 modules，保留既有 `@vueuse/core` pure annotation 与大 chunk 警告。变更文件 scoped `vp lint`：exit 0；`vp fmt --check` 初次指出新增测试文件格式，修正后 exit 0；`git diff --check` exit 0。
- 本地安装版 `pnpm` 为 12.15.0；按仓库要求用 `npx pnpm@11.22.0`。一次过滤安装命令因 `apps/design-system` 尚未列入 workspace 而报告 `No projects matched`，未修改 lockfile/manifest。独立临时文档工具安装返回 `ERR_PNPM_IGNORED_BUILDS`（esbuild@0.21.5）；后续目标 docs dev 和 live 页面已运行。保留这两次非通过记录。

## 真实浏览器与 HTTP

- T3 preview `snapshot` 同一步连续两次 `Preview automation snapshot timed out after 15000ms.`；按环境规则切换 ego-browser。后续浏览器在 fresh playground dist 与目标 VitePress dev 页面中操作，截图已目视。
- 1440×900、fit 倍率 `0.75`：两实例同 seed 几何相同，轨道/渐变 ID 集合不同且引用局部；点击改 seed 只改变主画面的曲线/星点，另一实例不变。按钮 hit test 命中真实按钮，装饰 SVG computed `pointer-events:none`；点击展开/更换光影/宿主更新时刻，以及聚焦后 Enter 的心愿按钮均有可见结果。
- 390×844 时页面 `scrollWidth=390`、fit `0.203125`；展开长内容后 `main` 为 `scrollHeight=1070/clientHeight=946`，滚到底 `scrollTop=123.5`，末段和心愿按钮仍可操作。1024×768 resize 后 fit `0.533333`；width `0.533333`，stretch `0.533333,0.600926`。离页布局 DOM 为 0，重入为 2；新 ID 为 `v-2`/`v-3` 前缀，时间回到宿主初值。390 宽的固定大屏会缩得很小，不能当移动端字号验收。
- 正常动效：彗星显示、星点 `nv-scr-layout-spark-*`；reduced：彗星 `display:none`、星点 `animation:none`。切换外层主题后 screen 背景仍为 `rgb(3, 5, 11)`。VitePress 目标页 `/components/screen/screen-layout` 在临时链接下打开，导航可见，live 按钮点击后为“已加入心愿”；最终截图的标题/正文/按钮框无重叠。
- HTTP body 与 fresh dist 用 `curl` + `cmp` 逐字节比较 `index.html`、`index-DeHY4snO.js`、`index-DJQ1sjJC.css`，均 exit 0；SHA-256 分别为 `2ae279ed6e15341850b31f0682733ac1e46dc3f11f0f4186430dceb98a79478f`、`2502995dacf4d94ee34f3dbc09914f8deabd32124f0c5fe4abb9a65a5b321e9d`、`077933eaa09d297524ba57518b9dbb878648f6453aa7b3b6bc95d93b083108fe`。

截图只保存在交接目录 `nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r04-implementation-r1/`，未把 dist、node_modules、cache 或 checkout 副本提交。`browser-wide.png`、`browser-narrow-scrolled.png`、`browser-resize-remount.png`、`docs-live-final.png` 的 SHA-256 见同目录 handoff。

## 证据边界

本地 focused、type、build、真实浏览器、目标 docs dev 各自独立；没有 CI、完整文档站 build、packed/legacy consumer、原仓消费者接入、设备、生产或真实 vendor 运行。全局 fmt 的 3 个 base 文件 FAIL、main raw 的 2 个既有 FAIL，以及 full docs `schedule-model` alias `ENOTDIR` 是用户交付的继承事实，本票未复跑也未抹掉；4 条 vendor policy 车道均为 0 次执行。上述缺口不记作 PASS。

# #300 排程组件 + app-shell 撤除记录

范围裁决：排程相关组件与 `@nerv-iip/app-shell` 不纳入 nerv-ui 库（范围收敛为
desktop + screen + pad/mobile 四形态）。本文件登记删除清单、牵连修改与门禁结果。

## 整包 / 整目录删除

| 路径 | 说明 |
| ---- | ---- |
| `frontend/packages/scheduling` | `@nerv-iip/scheduling` 整包（GanttChart / ResourceSchedulerBoard / SchedulingCanvas / 引擎适配 / 模型 / vendor 样式） |
| `frontend/packages/app-shell` | `@nerv-iip/app-shell` 整包（AppShell/AppShellT/NavMain/NavSide/NavTopDomains/NavUser）。该包从未列入 pnpm-workspace，活动 workspace 内零消费方 |
| `frontend/contract-consumers/scheduling-host`、`frontend/contract-consumers/scheduling-model` | 独立 contract consumer 目录整体删除；`contract-consumers/` 因清空而消失 |
| `frontend/reference-tests/nerv-iip/t07-p02`、`t07-p03`、`t07-p04` | 排程相关旧库参考测试全部删除；`reference-tests` 仅剩 `nerv-iip-consumers.test.ts` |
| `frontend/packages/ui/src/components/pc/schedule-timeline/` | `NvScheduleTimeline` 组件 + index + types |
| `frontend/packages/ui/src/components/screen/TaktGantt.vue` | `NvTaktGantt` 大屏节拍甘特（#300 裁决：排程形态不纳入） |
| `frontend/packages/ui/src/lib/schedule-time.ts` | `@nerv-iip/ui/schedule-model` 子入口实现；唯一消费者为 scheduling 包 |

## 文档删除

- `frontend/apps/design-system/docs/components/desktop/`：`gantt-chart.md`、`resource-scheduler.md`、`schedule-timeline.md`、`scheduling-async-candidates.md`、`scheduling-day-print.md`、`scheduling-facts.md`、`scheduling-live.md`、`scheduling-requests.md`、`scheduling-saved-plan.md`、`scheduling-workbench.md`（10 页）。
- `frontend/apps/design-system/docs/components/screen/takt-gantt.md`。
- `frontend/DESIGN/components/`：`gantt-chart.md`、`resource-scheduler-board.md`、`schedule-timeline.md`、`scheduling-saved-plan.md`、`scheduling-workbench.md`。
- `frontend/DESIGN/patterns/blocks/app-shell.md`（整页描述已删包，索引同步摘除）。
- 顶层 `docs/scheduling-*.md` 12 份（workbench/comparison/day-print/draft/host/model/panels/renderer/request-forms/saved-plan/snapshot/async-candidates）。
- `docs/evidence/` 下历史记录不改写（冻结证据，其中对 `@nerv-iip/scheduling` 的引用属历史事实）。

## 演示 / 示例删除

- `apps/design-system/docs/.vitepress/`：`schedulingDemo.ts`、`schedulingDemoAdapter.ts`；`examples/` 下 `AsyncCandidatesExample.vue`、`DayPrintExample.vue`、`RequestFormsExample.vue`、`SavedPlanExample.vue`、`ScheduleComparisonExample.vue`、`SchedulingDraftExample.vue`、`SchedulingPanelsExample.vue`、`SnapshotFactsExample.vue`、`WorkbenchExample.vue`、`comparisonFacts.ts`、`panelModel.ts`、`snapshotFacts.ts`。
- `apps/playground/src/`：`WorkbenchDemo`、`SavedPlanDemo`、`ScheduleDemo`、`SchedulePanelsDemo`、`ScheduleComparisonDemo`、`SnapshotRiskDemo`、`DraftEditingDemo`、`OrderEditingDemo`、`ResourceEditingDemo`、`ResourceScheduleDemo`、`RealGanttDemo`、`DayPrintDemo`、`RequestFormsDemo`、`AsyncCandidateDemo` 及对应 `.test.ts` 与 `schedule-comparison-fixtures.ts`、`schedule-panels-fixtures.ts`、`snapshot-risk-fixtures.ts`、`ScheduleTimeline.test.ts`。
- `apps/playground/src/screen/`：`ScreenSummaryDemo.vue`、`ScreenSummaryDemo.test.ts`、`summary-fixtures.ts`（该页以 `NvTaktGantt` 为主体）。

## host 测试删除（apps/design-system）

`scheduling-host.test.ts`、`scheduling-live.contract.test.ts`、`snapshot-comparison-host.test.ts`、`request-forms-host.test.ts`、`async-candidates-host.test.ts`、`workbench-saved-day-host.test.ts`；vitest.config.ts 同步摘出 include 项与 `resource-scheduler.md` 的 markdown transform 插件。

## 牵连修改（非删除文件内的最小摘除）

- `frontend/packages/ui/package.json`：删 `./schedule-model` exports 条目。
- `frontend/packages/ui/src/index.ts`：删 `export * from './components/pc/schedule-timeline'`。
- `frontend/packages/ui/src/components/screen/index.ts`：删 `NvTaktGantt` 导出；`product.md` 46→45 件。
- `frontend/packages/ui/src/nvui-naming.contract.test.ts`：名单删 `NvScheduleTimeline`、`NvTaktGantt`。
- `frontend/packages/ui/src/components/screen/ScreenSummary.test.ts`：删三个 takt 用例与 `NvTaktGantt` import。
- `frontend/packages/ui/src/components/screen/ScreenSummaryDocs.test.ts`：删 takt 文档用例。
- `apps/design-system/docs/.vitepress/config.mts`：删 `schedulingVendorStyles` 插件与 import、侧栏「排产 Scheduling」组、`TaktGantt 节拍甘特` 项。
- `apps/design-system/docs/.vitepress/theme/index.ts`：删 `@nerv-iip/scheduling/vendor.css` import。
- `apps/design-system/docs/.vitepress/theme/screen/ScreenGallery.vue`：删 `NvTaktGantt` 展位与 import。
- `apps/design-system/package.json`、`apps/playground/package.json`：删 `@nerv-iip/scheduling` 依赖。
- `apps/design-system/vitest.config.ts`：删排程 host 测试 include 与 markdown transform。
- `apps/design-system/docs.contract.test.ts`：重写——保留 resolve/forbid-SDK/repositoryLink/css-layer 断言，删排程模型与 sidebar 断言；`@nerv-iip/ui-mobile` 的 CJS-resolve 断言改为按 dist 入口断言（exports map 仅有 `import` 条件，`require.resolve` 本就看不清，原断言在 T10 产物化后已无法通过）。
- `apps/playground/vite.config.ts`：删 `schedulingVendorStyles` 插件与 import。
- `apps/playground/src/App.vue`：删全部 `/#schedule*` 路由、导航与 demo import。
- `apps/playground/src/ScreenDemo.vue`、`ScreenDemo.test.ts`、`App.test.ts`、`FilesDemo.vue`：删 `#screen/summary` 路由与导航（该页依赖已删 demo）。
- `frontend/pnpm-workspace.yaml`：删 `packages/scheduling` 行与相关注释；`frontend/vite.config.ts`：删 `packages/scheduling/vendor/dhtmlx/**` fmt/lint ignore。
- `frontend/DESIGN/index.md`：删排程可视化行与 `@nerv-iip/scheduling` 注记、app-shell 行；`patterns/index.md` 删 app-shell 行；`patterns/pages/list-workbench.md` checklist 摘 `@nerv-iip/app-shell` 与失效链接；`component-coverage.md` 删 `NvScheduleTimeline`/`NvTaktGantt` 行并将 P15/P16 表改为撤出注记；`nvui-naming-map.md` 删 #84 当前性段落（历史映射表保留）；`governance.md` 删 `./schedule-model` 子入口行。
- `docs/desktop-standalone.md`：恢复责任表更新为当前事实。
- `README.md`：删 T07/P01–P16 段落与 workspace 列表中的 scheduling/app-shell 条目；T09/A 段中排程样例描述摘除。
- `pnpm-lock.yaml`：经 `pnpm install` 重生成。

## 保守保留项

- `docs/evidence/**` 全部冻结证据不改写（含对 `@nerv-iip/scheduling` 的历史引用）。
- `migration/**`（materials/reference 源码快照）不动：属历史迁移素材，非活动 workspace。
- `frontend/DESIGN/components/neutral-shells.md`、`roadmaps/*`、patterns 中对旧应用 `scheduling.vue` 页面、`@nerv-iip/app-shell` 来源 SHA 的历史描述保留（属来源记录非当前契约）。
- `DESIGN/nvui-naming-map.md` 附录 A 中 `TaktGantt → NvTaktGantt` 历史映射行保留（旧名→新名映射属历史事实；#84「当前新增」注记已删）。

## 门禁结果（本 worktree 实测）

| 命令 | 结果 |
| ---- | ---- |
| `pnpm install` | 通过，lockfile 重生成 |
| `pnpm typecheck`（workspace 根，4 包） | 全绿 |
| `pnpm --filter @nerv-iip/playground build` | 通过（含 chunk 体积 warning，非阻断） |
| `pnpm --filter @nerv-iip/design-system build` | 通过（173 页生成） |
| `pnpm --filter @nerv-iip/ui test` | 70 files / 910 tests 全绿 |
| `pnpm --filter @nerv-iip/ui-mobile test` | 31 files / 204 tests 全绿 |
| `apps/design-system` vitest（25 files / 55 tests） | 全绿 |
| `pnpm --filter @nerv-iip/playground test` | 11 files / 79 tests 失败——失败均为 `localStorage is not available`（Node ≥22 的 jsdom 环境变化），在本分支 base（1b28ce5）上同测 124 失败 443 过；属 pre-existing 环境问题，与本票删除无因果（删除面不涉 useTheme/localStorage）。 |
| `grep -rln '@nerv-iip/scheduling\|@nerv-iip/app-shell'` | 活动代码零命中；剩余命中仅在 `docs/evidence/**`（冻结历史）与 `migration/**`（素材快照）。 |

未运行：浏览器走查（本票纯删除面，无新增交互）。

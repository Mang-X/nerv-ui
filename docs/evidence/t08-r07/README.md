# T08/R07 入口与摘要卡实施证据

对应 [#25](https://github.com/Mang-X/nerv-ui/issues/25)，scope:M，仅一个公开摘要展示接缝。基线 integration `8611de4c215f96644f8e9d317791ec50a0bff4df` / tree `4d5d9cc91473b1152851d3e9b5446e73c275411f`。最终 head/tree、clean 与归档回读见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r07-implementation-r1/handoff.md`。保持 draft 等待父席安排审核，不合并、不关闭 tracker。

## 固定来源与复用映射

来源固定旧提交 `79b1578f2b75f55709765b5e7882aaf33146c603`。本轮完整读取三件素材与必要直接消费者片段；素材 SHA256 与 `migration/t01/provenance.jsonl` 一致，旧素材不改。

| 来源                                                                                                                         | SHA256                                                             | 可观察能力与新接缝                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [LauncherCard](../../../migration/materials/source/frontend/apps/screen/src/components/launcher/LauncherCard.vue)            | `b2757db9de3ca59b3323264adefc85bfde23246548fd06b7ffb9ce6f0fcf9e93` | icon/title/desc、三纵排指标、显式状态、chipsLabel/chips、进入指引 → launcher 变体；图标槽、typed metrics、status/chips、真实 action 按钮                               |
| [WorkshopHealthCard](../../../migration/materials/source/frontend/apps/screen/src/components/factory/WorkshopHealthCard.vue) | `79b87899c43b2b3026a385474e9481323388038912dde068ed2c6a163f69e39e` | 名称/主管、主比例、actual/plan 比较、进度、四次指标、红色警示 → health 变体；description、primary/comparison/progress/metrics、显式 notice                             |
| [WorkshopLineCard](../../../migration/materials/source/frontend/apps/screen/src/components/workshop/WorkshopLineCard.vue)    | `ac8d329bb715f3a667a7963c591eb07995080692cd3307e93e049cef1f89d53b` | 状态/失联说明/引用号、产出与计划/达成/偏差、小时趋势、点排、警示与入口 → line 变体；status/notice/reference、primary/comparison/metrics、literal trend、dots 与 action |

必要直接消费者：`pages/index.vue` 164–170 为外层 RouterLink，0/1/多实例布局由页持有；`pages/factory.vue` 148–155 为权限决定 RouterLink/div；`pages/workshop/[id].vue` 266–267 用 line.id 作 key。新库只回传 stable identity，权限、列表与路由归宿主，未保留 WorkshopCell/LineSummaryCard 或阈值判断。来源三卡无 slots/events（入口由 RouterLink 提供）、无 disabled 策略；默认业务提示由宿主显式输入，未复制为库默认事实。旧 launcher 未到 glance 的骨架由宿主数据状态决定，本接缝未知 metric 用 —，不伪造数据或加载状态。

先对照现有 StatusCard/KpiBar/OeeHero/CapsuleBar/Sparkline/StatusTag/Panel：StatusCard 固定 state/plan/actual/downtime，KpiBar 是条带，OeeHero 是单主数，CapsuleBar 是独立进度条组；不能单独保留来源层次。只新增 `NvScreenSummaryCard` 一个组件的三个展示变体，复用 Panel/StatusLight/StatusTag/Sparkline，不建 schema 或卡片框架。Sparkline 不启用 area，无新增 SVG 资源引用；未改既有 Sparkline 的 ID 合同，跨根面积模式不是本轮新能力。

公开 API/live/设计决策见[组件文档](../../../frontend/apps/design-system/docs/components/screen/summary-card.md)。`/#screen/summary-cards` 复用 ScreenDemo/Scaler，阅读空间/共享花园两来源，0/1/6、三变体、替换与完整说明；旧导航和 aria-current 保留。screen 组件实际导出由 40 增为 41。

## 验收矩阵

| Requirement                                                            | Evidence                                                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Launcher 主次信息、零/未知/负小数、显式状态/chips、icon 与 action 身份 | `launcher keeps zero unknown literal metrics explicit status chips and host action identity`          |
| Health 主数/比较/次指标、原文保真与只图形 clamp、未知进度              | `health retains primary comparison secondary values and clamps only the progress drawing`             |
| Line literal 趋势替换/空/常量、点排、引用号和警示                      | `line retains literal trend status dot row warning and technical reference on replacement`            |
| 同 key 重排、同名 label、空指标、长标题/状态/动作全文                  | `preserves keyed metric nodes on same-key reorder and handles empty metrics and long text`            |
| 两来源、0/1/6、三变体、替换、动作、导航/current 与卸载                 | `hosts 0 1 and 6 cards across both sources with replacement variants actions and existing navigation` |

有效首个公开 RED：缺公开导出，4/4 失败、exit 1（[JSON](raw/red.json)）。首轮实现 3 pass/1 fail，长按钮断言误把装饰箭头计入纯文案，保留 [JSON](raw/green.json)；调整为全文包含后 4/4 GREEN、exit 0（[JSON](raw/green2.json)）。首轮 JSON 输出相对目录多一级，已移回本 evidence；未修改外部源码。宿主首次执行 1/1 PASS，不冒称宿主有 RED。

最终 fresh UI/治理 278/278、host/导航/import 87/87，exit 0。JSON 的 `numRuntimeErrorTestSuites` / `unhandledErrors` 字段缺失，标 MISSING，未填 0；日志保留 jsdom CSS parse 与 build 第三方 PURE annotation 提示，无 unhandled/rejection 段。两包 types（含公共类型消费者）、playground build、scoped fmt/lint、手写 Markdown fmt/相对链接见原始日志与 durable handoff。

## 执行边界

本轮 DOM 与源码样式结构核查不等于真实窄宽/视距/视觉 PASS。browser/visual/HTTP、preview/server、docs live runtime、完整文档站、CI、版本化产物安装均 UNRUN；四 vendor policy lanes 零执行。只有真实视觉才能确认的密度、全文换行与远距阅读保留风险。继承基线全局 fmt 3 项/main raw 2 项 FAIL 与 full docs base alias schedule-model ENOTDIR 由 #10 处理，本轮不重跑不扩修。四应用接入/旧库退出 #12–#16 为 NOT_PLANNED；不推断父票完成。

未读边界：只核读上述三来源、必要直接消费者及所复用 producer，未逐页复核旧应用业务、WorkshopCell/LineSummaryCard 领域 producer、其它卡墙、排程或全部迁移材料。新 producer 与直接变动邻近检查了 nv-scr-\* 类、nv-components/token、等宽技术引用、数字对齐/单位空格、低动效、装饰 pointer 穿透、真实按钮和稳定 key。无依赖/manifest/lock/shadcn frozen 变更。

最终 scoped：frontend 14 文件 fmt、8 源码 lint 与根/人工 3 文档 fmt 均 exit 0；9 份手写 Markdown 96 条相对链接/include exit 0。首次 fmt 失败分别为含 `..` 路径与从无 package 根调用 vp；改用 frontend 相对路径与已安装 oxfmt binary 后通过，保留原失败日志。fetch/merge 最新 integration 为原 base，Already up to date，无重置。旧 source HEAD fresh 核验仍为固定提交且 clean。

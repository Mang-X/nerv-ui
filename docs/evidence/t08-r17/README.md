# #35 / T08 R17 实施候选

范围 M，高难度；一个局部分页恢复组合和两个中性宿主，独立 draft PR。目标 `integration/nerv-ui-extraction`。不安排审核、不 ready/merge/close/watch；#37 不解锁。新增的源码、测试与六件套文档属于同一接缝，不扩大分页框架。

## 对象与来源

实际 checkout `/Users/mang/Project/nerv-ui-worktrees/t08-r04-screen-composition`，branch `feat/t08-r17-mobile-list`。起点 base `2f2f2fd15fa10888d5663b30be7b33e62fd85daa` / tree `d7270f50a7b2711a631267f76027c58f5f434849`，初始 clean。结束 fetch 的 integration 无 delta。最终 head/tree/clean 在外部 handoff（避免提交自引用）。

T01 固定 source/reference 为 `79b1578f2b75f55709765b5e7882aaf33146c603`；当前实际 producer 在 migration/materials/source/frontend/apps/business-pda/src，通过 rg 定位，不把历史 AGENTS 的消费者表当活动 producer。[有界来源清单](source-inventory.json)记录 13 个读取文件及 SHA-256，均与 base 字节一致；migration 素材零写。

| 来源输入/事件/slot                           | 当前处理                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| stateKey，sessionStorage namespace           | sourceKey + 可省略的同步 host storage；无内置 namespace                       |
| filterState / restore(filters,scrollTop)     | 权威 filterKey + restoreFilter 请求；宿主拒绝则不采用推测筛选                 |
| loaded/total/hasMore                         | loaded 仅展示；hasMore 为 true/false/null；成功 pageKey 由宿主输入            |
| pending/refreshing/loadingMore               | 显式 pending initial/refresh/append/null；state unknown/ready                 |
| error/loadMoreError/RetryableListError       | errorMessage/appendErrorMessage 安全文案；诊断仅 host callback / storageError |
| refresh/loadMore/retry/retryLoadMore         | 保留对应动作事件，宿主提供取消和回执边界；没有 handler 不冒充成功             |
| filters/default slots                        | 保留固定筛选 + keyed 内容组合；不复制整页、领域卡片或业务 CSS                 |
| PullRefresh scroll/scrollRestored            | 复用其滚动容器，nextTick 后读取实际高度/位置；不凭请求值宣称恢复成功          |
| 源默认 threshold=56，offset=80，finishedText | 原语原样沿用，零修改；未知后续主动暂停自动加载                                |

直接消费者：WmsPagedListFrame、WarehouseTaskExecutionView、QualityTaskListStep、equipment/repair、equipment/alarms、equipment/work-orders/index、mes/operation（其余源码条目见清单）。来源的领域筛选、权限、扫描预检、详情和状态映射全部留在原素材；本票旧应用接入退出 NOT_PLANNED。useTaskListPagination、useScopeBoundListResponse 仅作为来源参考，未复制为公共分页框架；新增 useMemoryList 只属于演示宿主。库不拥有选中详情或创建草稿，故不清理宿主草稿；本票未引入 create、图库/相机、#41 或后端。

## RequirementEvidence

provider：Codex / gpt-6.1-sol high；runtime：Vue Test Utils + jsdom，vp test/Vitest 4.1.10。高度由真实 HTMLElement 的受控 scrollHeight/clientHeight 与 clamp setter 模拟，独立预期 400−200=200、800−200=600、1400−200=1200，目标 900；不是设备滚动证据。shell 不使用 fake timers；演示 host 使用 fake clock，afterEach 清理 timers 并恢复 real timers。

| Requirement                                                                                             | 精确测试名 / 证据                                                                                                                         | 状态                                       |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| distinguishes unknown, initial failure and successful empty                                             | `NvMobileTaskListShell public DOM (jsdom) distinguishes unknown, initial failure and successful empty`                                    | GREEN-only                                 |
| retains rows with separate refresh and append errors and disables paused retry                          | `NvMobileTaskListShell public DOM (jsdom) retains rows with separate refresh and append errors and disables paused retry`                 | GREEN-only                                 |
| restores through rendered heights, failed append retry and manual scroll wins                           | `NvMobileTaskListShell public DOM (jsdom) restores through rendered heights, failed append retry and manual scroll wins`                  | GREEN-only                                 |
| waits for ready and stops at finished maximum without duplicate pages or optional handler loop          | `NvMobileTaskListShell public DOM (jsdom) waits for ready and stops at finished maximum without duplicate pages or optional handler loop` | GREEN-only                                 |
| refused controlled filter restore never scrolls or loads under speculative filter                       | `NvMobileTaskListShell public DOM (jsdom) refused controlled filter restore never scrolls or loads under speculative filter`              | GREEN-only                                 |
| cancels queued restore on source storage filter and unmount without writing A into B                    | `NvMobileTaskListShell public DOM (jsdom) cancels queued restore on source storage filter and unmount without writing A into B`           | GREEN-only                                 |
| storage load save exceptions are diagnostic only and manual wheel cancels restore                       | `NvMobileTaskListShell public DOM (jsdom) storage load save exceptions are diagnostic only and manual wheel cancels restore`              | GREEN-only                                 |
| paused shell rejects pull gesture without false refreshing spinner                                      | `paused shell rejects pull gesture without false refreshing spinner`                                                                      | 有效行为 RED → GREEN                       |
| pause cancels in-flight restore page and resume requests the same committed page                        | `pause cancels in-flight restore page and resume requests the same committed page`                                                        | 有效行为 RED → GREEN                       |
| accepted filter restoration uses authority before scrolling; replacement storage cancels the old target | `accepted filter restoration uses authority before scrolling; replacement storage cancels the old target`                                 | GREEN-only                                 |
| refused pause update leaves authority and load conditions consistent                                    | `refused pause update leaves authority and load conditions consistent`                                                                    | GREEN-only                                 |
| persists committed filter immediately even without a scroll                                             | `persists committed filter immediately even without a scroll`                                                                             | GREEN-only                                 |
| library exposes usable filters, paging, safe errors and navigation                                      | `two neutral mobile hosts (jsdom fake clock) library exposes usable filters, paging, safe errors and navigation`                          | GREEN-only                                 |
| studio exposes usable filters, paging, safe errors and navigation                                       | `two neutral mobile hosts (jsdom fake clock) studio exposes usable filters, paging, safe errors and navigation`                           | GREEN-only                                 |
| retries the same failed raw cursor, deduplicates stable keys, retains refresh failure                   | `memory host callback lane retries the same failed raw cursor, deduplicates stable keys, retains refresh failure`                         | GREEN-only                                 |
| pause cancels late resolve and finally cannot clear new pending                                         | `memory host callback lane pause cancels late resolve and finally cannot clear new pending`                                               | GREEN + 故障注入 RED → GREEN（非先写 RED） |
| pause cancels late reject and finally cannot clear new pending                                          | `memory host callback lane pause cancels late reject and finally cannot clear new pending`                                                | GREEN-only                                 |
| queued completion checks final identity before batched source/filter watcher                            | `memory host callback lane queued completion checks final identity before batched source/filter watcher`                                  | GREEN + 故障注入 RED → GREEN（非先写 RED） |
| in-place row reverse/splice batches preserve final keys without triggering queries                      | `in-place row reverse/splice batches preserve final keys without triggering queries`                                                      | GREEN-only                                 |
| omitted host reader remains unknown and never claims success                                            | `omitted host reader remains unknown and never claims success`                                                                            | GREEN-only                                 |
| unmount aborts pending callback and late rejection stays diagnostic-free                                | `unmount aborts pending callback and late rejection stays diagnostic-free`                                                                | GREEN-only                                 |

六件套：主桶 + strict naming 集合同步至 49 件、覆盖矩阵、DESIGN 决策、API/live 源码、文档 nav、移动接入和 README 一次同步。新增移动 class 为 nv-m-；无新增 token、无依赖变更、冻结 shadcn 零改。无数值列/单位/技术 ID 的用户显示；长文换行，状态用既有 ErrorRetry/Empty 与合法 status/alert 角色。按钮与原生 select 支持键盘与触控；视觉/对比度/真实触摸未测，不自签。

## Fresh 命令和结果

所有命令显式 cwd，原始 log/JSON 留在 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r17-implementation-r1/`，各轮文件名不覆盖失败。

- Node v24.18.0；正式命令均 `corepack pnpm@11.22.0`（11.22.0），root 裸 pnpm=12.0.0 非正式入口；未安装升级依赖。
- cwd frontend/packages/ui-mobile：`exec vp test run src/components/task-list-shell src/components/pull-refresh src/components/infinite-list src/nvui-naming.contract.test.ts src/nvui-doc-coverage.contract.test.ts --reporter=json --outputFile=.../mobile-r8.json`，39/39，exit 0。
- cwd frontend/apps/playground：`exec vp test run src/mobile-task-list src/nvui-imports.contract.test.ts --reporter=json --outputFile=.../host-r4-green.json`，100/100，exit 0；含行为和 import 合同，非全宿主套件。
- cwd ui-mobile / ui / playground 各 `exec vue-tsc --noEmit -p tsconfig.json`，exit 0（mobile-types-r2、ui-types-r1、host-types-r2）。
- cwd playground `exec vp build`，exit 0；构建输出未提交。
- cwd frontend `exec vp lint` / `exec vp fmt --check` 仅影响路径，exit 0；根 Markdown 用 oxfmt stdin、非空输出、二次 cmp；人工 Markdown 路径检查 + git diff --check。

JSON 无 unhandledErrors 字段，故该字段 UNKNOWN，不能凑 0；完整 log 无 unhandled 提示。host log 存在 jsdom “Could not parse CSS stylesheet”，不提升为视觉成功。最终退出码与测试断言结果分别保留。

## 原始失败与限制

shell-r1 是 cwd 准备错误（不存在测试目标），不算 RED；shell-r3 是 MouseEvent 只读属性的测试输入错误，不算有效 RED。shell-r4 真实暂停手势虚假刷新中（7 PASS / 1 FAIL）；shell-r6 真实暂停继续恢复页锁未释放（8 PASS / 1 FAIL）。mobile-r5 含文档未补齐和新 scroll 保护导致原测试没有实际移动（33 PASS / 2 FAIL）；mobile-types-r1 为 emit union TS2769。均保留，后续 PASS 不抹掉历史。host-mutation-red 是故意移除提交守卫的故障注入反例，不能冒充生产基线先写 RED。

本轮未继承任何 PASS。先 RED 后 GREEN 未覆盖每个 AC 的历史过程，其余明确 GREEN-only；不自签整票完成。browser/真实 scroll visual/HTTP/docsLive/CI/packed/device/vendor/APS production 均 UNRUN，许可 UNKNOWN。旧 vendor 432 PASS / 1 timeout 且无完整 log、global fmt 3/main RAW 2/docs alias ENOTDIR/parallel timeout 为任务输入的历史事实，本轮未重跑也未称 skip。#21 PR130、#23 PR128、#43 PR122 各自 draft/未验边界不变，未改对应候选。

交父独立 review；没有启动后继代理或审核循环。

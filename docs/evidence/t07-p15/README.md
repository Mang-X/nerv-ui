# T07/P15 实施候选证据

对应 [#98](https://github.com/Mang-X/nerv-ui/issues/98)，scope M，单独 draft PR 面向 integration。只做 PlanGantt/PlanOrders/WorkOrderLink 只读组合；不自审、不启动 review/子代理，不 ready/merge/close/watch。父 #8/spec #1 与 PR18 不推进；旧四应用接入/旧库退出 NOT_PLANNED，不做换库。P16 全量工作台组合另属后继。

## 继承与同步

开工指定 checkout `/Users/mang/Project/nerv-ui-worktrees/t07-p15-saved-plan`，分支 `feat/t07-p15-saved-plan`，HEAD `a422ffe9e735a81fd0d2251cf3aaf5d863d4b12b`。2 tracked、6 untracked 文件先逐字备份到外部 `2026-10-29/t07-p15-resume-r2/inherited-backup/`，`manifest.json` 记录每文件 bytes/SHA-256 并回读相等；`tracked.diff` 保存完整 binary diff，另存整份脏文件，未 reset/restore/clean/stash。继承提交 `df45c0f` 仅保全候选，未冒称 fresh。

随后 fetch/merge 最新 `origin/integration/nerv-ui-extraction`：`e64802c57facb02359021f09af1d33424296cd9d` / tree `4edc6911166604ac2b64c162549b70501ff7f4c3`。merge `012bdba` 的唯一冲突是 App.vue，保留全部 T08 与 P15 导航。未创建或切换 checkout；root integration 与旧 Nerv-IIP 树只读。最终 head/tree/clean、PR 与执行状态见外部 handoff。

前席 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p15-implementation-r1/raw/` 的 18 份 red/green/typecheck 日志全部原样保留，逐项哈希见外部 `inherited-logs.json`。前席 green-08 是 fake board 5/5；RED 缺公开导出与早期类型错误均为历史事实，不是本席 fresh。所有历史 FAIL，包括 rawdiff2/docsalias/globalfmt/timeout，不被后续 PASS 覆盖；未修改旧 evidence。

## 已读来源与旧合同处置

已读本 checkout AGENTS/README、DESIGN governance/foundation、P04 renderer/P05 projection、P08 panels、P11 snapshot、host/model 合同；研究 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-research.md` §3–7 与原64清单。冻结 T01 `79b1578f2b75f55709765b5e7882aaf33146c603`，materials/reference 原始字节不改。

| 原始 source / blob                                                     | 原 props / events / slots / defaults                                                                                                                                             | 当前能力归属与处置                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SchedulingPlanGantt.vue / ab468e35753a96b3ed2b1e2ec49b069e906f7eea     | timeContext/plan/summary/loading/error/releasePending/workOrders/workOrderFactsUnavailable 均 optional；openDetail/release；无 slot；内部 auto/workCenter/busiest、空搜索/空选择 | SchedulingSavedPlan（别名 SchedulingPlanGantt）；host 提供模型、时区、名称、维度目录、快照、汇总/失效/不可绘制提示。summary facts/notices 保留统计与提示读面，actions slot 保留 host 发布 busy/disabled 能力；onOpenPlanDetail 独立方案粒度。只读图、树表、详情、搜索、换组/排序、收展由本票；引擎/日历/冻结/分段/P05投影/P08图例直接复用；风险和缺口复用 P11。无 HTTP 异常解析 |
| SchedulingPlanOrders.vue / bb86db4b0ff5614dce70decaa129293412c6d499    | model/workOrders/selectedTaskId 必填，factsUnavailable optional；select(taskId)；内部 cell-operationId/cell-status slots 非外部 API；无默认 props                                | SavedPlanOrders（别名保留）；commercial groups 由 host 指定真实 key/orderIds；orders.taskRefs 显式三 key 校验；保留状态、真实 0/unknown 进度、活动/前序、选中；不复制旧 operationTaskId OR operationTaskNo 模糊 join                                                                                                                                                            |
| SchedulingWorkOrderLink.vue / 0b0dcc0651bc806937c6bcc6cfdc0adae690ed2f | workOrderId/operationTaskId optional nullable；无事件；default slot 默认 workOrderId；auth/router 隐式依赖                                                                       | SavedPlanWorkOrderLink（别名保留），label 代 default slot，request/taskId/orderId 或 groupKey/planId/target 显式；缺目标/权限 callback 保持文字；host 负责权限/实际 router，库处理 pending/通用失败及陈旧回执失效                                                                                                                                                               |
| PlanGantt/Orders/WorkOrderLink 原测试共3文件                           | 真实风险/分组/空泳道/冻结/侧表/工单来源权限断言；原 suite 用旧 SDK/auth 测试环境                                                                                                 | 原测试全字节归档，不 stub SDK 偷绿；通用能力回到 P04/P05/P08/P11 公共测试与本票精确测试；旧应用运行 UNRUN/接入 NOT_PLANNED                                                                                                                                                                                                                                                      |

直接 consumer 完整范围：`pages/scheduling.vue` 的 PlanGantt、方案 assignment link 属 P16 组合示范；`SchedulingPlanGantt.vue` 的 Orders/Link 属本票；`SchedulingPlanOrders.vue` 的 Link 属本票；`SchedulingDraftBoard.vue` 的 Link 由已交付 P09 中性动作承接，不修改其旧应用代码。本票保留这些原文件/三测试的最小来源归档 8 项，逐项 blob/bytes/SHA-256 在外部 `source-archive-manifest.json`。旧 source consumer 未运行。

原64路径不重复建立 runtime registry：[P04 原64归属](../t07-p04/original64-ownership.json) 历史快照逐项保留；58 活动、6 reference 的责任继续归 P01–P14 原 owner。P15 仅追加3件应用读面，不重写64、不把旧纯算法测试或 vendor skip 消掉。完整公共 props/events/slots/defaults 见[合同](../../scheduling-saved-plan.md)。六件套由源码、主桶与旧名别名、公开契约测试、coverage 行、DESIGN 决策与文档站实时状态演示组成。

## Requirement | Evidence

下列精确名称来自 `SavedPlan.public.test.ts`，只证明 public 输入/事件/DOM 与 fake board 协作，不证明真实 vendor 视觉、几何或 keyboard。

| Requirement                                                     | Evidence                                                                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 图/表/详情受控且拒绝假关联                                      | `keeps graph, order table and detail on one authoritative task and exact task reference`；`rejects a false legacy pair join and clears removed task without retaining old facts`              |
| 换 plan/删任务/同 key 返回不残留                                | `does not resurrect a removed selection when the same assignment later returns`；`public order table rejects a model from another plan even when task keys collide`                           |
| 同 key facts 更新、搜索定位、收展、父拒绝                       | `search and side re-entry follow accepted selection, while a rejected parent remains authoritative`                                                                                           |
| 两维换组/受控接受拒绝、三类 commercial 状态、task/group payload | `keeps grouping controlled, reports commercial authority and sends exact task/group navigation requests`                                                                                      |
| 旧计划异步 facts/链接不污染                                     | `keeps delayed old-plan commercial and link responses out of the new plan`                                                                                                                    |
| 导航真实 key/无目标/同名组、失败/陈旧回执                       | `group navigation uses stable keys even when display labels collide and missing targets stay text`；`link catches navigation rejection and discards an old receipt after context replacement` |
| 0/unknown/empty 与计划权限状态                                  | `keeps zero progress distinct from unknown and plan authority distinct from empty commercial facts`                                                                                           |
| host summary/action 与失效提示                                  | `shows host summary zero unknown notices and actions without inventing a release policy`                                                                                                      |
| 两域 source consumer、旧请求取消、卸载                          | `saved plan source consumer keeps two venues and rejects delayed previous-plan facts`（playground fake composite）                                                                            |
| 公开类型消费者                                                  | `frontend/contract-consumers/scheduling-host/saved-plan-consumption.ts` 经真实裸包 vue-tsc；source/prepared，非 packed                                                                        |

本席 fresh RED：在继承源码上新增3项反例均实际 FAIL（复活选择、跨计划关联、导航 pending）。随后同反例 GREEN；red.json/red.log、green-01/02/public-final、scheduling 全量日志均留外部。首次 scheduling 全量 FAIL 是既有 snapshot 测试要求显式 TZ，而环境 undefined；不修改该断言，使用其合同支持的 Asia/Shanghai 重跑，原 FAIL 保留。缺失 reporter runtime/unhandled 数字均记 UNKNOWN，不以 exit0 推断为0。完整次数与最终结果由 handoff 列示。

## 依赖与未执行边界

pnpm 固定11.22.0，node 调用绝对 pnpm.cjs；frozen/offline/ignore-scripts 恢复 integration #51 Reka patch。批准 base 的完整 lock bytes/对象/依赖与 peer 边及 Vue 单例、vendor 三文件字节核对见外部 invariants.json。未升级依赖、未删除973 packages/snapshots。DHTMLX9.1.4 Professional Evaluation 声明/水印原样保留，授权 UNKNOWN。

fake/public、source/prepared consumer、本地构建/类型与真实浏览器、packed、CI 分列。本实施席不使用 preview，不运行浏览器或设备。真实 vendor/native、宽窄容器、键盘和资源 HTTP body/status/MIME/bytes/hash 由父独立运行席补证。4 policy-skipped conformance 零执行不算 PASS。完整 docs #10、packed #11、CI、设备、真实 APS/后端、旧 consumer、生产均 UNRUN；旧应用替换和旧库退出 NOT_PLANNED。本 PR 不宣称 #98 整票运行验收完成。

## 最终本地执行（本席 fresh）

- `scheduling-shanghai.json`：385 PASS / 4 policy-skipped，exit 0；此前 `scheduling.json` 384 PASS / 1 FAIL / 4 skipped（TZ undefined）保留。最终局部追加换组/排序 reveal 检查后 `public-seal.json` 12/12，exit 0；未再重复全桶，385 的其它路径仅支持有界继承。`accepted regroup and reorder reveal the same selected assignment while search can clear and miss` 直接覆盖搜索未命中/清空与接受换组后的定位。
- `host.json`：105/105，exit 0（P15 source host + import 契约）；`consumer.log` prepared public 类型消费 exit 0，非 packed。
- `build-seal.log` 为最终类型/构建门禁，含四包 typecheck；未运行完整 docs 构建。scoped lint/fmt 与95个相对链接验证的原始输出留外部；最终 head/tree/clean 见 handoff。
- 未提供的 reporter runtime/unhandled 数字 **UNKNOWN**，CSS parser warning 保留；不将 policy-skipped 当真实 vendor PASS。

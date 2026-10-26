# 草案可视编辑（P09）

[P09 / #92](https://github.com/Mang-X/nerv-ui/issues/92) 从旧应用的 `SchedulingDraftBoard`、`SchedulingDraftFeedback`、`SchedulingDraftClearDialog` 提取可视交互。三个名字现在由 `@nerv-iip/scheduling` 主桶公开；既有公共组件、默认值和事件保留；R1 返修新增下述可选错误格式化/诊断与分组请求事件。`migration/materials/source` 与 `migration/reference/source` 保持冻结。

`/#schedule-draft/library` 与 `/#schedule-draft/studio` 是中性宿主 recipe，可以从桌面、旧工单/资源编辑和详情入口进入并返回。页面持有单一 model、选中 ID、待排活动和本地快照历史。两个图通过已有 public `GanttChart`、`ResourceSchedulerBoard` 显示；表格和详情读取同一份 model。图面一次挂载一个，切换时走现有生命周期。DHTMLX 9.1.4 Professional Evaluation 声明、水印和授权 UNKNOWN 保留；缺引擎时仍由唯一 native renderer 只读展示，不能拖动。

## DraftBoard 公共合同

所有 props 均可选；没有 model 时显示空态。`title` 默认“排程草案工作区”。默认从活动时间图开始，刻度 hour。表格只编辑非 block 的 operation，identity 使用宿主 `task.id`，不从 order/operation 名称生成。时间输入使用每项 `timezone`，复用严格 `factoryTimeInput/factoryTimeInstant`；无时区或分段时不开放时间输入。结束必须晚于开始，无效输入提示并恢复权威值；分段仍逐段显示。资源选项来自 `model.resources`，空选项请求 `resourceId: undefined`，不推断任何维度或 equipment ID。

| 输入                                               | 含义                                                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `model?: ScheduleModel`                            | 唯一权威展示模型。组件和回调快照均不改写输入                                                                                            |
| `selectedTaskId?: string`                          | 受控选中 ID；缺省时仅选中状态由组件持有。详情始终按当前 ID 查当前 task，不保留旧对象                                                    |
| `feedback?: DraftFeedback`                         | 由 host/validator 提供，替换后立即重绘，不在 UI 计算可排性                                                                              |
| `pendingOperations?: SchedulingDraftPendingItem[]` | `{ id, taskId?, label, message?, canRestore? }`；只在明确 canRestore 且有 taskId 时提供恢复                                             |
| `readOnly?/pending?`                               | 禁止图面编辑、表格、详情锁动作、待排恢复、撤销重做和保存/清空；浏览切换、搜索和选择仍可用                                               |
| `canUndo?/canRedo?/dirty?`                         | 本地历史输入，缺省 false；撤销重做只发请求，不代表服务保存/发布                                                                         |
| `groupBy?`                                         | 实际资源分组；缺省从当前 model 首个维度选择，图例与资源图显式使用同一个值                                                               |
| `save?/clear?: SchedulingDraftAction`              | `async (snapshot, { signal, context }) => boolean`；context 当前 undefined。snapshot 是独立 JSON 副本；只有 `=== true` 表示当前回调成功 |

事件：`update:groupBy(key)`、`actionError({ operation, error })`、`update:selectedTaskId(id)`、`move(TaskDragPayload)`、`update(taskId, SchedulingDraftPatch)`、`lock(taskId, locked)`、`lockedAttempt(taskId)`、`moveToPending(taskId)`、`restorePending(taskId)`、`undo()`、`redo()`、`cleared()`。patch 仅包含 startUtc/endUtc/resourceId。锁只约束本地编辑，不自动持久化。

图拖动 payload 原样保留 P07 `assignment: { dimension, id, label }`，其中 id 可以为 null。host 决定如何采用；任意空间/小组维度不能冒充 equipment ID。父输入不变即拒绝，图回到原权威状态；表格原生输入也在请求后的 nextTick 回显当前值。采用后必须由父替换/更新 model。换 plan 请求清选中，删除当前 task 同样清理；受控消费者应处理该事件。受控选择请求在 nextTick 回读当前权威 ID：父接受后选择新项，拒绝后恢复原项；相同 ID 的命令回声不再发请求。外部同 ID 改名/重排时详情仍读当前对象。空 ID、删除选中任务或空权威下拒绝选择会清除高亮；Board 通过既有 selectTask 的空 ID 清除引擎选择，并在现有 model 输入上提供新的独立顶层对象以清除原生高亮；不改写宿主输入、不重建当前图实例、不改引擎/command/lifecycle 实现。图面仅回传非空的用户选择，命令空 ID 的回声不会成为新的清除请求。readonly 下仍可选择。切图把当前选择发送到现有 command(selectTask)，搜索使用公开 highlight/reveal 命令。

分组选择器发 `update:groupBy(key)` 请求。传入 `groupBy` 时父输入是权威；父不采用时，选择器在 nextTick 恢复当前值，图面和图例始终读取同一 actualGroup。缺省时 Board 自持选择，当前维度表已不含本地选择时回到首个维度；换 plan 重置本地分组。宿主应传当前维度表中的有效 key；维度值/泳道及图例计算继续由现有 P05/P08 producer 处理。

默认详情复用 `TaskDetailPanel` 和 `TaskFacts`。默认 feedback 展示可被 `feedback` scoped slot 替换（task/feedback）；`task-actions` slot 提供当前 task/disabled，供 host 安装中性动作。旧应用的“持久锁定/已持久锁定”依赖 MES override 保存与回读，不能作为本地锁或 undo 的含义；接入方在此 slot 用自身 callback、pending 和实际结果展示。P09 不迁 SDK、useWorkingScheduleDraft、useSchedulingDraftPersistence、资格/求解/后台保存，不提供自动持久化。`actions` slot 可附加独立动作。内部 `SchedulingWorkbench` 仍是既有内部组件，P16 才做组合验收。

## 即时反馈摘要

Board 在三个视图上方保留输入驱动的跨任务清单。数量为当前 model 中至少有一个非 unknown issue 的任务数；同任务多条问题只计一次，unknown 任务另列数量并显示原提示。点击清单只请求选中当前 task.id，接受/拒绝仍走同一选择合同。重排、同 ID 替换及删除都重新关联当前对象；不在当前 model 的孤立 feedback 不显示，也不按旧行序匹配。

缺 feedback 显示“尚未提供校验反馈”，不补 0；已提供空 issues/空任务映射显示“未记录待核对问题，不代表校验通过”。unknown-only 可为 0 项需核对，同时明确依据未明及其消息。表格逐行、选中详情的 feedback 和 slot 继续保留；摘要不调用 validator、不推导风险或交期，不属于 P11 的物料/设备快照。

## 保存、清空与晚回

保存按钮只等待实际注入 callback；缺回调显示“尚未提供保存方式”，false 或异常保留草案并显示可重试错误。成功不会重置本地历史、自动锁定、求解或发布。host 才能确定保存副本/持久化凭证及撤销后是否仍 dirty。model（含深层变更）、待排输入、保存 callback 或 readonly 改变，以及组件卸载会 abort 并丢弃旧返回，即使 callback 不遵守 signal。pending 用本地同步门闩阻止重复点击。

`SchedulingDraftClearDialog` 可独立消费：必填 `v-model:open`，可选 `pending/disabled/scopeKey/clear`。`clear(control): Promise<boolean>` 兼容旧 `() => Promise<boolean>`；`cleared()` 只在当前操作 true 后触发，同时 `update:open(false)`；`update:pending(boolean)` 可同步外部编辑禁用。false/异常不关对话框；取消不发 cleared。处理期间禁止取消和 Escape。关闭、scopeKey 深层变化、clear callback 更换、disabled 改变或卸载会使旧操作过期；host 应在换方案时关闭对话框。Board 已组合该行为，并在回调成功后发 cleared，由 host 决定如何替换草案。callback 若自行改 model，会使旧请求过期；推荐返回 true 后在 cleared 中完成 UI 状态替换。

Board 与独立 ClearDialog 都支持可选 `formatActionError?: SchedulingDraftErrorFormatter`，签名 `(error: unknown, operation: 'save' | 'clear') => string | undefined`。返回已审定的用户可行动原因，undefined/空串/格式化异常走库默认映射；返回完整 HTTP/API/JSON/堆栈等技术原文也会被拦截。默认从 Error.message 或对象 message/detail/title 取纯中文可读原因，识别出的技术串及未知形状使用“未能保存/清空，草案仍保留，可重试”。安全领域原因保留，库不要求每个宿主先包装异常。formatter 不改变 boolean 成功合同，旧 callback 签名兼容。

当前失败同时发 `actionError({ operation, error })`，保留原始 unknown 对象用于宿主日志/诊断；Board 转发自身保存及内嵌清空事件，独立 ClearDialog 也直接公开此事件。原始对象不默认进入可见状态；过期请求既不格式化、不更新状态，也不发诊断事件。宿主可监听该事件接自己的诊断系统，无需将原文放到 UI。

反馈组件只显示注入的 issues/unknown/时间范围/due。缺反馈与空 issues 区分；空列表只表示未记录问题，不证明日历、容量或前序均有效；缺 due 不补 0。时区未解析显式显示。

## 中性 recipe 的证据边界

`DraftEditingDemo.vue` 不导出新业务 composable。它用独立 JSON 快照演示接受/保留、表格资源与时间、锁/解锁、待排恢复、undo/redo、外部换 plan 和失败重试。示例 host 明确把资源映射到空间维度；assignment null 删除对应维度，不伪造设备。保存 callback 仅复制到页面内独立副本；清空 callback 成功后重置手工草案到当前初始安排。刷新即结束，不连接真实 APS/MES 或保存服务。

P10 表单/P11 风险/P12 比较/P13 异步候选/P16 工作台未提前实施。完整 docs #10、packed #11、旧应用接入 #13/#15、父 #8、CI、设备、生产发布与商业许可各自验收。当前执行证据、精确测试名称和未运行项见 [P09 证据](evidence/t07-p09/README.md)。

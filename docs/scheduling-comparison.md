# 基线与候选静态比较（P12）

[P12 / #95](https://github.com/Mang-X/nerv-ui/issues/95) 提供公开的 `ScheduleRevisionReview`、`SchedulingPreviewResult`、`compareScheduleSnapshots` 与中性 `ScheduleSnapshot`。独立宿主从 `/#schedule-compare/library`、`/#schedule-compare/studio` 进入；桌面、草案与快照核对页也有链接。两页可返回旧入口。本票只显示来源事实与安排结构，不计算 APS、延期、准时率、产能、风险或准备状态。

## 身份与输入

`ScheduleSnapshot.items[].semanticKey` 由宿主跨快照稳定提供，代表同一语义活动；`item.task.id` 是当前快照的 assignment 实例身份。比较先在**各自快照内**校验 semanticKey 非空且唯一、assignment ID 唯一，再只按 semanticKey 关联。重复或缺失会显示错误并停止比较，不按 orderId/operationId、assignmentId 或数组位置回退。同一 semanticKey 换 assignmentId 仍是同一活动；不同 semanticKey 即便在两侧偶然同 assignmentId，也不能互相配对。

`compareScheduleSnapshots(baseline, candidate)` 只比较已配对 task 的 `resourceId`、开始/结束实际时刻及各段起止。资源展示名、原因、`blocked` 和指标由宿主提供。无候选 task 且宿主明确给 `state: 'blocked'` 才显示“候选待安排”；其余缺失是“候选未提供”，不猜为什么缺少，也不补完工时间。只有基线完全没有该 semanticKey 时才算新增；基线已有活动但未获 assignment，候选首次有安排属于已调整。新增时基线一侧显示“未提供安排”。组件不改输入；宿主必须把已保存基线、当前草案、候选预览和当前事实分别持有，按保存凭据选择基线，不把当前输入深拷贝后称作已保存。两个快照可独立外部替换，空集合表示该来源无活动记录，不表示方案就绪。

比较表与 P08 摘要对缺侧共用明确文案：新增的基线侧为“未提供安排”，未知的候选侧为“候选未提供”，仅来源显式 `blocked` 才为“待安排”；未知保持 neutral，新增为 success，显式阻断为 danger。P08 `ScheduleChange.changeType` 局部允许 `missing`，不改共享 `ChangeType` 词表；`beforeAbsentLabel`、`afterAbsentLabel` 为可选展示接缝，省略时旧 `changeType` 和“未排”行为保持。候选预览单独使用时也校验同一快照的 semanticKey、assignment ID 与实际时刻；身份有歧义时显示错误并停止图面选择。只读图面在引擎就绪后校准尺寸，窄屏在图面内部横向滚动。

`ScheduleSnapshot` 带 `source: SnapshotSource`，其来源、记录时点、状态、读取状态沿用 P11。记录时点由宿主用明确时区格式化。开始、结束及分段必须是带 UTC/offset 的有效实际时刻；本地无偏移字串会阻止比较，不使用浏览器时区解析。每个 task 的时间用其明确 `timezone` 展示；缺失或无效时显示“时区未解析”，不回退浏览器时区。表格的 before/after、逐段明细和 P08 `ChangeSummaryPanel` 均用各自快照的 task。P08 新增可选 `beforeTaskId/afterTaskId`，显式 `null` 表示该侧无 task；旧 `taskId` 与省略字段的旧行为保留。比较选择事件向宿主发送 semanticKey，宿主从当前候选重查，不能缓存旧 assignment 对象。

`metrics?: readonly ScheduleSnapshotMetric[]` 只格式化宿主值：`undefined/null/NaN` 显示“—”，真实 `0` 显示 `0` 或 `0%`。不从任务数、时间或风险反算；指标缺失和空指标列表各有不同文案。候选 `model?` 只供既有只读 `GanttChart`；`shortages/risks/conflicts` 由 P11 四件中的 `MaterialShortageSummary`、`PlanRisks`、`PlanConflicts` 读取，未提供时显示缺失状态。readonly 关闭选择动作，展开和筛选仍可用。错误、无权、未知和暂不可读取由 `source.state` 控制，不显示过期内容；没有保存、发布或后台成功动作。

两侧都明确给 `metrics: []` 时显示“此来源无指标记录”；任一侧未提供指标且无可列指标时显示“指标未提供”。混合输入逐指标显示双侧来源值，缺值用“—”，真实零值保留。playground 的未保存草案时间用任务显式时区显示到分钟，原实际时刻留在 `<time datetime>` 与模型中。

## 旧来源与消费者

冻结旧源 `migration/materials/source/frontend/apps/business-console/src/components/scheduling/ScheduleRevisionReview.vue` 为 app 私有：它收 `revision/basePlan` 业务 DTO，以 orderId/operationId 回找，局部重判 changeType，并把缺失延期等补 0。新公开件不接受 DTO；宿主适配器须提供两份已分离的 `ScheduleSnapshot`、稳定 semanticKey 与显式指标。旧私有名保留在冻结目录，新公共名同名但输入合同不同，不把旧 DTO 自动转换为权威快照。

冻结 `SchedulingPreviewResult.vue` 为 app 私有：旧 `plan` prop 转 `toModel`，显示只读甘特、五项指标、冲突表、未排表及缺料汇总。新公共件接 `snapshot`，复用当前只读甘特和 P11 风险/冲突/缺料展示；标题与说明可由宿主提供，默认不宣称保存或发布。旧直接消费者为 `SchedulingInsertionPreview.vue`、`SingleOrderSchedulingDialog.vue`、`SchedulingRushInsertionResult.vue`；`pages/scheduling.vue` 直接消费旧 revision 件。它们仍在冻结材料内，本票不改旧应用、SDK 或生成器；原库接入分别由 #13/#15。

## 证据边界

本票实际命令、公开测试、浏览器与未运行项见 [P12 记录](evidence/t07-p12/README.md)。DHTMLX 9.1.4 Professional Evaluation 文件、声明、水印及授权 UNKNOWN 不变。静态比较不证明真实 APS、CI、packed #11、旧应用接入 #13/#15、父 #8 组合或生产发布。

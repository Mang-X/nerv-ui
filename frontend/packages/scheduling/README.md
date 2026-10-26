# @nerv-iip/scheduling

排程包已由 P04 恢复活动 workspace，公开组件名保留。裸包、样式/Vite 接入、loader 缓存与只读/回落合同见 [引擎接入](../../../docs/scheduling-renderer.md)，playground 入口为 `/#schedule-gantt`。

- `@nerv-iip/scheduling/model`：P02 纯展示、事实和时间合同，见 [scheduling-model.md](../../../docs/scheduling-model.md)。
- `@nerv-iip/scheduling/host`：P03 host adapter / loader / 编辑回调，不调用 SDK 或求解，见 [完整签名与迁移例](../../../docs/scheduling-host.md)。
- `@nerv-iip/scheduling/test-support`：Vitest conformance 注册；根桶同名 deprecated 函数明确抛迁移错误，默认运行图不导入 Vitest。

既有 `toModel/toLockedAssignments/evaluateDraft/materialReadyLabel/useSchedulingPlan/useSchedulingEdits` 名字保留，原业务参数改为显式 host 合同，旧调用必须迁移。preview 接收独立草案快照，host 自行计算/查询锁定分配；未提供回调不算成功。权限、验证、求解、存储、取消副作用与 SDK 生成归宿主。

旧算法/断言/fixtures 原字节另存非活动 `frontend/reference-adapters/nerv-iip/t07-p03` 与 `frontend/reference-tests/nerv-iip/t07-p03`；原64文件归属见 [本轮证据](../../../docs/evidence/t07-p03/README.md)。P04 已将受影响 engine/UI 测试改为直接展示输入；原字节另存 `frontend/reference-tests/nerv-iip/t07-p04`。fake 与保留的 vendor conformance skip 不代表真实引擎，实际执行统计见 [P04 证据](../../../docs/evidence/t07-p04/README.md)。

DHTMLX 固定 9.1.4 Professional Evaluation；vendor 声明与水印保持，授权范围 UNKNOWN。无发布、升级或替换。

P07 资源移动/改派与左右原生 resize 使用受控 `taskDragEnd` 提案，输入不突变。显式维度改派通过新增可选 `assignment: { dimension, id, label }` 表达，保留原 `resourceId`；纯资源兼容泳道仍使用原资源字段。接受/拒绝、取消、小时吸附、跨命名空间及旧 consumer 迁移边界见 [资源编辑合同](../../../docs/scheduling-renderer.md#p07资源受控编辑)。中性独立入口为 `/#schedule-resource-edit/library`、`/#schedule-resource-edit/studio`；[本轮证据](../../../docs/evidence/t07-p07/README.md) 不替代 P09 草案或商业发布验收。

P05 资源只读投影的 `resources/groupValues/groupBy/laneOrder`、可选资源维度归属、0/未知指标、日历/块/冻结与 native 能力边界见 [资源合同](../../../docs/scheduling-renderer.md#p05资源只读投影与分组)。独立入口 `/#schedule-resources/library` 与 `/#schedule-resources/studio`；实际 RED/GREEN 和浏览器证据见 [P05 记录](../../../docs/evidence/t07-p05/README.md)。

P11 的 `MaterialShortageSummary/PlanRisks/PlanConflicts/ResourceLoads` 接收 optional 中性 display 与明确 source，保留旧数组 props；只显示给定事实，不计算物料净额或风险。类型、严重度、0/未知、冻结/当前、只读和 select 合同见 [快照展示](../../../docs/scheduling-snapshot.md)。

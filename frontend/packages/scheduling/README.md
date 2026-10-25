# @nerv-iip/scheduling

候选排程包，公开组件名与现有引擎接口保留。活动 workspace 的完整引擎恢复由 [P04 / #87](https://github.com/Mang-X/nerv-ui/issues/87) 承担，目前不宣称整包可运行。

- `@nerv-iip/scheduling/model`：P02 纯展示、事实和时间合同，见 [scheduling-model.md](../../../docs/scheduling-model.md)。
- `@nerv-iip/scheduling/host`：P03 host adapter / loader / 编辑回调，不调用 SDK 或求解，见 [完整签名与迁移例](../../../docs/scheduling-host.md)。
- `@nerv-iip/scheduling/test-support`：Vitest conformance 注册；根桶同名 deprecated 函数明确抛迁移错误，默认运行图不导入 Vitest。

既有 `toModel/toLockedAssignments/evaluateDraft/materialReadyLabel/useSchedulingPlan/useSchedulingEdits` 名字保留，原业务参数改为显式 host 合同，旧调用必须迁移。preview 接收独立草案快照，host 自行计算/查询锁定分配；未提供回调不算成功。权限、验证、求解、存储、取消副作用与 SDK 生成归宿主。

旧算法/断言/fixtures 原字节另存非活动 `frontend/reference-adapters/nerv-iip/t07-p03` 与 `frontend/reference-tests/nerv-iip/t07-p03`；原64文件归属见 [本轮证据](../../../docs/evidence/t07-p03/README.md)。旧 engine/UI 测试尚待 P04/P08 更新输入，不以 prepared public consumer 的通过代表全包绿色。

DHTMLX 固定 9.1.4 Professional Evaluation；vendor 声明与水印保持，授权范围 UNKNOWN。无发布、升级或替换。

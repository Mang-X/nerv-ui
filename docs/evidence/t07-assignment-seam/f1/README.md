# 改派修复 R1：当前选中详情

独立真实资源板发现，移到未分配后工作模型和图面已正确清资源，Workbench 仍把选择时的旧对象交给详情。旧失败原件在仓外 `2026-10-29/t07-assignment-review-runtime-r1/`，不被本次通过覆盖。

本次保留选中 ID，从当前 workingModel 派生任务，不再存旧对象。本地改派、undo/redo 和预览替换会更新详情；宿主输入/loading 清选中仍按原合同，当前预览删除任务也清 ID，之后同 ID 返回不会复活。未修改改派算法、引擎或宿主事实。

Requirement coverage：既有 `workbench accepts dimension reassignment through its resource board and restores host authority` 与 resource 对应测试增加真实详情 props 与当前图模型相等断言，先 0 PASS/2 FAIL，再通过；同时保留 undo/redo/宿主替换和输入不可变断言。新增 `selected detail follows current preview facts and never revives after the selected task is removed` 覆盖当前事实、删除与同 ID 返回。

最终四文件 35/35，包括原组件行为和改派 host 用例；图板 stub 仅为事件接缝，不能代真实厂商手势。真实侧栏、未分配、undo/redo 等待独立复验。类型/构建和限定检查原件见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-assignment-selection-fix/handoff.md`。没有重复全 scheduling 桶；原 419/4skip 仅作未受影响输入的有界继承。runtime/unhandled 缺数字 UNKNOWN；CI/packed/设备/APS/生产 UNRUN，授权 UNKNOWN。

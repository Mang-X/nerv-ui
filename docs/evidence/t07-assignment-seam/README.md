# 工作台资源改派接缝修复

父 #8 的独立验收发现 `useSchedulingEdits` 没有消费 P07 `assignment`，并用旧资源补回明确未分配值。父验收原 2/2 FAIL 留在仓外 `2026-10-29/t07-parent-acceptance-r1/`；本次独立窄修，不抹除叶子已验收的事实或父拒绝结果。

| Requirement                                          | Evidence                                                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 维度改派不借同名资源，undo/redo/宿主优先             | `accepts dimension reassignment without borrowing a colliding resource identity and supports undo redo authority`     |
| 纯资源明确未分配清旧值，move/resize 省略字段保留资源 | `clears an explicitly unassigned resource while move and resize keep an omitted resource`                             |
| null 维度压过资源继承，不影响其它维度                | `explicitly unassigns workCenter without inherited resource membership or losing other dimensions`；对应 team 用例    |
| Workbench 资源板事件桥接、撤销/重做、只读/替换       | `workbench accepts dimension reassignment through its resource board and restores host authority`；对应 resource 用例 |

四项公开 host 回归最初 0 PASS/4 FAIL，修复后 4/4；加入真实 Workbench/composable、明确 stub 图板事件接缝后共 6/6。输入原对象的 JSON 保持相等。共享投影由 vendor 和 native 共用，新增 `unassignedDimensions` 是显式空归属覆写；未提供时保留原行为。它不表示设备选择、权限或领域资格，不改引擎或 vendor。

精确命令、最终门禁和对象见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-assignment-seam-fix/handoff.md`。真实资源板改派需要独立运行验收，本次 jsdom 不替代。runtime/unhandled 缺失数字仍 UNKNOWN，4 vendor policy skips 为零执行；CI、packed、device、APS、生产与授权仍 UNRUN/UNKNOWN。旧四应用接入与旧库退出 NOT_PLANNED。

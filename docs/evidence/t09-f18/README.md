# T09/F18 实施证据

范围：#187，父 #10；仅 SidebarGroupContent / SidebarMenuSkeleton 文档组合，不签署 Sidebar 本体 UNRESOLVED 合同。

基线：`1a5954217605fb42e19182c2138351cd1e60272f`，tree `be3595e9251cc4f6052b81a2bfd567e54709a3a1`；开工 clean，#186 MERGED。交付仅中文 draft PR，base integration/nerv-ui-extraction。

- fresh DOM：移除真实 GroupContent 包装后 1/1 FAIL；恢复后 1/1 PASS。最初用既有示例占位取得的 RED 单独保留，不代替 mutation RED。
- fresh docs 完整测试：23 文件、91/91 PASS，原 90 断言未改。CSS parse 诊断仍存在，原始日志保留。
- fresh docs typecheck、build、scoped lint/fmt、git diff --check PASS。build 保留 Rollup 提示，不抹除历史失败。
- fresh 保留核对：183 旧页，182 页逐字节不变；sidebar 原文只增加 import，剔除新 import 后原文为完整前缀（含原示例）。根 AGENTS.md / DESIGN.md / README.md 非空且 byte cmp 相同。结束前二次核对。
- 链接：完整 docs build 死链检查及原 docs contract 均通过；新增同源 include 对应真实 Vue 文件，无新站内路由。
- 准备 FAIL：首次命令路径与 cwd 不符、一次 root formatter 无 package；原始事实保留，随后从正确 docs/frontend cwd 重跑。
- 历史 81/82 FAIL 未复跑、原因 UNKNOWN；此次 PASS 不覆盖历史记录。runtime 数字 UNKNOWN。
- browser/HTTP、1440/390 亮暗、真实鼠标/Tab/Enter：独立席 UNRUN；CI 空不算 PASS。packed/device/production UNRUN；旧应用接入退出 NOT_PLANNED。

原始日志、source/SHA 回读与交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f18-implementation-r1/handoff.md`。不收 dist/deps，不改冻结 producer/API/锁/治理或永久 registry，不修改父票。

# nerv-ui

从 Nerv-IIP 提取的 Vue UI 系统，覆盖桌面、触屏、移动、大屏、文件上传/预览、排程、应用壳、主题和设计文档。

**当前仅完成 T01 原样复制基线，尚未独立运行。** 来源固定为 [Mang-X/Nerv-IIP](https://github.com/Mang-X/Nerv-IIP/tree/79b1578f2b75f55709765b5e7882aaf33146c603) 的 `79b1578f2b75f55709765b5e7882aaf33146c603`；独立运行、解耦、安装产物和原库接入由 [母票 #1](https://github.com/Mang-X/nerv-ui/issues/1) 下的后续票负责，本次范围为 [#2](https://github.com/Mang-X/nerv-ui/issues/2)。

- `frontend/packages/{ui,ui-mobile,app-shell,scheduling}`：原样活动候选，保留原包名和导出。
- `frontend/apps/design-system`、`frontend/DESIGN`、`DESIGN.md` 及 frontend 根配置：原样文档、设计与工程候选。
- `migration/materials/source/frontend`：其他应用完整源码及 auth/business-core 原始素材，待解耦；不在活动 workspace 内。
- `migration/reference/source`：原库决策、规则与工程参考，只代表来源时点。
- [迁移说明与核验](migration/t01/README.md)：分类、后续责任、逐文件 provenance 和复制前后证据。

候选源码仍含原仓库 alias、样式相对路径、应用扫描测试及业务契约依赖。根 workspace 聚合任务也仍是原内容；这里暂不提供安装/启动成功承诺。构建、类型检查、组件测试、浏览器和独立宿主安装验收均为 **UNRUN**，不继承旧库通过结论。

本仓库保持私有；未选择新的发行许可，未授权公开发布。第三方来源、Evaluation 声明与限制原样保留，见 [来源与限制](migration/t01/README.md#第三方来源与限制)。

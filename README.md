# nerv-ui

从 Nerv-IIP 提取的 Vue UI 系统，覆盖桌面、触屏、移动、大屏、文件上传/预览、排程、应用壳、主题和设计文档。

当前完成 T01 原样复制基线，并在 [T02 / #3](https://github.com/Mang-X/nerv-ui/issues/3) 提供可独立安装、启动和构建的桌面 playground。完整迁移由 [母票 #1](https://github.com/Mang-X/nerv-ui/issues/1) 跟踪；其他表面、完整文档站和版本化安装产物尚待后续票验证。

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend dev
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend build
```

Node >=22.18，pnpm 11.22.0；具体命令、CSS 接入、workspace 恢复责任与测试分工见 [独立桌面接入](docs/desktop-standalone.md)，实际证据见 [T02 验证记录](docs/evidence/t02/README.md)。宿主通过 `workspace:*` 消费公共 `@nerv-iip/ui`，不需要 Nerv-IIP checkout、生成 SDK 或后端；版本化产物安装属于 #11。

- `frontend/packages/ui`、`frontend/apps/playground`：当前活动 workspace。
- `frontend/packages/{ui-mobile,app-shell,scheduling}`、`frontend/apps/design-system`：保留的候选源码，待 #5/#9/#8/#10 恢复参与安装和聚合命令。
- `frontend/DESIGN` 与 `DESIGN.md`：设计规则和资料；独立库增量决策优先回到当前接入文档。
- `frontend/reference-tests`：旧库消费方参考契约，独立库命令不执行它们。
- `migration/materials/source/frontend`：其他应用完整源码及 auth/business-core 原始素材，待解耦；不在活动 workspace 内。
- `migration/reference/source`：固定时点参考，不代表当前运行状态。

T01 来源固定为 [Mang-X/Nerv-IIP](https://github.com/Mang-X/Nerv-IIP/tree/79b1578f2b75f55709765b5e7882aaf33146c603) 的 `79b1578f2b75f55709765b5e7882aaf33146c603`。分类、来源与逐文件 provenance 保留于 [迁移说明](migration/t01/README.md)，不随活动库演进改写。

本仓库保持私有；未选择新的发行许可，未授权公开发布。第三方来源、Evaluation 声明与限制见 [来源与限制](migration/t01/README.md#第三方来源与限制)。本地、浏览器、CI、发布和原库接入证据分别报告。

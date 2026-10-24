# nerv-ui

从 Nerv-IIP 提取的 Vue UI 系统，覆盖桌面、触屏、移动、大屏、文件上传/预览、排程、应用壳、主题和设计文档。

当前完成 T01 原样复制基线，并在 [T02 / #3](https://github.com/Mang-X/nerv-ui/issues/3) 提供可独立安装、启动和构建的桌面 playground。[T03 / #4](https://github.com/Mang-X/nerv-ui/issues/4) 在同一宿主增加独立触屏演示：启动后访问 `/#touch`，或从桌面页点击“触屏演示”。五个现有公开组件使用中性内存数据，操作说明与证据见 [T03 验证记录](docs/evidence/t03/README.md)。[T04/N01 / #45](https://github.com/Mang-X/nerv-ui/issues/45) 恢复移动包并增加 `/#mobile` 的页壳导航 11 件演示，接入与后续分工见 [独立移动接入](docs/mobile-standalone.md)。完整迁移由 [母票 #1](https://github.com/Mang-X/nerv-ui/issues/1) 跟踪；其他表面、完整文档站和版本化安装产物尚待后续票验证。

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend dev
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend build
```

Node >=22.18，pnpm 11.22.0；具体命令、CSS 接入、workspace 恢复责任与测试分工见 [独立桌面接入](docs/desktop-standalone.md)，实际证据见 [T02 验证记录](docs/evidence/t02/README.md)。宿主通过 `workspace:*` 消费公共 `@nerv-iip/ui`，不需要 Nerv-IIP checkout、生成 SDK 或后端；版本化产物安装属于 #11。

[T04/N02 / #46](https://github.com/Mang-X/nerv-ui/issues/46) 的输入、扫码与数字键盘从 `/#mobile-input` 直接访问，也可由 `/#mobile` 点击“随心记录”进入。12 件公开组件使用中性内存状态，保留其它入口；扫码在编辑表单或打开浮层时让出焦点。行为、字符串输入约束和浏览器/设备证据边界见 [移动接入](docs/mobile-standalone.md#输入扫码与数字键盘n02)。

- `frontend/packages/ui`、`frontend/packages/ui-mobile`、`frontend/apps/playground`：当前活动 workspace。
- `frontend/packages/{app-shell,scheduling}`、`frontend/apps/design-system`：保留的候选源码，待 #9/#8/#10 恢复参与安装和聚合命令。
- `frontend/DESIGN` 与 `DESIGN.md`：设计规则和资料；独立库增量决策优先回到当前接入文档。
- `frontend/reference-tests`：旧库消费方参考契约，独立库命令不执行它们。
- `migration/materials/source/frontend`：其他应用完整源码及 auth/business-core 原始素材，待解耦；不在活动 workspace 内。
- `migration/reference/source`：固定时点参考，不代表当前运行状态。

T01 来源固定为 [Mang-X/Nerv-IIP](https://github.com/Mang-X/Nerv-IIP/tree/79b1578f2b75f55709765b5e7882aaf33146c603) 的 `79b1578f2b75f55709765b5e7882aaf33146c603`。分类、来源与逐文件 provenance 保留于 [迁移说明](migration/t01/README.md)，不随活动库演进改写。

本仓库保持私有；未选择新的发行许可，未授权公开发布。第三方来源、Evaluation 声明与限制见 [来源与限制](migration/t01/README.md#第三方来源与限制)。本地、浏览器、CI、发布和原库接入证据分别报告。

[T04/N03 / #47](https://github.com/Mang-X/nerv-ui/issues/47) 的 8 件选择与浮层从 `/#mobile-overlays` 直接访问，或在 `/#mobile` 点击“片刻安排”。示例展示草稿确认/取消、动作身份、滚轮与日期、下拉单开、折叠和抽屉内数字键盘；接入与证据见 [独立移动接入](docs/mobile-standalone.md#选择与浮层n03)。

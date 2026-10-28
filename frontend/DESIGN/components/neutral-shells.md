## 决策与来源

R01 复用 `NvAppShellInset` 的折叠、侧栏与 header 槽，以及 NvButton/NvDropdownMenu/NvBadge。仅演示侧栏与顶部溢出两种已有来源排列；菜单、虚拟位置、用户和动作归宿主。无新导出、token、CSS 或搜索服务。

来源固定 SHA `79b1578f2b75f55709765b5e7882aaf33146c603`：候选 `frontend/packages/app-shell/src/AppShell.vue`、`AppShellT.vue`、`NavMain.vue`、`NavSide.vue`、`NavTopDomains.vue`、`NavUser.vue`（T01 活动复制）；原应用 `migration/materials/source/frontend/apps/business-console/src/layouts/BusinessLayout.vue` 及 console `DefaultLayout.vue`。固定参考位于 `migration/reference/source`；素材原字节未改。

### 使用规则

- 路由、权限过滤、用户与实际退出只由宿主管理。禁用项保留原生 disabled 行为。
- stable key 不使用 label 或位置；替换和重排不迁移当前身份。
- 用户菜单只扩展具名动作，不把整个业务 payload 显示给用户。
- 新应用需要完整路由壳时，先评估 #9 的候选包恢复；本票不宣布该包已独立可用。

### 直接消费者处置

| 来源消费者                                     | 本票处置                                              |
| ---------------------------------------------- | ----------------------------------------------------- |
| console DefaultLayout                          | 仅对照品牌、用户、header 与退出组合；认证和权限不迁入 |
| business-console BusinessLayout                | 仅对照域导航与用户扩展动作；上下文、通知和 SDK 不迁入 |
| AppShell / NavMain / NavUser 的候选测试        | 保留原样，不冒称活动测试已覆盖它们                    |
| AppShellT / NavSide / NavTopDomains 的候选测试 | 保留原样；本票 host 测试独立运行，不恢复候选包        |
| playground / 文档 live                         | 直接消费本票 host 组合与公共 UI 主桶                  |

旧应用接入与旧库退出 NOT_PLANNED。许可 UNKNOWN；本页不构成来源视觉一致性证明。

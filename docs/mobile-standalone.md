# 独立移动页壳与导航

[T04/N01 / #45](https://github.com/Mang-X/nerv-ui/issues/45) 恢复 `@nerv-iip/ui-mobile` 参与独立 workspace。`pnpm -C frontend dev` 后直接访问 `/#mobile`，桌面入口和 `/#touch` 仍保留。Node >=22.18、pnpm 固定 11.22.0；全局版本不匹配时可用 task-local PATH shim 转发 `corepack pnpm@11.22.0`，nested scripts 同样使用该 PATH。

宿主“周末随行”仅使用本地中性数据。组件从裸 `@nerv-iip/ui-mobile` 导入；主题 composable 从 `@nerv-iip/ui` 导入。没有路由库、认证、API-client、原 PDA 路径或服务端依赖。

## 样式接入

```css
@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;
@import '@nerv-iip/ui/styles.css';
@import '@nerv-iip/ui-mobile/styles/mobile.css';
```

两条均为公共 exports，由 Tailwind v4 处理。移动入口保留原有 `pt-safe`、`pb-safe`、`px-safe`、`min-h-touch`、`min-h-row` utilities，并在包内用 `@source '../'` 扫描移动源码；消费者不配置指向旧树或私有 `src` 的扫描路径。宿主 viewport 声明 `viewport-fit=cover`。token 和八层 CSS 顺序保留，宿主样式位于 `app` 层。

`NvAppShellMobile` 使用 `h-dvh`、固定 header/footer 和独立纵向滚动 main。宿主给 shell 加 `relative`，通过 FAB 公开 `class` 预留导航和安全区；内容尾部留出操作空间。安全区 env 的非零值仍需实体设备验证，Chromium 视口不能证明硬件安全区。

## 本组覆盖

| 公开件                  | 中性宿主接缝                                     |
| ----------------------- | ------------------------------------------------ |
| `NvAppShellMobile`      | header / main / footer、安全区、独立滚动         |
| `NvNavBar`              | 标题、主题 slot、返回发现页的 `back` 事件        |
| `NvTabBar`              | 发现/收藏受控导航，`update:modelValue`           |
| `NvCell`、`NvCellGroup` | 出行信息、键盘/点击选择和信息项                  |
| `NvListRow`             | 按标签替换的 keyed 去处列表，`select` 与收藏回看 |
| `NvMobileTabs`          | 湖畔/小径受控标签，`update:modelValue`           |
| `NvMobileSteps`         | 三步进度、上界禁用与重置                         |
| `NvMobileGrid`          | 四列快捷入口，`select(item, index)` 身份回显     |
| `NvFab`                 | 单动作 `click` 和速拨 `select(action, index)`    |
| `NvMobileDivider`       | 有文案和无文案分隔线                             |

FAB 的现有 `text` 属性现在也作为主按钮的 `aria-label`，速拨模式仍显示图标。新增公共行为回归覆盖其名称、单次事件身份和关闭状态；这是从 T01 候选来源上的可访问性适配。原库当前未回传；由后续旧库接入票评估同步，不改写 T01 provenance。

## 验证与后续责任

移动 `test` 保留全部组件行为套件及命名/runtime 契约，只将静态文档覆盖分类到 `test:docs`，与 UI 包分工一致。静态 docs 证明已有资料可发现，不表示 48 件已独立动态验收。原业务消费者扫描仍保留在 `frontend/reference-tests`，由旧仓消费者接入票维护；本票无需改其断言。

```sh
pnpm -C frontend --filter @nerv-iip/ui-mobile exec vp test run src/components
pnpm -C frontend --filter @nerv-iip/ui-mobile exec vp test run src/nvui-naming.contract.test.ts
pnpm -C frontend --filter @nerv-iip/ui-mobile test:docs
pnpm -C frontend --filter @nerv-iip/ui test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend --filter @nerv-iip/playground test
pnpm -C frontend build
```

后续 [#46](https://github.com/Mang-X/nerv-ui/issues/46) 输入扫码、[#47](https://github.com/Mang-X/nerv-ui/issues/47) 浮层、[#48](https://github.com/Mang-X/nerv-ui/issues/48) 手势列表、[#49](https://github.com/Mang-X/nerv-ui/issues/49) 反馈媒体在本宿主接续，其余 37 件候选源码保留。父 #5 等五组完成；T08 更高业务组合、#10 完整文档站、#11 产物安装、#14 原 PDA 接入各自独立。本票没有完成这些验收，也不处理 #43。

具体 fresh / 继承 / UNRUN 和依赖核验见 [N01 证据](evidence/t04-n01/README.md)。

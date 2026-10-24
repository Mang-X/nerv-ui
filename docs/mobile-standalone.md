# 独立移动接入

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

N02 输入扫码接入见下文。后续 [#47](https://github.com/Mang-X/nerv-ui/issues/47) 浮层、[#48](https://github.com/Mang-X/nerv-ui/issues/48) 手势列表、[#49](https://github.com/Mang-X/nerv-ui/issues/49) 反馈媒体在本宿主接续，其余 25 件候选源码保留。父 #5 等五组完成；T08 更高业务组合、#10 完整文档站、#11 产物安装、#14 原 PDA 接入各自独立。本票没有完成这些验收，也不处理 #43。

具体 fresh / 继承 / UNRUN 和依赖核验见 [N01 证据](evidence/t04-n01/README.md)。

## 输入、扫码与数字键盘（N02）

[#46](https://github.com/Mang-X/nerv-ui/issues/46) 从 `/#mobile-input` 直接进入“随心记录”，也可从 `/#mobile` 的入口导航进入。`MobileInputDemo.vue` 负责页面与表单焦点协调；`mobile-input/MobileInputFields.vue` 持有中性表单状态，`MobileCaptureInput.vue` 持有扫码回显、浮层与数字键盘生命周期。全部组件使用裸包导出及 N01 已恢复的公共样式，未增加依赖或 importer。

| 公开件                                    | 中性宿主交互                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `NvScanBar`                               | 手工编码 / 键盘楔入、Enter 提交并清空、计数与最后值；持续接收开关                                       |
| `NvMobileInput`                           | 受控标题、原生 `id/name/maxlength/autocomplete` 与事件透传、leading/trailing slots；readonly 数值触发器 |
| `NvSearchBar`                             | 输入与 Enter 检索；清空触发 `search('')`，取消由宿主恢复全量                                            |
| `NvMobileRadioGroup`、`NvMobileRadioItem` | 受控选择、keyed 选项重排后的方向键焦点/值、宿主外部重置                                                 |
| `NvStepper`                               | 按钮上下界、数值编辑与 blur 夹取；不将原有“编辑中先发原始数字”改为即时夹取                              |
| `NvMobileSwitch`、`NvMobileCheckbox`      | 提醒、持续接收和评分/进度锁定，事件反映到 DOM                                                           |
| `NvMobileRate`、`NvMobileSlider`          | 半星、再次选择清零、readonly；拖动、方向键、步长与禁用                                                  |
| `NvMobileButton`                          | 现有五种 variant、三种 size、block、原生 disabled、真实保存/重置事件；没有新增 loading API              |
| `NvNumberKeyboard`                        | 字符串保留前导零、小数去重、删除、X/隐藏扩展键、独立正负号、追加长度上界、press/confirm 回显            |

扫码 `active` 由宿主显式计算：其它输入、单选、复选、开关或滑块及表单区域的按钮持有焦点，以及 BottomSheet、Dialog、数字键盘打开期间均为 false。关闭浮层或离开编辑后恢复，用户关闭持续接收则保持停用。`active=false` 取消回焦并放弃未消费的 document 捕获残片，手工草稿保留；它不等于把输入框设为 disabled，也不禁止用户主动在扫码框手工提交。既有 100ms 突发间隔、300ms 新鲜度/空闲清理、捕获至少 3 字符及原生 input 所有权转移均保留，未为了演示改写扫码实现。

数值输入使用真实 `readonly inputmode="none" autocomplete="off"`，通过 click、Enter 或 Space 打开已有键盘，不在 focus 时自动打开，避免确认后回焦又重开。键盘 `maxlength=6` 只限制追加，正负号仍遵循原有独立切换语义，可使总长度超过 6；`press` 也记录被重复小数或长度上界拒绝的按键。确认事件没有值参数，由宿主读取当前受控字符串；点背板关闭不伪造 confirm。抽屉内唤起键盘后，确认只收起键盘，抽屉与草稿保留；宿主关闭抽屉（含 Escape）会同步关闭键盘。

本票发现并先 RED 后修复 `NvMobileSlider` 的窄缺陷：拖动中宿主更新 `disabled=true` 时，旧 `pointermove` 仍发出新值。仅添加移动期间的 disabled 守卫，公开回归覆盖禁用期间不发值与重新启用后的新手势。来源仍为 T01 固定提交；本票未回传旧库，由 #14 接入时评估同步。其它移动实现保持基线字节，N01 的改动作为已集成来源保留。

保留边界：浏览器向现有 Reka 单选组件连续发送无按住间隔的方向键 keyDown/keyUp 时，曾出现焦点已移动、选中值尚未改变；等待其异步焦点处理后再释放则两者一致。原始失败与成功边界分别保留，继承问题单列 [#51](https://github.com/Mang-X/nerv-ui/issues/51)，本票未修该底层竞态，也不把只发 keydown 的测试当作快速释放序列通过。

验证记录、原始失败、资源身份和截图见 [N02 证据](evidence/t04-n02/README.md)。浏览器验证实际 DOM 配置、键盘事件和浮层触点，不能证明物理 PDA、扫码枪、系统软键盘不弹、非零安全区或 #11 安装产物已验收。N03–N05 与父 #5 仍由各票单独完成。

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

## 选择与浮层（N03）

[#47](https://github.com/Mang-X/nerv-ui/issues/47) 的独立入口为 `/#mobile-overlays`，也可从 `/#mobile` 点击“片刻安排”。桌面、触屏、页壳与输入入口仍保留。`MobileOverlayDemo.vue` 只组合页面；`mobile-overlays/OverlaySelections.vue` 持有去处/日期，`OverlayPanels.vue` 持有安排/提醒草稿与键盘生命周期，`OverlayDetails.vue` 持有动作、下拉和折叠状态。全部从裸包导入，复用已有公共移动 CSS，没有业务查询、认证、路由库或新依赖。

| 公开件                                             | 中性受控接缝                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NvBottomSheet`                                    | 备注/时长草稿，确认保存，取消、遮罩、Escape、把手下拖放弃；抽屉关闭同步关闭数字键盘 |
| `NvActionSheet`                                    | 动作重排后仍回传稳定 `value`，danger 外观，取消不触发 `select`                      |
| `NvPicker`                                         | 单列滚轮，确定才写值，取消不提交；空选项确认不发值；宿主重排与恢复选择              |
| `NvMobileDatePicker`                               | `YYYY-MM-DD`，2023–2025 年界，月末随年月夹取，确认与取消分离                        |
| `NvMobileDialog`                                   | 提醒默认模态，确认提交 slot 输入，取消记录 `cancel`，Escape 只关闭；键盘焦点与恢复  |
| `NvMobileDropdownMenu`、`NvMobileDropdownMenuItem` | 同组单开、遮罩关闭、字符串/数字值与 `change` 类型回显                               |
| `NvMobileCollapse`                                 | 宿主受控展开、标题与内容 slots、内容按钮外部收起                                    |

上述八件没有公开的 loading 或 disabled 选项能力，本例不新增这类 API。空选项沿用 Picker 的既有行为：保留当前值且不提交；日期上下界指年份，未新增日期级 min/max。下拉面板与遮罩是组内绝对定位，不是 Teleport 弹窗；宿主避免用 `overflow-hidden` 截断它们。

本组公开回归先复现并窄修两个选择器问题：初始 `open=true` 的滚轮未定位、打开期间外部值/选项变更未同步；日期切换年月可能提交不存在的月末日。Picker 以稳定值保留重排前的草稿，移除草稿项时回退到外部值或首项；外部 `modelValue` 更新重新定位。DatePicker 将草稿夹取到现有年界及合法月末，滚动和外部变更均不提前提交。日列自身滚动只更新草稿，保留原生 scroll-snap；仅年月变化校正日列位置。来源是 T01 固定提交上的活动源码；不改迁移 provenance，未回传旧库，由 #14 接入时评估同步。

`MOBILE_OVERLAY_TARGET` 不提供时使用 body，提供 selector 或 HTMLElement 时浮层挂到指定目标；测试覆盖两种注入形式及关闭后的移除。注入只改变挂载位置，固定定位浮层的几何约束仍由宿主容器决定。抽屉内复用现有 `NvNumberKeyboard` 优先输入层，按键和键盘遮罩不会被误当为抽屉外点击；宿主关闭抽屉或离开页面清理全部浮层。

实际门禁、原始 RED/失败、四态浏览器与资源身份见 [N03 证据](evidence/t04-n03/README.md)。本组不重做 N02 扫码/输入，不修 #51 或 #43，不提前验收 N04/N05、父 #5、T08 组合、#11 产物安装或物理设备/软键盘/触摸手势。

## 手势、列表与轮播（N04）

[#48](https://github.com/Mang-X/nerv-ui/issues/48) 从 `/#mobile-lists` 进入“翻阅时光”，既有桌面、触屏、页壳、输入和浮层五个入口都提供导航。页面使用裸包及上文公共样式，五个宿主分片各自持有动作、刷新、分页、虚拟列表选择和轮播状态；没有原 PDA 页面、业务 API 或 SDK。

| 公开件                     | 宿主行为与能力边界                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NvSwipeCell`              | 右侧书签/收起动作，左滑展开、右滑关闭，`select(value)` 回显并关闭；没有左侧动作槽或受控 open API                                                                   |
| `NvPullRefresh`            | 自有 256px 滚动容器，顶端起手拉过阈值才刷新；宿主 650ms 模拟成功或一次失败，完成后清除 loading，失败保留原数据并允许重拉；取消不刷新；“立即更新”由宿主触发 loading |
| `NvInfiniteList`           | 自有 256px 滚动区触底加载，每批 8 封、共 24 封；受控 loading 防重复，失败后 paused，宿主重试、结束、清空/首批、重置取消待处理请求                                  |
| `NvVirtualList`            | 1000 条固定 48px 数据、240px 容器、buffer=2，实际滚动只渲染窗口；宿主以 item.id 记住选择，倒序仍保留所选身份，支持空输入                                           |
| `NvSwiper`、`NvSwiperItem` | 三页中性文字，受控 index、手势 change、loop、1600ms autoplay、外置圆点和无背板；宿主按钮在非 loop 端点禁用；组件没有 disabled API                                  |

取数策略、错误模拟和选择状态都属于宿主；刷新/分页定时器随所属分片卸载取消，轮播的 autoplay 由组件卸载清理。虚拟列表外层仍按 index 复用，未添加 itemKey API；有局部状态的行可在 slot 内用业务无关的稳定 item.id 设置 key。这里展示选择身份，不提供 #35 的更高层列表恢复。

本票先复现再最窄修复五个行为缺陷：Swiper 外部 index 未同步轨道位移；PullRefresh 将 pointercancel 当作松手刷新；PullRefresh 非顶端起手的手势回顶后误刷新；VirtualList 只在 mount 测量容器而无法响应高度改变；PullRefresh 的 `pan-y` 使浏览器在向下拉动时接管并取消指针。补充 index watcher、刷新取消/起手资格守卫、顶端 `pan-x pan-down`（滚动离顶后恢复 `pan-y`）及 ResizeObserver/卸载清理，没有增加公共 API、依赖或设计 token。来源为 T01 固定提交 `79b1578f2b75f55709765b5e7882aaf33146c603`，其余三个组件实现保持字节不变；冻结 migration 素材和 provenance 保留，未回传旧库，由 #14 评估同步。

独立 R1 拒绝后补修两项：Swiper 在外部 index 变化时同时同步位移与指针坐标两个拖动基准，外部页本身不发 change，短拖松手沿用一次 change(当前页)，不额外发 update:index；PullRefresh 在 loading 变化时撤销旧手势并保持 loading 提示，松手再次检查 loading，完成后回弹并允许新拉动。宿主的“立即更新”按钮提供公开的外部刷新入口；请求计数未设额外 guard 掩盖组件重复事件。F1 是新增回归，F2 是本票承诺的继承验收缺口；两项修复与新产物验证见 [R1 修复证据](evidence/t04-n04/f1-f2/README.md)。

精确测试名、原始失败、fresh 浏览器输入方式、资源响应身份与限制见 [N04 证据](evidence/t04-n04/README.md)。本票不验收 N05/#49、#35 列表恢复、#11 版本化产物安装或物理触摸设备，不处理 #43/#51。

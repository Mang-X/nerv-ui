# 大屏 / 远距显示组件层 · 产品定位（product.md）

> `@nerv-iip/ui` 的 `screen/` 层 —— 公共空间、展馆、运营中心和控制室等远距显示表面的组件库。独立深色「工业蓝」令牌（`--nv-scr-*`），只遵循统一设计哲学，**不复用** PC/移动的浅色令牌。AI 编码与人工开发在改动本层前先读本文件。

## 一句话定位

给数米外观看的公共展示屏、投影与 LED 拼接屏使用的通用组件 —— 远距可读、克制发光、冷静清晰。领域数据、时间与语义由宿主提供；MES 是兼容场景之一。

## 受众与场景

- **观看者**：访客、观众、值班人员，数米外扫视，不近距离阅读。
- **操作者**：控制室操作台少量交互（按钮 / 开关 / 筛选 / 搜索），鼠标或触控。
- **环境**：公共展示空间或控制室，可能长时间常亮，避免大面积亮色刺眼。
- **硬件**：大尺寸 LED / 拼接屏，高亮度、可能有像素间距。
- **与 PC/移动的区别**：观看距离更远 → 字号更大、辉光点缀关键数据；环境更暗 → 固定深色不跟随亮暗。因此独立成层。

## 设计原则

1. **克制发光** —— 青色（cyan）辉光只给「活数据」（实时值、运行态）；标题、坐标轴、静态文字不发光。
2. **远距可读** —— 关键数字使用大字号 + 克制的 `text-shadow` 辉光；次要信息降噪（`--nv-scr-muted` / `--nv-scr-faint`）。
3. **独立深色令牌** —— 只用 `--nv-scr-*`，不混入共享 `--*`；无亮色模式。
4. **动效统一、减速无回弹** —— 见下方动效契约，手感与 PC/移动完全一致。
5. **数据驱动** —— 已有零属性示例和默认值保留兼容；新接入显式提供本场景的数据、标签与时间，不把默认工业示例当作业务事实。

## 动效契约（与全系统统一）

大屏视觉独立，但**动效语言必须和 PC/移动同源** —— 同一种「高级减速、绝不回弹」的手感（见 `theme.css` 中的 `_No bounce/elastic; premium motion decelerates_`）。

| 用途                                  | 令牌                       | 值                              | 对应系统令牌          |
| ------------------------------------- | -------------------------- | ------------------------------- | --------------------- |
| 日常过渡（颜色 / 边框 / 位移 / 勾选） | `--nv-scr-ease`            | `cubic-bezier(0.25, 1, 0.5, 1)` | `--nv-ease-out-quart` |
| 强调（大位移 / 数据增长 / 进出）      | `--nv-scr-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | `--nv-ease-out-expo`  |

**时长** —— 沿用 PC 层惯例，行内书写；**不引入大屏层（screen）专属时长令牌**，以免和专业层（pro，同样行内）产生新的不一致：

- 按压（press）反馈 ≈ `0.12s`；控件过渡 `0.15–0.22s`；滑动 / 展开 `0.26–0.28s`；数据增长 `0.6s`。

**按压（press）反馈** —— 收缩、绝不膨胀、绝不位移、绝不回弹：

- 按钮 `:active` → `scale(0.985)`（纯缩放；大屏上**不做**垂直位移，`translateY` 在暗底看着像跳动）
- 开关手柄 `:active` → `scale(0.86)`（同 `NvSwitch`，**收缩**而非膨胀）
- 勾选类如有 → `scale(0.88)`（同 `NvCheckbox` / `NvRadioGroupItem`）

**滑动指示** —— 分段（`ScreenSegmented`）与标签（`ScreenTabs`）使用滑动滑块（thumb）/下划线（`--nv-scr-ease-emphasized`），与 PC 的滑动语言一致；滑块从激活项**实测宽度**定位，**不做**硬背景切换。

**浮层** —— 下拉 / 弹层（`ScreenSelect` 等）必须通过 `Teleport` 传送至 `<body>`，并以 `position:fixed` 锚定触发器，否则会被 `ScreenPanel` 的 `overflow:hidden` 裁掉。

**循环类** —— 状态灯呼吸、流光分割、水位波浪使用 `ease-in-out` 或 SVG SMIL；`prefers-reduced-motion` 一律停。

**铁律**

- ❌ 不用 bounce / elastic / spring / overshoot —— 不得出现任何回弹。
- ❌ 不自创第四条缓动曲线 —— 只 `--nv-scr-ease` 与 `--nv-scr-ease-emphasized`。
- ✅ 每个会动的元素都要有 `@media (prefers-reduced-motion: reduce)` 降级。

## 颜色语义

| 令牌                                         | 值        | 用途                     |
| -------------------------------------------- | --------- | ------------------------ |
| `--nv-scr-cyan`                              | `#00e5ff` | 活数据、主强调、运行辉光 |
| `--nv-scr-indigo`                            | `#a78bfa` | 计划值 / 次要序列        |
| `--nv-scr-green`                             | `#00e676` | 运行 / 达成 / 正常       |
| `--nv-scr-amber`                             | `#ffd600` | 待机 / 预警              |
| `--nv-scr-red`                               | `#ff1744` | 报警 / 异常 / 越限       |
| `--nv-scr-text` / `-2` / `-muted` / `-faint` | 白 → 灰阶 | 主 / 次 / 弱 / 极弱文字  |

底色：`--nv-scr-bg #080c16`、`--nv-scr-panel-a/b` 面板渐变、`--nv-scr-line/-2` 发丝边、`--nv-scr-divider` 分隔。

## 组件清单

真实导出以同目录 `index.ts` 和主桶为准，共 42 件组件；下表用于导航，不替代公开 API。

| 分类                    | 当前公共导出                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 舞台 / 容器 / 外壳（9） | `NvScreenScaler` · `NvScreenLayout` · `NvScreenPanel` · `NvScreenScrollArea` · `NvBorderPanel` · `NvTechFrame` · `NvTitleBar` · `NvScreenHeader` · `NvGlowDivider`                                            |
| 指标 / 图表（11）       | `NvOeeHero` · `NvRingGauge` · `NvCapsuleBar` · `NvDigitalFlop` · `NvSparkline` · `NvScreenTrendChart` · `NvScreenBarChart` · `NvScreenDonut` · `NvScreenPareto` · `NvTaktGantt` · `NvScreenHeatmap`           |
| 数据 / 状态（10）       | `NvScreenSummaryCard` · `NvScreenStatusCard` · `NvScreenFreshness` · `NvKpiBar` · `NvAlarmTable` · `NvScreenStatusLight` · `NvScreenStatusHero` · `NvScreenStatusTag` · `NvScrollBoard` · `NvScreenStageFlow` |
| 控件（9）               | `NvScreenButton` · `NvScreenInput` · `NvScreenSelect` · `NvScreenSearch` · `NvScreenTable` · `NvScreenTabs` · `NvScreenSegmented` · `NvScreenSwitch` · `NvScreenPagination`                                   |
| 装饰背景（3）           | `NvScreenFlowLinesBg` · `NvScreenIsometricBlocksBg` · `NvScreenFusionBg`                                                                                                                                      |

工具与类型为 `computeScale` / `ScaleMode` / `Scale`、`useScreenData` / `UseScreenDataOptions` / `UseScreenDataReturn`。历史清单中的 WaterLevel 没有当前实现或导出，不计为活动能力。

**容器策略**：裸内容组件（`NvOeeHero` / `NvRingGauge` / `NvCapsuleBar` / `NvDigitalFlop` / `NvSparkline` / `NvKpiBar`）放进 `NvScreenPanel`；自带容器的图表和摘要可直接使用。

独立运行从 playground 的 `/#screen` 或 `/#screen/stage` 进入，A01 只展示 7 件外壳；后续六组按 #59–#64 扩充。接入、溢出和证据边界见 [大屏独立接入](../../../../../../docs/screen-standalone.md)。组件 API 页仍由设计系统文档站维护，完整文档站运行属于 #10。

## 应做 / 禁止（禁止更重要）

**禁止**

- ❌ 别在大屏层（screen）使用共享 `--*` 令牌 —— 一律使用 `--nv-scr-*`。
- ❌ 别给静态文字 / 标题 / 坐标轴加辉光 —— 辉光只属于活数据。
- ❌ 别加亮色模式 —— 本层固定深色。
- ❌ 别用回弹动效，别自创缓动曲线。
- ❌ 别堆叠 `backdrop-filter` / 大面积高斯模糊 —— 大屏渲染环境吃不消，用半透明渐变 + 发丝边模拟材质。
- ❌ 别用大数字模板 / 侧边色条 / 渐变文字 —— 与整体设计哲学冲突。

**应做**

- ✅ 数据增长 / 大位移用 `--nv-scr-ease-emphasized`，其余用 `--nv-scr-ease`。
- ✅ 按压（press）反馈对齐专业层（pro）的 scale 体系（收缩、无回弹）。
- ✅ 使用宿主明确提供的真实场景值或中性内存数据看效果，不推断行业含义；历史工业默认值保持兼容。

[阶段数量流](../../../../../apps/design-system/docs/components/screen/stage-flow.md)展示显式阶段数量、状态与连接符，窄容器换行；中性宿主见 `/#screen/stage-flow`。

[分档热力格](../../../../../apps/design-system/docs/components/screen/heatmap.md)展示宿主时标、数值与显式分档；中性双来源见 `/#screen/heatmap`。

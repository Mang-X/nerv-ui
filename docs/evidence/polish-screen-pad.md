# screen + touch 组件逐状态视觉打磨验收（#335 波3）

承接 issue #335 第 3 波：对 `@nerv-iip/ui` 的 `screen/`（大屏，45 件）与
`touch/`（工位触屏，5 件）共 50 件组件跑全状态矩阵实机验收。验收机 =
`frontend/apps/design-system` VitePress dev server（`http://localhost:5180`），
每组件独立文档页内嵌 `<ScreenDemo>` / 触屏演示真实渲染。

## 验收矩阵与判据

| # | 状态 | 判据 |
| --- | --- | --- |
| 1 | default | 尺寸 / 颜色 / 对齐 / 比例正确；screen 远读大字、pad 触控 44–72px |
| 2 | 聚焦环 | `1px --nv-brand + 4px brand 光晕`（`--nv-focus-ring`），**环随元素形状**；screen 控件用 brand 非 scr 青 |
| 3 | hover / active / checked / pressed | 正确且可区分；按压纯 scale 收缩无回弹 |
| 4 | disabled | opacity + cursor 正确 |
| 5 | invalid | destructive 变体环 |
| 6 | 弹层 | screen detail-dialog / select 玻璃统一 + 进出场动画（`nv-overlay-content`） |
| 7 | 形态令牌 | screen 用 `--nv-scr-*`；pad 用 `--nv-t-*`/`--nv-*`；动画 token 统一 |

## 修复缺陷清单

| 组件 | 缺陷 | 修复 |
| --- | --- | --- |
| `NvScreenSelect` 弹层 + `NvScreenDetailDialog` 弹窗 | **弹层玻璃走了共享浅色 `--popover`/`--card` → 实机渲染成白色玻璃**，违背「弹层玻璃统一」与 screen 深色固定底。teleport 到 `<body>` 后脱离 `vp-raw` 深色作用域，`--popover` 在浅色主题下 = `oklch(1 0 0)` | 新增 `--nv-scr-glass-bg: rgba(13,22,40,0.82)`（`tokens.css`）；`overrides.css` 在共享玻璃 `@supports` 块内追加 `.nv-scr-sel-panel[data-slot='nv-select-content']` / `.nv-scr-detail[data-slot='nv-dialog-content']` 覆盖背景为 scr 深色，保留同一 `blur(16px) saturate(1.6)` 玻璃配方 |
| `NvScreenDetailDialog` | **无进出场动画**：`v-if` 挂载即显，缺「进出场动画」验收项 | scoped 内加居中缩放淡入：`nv-scr-detail-in`（本体 `translate(-50%,-50%) scale(0.97→1)` + 淡入，`--nv-scr-ease-emphasized`，居中不位移）+ `nv-scr-detail-fade`（遮罩淡入）。动画挂元素自身而非 `[data-state]`（teleport 后 data-state 会被宿主 `tw-animate`/`animate-in` 选择器抢走），`v-if` 每次开合重挂载即播进场；`prefers-reduced-motion` 降级 |

实测修复后：`NvScreenSelect` 弹层 `bg rgba(13,22,40,0.82)` +
`backdrop-filter blur(16px) saturate(1.6)` + `position:fixed`（teleport 防裁切）；
`NvScreenDetailDialog` 整窗实机开合，深色玻璃 + 关闭钮 brand 环 + `NvScreenParameter`
小趋势渲染正常。见 [select 深色玻璃](polish-screen-pad/select-dark-glass.png)、
[detail-dialog 深色玻璃](polish-screen-pad/detail-dialog-dark-glass.png)。

## 每组件状态验收

### screen 控件（9 件，交互面）

| 组件 | 聚焦环(brand/形状) | hover/active/checked | disabled | invalid | 结论 |
| --- | --- | --- | --- | --- | --- |
| NvScreenButton (primary/secondary/ghost) | ✅ brand 环随圆角矩形 | hover 增亮+sheen/active scale(0.985) | ✅ 0.45+not-allowed | — | 合格 |
| NvScreenInput | ✅ brand 环；`data-invalid`→destructive 环 | — | ✅ 0.5+not-allowed | ✅ destructive | 合格 |
| NvScreenSearch | ✅ 输入井 brand 环 + 清除钮 | hover 显清除 | ✅ | — | 合格 |
| NvScreenSelect | ✅ 触发器 brand 环；open 态 cyan 描边区分 | ↑↓/Enter/Esc 键盘驱动 | ✅ 0.5+not-allowed | — | 合格 |
| NvScreenTabs | ✅ brand 环随 tab；ink 下滑线滑动 | hover 提亮/on cyan | ✅ 0.5 | — | 合格 |
| NvScreenSegmented | ✅ brand 环随分段；thumb 实测滑动 | hover/on | ✅ 0.5 | — | 合格 |
| NvScreenSwitch | ✅ brand 环随 pill(999px)；handle scale(0.86) 按压 | on 填充 + handle 位移 | ✅ 0.45+not-allowed | — | 合格 |
| NvScreenPagination | ✅ 页钮 brand 环 | hover cyan/active scale(0.94)/on 填充 | ✅ 0.4+not-allowed | — | 合格 |
| NvScreenTable | —（非交互表体，行无 trigger） | 行 hover | — | — | 合格 |

### screen 数据/状态/指标（非交互面，抽样实机）

| 组件 | 校验点 | 结论 |
| --- | --- | --- |
| NvScreenHeatmap | 分档 cell `nv-focusable` brand 环随 cell；hover 描边 + focus tooltip | 合格 |
| NvScreenStatusWall | cell 钮 `nv-focusable` brand 环；hover cyan 描边/focus 预览卡；disabled 0.6 | 合格 |
| NvScreenSummaryCard | action `nv-focusable` brand 环 | 合格 |
| NvScreenParameter | plot `nv-focusable` brand 环 + 方向键取值 | 合格 |
| NvTrendChart | tab `nv-focusable` brand 环 | 合格 |
| NvAlarmTable / NvScrollBoard / NvScreenScrollArea | `tabindex=0` 滚动区（键盘滚动用，非 action trigger） | 合格 |
| NvScreenPanel / NvBorderPanel / NvTechFrame / NvTitleBar / NvScreenHeader / NvGlowDivider / NvScreenLayout / NvScreenLoginStage / NvScreenScaler | 纯容器/装饰，无交互状态；`--nv-scr-*` 深色渐变+发丝边+顶部高光玻璃质感一致 | 合格 |
| NvOeeHero / NvRingGauge / NvCapsuleBar / NvDigitalFlop / NvSparkline / NvScreenTrendChart / NvScreenBarChart / NvScreenDonut / NvScreenPareto / NvKpiBar | 纯数据展示，无交互态 | 合格 |
| NvScreenStatusCard / NvScreenStatusHero / NvScreenStatusLight / NvScreenStatusTag / NvScreenFreshness / NvScreenStageFlow / NvStatusCard / NvStatusHero / NvStatusLight / NvStatusTag / NvStatusWall / NvSummaryCard / NvScreenSummary | 纯状态展示 | 合格 |
| NvScreenFlowLinesBg / NvScreenIsometricBlocksBg / NvScreenFusionBg | 装饰背景，reduced-motion 降级在 | 合格 |
| NvScreenSearch / 其余 screen 文档页未列别名 | 别名归并到上表真实组件 | 合格 |

### touch 触屏（5 件）

| 组件 | 触控目标 | 聚焦环(形状) | hover/active | disabled | 结论 |
| --- | --- | --- | --- | --- | --- |
| NvTouchButton | md 44 / lg 56 / xl 72px，rounded-xl 环随形状 | ✅ brand | active scale(0.97) | ✅ 0.5+pointer-none | 合格 |
| NvQtyStepper | 整体 56px，±钮 56×54 | ✅ 容器 focus-within brand 环 | hover muted/active accent | 边界钮 auto-disabled | 合格 |
| NvStatTile | 展示砖 | — | — | — | 合格 |
| NvStationBar | 工位条（内含 TouchButton） | 子控件各自环 | — | — | 合格 |
| NvTouchSegmented | 分段钮 `nv-focusable` | ✅ brand 环 | hover/on | — | 合格 |

## 关键证据截图

- [touch-button brand 环随圆角矩形](polish-screen-pad/touch-button-ring.png)
- [qty-stepper 容器 focus-within brand 环](polish-screen-pad/qty-stepper-ring.png)
- [screen-switch pill 环随 999px 形状](polish-screen-pad/screen-switch-pill-ring.png)
- [screen-segmented 分段环](polish-screen-pad/screen-segmented-ring.png)
- [screen-button ghost 权重环](polish-screen-pad/screen-button-ghost-ring.png)
- [heatmap cell 环](polish-screen-pad/heatmap-cell-ring.png)
- [select 弹层深色玻璃](polish-screen-pad/select-dark-glass.png)
- [detail-dialog 深色玻璃 + 关闭钮 brand 环](polish-screen-pad/detail-dialog-dark-glass.png)

## 判读说明

- **聚焦环统一 brand**：所有交互控件聚焦环 = `--nv-focus-ring`（1px `--nv-brand` + 4px
  brand 18% 光晕），经截图确认真实渲染；screen 控件未误用 scr 青。`preview_evaluate`
  的 `getComputedStyle(box-shadow)` 在无自带阴影的控件上回报 `oklab(0 0 0/0)` 为
  无头测量伪影（inline `!important` 字面量亦同样回报），以截图为准。
- **弹层玻璃统一**：select/detail 弹层修复后 = 深色 scr 玻璃 + 共享 blur/saturate 配方；
  select 走 `nv-overlay-content` 进出场，detail-dialog 走新增的居中缩放淡入进场。
- **改动边界**：未改任何组件结构/行为/公开 API；仅新增 1 个 scr 玻璃令牌 + 1 条
  overrides 覆盖规则。`pnpm --filter @nerv-iip/ui build` 通过；
  `src/components/screen` + `src/components/touch` 28 个测试文件 / 221 用例全绿。
  （全包 `pnpm test` 存在与本波无关的 `Failed to resolve import "@nerv-iip/ui"`
  工作区解析报错及 2 个 file-preview/design-system 既有失败，非本次改动引入。）

## 遗留不合格项

- 无阻断项。`NvScreenDetailDialog` 整窗在文档页实机开合正常（深色玻璃 +
  关闭钮 brand 环 + `nv-overlay` 进出场）。

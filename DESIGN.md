# 设计

本文定义 Nerv-IIP 设计系统的视觉体系。仓库里并存两套**互不引用**的组件体系，各有自己的令牌事实源：

| 体系 | 令牌事实源 | 组件包 | 写法规范 |
| --- | --- | --- | --- |
| 新库 `@nerv-ui/*` | `frontend/packages/theme/src/tokens.stylex.ts`（StyleX 变量） | `packages/{desktop,mobile,pad,screen}` | `frontend/packages/CONVENTIONS.md` |
| 旧库 `@nerv-iip/*` | `frontend/packages/ui/src/styles/theme.css`（CSS 变量） | `packages/ui`、`packages/ui-mobile` | 各包 `AGENTS.md` |

不得硬编码数值，必须引用所属体系的语义令牌；不得跨体系引用令牌或组件。
新功能一律做进新库。

## 主题

两套体系共用同一套视觉语言（下文颜色/字体/动效/布局各节），差异只在实现载体：
新库把同一组值定义成 StyleX 变量，旧库定义成 CSS 变量。

工业控制台以深色为先（近黑基底），并通过 `<html>` 上的 `.dark` 类完整支持亮色模式。整体采用克制的 Vercel/Linear 工艺感：低色度表面、发丝级描边和单一动态强调色。配色策略为**克制**：带色倾向的中性色加一个品牌强调色。

## 颜色（OKLCH 语义令牌）

- 表面分三层，**层级靠亮度差表达，不靠描边**：`--background`（页面画布，最外层）→ `--card`（顶栏/侧栏/卡片/弹层）→ 控件填充 `--muted`（次级按钮、输入框底、表格头）。悬停/按下用 `--muted-strong`，比 `--muted` 再深一档；**不要用 `--muted` 当 hover**——次级按钮静止态就是 `--muted`，同值 hover 等于没有反馈。
- 三个层级之间的亮度差要够：亮色下 card(1.0) 与 muted(0.944) 差 0.056、muted 与 bg(0.972) 差 0.028；深色下反向镜像。差不到 0.02 就会「按钮和背景一个色」，此时正确的修法是拉开色阶，不是给控件补描边。
- 文本：`--foreground`（深色模式下接近白色）、`--muted-foreground`，以及用于强调的高对比度 `--*-strong` 变体。
- 品牌：`--brand` 是写入 `<html>` 的**运行时动态强调色**（默认为 `oklch(0.548 0.212 262)` 蓝色）；另有 `--brand-hover` / `--brand-foreground`。预设使用由 12 个等亮度色相组成的 OKLCH 色轮。
- 语义：`--success`、`--warning`、`--danger`（降低饱和度且固定，不参与动态强调色变化）。线条使用 `--border`、`--ring`。
- 规则：禁止在带色背景上使用灰色正文；文本应向墨色提高对比度。正文对比度必须 ≥4.5:1。
- 色相统一：所有中性色共用一个色相（亮色 258、文本 262），不混用无彩灰和有彩灰——混用会让顶栏、侧栏、正文看起来「不是一套」。

## 字体排印

- 字体族：以 Inter（无衬线）为基础；代码（WO-/WC-）和表格数字使用等宽字体。字体族不超过 3 种。
- 通过字号和字重建立层级（标题使用半粗体，正文使用常规字重）。展示文字的字间距 ≥ -0.04em；主视觉字号的 clamp 最大值 ≤6rem。标题使用 `text-wrap: balance`。
- 数字使用 `tabular-nums`。正文不得全部使用大写字母；大写仅用于短标签。

## 动效

theme.css 中的缓动令牌为：`--ease-out-quart`（通用）、`--ease-out-expo`（滑动/吸附/回弹）和 `--ease-in-out-quart`（指示器）。不得使用弹跳或弹性缓动。SwipeCell、BottomSheet、PullRefresh 统一使用橡皮筋拖拽曲线 `abs(x)^0.92*0.7`。触控反馈优先使用背景或透明度变化，而不是 `transform: scale`（避免布局位移）。每个动画都必须提供 `prefers-reduced-motion` 降级方案。

## 组件

**新库 `@nerv-ui/*`（新功能的唯一去处）**：四形态分包，行为全部来自 `@ui-sdk/vue` 原语，
样式全部来自 StyleX。写法与判定口径见 `frontend/packages/CONVENTIONS.md`，其中两条为硬约束：
行为必须来自 ui-sdk 原语；「展示件」不是自写交互的豁免理由。

**旧库（`@nerv-iip/*`，冻结待删）**：三层结构，全部由令牌驱动，且**绝不修改原版** shadcn/reka：

- `@nerv-iip/ui`：桌面端/PC。由 shadcn/reka 基础层、复制重建的高品质 **Pro** 组件（Button/Input/Select/DataTable/Descriptions/Timeline/Tabs/Dialog/Popconfirm/Tooltip/charts……）、**区块**（app-shell、page-header、section-card、toolbar、data-table）、**布局**（Container/Page/PageGrid/PageColumns/PageSection）和供一体机使用的**触控组件**（StationBar/StatTile/QtyStepper）组成。
- `@nerv-iip/ui-mobile`：PDA。提供具有原生手感和手势支持的控件（swipe-cell、pull-refresh、bottom-sheet 拖拽关闭）、安全区适配、≥44px 触控目标与玻璃质感覆盖层。
- 卡片圆角上限为 12–16px；使用发丝级 `0 0 0 1px var(--border)` 描边环加轻微内侧顶部高光，不使用边框叠加重阴影。覆盖层仅使用克制的玻璃效果（半透明加背景模糊）。

## 布局

网格应适配 12 列；`Container` 通过响应式内边距约束宽度；`Page` 使用由内容区和侧栏组成的 10 列网格。一维（1D）布局使用 Flex，二维（2D）布局使用 Grid。语义化 z-index 层级依次为 dropdown → sticky → modal-backdrop → modal → toast → tooltip。

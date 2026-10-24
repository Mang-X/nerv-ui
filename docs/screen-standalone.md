# A01：独立大屏舞台与基础外壳

[#58](https://github.com/Mang-X/nerv-ui/issues/58) 落实批准 spec #1 的 A01：`NvScreenScaler`、`NvScreenPanel`、`NvBorderPanel`、`NvTechFrame`、`NvTitleBar`、`NvScreenHeader`、`NvGlowDivider`。公共名称、props/default、包名和许可保持兼容；父 #6 及后续 #59–#64 另行验收。

## 运行与接入

Node >=22.18，pnpm 11.22.0；在仓库根执行：

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend dev
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend --filter @nerv-iip/ui-mobile test:docs
pnpm -C frontend build
```

访问 `/#screen` 或可刷新深链 `/#screen/stage`。`App.vue` 按 `hash.startsWith('#screen')` 分发；`ScreenDemo.vue` 持有缩放、设计尺寸、外层主题与返回导航；`screen/ScreenStageDemo.vue` 持有中性“城市文化空间”的插槽交互。只挂已完成组，不预建其余六组空页。

组件从 `@nerv-iip/ui` 主桶导入。宿主沿用 `@nerv-iip/ui/styles.css`，原八层 CSS 顺序、字体及 screen token 从当前公共链加载；没有旧 app CSS、VitePress ClientOnly wrapper、router、认证或 SDK。Inter 是既有依赖且自行托管；中文使用平台系统字体，不安装旧治理材料提及但现依赖中没有的 MiSans。资源实际请求与字体回退证据见 [本票验证](evidence/t05-a01/README.md)。

## 舞台、尺寸与溢出

`NvScreenScaler` 默认仍是 fixed 全屏、1920×1080、fit。宿主若保留自己的设置栏，可用 class/style 把根定位为其明确有尺寸的容器内 `position:absolute`；组件通过 ResizeObserver 测量根的 clientWidth/clientHeight，resize 亦重算。playground 采用此方式，设置/返回栏在缩放区外，舞台只使用其下方实际可用区域。

- `fit`：两轴取较小比，缩放后的实体边界居中，整屏完整、其余留边。
- `width`：按宽等比，从顶端开始；缩放后的实体边界提供真实滚动高度，根 `overflow:auto`，键盘聚焦舞台或鼠标滚轮可到达底部。设置/返回栏始终可达。
- `stretch`：按容器宽高各自缩放；会改变长宽比例，宿主明确提示。

设计尺寸切换为 1920×1080 / 1600×900 / 1920×1440，无需重挂载。Scaler 对非有限、零或负设计尺寸按轴回退到默认尺寸；独立 `computeScale` 对任一非有限/非正输入返回 `{x:1,y:1}`，既有正常输入和七项测试保留。类型 `ScaleMode`、`Scale` 保持不变。无窗口或布局尚未测量时使用现有设计/窗口回退。

Header 的 title/time/date/line/screen 全部由 host 显式输入；当前时间是固定展示输入，组件不启动时钟。图标是信息标记。Panel 的 title-extra/extra/default、Border 的 title/default、TechFrame 内容保留宿主动作；“阅读说明”“切换展厅”“查看今日安排”“点亮留言”均有真实可见结果。GlowDivider 的 flow 可切换，低动效关闭流光与 Header 呼吸动画。

screen 按原合同固定深色，`--nv-scr-*` 不随外层 light/dark/brand 改色；设置栏使用共享主题，返回桌面、touch 和全部 mobile 入口保留原主题行为。

## 来源和交付边界

A01 基于 integration `d9a5c22390090afce05cc74d731340ed5fe34cc3` / tree `bb0b68d1060b9e4a220c26a3042f8978644a8eb3`。7 件初始来源为 T01 固定 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`；活动改动仅 Scaler 的有限尺寸/容器测量/width 可达和 scale guard，其余六件实现原样复用。新增宿主与文档属于独立库；旧消费者尚未接入，不自动回写旧库，migration baseline 不改。

未交付 A02–A07 的控件、指标、刷新、图表、表格、摘要；不复制 T08 背景、登录、墙或 dashboard recipe。不声称完整文档站 #10、packed/versioned #11、设备或旧库接入已经通过。实际 fresh/继承/FAIL/UNRUN、exact 对象与原始命令见本票证据。

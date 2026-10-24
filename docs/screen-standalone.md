# 独立大屏舞台与控件

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

在 1600×900 等较紧设计尺寸下，宿主网格第一行允许收缩，安排正文在“今日安排内容”区域内原生滚动；Tab 可聚焦该区域，Home/End 或鼠标滚轮可读完三条安排。左侧“书房与展厅内容”亦可聚焦滚动，展开阅读说明时保留全部正文。TechFrame、分隔线和页脚各占独立空间；这只是 playground 宿主策略，不改变公共容器的默认样式。F1 的公开反例和修后坐标见 [修复证据](evidence/t05-a01/f1/README.md)。

screen 按原合同固定深色，`--nv-scr-*` 不随外层 light/dark/brand 改色；设置栏使用共享主题，返回桌面、touch 和全部 mobile 入口保留原主题行为。

## 来源和交付边界

A01 基于 integration `d9a5c22390090afce05cc74d731340ed5fe34cc3` / tree `bb0b68d1060b9e4a220c26a3042f8978644a8eb3`。7 件初始来源为 T01 固定 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`；活动改动仅 Scaler 的有限尺寸/容器测量/width 可达和 scale guard，其余六件实现原样复用。新增宿主与文档属于独立库；旧消费者尚未接入，不自动回写旧库，migration baseline 不改。

A03–A07 的指标、刷新、图表、表格、摘要由后续票交付；不复制 T08 背景、登录、墙或 dashboard recipe。不声称完整文档站 #10、packed/versioned #11、设备或旧库接入已经通过。实际 fresh/继承/FAIL/UNRUN、exact 对象与原始命令见本票证据。

## A02：受控输入与空间安排

[#59](https://github.com/Mang-X/nerv-ui/issues/59) 增加可刷新深链 `/#screen/controls`，由 ScreenDemo 按 section 串行挂载 `screen/ScreenControlsDemo.vue`；`/#screen` / `/#screen/stage`、原设置和七个旧表面返回入口保留。切回 stage 或其它表面会卸载 controls。

本组只消费主桶中的七件既有控件及现有样式：Button、Input、Search、Select、Tabs、Segmented、Switch。宿主持有中性区域、空间列表、搜索、人数原始字符串、提醒和保存计数，不连接后端或权限 SDK。人数 `'0'` 有效，非法字符串显示错误；已选区域被删除时显示信息缺失并保留原始选择，空区域与无匹配搜索分别显示空态。区域 fixture 包含数字 `0` 与字符串 `'0'`，按严格身份匹配。

左侧表单是可聚焦原生内滚区域，Panel 保持 overflow:hidden；Select 通过 body fixed 浮层展开。可操作“调整区域顺序”“切换长标签”“移除当前区域”“清空区域”“恢复区域”；这只改变 host 内存数据。暂停编辑禁用七件控件，区域安排按钮仍可用于恢复可选内容。

Tabs 保持等宽槽位 ink；Segmented 根据按钮真实宽度定位 thumb。两者新增默认 false 的 disabled；旧 API/default/Nv 名称保留。Search 清除具有禁用 guard；Select 保留类型、动态安全与焦点，浮层重锚并在边界不足时向上展开；Switch 使用原生 click 避免额外 keydown 通道。Button/Input 实现无需变化。来源和每项公开测试、真实 browser/zoom、资源与未运行范围见 [A02 证据](evidence/t05-a02/README.md)。

## A04：流动消息与轮询生命周期

`/#screen/data` 提供“城市空间的流动消息”，由同一大屏壳保留 stage、controls、indicators 和全部桌面／触屏／移动入口。仅消费主桶 `@nerv-iip/ui` 和既有 CSS，展示 `NvScreenScrollArea`、`NvScrollBoard`、`NvScreenFreshness` 与 `useScreenData`。

宿主为 reading-a、reading-b、notices 提供确定身份的内存 fetcher。阅读来源使用带 key 的 `ScreenDataSource`，每次挂载捕获固定 fetcher；独立快讯另起实例。公开控件支持失败一次、暂缓完成后手动释放、刷新、启停及失败时保留或撤下内容。每 2 秒轮询，初次等待没有假数据或成功时间。来源切换不会把 A 晚回写入 B 的可见状态；helper 的 stop/dispose 仍只停轮询和监听，不取消在途请求。

两种滚动并列展示：自动轮巡支持悬停／滚轮，低动效与键盘进入后使用原生滚动；重复副本 inert，第一份 slot 控件可交互。手动区域跟随内容增删、替换与行高变化更新上下箭头。两者均不提供虚拟列表或业务缓存。原生 `.nv-scr-scroll` 继续由 A01 的既有 CSS 提供。

精确测试、浏览器、资源、历史失败及 UNRUN 边界见 [A04 证据](evidence/t05-a04/README.md)。完整文档站 #10、packed #11、旧库接入与父 #6 组合验收分别执行。

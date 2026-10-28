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

## A06：清单、分页与事件身份

`/#screen/tables` 从主桶消费 `NvScreenTable`、`NvScreenPagination`、`NvAlarmTable`，保留 stage/controls/indicators/data/charts 与旧表面深链。馆藏/活动由本页内存数据提供，`row-key="id"`；每页 18 项，由宿主 slice。替换、总量缩短、清空、恢复同步重置到第 1 页；组件自身不监听 total 发出第二次事件。未知总数独立显示「总数未知」，隐藏已知总数分页器。

事件表保持旧六字段，不以 rename 掩盖领域含义；宿主将空间/参考号适配到 `line`/`wo`，用独立 `id` 维持两个相同 REF-7 事件，labels/levelLabels 与状态 slot 控制中性语义。默认工业示例和「已恢复」绿色继续兼容；传状态 slot 时不继承中文词的隐式判断。`more` 是文字说明，没有导航。

两表提供固定高内容内滚与长列值；详情选择回调使用当前 slot 的 `row.id`。离开分组卸载本页，重入从第 1 页开始。此处没有服务查询/分页算法、#40 dashboard recipe、#64 摘要或 PC 表格改造。来源仍为固定迁移基线，增量留新库，旧库接入前不回写。实际证据见 [A06 验证记录](evidence/t05-a06/README.md)。

## A07：主指标、比较摘要与时间分段

`/#screen/summary` 展示“空间使用概况”，在同一壳中保留 stage/controls/indicators/data/charts/tables 及全部旧表面。文化空间、共享办公两份内存来源使用主桶 `NvOeeHero`、`NvScreenStatusCard`、`NvTaktGantt` 与公共 CSS，没有 SDK/认证/后端。

Hero 只显示来源给出的访问量、费用、变化和 spark；`deltaTone` 由宿主表达“费用下降但改善”，省略时保留旧前导负号逻辑。StatusCard 继续使用 plan/actual/rate/downtime 字符串：宿主 adapter 明确映射目标/当前/进度/持续时间，以 labels/unit 覆盖旧固定文案；未知显示 `—`，不补 0。它自带 Panel，不叠第二层卡。

Takt 保留 run/idle/stop/alarm 四个 palette 通道，以 `toneLabels` 同时覆盖图例和段 title。来源负责唯一 row name、段顺序、有限 0–100 百分比及每行总和≤100；不从 axis 文字推算时间。小于100留尾部空白，空 rows/axis/segs 不恢复工业示例；超界输入由宿主验证，不增加归一化规则。可切换来源、未知、大数/长文案、空时段、更新与恢复。

范围只覆盖三件既有组件，#25 三种新卡、#40 recipes、排程框架和领域算法分别交付。固定迁移源保持不变，本次增量仅留独立新库；旧库接入另验。精确公共测试、真实浏览器、资源与证据边界见 [A07 验证记录](evidence/t05-a07/README.md)；A07 不替代父 #6 的完整组合验收。

## T08 R02：流线与等距块体装饰背景

`/#screen/backgrounds` 仅展示 `NvScreenFlowLinesBg` 和 `NvScreenIsometricBlocksBg`，每件两实例。宿主可用既有舞台设置切换主题、缩放和设计尺寸；退出深链后组件卸载，重入重新挂载。两个 SVG 保留原 `viewBox` 与 `slice`，不含共享 `id`；系统减弱动态效果自动停动，静态几何保留。公开属性与来源处置见[组件文档](../frontend/apps/design-system/docs/components/screen/decorative-backgrounds.md)，本轮门禁见[证据](evidence/t08-r02/README.md)。本接缝不承接 FusionBg 数据业务图、种子氛围层或旧应用接入。

## T08 R04：种子氛围布局

`/#screen/layout` 消费主桶 `NvScreenLayout`，在外层复用 `NvScreenScaler`。布局保留来源的 1920×1080 双曲线、星点、彗星以及页头/内容层次；来源点阵层只有透明背景与 mask，本件用既有色彩令牌补出可见的淡点阵。宿主传 `seed`、标题、时间、日期、区域和屏幕名；不同 seed 更新几何，同 seed 保持几何一致。SVG 轨道与渐变 ID 在同一应用或多个独立 Vue 根中均按组件实例隔离，装饰层穿透指针。默认页头复用 `NvScreenHeader`，也可由 `header` 插槽替换；内容 `main` 插槽保留真实按钮操作，长内容在区域内滚动。

深链中“换一种光影”只改主画面的 seed，“更新时刻”只改宿主持有的时间；阅读和心愿按钮各有可见结果。右侧河岸展厅画面是独立布局实例。布局的设计尺寸固定为来源的 1920×1080，因此本深链锁定设计尺寸选择；外层仍可切换 fit/width/stretch 和主题，并随视口 resize。低动效偏好隐藏彗星、停止星点呼吸，内容和几何保留。离页卸载、重入重新挂载。公开属性与 live 文档见[组件页](../frontend/apps/design-system/docs/components/screen/screen-layout.md)；本票证据见[验证记录](evidence/t08-r04/README.md)。旧应用路由、时钟、数据和消费者保持原属主，排程及其它背景不在本票。

## R08 远距主状态灯

`/#screen/status-hero` 展示 `NvScreenStatusHero` 的两种中性来源。200px 外圈和 158px 核心保留来源体量；颜色、标签和静止/4秒/2.4秒/1.2秒节奏由宿主独立输入。宿主保留零、非零和未知失联数量：零不显示辅助说明，非零显示宿主生成的数量，未知明确标为待确认。辅助按钮由插槽提供并在宿主处理；第二实例不随第一实例改变。独立入口、属性与 live 演示见[组件页](../frontend/apps/design-system/docs/components/screen/status-hero.md)；本票证据见[验证记录](evidence/t08-r08/README.md)。组件无旧应用路由、取数或设备状态算法。

## R12：阶段数量流

`/#screen/stage-flow` 从主桶消费 `NvScreenStageFlow`，外层继续使用 `NvScreenScaler`。阅读活动与展览布置两类内存来源可切换、替换、反转、清空、恢复与长文字/窄幅显示；真实零与未知明确区分。旧深链与导航保留。组件按稳定 key 显示宿主数量和显式状态，不推导 WIP 或瓶颈。公共 API 与 live 示例见[阶段数量流](../frontend/apps/design-system/docs/components/screen/stage-flow.md)，实际 DOM/类型/构建及未运行边界见[R12 记录](evidence/t08-r12/README.md)。本轮浏览器、视觉、HTTP 均 UNRUN。

## R11：分档热力格

从 `/#screen/heatmap` 进入“一格一刻”，由现有 `ScreenDemo` / `NvScreenScaler` 提供舞台，保留全部旧导航并标记当前页。两张 `NvScreenPanel` 分别提供阅读占用的 4×6 格与展厅温度的 3×4 格；阅读控件可切列数、替换同 key 值、调整分档、置未知、清空与恢复。数值、分档含义和时间纯文本由宿主提供。

公共 API、无效阈值政策及 OEE 宿主适配见[组件文档](../frontend/apps/design-system/docs/components/screen/heatmap.md)；[实施记录](evidence/t08-r11/README.md)区分 DOM 与真实浏览器。完整文档站和产物安装仍归 #10/#11；四类旧应用接入与退出为 NOT_PLANNED。

## 入口与摘要卡

`/#screen/summary-cards` 在既有缩放舞台中展示阅读空间与共享花园，支持入口/概况/动态三种卡形、0/1/6 张密度、替换记录与完整说明。公开组件 `NvScreenSummaryCard` 复用已有容器、状态和趋势；导航、统计与数据来源由宿主负责。API 与 live 示例见[组件页](../frontend/apps/design-system/docs/components/screen/summary-card.md)，实际验证与 UNRUN 边界见[R07 证据](evidence/t08-r07/README.md)。

## C04 分栏组合

`/#screen/recipes` 展示阅读活动与展览安排，复用当前 Screen API；受控合同和 live 源码见[组合页](../frontend/apps/design-system/docs/components/screen/dashboard-recipes.md)。浏览器、真实布局与文档站运行 UNRUN。

## 分组状态墙

`/#screen/status-wall` 使用主桶 `NvScreenStatusWall` 和两个中性内存来源。flat 六列固定 stride 有限 DOM，分组两种密度全部渲染；宿主延迟概况在数据/模式/滚动/离页后隔离旧结果。API/live 见[组件页](../frontend/apps/design-system/docs/components/screen/status-wall.md)，独立浏览器已验证滚动、身份与状态布局，完整范围及未运行项见[证据](evidence/t08-r09/README.md)。

## T08R10：空间参数详情

从 `/#screen/parameter-detail/library` / `/#screen/parameter-detail/studio` 深链进入两种中性内存宿主。支持返回、替换、缺测、等待、失败、恢复与空记录；无真实查询、定时轮询和业务状态推断。`NvScreenDetailDialog` portal 到 body，按 viewport 的 CSS px 居中并限制 94vw/92dvh，不继承舞台 transform；screen token 定义在 :root。`NvScreenParameter` 使用 viewport rect 计算归一比例，光标使用本地百分比。DOM 模拟测量不证明真实 browser 缩放与焦点/命中；该车道 UNRUN。API 见[详情取值](../frontend/apps/design-system/docs/components/screen/detail-parameter.md)，证据见[T08R10](evidence/t08-r10/README.md)。旧应用接入/旧库退出已取消，NOT_PLANNED。

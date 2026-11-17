## 使用时机

`NvScreenSummaryCard` 保留入口卡、概况卡与动态卡三个来源形态。复用 `NvScreenPanel`、`NvScreenStatusLight`、`NvScreenStatusTag` 与无面积引用的 `NvSparkline`，没有数据获取、业务 DTO、权限与导航。已有 `NvScreenStatusCard` 的 state/plan/actual/downtime 契约保持兼容；`NvKpiBar` 是整条指标带，`NvOeeHero` 是单主数，`NvCapsuleBar` 是带标签的独立条组，均不能单独表达三来源层次，故只新增一个摘要组件。

## 变体选择

`launcher`：图标槽、标题/说明、纵排指标、状态 chips 和入口。`health`：主数、比较数、图形进度和横排次指标。`line`：主次指标、literal 趋势、状态点排、引用号、提示和入口。三个变体仅改变布局；宿主选择输入区域，组件不推断字段或生成状态。

## 规则与判定

主数、比较数与次指标共用 typed metric；稳定 key 与 label 分离，同名 label 可重复。有限 number 最多三位小数，负值与零保留；null/undefined/非有限数显示 —，字符串原样显示。单位与已知值之间留空格；显示格式不写回原值。progress 只用于装饰图形，clamp 至 0–100，不改主数，未知不生成填充。趋势原样交给已有 Sparkline，空序列使用已有虚线，常量不生成假波动，不启用 area 或新增 SVG 资源引用。

所有状态、chips、点排和提示都有显式标签与色调，不能根据数字计算资格或状态。红色 notice 选择来源缓呼吸警示；低动效停动，装饰层不截获指针。reference 为技术引用号，使用等宽 12px；人读名称保持正常字体。长文全文折行，指标使用等宽数字。actionLabel 存在时渲染真实 button，名称含标题，action 返回稳定 identity；未提供时没有假可点击外壳。来源无 disabled 策略，本件不新增权限策略。

## 正例与反例

正例：宿主输入“待确认”与 amber、null 数值和独立导航回调。反例：组件将未知转换为 0、从 percent 或 alarm 字符串推断状态、拼接业务路由、以 label 作 key。

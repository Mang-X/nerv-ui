---
title: NvMetricCard 指标卡
---

<script setup>
import LocalMetricComparisonExample from '../../.vitepress/examples/localMetricComparisonExample.vue'
import { NvMetricCard, NvMetricRing, NvMetricStrip } from '@nerv-iip/ui'
import { WrenchIcon, CircleCheckIcon, ClockIcon, TriangleAlertIcon } from '@lucide/vue'
import { ref } from 'vue'

const actionFeedback = ref('请选择处理入口。')
const facetFeedback = ref('请选择一个维度。')
</script>

# NvMetricCard 指标卡

给高频操作台用的 KPI 卡。**下半区永远承载可行动的数据**——一段趋势、一个离目标的差距、一组状态分布、一个处理入口——而不是被填成无意义的描述文本。`variant` 决定下半区结构；语义色沿用 `NvStatusBadge` 五 tone；数字一律 tabular-nums；内联微图带悬浮 tooltip（曲线复用 `NvAreaChart` 原生 crosshair）。

> 平铺的「计划与实际 / 目标与当前」对比卡用 `NvMetricComparison`（自动算差值与达成率）。

## 何时使用

| variant     | 下半区                                    | 典型场景                       |
| ----------- | ----------------------------------------- | ------------------------------ |
| `default`   | 可选曲线（向后兼容旧用法，本页不出 demo） | 存量页面沿用                   |
| `icon`      | 无，tone 图标位 + 环比 chip               | 页头一行多张总览，最省纵向空间 |
| `sparkline` | 迷你曲线 + 区间/统计脚注                  | 提交量、利用率趋势             |
| `target`    | 带目标刻度的进度条 + 缺口                 | 月度目标达成、履约率           |
| `breakdown` | 分段条 + 图例计数（五 tone）              | 任务 / 审核 / 批次状态构成     |
| `bars`      | 迷你柱，当前柱强调                        | 日完成量、日报警次数           |
| `alert`     | tone 浸染卡面 + 处理入口                  | 超期任务、临期批次             |
| `facets`    | 维度 chip 组（可点击成筛选）              | 待审核批次 = 类别 A / 类别 B…  |

## 示例

`icon`：`tone` 决定左侧图标位配色，`trend` 出右上环比 chip。给了 `series` 还会在 chip 左侧插一段 64px 内联迷你图——`icon` 卡是一行式摘要，走势跟数字并排而不是另起一行。窄格降级顺序（容器查询，宽度需求大的先让）：内联迷你图 264px → 环比 chip 208px → 图标位 152px；标题与数值永不让位。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2">
    <NvMetricCard variant="icon" tone="brand" :icon="WrenchIcon" label="进行中任务" :value="38" :trend="{ value: '+15.2%', direction: 'up' }" :series="[33, 34, 32, 35, 36, 37, 38]" :series-labels="['07-17','07-18','07-19','07-20','07-21','07-22','07-23']" series-unit=" 条" />
    <NvMetricCard variant="icon" tone="success" :icon="CircleCheckIcon" label="一次通过率" value="98.6" unit="%" :trend="{ value: '0.4pt', direction: 'up' }" />
    <NvMetricCard variant="icon" tone="warning" :icon="ClockIcon" label="待分配" :value="9" :trend="{ value: '持平', direction: 'flat' }" />
    <NvMetricCard variant="icon" tone="danger" :icon="TriangleAlertIcon" label="超期任务" :value="6" :trend="{ value: '2', direction: 'up', tone: 'danger' }" />
  </div>
</Demo>

```vue
<NvMetricCard
  variant="icon"
  tone="danger"
  :icon="TriangleAlertIcon"
  label="超期任务"
  :value="6"
  :trend="{ value: '2', direction: 'up', tone: 'danger' }"
/>
```

> 「涨了但是坏事」（超期 +2）：`direction: 'up'` 保留向上箭头，`tone: 'danger'` 把 chip 染红。

`sparkline`：曲线常驻，脚注固定为「区间 + 区间统计」两个数据槽位——没有自由文本入口。悬浮曲线出定位点 + tooltip。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <NvMetricCard
      variant="sparkline"
      label="今日完成数"
      value="1,284"
      unit="条"
      :trend="{ value: '8.2%', direction: 'up' }"
      :series="[1052, 1118, 1086, 1204, 1163, 1272, 1229, 1284]"
      :series-labels="['07-16','07-17','07-18','07-19','07-20','07-21','07-22','07-23']"
      series-unit=" 条"
      foot-start="近 7 日"
      foot-end="日均 1,176 条"
    />
    <NvMetricCard
      variant="sparkline"
      label="综合利用率"
      value="76.8"
      unit="%"
      :trend="{ value: '3.1pt', direction: 'down' }"
      :series="[83.2, 81.1, 82.4, 79.5, 80.6, 77.9, 78.4, 76.8]"
      :series-labels="['07-16','07-17','07-18','07-19','07-20','07-21','07-22','07-23']"
      series-unit="%"
      foot-start="近 7 日"
      foot-end="峰值 83.2%"
    />
  </div>
</Demo>

```vue
<NvMetricCard
  variant="sparkline"
  label="今日完成数"
  value="1,284"
  unit="条"
  :trend="{ value: '8.2%', direction: 'up' }"
  :series="[1052, 1118, 1086, 1204, 1163, 1272, 1229, 1284]"
  :series-labels="['07-16', ..., '07-23']"
  series-unit=" 条"
  foot-start="近 7 日"
  foot-end="日均 1,176 条"
/>
```

`target`：`progress`（0–100，调用方算好保持可预期）驱动进度条；`target-marker` 是目标刻度位置（默认条末）；`progress-tone` 缺省在 ≥100% 时转 success。悬浮进度条出「实际 / 目标 / 达成」结构化 tooltip。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <NvMetricCard variant="target" label="本月目标达成" value="13,847" unit="条" target-label="目标 15,000 条" :progress="92.3" foot-start="达成 92.3%" foot-end="缺口 1,153 条 · 剩 5 天" />
    <NvMetricCard variant="target" label="计划准时完成率" value="96.4" unit="%" target-label="目标 95%" :progress="96.4" :target-marker="95" progress-tone="success" foot-start="已达标" foot-end="高于目标 1.4pt" />
    <NvMetricCard variant="target" label="交付履约" value="18" unit="/ 26 单" target-label="本周应发 26 单" :progress="69.2" progress-tone="warning" foot-start="完成 69.2%" foot-end="8 单待发 · 2 单临期" />
  </div>
</Demo>

```vue
<NvMetricCard
  variant="target"
  label="本月目标达成"
  value="13,847"
  unit="条"
  target-label="目标 15,000 条"
  :progress="92.3"
  foot-start="达成 92.3%"
  foot-end="缺口 1,153 条 · 剩 5 天"
/>
```

`breakdown`：总数 + 分段条 + 图例计数，一张卡回答「38 条记录都处在什么状态」。分段色沿用五 tone，和表格里的状态徽章同源；悬浮分段或图例项联动高亮。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <NvMetricCard
      variant="breakdown"
      label="进行中任务"
      :value="38"
      :segments="[
        { label: '进行中', value: 24, tone: 'brand' },
        { label: '待分配', value: 9, tone: 'neutral' },
        { label: '已暂停', value: 3, tone: 'warning' },
        { label: '超期', value: 2, tone: 'danger' },
      ]"
    />
    <NvMetricCard
      variant="breakdown"
      label="记录批次"
      :value="142"
      :segments="[
        { label: '正常', value: 118, tone: 'success' },
        { label: '临期', value: 16, tone: 'warning' },
        { label: '已过期', value: 8, tone: 'danger' },
      ]"
    />
  </div>
</Demo>

```vue
<NvMetricCard
  variant="breakdown"
  label="进行中任务"
  :value="38"
  :segments="[
    { label: '进行中', value: 24, tone: 'brand' },
    { label: '待分配', value: 9, tone: 'neutral' },
    { label: '超期', value: 2, tone: 'danger' },
  ]"
/>
```

`bars`：离散周期量（日完成量、日报警数）用柱状比曲线更贴切。`current-index` 标出今日柱做强调，`bar-tones` 可给异常日单独染色。悬浮任一柱其余淡出。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <NvMetricCard
      variant="bars"
      label="日完成量"
      value="12,480"
      unit="条"
      :series="[7050, 8680, 6370, 9760, 8130, 11250, 12480]"
      :series-labels="['07-17','07-18','07-19','07-20','07-21','07-22','07-23（今日）']"
      series-unit=" 条"
      :current-index="6"
      :trend="{ value: '4.9%', direction: 'up' }"
      foot-start="07-17"
      foot-end="今日"
    />
    <NvMetricCard
      variant="bars"
      label="报警次数"
      value="14"
      unit="次"
      :series="[5, 4, 6, 5, 7, 6, 14]"
      :series-labels="['07-17','07-18','07-19','07-20','07-21','07-22','07-23（今日）']"
      series-unit=" 次"
      :current-index="6"
      :bar-tones="['neutral','neutral','neutral','neutral','neutral','neutral','danger']"
      :trend="{ value: '6', direction: 'up', tone: 'danger' }"
      foot-start="07-17"
      foot-end="今日"
    />
  </div>
</Demo>

`alert`：整卡按 `tone` 极淡浸染 + tone 化数值 + 底部处理入口。`action` 有 `href` 时渲染链接，否则触发 `action` 事件（路由交给调用方）。正常态收敛为中性卡面。

本页在卡片下方显示所选入口，不执行真实业务操作；接入应用时由宿主完成导航或处理。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <NvMetricCard variant="alert" tone="danger" label="超期未完成" :value="6" unit="条" :status="{ label: '需处理', tone: 'danger' }" foot-start="最久已超期 3 天 · REC-2607-0214" :action="{ label: '去处理' }" @action="actionFeedback = '已选择：超期未完成'" />
    <NvMetricCard variant="alert" tone="warning" label="临期批次" :value="16" unit="批" :status="{ label: '7 天内', tone: 'warning' }" foot-start="涉及 5 个条目 · 最近 07-26 到期" :action="{ label: '查看批次' }" @action="actionFeedback = '已选择：临期批次'" />
    <NvMetricCard variant="alert" tone="success" label="未确认报警" :value="0" unit="条" :status="{ label: '正常', tone: 'success' }" foot-start="近 24h 已确认 14 条" :action="{ label: '报警记录' }" @action="actionFeedback = '已选择：未确认报警'" />
  </div>
  <p role="status" class="w-full text-sm text-muted-foreground">{{ actionFeedback }}</p>
</Demo>

```vue
<script setup>
import { ref } from 'vue'
import { NvMetricCard } from '@nerv-iip/ui'

const actionFeedback = ref('请选择处理入口。')
</script>

<template>
  <NvMetricCard
    variant="alert"
    tone="danger"
    label="超期未完成"
    :value="6"
    unit="条"
    :status="{ label: '需处理', tone: 'danger' }"
    foot-start="最久已超期 3 天 · REC-2607-0214"
    :action="{ label: '去处理' }"
    @action="actionFeedback = '已选择：超期未完成'"
  />
  <p role="status">{{ actionFeedback }}</p>
</template>
```

`facets`：主数值 + 维度 chip 组，替代描述文本：下半区放「这 12 批都是什么」。异常维度自动 tone 化，chip 可点击抛出 `facet` 事件作筛选入口。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <NvMetricCard
      variant="facets"
      label="待审核批次"
      :value="12"
      unit="批"
      :trend="{ value: '今日 +4', direction: 'flat' }"
      :facets="[
        { label: '类别 A', value: 5 },
        { label: '类别 B', value: 4 },
        { label: '类别 C', value: 3 },
      ]"
      @facet="(facet) => facetFeedback = `已选择：待审核批次 / ${facet.label}`"
    />
    <NvMetricCard
      variant="facets"
      label="在线资源"
      :value="28"
      unit="个"
      :trend="{ value: '共 32 个', direction: 'flat' }"
      :facets="[
        { label: '运行', value: 24 },
        { label: '空闲', value: 4 },
        { label: '断线', value: 4, tone: 'danger' },
      ]"
      @facet="(facet) => facetFeedback = `已选择：在线资源 / ${facet.label}`"
    />
  </div>
  <p role="status" class="w-full text-sm text-muted-foreground">{{ facetFeedback }}</p>
</Demo>

`NvMetricRing`：`breakdown` 的环形表达：每段一种语义色，各自对应一条图例，中心放**最该被看到的数**（通常是总数）。悬浮任一段弧或图例行——该段加粗点亮、其余淡出，中心随即切成该段的读数与占比，所以不需要一个 tooltip 盖住卡片自己。段的身份由亮起的弧和未淡出的图例行表达，中心只留数值与占比（环内放不下标签）。

> 只适用于**部分与整体**（任务状态 / 资源就绪 / 存储位置）。**相乘型比率不能画成环**：利用率综合 = A × P × Q，A/P/Q 并不是环的三段；那类指标用 `variant="facets"` 或独立成行呈现。

<Demo>
  <div class="grid w-full gap-4 sm:grid-cols-2">
    <NvMetricRing
      label="进行中任务构成"
      :value="35"
      center-caption="总任务"
      :segments="[
        { label: '进行中', value: 24, tone: 'brand' },
        { label: '待分配', value: 9, tone: 'neutral' },
        { label: '超期', value: 2, tone: 'danger' },
      ]"
    />
    <NvMetricRing
      label="存储位置"
      :value="512"
      center-caption="总位置"
      :segments="[
        { label: '已占用', value: 340, tone: 'brand' },
        { label: '可用', value: 160, tone: 'success' },
        { label: '冻结', value: 12, tone: 'warning' },
      ]"
    />
    <NvMetricRing
      label="批次审核情况"
      :value="1000"
      center-caption="总批次"
      :segments="[
        { label: '通过', value: 997, tone: 'success' },
        { label: '条件通过', value: 2, tone: 'warning' },
        { label: '拒绝', value: 1, tone: 'danger' },
      ]"
    />
  </div>
</Demo>

> 极小但非零的占比（如 1/1000 的拒绝项）也保留可见弧——最该被看见的异常段不会被分段间隙吞掉。
> 占比分母取各段**正值之和**（小数/负值/非有限值不参与，零总量只画底环）。分段间隙随数量
> 自适应收窄，最小可见弧在 ~75 段内始终守住；超过则各段仍按占比画出非零弧（不再消失）但会
> 低于该下限——此时建议把细碎类别聚合成「其他」再传入。

```vue
<NvMetricRing
  label="进行中任务构成"
  :value="35"
  center-caption="总任务"
  :segments="[
    { label: '进行中', value: 24, tone: 'brand' },
    { label: '待分配', value: 9, tone: 'neutral' },
    { label: '超期', value: 2, tone: 'danger' },
  ]"
/>
```

`NvMetricStrip`：一张卡装一组同域指标，分隔线代替卡缝，密度最高。适合列表页顶部：不和下方表格抢注意力，又把关键口径钉在一行。窄屏自动竖排。

<Demo>
  <NvMetricStrip
    class="w-full"
    :cells="[
      { label: '今日完成', value: '12,480', unit: '条', delta: { value: '+4.9%', direction: 'up' }, series: [11020, 11460, 11180, 11890, 11640, 12130, 12480], seriesLabels: ['07-17','07-18','07-19','07-20','07-21','07-22','07-23'], seriesUnit: ' 条' },
      { label: '已提交记录', value: '26', unit: '条', meta: '待审核 3 条', metaTone: 'neutral' },
      { label: '一次通过率', value: '98.6', unit: '%', delta: { value: '+0.4pt', direction: 'up' }, series: [98.1, 98.0, 98.3, 98.2, 98.4, 98.5, 98.6], seriesLabels: ['07-17','07-18','07-19','07-20','07-21','07-22','07-23'], seriesUnit: '%' },
      { label: '超期任务', value: '2', unit: '条', valueTone: 'danger', delta: { value: '+2', direction: 'up', tone: 'danger' }, meta: '最久超期 3 天' },
    ]"
  />
</Demo>

```vue
<NvMetricStrip
  :cells="[
    {
      label: '今日完成',
      value: '12,480',
      unit: '条',
      // 变化幅度由 series 首尾算出，末点就是 value——线和数字永远对得上
      delta: { value: '+4.9%', direction: 'up' },
      series: [11020, 11460, 11180, 11890, 11640, 12130, 12480],
      seriesLabels: ['07-17', ..., '07-23'],
      seriesUnit: ' 条',
    },
    // 涨了是坏事：箭头照实朝上，tone 手动压成 danger
    { label: '超期任务', value: '2', unit: '条', valueTone: 'danger',
      delta: { value: '+2', direction: 'up', tone: 'danger' }, meta: '最久超期 3 天' },
  ]"
/>
```

`NvMetricComparison` 的 `baseline`、`actual` 均为 `{ label: string, value: number }`。下例通过公开主桶消费，切换到访/耗用会替换两侧标签与数值；方向可独立切换，当前输入在卡片下方反馈。`betterWhen` 为 `higher`（默认）或 `lower`，控制差值的优劣颜色；差值始终为实际减基线，达成率始终为实际除以基线。0/0 显示 **100%**，基线 0、实际非零显示 **—**，不能解读为 0% 或缺测输入。当前 API 不接受 null。本例以标题表达量纲，不传可选 `unit`；短标签避免既有截断槽丢失全文，完整场景说明在卡片外换行。组件数值最多两位小数、达成率取整；此例使用整数，不代表所有 unit 路径的排版验收。

<Demo>
  <LocalMetricComparisonExample />
</Demo>

<<< @/.vitepress/examples/localMetricComparisonExample.vue

## API

### NvMetricCard

| 属性                  | 说明                                                                                                | 类型                                                                                             | 默认      |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------- |
| `variant`             | 下半区结构                                                                                          | `'default' \| 'icon' \| 'sparkline' \| 'target' \| 'breakdown' \| 'bars' \| 'alert' \| 'facets'` | `default` |
| `label`               | 指标名                                                                                              | `string`                                                                                         | —         |
| `value`               | 主数值                                                                                              | `string \| number`                                                                               | —         |
| `unit`                | 数值单位后缀                                                                                        | `string`                                                                                         | —         |
| `tone`                | `icon` 图标位 / `alert` 卡面强调 tone                                                               | `'brand' \| 'success' \| 'warning' \| 'danger' \| 'neutral'`                                     | `brand`   |
| `icon`                | `icon` 变体的图标组件                                                                               | `Component`                                                                                      | —         |
| `trend`               | 右上环比 chip `{ value, direction?, tone? }`                                                        | `NvMetricDelta`                                                                                  | —         |
| `series`              | `sparkline` / `bars` 数据                                                                           | `number[]`                                                                                       | —         |
| `seriesLabels`        | 数据点标签（tooltip）                                                                               | `string[]`                                                                                       | —         |
| `seriesUnit`          | tooltip 数值单位                                                                                    | `string`                                                                                         | —         |
| `currentIndex`        | `bars` 强调柱下标                                                                                   | `number`                                                                                         | —         |
| `barTones`            | `bars` 每柱 tone                                                                                    | `NvMetricTone[]`                                                                                 | —         |
| `progress`            | `target` 进度 0–100                                                                                 | `number`                                                                                         | —         |
| `targetMarker`        | `target` 刻度位 0–100                                                                               | `number`                                                                                         | `100`     |
| `targetLabel`         | `target` 右上目标文案                                                                               | `string`                                                                                         | —         |
| `progressTone`        | `target` 进度条 tone                                                                                | `'brand' \| 'success' \| 'warning' \| 'danger'`                                                  | 自动      |
| `segments`            | `breakdown` 分段 `{ label, value, tone?, key? }[]`                                                  | `NvMetricSegment[]`                                                                              | —         |
| `status`              | `alert` 状态 pill `{ label, tone }`                                                                 | `NvMetricStatus`                                                                                 | —         |
| `action`              | `alert` 底部动作 `{ label, href? }`                                                                 | `NvMetricAction`                                                                                 | —         |
| `facets`              | `facets` 维度 chip `{ label, value, tone?, key? }[]`                                                | `NvMetricFacet[]`                                                                                | —         |
| `footStart`/`footEnd` | `sparkline` / `target` / `bars` 结构化脚注；`alert` 仅用 `footStart` 作底部说明（不消费 `footEnd`） | `string`                                                                                         | —         |
| `hint`                | **已弃用**：自由描述文本，改用结构化变体                                                            | `string`                                                                                         | —         |

事件：`@action`（alert 动作按钮，无 `href` 时）、`@facet`（点击维度 chip，回传该 facet）。

### NvMetricRing

| 属性            | 说明                                                     | 类型                | 默认 |
| --------------- | -------------------------------------------------------- | ------------------- | ---- |
| `label`         | 卡标题                                                   | `string`            | —    |
| `value`         | 中心读数，默认展示的数（常为总数，不带单位避免环内截断） | `string \| number`  | —    |
| `centerCaption` | 中心数下方小字，如 `总任务` / `总位置`                   | `string`            | —    |
| `segments`      | 各分段 `{ label, value, tone?, key? }`                   | `NvMetricSegment[]` | `[]` |

悬浮分段或图例行时，中心自动切换为该段的数值与占比，无需额外配置。

### NvMetricStrip

| 属性    | 说明     | 类型                  | 默认 |
| ------- | -------- | --------------------- | ---- |
| `cells` | 各格指标 | `NvMetricStripCell[]` | `[]` |

`NvMetricStripCell`：`{ label, value, unit?, valueTone?, meta?, metaTone?, delta?, series?, seriesLabels?, seriesUnit?, key? }`。

各格是 `flex-1` 等分，但格子本身带 `min-w-0`：不带的话 flex 项默认的 `min-width: auto` 会让带迷你图的格子（unovis 的 SVG 按上一帧测得的容器宽定死）压不下去，等宽时格子装不下就被顶宽，整条指标带溢出到内容宽度、末尾几格被裁（#3735）。需要整体宽度时给 `class="w-full"` 或任意 `w-*`——组件根节点带 `data-slot="nv-metric-strip"`。

| 字段                | 说明                                                                                                                                                                                                                                             | 类型                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `meta` / `metaTone` | 副行文本与其趋势图标；`metaTone` 取 `'up' \| 'down' \| 'flat' \| 'neutral'`，向上/下附趋势图标与语义色                                                                                                                                           | `string` / `NvMetricDeltaDirection \| 'neutral'` |
| `delta`             | 副行变化 chip。**真正的变化幅度优先用它，而不是 `meta`**：它带 `tone` 覆盖，能表达「涨了是坏事」（超期任务 +3 保持上箭头但读 danger），这是 `metaTone` 做不到的（它把 up 硬映射成 success）。两者同时给出时 chip 在前、`meta` 作为灰字注脚跟在后面 | `NvMetricDelta`                                  |
| `series`            | 该格的迷你走势（≥2 点）。**末点必须就是 `value` 那个数**——指标条读作「数字 + 产生它的形状」，线落在别处即自相矛盾                                                                                                                                | `number[]`                                       |
| `seriesLabels`      | 逐点标签（十字准线 tooltip）                                                                                                                                                                                                                     | `string[]`                                       |
| `seriesUnit`        | tooltip 数值单位                                                                                                                                                                                                                                 | `string`                                         |

任一格给了 `series`，整行会为迷你图预留等高位置，避免「有图的格比没图的高一截」把卡片下沿拉参差。

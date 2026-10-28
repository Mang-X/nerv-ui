---
title: Chart 图表
---

<script setup>
import { NvAreaChart, NvLineChart, NvBarChart, NvDonutChart } from '@nerv-iip/ui'

const annotations = [{ id: 'review', axis: 'x', from: 1, to: 3, label: '查看周二至周四', tone: 'info' }]
const points = [{ id: 'thu', index: 3, seriesKey: 'actual', label: '周四实际产量' }]
const outputSeries = [
  { label: '08:00', value: 420 },
  { label: '10:00', value: 680 },
  { label: '12:00', value: 1240 },
  { label: '14:00', value: 1880 },
  { label: '16:00', value: 2610 },
  { label: '18:00', value: 3180 },
  { label: '20:00', value: 4210 },
]

const planActual = [
  { day: '周一', plan: 900, actual: 860 },
  { day: '周二', plan: 950, actual: 980 },
  { day: '周三', plan: 1000, actual: 940 },
  { day: '周四', plan: 1000, actual: 1060 },
  { day: '周五', plan: 1100, actual: 1020 },
  { day: '周六', plan: 700, actual: 720 },
]
const planActualSeries = [
  { key: 'plan', label: '计划' },
  { key: 'actual', label: '实际' },
]

const outputByCenter = [
  { center: 'CNC-07', good: 412, scrap: 18 },
  { center: 'FORGE-02', good: 1200, scrap: 24 },
  { center: 'CNC-11', good: 96, scrap: 6 },
  { center: 'ASM-04', good: 188, scrap: 12 },
  { center: 'STAMP-01', good: 2740, scrap: 60 },
]
const outputByCenterSeries = [
  { key: 'good', label: '良品' },
  { key: 'scrap', label: '废品' },
]

const statusMix = [
  { label: '执行中', value: 38 },
  { label: '已完成', value: 52 },
  { label: '待处理', value: 22 },
  { label: '阻塞', value: 6 },
]
</script>

# Chart 图表

基于 unovis 的一组工厂场景图表：面积、折线、柱状、环形。颜色取自设计令牌，随运行时品牌色重新着色。

## 面积图 NvAreaChart

单系列累计趋势，适合当班产出等时间序列。

<Demo>
  <div class="w-full">
    <NvAreaChart :data="outputSeries" :height="220" value-suffix=" 件" />
  </div>
</Demo>

```vue
<script setup>
const outputSeries = [
  { label: '08:00', value: 420 },
  { label: '10:00', value: 680 },
  { label: '12:00', value: 1240 },
  { label: '20:00', value: 4210 },
]
</script>

<template>
  <NvAreaChart :data="outputSeries" :height="220" value-suffix=" 件" />
</template>
```

## 折线图 NvLineChart

多系列对比，例如计划与实际产量。

<Demo>
  <div class="w-full">
    <NvLineChart :data="planActual" x-key="day" :series="planActualSeries" :height="220" value-suffix=" 件" />
  </div>
</Demo>

```vue
<script setup>
const planActual = [
  { day: '周一', plan: 900, actual: 860 },
  { day: '周二', plan: 950, actual: 980 },
]
const planActualSeries = [
  { key: 'plan', label: '计划' },
  { key: 'actual', label: '实际' },
]
</script>

<template>
  <NvLineChart
    :data="planActual"
    x-key="day"
    :series="planActualSeries"
    :height="220"
    value-suffix=" 件"
  />
</template>
```

## 柱状图 NvBarChart

分类（可分组）对比，例如各工作中心的良品 / 废品。

<Demo>
  <div class="w-full">
    <NvBarChart :data="outputByCenter" x-key="center" :series="outputByCenterSeries" :height="220" />
  </div>
</Demo>

```vue
<script setup>
const outputByCenter = [
  { center: 'CNC-07', good: 412, scrap: 18 },
  { center: 'FORGE-02', good: 1200, scrap: 24 },
]
const outputByCenterSeries = [
  { key: 'good', label: '良品' },
  { key: 'scrap', label: '废品' },
]
</script>

<template>
  <NvBarChart :data="outputByCenter" x-key="center" :series="outputByCenterSeries" :height="220" />
</template>
```

## 环形图 NvDonutChart

占比构成，例如工单状态分布，支持中心标签。

<Demo>
  <div class="w-full max-w-sm">
    <NvDonutChart :data="statusMix" :height="180" central-label="118" central-sub-label="工单" />
  </div>
</Demo>

```vue
<script setup>
const statusMix = [
  { label: '执行中', value: 38 },
  { label: '已完成', value: 52 },
  { label: '待处理', value: 22 },
  { label: '阻塞', value: 6 },
]
</script>

<template>
  <NvDonutChart :data="statusMix" :height="180" central-label="118" central-sub-label="工单" />
</template>
```

## 属性

### NvAreaChart

| 属性          | 说明                           | 类型                                 | 默认    |
| ------------- | ------------------------------ | ------------------------------------ | ------- |
| `data`        | 数据点数组                     | `{ label: string; value: number }[]` | —       |
| `height`      | 高度（px）                     | `number`                             | `240`   |
| `valueSuffix` | 数值后缀                       | `string`                             | `''`    |
| `minimal`     | 迷你模式（无轴，适合卡内趋势） | `boolean`                            | `false` |

### NvLineChart / NvBarChart

| 属性          | 说明       | 类型                                       | 默认  |
| ------------- | ---------- | ------------------------------------------ | ----- |
| `data`        | 行数据数组 | `Record<string, number \| string>[]`       | —     |
| `xKey`        | X 轴字段名 | `string`                                   | —     |
| `series`      | 系列定义   | `{ key: string; label: string; color? }[]` | —     |
| `height`      | 高度（px） | `number`                                   | `260` |
| `valueSuffix` | 数值后缀   | `string`                                   | `''`  |

### NvDonutChart

| 属性              | 说明       | 类型                                         | 默认  |
| ----------------- | ---------- | -------------------------------------------- | ----- |
| `data`            | 分片数组   | `{ label: string; value: number; color? }[]` | —     |
| `height`          | 高度（px） | `number`                                     | `200` |
| `centralLabel`    | 中心主标签 | `string`                                     | —     |
| `centralSubLabel` | 中心副标签 | `string`                                     | —     |

## 折线图范围与定位

<Demo>
  <NvLineChart :data="planActual" x-key="day" :series="planActualSeries" :bands="annotations" :markers="points" value-suffix=" 件" />
</Demo>

| 输入          | 合同                                                                                                                       | 默认     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| `bands`       | `NvLineBand[]`：`id`、`axis: 'x' \| 'y'`、`from`、`to`、`label`、可选 `tone: 'info' \| 'warning' \| 'danger' \| 'neutral'` | 不画范围 |
| `markers`     | `NvLineMarker[]`：`id`、`index`、`seriesKey`、`label`、可选 `href`                                                         | 不画点   |
| `markerClick` | 当前 marker 和原始 MouseEvent/KeyboardEvent；宿主可 preventDefault 并定位明细                                              | 无副作用 |

X 是行索引，不是时间戳。`xKey` 仅作标签，相同标签仍是两个位置。宿主重排行时同步 marker.index；id 在每个输入集合内必须唯一、稳定。范围反转自动排序，先裁剪到当前共享域；完全轴外或非有限范围省略，等值范围宽/高为零。

每个可见范围由官方 Plotband 绘制短编号 `[n]`，按当前可见输入顺序在绘图区顶部错行放置，Y 轴范围的起点不参与编号行位置；图外说明使用相同编号列出完整 `label`、轴与裁剪后的端点。同色嵌套范围不再把完整长名称叠印在同一中心；替换或重排后编号与说明一同更新。端点最多显示三位小数，X 仍为行索引。宿主网格子项需允许收缩（例如 `min-width: 0`），不能由 SVG 的固有宽度撑开视口。

marker 绑定当前可见 series 的当前行数值；缺行、缺 series、空字符串、null、非有限值省略，零和负值保留。单点复用 producer 的退化域规则；空数据不显示标注。所有 series 共用域，范围不参与扩域。

官方 `VisPlotband` 直接取 producer scale，点取 `VisLine.component.xScale/yScale`，位置用 `onRenderComplete` 的 margin。没有 DOM 私有属性或猜测 inset。标注模式关闭插值动画，避免点与正在运动的线错位；原无标注模式保留原行为。极大有限 Y 值按共同因子归一后传给同一 producer，轴与 tooltip 保留原单位。

`href` 只接受无空白的本页 `#fragment`，其它值退为按钮；宿主保证目标存在与路由安全。Tab、Enter、Space 可激活，长 label 使用完整可访问名称与 title。宿主示例还提供完整可读明细。tone 仅表达宿主意图，颜色不是唯一标识。

可操作双宿主：`/#line-annotations/library` 与 `/#line-annotations/garden`。浏览器尺寸、轴文字实际测量和视觉对齐仍须独立验收。

<!--@include: ../../../../../DESIGN/components/chart.md-->

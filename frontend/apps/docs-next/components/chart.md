---
title: NvLineChart / NvBarChart / NvDonutChart 图表
---

<script setup>
import { NvLineChart, NvBarChart, NvDonutChart } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const weeks = ['第 1 周', '第 2 周', '第 3 周', '第 4 周', '第 5 周', '第 6 周', '第 7 周', '第 8 周']

const lineData = [
  {
    key: 'inbound',
    label: '入库',
    data: weeks.map((x, i) => ({ x, y: [820, 932, 901, 1094, 1230, 1180, 1320, 1466][i] })),
  },
  {
    key: 'outbound',
    label: '出库',
    data: weeks.map((x, i) => ({ x, y: [760, 810, 880, 960, 1120, 1050, 1210, 1284][i] })),
  },
]

const areaData = [
  {
    key: 'orders',
    label: '累计记录',
    data: weeks.map((x, i) => ({ x, y: [120, 268, 402, 590, 812, 1006, 1230, 1488][i] })),
  },
]

const barData = [
  {
    key: 'plan',
    label: '计划产出',
    data: [
      { x: '1 号分组', y: 4800 },
      { x: '2 号分组', y: 3600 },
      { x: '3 号分组', y: 5200 },
      { x: '4 号分组', y: 2800 },
      { x: '5 号分组', y: 4200 },
    ],
  },
  {
    key: 'actual',
    label: '实际产出',
    data: [
      { x: '1 号分组', y: 4520 },
      { x: '2 号分组', y: 3780 },
      { x: '3 号分组', y: 4980 },
      { x: '4 号分组', y: 2610 },
      { x: '5 号分组', y: 4460 },
    ],
  },
]

const donutData = [
  { label: '生产中', value: 620 },
  { label: '已完工', value: 380 },
  { label: '暂停', value: 96 },
  { label: '待开工', value: 188 },
]
</script>

# NvLineChart / NvBarChart / NvDonutChart 图表

轻量 SVG 图表族：折线、柱状与环形共用同一套坐标、图例、悬停提示与空状态。

## 示例

<Demo block>
  <NvLineChart :data="lineData" :height="240" aria-label="每周出入库趋势" value-suffix=" 件" />
</Demo>

<Demo block>
  <NvLineChart :data="areaData" :height="220" area aria-label="累计记录趋势" value-suffix=" 单" />
</Demo>

<Demo block>
  <NvBarChart :data="barData" :height="240" aria-label="各分组计划与实际产出" value-suffix=" 件" />
</Demo>

<Demo block>
  <NvDonutChart :data="donutData" :height="220" aria-label="记录状态分布" central-label="1,284" central-sub-label="记录总数" />
</Demo>

<Demo>
  <NvLineChart :data="[]" :height="160" />
  <NvBarChart :data="[]" :height="160" />
  <NvDonutChart :data="[]" :height="160" />
</Demo>

<Demo block>
  <NvLineChart :data="lineData" :height="200" :show-legend="false" aria-label="无图例折线图" />
  <NvDonutChart :data="donutData" :height="180" :show-legend="false" aria-label="无图例环形图" />
</Demo>

悬停任一图表即可查看 tooltip；柱状图按分类整组高亮，环形图悬停时扇区轻微外移。

## API

### NvLineChart 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `data` | 要绘制的数据系列，各点的 `x` 为共享分类 | `ChartSeries[]` | — |
| `height` | 绘图区高度（px），图例行另行计算 | `number` | `240` |
| `showLegend` | 在绘图区上方显示系列图例 | `boolean` | `true` |
| `ariaLabel` | 整张图的无障碍名称 | `string` | `折线图` |
| `area` | 同时填充折线下方的区域 | `boolean` | `false` |
| `valueSuffix` | 追加到 tooltip 数值后的单位，如 `" 件"` | `string` | — |

### NvBarChart 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `data` | 要绘制的数据系列，分类为各点 `x` 的并集 | `ChartSeries[]` | — |
| `height` | 绘图区高度（px） | `number` | `240` |
| `showLegend` | 显示系列图例 | `boolean` | `true` |
| `ariaLabel` | 整张图的无障碍名称 | `string` | `柱状图` |
| `valueSuffix` | 追加到 tooltip 数值后的单位 | `string` | — |

### NvDonutChart 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `data` | 按显示顺序排列的扇区；负值与非有限值会被忽略 | `NvDonutDatum[]` | — |
| `height` | 绘图区高度（px） | `number` | `200` |
| `showLegend` | 在环下方显示扇区图例 | `boolean` | `true` |
| `ariaLabel` | 整张图的无障碍名称 | `string` | `环形图` |
| `centralLabel` | 中心主标题，默认显示合计值 | `string` | — |
| `centralSubLabel` | 中心标题下方的说明 | `string` | `总计` |

### 数据结构

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `ChartSeries` | `key` | 系列唯一标识 |
| `ChartSeries` | `label` | 图例与 tooltip 中显示的系列名 |
| `ChartSeries` | `color` | 语义色覆盖，默认使用令牌派生的图表色板 |
| `ChartSeries` | `data` | `{ x, y }[]`，`x` 为分类标签或数值位置 |
| `NvDonutDatum` | `label` | 扇区名称 |
| `NvDonutDatum` | `value` | 扇区数值 |
| `NvDonutDatum` | `color` | 语义色覆盖，默认使用图表色板 |

### 事件与插槽

三个图表均无事件与插槽；图例、坐标轴与 tooltip 由组件内置。

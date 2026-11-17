---
title: NvScreenBarChart 柱状图
---

<script setup>
import { NvScreenBarChart } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const lines = ['A 线', 'B 线', '焊装', '涂装', '立体库']
const series = [
  { label: '实际', tone: 'accent', data: [305, 240, 128, 176, 92] },
  { label: '计划', tone: 'muted', data: [320, 280, 200, 180, 100] },
]
</script>

# NvScreenBarChart 柱状图

分组柱状图，支持多序列并排、负值基线、悬停读数与自适应刻度。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenBarChart :series="series" :x-labels="lines" unit="件" height="200" aria-label="各线体产出" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenBarChart
      :series="[{ label: '环比', tone: 'success', data: [12, -6, 18, -3, 9] }]"
      :x-labels="lines"
      unit="%"
      :y-ticks="4"
      height="180"
      aria-label="环比变化"
    />
    <NvScreenBarChart :series="[]" empty-label="暂无柱状数据" />
  </div>
</Demo>

## API

### NvScreenBarChart 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `series` | 序列列表，必填；同一类别内并排 | `ScreenBarSeries[]` | — |
| `xLabels` | 类别文案 | `string[]` | `[]` |
| `yTicks` | Y 轴刻度数量 | `number` | `4` |
| `unit` | 读数单位 | `string` | — |
| `height` | 绘图区高度（px） | `number` | `200` |
| `hoverLabels` | 悬停读数标题，缺省用 `xLabels` | `string[]` | — |
| `ariaLabel` | 图表的无障碍描述 | `string` | — |
| `emptyLabel` | 无数据文案 | `string` | `暂无数据` |

### ScreenBarSeries

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `label` | 序列名 | `string` |
| `tone` | 柱体语义色 | `'accent' \| 'success' \| 'warning' \| 'danger' \| 'muted'` |
| `data` | 每个类别一个值；`null` 留空 | `ReadonlyArray<number \| null>` |

---
title: NvScreenTrendChart 趋势图
---

<script setup>
import { NvScreenTrendChart } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17']
const series = [
  { label: '完成量', tone: 'accent', data: [120, 132, 145, 150, 138, 160, 172, 168, 180, 176] },
  { label: '计划', tone: 'muted', data: [130, 130, 130, 140, 140, 150, 160, 160, 170, 170] },
]
const hoverLabels = hours.map((hour) => `${hour}:00`)
</script>

# NvScreenTrendChart 趋势图

深色舞台上的多序列折线 / 面积图，比例自适应，悬停显示各序列读数并带十字准线。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenTrendChart
      :series="series"
      :x-labels="hours"
      :hover-labels="hoverLabels"
      unit="项"
      height="220"
      aria-label="小时完成趋势"
    />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenTrendChart
      :series="[
        { label: '当前值', tone: 'warning', data: [180, 184, null, 191, 196, 193, 189] },
        { label: '上限', tone: 'danger', data: [200, 200, 200, 200, 200, 200, 200] },
      ]"
      :x-labels="['08', '09', '10', '11', '12', '13', '14']"
      unit="ms"
      :show-area="false"
      :show-dots="false"
      height="180"
      aria-label="耗时趋势"
    />
    <NvScreenTrendChart :series="[]" empty-label="暂无趋势数据" />
  </div>
</Demo>

## API

### NvScreenTrendChart 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `series` | 序列列表，必填；首个序列绘制面积 | `ScreenTrendSeries[]` | — |
| `xLabels` | X 轴文案，按样本间隔均匀铺开 | `string[]` | `[]` |
| `yTicks` | Y 轴刻度数量 | `number` | `5` |
| `unit` | 读数单位 | `string` | — |
| `showArea` | 首序列绘制面积填充 | `boolean` | `true` |
| `showDots` | 每个有限样本绘制圆点 | `boolean` | `true` |
| `height` | 绘图区高度（px） | `number` | `220` |
| `hoverLabels` | 悬停时每列的读数标题 | `string[]` | — |
| `ariaLabel` | 图表的无障碍描述；缺省取序列名 | `string` | — |
| `emptyLabel` | 无数据文案 | `string` | `暂无数据` |

### ScreenTrendSeries

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `label` | 序列名 | `string` |
| `tone` | 线条语义色 | `'accent' \| 'success' \| 'warning' \| 'danger' \| 'muted'` |
| `data` | Y 样本；`null` 会使折线断开 | `ReadonlyArray<number \| null>` |

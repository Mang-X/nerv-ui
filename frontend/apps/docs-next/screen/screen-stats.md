---
title: NvScreenStats 统计条
---

<script setup>
import { NvScreenStats } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const items = [
  { label: '计划数量', value: 3200, unit: '项' },
  { label: '实际数量', value: 3050, unit: '项', tone: 'success' },
  { label: '达成率', value: 95.3, unit: '%', tone: 'accent', hint: '较昨日 +1.2%' },
  { label: '异常数', value: 12, unit: '项', tone: 'danger', hint: '待处理 5 项' },
]
</script>

# NvScreenStats 统计条

一行并排的关键统计值，带标签、单位、语义色与提示，列数可自适应或固定。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenStats :items="items" aria-label="今日数量统计" />
    <NvScreenStats :items="items.slice(0, 3)" size="lg" :columns="3" aria-label="大号统计" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvScreenStats
      :items="[{ label: '平均耗时', value: 58, unit: 's' }, { label: '中断时长', value: 18, unit: 'min', tone: 'warning' }]"
      :columns="2"
      aria-label="用时统计"
    />
  </div>
</Demo>

## API

### NvScreenStats 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 统计项，必填 | `ScreenStatItem[]` | — |
| `size` | 字号，`lg` 为 38px 数值 | `md \| lg` | `md` |
| `columns` | 固定列数；省略时按项数自适应 | `number` | — |
| `ariaLabel` | 统计条的无障碍名称 | `string` | `统计条` |

### ScreenStatItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 稳定标识 | `string \| number` |
| `label` | 指标名 | `string` |
| `value` | 指标值 | `string \| number` |
| `unit` | 单位 | `string` |
| `tone` | 语义色 | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |
| `hint` | 指标下方的补充说明 | `string` |

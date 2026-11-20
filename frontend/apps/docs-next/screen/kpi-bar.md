---
title: NvKpiBar 关键指标条
---

<script setup>
import { NvKpiBar } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const metrics = [
  { label: '今日数量', value: '12,480', unit: '项', trend: 'up', hint: '较昨日 +4.2%' },
  { label: '计划达成率', value: '96.4', unit: '%', tone: 'success' },
  { label: '进行中任务', value: '38', unit: '项' },
  { label: '资源中断', value: '12', unit: '分钟', tone: 'warning', trend: 'down' },
  { label: '异常', value: '3', unit: '项', tone: 'danger', hint: '需关注' },
]
</script>

# NvKpiBar 关键指标条

大屏顶部的一排关键指标，支持趋势符号与语义色。

## 示例

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvKpiBar :items="metrics" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvKpiBar :items="metrics" size="lg" aria-label="今日关键指标" />
  </div>
</Demo>

## API

### NvKpiBar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 指标列表，必填 | `KpiItem[]` | — |
| `size` | 尺寸 | `md \| lg` | `md` |
| `ariaLabel` | 列表的无障碍标签 | `string` | `关键指标` |

### KpiItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `label` | 指标名称 | `string` |
| `value` | 指标值 | `string \| number` |
| `unit` | 数值单位 | `string` |
| `hint` | 辅助说明 | `string` |
| `trend` | 趋势，渲染为 ▲ / ▼ / — | `up \| down \| flat` |
| `tone` | 数值语义色 | `default \| accent \| success \| warning \| danger` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `item` | 自定义单个指标内容，作用域为 `{ item, index }` |

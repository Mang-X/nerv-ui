---
title: NvScreenSummaryCard 汇总卡片
---

<script setup>
import { NvScreenSummaryCard } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const trend = [42, 44, 41, 48, 52, 50, 58, 61, 57, 64, 66, 70]
const metrics = [
  { label: '计划', value: 3200 },
  { label: '实际', value: 3050 },
  { label: '差异', value: -150, tone: 'danger' },
]
const chips = [
  { label: '第一分组', tone: 'success' },
  { label: '第二分组', tone: 'warning' },
  { label: '第三分组', tone: 'danger' },
]
</script>

# NvScreenSummaryCard 汇总卡片

大屏汇总卡，一个主指标配对比值与迷你趋势线，适合周期、区域级的总量展示。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
    <NvScreenSummaryCard
      title="今日计划达成"
      description="全部分组 · 截至 10:12"
      variant="feature"
      :status="{ label: '正常', tone: 'success' }"
      :primary="{ label: '达成率', value: 95.3, unit: '%', tone: 'success' }"
      :comparison="[
        { label: '较昨日', value: '+1.2%', tone: 'success' },
        { label: '较上周', value: '-0.4%', tone: 'warning' },
      ]"
      :metrics="metrics"
      :trend="trend"
      trend-label="近 12 个周期达成率"
      :progress="95"
      chips-label="异常分组"
      :chips="chips"
      note="第三分组已中断 18 分钟，需关注。"
      note-tone="danger"
    />
    <NvScreenSummaryCard
      title="资源综合效率"
      reference="利用率 · 全组织"
      :variant="'compact'"
      :primary="{ label: '利用率', value: 78.4, unit: '%' }"
      :metrics="[
        { label: '可用率', value: 86.2, unit: '%' },
        { label: '性能', value: 92.1, unit: '%' },
      ]"
      :trend="[70, 72, 69, 75, 78, 76, 80]"
      :progress="78"
    />
  </div>
</Demo>

## API

### NvScreenSummaryCard 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 卡片标题，必填 | `string` | — |
| `description` | 标题下方说明 | `string` | — |
| `reference` | 标题下方的编号 / 引用行 | `string` | — |
| `variant` | 版式 | `default \| compact \| feature` | `default` |
| `status` | 右上角状态 | `SummaryStatus` | — |
| `primary` | 主指标 | `SummaryMetric` | — |
| `comparison` | 对比值列表 | `SummaryComparison[]` | `[]` |
| `metrics` | 次级指标列表 | `SummaryMetric[]` | `[]` |
| `progress` | 0–100 装饰性进度；非有限值不渲染 | `number \| null` | `null` |
| `trend` | 迷你趋势样本；至少两个有限值才绘制 | `ReadonlyArray<number \| null>` | — |
| `trendLabel` | 趋势图的无障碍说明 | `string` | — |
| `trendTone` | 趋势线语义色 | `SummaryTone` | `accent` |
| `chipsLabel` | 底部标签组标题 | `string` | — |
| `chips` | 底部状态标签 | `SummaryStatus[]` | `[]` |
| `note` | 底部说明 | `string` | — |
| `noteTone` | 底部说明语义色 | `SummaryTone` | — |

### SummaryMetric / SummaryComparison

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 稳定标识 | `string \| number` |
| `label` | 指标名 | `string` |
| `value` | 指标值；`null` / 缺失显示破折号 | `number \| string \| null` |
| `unit` | 指标单位 | `string` |
| `tone` | 语义色 | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |

`SummaryStatus` 为 `{ label: string; tone: SummaryTone }`。

### NvScreenSummaryCard 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 标题左侧图标 |
| `footer` | 替换底部说明区 |
| `default` | 卡片末尾追加内容 |

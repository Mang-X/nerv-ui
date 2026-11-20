---
title: NvScreenSummaryCard 入口与摘要
---

<script setup>
import { ref } from 'vue'
import { NvScreenSummaryCard } from '@nerv-ui/ui'
const result = ref('请选择空间')
</script>

# NvScreenSummaryCard 入口与摘要

独立宿主 `/#screen/summary-cards` 提供两个中性来源、三个变体、0/1/6 张布局与数据替换。

## 示例

<ScreenDemo>
  <div style="width:100%;min-width:0">
    <NvScreenSummaryCard identity="reading" title="河岸阅读空间" variant="launcher" description="今日的开放与到访" :metrics="[{ key: 'arrived', label: '到访', value: 0 }, { key: 'pending', label: '待确认', value: null }]" :status="{ label: '欢迎到访', tone: 'green' }" :chips="[{ key: 'east', label: '东侧阅读区', tone: 'green' }]" chips-label="开放区域" action-label="查看安排" @action="result = '已选择河岸阅读空间'" />
    <p role="status">{{ result }}</p>
  </div>
</ScreenDemo>

## API

### NvScreenSummaryCard 属性

| 属性                         | 类型                                          | 默认 | 说明                                              |
| ---------------------------- | --------------------------------------------- | ---- | ------------------------------------------------- |
| `identity`                   | `string \| number`                            | 必填 | 动作回传的稳定身份                                |
| `title` / `variant`          | `string` / `'launcher' \| 'health' \| 'line'` | 必填 | 标题与来源布局                                    |
| `metrics`                    | `readonly ScreenSummaryMetric[]`              | 必填 | 次指标；空数组不生成指标项                        |
| `description` / `reference`  | `string`                                      | 无   | 人读说明 / 技术引用号                             |
| `status` / `notice`          | `ScreenSummaryStatus`                         | 无   | 显式状态 / 警示文案                               |
| `primary`                    | `ScreenSummaryMetric`                         | 无   | 主指标                                            |
| `comparison`                 | `readonly ScreenSummaryMetric[]`              | `[]` | 比较指标                                          |
| `progress`                   | `number \| null`                              | 无   | 只画装饰进度；未知不填充                          |
| `trend` / `trendLabel`       | `number[]` / `string`                         | 无   | literal 趋势及可访问名称；提供 trend 时须提供名称 |
| `chips` / `dots`             | `readonly ScreenSummaryItem[]`                | `[]` | 状态 chips / 点排，稳定 key                       |
| `chipsLabel` / `actionLabel` | `string`                                      | 无   | 分组标签 / 按钮文案                               |

主桶同时导出以下类型：

```ts
type ScreenSummaryTone = 'cyan' | 'green' | 'amber' | 'red'
interface ScreenSummaryStatus {
  label: string
  tone: ScreenSummaryTone
}
interface ScreenSummaryItem extends ScreenSummaryStatus {
  key: string | number
}
interface ScreenSummaryMetric {
  key: string | number
  label: string
  value?: number | string | null
  unit?: string
  tone?: ScreenSummaryTone
}
```

### 事件

| 事件     | 载荷               | 说明                     |
| -------- | ------------------ | ------------------------ |
| `action` | `string \| number` | 仅由真实按钮触发；宿主负责导航 |

### 插槽

| 插槽   | 说明                                         |
| ------ | -------------------------------------------- |
| `icon` | 只承载装饰图标，内部不放交互                 |

## 设计说明

根沿用 Panel 的 section 与原生 attrs；可由宿主提供 `aria-labelledby`。趋势使用 `role="img"` 和 `trendLabel`，其内部 SVG 为装饰。无内置 DTO、SDK、路由或状态算法。

<!-- @include: ../../../../../DESIGN/components/summary-card.md -->

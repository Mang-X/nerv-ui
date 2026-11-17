---
title: NvDateRangePicker 日期范围选择器
---

<script setup>
import { ref } from 'vue'
import { NvDateRangePicker } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const range = ref(['2026-11-03', '2026-11-14'])
const limited = ref(null)
</script>

# NvDateRangePicker 日期范围选择器

起止双输入框加双月日历，选择一段连续日期；受 `min`/`max` 与不可选日期约束。

## 示例

<Demo>
  <NvDateRangePicker v-model:value="range" clearable style="width: 360px" />
</Demo>

当前范围：{{ range ? `${range[0]} → ${range[1]}` : '—' }}

<Demo>
  <NvDateRangePicker v-model:value="limited" month="2026-11" min="2026-11-02" max="2026-11-20" />
  <NvDateRangePicker
    v-model:value="limited"
    month="2026-11"
    :unavailable="[{ from: '2026-11-10', to: '2026-11-12' }]"
  />
</Demo>

<Demo>
  <NvDateRangePicker v-model:value="range" :months="1" placeholder="单月视图" />
  <NvDateRangePicker disabled default-value="['2026-11-03','2026-11-14']" style="width: 340px" />
</Demo>

## API

### NvDateRangePicker 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控值（`v-model:value`）：`[开始, 结束]` 或 `null` | `[string, string] \| null` | — |
| `defaultValue` | 非受控初始值 | `[string, string] \| null` | — |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | — |
| `month` | 首次显示的月份 | `string` | — |
| `defaultMonth` | 非受控初始月份 | `string` | — |
| `min` | 可选的最早日期 | `string` | — |
| `max` | 可选的最晚日期 | `string` | — |
| `unavailable` | 不可选的日期规则 | `DateMatchers` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `locale` | 日期格式与标签语言 | `string` | — |
| `weekStartsOn` | 每周起始日，0 为周日 | `number` | — |
| `weekdayFormat` | 星期标签格式 | `long \| narrow \| short` | — |
| `monthFormat` | 月份标题格式 | `long \| narrow \| short` | — |
| `fixedWeeks` | 固定行数 | `boolean` | — |
| `showOutsideDays` | 显示溢出日期 | `boolean` | — |
| `months` | 并排显示的月份数 | `number` | `2` |
| `pageBy` | 翻页单位 | `month \| page` | — |
| `closeOnSelect` | 选完区间后关闭弹层 | `boolean` | — |
| `today` | 今天的日期 | `string` | — |
| `timeZone` | 计算"今天"的时区 | `string` | — |
| `name` | 提交时的字段名 | `string` | — |
| `startName` | 开始日期的提交名 | `string` | — |
| `endName` | 结束日期的提交名 | `string` | — |
| `form` | 关联表单 id | `string` | — |
| `startPlaceholder` | 开始日期占位文本 | `string` | `开始日期` |
| `endPlaceholder` | 结束日期占位文本 | `string` | `结束日期` |
| `startAriaLabel` | 开始日期字段的无障碍名称 | `string` | `开始日期` |
| `endAriaLabel` | 结束日期字段的无障碍名称 | `string` | `结束日期` |
| `clearable` | 已选范围时显示清除按钮 | `boolean` | `false` |
| `clearLabel` | 清除按钮的无障碍名称 | `string` | `清除日期范围` |
| `triggerLabel` | 日历触发按钮的无障碍名称 | `string` | `打开日历` |
| `prevLabel` / `nextLabel` | 上/下一月按钮的无障碍名称 | `string` | `上个月` / `下个月` |
| `side` | 弹层方向 | `top \| right \| bottom \| left` | `bottom` |
| `align` | 弹层对齐 | `start \| center \| end` | `start` |
| `sideOffset` | 弹层与字段间距（px） | `number` | `6` |

### NvDateRangePicker 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 范围变化，参数为 `[string, string] \| null` |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvDateRangePicker 插槽

无插槽。

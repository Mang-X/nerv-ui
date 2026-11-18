---
title: NvDatePicker 日期选择器
---

<script setup>
import { ref } from 'vue'
import { NvDatePicker } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const picked = ref('2026-11-18')
const limited = ref(null)
const double = ref(null)
const unavailable = ['2026-11-21', { from: '2026-11-24', to: '2026-11-27' }]
</script>

# NvDatePicker 日期选择器

输入框加日历弹层，可选择单个日期；支持最小/最大日期、不可选日期与双月视图。点头部的「年」或「月」可切到年视图 / 月视图快速跳转，选完自动回到日视图。

## 示例

<Demo>
  <NvDatePicker locale="zh-CN" v-model:value="picked" clearable style="width: 220px" />
  <NvDatePicker locale="zh-CN" v-model:value="picked" clearable style="width: 260px" />
</Demo>

当前选择：{{ picked ?? '—' }}

<Demo>
  <NvDatePicker
    locale="zh-CN"
    v-model:value="limited"
    month="2026-11"
    min="2026-11-05"
    max="2026-11-25"
    placeholder="限 11/05 – 11/25"
  />
  <NvDatePicker
    locale="zh-CN"
    v-model:value="limited"
    month="2026-11"
    :unavailable="unavailable"
    placeholder="含不可选日期"
  />
</Demo>

<Demo>
  <NvDatePicker locale="zh-CN" v-model:value="double" :months="2" placeholder="双月并排" />
  <NvDatePicker locale="zh-CN" v-model:value="picked" :months="2" :close-on-select="false" placeholder="选后不关闭弹层" />
</Demo>

<Demo>
  <NvDatePicker locale="zh-CN" default-value="2026-11-02" :fixed-weeks="true" :show-outside-days="false" placeholder="固定行数 / 隐藏非本月" />
  <NvDatePicker locale="zh-CN" disabled default-value="2026-11-18" />
  <NvDatePicker locale="zh-CN" read-only default-value="2026-11-18" placeholder="只读" />
</Demo>

## API

### NvDatePicker 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控值（`v-model:value`）：ISO 日期或 `null` | `string \| null` | — |
| `defaultValue` | 非受控初始值 | `string \| null` | — |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | — |
| `month` | 首次显示的月份，如 `2026-11` | `string` | — |
| `defaultMonth` | 非受控初始月份 | `string` | — |
| `min` | 可选的最早日期 | `string` | — |
| `max` | 可选的最晚日期 | `string` | — |
| `unavailable` | 不可选的日期：ISO 日期、范围、星期、前后界限或断言函数及其数组 | `DateMatchers` | — |
| `disabled` | 禁用整个控件 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `locale` | 日期格式、月份名与标签语言 | `string` | — |
| `weekStartsOn` | 每周起始日，0 为周日 | `number` | — |
| `weekdayFormat` | 星期标签格式 | `long \| narrow \| short` | — |
| `monthFormat` | 月份标题格式 | `long \| narrow \| short` | — |
| `fixedWeeks` | 固定行数，避免月份切换时高度跳动 | `boolean` | — |
| `showOutsideDays` | 显示相邻月份的溢出日期 | `boolean` | — |
| `months` | 并排显示的月份数 | `number` | `1` |
| `pageBy` | 翻页单位 | `month \| page` | — |
| `closeOnSelect` | 选中日期后关闭弹层 | `boolean` | — |
| `today` | 今天的日期，用于 `aria-current` 与起始月份 | `string` | — |
| `timeZone` | 计算"今天"的时区 | `string` | — |
| `name` | 提交时的字段名 | `string` | — |
| `form` | 关联表单 id | `string` | — |
| `placeholder` | 未选择时的占位文本 | `string` | `选择日期` |
| `ariaLabel` | 日期字段的无障碍名称 | `string` | `日期` |
| `clearable` | 已选日期时显示清除按钮 | `boolean` | `false` |
| `clearLabel` | 清除按钮的无障碍名称 | `string` | `清除日期` |
| `triggerLabel` | 日历触发按钮的无障碍名称 | `string` | `打开日历` |
| `prevLabel` | 上一月按钮的无障碍名称 | `string` | `上个月` |
| `nextLabel` | 下一月按钮的无障碍名称 | `string` | `下个月` |
| `side` | 弹层方向 | `top \| right \| bottom \| left` | `bottom` |
| `align` | 弹层对齐 | `start \| center \| end` | `start` |
| `sideOffset` | 弹层与字段间距（px） | `number` | `6` |

### NvDatePicker 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 选中日期变化，参数为 `string \| null` |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvDatePicker 插槽

无插槽；输入框、清除按钮、日历触发与日历面板由组件内置。

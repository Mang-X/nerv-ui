---
title: NvTimePicker 时间选择器
---

<script setup>
import { ref } from 'vue'
import { NvTimePicker } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const time = ref('14:30')
const precise = ref('08:15:42')
</script>

# NvTimePicker 时间选择器

分段键入式时间输入，按分钟或秒粒度，支持 12/24 小时制与范围约束。
分段之间可用 Tab / ↑↓ 或直接输入数字切换，无需先点中某一段。

## 示例

<Demo>
  <NvTimePicker v-model:value="time" aria-label="交班时间" />
  <NvTimePicker v-model:value="precise" aria-label="精确到秒的时间" granularity="second" />
</Demo>

当前时间：{{ time ?? '—' }} / {{ precise ?? '—' }}

<Demo>
  <NvTimePicker locale="zh-CN" v-model:value="time" aria-label="12 小时制" hour-cycle="12" />
  <NvTimePicker locale="zh-CN" v-model:value="time" aria-label="营业时间" min="09:00" max="17:30" />
</Demo>

<Demo>
  <NvTimePicker default-value="09:00" aria-label="整点时间" granularity="hour" />
  <NvTimePicker disabled default-value="14:30" aria-label="禁用的时间选择" />
  <NvTimePicker read-only default-value="14:30" aria-label="只读的时间选择" />
</Demo>

## API

### NvTimePicker 属性

| 属性           | 说明                                                         | 类型                       | 默认     |
| -------------- | ------------------------------------------------------------ | -------------------------- | -------- |
| `value`        | 受控值（`v-model:value`）：`"14:30"`、`"14:30:15"` 或 `null` | `string \| null`           | —        |
| `defaultValue` | 非受控初始值                                                 | `string \| null`           | —        |
| `granularity`  | 最小单位；`second` 时显示秒段                                | `hour \| minute \| second` | `minute` |
| `hourCycle`    | 12 或 24 小时制，默认跟随语言区域                            | `12 \| 24`                 | —        |
| `min`          | 最早时间，如 `"09:00"`                                       | `string`                   | —        |
| `max`          | 最晚时间，如 `"17:30"`                                       | `string`                   | —        |
| `locale`       | 语言区域，影响分段格式                                       | `string`                   | —        |
| `disabled`     | 禁用                                                         | `boolean`                  | `false`  |
| `readOnly`     | 只读                                                         | `boolean`                  | `false`  |
| `required`     | 必填                                                         | `boolean`                  | `false`  |
| `name`         | 提交时的字段名                                               | `string`                   | —        |
| `form`         | 关联表单 id                                                  | `string`                   | —        |

### NvTimePicker 事件

| 事件           | 说明                              |
| -------------- | --------------------------------- |
| `update:value` | 时间变化，参数为 `string \| null` |

### NvTimePicker 插槽

无插槽；时/分/秒分段由组件内置。

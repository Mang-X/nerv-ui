---
title: NvMobileDatePicker 日期选择器
---

<script setup>
import { ref } from 'vue'
import { NvMobileDatePicker } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const date = ref('2026-11-18')
const shown = ref('2026-11-18')

function onChange(value) {
  shown.value = value
}
</script>

# NvMobileDatePicker 日期选择器

年 / 月 / 日三列滚轮组成的移动端日期选择器，支持最小、最大日期约束。

## 示例

<Demo>
  <NvMobileDatePicker
    v-model="date"
    trigger-label="选择日期"
    title="选择交期"
    min="2026-01-01"
    max="2026-12-31"
    @change="onChange"
  />
  <span style="font-size: 13px">当前日期：<span v-text="shown"></span></span>
</Demo>

<Demo>
  <NvMobileDatePicker
    title="限制年份范围"
    default-value="2026-06-15"
    :year-range="[2024, 2028]"
  />
</Demo>

## API

### NvMobileDatePicker 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `title` | 标题 | `string` | `选择日期` |
| `modelValue` | ISO 日期字符串，`YYYY-MM-DD`；`null` 表示未选 | `string \| null` | — |
| `defaultValue` | 非受控初始日期 | `string \| null` | `null` |
| `min` | 最早可选日期，`YYYY-MM-DD` | `string` | — |
| `max` | 最晚可选日期，`YYYY-MM-DD` | `string` | — |
| `yearRange` | 未由 `min` / `max` 定义年份时的可见年份区间 | `[number, number]` | — |
| `confirmText` | 确认按钮文案 | `string` | `确定` |
| `cancelText` | 取消按钮文案 | `string` | `取消` |
| `showCancel` | 显示取消按钮 | `boolean` | `true` |
| `ariaLabel` | 无标题时的无障碍名称 | `string` | `日期选择器` |
| `modal` | `true` 锁定焦点并屏蔽页面；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 是否允许点击遮罩关闭 | `boolean` | `true` |
| `triggerLabel` | 内建触发按钮文案；不传则由调用方控制 `open` | `string` | — |

### NvMobileDatePicker 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `open-change` | 展开状态变化，参数为 `boolean` |
| `update:modelValue` | 确认时回传 `YYYY-MM-DD` |
| `change` | 确认时回传 `YYYY-MM-DD` |
| `confirm` | 确认时回传 `YYYY-MM-DD` |
| `cancel` | 点击取消按钮 |

### NvMobileDatePicker 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 替换内建触发按钮内容 |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `cancel` | 自定义取消按钮内容 |
| `confirm` | 自定义确认按钮内容 |

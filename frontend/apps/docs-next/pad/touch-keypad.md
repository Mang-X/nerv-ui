---
title: NvTouchKeypad 触屏数字键盘
---

<script setup>
import { ref } from 'vue'
import { NvTouchKeypad } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'

const quantity = ref('12')
const signed = ref('-3.5')
const confirmed = ref('12')
const lastConfirmed = ref('12')

function onConfirm(value) {
  lastConfirmed.value = value || '空'
}
</script>

# NvTouchKeypad 触屏数字键盘

平板端的数字录入键盘，上方读数实时回显，支持小数、正负号、退格与确认。

## 示例

<Demo block>
  <NvTouchKeypad v-model="quantity" :max-length="8" show-clear />
</Demo>

<p style="margin: 0; font-size: 14px; opacity: 0.72">
  当前读数：<span v-text="quantity || '空'"></span>
</p>

<Demo block>
  <NvTouchKeypad
    v-model="confirmed"
    allow-negative
    placeholder="请输入数量"
    confirm-label="记录数量"
    @confirm="onConfirm"
  />
</Demo>

<p style="margin: 0; font-size: 14px; opacity: 0.72">
  上次确认：<span v-text="lastConfirmed"></span>
</p>

<Demo block>
  <NvTouchKeypad v-model="signed" allow-negative allow-decimal />
</Demo>

<Demo block>
  <NvTouchKeypad :default-value="'18'" disabled />
</Demo>

## API

### NvTouchKeypad 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 绑定值（`v-model`） | `string` | — |
| `defaultValue` | 非受控初始值 | `string` | `''` |
| `allowDecimal` | 显示小数点键并接受 `.`；为 `false` 时该键变为 `00` | `boolean` | `true` |
| `allowNegative` | 显示正负号键并接受前导 `-` | `boolean` | `false` |
| `maxLength` | 读数最大字符数 | `number` | `12` |
| `disabled` | 禁用整组按键 | `boolean` | `false` |
| `display` | 显示按键上方的读数 | `boolean` | `true` |
| `placeholder` | 读数为空时的占位文案 | `string` | `0` |
| `showConfirm` | 显示整宽确认按钮 | `boolean` | `true` |
| `showClear` | 显示清空按钮 | `boolean` | `false` |
| `confirmLabel` | 确认按钮文案 | `string` | `确认` |
| `clearLabel` | 清空按钮文案 | `string` | `清空` |
| `deleteLabel` | 退格键的无障碍名称 | `string` | `退格` |
| `signLabel` | 正负号键的无障碍名称 | `string` | `正负号` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 读数变化，参数为 `string` |
| `confirm` | 点击确认，参数为当前 `string` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `display` | 替换读数区域 |
| `actions` | 替换底部操作行 |

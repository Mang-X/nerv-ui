---
title: NvTouchSwitch 触屏开关
---

<script setup>
import { ref } from 'vue'
import { NvTouchSwitch } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'

const notify = ref(true)
const compact = ref(false)
const autoSave = ref(true)
</script>

# NvTouchSwitch 触屏开关

平板端的布尔状态开关，轨道 104×56px，标签可放在轨道两侧。

## 示例

<Demo>
  <NvTouchSwitch v-model="notify" label="接收变化提醒" />
</Demo>

<p style="margin: 0; font-size: 14px; opacity: 0.72">
  提醒状态：<span v-text="notify ? '开启' : '关闭'"></span>
</p>

<Demo>
  <NvTouchSwitch v-model="compact" label="紧凑显示" label-position="end" />
  <NvTouchSwitch v-model="autoSave" label="自动保存" />
</Demo>

<Demo>
  <NvTouchSwitch default-checked label="禁用·开" disabled />
  <NvTouchSwitch label="禁用·关" disabled />
</Demo>

<Demo>
  <NvTouchSwitch :model-value="true" label="只读" read-only />
  <NvTouchSwitch aria-label="无可见标签的开关" />
</Demo>

## API

### NvTouchSwitch 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 受控开关状态（`v-model`） | `boolean` | — |
| `defaultChecked` | 非受控初始状态 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时使用的字段名 | `string` | — |
| `value` | 开启时提交的值 | `string` | — |
| `label` | 轨道旁的可见标签 | `string` | — |
| `labelPosition` | 标签相对轨道的位置 | `start \| end` | `start` |
| `aria-label` | 无可见标签时的无障碍名称 | `string` | — |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 开关状态变化，参数为 `boolean` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义标签内容，替代 `label` 文案 |

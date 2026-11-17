---
title: NvMobileSwitch 开关
---

<script setup>
import { ref } from 'vue'
import { NvMobileSwitch } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const notify = ref(true)
const sync = ref(false)
</script>

# NvMobileSwitch 开关

移动端布尔状态开关，整行可点，适合设置项。

## 示例

<Demo>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <NvMobileSwitch v-model="notify">接收消息通知</NvMobileSwitch>
    <NvMobileSwitch v-model="sync">自动同步</NvMobileSwitch>
  </div>
</Demo>

当前通知状态：{{ notify ? '开启' : '关闭' }}

<Demo>
  <NvMobileSwitch :model-value="true" disabled>禁用·开</NvMobileSwitch>
  <NvMobileSwitch :model-value="false" disabled>禁用·关</NvMobileSwitch>
  <NvMobileSwitch :model-value="true" readonly>只读</NvMobileSwitch>
</Demo>

## API

### NvMobileSwitch 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 是否开启 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readonly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 原生字段名 | `string` | — |
| `value` | 提交值 | `string` | — |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 开关状态变化，参数为 `boolean` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 开关左侧的文字标签 |

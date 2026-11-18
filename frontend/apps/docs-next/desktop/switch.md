---
title: NvSwitch 开关
---

<script setup>
import { ref } from 'vue'
import { NvSwitch } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const on = ref(true)
const off = ref(false)
const defaultOn = ref(true)
</script>

# NvSwitch 开关

在开、关两种状态之间即时切换，适合启停类设置。

## 示例

<Demo>
  <div style="display: flex; align-items: center; gap: 10px">
    <NvSwitch v-model:checked="on" />
    <span>{{ on ? '已开启' : '已关闭' }}</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px">
    <NvSwitch v-model:checked="off" />
    <span>{{ off ? '已开启' : '已关闭' }}</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px">
    <NvSwitch :checked="true" disabled />
    <span>禁用·开</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px">
    <NvSwitch :checked="false" disabled />
    <span>禁用·关</span>
  </div>
</Demo>

<Demo>
  <div style="display: flex; align-items: center; gap: 10px">
    <NvSwitch v-model:checked="defaultOn" />
    <span>默认开启，可直接切换</span>
  </div>
</Demo>

## API

### NvSwitch 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `checked` | 受控开关状态（`v-model:checked`） | `boolean` | — |
| `defaultChecked` | 非受控初始状态 | `boolean` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时的字段名 | `string` | — |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:checked` | 开关状态变化，参数为 `boolean` |

---
title: NvSlider 滑块
---

<script setup>
import { ref } from 'vue'
import { NvSlider } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const volume = ref(40)
const range = ref([20, 60])
const stepped = ref(30)
</script>

# NvSlider 滑块

拖动选择单个或多个数值，支持范围双滑块与步进约束。

## 示例

<Demo>
  <div style="width: 280px">
    <NvSlider v-model:value="volume" aria-label="音量" show-value />
  </div>
  <div style="width: 280px">
    <NvSlider v-model:value="range" aria-label="价格区间" :min="0" :max="100" show-value />
  </div>
</Demo>

当前音量：{{ volume }}；范围：{{ range[0] }} – {{ range[1] }}

<Demo>
  <div style="width: 280px">
    <NvSlider v-model:value="stepped" aria-label="步进值" :min="0" :max="100" :step="10" show-value />
  </div>
  <div style="width: 280px">
    <NvSlider :value="30" aria-label="禁用滑块" disabled show-value />
  </div>
  <div style="width: 280px">
    <NvSlider :value="70" aria-label="只读滑块" read-only show-value />
  </div>
</Demo>

## API

### NvSlider 属性

| 属性           | 说明                                                      | 类型                     | 默认         |
| -------------- | --------------------------------------------------------- | ------------------------ | ------------ |
| `value`        | 受控值（`v-model:value`）；范围滑块传数组，每个滑块一个值 | `number \| number[]`     | —            |
| `defaultValue` | 非受控初始值                                              | `number \| number[]`     | —            |
| `min`          | 最小值                                                    | `number`                 | —            |
| `max`          | 最大值                                                    | `number`                 | —            |
| `step`         | 步进值                                                    | `number`                 | —            |
| `disabled`     | 禁用                                                      | `boolean`                | `false`      |
| `readOnly`     | 只读，不可拖动                                            | `boolean`                | `false`      |
| `orientation`  | 方向                                                      | `horizontal \| vertical` | `horizontal` |
| `showValue`    | 在轨道下方显示格式化后的值                                | `boolean`                | `false`      |
| `label`        | 所有滑块共享的无障碍名称                                  | `string`                 | —            |

### 事件

| 事件           | 说明                                |
| -------------- | ----------------------------------- |
| `update:value` | 值变化，参数为 `number \| number[]` |

---
title: NvMobileSlider 滑块
---

<script setup>
import { ref } from 'vue'
import { NvMobileSlider } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const volume = ref(35)
const range = ref(70)
</script>

# NvMobileSlider 滑块

移动端的单值滑块，支持步长、只读、禁用与右侧数值展示。

## 示例

<Demo block>
  <NvMobileSlider v-model="volume" label="音量" aria-label="音量" show-value />
  <span style="font-size: 13px">当前值：<span v-text="volume"></span></span>
</Demo>

<Demo block>
  <NvMobileSlider v-model="range" :min="0" :max="200" :step="10" aria-label="批量数量" show-value />
  <NvMobileSlider :default-value="60" disabled aria-label="禁用滑块" show-value />
  <NvMobileSlider :default-value="20" readonly aria-label="只读滑块" show-value />
</Demo>

## API

### NvMobileSlider 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 受控值（`v-model`） | `number` | — |
| `defaultValue` | 非受控初始值 | `number` | — |
| `min` | 最小值 | `number` | `0` |
| `max` | 最大值 | `number` | `100` |
| `step` | 步长 | `number` | `1` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readonly` | 只读 | `boolean` | `false` |
| `showValue` | 轨道右侧显示当前值 | `boolean` | `false` |
| `ariaLabel` | 滑块的无障碍名称 | `string` | `滑块` |

### NvMobileSlider 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 值变化，参数为 `number` |
| `change` | 值变化，参数为 `number` |

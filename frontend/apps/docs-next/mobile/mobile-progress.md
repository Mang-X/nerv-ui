---
title: NvMobileProgress 进度条
---

<script setup>
import { ref } from 'vue'
import { NvMobileButton, NvMobileProgress } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const value = ref(42)
</script>

# NvMobileProgress 进度条

移动端任务进度展示，支持确定值与不确定态，以及品牌、危险、中性三种语义色。

## 示例

<Demo block>
  <NvMobileProgress :value="value" label="本记录完成度" show-value />
  <div style="display: flex; gap: 8px">
    <NvMobileButton size="md" variant="secondary" @click="value = Math.max(0, value - 10)">减 10</NvMobileButton>
    <NvMobileButton size="md" @click="value = Math.min(100, value + 10)">加 10</NvMobileButton>
  </div>
</Demo>

<Demo block>
  <NvMobileProgress :value="null" label="正在计算" />
  <NvMobileProgress :value="68" variant="danger" label="异常率" show-value />
  <NvMobileProgress :value="86" variant="neutral" label="负载" size="sm" show-value />
  <NvMobileProgress :value="100" label="已完成" size="lg" show-value />
</Demo>

## API

### NvMobileProgress 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 当前进度；`null` 渲染不确定态 | `number \| null` | `null` |
| `min` | 进度下限 | `number` | `0` |
| `max` | 进度上限 | `number` | `100` |
| `label` | 进度名称 | `string` | — |
| `showValue` | 在右侧显示数值 | `boolean` | `false` |
| `size` | 轨道高度 | `sm \| md \| lg` | `md` |
| `variant` | 语义色 | `brand \| danger \| neutral` | `brand` |

### NvMobileProgress 插槽

| 插槽 | 说明 |
| --- | --- |
| `label` | 自定义进度名称 |
| `value` | 自定义数值区，作用域参数为 `{ state }` |

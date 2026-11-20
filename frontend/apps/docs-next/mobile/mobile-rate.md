---
title: NvMobileRate 评分
---

<script setup>
import { ref } from 'vue'
import { NvMobileRate } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const score = ref(3)
const half = ref(2.5)
</script>

# NvMobileRate 评分

星级评分控件，支持半星、再次点击取消、只读与尺寸切换。

## 示例

<Demo>
  <NvMobileRate v-model="score" show-value />
  <span style="font-size: 13px">当前 <span v-text="score"></span> 分</span>
</Demo>

<Demo>
  <NvMobileRate v-model="half" :step="0.5" deselectable show-value size="lg" />
</Demo>

<Demo>
  <NvMobileRate :default-value="4" readonly size="sm" />
  <NvMobileRate :default-value="2" disabled />
</Demo>

## API

### NvMobileRate 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 受控评分（`v-model`）；`null` 表示未评分 | `number \| null` | — |
| `defaultValue` | 非受控初始评分 | `number \| null` | `null` |
| `max` | 星数 | `number` | `5` |
| `step` | 最小变化量，占一颗星的比例；`0.5` 支持半星 | `number` | `1` |
| `deselectable` | 允许再次点击已选星取消评分 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readonly` | 只读展示 | `boolean` | `false` |
| `showValue` | 星级右侧显示数值 | `boolean` | `false` |
| `ariaLabel` | 评分控件的无障碍名称 | `string` | `评分` |
| `size` | 尺寸 | `sm \| md \| lg` | `md` |

### NvMobileRate 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 评分变化，参数为 `number \| null` |
| `change` | 评分变化，参数为 `number \| null` |

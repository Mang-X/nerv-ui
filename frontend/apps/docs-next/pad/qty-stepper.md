---
title: NvQtyStepper 数量步进器
---

<script setup>
import { ref } from 'vue'
import { NvQtyStepper } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'

const qty = ref(2)
const bounded = ref(5)
</script>

# NvQtyStepper 数量步进器

平板端的数量加减控件，左右为大触控按钮，中间可直接输入。

## 示例

<Demo>
  <NvQtyStepper v-model="qty" :min="0" :max="99" :step="1" />
</Demo>

当前数量：{{ qty }}

<Demo>
  <NvQtyStepper v-model="bounded" :min="1" :max="10" size="lg" />
</Demo>

<Demo>
  <NvQtyStepper v-model="qty" :min="0" :max="99" disabled />
  <NvQtyStepper v-model="qty" :min="0" :max="99" read-only />
</Demo>

## API

### NvQtyStepper 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 绑定值 | `number \| null` | `1` |
| `min` | 最小值 | `number` | `0` |
| `max` | 最大值 | `number` | — |
| `step` | 加减步长 | `number` | `1` |
| `largeStep` | 大步长 | `number` | — |
| `smallStep` | 小步长 | `number` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `readOnly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 原生字段名 | `string` | — |
| `size` | 尺寸 | `md \| lg` | `md` |
| `decrementLabel` | 减按钮的无障碍标签 | `string` | `减少` |
| `incrementLabel` | 加按钮的无障碍标签 | `string` | `增加` |
| `controlLabel` | 输入框的无障碍标签 | `string` | `数量` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 数量变化，参数为 `number \| null` |

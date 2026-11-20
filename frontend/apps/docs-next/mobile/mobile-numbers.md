---
title: NvMobileNumbers 数字输入
---

<script setup>
import { ref } from 'vue'
import { NvMobileNumbers } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const qty = ref(12)
const blank = ref(null)
</script>

# NvMobileNumbers 数字输入

带增减按钮的移动端数字输入，支持步长、长按大步长与边界约束。

## 示例

<Demo block>
  <NvMobileNumbers v-model="qty" label="提交数量" :min="0" :max="200" />
  <span style="font-size: 13px">当前数量：<span v-text="qty ?? '空'"></span></span>
</Demo>

<Demo block>
  <NvMobileNumbers v-model="blank" label="可清空" :min="0" :max="99" />
  <NvMobileNumbers :default-value="5" label="仅输入" :show-decrement="false" :show-increment="false" />
  <NvMobileNumbers :default-value="0" disabled label="禁用" />
  <NvMobileNumbers :default-value="8" readonly label="只读" />
</Demo>

## API

### NvMobileNumbers 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 受控值（`v-model`）；`null` 表示空 | `number \| null` | — |
| `defaultValue` | 非受控初始值 | `number \| null` | `null` |
| `min` | 最小值 | `number` | `0` |
| `max` | 最大值 | `number` | `9999` |
| `step` | 步长 | `number` | `1` |
| `largeStep` | 大步长 | `number` | `10` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readonly` | 只读 | `boolean` | `false` |
| `name` | 提交字段名 | `string` | — |
| `label` | 输入框与增减按钮的无障碍标签 | `string` | — |
| `incrementLabel` | 增加按钮的无障碍标签 | `string` | `增加` |
| `decrementLabel` | 减少按钮的无障碍标签 | `string` | `减少` |
| `showDecrement` | 显示减号按钮 | `boolean` | `true` |
| `showIncrement` | 显示加号按钮 | `boolean` | `true` |

### NvMobileNumbers 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 值变化，参数为 `number \| null` |
| `change` | 值变化，参数为 `number \| null` |

---
title: NvMobileRadio 单选框
---

<script setup>
import { ref } from 'vue'
import { NvMobileRadio, NvMobileRadioGroup } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const picked = ref('standard')
const options = [
  { value: 'standard', label: '标准版' },
  { value: 'pro', label: '专业版' },
  { value: 'disabled', label: '不可选', disabled: true },
]
</script>

# NvMobileRadio 单选框

移动端单选组，通常用 `NvMobileRadioGroup` 的 `options` 声明选项。

## 示例

<Demo>
  <NvMobileRadioGroup v-model="picked" :options="options" style="width: 100%" />
</Demo>

当前选择：{{ picked }}

<Demo>
  <NvMobileRadioGroup v-model="picked" :options="options" inline style="width: 100%" />
</Demo>

<Demo>
  <NvMobileRadioGroup v-model="picked" inline>
    <NvMobileRadio value="standard" label="槽位·标准版" />
    <NvMobileRadio value="pro" label="槽位·专业版" />
    <NvMobileRadio value="disabled" label="槽位·不可选" disabled />
  </NvMobileRadioGroup>
</Demo>

## API

### NvMobileRadioGroup 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 选中值 | `string \| null` | — |
| `defaultValue` | 非受控初始值 | `string \| null` | `null` |
| `options` | 选项列表 | `MobileRadioOption[]` | `[]` |
| `disabled` | 整组禁用 | `boolean` | `false` |
| `readonly` | 整组只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `inline` | 横向排列 | `boolean` | `false` |
| `name` | 原生字段名 | `string` | — |
| `ariaLabel` | 组的无障碍标签 | `string` | — |

### NvMobileRadio 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 选项值，必填 | `string` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `label` | 文案，也可用默认插槽 | `string` | — |

### MobileRadioOption

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `value` | 选项值 | `string` |
| `label` | 选项文案 | `string` |
| `disabled` | 是否禁用 | `boolean` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中值变化，参数为 `string \| null` |

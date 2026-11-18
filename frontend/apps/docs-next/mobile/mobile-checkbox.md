---
title: NvMobileCheckbox 复选框
---

<script setup>
import { ref } from 'vue'
import { NvMobileCheckbox } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const agreed = ref(false)
const partial = ref('indeterminate')
</script>

# NvMobileCheckbox 复选框

移动端多选与协议勾选，支持选中、未选中和半选三种状态。

## 示例

<Demo>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <NvMobileCheckbox v-model="agreed">我已阅读并同意服务条款</NvMobileCheckbox>
    <NvMobileCheckbox v-model="partial">半选状态（部分子项已选）</NvMobileCheckbox>
  </div>
</Demo>

协议状态：{{ agreed ? '已同意' : '未同意' }}

<Demo>
  <NvMobileCheckbox :model-value="true" disabled>禁用·选中</NvMobileCheckbox>
  <NvMobileCheckbox :model-value="false" disabled>禁用·未选</NvMobileCheckbox>
  <NvMobileCheckbox :model-value="true" readonly>只读</NvMobileCheckbox>
</Demo>

## API

### NvMobileCheckbox 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `modelValue` | 选中状态 | `boolean \| 'indeterminate'` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `readonly` | 只读 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 原生字段名 | `string` | — |
| `value` | 提交值 | `string` | — |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 选中状态变化，参数为 `boolean \| 'indeterminate'` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 复选框右侧的文字标签 |

---
title: NvCheckbox 复选框
---

<script setup>
import { ref } from 'vue'
import { NvCheckbox } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const agreed = ref(false)
const partial = ref('indeterminate')
const selectedAll = ref(true)
</script>

# NvCheckbox 复选框

多选与协议勾选，支持选中、未选中和半选三种状态。

## 示例

<Demo>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <NvCheckbox v-model:checked="agreed">我已阅读并同意服务条款</NvCheckbox>
    <NvCheckbox v-model:checked="partial">半选（部分子项已选）</NvCheckbox>
    <NvCheckbox v-model:checked="selectedAll">全选</NvCheckbox>
  </div>
</Demo>

协议状态：{{ agreed ? '已同意' : '未同意' }}

<Demo>
  <NvCheckbox :checked="true" disabled>禁用·选中</NvCheckbox>
  <NvCheckbox :checked="false" disabled>禁用·未选</NvCheckbox>
  <NvCheckbox label="使用 label 属性" />
  <NvCheckbox default-checked>非受控默认选中</NvCheckbox>
</Demo>

## API

### NvCheckbox 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `checked` | 受控选中状态（`v-model:checked`） | `boolean \| 'indeterminate'` | — |
| `defaultChecked` | 非受控初始状态 | `boolean \| 'indeterminate'` | — |
| `disabled` | 禁用 | `boolean` | `false` |
| `required` | 必填 | `boolean` | `false` |
| `name` | 提交时的字段名 | `string` | — |
| `label` | 复选框右侧文案；默认插槽优先 | `string` | — |
| `id` | 控件与标签共用的 id，未传时自动生成 | `string` | — |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:checked` | 选中状态变化，参数为 `boolean \| 'indeterminate'` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 复选框右侧的文字标签 |

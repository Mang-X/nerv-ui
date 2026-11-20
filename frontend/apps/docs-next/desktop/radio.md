---
title: NvRadio 单选框
---

<script setup>
import { ref } from 'vue'
import { NvRadioGroup, NvRadio } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const delivery = ref('standard')
</script>

# NvRadio 单选框

在一组互斥选项中选择一项，组级支持禁用、只读与键盘导航。

## 示例

<Demo>
  <NvRadioGroup v-model:value="delivery" aria-label="配送方式" name="delivery">
    <NvRadio value="standard">标准配送</NvRadio>
    <NvRadio value="express">加急配送</NvRadio>
    <NvRadio value="pickup">到店自提</NvRadio>
  </NvRadioGroup>
</Demo>

当前选项：{{ delivery }}

<Demo>
  <NvRadioGroup default-value="a" aria-label="可用性示例">
    <NvRadio value="a">可选项</NvRadio>
    <NvRadio value="b" disabled>不可选项</NvRadio>
  </NvRadioGroup>
  <NvRadioGroup default-value="fixed" aria-label="只读示例" read-only>
    <NvRadio value="fixed">只读·已选</NvRadio>
    <NvRadio value="other">只读·未选</NvRadio>
  </NvRadioGroup>
  <NvRadioGroup default-value="on" aria-label="禁用示例" disabled>
    <NvRadio value="on">禁用·已选</NvRadio>
    <NvRadio value="off">禁用·未选</NvRadio>
  </NvRadioGroup>
</Demo>

## API

### NvRadioGroup 属性

| 属性           | 说明                      | 类型             | 默认    |
| -------------- | ------------------------- | ---------------- | ------- |
| `value`        | 受控值（`v-model:value`） | `string \| null` | —       |
| `defaultValue` | 非受控初始值              | `string \| null` | —       |
| `disabled`     | 禁用整组                  | `boolean`        | `false` |
| `readOnly`     | 只读整组                  | `boolean`        | `false` |
| `required`     | 必填                      | `boolean`        | `false` |
| `name`         | 提交时的字段名            | `string`         | —       |

### NvRadioGroup 事件

| 事件           | 说明                                |
| -------------- | ----------------------------------- |
| `update:value` | 选中值变化，参数为 `string \| null` |

### NvRadioGroup 插槽

| 插槽      | 说明                 |
| --------- | -------------------- |
| `default` | 放置该组的 `NvRadio` |

### NvRadio 属性

| 属性       | 说明                         | 类型      | 默认    |
| ---------- | ---------------------------- | --------- | ------- |
| `value`    | 该选项在组内的值，必填       | `string`  | —       |
| `disabled` | 禁用该选项                   | `boolean` | `false` |
| `label`    | 指示器右侧文案；默认插槽优先 | `string`  | —       |

### NvRadio 插槽

| 插槽      | 说明                 |
| --------- | -------------------- |
| `default` | 指示器右侧的文字标签 |

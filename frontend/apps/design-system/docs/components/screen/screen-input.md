---
title: NvScreenInput 输入框
---

<script setup>
import { ref } from 'vue'
import { NvScreenInput } from '@nerv-iip/ui'

const wo = ref('城市漫步')
const qty = ref('1240')
const bad = ref('')
</script>

# NvScreenInput 输入框

大屏文本输入:一口下沉的暗井,聚焦点亮青色环;`error` 态把细线与环换成红色(并标记 `aria-invalid`),状态不只靠颜色传达。可选 `suffix` 在右侧钉一个单位(件 / kWh / %)。通过 `v-model`(字符串)绑定,基于独立的 `--nv-scr-*` 令牌。

## 基础用法

`v-model` 绑定字符串值;`suffix` 固定一个单位。

<ScreenDemo>
  <div style="display:flex;flex-direction:column;gap:12px;width:280px">
    <NvScreenInput v-model="wo" placeholder="活动名称" />
    <NvScreenInput v-model="qty" suffix="人" placeholder="来访人数" />
  </div>
</ScreenDemo>

```vue
<script setup>
const wo = ref('城市漫步')
const qty = ref('1240')
</script>

<template>
  <NvScreenInput v-model="wo" placeholder="活动名称" />
  <NvScreenInput v-model="qty" suffix="人" placeholder="来访人数" />
</template>
```

## 错误与禁用

`error` 标红提示校验失败;`disabled` 整体淡出并禁止输入。

<ScreenDemo>
  <div style="display:flex;flex-direction:column;gap:12px;width:280px">
    <NvScreenInput v-model="bad" error placeholder="活动名称必填" />
    <NvScreenInput model-value="河岸展厅" disabled />
  </div>
</ScreenDemo>

```vue
<NvScreenInput v-model="bad" error placeholder="活动名称必填" />
<NvScreenInput model-value="河岸展厅" disabled />
```

## 属性

| 属性          | 说明                          | 类型      | 默认       |
| ------------- | ----------------------------- | --------- | ---------- |
| `v-model`     | 输入值                        | `string`  | `''`       |
| `error`       | 错误态(标红 + `aria-invalid`) | `boolean` | `false`    |
| `placeholder` | 占位文本                      | `string`  | `'请输入'` |
| `suffix`      | 右侧单位                      | `string`  | —          |
| `disabled`    | 禁用                          | `boolean` | `false`    |

## 字符串与校验边界

`update:modelValue` 保留字符串，包括 `'0'`、空串和用户尚未填好的文本。`error` 只负责视觉和 `aria-invalid`，校验、错误说明、零与缺失的区分由宿主决定；禁用使用原生 input disabled。`ariaLabel`（可选 string，无默认值）用于缺少可见标签时命名输入。

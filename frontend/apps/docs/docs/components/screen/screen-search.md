---
title: NvScreenSearch 搜索框
---

<script setup>
import { ref } from 'vue'
import { NvScreenSearch } from '@nerv-iip/ui'

const kw = ref('城市漫步')
const empty = ref('')
</script>

# NvScreenSearch 搜索框

大屏搜索框:lucide 放大镜锚定左侧,聚焦时井口点亮青色环;一旦有文本,右侧浮出清除按钮(×)一键抹除。通过 `v-model`(字符串)绑定,基于独立的 `--nv-scr-*` 令牌。

## 示例

### 基础用法

`v-model` 绑定关键词;有内容时自动显示清除按钮。

<ScreenDemo>
  <div style="display:flex;flex-direction:column;gap:12px;width:320px">
    <NvScreenSearch v-model="kw" placeholder="搜索书房或展厅" />
    <NvScreenSearch v-model="empty" placeholder="搜索书房或展厅" />
  </div>
</ScreenDemo>

```vue
<script setup>
const kw = ref('城市漫步')
</script>

<template>
  <NvScreenSearch v-model="kw" placeholder="搜索书房或展厅" />
</template>
```

### 禁用态

`disabled` 整体淡出，同时禁止输入与清除。

<ScreenDemo>
  <div style="width:320px">
    <NvScreenSearch model-value="" disabled placeholder="检索已锁定" />
  </div>
</ScreenDemo>

```vue
<NvScreenSearch disabled placeholder="检索已锁定" />
```

## API

### NvScreenSearch 属性

| 属性          | 说明       | 类型      | 默认                         |
| ------------- | ---------- | --------- | ---------------------------- |
| `v-model`     | 搜索关键词 | `string`  | `''`                         |
| `placeholder` | 占位文本   | `string`  | `'搜索编号 / 分组 / 资源'` |
| `disabled`    | 禁用       | `boolean` | `false`                      |

## 设计说明

`update:modelValue` 的参数是字符串；单次清除只更新一次为 `''`，清除按钮随后消失。`disabled` 同时作用于输入和清除按钮，并在清除处理器中守卫。可用 `ariaLabel`（string，默认 `'搜索'`）命名输入。查询和空结果由宿主处理，组件不发请求。旧 placeholder 默认值保留兼容，新场景显式提供中性提示。

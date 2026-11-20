---
layout: page
title: NvMobileTag 标签
---

<script setup>
import { NvMobileTag } from '@nerv-ui/ui-mobile'
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">变体</p>
    <div class="flex flex-wrap items-center gap-1.5">
      <NvMobileTag>常规</NvMobileTag>
      <NvMobileTag variant="brand">优先</NvMobileTag>
      <NvMobileTag variant="success">已归档</NvMobileTag>
      <NvMobileTag variant="warning">待检查</NvMobileTag>
      <NvMobileTag variant="danger">超期</NvMobileTag>
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">尺寸</p>
    <div class="flex flex-wrap items-center gap-1.5">
      <NvMobileTag variant="brand" size="sm">小号</NvMobileTag>
      <NvMobileTag variant="brand" size="md">中号</NvMobileTag>
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">可关闭</p>
    <div class="flex flex-wrap items-center gap-1.5">
      <NvMobileTag variant="brand" closable>Alpha</NvMobileTag>
      <NvMobileTag variant="success" closable>Beta</NvMobileTag>
      <NvMobileTag variant="default" closable>Gamma</NvMobileTag>
    </div>
  </section>
</template>

# NvMobileTag 标签

带文字的小标签，用于状态、分类或筛选条件。区别于 NvMobileBadge 角标（固定在角落的计数 / 红点），NvMobileTag 是排在内容流里的独立色块：柔和的色底配同色系深色文字。

## 示例

`variant` 提供 `default / brand / success / warning / danger` 五种语义色。

```vue
<NvMobileTag variant="success">已归档</NvMobileTag>
<NvMobileTag variant="warning">待检查</NvMobileTag>
<NvMobileTag variant="danger">超期</NvMobileTag>
```

`size` 有 `sm / md` 两档，密集列表里用 `sm`。

```vue
<NvMobileTag variant="brand" size="sm">小号</NvMobileTag>
<NvMobileTag variant="brand" size="md">中号</NvMobileTag>
```

加 `closable` 显示关闭按钮，点击触发 `close` 事件，由父组件移除该标签。

```vue
<NvMobileTag variant="brand" closable @close="remove(t)">Alpha</NvMobileTag>
```

## API

### NvMobileTag 属性

| 属性       | 说明             | 类型                                               | 默认      |
| ---------- | ---------------- | -------------------------------------------------- | --------- |
| `variant`  | 语义色           | `default \| brand \| success \| warning \| danger` | `default` |
| `size`     | 尺寸             | `sm \| md`                                         | `md`      |
| `closable` | 是否显示关闭按钮 | `boolean`                                          | `false`   |

### 事件

| 事件    | 说明               | 回调参数 |
| ------- | ------------------ | -------- |
| `close` | 点击关闭按钮时触发 | —        |

## 设计说明

可关闭标签为关闭按钮保留至少 44×44px 的触点，标签随之增高；非关闭态仍使用原 sm/md 紧凑尺寸。`close` 只通知宿主，宿主决定是否移除标签。

</MobileDoc>

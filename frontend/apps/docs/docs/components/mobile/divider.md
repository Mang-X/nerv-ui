---
layout: page
title: NvMobileDivider 分割线
---

<script setup>
import { NvMobileDivider } from '@nerv-ui/ui-mobile'
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">基础分割</p>
    <div class="text-[15px] text-foreground">记录 REC-20406</div>
    <NvMobileDivider />
    <div class="text-sm text-muted-foreground">项目Alpha · A2 分组</div>
  </section>
  <section>
    <p class="nv-mdoc-label">带文字</p>
    <NvMobileDivider>今日已完成</NvMobileDivider>
  </section>
  <section>
    <p class="nv-mdoc-label">垂直分割</p>
    <div class="flex items-center text-sm text-muted-foreground">
      <span>计划 320</span>
      <NvMobileDivider direction="vertical" class="mx-3" />
      <span>完成 286</span>
      <NvMobileDivider direction="vertical" class="mx-3" />
      <span>异常 4</span>
    </div>
  </section>
</template>

# NvMobileDivider 分割线

一根细发丝线（`var(--border)`），用于在内容块之间做轻量分隔。横向可在中间嵌入说明文字；纵向用于分隔同一行内的若干指标或操作。

## 示例

不带任何内容时渲染一条占满宽度的横向细线。

```vue
<NvMobileDivider />
```

在默认插槽放入文字时，文字居中、两侧自动补齐细线，常用于分隔列表的时间段或分组。

```vue
<NvMobileDivider>今日已完成</NvMobileDivider>
```

`direction="vertical"` 渲染一段与文字等高的竖线，用于行内分隔指标。高度跟随当前字号，配合 `class` 控制左右间距。

```vue
<span>计划 320</span>
<NvMobileDivider direction="vertical" class="mx-3" />
<span>完成 286</span>
```

## API

### NvMobileDivider 属性

| 属性        | 说明                 | 类型                     | 默认         |
| ----------- | -------------------- | ------------------------ | ------------ |
| `direction` | 方向                 | `horizontal \| vertical` | `horizontal` |

### 插槽

| 插槽      | 说明                 |
| --------- | -------------------- |
| `default` | 横向时居中的说明文字 |

</MobileDoc>

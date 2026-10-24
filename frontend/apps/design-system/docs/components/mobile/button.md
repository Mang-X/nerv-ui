---
layout: page
title: NvMobileButton 移动按钮
---

<script setup>
import { NvMobileButton } from '@nerv-iip/ui-mobile'
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">变体</p>
    <div class="flex flex-wrap items-center gap-2">
      <NvMobileButton variant="primary">主操作</NvMobileButton>
      <NvMobileButton variant="default">次要</NvMobileButton>
      <NvMobileButton variant="outline">描边</NvMobileButton>
      <NvMobileButton variant="text">文字</NvMobileButton>
      <NvMobileButton variant="danger">删除</NvMobileButton>
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">尺寸</p>
    <div class="flex flex-wrap items-center gap-2">
      <NvMobileButton variant="primary" size="sm">小号</NvMobileButton>
      <NvMobileButton variant="primary" size="md">中号</NvMobileButton>
      <NvMobileButton variant="primary" size="lg">大号</NvMobileButton>
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">整宽</p>
    <NvMobileButton variant="primary" size="lg" block>整宽主按钮</NvMobileButton>
  </section>
</template>

# NvMobileButton 移动按钮

紧凑、贴近原生的触控按钮，按压时整体变暗反馈。区别于工位大屏的超大 NvTouchButton。右侧手机模拟器为实时组件，随页面滚动吸顶。

## 变体

支持 `primary / default / outline / text / danger` 五种变体。

```vue
<NvMobileButton variant="primary">主操作</NvMobileButton>
<NvMobileButton variant="danger">删除</NvMobileButton>
```

## 尺寸

`sm / md / lg` 三档；加 `block` 占满整行宽度。可见表面与真实动作根统一为 44 / 44 / 48px，最小宽度为 44px；保留字号与横向内边距区别，紧邻控件不会被向外覆盖。背景、文本和描边由公开根的 `class` 覆盖。`asChild` 保留子元素语义与单个动作根。没有独立 `loading` API；宿主需要等待态时，结合 `disabled`、`aria-busy` 与插槽文案。

```vue
<NvMobileButton variant="primary" size="sm">小号</NvMobileButton>
<NvMobileButton variant="primary" size="lg" block>整宽主按钮</NvMobileButton>
```

## 属性

| 属性      | 说明     | 类型                                              | 默认      |
| --------- | -------- | ------------------------------------------------- | --------- |
| `variant` | 视觉变体 | `primary \| default \| outline \| text \| danger` | `default` |
| `size`    | 尺寸     | `sm \| md \| lg`                                  | `md`      |
| `block`   | 是否整宽 | `boolean`                                         | `false`   |

</MobileDoc>

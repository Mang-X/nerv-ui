---
layout: page
title: NvMobileSwitch 开关
---

<script setup>
import { NvCell, NvCellGroup, NvMobileSwitch } from '@nerv-iip/ui-mobile'
import { ref } from 'vue'

const rush = ref(true)
const autoStock = ref(false)
const locked = ref(true)
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">基础用法</p>
    <div style="display:flex;align-items:center;gap:16px">
      <NvMobileSwitch v-model="rush" />
      <NvMobileSwitch v-model="autoStock" />
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">配合单元格</p>
    <NvCellGroup>
      <NvCell title="加急插单">
        <template #value><NvMobileSwitch v-model="rush" /></template>
      </NvCell>
      <NvCell title="完工自动入库">
        <template #value><NvMobileSwitch v-model="autoStock" /></template>
      </NvCell>
    </NvCellGroup>
  </section>
  <section>
    <p class="nv-mdoc-label">禁用</p>
    <NvMobileSwitch v-model="locked" disabled />
  </section>
</template>

# NvMobileSwitch 开关

可见轨道与 `role="switch"` 动作根统一占 51×44px，thumb 仍为 27px；背景由公开根 `class` 覆盖。`asChild` 保留 Reka 单根合成，根不会被装饰节点的 `aria-hidden`、尺寸或指针样式覆盖。非原生根的键盘焦点仍由消费者显式传入 `tabindex="0"`；`v-model`、disabled、键盘、focus 和表单 name/value 仍由原有 Reka 根处理。开关拨动带弹性滑动，触摸端读起来如原生控件。右侧手机模拟器为实时组件，随页面滚动吸顶。

## 基础用法

`v-model` 绑定布尔状态。

```vue
<NvMobileSwitch v-model="rush" />
```

## 配合单元格

嵌入 `NvCell` 的 `#value` 插槽，构成设置项行。

```vue
<NvCellGroup>
  <NvCell title="加急插单">
    <template #value><NvMobileSwitch v-model="rush" /></template>
  </NvCell>
</NvCellGroup>
```

## 禁用

传 `disabled` 禁止拨动。

```vue
<NvMobileSwitch v-model="value" disabled />
```

## 属性

| 属性       | 说明     | 类型      | 默认    |
| ---------- | -------- | --------- | ------- |
| `v-model`  | 开关状态 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |

</MobileDoc>

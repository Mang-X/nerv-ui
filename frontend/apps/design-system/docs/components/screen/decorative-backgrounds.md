---
title: NvScreenFlowLinesBg 与 NvScreenIsometricBlocksBg
---

<script setup lang="ts">
import { ref } from 'vue'
import { NvScreenFlowLinesBg, NvScreenIsometricBlocksBg } from '@nerv-iip/ui'

const flowClicks = ref(0)
const isoClicks = ref(0)
</script>

# 大屏装饰背景

`NvScreenFlowLinesBg` 与 `NvScreenIsometricBlocksBg` 是没有必填属性的 SVG 装饰件。它们使用 screen 层的 `--nv-scr-*` 色彩，根 SVG 为 `position: absolute; inset: 0`；宿主给包裹容器设置 `position: relative`、明确尺寸与深色背景。组件继承宿主的 `class`、`style` 等 SVG 属性，不读取业务数据或路由。

<ScreenDemo wide>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px">
    <div style="position: relative; height: 260px; overflow: hidden; background: var(--nv-scr-bg)">
      <button type="button" style="position: absolute; top: 48%; left: 36%; z-index: 0; padding: 8px; color: white; background: #155b78" @click="flowClicks++">流线前的按钮：{{ flowClicks }}</button>
      <NvScreenFlowLinesBg />
    </div>
    <div style="position: relative; height: 260px; overflow: hidden; background: var(--nv-scr-bg)">
      <button type="button" style="position: absolute; top: 48%; left: 36%; z-index: 0; padding: 8px; color: white; background: #155b78" @click="isoClicks++">块体前的按钮：{{ isoClicks }}</button>
      <NvScreenIsometricBlocksBg />
    </div>
  </div>
</ScreenDemo>

上方按钮位于 SVG 之前，用于直接观察装饰层的指针穿透；切换系统低动效可比较静态几何。

```vue
<script setup lang="ts">
import { NvScreenFlowLinesBg, NvScreenIsometricBlocksBg } from '@nerv-iip/ui'
</script>

<template>
  <div style="position: relative; height: 320px; overflow: hidden; background: var(--nv-scr-bg)">
    <NvScreenFlowLinesBg />
  </div>
  <div style="position: relative; height: 320px; overflow: hidden; background: var(--nv-scr-bg)">
    <NvScreenIsometricBlocksBg />
  </div>
</template>
```

| 组件                        | 固定 `viewBox` | 比例             | 保留的视觉                                     |
| --------------------------- | -------------- | ---------------- | ---------------------------------------------- |
| `NvScreenFlowLinesBg`       | `0 0 1440 810` | `xMidYMid slice` | 两条主干、四条支线、流光、八个节点与三个扩散环 |
| `NvScreenIsometricBlocksBg` | `0 0 1200 760` | `xMidYMid slice` | 20 条投影网格线、六组立方体和六个呼吸节点      |

两者均 `aria-hidden="true"`，默认以 `pointer-events: none` 让指针穿过装饰层；宿主若显式覆写该属性，须自行处理交互层级。系统开启减弱动态效果时，流光与扩散环停止显示，节点不再呼吸；静态主支线、网格、块体和节点仍可见。它们不定义 SVG `id`，可并排或重复挂载。

独立宿主示例：`/#screen/backgrounds`。来源分别为固定 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603` 的 `FlowLinesBg.vue` 与 `IsoFactoryBg.vue`；后者公开名去掉场景名 Factory，投影计算和几何默认值保持。组件在原固定源码树中没有直接引用，旧应用是否历史使用未据此推断。旧库不变，原应用接入本轮取消。

<!-- @include: ../../../../../DESIGN/components/screen-decorative-backgrounds.md -->

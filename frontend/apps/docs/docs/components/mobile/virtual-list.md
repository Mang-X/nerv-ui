---
layout: page
title: NvVirtualList 虚拟列表
---

<script setup>
import { NvVirtualList, NvMobileTag } from '@nerv-ui/ui-mobile'

const states = [
  { label: '运行', variant: 'success' },
  { label: '待机', variant: 'default' },
  { label: '检查', variant: 'warning' },
  { label: '报警', variant: 'danger' },
]
const names = ['聚合服务', '索引节点', '同步任务', '代理网关', '监控探针', '归档作业']

// 6000 条资源 —— 数据驱动，仅渲染可视窗口
const equipment = Array.from({ length: 6000 }, (_, i) => {
  const n = 1001 + i
  const s = states[n % states.length]
  return {
    code: `RES-${n}`,
    name: names[n % names.length],
    line: `${String.fromCharCode(65 + (n % 4))} 组`,
    label: s.label,
    variant: s.variant,
  }
})
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">6000 条资源 · 仅渲染可视窗口</p>
    <div class="overflow-hidden rounded-xl border border-border">
      <NvVirtualList :items="equipment" :item-height="64" class="h-[460px]">
        <template #default="{ item }">
          <div class="flex h-full items-center gap-3 border-b border-border bg-card px-4">
            <div class="min-w-0 flex-1">
              <div class="truncate text-[15px] text-foreground">{{ item.name }}</div>
              <div class="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {{ item.code }} · {{ item.line }}
              </div>
            </div>
            <NvMobileTag :variant="item.variant" size="sm">{{ item.label }}</NvMobileTag>
          </div>
        </template>
      </NvVirtualList>
    </div>
  </section>
</template>

# NvVirtualList 虚拟列表

定高虚拟滚动。无论数据有多少行，都只渲染**可视窗口 + 缓冲区**的少量节点，滚动时回收复用，因此一万行以上也能保持顺滑——适合移动端资源台账、批次流水、条目明细这类超长列表。自包含实现，不依赖外部虚拟滚动库。

## 何时使用

- **用 NvVirtualList**：行高一致、数据量大（数百行以上）、需要流畅滚动。
- **用 [NvInfiniteList](/components/mobile/infinite-list)**：数据分页从后端逐批拉取、行高不固定、总量未知。
- 两者可叠加：用 NvInfiniteList 拉数据、把已加载部分交给 NvVirtualList 渲染。

## 示例

给容器一个**确定的高度**（通过 `class`），并传入固定的 `itemHeight`（像素）。默认作用域插槽按 `{ item, index }` 渲染每一行；每行的实际高度必须等于 `itemHeight`，否则定位会错位。

```vue
<NvVirtualList :items="equipment" :item-height="64" class="h-[460px]">
  <template #default="{ item }">
    <div class="flex h-full items-center gap-3 px-4">
      <div class="min-w-0 flex-1">{{ item.name }}</div>
      <NvMobileTag :variant="item.variant" size="sm">{{ item.label }}</NvMobileTag>
    </div>
  </template>
</NvVirtualList>
```

## API

### NvVirtualList 属性

| 属性         | 说明                                       | 类型     | 默认 |
| ------------ | ------------------------------------------ | -------- | ---- |
| `items`      | 列表数据                                   | `T[]`    | —    |
| `itemHeight` | 每行固定高度（像素）                       | `number` | —    |
| `buffer`     | 可视区上下额外渲染的行数（缓冲）           | `number` | `6`  |
| `class`      | 根容器类（**须指定高度**，如 `h-[460px]`） | `string` | —    |

### 插槽

| 插槽      | 说明     | 参数                         |
| --------- | -------- | ---------------------------- |
| `default` | 渲染单行 | `{ item: T, index: number }` |

::: tip 提示
`itemHeight` 必须与每行真实渲染高度一致。若行高会随内容变化，请改用 [NvInfiniteList](/components/mobile/infinite-list) 或固定行内排版（截断、单行省略）。
:::

## 设计说明

容器实际尺寸变化时，组件通过 ResizeObserver 重新测量可视高度，卸载时断开观察。行外层按 index 复用；slot 内包含局部状态时，可按稳定 item 身份设置 key。组件没有 itemKey 属性。

独立运行示例：`/#mobile-lists`（playground）。接入与验证边界见仓库 `docs/mobile-standalone.md`。

</MobileDoc>

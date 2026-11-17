---
title: NvSheet 抽屉
---

<script setup>
import {
  NvSheet,
  NvSheetTrigger,
  NvSheetContent,
  NvSheetHeader,
  NvSheetTitle,
  NvSheetDescription,
  NvSheetFooter,
  NvSheetClose,
  NvButton,
} from '@nerv-iip/ui'
import { SlidersHorizontalIcon } from '@lucide/vue'
import { ref } from 'vue'

const sheetOpen = ref(false)
const applyReceipt = ref('尚未应用示例条件')

function applyExampleFilters() {
  sheetOpen.value = false
  applyReceipt.value = '已在本页选择示例条件：Alpha 组；待指派；2026-06-01 至 2026-06-30'
}
</script>

# NvSheet 抽屉

从屏幕边缘滑入的侧边面板，承载详情查看、高级筛选等不打断主流程的次级操作。`NvSheet` 默认从右侧滑入，由头部、标题、说明与底部操作区组合内容。

## 示例

通过 `NvSheetTrigger` 触发，`v-model:open` 双向绑定开关状态。`NvSheetContent` 的 `side` 控制滑入方向，默认 `right`。

右上角内置关闭按钮与正文内边距分开布局，并位于标题层上方；也可用底部取消按钮或 Esc 关闭。本例条件不可编辑；只有「应用」更新回执，取消、Esc 或关闭保留此前结果。

<Demo>
  <NvSheet v-model:open="sheetOpen">
    <NvSheetTrigger as-child>
      <NvButton variant="outline">
        <template #leading><SlidersHorizontalIcon aria-hidden="true" /></template>
        筛选
      </NvButton>
    </NvSheetTrigger>
    <NvSheetContent side="right">
      <NvSheetHeader>
        <NvSheetTitle>高级筛选</NvSheetTitle>
        <NvSheetDescription>
          以下为固定只读条件，仅展示抽屉布局。应用后在本页显示条件回执，不筛选实际记录列表。
        </NvSheetDescription>
      </NvSheetHeader>
      <div class="flex flex-col gap-4 px-4">
        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-muted-foreground">分组</span>
          <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">Alpha 组</div>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-muted-foreground">记录状态</span>
          <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">待指派</div>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-muted-foreground">计划完成日期</span>
          <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm tabular-nums">2026-06-01 至 2026-06-30</div>
        </div>
      </div>
      <NvSheetFooter>
        <NvSheetClose as-child>
          <NvButton variant="ghost">取消</NvButton>
        </NvSheetClose>
        <NvButton variant="brand" @click="applyExampleFilters">应用</NvButton>
      </NvSheetFooter>
    </NvSheetContent>
  </NvSheet>
</Demo>

<p role="status" class="text-sm text-muted-foreground">{{ applyReceipt }}</p>

```vue
<script setup>
import {
  NvSheet,
  NvSheetTrigger,
  NvSheetContent,
  NvSheetHeader,
  NvSheetTitle,
  NvSheetDescription,
  NvSheetFooter,
  NvSheetClose,
  NvButton,
} from '@nerv-iip/ui'
import { ref } from 'vue'
const sheetOpen = ref(false)
const applyReceipt = ref('尚未应用示例条件')

function applyExampleFilters() {
  sheetOpen.value = false
  applyReceipt.value = '已在本页选择示例条件：Alpha 组；待指派；2026-06-01 至 2026-06-30'
}
</script>

<template>
  <NvSheet v-model:open="sheetOpen">
    <NvSheetTrigger as-child>
      <NvButton variant="outline">筛选</NvButton>
    </NvSheetTrigger>
    <NvSheetContent side="right">
      <NvSheetHeader>
        <NvSheetTitle>高级筛选</NvSheetTitle>
        <NvSheetDescription
          >以下为固定只读条件，仅展示抽屉布局。应用后在本页显示条件回执，不筛选实际记录列表。</NvSheetDescription
        >
      </NvSheetHeader>
      <div class="flex flex-col gap-4 px-4">
        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-muted-foreground">分组</span>
          <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">Alpha 组</div>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-muted-foreground">记录状态</span>
          <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">待指派</div>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-muted-foreground">计划完成日期</span>
          <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm tabular-nums">
            2026-06-01 至 2026-06-30
          </div>
        </div>
      </div>
      <NvSheetFooter>
        <NvSheetClose as-child><NvButton variant="ghost">取消</NvButton></NvSheetClose>
        <NvButton variant="brand" @click="applyExampleFilters">应用</NvButton>
      </NvSheetFooter>
    </NvSheetContent>
  </NvSheet>
  <p role="status" class="text-sm text-muted-foreground">{{ applyReceipt }}</p>
</template>
```

## API

| 组件                                                    | 说明                                          |
| ------------------------------------------------------- | --------------------------------------------- |
| `NvSheet`                                               | 根容器，支持 `v-model:open`                   |
| `NvSheetTrigger`                                        | 触发器，配合 `as-child` 包裹自定义按钮        |
| `NvSheetContent`                                        | 抽屉面板（模糊遮罩 + 边缘滑入，内置关闭按钮） |
| `NvSheetHeader` / `NvSheetTitle` / `NvSheetDescription` | 头部、标题与描述                              |
| `NvSheetFooter`                                         | 底部操作区                                    |
| `NvSheetClose`                                          | 关闭触发器                                    |

| 属性                | 所属                              | 说明                                                              | 类型                                     | 默认      |
| ------------------- | --------------------------------- | ----------------------------------------------------------------- | ---------------------------------------- | --------- |
| `open`              | `NvSheet`                         | 受控开关状态（`v-model:open`）                                    | `boolean`                                | `false`   |
| `side`              | `NvSheetContent`                  | 滑入方向：`top` 顶部 / `right` 右侧 / `bottom` 底部 / `left` 左侧 | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` |
| `show-close-button` | `NvSheetContent`                  | 是否显示右上角内置关闭按钮                                        | `boolean`                                | `true`    |
| `as-child`          | `NvSheetTrigger` / `NvSheetClose` | 将渲染合并到子元素                                                | `boolean`                                | `false`   |

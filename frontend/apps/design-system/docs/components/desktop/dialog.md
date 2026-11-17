---
title: NvDialog 对话框
---

<script setup>
import BaseDialogExample from '../../.vitepress/examples/BaseDialogExample.vue'
import {
  NvDialog,
  NvDialogTrigger,
  NvDialogContent,
  NvDialogHeader,
  NvDialogTitle,
  NvDialogDescription,
  NvDialogFooter,
  NvDialogClose,
  NvButton,
  NvInput,
} from '@nerv-iip/ui'
import { GaugeIcon } from '@lucide/vue'
import { ref } from 'vue'

const dialogOpen = ref(false)
const dispatchReceipt = ref('尚未选择指派记录')

function confirmDispatch() {
  dialogOpen.value = false
  dispatchReceipt.value = '已选择将 REC-2406-0431 指派给 Alpha 组'
}
const scrollOpen = ref(false)
const scrollMode = ref('content')
const rowCount = ref(12)
const showError = ref(false)

function openScrollExample(mode) {
  scrollMode.value = mode
  rowCount.value = mode === 'short' ? 2 : 12
  showError.value = false
  scrollOpen.value = true
}
</script>

# NvDialog 对话框

承载需要用户聚焦确认的关键操作。`NvDialog` 提供模糊遮罩与缩放入场，由头部、标题、说明与底部操作区组合内容。

## 示例

通过 `NvDialogTrigger` 触发，`v-model:open` 双向绑定开关状态。本例确认后在本页显示选择回执；取消、Esc 或关闭不会更新回执，已有回执保留。

<Demo>
  <NvDialog v-model:open="dialogOpen">
    <NvDialogTrigger as-child>
      <NvButton variant="brand">
        <template #leading><GaugeIcon aria-hidden="true" /></template>
        指派记录
      </NvButton>
    </NvDialogTrigger>
    <NvDialogContent>
      <NvDialogHeader>
        <NvDialogTitle>确认指派记录</NvDialogTitle>
        <NvDialogDescription>
          本地演示：选择将 REC-2406-0431 指派给 Alpha 组；确认仅显示选择回执，不执行指派、锁定或生成关联单据。
        </NvDialogDescription>
      </NvDialogHeader>
      <div class="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">数量</span>
          <span class="tabular-nums">480</span>
        </div>
        <div class="mt-2 flex justify-between">
          <span class="text-muted-foreground">预计耗时</span>
          <span class="tabular-nums">14.5 h</span>
        </div>
      </div>
      <NvDialogFooter>
        <NvDialogClose as-child>
          <NvButton variant="ghost">取消</NvButton>
        </NvDialogClose>
        <NvButton variant="brand" @click="confirmDispatch">确认指派</NvButton>
      </NvDialogFooter>
    </NvDialogContent>
  </NvDialog>
</Demo>

<p role="status" class="text-sm text-muted-foreground">{{ dispatchReceipt }}</p>

```vue
<script setup>
import {
  NvDialog,
  NvDialogTrigger,
  NvDialogContent,
  NvDialogHeader,
  NvDialogTitle,
  NvDialogDescription,
  NvDialogFooter,
  NvDialogClose,
  NvButton,
} from '@nerv-iip/ui'
import { ref } from 'vue'
const dialogOpen = ref(false)
const dispatchReceipt = ref('尚未选择指派记录')

function confirmDispatch() {
  dialogOpen.value = false
  dispatchReceipt.value = '已选择将 REC-2406-0431 指派给 Alpha 组'
}
</script>

<template>
  <NvDialog v-model:open="dialogOpen">
    <NvDialogTrigger as-child>
      <NvButton variant="brand">指派记录</NvButton>
    </NvDialogTrigger>
    <NvDialogContent>
      <NvDialogHeader>
        <NvDialogTitle>确认指派记录</NvDialogTitle>
        <NvDialogDescription
          >本地演示：选择将 REC-2406-0431 指派给 Alpha
          组；确认仅显示选择回执，不执行指派、锁定或生成关联单据。</NvDialogDescription
        >
      </NvDialogHeader>
      <NvDialogFooter>
        <NvDialogClose as-child><NvButton variant="ghost">取消</NvButton></NvDialogClose>
        <NvButton variant="brand" @click="confirmDispatch">确认指派</NvButton>
      </NvDialogFooter>
    </NvDialogContent>
  </NvDialog>
  <p role="status" class="text-sm text-muted-foreground">{{ dispatchReceipt }}</p>
</template>
```

默认由遮罩滚动，短窗居中，长窗从顶部开始向下滚动。`NvDialogContent` 保留内容内边距；`NvDialogFooter` 在正常文档流中占位，并相对最近的滚动容器吸底。Footer 不向父容器外扩展，也不抵消父容器底部内边距，因此可以直接放在 Content 下，也可以放在无内边距或带少量内边距的 form 内。头部、字段、校验信息与操作区使用父容器的 gap 分隔。

需要局部滚动时，只指定一个滚动容器：Content 限高滚动，或 form 限高滚动。嵌套 form 应保持 `min-height: 0`，不要再用负外边距抵消 Footer 的占位。下面三种示例使用真实组件；「增加一行」和「显示错误」可检查内容增高后首尾字段与操作区的可达性。

<Demo>
  <div class="flex flex-wrap gap-2">
    <NvButton variant="outline" @click="openScrollExample('short')">短窗示例</NvButton>
    <NvButton variant="outline" @click="openScrollExample('content')">Content 滚动示例</NvButton>
    <NvButton variant="outline" @click="openScrollExample('form')">form 滚动示例</NvButton>
  </div>
  <NvDialog v-model:open="scrollOpen">
    <NvDialogContent
      :class="scrollMode === 'content' ? 'max-h-[85vh] overflow-y-auto' : ''"
    >
      <NvDialogHeader>
        <NvDialogTitle>滚动与操作区示例</NvDialogTitle>
        <NvDialogDescription>检查首尾字段、动态校验信息与操作按钮。</NvDialogDescription>
      </NvDialogHeader>
      <form
        class="grid min-h-0 gap-4"
        :class="scrollMode === 'form' ? 'max-h-[60vh] overflow-y-auto px-1' : ''"
        @submit.prevent="scrollOpen = false"
      >
        <div class="flex flex-wrap gap-2">
          <NvButton type="button" variant="outline" @click="rowCount++">增加一行</NvButton>
          <NvButton type="button" variant="outline" @click="showError = !showError">显示错误</NvButton>
        </div>
        <label v-for="row in rowCount" :key="row" class="grid gap-2 text-sm">
          字段 {{ row }}
          <NvInput :aria-label="`字段 ${row}`" :placeholder="`输入字段 ${row}`" />
        </label>
        <p v-if="showError" role="alert" class="text-sm text-destructive">请核对最后一行后再确认。</p>
        <NvDialogFooter>
          <NvDialogClose as-child><NvButton type="button" variant="ghost">取消</NvButton></NvDialogClose>
          <NvButton type="submit">确认</NvButton>
        </NvDialogFooter>
      </form>
    </NvDialogContent>
  </NvDialog>
</Demo>

```vue
<!-- Content 滚动：form 只负责字段间距，不另设滚动 -->
<NvDialogContent class="max-h-[85vh] overflow-y-auto">
  <NvDialogHeader><!-- 标题和说明 --></NvDialogHeader>
  <form class="grid min-h-0 gap-4" @submit.prevent="submit">
    <!-- 字段、校验信息、行操作 -->
    <NvDialogFooter><!-- 取消、确认 --></NvDialogFooter>
  </form>
</NvDialogContent>

<!-- form 滚动：Content 不再限高滚动 -->
<NvDialogContent>
  <NvDialogHeader><!-- 标题和说明 --></NvDialogHeader>
  <form class="grid min-h-0 max-h-[60vh] gap-4 overflow-y-auto px-1" @submit.prevent="submit">
    <!-- 字段、校验信息、行操作 -->
    <NvDialogFooter><!-- 取消、确认 --></NvDialogFooter>
  </form>
</NvDialogContent>
```

基础主桶原版合同示例与上方 Nv 组合分别展示；仅有本页开关，不保存业务数据。

<Demo>
  <BaseDialogExample />
</Demo>

::: details 查看同源源码
<<< ../../.vitepress/examples/BaseDialogExample.vue
:::

固定 `DialogContent` 使用 `show-close-button=false` 隐藏右上关闭钮，仍由 `DialogFooter show-close-button` 提供真实关闭出口。页脚默认 **Close** 为原版 producer 的英文合同，保留原文；它处于文档流中并以负外边距抵消固定 Content 的内边距，并非 Nv 的吸底页脚。原版 `DialogOverlay` 由 Content 内部直接导入并渲染，不需要额外叠加遮罩。

两种 Content 的 `id` / `data-reading` attrs 均透传到内层对话框节点。固定标题使用 `as="h3"`、描述使用 `as-child` 合并到 `div`；长文标题使用 `as-child` 合并到 `h2`、描述使用 `as="p"`，说明链接保留为真实 `a` 节点，标题/描述 ID 与对话框无障碍关系由 Reka 关联。

`DialogScrollContent` 由外层遮罩滚动，正文末端后接关闭页脚，右上也保留原版 Close。窄屏只在消费端限制宽度留边。可用关闭按钮或 Esc 退出，再开可重新阅读；标准焦点恢复到各自触发器。当前 producer 的 pointer-down-outside guard 会阻止滚动条区域指针导致误关闭。

## API

| 组件                                                       | 说明                                   |
| ---------------------------------------------------------- | -------------------------------------- |
| `NvDialog`                                                 | 根容器，支持 `v-model:open`            |
| `NvDialogTrigger`                                          | 触发器，配合 `as-child` 包裹自定义按钮 |
| `NvDialogContent`                                          | 内容卡片（模糊遮罩 + 缩放入场）        |
| `NvDialogHeader` / `NvDialogTitle` / `NvDialogDescription` | 头部、标题与描述                       |
| `NvDialogFooter`                                           | 底部操作区                             |
| `NvDialogClose`                                            | 关闭触发器                             |

| 属性       | 所属                                | 说明                           | 类型      | 默认    |
| ---------- | ----------------------------------- | ------------------------------ | --------- | ------- |
| `open`     | `NvDialog`                          | 受控开关状态（`v-model:open`） | `boolean` | `false` |
| `as-child` | `NvDialogTrigger` / `NvDialogClose` | 将渲染合并到子元素             | `boolean` | `false` |

---
title: NvDropdownMenu 动作菜单
---

<script setup>
import DropdownSelectionExample from '../../.vitepress/examples/DropdownSelectionExample.vue'
import { ref } from 'vue'
const actionReceipt = ref('请选择一项操作。')
import {
  NvDropdownMenu,
  NvDropdownMenuTrigger,
  NvDropdownMenuContent,
  NvDropdownMenuLabel,
  NvDropdownMenuItem,
  NvDropdownMenuSeparator,
  NvButton,
} from '@nerv-iip/ui'
import {
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  CopyIcon,
  Trash2Icon,
} from '@lucide/vue'
</script>

# NvDropdownMenu 动作菜单

为表格行、卡片等收纳「更多操作」。`NvDropdownMenu` 提供模糊浮层与缩放入场，由标签、操作项与分隔线组合操作项，破坏性操作以 `variant="destructive"` 标红。

## 示例

`NvDropdownMenuTrigger` 配合 `as-child` 包裹一个图标按钮触发，`NvDropdownMenuContent` 通过 `align` 对齐到触发器一侧。本页显示所选操作，不实际编辑、复制或删除记录；接入应用时由宿主执行操作。

<Demo>
  <NvDropdownMenu>
    <NvDropdownMenuTrigger as-child>
      <NvButton variant="ghost" size="icon" aria-label="更多操作">
        <MoreHorizontalIcon aria-hidden="true" />
      </NvButton>
    </NvDropdownMenuTrigger>
    <NvDropdownMenuContent align="end" class="w-44">
      <NvDropdownMenuLabel>操作</NvDropdownMenuLabel>
      <NvDropdownMenuItem @select="actionReceipt = '已选择：查看详情'">
        <EyeIcon aria-hidden="true" />
        查看详情
      </NvDropdownMenuItem>
      <NvDropdownMenuItem @select="actionReceipt = '已选择：编辑'">
        <PencilIcon aria-hidden="true" />
        编辑
      </NvDropdownMenuItem>
      <NvDropdownMenuItem @select="actionReceipt = '已选择：复制单号'">
        <CopyIcon aria-hidden="true" />
        复制单号
      </NvDropdownMenuItem>
      <NvDropdownMenuSeparator />
      <NvDropdownMenuItem variant="destructive" @select="actionReceipt = '已选择：删除'">
        <Trash2Icon aria-hidden="true" />
        删除
      </NvDropdownMenuItem>
    </NvDropdownMenuContent>
  </NvDropdownMenu>
  <p role="status" class="w-full text-sm text-muted-foreground">{{ actionReceipt }}</p>
</Demo>

```vue
<script setup>
import {
  NvDropdownMenu,
  NvDropdownMenuTrigger,
  NvDropdownMenuContent,
  NvDropdownMenuLabel,
  NvDropdownMenuItem,
  NvDropdownMenuSeparator,
  NvButton,
} from '@nerv-iip/ui'
import { MoreHorizontalIcon, EyeIcon, PencilIcon, CopyIcon, Trash2Icon } from '@lucide/vue'
import { ref } from 'vue'
const actionReceipt = ref('请选择一项操作。')
</script>

<template>
  <NvDropdownMenu>
    <NvDropdownMenuTrigger as-child>
      <NvButton variant="ghost" size="icon" aria-label="更多操作">
        <MoreHorizontalIcon aria-hidden="true" />
      </NvButton>
    </NvDropdownMenuTrigger>
    <NvDropdownMenuContent align="end" class="w-44">
      <NvDropdownMenuLabel>操作</NvDropdownMenuLabel>
      <NvDropdownMenuItem @select="actionReceipt = '已选择：查看详情'">
        <EyeIcon aria-hidden="true" />查看详情
      </NvDropdownMenuItem>
      <NvDropdownMenuItem @select="actionReceipt = '已选择：编辑'">
        <PencilIcon aria-hidden="true" />编辑
      </NvDropdownMenuItem>
      <NvDropdownMenuItem @select="actionReceipt = '已选择：复制单号'">
        <CopyIcon aria-hidden="true" />复制单号
      </NvDropdownMenuItem>
      <NvDropdownMenuSeparator />
      <NvDropdownMenuItem variant="destructive" @select="actionReceipt = '已选择：删除'">
        <Trash2Icon aria-hidden="true" />删除
      </NvDropdownMenuItem>
    </NvDropdownMenuContent>
  </NvDropdownMenu>
  <p role="status">{{ actionReceipt }}</p>
</template>
```

打开「阅读偏好」可切换摘要与排序，再从「选择位置」进入子菜单。当前值显示在按钮下方，关闭重开仍保留；回执仅在本页内存中，不会移动文件或同步云端。

<Demo>
  <DropdownSelectionExample />
</Demo>

<<< @/.vitepress/examples/DropdownSelectionExample.vue

方向键、Enter 和 Escape 交由公开 Reka 菜单处理：上下选择、右方向进入子菜单、左方向返回，Enter 选择，Escape 关闭当前菜单并恢复焦点。示例没有自行注册键盘处理器。`⌘S` **仅是提示文字，没有注册快捷键**；云端同步项禁用，不执行操作。

`NvDropdownMenuGroup` 将显示偏好组织为语义组；基础 `DropdownMenuGroup` 将本页操作组织为另一个组，两者来自同源 Reka Group 职责，并非额外业务能力。RadioGroup 本身负责互斥选择，不用无意义嵌套两个 Group。浮层使用碰撞避让、视口宽度上限及可用高度滚动。

## API

| 组件                      | 说明                                                   |
| ------------------------- | ------------------------------------------------------ |
| `NvDropdownMenu`          | 根容器（纯逻辑），支持 `v-model:open`                  |
| `NvDropdownMenuTrigger`   | 触发器，配合 `as-child` 包裹自定义按钮                 |
| `NvDropdownMenuContent`   | 浮层面板（模糊遮罩 + 缩放入场），支持 `align` / `side` |
| `NvDropdownMenuLabel`     | 分区标题（弱化文字），支持 `inset`                     |
| `NvDropdownMenuItem`      | 操作项，支持 `inset` / `variant` / `as-child`          |
| `NvDropdownMenuSeparator` | 分隔线，分组操作项                                     |
| `NvDropdownMenuGroup`     | 语义分组容器（无样式）                                 |

| 属性       | 所属                                           | 说明                                        | 类型                                     | 默认        |
| ---------- | ---------------------------------------------- | ------------------------------------------- | ---------------------------------------- | ----------- |
| `open`     | `NvDropdownMenu`                               | 受控开关状态（`v-model:open`）              | `boolean`                                | —           |
| `as-child` | `NvDropdownMenuTrigger` / `NvDropdownMenuItem` | 将渲染合并到子元素                          | `boolean`                                | `false`     |
| `align`    | `NvDropdownMenuContent`                        | 沿触发器的对齐方式                          | `'start' \| 'center' \| 'end'`           | `'start'`   |
| `side`     | `NvDropdownMenuContent`                        | 浮层弹出方向                                | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'`  |
| `inset`    | `NvDropdownMenuItem` / `NvDropdownMenuLabel`   | 左侧留白对齐（让出图标位）                  | `boolean`                                | `false`     |
| `variant`  | `NvDropdownMenuItem`                           | 操作项语义，破坏性操作用 `destructive` 标红 | `'default' \| 'destructive'`             | `'default'` |
| `disabled` | `NvDropdownMenuItem`                           | 禁用该操作项                                | `boolean`                                | `false`     |

## 设计说明

- 根 `v-model:open` 使用 `update:open`；Nv 根默认非模态，Content 默认 `align="start"`、`sideOffset=6`。
- CheckboxItem 的当前 API 是 `modelValue` / `update:modelValue`（`v-model`），默认 false，可为 `indeterminate`；不是 `v-model:checked`。
- RadioGroup 使用 `modelValue` / `update:modelValue`，RadioItem 以 `value` 归组；Item 的 `select` 回执当前选择，`disabled` 由库阻止选择。
- Sub 使用公开 open 合同；SubTrigger/SubContent 负责层级导航与浮层。各件默认插槽提供内容，CheckboxItem/RadioItem 另有 `indicator-icon` 插槽；Shortcut 只呈现默认插槽，不注册事件。

---
title: NvCommand 命令面板
---

<script setup>
import { NvCommand, NvButton, NvNotifierHost, nvMessage } from '@nerv-iip/ui'
import {
  ActivityIcon,
  GaugeIcon,
  LayersIcon,
  PlusIcon,
  RocketIcon,
  SearchIcon,
} from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const cmdOpen = ref(false)
// 文档站已有全局搜索；本页在捕获阶段确定快捷键归属。
function onCommandHotkey(event) {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
  if (document.querySelector('#localsearch-input')) return
  event.preventDefault()
  event.stopImmediatePropagation()
  if (!event.repeat) cmdOpen.value = !cmdOpen.value
}
onMounted(() => window.addEventListener('keydown', onCommandHotkey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onCommandHotkey, true))
const cmdGroups = [
  {
    label: '导航',
    items: [
      { id: 'instances', label: '实例总览', hint: 'G I', icon: LayersIcon },
      { id: 'orders', label: '记录工作台', hint: 'G O', icon: GaugeIcon },
      { id: 'iam', label: '用户与权限', icon: ActivityIcon, keywords: 'user role permission' },
    ],
  },
  {
    label: '快捷操作',
    items: [
      { id: 'new-rec', label: '新建记录', hint: '⌘N', icon: PlusIcon, keywords: 'create record' },
      { id: 'dispatch', label: '指派给分组', icon: RocketIcon, keywords: 'assign group' },
      { id: 'search-item', label: '搜索条目编码', icon: SearchIcon, keywords: 'item' },
    ],
  },
]
function onCommandSelect(item) {
  nvMessage.success(`执行：${item.label}`)
}
</script>

# NvCommand 命令面板

⌘K 唤起的全局命令面板，可搜索导航与快捷操作，支持完整键盘导航（↑ ↓ 移动、↵ 执行、esc 关闭）。命令按分组传入，匹配 `label` 与 `keywords`。

本页由文档宿主协调 ⌘K / Ctrl+K：站内搜索未打开时切换命令面板，已打开时保留搜索的键盘操作。顶部“搜索文档”按钮始终可用。下方学习片段包含这一文档站接入方式；普通应用没有快捷键冲突时可直接使用 `hotkey` 默认值。

## 基础用法

选择命令后显示执行回执。应用根部需挂载一次 `NvNotifierHost`，本页使用独立的页面级 Host。

<ClientOnly>
  <NvNotifierHost />
</ClientOnly>

<Demo>
  <NvButton variant="ghost" size="sm" @click="cmdOpen = true">
    <template #leading><SearchIcon aria-hidden="true" /></template>
    命令面板 ⌘K
  </NvButton>
  <NvCommand :hotkey="false" v-model:open="cmdOpen" :groups="cmdGroups" @select="onCommandSelect" />
</Demo>

```vue
<script setup>
import { NvCommand, NvButton, NvNotifierHost, nvMessage } from '@nerv-iip/ui'
import { GaugeIcon, LayersIcon, PlusIcon } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const cmdOpen = ref(false)
// 文档站已有全局搜索；本页在捕获阶段确定快捷键归属。
function onCommandHotkey(event) {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
  if (document.querySelector('#localsearch-input')) return
  event.preventDefault()
  event.stopImmediatePropagation()
  if (!event.repeat) cmdOpen.value = !cmdOpen.value
}
onMounted(() => window.addEventListener('keydown', onCommandHotkey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onCommandHotkey, true))
const cmdGroups = [
  {
    label: '导航',
    items: [
      { id: 'instances', label: '实例总览', hint: 'G I', icon: LayersIcon },
      { id: 'orders', label: '记录工作台', hint: 'G O', icon: GaugeIcon },
    ],
  },
  {
    label: '快捷操作',
    items: [
      {
        id: 'new-rec',
        label: '新建记录',
        hint: '⌘N',
        icon: PlusIcon,
        keywords: 'create record',
      },
    ],
  },
]
function onCommandSelect(item) {
  nvMessage.success(`执行：${item.label}`)
}
</script>

<template>
  <!-- 应用根部只挂载一次；已有 Host 时不重复添加。 -->
  <NvNotifierHost />
  <NvButton @click="cmdOpen = true">命令面板 ⌘K</NvButton>
  <NvCommand :hotkey="false" v-model:open="cmdOpen" :groups="cmdGroups" @select="onCommandSelect" />
</template>
```

## 属性

| 属性          | 说明                       | 类型             | 默认                    |
| ------------- | -------------------------- | ---------------- | ----------------------- |
| `open`        | 受控开关（`v-model:open`） | `boolean`        | `false`                 |
| `groups`      | 命令分组数据               | `CommandGroup[]` | —                       |
| `placeholder` | 搜索框占位符               | `string`         | `搜索命令、记录、分组…` |
| `hotkey`      | 是否启用 ⌘K 全局快捷键     | `boolean`        | `true`                  |

## 数据结构

| 字段       | 所属           | 说明           | 类型            |
| ---------- | -------------- | -------------- | --------------- |
| `label`    | `CommandGroup` | 分组标题       | `string`        |
| `items`    | `CommandGroup` | 分组内命令项   | `CommandItem[]` |
| `id`       | `CommandItem`  | 唯一标识       | `string`        |
| `label`    | `CommandItem`  | 命令名称       | `string`        |
| `hint`     | `CommandItem`  | 右侧快捷键提示 | `string`        |
| `icon`     | `CommandItem`  | 命令图标组件   | `Component`     |
| `keywords` | `CommandItem`  | 额外搜索关键词 | `string`        |

## 事件

| 事件     | 说明           | 参数                  |
| -------- | -------------- | --------------------- |
| `select` | 选中命令时触发 | `(item: CommandItem)` |

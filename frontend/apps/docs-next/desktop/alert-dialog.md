---
title: NvAlertDialog 警告对话框
---

<script setup>
import { ref } from 'vue'
import {
  NvAlertDialog,
  NvAlertDialogTrigger,
  NvAlertDialogContent,
  NvAlertDialogTitle,
  NvAlertDialogDescription,
  NvAlertDialogClose,
} from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const open = ref(false)
const urgentOpen = ref(false)
</script>

# NvAlertDialog 警告对话框

要求用户明确确认的警示场景；点击遮罩永远不会关闭。

## 示例

<Demo>
  <NvAlertDialog v-model:open="open">
    <NvAlertDialogTrigger>删除记录</NvAlertDialogTrigger>
    <NvAlertDialogContent>
      <NvAlertDialogTitle>确认删除？</NvAlertDialogTitle>
      <NvAlertDialogDescription>该操作不可撤销，删除后无法恢复。</NvAlertDialogDescription>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NvAlertDialogClose>取消</NvAlertDialogClose>
        <NvAlertDialogClose value="confirm">删除</NvAlertDialogClose>
      </div>
    </NvAlertDialogContent>
  </NvAlertDialog>
</Demo>

<Demo>
  <NvAlertDialog v-model:open="urgentOpen" :dismissible="false">
    <NvAlertDialogTrigger>必须处理</NvAlertDialogTrigger>
    <NvAlertDialogContent>
      <NvAlertDialogTitle>资源离线</NvAlertDialogTitle>
      <NvAlertDialogDescription>Esc 与返回键也不会关闭，请先确认现场状态。</NvAlertDialogDescription>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NvAlertDialogClose>已确认</NvAlertDialogClose>
      </div>
    </NvAlertDialogContent>
  </NvAlertDialog>
</Demo>

## API

### NvAlertDialog 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `dismissible` | 是否允许 Esc 与 Android 返回键关闭；外部按下始终不关闭 | `boolean` | `true` |

### NvAlertDialog 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvAlertDialog 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 Trigger 与 Content |

### NvAlertDialogTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` | `false` |
| `focusableWhenDisabled` | 禁用时仍可聚焦 | `boolean` | `false` |

### NvAlertDialogTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容；组件自身渲染按钮 |

### NvAlertDialogContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `keepMounted` | 关闭时仍保留在页面中，便于自定义退场动画 | `boolean` | `false` |

### NvAlertDialogContent 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 弹层内容 |

### NvAlertDialogTitle / NvAlertDialogDescription 插槽

| 组件 | 插槽 | 说明 |
| --- | --- | --- |
| `NvAlertDialogTitle` | `default` | 标题，同时作为弹层的无障碍名称 |
| `NvAlertDialogDescription` | `default` | 描述，同时作为弹层的无障碍说明 |

### NvAlertDialogClose 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 关闭时作为 `returnValue` 上报 | `string` | — |
| `action` | 关闭前执行；返回 Promise 时等其落定再关闭 | `(event, details) => unknown` | — |

### NvAlertDialogClose 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮内容 |

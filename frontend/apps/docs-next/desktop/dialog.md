---
title: NvDialog 对话框
---

<script setup>
import { ref } from 'vue'
import {
  NvDialog,
  NvDialogTrigger,
  NvDialogContent,
  NvDialogTitle,
  NvDialogDescription,
  NvDialogClose,
} from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const open = ref(false)
const persistentOpen = ref(false)
</script>

# NvDialog 对话框

承载需要聚焦处理的临时内容，默认模态、锁定焦点并支持 Esc 关闭。

## 示例

<Demo>
  <NvDialog v-model:open="open">
    <NvDialogTrigger>打开对话框</NvDialogTrigger>
    <NvDialogContent>
      <NvDialogTitle>编辑资料</NvDialogTitle>
      <NvDialogDescription>弹层会锁定焦点；按 Esc 或在外部按下可关闭。</NvDialogDescription>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NvDialogClose>关闭</NvDialogClose>
      </div>
    </NvDialogContent>
  </NvDialog>
</Demo>

<Demo>
  <NvDialog v-model:open="persistentOpen" :close-on-outside-press="false" :dismissible="false">
    <NvDialogTrigger>只能点按钮关闭</NvDialogTrigger>
    <NvDialogContent>
      <NvDialogTitle>需要确认</NvDialogTitle>
      <NvDialogDescription>点遮罩或按 Esc 都不会关闭，必须使用下方按钮。</NvDialogDescription>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NvDialogClose>我知道了</NvDialogClose>
      </div>
    </NvDialogContent>
  </NvDialog>
</Demo>

## API

### NvDialog 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `modal` | `true` 锁定焦点并使页面不可交互；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 是否允许点击外部关闭 | `boolean` | `true` |

### NvDialog 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvDialog 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 Trigger 与 Content |

### NvDialogTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` | `false` |
| `focusableWhenDisabled` | 禁用时仍可聚焦，便于用提示解释原因 | `boolean` | `false` |

### NvDialogTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容；组件自身渲染按钮 |

### NvDialogContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `keepMounted` | 关闭时仍保留在页面中，便于自定义退场动画 | `boolean` | `false` |

### NvDialogContent 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 弹层内容 |

### NvDialogTitle / NvDialogDescription 插槽

| 组件 | 插槽 | 说明 |
| --- | --- | --- |
| `NvDialogTitle` | `default` | 标题，同时作为弹层的无障碍名称 |
| `NvDialogDescription` | `default` | 描述，同时作为弹层的无障碍说明 |

### NvDialogClose 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 关闭时作为 `returnValue` 上报 | `string` | — |
| `action` | 关闭前执行；返回 Promise 时等其落定再关闭 | `(event, details) => unknown` | — |

### NvDialogClose 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮内容 |

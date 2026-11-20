---
title: NvSheet 抽屉
---

<script setup>
import { ref } from 'vue'
import {
  NvSheet,
  NvSheetTrigger,
  NvSheetContent,
  NvSheetTitle,
  NvSheetDescription,
  NvSheetClose,
} from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const rightOpen = ref(false)
const leftOpen = ref(false)
</script>

# NvSheet 抽屉

从页面边缘滑入的面板，默认从右侧进入，适合筛选、详情等次要任务。

## 示例

<Demo>
  <NvSheet v-model:open="rightOpen">
    <NvSheetTrigger>从右侧打开</NvSheetTrigger>
    <NvSheetContent>
      <NvSheetTitle>筛选面板</NvSheetTitle>
      <NvSheetDescription>抽屉从默认的右侧边缘滑入，按 Esc 或点遮罩可关闭。</NvSheetDescription>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NvSheetClose>关闭</NvSheetClose>
      </div>
    </NvSheetContent>
  </NvSheet>
</Demo>

<Demo>
  <NvSheet v-model:open="leftOpen" side="left">
    <NvSheetTrigger>从左侧打开</NvSheetTrigger>
    <NvSheetContent>
      <NvSheetTitle>导航抽屉</NvSheetTitle>
      <NvSheetDescription>改由左侧边缘滑入，其余行为与默认右侧一致。</NvSheetDescription>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <NvSheetClose>关闭</NvSheetClose>
      </div>
    </NvSheetContent>
  </NvSheet>
</Demo>

## API

### NvSheet 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `side` | 滑入边缘；`start` / `end` 跟随书写方向 | `top \| right \| bottom \| left \| start \| end` | `right` |
| `modal` | `true` 锁定焦点并使页面不可交互；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |

### NvSheet 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvSheet 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 Trigger 与 Content |

### NvSheetTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` | `false` |
| `focusableWhenDisabled` | 禁用时仍可聚焦 | `boolean` | `false` |

### NvSheetTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容；组件自身渲染按钮 |

### NvSheetContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `keepMounted` | 关闭时仍保留在页面中，便于自定义退场动画 | `boolean` | `false` |

### NvSheetContent 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 抽屉内容 |

### NvSheetTitle / NvSheetDescription 插槽

| 组件 | 插槽 | 说明 |
| --- | --- | --- |
| `NvSheetTitle` | `default` | 标题，同时作为抽屉的无障碍名称 |
| `NvSheetDescription` | `default` | 描述，同时作为抽屉的无障碍说明 |

### NvSheetClose 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 关闭时作为 `returnValue` 上报 | `string` | — |
| `action` | 关闭前执行；返回 Promise 时等其落定再关闭 | `(event, details) => unknown` | — |

### NvSheetClose 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮内容 |

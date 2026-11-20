---
title: NvPopover 气泡卡片
---

<script setup>
import { ref } from 'vue'
import { NvButton, NvPopover, NvPopoverTrigger, NvPopoverContent } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const infoOpen = ref(false)
const hoverOpen = ref(false)
const sideOpen = ref(false)
</script>
# NvPopover 气泡卡片

点击或悬停触发器弹出的浮层，可承载文字、表单或操作按钮。

## 示例

<Demo>
  <NvPopover v-model:open="infoOpen">
    <NvPopoverTrigger>查看详情</NvPopoverTrigger>
    <NvPopoverContent>
      <strong>记录分组 B-20261118</strong>
      <span style="font-size: 13px; color: var(--vp-c-text-2)">已通过首次校验，当前在第二分组。</span>
      <NvButton size="sm" variant="secondary" @click="infoOpen = false">收起</NvButton>
    </NvPopoverContent>
  </NvPopover>
</Demo>

<Demo>
  <NvPopover v-model:open="hoverOpen" open-on-hover :delay="100" :close-delay="200">
    <NvPopoverTrigger>悬停打开</NvPopoverTrigger>
    <NvPopoverContent>
      <span style="font-size: 13px">鼠标移入触发器后自动出现，移出后延迟收起。</span>
    </NvPopoverContent>
  </NvPopover>
</Demo>

<Demo>
  <NvPopover v-model:open="sideOpen">
    <NvPopoverTrigger>右侧弹出</NvPopoverTrigger>
    <NvPopoverContent side="right" align="start" :side-offset="10">
      <span style="font-size: 13px">通过 `side` 与 `align` 控制弹层方向和对齐。</span>
    </NvPopoverContent>
  </NvPopover>
</Demo>

## API

### NvPopover 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `modal` | `true` 锁定焦点并使页面不可交互；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `false` |
| `openOnHover` | 悬停触发器时打开 | `boolean` | `false` |
| `delay` | 打开延迟（ms） | `number` | — |
| `closeDelay` | 关闭延迟（ms） | `number` | — |

### NvPopover 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvPopover 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 Trigger 与 Content |

### NvPopoverTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` | `false` |
| `focusableWhenDisabled` | 禁用时仍可聚焦 | `boolean` | `false` |

### NvPopoverTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容；组件自身渲染按钮 |

### NvPopoverContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `side` | 弹层相对触发器的方向 | `top \| right \| bottom \| left` | `bottom` |
| `align` | 弹层对齐方式 | `start \| center \| end` | `center` |
| `sideOffset` | 与触发器的间距（px） | `number` | `6` |

### NvPopoverContent 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 弹层内容 |

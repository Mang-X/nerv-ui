---
title: NvTooltip 文字提示
---

<script setup>
import { ref } from 'vue'
import { NvTooltip, NvTooltipTrigger, NvTooltipContent } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const inlineOpen = ref(false)
const sideOpen = ref(false)
const controlledOpen = ref(false)
const labelOpen = ref(false)
const disabledOpen = ref(false)
</script>

# NvTooltip 文字提示

悬停或聚焦时出现的短文字说明，不承载需要点击的交互内容。

## 示例

<Demo>
  <NvTooltip v-model:open="inlineOpen">
    <NvTooltipTrigger>悬停查看提示</NvTooltipTrigger>
    <NvTooltipContent>这是补充说明，默认出现在上方。</NvTooltipContent>
  </NvTooltip>
  <NvTooltip v-model:open="sideOpen">
    <NvTooltipTrigger>下方提示</NvTooltipTrigger>
    <NvTooltipContent side="bottom" align="start">通过 `side` 控制出现方向。</NvTooltipContent>
  </NvTooltip>
  <NvTooltip v-model:open="controlledOpen" :delay="0" :close-delay="0">
    <NvTooltipTrigger>无延迟提示</NvTooltipTrigger>
    <NvTooltipContent>无延迟模式下悬停即出现，移出即收起。</NvTooltipContent>
  </NvTooltip>
</Demo>

<Demo>
  <NvTooltip v-model:open="labelOpen" type="label">
    <NvTooltipTrigger>保存</NvTooltipTrigger>
    <NvTooltipContent>保存当前修改</NvTooltipContent>
  </NvTooltip>
  <NvTooltip v-model:open="disabledOpen" disabled>
    <NvTooltipTrigger>禁用提示</NvTooltipTrigger>
    <NvTooltipContent>禁用后悬停不会出现。</NvTooltipContent>
  </NvTooltip>
</Demo>

## API

### NvTooltip 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `delay` | 打开延迟（ms） | `number` | — |
| `closeDelay` | 关闭延迟（ms） | `number` | — |
| `disabled` | 禁用提示 | `boolean` | `false` |
| `type` | `'label'` 将提示作为触发器的无障碍名称；`'description'` 作为描述 | `label \| description` | `description` |

### NvTooltip 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |

### NvTooltip 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 Trigger 与 Content |

### NvTooltipTrigger 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` | `false` |

### NvTooltipTrigger 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发器内容 |

### NvTooltipContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `side` | 弹层相对触发器的方向 | `top \| right \| bottom \| left` | `top` |
| `align` | 弹层对齐方式 | `start \| center \| end` | `center` |
| `sideOffset` | 与触发器的间距（px） | `number` | `6` |

### NvTooltipContent 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 提示文字 |

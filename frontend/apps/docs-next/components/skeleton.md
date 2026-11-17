---
title: NvSkeleton 骨架屏
---

<script setup>
import { NvSkeleton } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvSkeleton 骨架屏

内容加载前的占位骨架，提供矩形、圆形与多行文本三种形状。

## 示例

<Demo block>
  <NvSkeleton width="100%" height="96px" />
</Demo>

<Demo>
  <NvSkeleton shape="circle" :width="48" :height="48" />
  <div style="display: flex; flex-direction: column; gap: 8px; flex: 1">
    <NvSkeleton shape="text" :lines="3" width="100%" />
  </div>
</Demo>

<Demo block>
  <NvSkeleton shape="text" :lines="4" label="正在加载工单详情" />
</Demo>

<Demo>
  <NvSkeleton width="160px" height="60px" animation="none" />
  <NvSkeleton shape="circle" :width="40" :height="40" animation="none" />
</Demo>

## API

### NvSkeleton 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `shape` | 形状 | `rect \| circle \| text` | `rect` |
| `width` | CSS 宽度，可传数字（px）或字符串 | `string \| number` | 随形状变化 |
| `height` | CSS 高度，可传数字（px）或字符串 | `string \| number` | 随形状变化 |
| `animation` | 动画；`none` 关闭脉冲 | `pulse \| none` | `pulse` |
| `lines` | `shape="text"` 时渲染的文本行数 | `number` | `3` |
| `label` | 加载期间播报的无障碍名称；不传则对辅助技术隐藏 | `string` | — |

### NvSkeleton 插槽

无插槽。

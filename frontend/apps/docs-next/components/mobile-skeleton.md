---
title: NvMobileSkeleton 骨架屏
---

<script setup>
import { NvMobileSkeleton } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'
</script>

# NvMobileSkeleton 骨架屏

内容加载期间的占位图形，提供矩形、圆形、文本三种形状与脉冲动画。

## 示例

<Demo block>
  <div style="display: flex; align-items: center; gap: 12px">
    <NvMobileSkeleton shape="circle" :width="48" :height="48" />
    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px">
      <NvMobileSkeleton shape="text" :lines="2" label="正在加载工单摘要" />
    </div>
  </div>
  <NvMobileSkeleton shape="rect" :height="120" />
</Demo>

<Demo block>
  <NvMobileSkeleton shape="text" :lines="1" width="60%" />
  <NvMobileSkeleton shape="rect" :height="56" animation="none" />
</Demo>

## API

### NvMobileSkeleton 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `shape` | 形状 | `rect \| circle \| text` | `rect` |
| `width` | CSS 宽度；数字按 px 处理 | `string \| number` | 按形状决定 |
| `height` | CSS 高度；数字按 px 处理 | `string \| number` | 按形状决定 |
| `animation` | 动画，`pulse` 为脉冲闪烁 | `pulse \| none` | `pulse` |
| `lines` | `shape="text"` 时的行数 | `number` | `3` |
| `label` | 加载中的读屏提示；不传则对辅助技术隐藏 | `string` | — |

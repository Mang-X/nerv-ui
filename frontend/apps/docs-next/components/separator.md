---
title: NvSeparator 分割线
---

<script setup>
import { NvSeparator } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvSeparator 分割线

在内容块之间画一条细线，支持横向与纵向；纯装饰时对辅助技术隐藏。

## 示例

<Demo block>
  <div>工单概览</div>
  <NvSeparator />
  <div>工序明细</div>
  <NvSeparator decorative />
  <div>质量记录</div>
</Demo>

<Demo>
  <span>计划</span>
  <NvSeparator orientation="vertical" style="height: 20px" />
  <span>执行</span>
  <NvSeparator orientation="vertical" style="height: 20px" />
  <span>复核</span>
</Demo>

<Demo block>
  <div style="display: flex; align-items: center; gap: 12px; width: 100%">
    <NvSeparator style="flex: 1" />
    <span style="color: var(--vp-c-text-2); font-size: 13px">或</span>
    <NvSeparator style="flex: 1" />
  </div>
</Demo>

## API

### NvSeparator 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `orientation` | 方向；纵向时需由外部给出高度 | `horizontal \| vertical` | `horizontal` |
| `decorative` | 纯视觉线条时对辅助技术隐藏 | `boolean` | `false` |

### NvSeparator 插槽

无插槽。

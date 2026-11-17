---
title: NvMobileDivider 分割线
---

<script setup>
import { NvMobileDivider } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'
</script>

# NvMobileDivider 分割线

分隔内容区块，可带文字标签或切换为纵向。

## 示例

<Demo>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <NvMobileDivider />
    <NvMobileDivider label="分组标题" />
    <NvMobileDivider>自定义标签</NvMobileDivider>
  </div>
</Demo>

<Demo>
  <div style="display: flex; align-items: center; gap: 16px; width: 100%; min-height: 48px">
    <span>左侧</span>
    <NvMobileDivider orientation="vertical" />
    <span>右侧</span>
  </div>
</Demo>

## API

### NvMobileDivider 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `orientation` | 方向 | `horizontal \| vertical` | `horizontal` |
| `decorative` | 仅作装饰，对读屏隐藏 | `boolean` | `false` |
| `label` | 横线中间的文字 | `string` | — |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 横线中间的自定义内容，替代 `label` |

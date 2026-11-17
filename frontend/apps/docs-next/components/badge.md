---
title: NvBadge 徽标
---

<script setup>
import { NvBadge } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvBadge 徽标

轻量状态标签，用于数量、分类与筛选标记，支持色调、尺寸、圆点与胶囊形态。

## 示例

<Demo>
  <NvBadge>中性</NvBadge>
  <NvBadge variant="brand">品牌</NvBadge>
  <NvBadge variant="danger">危险</NvBadge>
  <NvBadge variant="outline">描边</NvBadge>
  <NvBadge variant="ghost">幽灵</NvBadge>
</Demo>

<Demo>
  <NvBadge size="sm">小号 sm</NvBadge>
  <NvBadge size="md">中号 md</NvBadge>
  <NvBadge size="md" round>胶囊</NvBadge>
</Demo>

<Demo>
  <NvBadge dot variant="brand">运行中</NvBadge>
  <NvBadge dot variant="danger">已停机</NvBadge>
  <NvBadge dot variant="neutral">待机</NvBadge>
  <NvBadge variant="outline" round>3 条待办</NvBadge>
</Demo>

## API

### NvBadge 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉色调；业务状态语义请使用专门的状态徽标族 | `neutral \| brand \| danger \| outline \| ghost` | `neutral` |
| `size` | 尺寸 | `sm \| md` | `sm` |
| `dot` | 内容前显示同色调小圆点，用于计数与筛选 | `boolean` | `false` |
| `round` | 全圆角胶囊形态 | `boolean` | `false` |

### NvBadge 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 徽标文本 |

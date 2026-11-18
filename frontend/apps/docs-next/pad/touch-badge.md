---
title: NvTouchBadge 触屏徽标
---

<script setup>
import { NvTouchBadge } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'
</script>

# NvTouchBadge 触屏徽标

平板端的轻量标签，用于计数、筛选与分类标记，支持色调、尺寸、圆点与胶囊形态。

## 示例

<Demo>
  <NvTouchBadge>中性</NvTouchBadge>
  <NvTouchBadge variant="brand">品牌</NvTouchBadge>
  <NvTouchBadge variant="danger">危险</NvTouchBadge>
  <NvTouchBadge variant="outline">描边</NvTouchBadge>
  <NvTouchBadge variant="ghost">幽灵</NvTouchBadge>
</Demo>

<Demo>
  <NvTouchBadge size="md">中号 md</NvTouchBadge>
  <NvTouchBadge size="lg">大号 lg</NvTouchBadge>
  <NvTouchBadge size="lg" round>胶囊</NvTouchBadge>
</Demo>

<Demo>
  <NvTouchBadge dot variant="brand" size="lg">12 条记录</NvTouchBadge>
  <NvTouchBadge dot variant="danger" size="lg">3 条异常</NvTouchBadge>
  <NvTouchBadge dot variant="neutral" size="lg">待处理</NvTouchBadge>
  <NvTouchBadge variant="outline" round size="lg">分组 A</NvTouchBadge>
</Demo>

## API

### NvTouchBadge 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉色调；业务状态语义请使用专门的状态徽标族 | `neutral \| brand \| danger \| outline \| ghost` | `neutral` |
| `size` | 尺寸 | `md \| lg` | `md` |
| `dot` | 内容前显示同色调小圆点，用于计数与筛选 | `boolean` | `false` |
| `round` | 全圆角胶囊形态 | `boolean` | `false` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 徽标文本 |

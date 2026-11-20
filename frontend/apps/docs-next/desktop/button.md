---
title: NvButton 按钮
---

<script setup>
import { NvButton } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'
</script>

# NvButton 按钮

触发操作或导航。

## 示例

<Demo>
  <NvButton variant="primary">主操作</NvButton>
  <NvButton variant="secondary">次要</NvButton>
  <NvButton variant="outline">描边</NvButton>
  <NvButton variant="ghost">幽灵</NvButton>
  <NvButton variant="danger">危险</NvButton>
  <NvButton variant="link">链接</NvButton>
</Demo>

<Demo>
  <NvButton size="sm">小号</NvButton>
  <NvButton size="md">中号</NvButton>
  <NvButton size="lg">大号</NvButton>
  <NvButton disabled>禁用</NvButton>
</Demo>

## API

### NvButton 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉变体 | `primary \| secondary \| outline \| ghost \| danger \| link` | `secondary` |
| `size` | 尺寸 | `sm \| md \| lg` | `md` |
| `block` | 整宽 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `type` | 原生类型 | `button \| submit \| reset` | `button` |

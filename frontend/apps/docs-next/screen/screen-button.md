---
title: NvScreenButton 大屏按钮
---

<script setup>
import { NvScreenButton } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'
</script>

# NvScreenButton 大屏按钮

大屏场景的高对比按钮，触控目标从 56px 起，自带深色底令牌。

## 示例

<Demo>
  <div class="nv-screen-stage">
    <NvScreenButton variant="primary">主操作</NvScreenButton>
    <NvScreenButton variant="secondary">次要</NvScreenButton>
    <NvScreenButton variant="outline">描边</NvScreenButton>
    <NvScreenButton variant="ghost">幽灵</NvScreenButton>
    <NvScreenButton variant="danger">危险</NvScreenButton>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvScreenButton size="md">中号 56</NvScreenButton>
    <NvScreenButton size="lg">大号 64</NvScreenButton>
    <NvScreenButton size="xl">特大 72</NvScreenButton>
    <NvScreenButton disabled>禁用</NvScreenButton>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column">
    <NvScreenButton block variant="primary">整宽按钮</NvScreenButton>
  </div>
</Demo>

## API

### NvScreenButton 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉变体 | `primary \| secondary \| outline \| ghost \| danger` | `secondary` |
| `size` | 尺寸，高度依次为 56 / 64 / 72px | `md \| lg \| xl` | `md` |
| `block` | 整宽 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `iconOnly` | 只显示图标 | `boolean` | `false` |
| `type` | 原生类型 | `button \| submit \| reset` | `button` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮文字 |
| `icon` | 文字前的图标 |

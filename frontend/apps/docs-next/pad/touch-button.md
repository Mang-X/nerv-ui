---
title: NvTouchButton 触屏按钮
---

<script setup>
import { NvTouchButton } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'
</script>

# NvTouchButton 触屏按钮

面向终端平板的大触控目标按钮，最小高度从 56px 起。

## 示例

<Demo>
  <NvTouchButton variant="primary">主操作</NvTouchButton>
  <NvTouchButton variant="secondary">次要</NvTouchButton>
  <NvTouchButton variant="outline">描边</NvTouchButton>
  <NvTouchButton variant="ghost">幽灵</NvTouchButton>
  <NvTouchButton variant="danger">危险</NvTouchButton>
</Demo>

<Demo>
  <NvTouchButton size="md">中号 56</NvTouchButton>
  <NvTouchButton size="lg">大号 64</NvTouchButton>
  <NvTouchButton size="xl">特大 72</NvTouchButton>
  <NvTouchButton disabled>禁用</NvTouchButton>
</Demo>

<Demo>
  <NvTouchButton variant="primary" block>整宽按钮</NvTouchButton>
</Demo>

<Demo>
  <NvTouchButton variant="secondary">
    <template #icon>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
    带图标
  </NvTouchButton>
  <NvTouchButton variant="secondary" icon-only size="lg" aria-label="添加">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
  </NvTouchButton>
</Demo>

## API

### NvTouchButton 属性

| 属性       | 说明                               | 类型                                                 | 默认        |
| ---------- | ---------------------------------- | ---------------------------------------------------- | ----------- |
| `variant`  | 视觉变体                           | `primary \| secondary \| outline \| ghost \| danger` | `secondary` |
| `size`     | 尺寸，高度依次为 56 / 64 / 72px    | `md \| lg \| xl`                                     | `md`        |
| `block`    | 整宽                               | `boolean`                                            | `false`     |
| `disabled` | 禁用                               | `boolean`                                            | `false`     |
| `iconOnly` | 只显示图标，按尺寸收成方形触控目标 | `boolean`                                            | `false`     |
| `type`     | 原生类型                           | `button \| submit \| reset`                          | `button`    |

### 插槽

| 插槽      | 说明         |
| --------- | ------------ |
| `default` | 按钮文字     |
| `icon`    | 文字前的图标 |

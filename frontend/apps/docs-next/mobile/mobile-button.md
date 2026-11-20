---
title: NvMobileButton 按钮
---

<script setup>
import { ref } from 'vue'
import { NvMobileButton } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const clicks = ref(0)
</script>

# NvMobileButton 按钮

移动端的主操作按钮，视觉变体与桌面端一致，尺寸只为触控场景提供。

## 示例

<Demo>
  <NvMobileButton variant="primary">主操作</NvMobileButton>
  <NvMobileButton variant="secondary">次要</NvMobileButton>
  <NvMobileButton variant="outline">描边</NvMobileButton>
  <NvMobileButton variant="ghost">幽灵</NvMobileButton>
  <NvMobileButton variant="danger">危险</NvMobileButton>
  <NvMobileButton variant="link">链接</NvMobileButton>
</Demo>

<Demo>
  <NvMobileButton size="md">中号</NvMobileButton>
  <NvMobileButton size="lg">大号</NvMobileButton>
  <NvMobileButton loading>加载中</NvMobileButton>
  <NvMobileButton disabled>禁用</NvMobileButton>
</Demo>

<Demo>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 100%">
    <NvMobileButton block>整宽按钮</NvMobileButton>
    <NvMobileButton block variant="secondary" @click="clicks++">
      点击 {{ clicks }} 次
    </NvMobileButton>
  </div>
</Demo>

<Demo>
  <NvMobileButton variant="primary">
    <template #icon>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
    带图标
  </NvMobileButton>
</Demo>

## API

### NvMobileButton 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | 视觉变体 | `primary \| secondary \| outline \| ghost \| danger \| link` | `primary` |
| `size` | 尺寸 | `md \| lg` | `md` |
| `block` | 整宽 | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `loading` | 加载中，同时禁用点击与 `icon` 插槽 | `boolean` | `false` |
| `type` | 原生类型 | `button \| submit \| reset` | `button` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 按钮文字 |
| `icon` | 文字前的图标；`loading` 时被加载图标替换 |

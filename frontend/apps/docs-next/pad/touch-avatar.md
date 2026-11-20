---
title: NvTouchAvatar 触屏头像
---

<script setup>
import { NvTouchAvatar } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'
</script>

# NvTouchAvatar 触屏头像

平板端的头像展示，尺寸从 56px 起，图片加载中或失败时回退为首字母。

## 示例

<Demo>
  <NvTouchAvatar name="分组 A" size="md" />
  <NvTouchAvatar name="资源 1" size="lg" />
  <NvTouchAvatar name="步骤 3" size="xl" />
</Demo>

<Demo>
  <NvTouchAvatar name="分组 B" shape="square" status="online" />
  <NvTouchAvatar name="资源 2" shape="square" status="busy" />
  <NvTouchAvatar name="记录 C" shape="square" status="offline" />
</Demo>

<Demo>
  <NvTouchAvatar alt="访问者头像" fallback="访客" size="xl" />
  <NvTouchAvatar name="记录 C" size="md" fallback-delay="300" />
  <NvTouchAvatar name="资源 3">
    <template #fallback>R3</template>
  </NvTouchAvatar>
</Demo>

## API

### NvTouchAvatar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `src` | 图片地址；加载中或加载失败时显示回退内容 | `string` | — |
| `alt` | 图片的无障碍名称，也参与首字母回退 | `string` | — |
| `name` | 人员或团队名称，未提供 `fallback` 时用于生成首字母 | `string` | — |
| `fallback` | 显式回退文案，优先级高于自动首字母 | `string` | — |
| `size` | 尺寸：`md` 56px，`lg` 72px，`xl` 96px | `md \| lg \| xl` | `lg` |
| `shape` | 形状 | `circle \| square` | `circle` |
| `status` | 角标上的在线状态点 | `online \| busy \| offline` | — |
| `fallbackDelay` | 显示回退前的等待毫秒数，避免快速加载时闪出首字母 | `number` | `0` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `fallback` | 自定义回退内容 |

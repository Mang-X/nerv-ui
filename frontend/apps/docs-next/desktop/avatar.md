---
title: NvAvatar 头像
---

<script setup>
import { onMounted, ref } from 'vue'
import { NvAvatar } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const logoSrc = ref(null)
onMounted(() => {
  logoSrc.value = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#2563eb"/><circle cx="80" cy="80" r="42" fill="#ffffff" fill-opacity="0.9"/><text x="80" y="94" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#1e293b">N</text></svg>',
  )}`
})
</script>

# NvAvatar 头像

展示人物或团队头像；图片加载中或失败时回退到姓名首字，支持尺寸与形状。

## 示例

<Demo>
  <NvAvatar name="张伟" />
  <NvAvatar name="李娜" />
  <NvAvatar name="王强" />
  <NvAvatar fallback="团队" />
</Demo>

<Demo>
  <NvAvatar size="sm" name="小明" />
  <NvAvatar size="md" name="小明" />
  <NvAvatar size="lg" name="小明" />
  <NvAvatar size="xl" name="小明" />
</Demo>

<Demo>
  <NvAvatar shape="square" name="华东区域" />
  <NvAvatar shape="square" size="lg" name="华东区域" />
</Demo>

<Demo>
  <NvAvatar :src="logoSrc" name="NvUI 团队" alt="NvUI 团队" size="lg" />
  <NvAvatar name="无图片时显示首字" />
</Demo>

## API

### NvAvatar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `src` | 图片地址；加载中或加载失败时显示回退内容 | `string` | — |
| `alt` | 图片无障碍名称，同时用作首字回退的来源 | `string` | — |
| `name` | 人物或团队名称，未提供 `fallback` 时用于计算首字 | `string` | — |
| `fallback` | 显式回退文本，优先于计算出的首字 | `string` | — |
| `size` | 尺寸 | `sm \| md \| lg \| xl` | `md` |
| `shape` | 形状 | `circle \| square` | `circle` |
| `fallbackDelay` | 延迟显示回退的毫秒数，避免快速加载的图片先闪首字 | `number` | `0` |

### NvAvatar 插槽

| 插槽 | 说明 |
| --- | --- |
| `fallback` | 自定义回退内容，替代首字文本 |

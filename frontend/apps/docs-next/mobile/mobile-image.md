---
title: NvMobileImage 图片
---

<script setup>
import { NvMobileImage } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'
</script>

# NvMobileImage 图片

按比例预留空间的图片容器。加载中显示占位底色，失败显示破图图标。

## 示例

<Demo block>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <NvMobileImage
      src="https://picsum.photos/seed/nerv/320/180"
      alt="示例图片"
      ratio="16/9"
      radius="md"
    />
    <NvMobileImage src="/not-found.png" alt="加载失败的示例" ratio="16/9" radius="md" />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `src` | 图片地址。 |
| `alt` | 替代文字。有意义的图片必须给——它同时是读屏名称。 |
| `fit` | `cover` / `contain`。 |
| `radius` | `none` / `sm` / `md` / `lg` / `full`。 |
| `ratio` | 宽高比，如 `16/9` 或 `4/3`。用来预留布局空间，避免加载后跳动。 |

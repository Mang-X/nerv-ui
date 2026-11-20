---
title: NvScreenGlowDivider 大屏分隔线
---

<script setup>
import { NvScreenGlowDivider } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenGlowDivider 大屏分隔线

一条渐变细线，中点有一个亮斑，可选流光沿线条滑动。纯装饰，`aria-hidden`。

## 示例

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; gap: 24px; padding: 40px">
    <NvScreenGlowDivider />
    <NvScreenGlowDivider flow />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `flow` | 是否播放流光动画。默认 `true`；开启 `prefers-reduced-motion` 时自动关闭。 |

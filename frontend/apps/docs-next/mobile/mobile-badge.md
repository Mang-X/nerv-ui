---
title: NvMobileBadge 角标
---

<script setup>
import { NvMobileBadge } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'
</script>

# NvMobileBadge 角标

把计数或小红点钉在包裹内容的右上角。纯展示——数字层对读屏是隐藏的，语义应由包裹元素自己的标签承担。

## 示例

<Demo block>
  <div style="display: flex; gap: 32px; align-items: center; padding: 16px">
    <NvMobileBadge :count="5">
      <span style="display: inline-flex; width: 40px; height: 40px; border-radius: 10px; background: var(--vp-c-bg-soft)" />
    </NvMobileBadge>
    <NvMobileBadge :count="128" :max="99">
      <span style="display: inline-flex; width: 40px; height: 40px; border-radius: 10px; background: var(--vp-c-bg-soft)" />
    </NvMobileBadge>
    <NvMobileBadge dot>
      <span style="display: inline-flex; width: 40px; height: 40px; border-radius: 10px; background: var(--vp-c-bg-soft)" />
    </NvMobileBadge>
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `count` | 计数值。为 0 且未开 `dot` 时不显示。 |
| `dot` | 只显示小圆点。 |
| `max` | 超过这个数显示 `{max}+`，默认 `99`。 |

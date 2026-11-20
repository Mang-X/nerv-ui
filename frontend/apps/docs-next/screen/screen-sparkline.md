---
title: NvScreenSparkline 迷你折线
---

<script setup>
import { NvScreenSparkline } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenSparkline 迷你折线

细线折线加最新点标记，可选面积填充。少于两个点时不画。`aria-hidden`——它的含义应由旁边的文字给出。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px; flex-direction: column; gap: 24px">
    <NvScreenSparkline :data="[8, 11, 9, 14, 12, 17, 15, 21, 19, 24, 22, 28]" />
    <NvScreenSparkline :data="[28, 24, 25, 19, 21, 15, 13, 16, 11, 9]" area />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `data` | 数值序列，至少两个点。 |
| `area` | 是否填充折线下方，默认 `false`。 |
| `color` | 线条颜色，默认大屏强调色。 |

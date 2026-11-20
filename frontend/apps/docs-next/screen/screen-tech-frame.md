---
title: NvScreenTechFrame 大屏外框
---

<script setup>
import { NvScreenTechFrame } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenTechFrame 大屏外框

一圈细描边加四个角标；角标颜色由 `accent` 决定。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px; gap: 16px">
    <NvScreenTechFrame accent="cyan" style="width: 200px; height: 100px">青色</NvScreenTechFrame>
    <NvScreenTechFrame accent="green" style="width: 200px; height: 100px">绿色</NvScreenTechFrame>
    <NvScreenTechFrame accent="amber" style="width: 200px; height: 100px">琥珀</NvScreenTechFrame>
    <NvScreenTechFrame accent="red" style="width: 200px; height: 100px">警示</NvScreenTechFrame>
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `accent` | 角标颜色：`cyan` / `green` / `amber` / `red`，默认 `cyan`。 |

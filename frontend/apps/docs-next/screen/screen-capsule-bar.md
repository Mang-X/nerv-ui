---
title: NvScreenCapsuleBar 大屏胶囊进度
---

<script setup>
import { NvScreenCapsuleBar } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenCapsuleBar 大屏胶囊进度

每行是标题、圆角轨道与填充，右侧显示百分比。颜色只做辅助——数值始终显示，不靠颜色单独传信息。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px">
    <NvScreenCapsuleBar
      :items="[
        { label: '焊接线 A', value: 93, tone: 'cyan' },
        { label: '装配线 B', value: 76, tone: 'green' },
        { label: 'CNC 线 C', value: 41, tone: 'amber' },
        { label: '涂装线 D', value: 12, tone: 'red' },
      ]"
    />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `items` | `{ label, value, tone? }[]`。`value` 会被夹到 0–100。 |
| `suffix` | 数值后缀，默认 `%`。 |

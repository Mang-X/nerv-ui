---
title: NvScreenDonut 环形占比
---

<script setup>
import { NvScreenDonut } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenDonut 环形占比

发丝底环加语义色弧段（段间留缝），中心插槽放主数字，右侧内置图例。每段的名称与数值在图例里以文字给出。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px">
    <NvScreenDonut
      :segments="[
        { label: '运行', value: 12, color: 'oklch(0.79 0.16 152)' },
        { label: '待机', value: 5, color: 'oklch(0.83 0.15 82)' },
        { label: '故障', value: 2, color: 'oklch(0.69 0.2 25)' },
      ]"
    >
      <template #center>
        <strong style="font-size: 24px">19</strong>
        <span style="font-size: 12px; opacity: 0.7">台</span>
      </template>
    </NvScreenDonut>
  </div>
</Demo>

## API

| 属性 / 插槽 | 说明 |
| --- | --- |
| `segments` | `{ label, value, color }[]`。`value` 为 0 的段不画弧。 |
| `size` | 环的直径，默认 `118`。 |
| `thickness` | 环宽，默认 `11`。 |
| `legend` | 是否显示内置图例，默认 `true`。 |
| `center` 插槽 | 环中心的数字。 |

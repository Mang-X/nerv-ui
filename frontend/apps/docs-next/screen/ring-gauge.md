---
title: NvRingGauge 环形仪表
---

<script setup>
import { NvRingGauge } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvRingGauge 环形仪表

大屏上的环形进度指标，数值与弧长同步展示。

## 示例

<Demo>
  <div class="nv-screen-stage">
    <NvRingGauge :value="76" :max="100" label="资源综合效率" unit="%" />
    <NvRingGauge :value="92" :max="100" label="一次通过率" unit="%" tone="success" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvRingGauge :value="45" :max="100" label="任务进度" unit="%" tone="warning" :size="140" :thickness="12" />
    <NvRingGauge :value="120" :max="100" label="超限示例" unit="%" tone="danger" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvRingGauge :value="0.5" :max="1" :size="120" :thickness="10" label="小时负载" aria-label="小时负载" />
  </div>
</Demo>

## API

### NvRingGauge 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 当前值 | `number` | — |
| `max` | 满量程值 | `number` | `100` |
| `size` | 整体尺寸（px） | `number` | `180` |
| `thickness` | 圆环线宽（px） | `number` | `14` |
| `tone` | 语义色调 | `accent \| success \| warning \| danger` | `accent` |
| `label` | 圆环下方文字 | `string` | — |
| `unit` | 数值单位 | `string` | — |
| `showValue` | 显示中心数值 | `boolean` | `true` |
| `ariaLabel` | 无障碍标签 | `string` | `label`，否则 `指标` |

### 说明

`value` 超出 `0 ~ max` 时按边界截断绘制，中心数值仍按原值显示（整数值直出，非整数保留一位小数）。

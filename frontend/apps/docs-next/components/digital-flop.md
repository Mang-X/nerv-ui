---
title: NvDigitalFlop 数字翻牌
---

<script setup>
import { ref } from 'vue'
import { NvDigitalFlop } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const count = ref(12480)
</script>

# NvDigitalFlop 数字翻牌

大屏的数字化数值展示，逐字符翻牌，可选固定位数。

## 示例

<Demo>
  <div class="nv-screen-stage">
    <NvDigitalFlop :value="count" label="今日产量" />
    <NvDigitalFlop :value="3.6" size="md" tone="success" />
    <NvDigitalFlop :value="-0.8" size="md" tone="danger" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvDigitalFlop :value="count" :digits="8" size="lg" label="固定 8 位" />
    <NvDigitalFlop :value="count" :digits="8" size="xl" tone="accent" label="特大号" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvDigitalFlop :value="count" :animated="false" size="md" label="不翻牌" />
  </div>
</Demo>

当前值：{{ count }}

<Demo>
  <div class="nv-screen-stage">
    <button type="button" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #334155; background: #111c31; color: #dbeafe" @click="count += 137">数值 +137</button>
  </div>
</Demo>

## API

### NvDigitalFlop 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 展示值；整数或字符串均可，非整数按字符串直出 | `number \| string` | — |
| `digits` | 固定位数，整数时左侧补零 | `number` | — |
| `size` | 尺寸 | `md \| lg \| xl` | `lg` |
| `tone` | 语义色调 | `default \| accent \| success \| warning \| danger` | `default` |
| `label` | 数值上方的标签 | `string` | — |
| `animated` | 翻牌动效 | `boolean` | `true` |
| `ariaLabel` | 无障碍标签 | `string` | 由 `label` 与 `value` 组合 |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `label` | 自定义标签内容 |

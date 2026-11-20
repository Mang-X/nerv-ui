---
title: NvScreenStatusLight 状态灯
---

<script setup>
import { NvScreenStatusLight } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenStatusLight 状态灯

带呼吸动画的状态圆点与文字，用于表达资源、接口或数据链路的即时状态。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; gap: 24px; flex-wrap: wrap">
    <NvScreenStatusLight tone="success" label="运行正常" />
    <NvScreenStatusLight tone="warning" label="需要关注" />
    <NvScreenStatusLight tone="danger" label="告警" />
    <NvScreenStatusLight tone="accent" label="同步中" />
    <NvScreenStatusLight tone="default" label="未知" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
    <NvScreenStatusLight size="sm" tone="success" label="小" />
    <NvScreenStatusLight size="md" tone="success" label="中" />
    <NvScreenStatusLight size="lg" tone="success" label="大" />
    <NvScreenStatusLight tone="danger" label="静态不呼吸" static />
    <NvScreenStatusLight tone="success" />
  </div>
</Demo>

## API

### NvScreenStatusLight 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `tone` | 语义色 | `default \| accent \| success \| warning \| danger` | `default` |
| `label` | 圆点右侧文字；不传则只显示圆点 | `string` | — |
| `size` | 圆点直径 10 / 13 / 16px | `sm \| md \| lg` | `md` |
| `static` | 关闭呼吸动画，适合密集列表 | `boolean` | `false` |

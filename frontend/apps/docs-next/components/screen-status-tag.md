---
title: NvScreenStatusTag 状态标签
---

<script setup>
import { NvScreenStatusTag } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'
</script>

# NvScreenStatusTag 状态标签

带状态点的小标签，用于表格、卡片与清单中的状态词，状态永远由文案本身承担。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
    <NvScreenStatusTag label="运行中" tone="success" />
    <NvScreenStatusTag label="待机" tone="warning" />
    <NvScreenStatusTag label="报警" tone="danger" />
    <NvScreenStatusTag label="同步中" tone="accent" />
    <NvScreenStatusTag label="未知" tone="default" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
    <NvScreenStatusTag label="小" tone="success" size="sm" />
    <NvScreenStatusTag label="中" tone="success" size="md" />
    <NvScreenStatusTag label="大" tone="success" size="lg" />
    <NvScreenStatusTag label="无圆点" tone="warning" :dot="false" />
    <NvScreenStatusTag label="方形" tone="danger" square />
  </div>
</Demo>

## API

### NvScreenStatusTag 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `tone` | 语义色 | `default \| accent \| success \| warning \| danger` | `default` |
| `label` | 状态文案，必填；组件不根据文本推断状态 | `string` | — |
| `size` | 高度 26 / 32 / 38px | `sm \| md \| lg` | `md` |
| `dot` | 显示前置状态点 | `boolean` | `true` |
| `square` | 使用近方形圆角，便于行内表格 | `boolean` | `false` |

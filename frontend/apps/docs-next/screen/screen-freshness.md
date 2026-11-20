---
title: NvScreenFreshness 数据新鲜度
---

<script setup>
import { NvScreenFreshness } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenFreshness 数据新鲜度

状态点加文字，`role="status"` 让文案变化时能被读屏播报。时钟与措辞由调用方持有一段——不同来源的刷新节奏不同，不能合并成同一个钟。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px; flex-direction: column; gap: 12px">
    <NvScreenFreshness tone="live" label="14:32 更新" />
    <NvScreenFreshness tone="stale" label="14:05 更新" />
    <NvScreenFreshness tone="wait" label="等待首次数据" />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `tone` | `live` / `stale` / `wait`，默认 `wait`。 |
| `label` | 展示文案，必填。 |

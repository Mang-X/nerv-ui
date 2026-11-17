---
title: NvStationBar 工位条
---

<script setup>
import { NvStationBar } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'
</script>

# NvStationBar 工位条

工位列表中的单行状态条，用颜色和文字同时表达工位状态。

## 示例

<Demo>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 100%">
    <NvStationBar station="总装一线 04 工位" code="ST-04" status="running" meta="当前工单 WO-2026-0412" active />
    <NvStationBar station="总装一线 05 工位" code="ST-05" status="idle" meta="等待派工" />
    <NvStationBar station="总装一线 06 工位" code="ST-06" status="paused" meta="换型准备中" />
    <NvStationBar station="总装一线 07 工位" code="ST-07" status="alarm" meta="设备报警：主轴温度过高" />
    <NvStationBar station="总装一线 08 工位" code="ST-08" status="offline" meta="通讯中断" />
  </div>
</Demo>

<Demo>
  <div style="display: flex; flex-direction: column; gap: 12px; width: 100%">
    <NvStationBar station="可以自定义状态文案" code="ST-09" status="running" status-label="生产中" />
    <NvStationBar station="带操作区" code="ST-10" status="idle">
      <template #actions>
        <span style="font-size: 12px; opacity: 0.7">长按派工</span>
      </template>
    </NvStationBar>
  </div>
</Demo>

## API

### NvStationBar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `station` | 工位名称，必填 | `string` | — |
| `code` | 工位编码 | `string` | — |
| `status` | 工位状态 | `idle \| running \| paused \| alarm \| offline` | `idle` |
| `statusLabel` | 覆盖状态文字 | `string` | 按状态取内置文案 |
| `meta` | 次要信息 | `string` | — |
| `active` | 选中/激活强调 | `boolean` | `false` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 工位名称前的图标 |
| `meta` | 自定义次要信息 |
| `actions` | 状态标签之后的操作区 |

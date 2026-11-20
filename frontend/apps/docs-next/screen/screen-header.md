---
title: NvScreenHeader 大屏页头
---

<script setup>
import { NvScreenHeader } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenHeader 大屏页头

大屏顶部标题区，左侧品牌与标题，中间可放筛选，右侧时间与状态。

## 示例

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvScreenHeader
      title="区域数据看板"
      subtitle="Nerv-IIP · 实时监控"
      time="2026-11-18 10:12"
      status-label="数据正常"
      status-tone="success"
    />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvScreenHeader
      title="资源运行总览"
      time="10:12"
      status-label="资源告警"
      status-tone="danger"
    >
      <span style="font-size: 13px; opacity: 0.8">中间筛选区</span>
    </NvScreenHeader>
    <NvScreenHeader title="无标记页头" :show-mark="false" status-label="离线" status-tone="warning" />
  </div>
</Demo>

## API

### NvScreenHeader 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 主标题 | `string` | — |
| `subtitle` | 副标题 | `string` | — |
| `time` | 右侧时间文本 | `string` | — |
| `statusLabel` | 右侧状态文字 | `string` | — |
| `statusTone` | 状态点的语义色 | `default \| accent \| success \| warning \| danger` | `default` |
| `showMark` | 显示品牌标记块 | `boolean` | `true` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 页头中间区域，通常放筛选控件 |
| `left` | 替换左侧标题区 |
| `right` | 替换右侧时间与状态区 |

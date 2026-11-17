---
title: NvScreenPanel 大屏面板
---

<script setup>
import { NvScreenPanel } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'
</script>

# NvScreenPanel 大屏面板

大屏内容区的容器卡片，提供标题、操作区和按语义着色的边框。

## 示例

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvScreenPanel title="今日产量" subtitle="按小时统计" style="height: 160px">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; opacity: 0.7">
        图表区域
      </div>
    </NvScreenPanel>
    <NvScreenPanel title="设备状态" tone="accent">
      <span style="opacity: 0.8">强调态面板</span>
    </NvScreenPanel>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="flex-direction: column; align-items: stretch">
    <NvScreenPanel title="告警面板" tone="danger">
      <span style="opacity: 0.8">危险态强调</span>
    </NvScreenPanel>
    <NvScreenPanel title="带操作区" tone="warning">
      <template #actions>
        <span style="font-size: 13px; opacity: 0.8">更多</span>
      </template>
      <span style="opacity: 0.8">警告态强调</span>
      <template #footer>
        <span style="font-size: 12px; opacity: 0.6">最近更新 10:12</span>
      </template>
    </NvScreenPanel>
  </div>
</Demo>

## API

### NvScreenPanel 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 面板标题 | `string` | — |
| `subtitle` | 标题下方的副标题 | `string` | — |
| `tone` | 语义色调 | `default \| accent \| warning \| danger` | `default` |
| `padded` | 主体是否带内边距 | `boolean` | `true` |
| `scroll` | 主体内容溢出时可滚动 | `boolean` | `true` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 面板主体 |
| `header` | 完整替换默认标题区 |
| `actions` | 标题行右侧操作区 |
| `footer` | 面板底部内容 |

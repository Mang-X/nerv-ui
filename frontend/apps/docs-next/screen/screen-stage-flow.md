---
title: NvScreenStageFlow 阶段流转
---

<script setup>
import { NvScreenStageFlow } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const stages = [
  { key: 's1', label: '创建', value: 120, unit: '项', status: { label: '正常', tone: 'success' } },
  { key: 's2', label: '处理', value: 86, unit: '项', status: { label: '积压', tone: 'warning' } },
  { key: 's3', label: '审核', value: 74, unit: '项', status: { label: '正常', tone: 'success' } },
  { key: 's4', label: '发布', value: 62, unit: '项', status: { label: '低速', tone: 'accent' } },
  { key: 's5', label: '归档', value: null, unit: '项', status: { label: '未知', tone: 'default' } },
]
</script>

# NvScreenStageFlow 阶段流转

横向排列的阶段卡片，阶段之间用连接符串起，适合展示各阶段的进行中数量。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenStageFlow :stages="stages" aria-label="阶段流转" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenStageFlow :stages="stages.slice(0, 3)" connector="→" aria-label="三阶段流转" />
    <NvScreenStageFlow :stages="stages.slice(0, 3)" connector="" aria-label="无连接符" />
  </div>
</Demo>

## API

### NvScreenStageFlow 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `stages` | 阶段列表，必填 | `StageFlowStage[]` | — |
| `connector` | 阶段之间的连接符；空字符串移除 | `string` | `›` |
| `ariaLabel` | 流转组的无障碍名称 | `string` | `阶段流转` |

### StageFlowStage

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 稳定标识 | `string \| number` |
| `label` | 阶段名 | `string` |
| `value` | 阶段数量；`null` 表示未知而非零 | `number \| null` |
| `unit` | 数量单位 | `string` |
| `status` | 阶段状态 `{ label, tone }`，`tone` 取语义色 | `{ label: string; tone: StageFlowTone }` |

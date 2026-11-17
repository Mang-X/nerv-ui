---
title: NvAlarmTable 告警列表
---

<script setup>
import { NvAlarmTable } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const rows = [
  { id: 1, time: '10:02:31', source: '总装 A 线 · 工位 12', message: '扭力值连续 3 件超上限', level: 'critical', status: '未确认', statusTone: 'danger' },
  { id: 2, time: '09:58:12', source: '焊装线 · 机器人 R03', message: '焊接电流波动超出工艺窗口', level: 'major', status: '处理中', statusTone: 'warning' },
  { id: 3, time: '09:41:55', source: '涂装线 · 烘干炉', message: '炉温偏低 6°C，已自动补偿', level: 'minor', status: '已恢复', statusTone: 'success' },
  { id: 4, time: '09:30:08', source: '立体库 · 堆垛机', message: '任务队列积压 18 条', level: 'info', status: '已恢复', statusTone: 'accent' },
]

const levelLabels = { critical: '紧急', major: '重要', minor: '一般', info: '提示' }
const labels = { level: '级别', time: '发生时间', source: '来源', message: '告警内容', status: '状态' }
</script>

# NvAlarmTable 告警列表

面向大屏的告警表格，固定级别、时间、来源、内容、状态五列，级别和状态各自带语义色。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvAlarmTable :rows="rows" :level-labels="levelLabels" :labels="labels" aria-label="当前告警" />
    <NvAlarmTable :rows="rows.slice(0, 2)" density="sm" :zebra="false" />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvAlarmTable
      :rows="[
        { id: 1, time: '10:02:31', source: '总装 A 线', message: '扭力超上限', level: 'critical' },
      ]"
      empty-label="当前没有告警"
    >
      <template #message="{ row }">
        <span style="font-weight: 600" v-text="row.message"></span>
      </template>
    </NvAlarmTable>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <NvAlarmTable :rows="[]" />
  </div>
</Demo>

## API

### NvAlarmTable 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `rows` | 告警记录，必填 | `AlarmRecord[]` | — |
| `labels` | 覆盖五列表头文案 | `AlarmTableLabels` | `{}` |
| `levelLabels` | 覆盖级别文案 | `AlarmLevelLabels` | `{}` |
| `density` | 行高预设 | `md \| sm` | `md` |
| `zebra` | 斑马纹 | `boolean` | `true` |
| `emptyLabel` | 空数据文案 | `string` | `暂无告警` |
| `ariaLabel` | 表格区域的无障碍名称 | `string` | `告警列表` |

### AlarmRecord

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `id` | 记录标识 | `string \| number` |
| `time` | 已格式化好的展示时间 | `string` |
| `source` | 线体 / 工位 / 设备来源 | `string` |
| `message` | 告警内容 | `string` |
| `level` | 级别 | `'critical' \| 'major' \| 'minor' \| 'info'` |
| `status` | 处理状态文案 | `string` |
| `statusTone` | 状态文案的语义色，组件不根据文本推断 | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |

### NvAlarmTable 插槽

| 插槽 | 说明 |
| --- | --- |
| `level` | 自定义级别单元格，作用域参数为 `{ row, label }` |
| `message` | 自定义告警内容，作用域参数为 `{ row }` |
| `status` | 自定义状态单元格，作用域参数为 `{ row }` |

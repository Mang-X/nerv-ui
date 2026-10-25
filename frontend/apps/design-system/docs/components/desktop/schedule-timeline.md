---
title: NvScheduleTimeline 只读时间安排
---

<script setup>
import { ref } from 'vue'
import { NvScheduleTimeline } from '@nerv-iip/ui'
const selected = ref('尚未选择')
const model = {
  horizon: { start: '2026-01-15T00:00:00Z', end: '2026-01-16T00:00:00Z' },
  timezones: ['UTC'],
  groups: [{ id: 'reading', label: '阅读计划' }, { id: 'walking', label: '漫步计划' }],
  tasks: [
    { id: 'read', label: '读一本书', groupId: 'reading', start: '2026-01-15T06:00:00Z', end: '2026-01-15T12:00:00Z', timezone: 'UTC', facts: [{ label: '书目', value: '山间来信' }] },
    { id: 'walk', label: '午后漫步', groupId: 'walking', start: '2026-01-15T16:00:00Z', end: '2026-01-15T20:00:00Z', timezone: 'UTC' },
  ],
  links: [{ id: 'read-walk', source: 'read', target: 'walk' }],
}
</script>

# NvScheduleTimeline 只读时间安排

<Demo>
  <p>{{ selected }}</p>
  <NvScheduleTimeline :model="model" scale="day" @task-select="selected = $event" />
</Demo>

```vue
<script setup lang="ts">
import { NvScheduleTimeline, type NvScheduleVisualModel } from '@nerv-iip/ui'
// model: NvScheduleVisualModel，由宿主提供展示事实。
</script>
<template>
  <NvScheduleTimeline :model="model" scale="day" @task-select="selectTask" />
</template>
```

| 属性         | 类型                                                  | 默认 / 含义                                                        |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `model`      | `NvScheduleVisualModel`                               | 必填；horizon/tasks/links，groups/resources/timezones/windows 可选 |
| `view`       | `'task' \| 'resource'`                                | `'task'`                                                           |
| `scale`      | `'auto' \| 'eightHours' \| 'day'`                     | `'auto'`；UTC 边界                                                 |
| `laneOrder`  | `'busiest' \| 'name' \| 'onlyScheduled' \| 'catalog'` | `'busiest'`                                                        |
| `laneLabel`  | `string`                                              | `'安排 / 任务'`                                                    |
| `emptyLabel` | `string`                                              | `'暂无时间安排'`                                                   |

`taskSelect` / `conflictClick` 负载为 `taskId: string`。组件始终只读，没有编辑入口；锁定任务仍可选择。

短任务不会因文字、状态徽章或内边距撑宽；投影不足 96px 时可展开原生“短时任务详情”阅读并选择，时间条仍保留完整可访问名称。日期必须为真实日历上的 ISO UTC/offset 实刻，非法日期/时间不归一化。

公开类型同从主桶导出：`NvScheduleInterval`、`NvScheduleFact`、`NvScheduleTask`、`NvScheduleLane`、`NvScheduleLink`、`NvScheduleWindow`、`NvScheduleVisualModel`。详细字段以[类型源码](../../../../../packages/ui/src/components/pc/schedule-timeline/types.ts)为准。

活动独立示例在 playground `/#schedule`；本页源码已同步，完整文档站运行仍由 #10 验证。

<!-- @include: ../../../../../DESIGN/components/schedule-timeline.md -->

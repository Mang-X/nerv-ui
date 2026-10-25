<script setup lang="ts">
import { NvScheduleTimeline, type NvScheduleVisualModel } from '@nerv-iip/ui'
import { computed } from 'vue'
import type { LaneOrder, ScheduleModel, TimeScale } from '../model/types'
const props = defineProps<{
  model: ScheduleModel
  view: 'order' | 'resource'
  scale?: TimeScale
  groupBy?: string
  laneOrder?: LaneOrder
}>()
const emit = defineEmits<{ taskSelect: [taskId: string]; conflictClick: [taskId: string] }>()
// Adapter only: the sole native renderer is owned by ui/P01. No domain projection.
const visual = computed<NvScheduleVisualModel>(() => {
  const dimension = props.groupBy ?? 'workCenter'
  const laneOf = (t: ScheduleModel['tasks'][number]) =>
    t.dimensions?.[dimension]?.id ?? t.resourceId ?? t.workCenterId ?? 'unassigned'
  const resources = new Map(
    props.model.groupValues?.[dimension]?.map((v) => [v.id, { id: v.id, label: v.label }]),
  )
  for (const r of props.model.resources)
    if (!resources.has(r.id)) resources.set(r.id, { id: r.id, label: r.text })
  const operations = props.model.tasks.filter((t) => t.type === 'operation' && !t.blockKind)
  for (const t of operations) {
    const id = laneOf(t)
    if (!resources.has(id)) resources.set(id, { id, label: t.dimensions?.[dimension]?.label ?? id })
  }
  return {
    horizon: { start: props.model.horizon.startUtc, end: props.model.horizon.endUtc },
    timezones: props.model.timezones,
    groups: props.model.tasks
      .filter((t) => t.type === 'order')
      .map((t) => ({ id: t.id, label: t.text })),
    resources: [...resources.values()],
    tasks: operations.map((t) => ({
      id: t.id,
      label: t.text,
      groupId: t.parentId,
      resourceId: laneOf(t),
      start: t.startUtc,
      end: t.endUtc,
      timezone: t.timezone,
      facts: t.facts,
      locked: t.locked,
      conflictLabel: t.hasConflict ? '冲突' : undefined,
      statusLabels: t.statusLabels,
      segments: t.segments?.map((s, i) => ({
        id: `${t.id}:${i}`,
        start: s.startUtc,
        end: s.endUtc,
      })),
    })),
    links: props.model.links,
    windows: props.model.freezeContext?.windows.map((w, i) => ({
      id: `freeze:${i}`,
      laneId: w.workCenterId,
      start: w.startUtc,
      end: w.endUtc,
      label: '保留窗口',
    })),
  }
})
</script>
<template>
  <NvScheduleTimeline
    :model="visual"
    :view="view === 'order' ? 'task' : 'resource'"
    :scale="scale === 'hour' ? 'eightHours' : scale === 'auto' || !scale ? 'auto' : 'day'"
    :lane-order="laneOrder"
    @task-select="emit('taskSelect', $event)"
    @conflict-click="emit('conflictClick', $event)"
  />
</template>

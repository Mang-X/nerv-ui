<script setup lang="ts">
import { NvScheduleTimeline, type NvScheduleVisualModel } from '@nerv-iip/ui'
import { computed } from 'vue'
import { resourceProjection } from '../model/resource-projection'
import { BLOCK_LABELS } from '../model/blocks'
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
  const projection = resourceProjection(props.model, dimension, props.laneOrder)
  const laneOf = (task: ScheduleModel['tasks'][number]) => projection.keyOf(task)
  const operations =
    props.view === 'resource'
      ? projection.lanes.flatMap((lane) => lane.operations)
      : props.model.tasks.filter((task) => task.type === 'operation' && !task.blockKind)
  return {
    horizon: { start: props.model.horizon.startUtc, end: props.model.horizon.endUtc },
    timezones: props.model.timezones,
    groups: props.model.tasks
      .filter((t) => t.type === 'order')
      .map((t) => ({ id: t.id, label: t.text })),
    resources: projection.lanes.map((lane) => ({ id: lane.key, label: lane.label })),
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
    windows:
      props.view === 'resource'
        ? projection.lanes.flatMap((lane) => [
            ...lane.blocks.map((block) => ({
              id: `block:${block.id}`,
              laneId: lane.key,
              start: block.startUtc,
              end: block.endUtc,
              label: BLOCK_LABELS[block.blockKind!],
            })),
            ...(dimension === 'workCenter'
              ? (props.model.freezeContext?.windows ?? [])
                  .filter((window) => window.workCenterId === lane.id)
                  .map((window, i) => ({
                    id: `freeze:${lane.key}:${i}`,
                    laneId: lane.key,
                    start: window.startUtc,
                    end: window.endUtc,
                    label: '保留窗口',
                  }))
              : []),
          ])
        : props.model.freezeContext?.windows.map((window, i) => ({
            id: `freeze:${i}`,
            laneId: window.workCenterId,
            start: window.startUtc,
            end: window.endUtc,
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

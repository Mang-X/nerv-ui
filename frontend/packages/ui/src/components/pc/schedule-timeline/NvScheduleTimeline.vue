<script setup lang="ts">
// Adapted from scheduling/ReadonlyScheduleTimeline.vue at 93f9689c; source remains frozen for P04.
import { computed } from 'vue'
import type { NvScheduleTask, NvScheduleVisualModel } from './types'
const props = withDefaults(
  defineProps<{
    model: NvScheduleVisualModel
    view?: 'task' | 'resource'
    scale?: 'auto' | 'eightHours' | 'day'
    laneOrder?: 'busiest' | 'name' | 'onlyScheduled' | 'catalog'
    laneLabel?: string
    emptyLabel?: string
  }>(),
  {
    view: 'task',
    scale: 'auto',
    laneOrder: 'busiest',
    laneLabel: '安排 / 任务',
    emptyLabel: '暂无时间安排',
  },
)
const emit = defineEmits<{ taskSelect: [taskId: string]; conflictClick: [taskId: string] }>()
const DAY = 86400000
const LABEL_WIDTH = 224
const TASK_ROW_HEIGHT = 280
function instant(value: string) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? Date.parse(value) : NaN
}
function validInterval(value: { start: string; end: string }) {
  return Number.isFinite(instant(value.start)) && instant(value.end) > instant(value.start)
}
function validZone(zone: string | null | undefined): zone is string {
  if (!zone) return false
  try {
    new Intl.DateTimeFormat('zh-CN', { timeZone: zone }).format(0)
    return true
  } catch {
    return false
  }
}
function timeLabel(value: string, zone?: string | null) {
  if (!validZone(zone)) return `时区未解析 · ${value}`
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: zone,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(instant(value))
}
const tasks = computed(() => props.model.tasks.filter(validInterval))
const unresolved = computed(
  () => !props.model.timezones?.length || props.model.timezones.some((zone) => !validZone(zone)),
)
const step = computed(() =>
  props.scale === 'eightHours' ||
  (props.scale === 'auto' &&
    instant(props.model.horizon.end) - instant(props.model.horizon.start) <= 2 * DAY)
    ? DAY / 3
    : DAY,
)
const range = computed(() => {
  const intervals = [
    ...tasks.value,
    ...(validInterval(props.model.horizon) ? [props.model.horizon] : []),
  ]
  if (!intervals.length) return undefined
  const start =
    Math.floor(Math.min(...intervals.map((t) => instant(t.start))) / step.value) * step.value
  const end = Math.max(
    start + step.value,
    Math.ceil(Math.max(...intervals.map((t) => instant(t.end))) / step.value) * step.value,
  )
  return { start, end, duration: end - start }
})
const ticks = computed(() => {
  if (!range.value) return []
  const result = []
  // Bound DOM work for huge host horizons while keeping the complete actual range.
  const stride = step.value * Math.max(1, Math.ceil(range.value.duration / step.value / 1000))
  for (let time = range.value.start; time < range.value.end; time += stride) {
    const zones = props.model.timezones?.filter(validZone) ?? []
    result.push({
      key: time,
      left: ((time - range.value.start) / range.value.duration) * 100,
      width: (Math.min(stride, range.value.end - time) / range.value.duration) * 100,
      label: (zones.length ? zones : ['UTC'])
        .map((zone) => `${zone} · ${timeLabel(new Date(time).toISOString(), zone)}`)
        .join(' / '),
    })
  }
  return result
})
const timelineWidth = computed(() =>
  Math.max(720, ticks.value.length * (step.value === DAY ? 144 : 168)),
)
function project(start: string, end: string) {
  const axis = range.value!
  return {
    left: ((instant(start) - axis.start) / axis.duration) * 100,
    width: ((instant(end) - instant(start)) / axis.duration) * 100,
  }
}
const lanes = computed(() => {
  const catalog = props.view === 'resource' ? props.model.resources : props.model.groups
  const labels = new Map((catalog ?? []).map((lane) => [lane.id, lane.label]))
  const groups = new Map<string, NvScheduleTask[]>((catalog ?? []).map((lane) => [lane.id, []]))
  for (const task of tasks.value) {
    const id = (props.view === 'resource' ? task.resourceId : task.groupId) ?? '__unassigned__'
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id)!.push(task)
  }
  let entries = [...groups.entries()]
  if (props.laneOrder === 'onlyScheduled') entries = entries.filter(([, values]) => values.length)
  const label = (id: string) => labels.get(id) ?? (id === '__unassigned__' ? '未分组' : id)
  if (props.laneOrder === 'busiest') entries.sort((a, b) => b[1].length - a[1].length)
  if (props.laneOrder === 'name')
    entries.sort((a, b) => label(a[0]).localeCompare(label(b[0]), 'zh-Hans-CN'))
  return entries.map(([id, values]) => {
    const ends: number[] = []
    const positioned = [...values]
      .sort((a, b) => instant(a.start) - instant(b.start))
      .map((task) => {
        let row = ends.findIndex((end) => end <= instant(task.start))
        if (row < 0) row = ends.length
        ends[row] = instant(task.end)
        return { task, row, ...project(task.start, task.end) }
      })
    const windows = (props.model.windows ?? [])
      .filter((w) => w.laneId === id && validInterval(w))
      .flatMap((w) => {
        if (!range.value) return []
        const start = Math.max(instant(w.start), range.value.start),
          end = Math.min(instant(w.end), range.value.end)
        return end > start
          ? [{ ...w, ...project(new Date(start).toISOString(), new Date(end).toISOString()) }]
          : []
      })
    return {
      id,
      label: label(id),
      tasks: positioned,
      height: Math.max(72, Math.max(1, ends.length) * TASK_ROW_HEIGHT + 12),
      windows,
    }
  })
})
const dependencies = computed(() => {
  const positions = new Map<string, { start: number; end: number; y: number }>()
  let height = 0
  for (const lane of lanes.value) {
    for (const p of lane.tasks)
      positions.set(p.task.id, {
        start: (p.left / 100) * timelineWidth.value,
        end: ((p.left + p.width) / 100) * timelineWidth.value,
        y: height + p.row * TASK_ROW_HEIGHT + TASK_ROW_HEIGHT / 2,
      })
    height += lane.height
  }
  return {
    height,
    links: props.model.links.flatMap((link) => {
      const source = positions.get(link.source),
        target = positions.get(link.target)
      if (!source || !target) return []
      const elbow = (source.end + target.start) / 2
      return [
        {
          ...link,
          path:
            source.y === target.y
              ? `M ${source.end} ${source.y} H ${source.end + 12} V ${source.y - 28} H ${target.start - 12} V ${target.y} H ${target.start}`
              : `M ${source.end} ${source.y} H ${elbow} V ${target.y} H ${target.start}`,
          arrow: `${target.start - 5},${target.y - 4} ${target.start},${target.y} ${target.start - 5},${target.y + 4}`,
        },
      ]
    }),
  }
})
function taskTime(task: NvScheduleTask) {
  return `${timeLabel(task.start, task.timezone)}–${timeLabel(task.end, task.timezone)}`
}
function taskDescription(task: NvScheduleTask) {
  return [
    task.label,
    taskTime(task),
    ...(task.facts ?? []).map((f) => `${f.label} ${f.value}`),
    task.conflictLabel,
    task.attentionLabel,
    task.locked ? '锁定' : '',
    ...(task.statusLabels ?? []),
  ]
    .filter(Boolean)
    .join('，')
}
function segments(task: NvScheduleTask) {
  return (task.segments ?? [])
    .filter(validInterval)
    .filter((s) => instant(s.start) >= instant(task.start) && instant(s.end) <= instant(task.end))
    .map((s) => ({
      ...s,
      left:
        ((instant(s.start) - instant(task.start)) / (instant(task.end) - instant(task.start))) *
        100,
      width:
        ((instant(s.end) - instant(s.start)) / (instant(task.end) - instant(task.start))) * 100,
    }))
}
function selectTask(task: NvScheduleTask) {
  emit('taskSelect', task.id)
  if (task.conflictLabel) emit('conflictClick', task.id)
}
</script>

<template>
  <div
    data-slot="nv-schedule-timeline"
    class="nv-schedule-timeline"
    tabindex="0"
    aria-label="只读时间安排"
  >
    <p v-if="unresolved" role="status">时区未解析；坐标和备用轴标签使用明确 UTC 实刻。</p>
    <p v-if="tasks.length !== model.tasks.length" role="status">
      部分任务缺少有效 UTC/offset 起止时刻，未绘制。
    </p>
    <p v-if="!tasks.length" role="status">{{ emptyLabel }}</p>
    <div v-if="range" :style="{ width: `${LABEL_WIDTH + timelineWidth}px` }">
      <div
        class="nv-schedule-timeline-grid nv-schedule-timeline-header"
        :style="{ gridTemplateColumns: `${LABEL_WIDTH}px ${timelineWidth}px` }"
      >
        <div class="nv-schedule-timeline-label nv-schedule-timeline-label--header">
          {{ laneLabel }}
        </div>
        <div class="nv-schedule-timeline-axis">
          <div
            v-for="tick in ticks"
            :key="tick.key"
            data-axis-tick
            class="nv-schedule-timeline-tick"
            :style="{ left: `${tick.left}%`, width: `${tick.width}%` }"
          >
            {{ tick.label }}
          </div>
        </div>
      </div>
      <div class="nv-schedule-timeline-body">
        <div
          v-for="lane in lanes"
          :key="lane.id"
          :data-lane-id="lane.id"
          class="nv-schedule-timeline-grid nv-schedule-timeline-lane"
          :style="{
            gridTemplateColumns: `${LABEL_WIDTH}px ${timelineWidth}px`,
            minHeight: `${lane.height}px`,
          }"
        >
          <div class="nv-schedule-timeline-label">
            <span class="nv-schedule-timeline-label__name">{{ lane.label }}</span
            ><span class="nv-schedule-timeline-label__count">{{ lane.tasks.length }} 项</span>
          </div>
          <div class="nv-schedule-timeline-track">
            <span
              v-for="window in lane.windows"
              :key="window.id"
              :data-window-id="window.id"
              class="nv-schedule-timeline-window"
              :title="window.label"
              :style="{ left: `${window.left}%`, width: `${window.width}%` }"
              >{{ window.label }}</span
            >
            <span
              v-for="tick in ticks"
              :key="tick.key"
              class="nv-schedule-timeline-gridline"
              :style="{ left: `${tick.left}%` }"
              aria-hidden="true"
            />
            <button
              v-for="p in lane.tasks"
              :key="p.task.id"
              type="button"
              :data-task-id="p.task.id"
              class="nv-schedule-timeline-task"
              :class="{
                'nv-schedule-timeline-task--conflict':
                  p.task.conflictLabel || p.task.attentionLabel,
                'nv-schedule-timeline-task--locked': p.task.locked,
              }"
              :style="{
                left: `${p.left}%`,
                top: `${p.row * TASK_ROW_HEIGHT + 8}px`,
                width: `${p.width}%`,
              }"
              :aria-label="taskDescription(p.task)"
              :title="taskDescription(p.task)"
              @click="selectTask(p.task)"
            >
              <span class="nv-schedule-timeline-task__title">{{ p.task.label }}</span>
              <span
                v-for="(fact, index) in p.task.facts"
                :key="index"
                class="nv-schedule-timeline-task__fact"
                ><span>{{ fact.label }}</span
                ><span>{{ fact.value }}</span></span
              >
              <span class="nv-schedule-timeline-task__meta">{{ taskTime(p.task) }}</span>
              <span v-if="p.task.conflictLabel" class="nv-schedule-timeline-task__status">{{
                p.task.conflictLabel
              }}</span>
              <span v-if="p.task.attentionLabel" class="nv-schedule-timeline-task__status">{{
                p.task.attentionLabel
              }}</span>
              <span v-if="p.task.locked" class="nv-schedule-timeline-task__status">锁定</span>
              <span
                v-for="(status, index) in p.task.statusLabels"
                :key="index"
                class="nv-schedule-timeline-task__status"
                >{{ status }}</span
              >
              <span
                v-if="p.task.segments?.length"
                class="nv-schedule-timeline-segments"
                aria-label="任务分段"
              >
                <span
                  v-for="segment in segments(p.task)"
                  :key="segment.id"
                  :data-segment-id="segment.id"
                  class="nv-schedule-timeline-segment"
                  :style="{ left: `${segment.left}%`, width: `${segment.width}%` }"
                  :title="segment.label"
                  >{{ segment.label }}</span
                >
              </span>
            </button>
          </div>
        </div>
        <svg
          v-if="dependencies.links.length"
          class="nv-schedule-timeline-dependencies"
          :style="{ left: `${LABEL_WIDTH}px` }"
          :width="timelineWidth"
          :height="dependencies.height"
          aria-label="任务依赖"
        >
          <g
            v-for="link in dependencies.links"
            :key="link.id"
            :data-dependency-id="link.id"
            :data-source="link.source"
            :data-target="link.target"
          >
            <path :d="link.path" />
            <polygon :points="link.arrow" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>
<style scoped>
@layer nv-components {
  .nv-schedule-timeline {
    max-width: 100%;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--card);
  }
  .nv-schedule-timeline-window {
    position: absolute;
    inset-block: 0;
    background: color-mix(in oklch, var(--nv-warning), transparent 85%);
    border-right: 1px dashed var(--nv-warning);
    color: var(--foreground);
    font-size: 0.7rem;
  }
  .nv-schedule-timeline-segments {
    position: absolute;
    left: -1px;
    right: -1px;
    bottom: 0.4rem;
    height: 1.25rem;
  }
  .nv-schedule-timeline-task--conflict .nv-schedule-timeline-segments {
    left: -2px;
    right: -2px;
  }
  .nv-schedule-timeline-segment {
    position: absolute;
    height: 100%;
    background: var(--nv-brand);
    color: var(--nv-brand-foreground);
    overflow: hidden;
    font-size: 0.65rem;
  }

  .nv-schedule-timeline-body {
    position: relative;
  }

  .nv-schedule-timeline-dependencies {
    position: absolute;
    top: 0;
    z-index: 3;
    pointer-events: none;
    color: var(--primary);
  }

  .nv-schedule-timeline-dependencies path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }

  .nv-schedule-timeline-dependencies polygon {
    fill: currentColor;
  }

  .nv-schedule-timeline-grid {
    display: grid;
  }

  .nv-schedule-timeline-header {
    position: sticky;
    top: 0;
    z-index: 20;
    min-height: 3rem;
    border-bottom: 1px solid var(--border);
    background: var(--card);
  }

  .nv-schedule-timeline-label {
    position: sticky;
    left: 0;
    z-index: 10;
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    border-right: 1px solid var(--border);
    background: var(--card);
    padding: 0.75rem 1rem;
  }

  .nv-schedule-timeline-label--header {
    z-index: 30;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .nv-schedule-timeline-label__name {
    overflow: hidden;
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nv-schedule-timeline-label__count {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  .nv-schedule-timeline-axis,
  .nv-schedule-timeline-track {
    position: relative;
    min-width: 0;
  }

  .nv-schedule-timeline-tick {
    position: absolute;
    inset-block: 0;
    display: flex;
    align-items: center;
    border-left: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 0.72rem;
    font-weight: 500;
    padding-inline: 0.6rem;
    white-space: nowrap;
  }

  .nv-schedule-timeline-lane {
    border-bottom: 1px solid color-mix(in oklch, var(--border), transparent 35%);
  }

  .nv-schedule-timeline-track {
    background: color-mix(in oklch, var(--muted), transparent 65%);
  }

  .nv-schedule-timeline-gridline {
    position: absolute;
    inset-block: 0;
    border-left: 1px dashed color-mix(in oklch, var(--border), transparent 25%);
  }

  .nv-schedule-timeline-task__fact {
    display: flex;
    gap: 0.35rem;
    overflow: hidden;
    white-space: nowrap;
    font-size: 0.7rem;
  }

  .nv-schedule-timeline-task {
    position: absolute;
    z-index: 2;
    display: flex;
    height: 16.5rem;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    overflow: hidden;
    border: 1px solid color-mix(in oklch, var(--primary), transparent 25%);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--primary), var(--card) 82%);
    color: var(--foreground);
    padding: 0.4rem 0.6rem;
    text-align: left;
    box-shadow: var(--shadow-xs);
  }

  .nv-schedule-timeline-task:hover,
  .nv-schedule-timeline-task:focus-visible {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring), transparent 55%);
  }

  .nv-schedule-timeline-task--conflict {
    border-width: 2px;
    border-color: var(--destructive);
    background: color-mix(in oklch, var(--destructive), var(--card) 88%);
  }

  .nv-schedule-timeline-task--locked {
    border-style: dashed;
  }

  .nv-schedule-timeline-task__title {
    overflow: hidden;
    font-size: 0.75rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nv-schedule-timeline-task__meta {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.45rem;
    overflow: hidden;
    color: var(--muted-foreground);
    font-size: 0.65rem;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .nv-schedule-timeline-task__status {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 0.15rem;
    color: var(--foreground);
    font-weight: 700;
  }

  .nv-schedule-timeline-task__status svg {
    width: 0.7rem;
    height: 0.7rem;
  }
}
</style>

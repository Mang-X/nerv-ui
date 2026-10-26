<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import GanttChart from '../GanttChart.vue'
import MaterialShortageSummary from '../snapshot/MaterialShortageSummary.vue'
import PlanConflicts from '../snapshot/PlanConflicts.vue'
import PlanRisks from '../snapshot/PlanRisks.vue'
import SnapshotContext from '../snapshot/SnapshotContext.vue'
import { numberText, percentageText } from '../snapshot/snapshot'
import { uniqueItems, type ScheduleSnapshot, type ScheduleSnapshotMetric } from './comparison'

const props = defineProps<{
  snapshot?: ScheduleSnapshot
  title?: string
  notice?: string
  readOnly?: boolean
}>()
const emit = defineEmits<{ select: [semanticKey: string] }>()
const chart = useTemplateRef<InstanceType<typeof GanttChart>>('chart')
watch(
  () => chart.value?.engineName,
  (name, _, onCleanup) => {
    if (name !== 'dhtmlx') return
    const frame = requestAnimationFrame(() => chart.value?.command({ kind: 'fitToScreen' }))
    onCleanup(() => cancelAnimationFrame(frame))
  },
  { flush: 'post' },
)
const available = computed(
  () => !props.snapshot?.source.state || props.snapshot.source.state === 'available',
)
const validated = computed(() => {
  if (!props.snapshot) return { taskKeys: new Map<string, string>(), error: '' }
  try {
    const items = uniqueItems(props.snapshot)
    return {
      taskKeys: new Map(
        [...items.values()].flatMap((item) =>
          item.task ? [[item.task.id, item.semanticKey] as const] : [],
        ),
      ),
      error: '',
    }
  } catch (error) {
    return {
      taskKeys: new Map<string, string>(),
      error: error instanceof Error ? error.message : '无法安全读取候选安排',
    }
  }
})
function metricText(metric: ScheduleSnapshotMetric) {
  const text = metric.format === 'percent' ? percentageText(metric.value) : numberText(metric.value)
  return text === '—' ? text : `${text}${metric.unit ? ` ${metric.unit}` : ''}`
}
function select(taskId: string) {
  const key = validated.value.taskKeys.get(taskId)
  if (key && !props.readOnly) emit('select', key)
}
</script>

<template>
  <section class="grid min-w-0 gap-4" aria-label="候选结果" data-scheduling-preview>
    <header class="grid gap-1">
      <h2 class="text-xl font-semibold">{{ title ?? '候选安排' }}</h2>
      <p>{{ notice ?? '候选结果由来源提供；尚未保存或发布。' }}</p>
    </header>
    <SnapshotContext title="候选来源" :source="snapshot?.source" :provided="!!snapshot">
      <p>{{ snapshot?.label }}</p>
    </SnapshotContext>
    <p v-if="snapshot && available && validated.error" role="alert">{{ validated.error }}</p>
    <template v-if="snapshot && available && !validated.error">
      <section aria-label="候选指标" class="grid gap-2">
        <h3 class="font-semibold">候选指标</h3>
        <p v-if="snapshot.metrics === undefined">指标未提供</p>
        <p v-else-if="!snapshot.metrics.length">此来源无指标记录</p>
        <dl v-else class="grid gap-2 sm:grid-cols-3">
          <div
            v-for="metric in snapshot.metrics"
            :key="metric.id"
            class="rounded-md border border-border p-3"
          >
            <dt class="text-sm text-muted-foreground">{{ metric.label }}</dt>
            <dd class="tabular-nums">{{ metricText(metric) }}</dd>
          </div>
        </dl>
      </section>
      <section aria-label="候选时间图" class="min-w-0 overflow-x-auto">
        <h3 class="font-semibold">候选时间图</h3>
        <div v-if="snapshot.model" style="height: 360px; min-width: 80rem">
          <GanttChart ref="chart" :model="snapshot.model" read-only @task-select="select" />
        </div>
        <p v-else>图面未提供</p>
      </section>
      <PlanConflicts :display="snapshot.conflicts" :source="snapshot.source" read-only />
      <MaterialShortageSummary :display="snapshot.shortages" :source="snapshot.source" />
      <PlanRisks :display="snapshot.risks" :source="snapshot.source" read-only />
    </template>
  </section>
</template>

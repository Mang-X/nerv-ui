<script setup lang="ts">
import { computed } from 'vue'
import GanttChart from '../GanttChart.vue'
import MaterialShortageSummary from '../snapshot/MaterialShortageSummary.vue'
import PlanConflicts from '../snapshot/PlanConflicts.vue'
import PlanRisks from '../snapshot/PlanRisks.vue'
import SnapshotContext from '../snapshot/SnapshotContext.vue'
import { numberText, percentageText } from '../snapshot/snapshot'
import type { ScheduleSnapshot, ScheduleSnapshotMetric } from './comparison'

const props = defineProps<{
  snapshot?: ScheduleSnapshot
  title?: string
  notice?: string
  readOnly?: boolean
}>()
const emit = defineEmits<{ select: [semanticKey: string] }>()
const available = computed(
  () => !props.snapshot?.source.state || props.snapshot.source.state === 'available',
)
const taskKeys = computed(
  () =>
    new Map(
      props.snapshot?.items.flatMap((item) =>
        item.task ? [[item.task.id, item.semanticKey] as const] : [],
      ) ?? [],
    ),
)
function metricText(metric: ScheduleSnapshotMetric) {
  const text = metric.format === 'percent' ? percentageText(metric.value) : numberText(metric.value)
  return text === '—' ? text : `${text}${metric.unit ? ` ${metric.unit}` : ''}`
}
function select(taskId: string) {
  const key = taskKeys.value.get(taskId)
  if (key && !props.readOnly) emit('select', key)
}
</script>

<template>
  <section class="grid min-w-0 gap-4" aria-label="候选结果" data-scheduling-preview>
    <header class="grid gap-1">
      <h2 class="text-xl font-semibold">{{ title ?? '候选安排' }}</h2>
      <p>{{ notice ?? '候选结果由来源提供；此读面不代表已保存或发布。' }}</p>
    </header>
    <SnapshotContext title="候选来源" :source="snapshot?.source" :provided="!!snapshot">
      <p>{{ snapshot?.label }}</p>
    </SnapshotContext>
    <template v-if="snapshot && available">
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
        <div v-if="snapshot.model" class="h-80 min-w-0">
          <GanttChart :model="snapshot.model" read-only @task-select="select" />
        </div>
        <p v-else>图面未提供</p>
      </section>
      <PlanConflicts :display="snapshot.conflicts" :source="snapshot.source" read-only />
      <MaterialShortageSummary :display="snapshot.shortages" :source="snapshot.source" />
      <PlanRisks :display="snapshot.risks" :source="snapshot.source" read-only />
    </template>
  </section>
</template>

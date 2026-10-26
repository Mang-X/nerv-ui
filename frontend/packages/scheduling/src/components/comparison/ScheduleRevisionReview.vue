<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { NvStatusBadge } from '@nerv-iip/ui'
import ChangeSummaryPanel from '../panels/ChangeSummaryPanel.vue'
import SnapshotContext from '../snapshot/SnapshotContext.vue'
import { numberText, percentageText } from '../snapshot/snapshot'
import { scheduleTime } from '../../model/factory-time'
import type { ScheduleChange, ScheduleTask } from '../../model/types'
import {
  compareScheduleSnapshots,
  type ScheduleComparisonRow,
  type ScheduleSnapshot,
  type ScheduleSnapshotMetric,
} from './comparison'

const props = defineProps<{
  baseline?: ScheduleSnapshot
  candidate?: ScheduleSnapshot
  readOnly?: boolean
}>()
const emit = defineEmits<{ select: [semanticKey: string] }>()
const expandedKey = shallowRef('')
const comparison = computed(() => {
  if (!props.baseline || !props.candidate) return { rows: [] as ScheduleComparisonRow[], error: '' }
  try {
    return { rows: compareScheduleSnapshots(props.baseline, props.candidate), error: '' }
  } catch (error) {
    return {
      rows: [] as ScheduleComparisonRow[],
      error: error instanceof Error ? error.message : '无法安全比较',
    }
  }
})
const available = computed(
  () =>
    props.baseline?.source.state !== 'unknown' &&
    props.baseline?.source.state !== 'missing' &&
    props.baseline?.source.state !== 'forbidden' &&
    props.baseline?.source.state !== 'unavailable' &&
    props.candidate?.source.state !== 'unknown' &&
    props.candidate?.source.state !== 'missing' &&
    props.candidate?.source.state !== 'forbidden' &&
    props.candidate?.source.state !== 'unavailable',
)
const typeLabels = {
  preserved: '保持不变',
  changed: '已调整',
  added: '新增',
  blocked: '候选待安排',
  missing: '候选未提供',
} as const
const rowTones = {
  preserved: 'neutral',
  changed: 'info',
  added: 'success',
  blocked: 'danger',
  missing: 'neutral',
} as const
const changes = computed<ScheduleChange[]>(() =>
  comparison.value.rows.map((row) => ({
    orderId: row.semanticKey,
    operationId: row.semanticKey,
    groupLabel: row.after?.groupLabel ?? row.before?.groupLabel ?? '',
    label: row.after?.label ?? row.before?.label,
    typeLabel: typeLabels[row.kind],
    beforeAbsentLabel: row.before?.task ? undefined : '未提供安排',
    afterAbsentLabel: row.after?.task
      ? undefined
      : row.kind === 'blocked'
        ? '待安排'
        : '候选未提供',
    changeType:
      row.kind === 'missing'
        ? 'missing'
        : row.kind === 'changed'
          ? 'moved'
          : row.kind === 'added'
            ? 'added'
            : row.kind === 'preserved'
              ? 'preserved'
              : 'blocked',
    message: row.after?.message ?? row.before?.message ?? '来源未提供调整原因',
    taskId: row.after?.task?.id,
    beforeTaskId: row.before?.task?.id ?? null,
    afterTaskId: row.after?.task?.id ?? null,
    selectDisabledReason: props.readOnly
      ? '当前为只读'
      : row.after?.task
        ? undefined
        : '候选无可查看的安排',
  })),
)
// P08's legacy display reads ScheduleTask; supply an explicit unresolved zone to avoid browser fallback.
const baseTasks = computed(
  () =>
    props.baseline?.items.flatMap((item) =>
      item.task ? [{ ...item.task, timezone: item.task.timezone ?? '' }] : [],
    ) ?? [],
)
const candidateTasks = computed(
  () =>
    props.candidate?.items.flatMap((item) =>
      item.task ? [{ ...item.task, timezone: item.task.timezone ?? '' }] : [],
    ) ?? [],
)
const byCandidateId = computed(
  () =>
    new Map(
      comparison.value.rows
        .filter((row) => row.after?.task)
        .map((row) => [row.after!.task!.id, row.semanticKey]),
    ),
)
const selected = computed(() =>
  comparison.value.rows.find((row) => row.semanticKey === expandedKey.value),
)
const metrics = computed(() => {
  const before = new Map(props.baseline?.metrics?.map((item) => [item.id, item]) ?? [])
  const after = new Map(props.candidate?.metrics?.map((item) => [item.id, item]) ?? [])
  return [...new Set([...before.keys(), ...after.keys()])].map((id) => ({
    id,
    label: after.get(id)?.label ?? before.get(id)?.label ?? id,
    before: before.get(id),
    after: after.get(id),
  }))
})
function metricText(metric?: ScheduleSnapshotMetric) {
  if (!metric) return '—'
  const text = metric.format === 'percent' ? percentageText(metric.value) : numberText(metric.value)
  return text === '—' ? text : `${text}${metric.unit ? ` ${metric.unit}` : ''}`
}
function time(value: string, task: ScheduleTask) {
  return scheduleTime(value, task.timezone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function choose(assignmentId: string) {
  const key = byCandidateId.value.get(assignmentId)
  if (key && !props.readOnly) {
    expandedKey.value = key
    emit('select', key)
  }
}
</script>

<template>
  <section class="grid min-w-0 gap-4" aria-label="基线与候选比较" data-schedule-comparison>
    <header class="grid gap-1">
      <h2 class="text-xl font-semibold">基线与候选比较</h2>
      <p class="text-sm text-muted-foreground">
        仅比较活动安排的资源、时间与分段；指标与风险由来源提供。
      </p>
    </header>
    <div class="grid gap-3 sm:grid-cols-2">
      <SnapshotContext title="已保存基线" :source="baseline?.source" :provided="!!baseline">
        <p>{{ baseline?.label }}</p>
      </SnapshotContext>
      <SnapshotContext title="候选安排" :source="candidate?.source" :provided="!!candidate">
        <p>{{ candidate?.label }}</p>
      </SnapshotContext>
    </div>
    <p v-if="!baseline || !candidate" role="status">基线或候选未提供，无法比较。</p>
    <p v-else-if="!available" role="status">来源暂不可比较，请核对两侧读取状态。</p>
    <p v-else-if="comparison.error" role="alert">{{ comparison.error }}</p>
    <template v-else>
      <section aria-label="来源指标" class="grid gap-2">
        <h3 class="font-semibold">来源指标</h3>
        <p v-if="!metrics.length">
          {{
            baseline?.metrics === undefined || candidate?.metrics === undefined
              ? '指标未提供'
              : '此来源无指标记录'
          }}
        </p>
        <dl v-else class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="metric in metrics"
            :key="metric.id"
            class="rounded-md border border-border p-3"
          >
            <dt class="text-sm text-muted-foreground">{{ metric.label }}</dt>
            <dd class="tabular-nums">
              {{ metricText(metric.before) }} → {{ metricText(metric.after) }}
            </dd>
          </div>
        </dl>
      </section>
      <ChangeSummaryPanel
        :changes="changes"
        :base-tasks="baseTasks"
        :tasks="candidateTasks"
        :labels="{
          title: '逐活动变更',
          filter: '筛选活动',
          emptyDescription: '两侧均无活动记录，不代表方案已就绪。',
        }"
        @select="choose"
      />
      <section aria-label="逐活动对照" class="grid gap-2">
        <h3 class="font-semibold">逐活动对照</h3>
        <p v-if="!comparison.rows.length">两侧均无活动记录，不代表方案已就绪。</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[42rem] text-left text-sm">
            <thead class="bg-muted">
              <tr>
                <th class="p-2">活动</th>
                <th class="p-2">状态</th>
                <th class="p-2">已保存基线</th>
                <th class="p-2">候选安排</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in comparison.rows"
                :key="row.semanticKey"
                :data-semantic-key="row.semanticKey"
                class="border-t border-border align-top"
              >
                <th class="p-2 font-medium">{{ row.after?.label ?? row.before?.label }}</th>
                <td class="p-2">
                  <NvStatusBadge :label="typeLabels[row.kind]" :tone="rowTones[row.kind]" />
                </td>
                <td class="p-2">
                  <template v-if="row.before?.task">
                    <p>
                      {{
                        row.before.task.display?.resourceLabel ??
                        row.before.task.resourceId ??
                        '资源未提供'
                      }}
                    </p>
                    <p>
                      <time :datetime="row.before.task.startUtc">{{
                        time(row.before.task.startUtc, row.before.task)
                      }}</time>
                      ～
                      <time :datetime="row.before.task.endUtc">{{
                        time(row.before.task.endUtc, row.before.task)
                      }}</time>
                    </p>
                    <details v-if="row.before.task.segments?.length">
                      <summary>基线分段 · {{ row.before.task.segments.length }}</summary>
                      <ol class="grid gap-1">
                        <li v-for="(segment, index) in row.before.task.segments" :key="index">
                          <time :datetime="segment.startUtc">{{
                            time(segment.startUtc, row.before.task)
                          }}</time>
                          ～
                          <time :datetime="segment.endUtc">{{
                            time(segment.endUtc, row.before.task)
                          }}</time>
                        </li>
                      </ol>
                    </details>
                  </template>
                  <p v-else>未提供安排</p>
                </td>
                <td class="p-2">
                  <template v-if="row.after?.task">
                    <p>
                      {{
                        row.after.task.display?.resourceLabel ??
                        row.after.task.resourceId ??
                        '资源未提供'
                      }}
                    </p>
                    <p>
                      <time :datetime="row.after.task.startUtc">{{
                        time(row.after.task.startUtc, row.after.task)
                      }}</time>
                      ～
                      <time :datetime="row.after.task.endUtc">{{
                        time(row.after.task.endUtc, row.after.task)
                      }}</time>
                    </p>
                    <details v-if="row.after.task.segments?.length">
                      <summary>候选分段 · {{ row.after.task.segments.length }}</summary>
                      <ol class="grid gap-1">
                        <li v-for="(segment, index) in row.after.task.segments" :key="index">
                          <time :datetime="segment.startUtc">{{
                            time(segment.startUtc, row.after.task)
                          }}</time>
                          ～
                          <time :datetime="segment.endUtc">{{
                            time(segment.endUtc, row.after.task)
                          }}</time>
                        </li>
                      </ol>
                    </details>
                  </template>
                  <p v-else>
                    {{
                      row.kind === 'blocked'
                        ? '待安排；完工时间未提供'
                        : '候选未提供；完工时间未提供'
                    }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <aside
          v-if="selected"
          data-comparison-selection
          class="rounded-md border border-border p-3"
        >
          <h4 class="font-medium">{{ selected.after?.label ?? selected.before?.label }}</h4>
          <p>{{ selected.after?.message ?? selected.before?.message ?? '调整原因未提供' }}</p>
        </aside>
      </section>
    </template>
  </section>
</template>

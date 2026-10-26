<script setup lang="ts">
import { computed } from 'vue'
import { NvButton, NvStatusBadge } from '@nerv-iip/ui'
import SnapshotContext from './SnapshotContext.vue'
import {
  groupRows,
  legacyActivityLabel,
  severity,
  severityLabels,
  severityTones,
  type LegacySnapshotConflict,
  type SnapshotConflict,
  type SnapshotConflictsDisplay,
  type SnapshotSource,
} from './snapshot'
const props = withDefaults(
  defineProps<{
    conflicts?: readonly LegacySnapshotConflict[]
    unscheduledOperations?: readonly LegacySnapshotConflict[]
    generatedAtUtc?: string
    display?: SnapshotConflictsDisplay
    source?: SnapshotSource
    readOnly?: boolean
  }>(),
  { readOnly: true },
)
// Legacy snapshot wording is intentionally conservative. The shared model labels
// describe a different consumer and must not strengthen a snapshot's claim.
const legacyReasonLabels: Record<string, string> = {
  dueDate: '交期风险',
  capacity: '产能不足',
  calendar: '日历不可用',
  material: '物料约束',
  quality: '质量约束',
  equipment: '设备约束',
  tooling: '工装约束',
  noEligibleResource: '无可用资源',
  outsideHorizon: '超出排程窗口',
  invalidLockedAssignment: '锁定分配无效',
  predecessorUnscheduled: '前序未排',
}
const unknownReasonNumbers = computed(() => {
  const codes = [...(props.conflicts ?? []), ...(props.unscheduledOperations ?? [])]
    .map((row) => row.reasonCode)
    .filter((code): code is string => !!code && !Object.hasOwn(legacyReasonLabels, code))
  return new Map([...new Set(codes)].sort().map((code, index) => [code, index + 1]))
})
function legacyReason(code?: string | null) {
  if (!code) return '原因未提供'
  if (Object.hasOwn(legacyReasonLabels, code)) return legacyReasonLabels[code]!
  return `未识别原因（第 ${unknownReasonNumbers.value.get(code)} 类）`
}
const emit = defineEmits<{ select: [activityId: string] }>()
const source = computed(
  () =>
    props.source ??
    (props.generatedAtUtc
      ? { kind: 'snapshot' as const, label: '方案生成记录', capturedAt: props.generatedAtUtc }
      : undefined),
)
const rows = computed<readonly SnapshotConflict[]>(
  () =>
    props.display?.conflicts ??
    (props.conflicts ?? []).map((row) => ({
      id:
        row.conflictId ??
        JSON.stringify([
          row.orderId,
          row.operationId,
          row.resourceId,
          row.reasonCode,
          row.severity,
        ]),
      label: legacyActivityLabel(row.orderId, row.operationId, row.resourceId),
      message: row.message ?? '说明未提供',
      severity: severity(row.severity),
      reason: { id: row.reasonCode ?? '', label: legacyReason(row.reasonCode) },
    })),
)
const pending = computed(
  () =>
    props.display?.unscheduled ??
    (props.unscheduledOperations ?? []).map((row) => ({
      id:
        row.conflictId ??
        JSON.stringify([row.orderId, row.operationId, row.resourceId, row.reasonCode]),
      label: legacyActivityLabel(row.orderId, row.operationId, row.resourceId),
      message: row.message ?? '说明未提供',
      reasonLabel: legacyReason(row.reasonCode),
    })),
)
const blocking = computed(() => rows.value.filter((row) => severity(row.severity) === 'error'))
const notices = computed(() =>
  groupRows(
    rows.value.filter((row) => severity(row.severity) !== 'error'),
    (row) => JSON.stringify([severity(row.severity), row.reason.id]),
  ).map(([id, entries]) => ({
    id,
    label: `${severityLabels[severity(entries[0]!.severity)]} · ${entries[0]!.reason.label}`,
    entries,
  })),
)
function select(id: string) {
  const row = rows.value.find((item) => item.id === id)
  if (
    !props.readOnly &&
    (!props.source?.state || props.source.state === 'available') &&
    row?.activity &&
    row.actionLabel &&
    !row.disabledReason
  )
    emit('select', row.activity.id)
}
</script>

<template>
  <SnapshotContext
    title="冲突与未安排记录"
    :source="source"
    :provided="
      display !== undefined || (conflicts !== undefined && unscheduledOperations !== undefined)
    "
  >
    <p v-if="!rows.length && !pending.length" role="status">
      此来源{{
        source?.kind === 'snapshot' ? '快照' : '记录'
      }}未记录冲突或未安排原因；不代表当前准备就绪。
    </p>
    <article
      v-for="row in blocking"
      :key="row.id"
      class="grid gap-2 rounded-md border border-border p-3"
      :data-conflict-id="row.id"
      data-conflict-severity="error"
    >
      <div class="flex flex-wrap items-center gap-2">
        <NvStatusBadge tone="danger" label="阻断" />
        <h4 class="font-medium">{{ row.label }} · {{ row.reason.label }}</h4>
      </div>
      <p>{{ row.message }}</p>
      <p v-if="row.activity">
        {{ row.activity.label }} · {{ row.activity.location ?? '位置未提供' }} ·
        {{ row.activity.time ?? '时间未提供' }}
      </p>
      <p v-if="row.activity?.result">{{ row.activity.result }}</p>
      <NvButton
        v-if="!readOnly && row.activity && row.actionLabel"
        size="sm"
        variant="outline"
        :disabled="!!row.disabledReason"
        :title="row.disabledReason"
        @click="select(row.id)"
        >{{ row.actionLabel }}</NvButton
      >
      <p v-if="row.disabledReason" class="text-muted-foreground">{{ row.disabledReason }}</p>
    </article>
    <article
      v-for="item in pending"
      :key="item.id"
      class="grid gap-2 rounded-md border border-border p-3"
      :data-pending-id="item.id"
    >
      <div class="flex flex-wrap items-center gap-2">
        <NvStatusBadge tone="neutral" label="未安排" />
        <h4 class="font-medium">{{ item.label }}</h4>
      </div>
      <p>{{ item.reasonLabel }} · {{ item.message }}</p>
    </article>
    <details
      v-for="group in notices"
      :key="group.id"
      class="rounded-md border border-border p-3"
      data-notice-group
    >
      <summary class="cursor-pointer font-medium">
        {{ group.label }} · {{ group.entries.length }} 条（展开明细）
      </summary>
      <ul class="mt-3 grid gap-2">
        <li
          v-for="row in group.entries"
          :key="row.id"
          class="grid gap-2 rounded-md border border-border p-3"
          :data-conflict-id="row.id"
          :data-conflict-severity="severity(row.severity)"
        >
          <div class="flex flex-wrap items-center gap-2">
            <NvStatusBadge
              :tone="severityTones[severity(row.severity)]"
              :label="severityLabels[severity(row.severity)]"
            />
            <h4 class="font-medium">{{ row.label }}</h4>
          </div>
          <p>{{ row.message }}</p>
          <p v-if="row.activity">
            {{ row.activity.label }} · {{ row.activity.location ?? '位置未提供' }} ·
            {{ row.activity.time ?? '时间未提供' }}
          </p>
          <p v-if="row.activity?.result">{{ row.activity.result }}</p>
          <NvButton
            v-if="!readOnly && row.activity && row.actionLabel"
            size="sm"
            variant="outline"
            :disabled="!!row.disabledReason"
            :title="row.disabledReason"
            @click="select(row.id)"
            >{{ row.actionLabel }}</NvButton
          >
          <p v-if="row.disabledReason" class="text-muted-foreground">{{ row.disabledReason }}</p>
        </li>
      </ul>
    </details>
  </SnapshotContext>
</template>

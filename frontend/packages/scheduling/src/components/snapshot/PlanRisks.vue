<script setup lang="ts">
import { computed } from 'vue'
import { NvButton, NvStatusBadge } from '@nerv-iip/ui'
import SnapshotContext from './SnapshotContext.vue'
import {
  groupRows,
  legacyActivityLabel,
  legacyShortage,
  numberText,
  severity,
  severityLabels,
  severityTones,
  type LegacySnapshotRisk,
  type SnapshotRisk,
  type SnapshotSource,
} from './snapshot'
const props = withDefaults(
  defineProps<{
    materialRisks?: readonly LegacySnapshotRisk[]
    equipmentRisks?: readonly LegacySnapshotRisk[]
    display?: readonly SnapshotRisk[]
    source?: SnapshotSource
    readOnly?: boolean
  }>(),
  { readOnly: true },
)
const emit = defineEmits<{ select: [activityId: string] }>()
const rows = computed<readonly SnapshotRisk[]>(
  () =>
    props.display ?? [
      ...(props.materialRisks ?? []).map((row) => legacyRisk(row, 'material', '物料风险')),
      ...(props.equipmentRisks ?? []).map((row) => legacyRisk(row, 'equipment', '资源风险')),
    ],
)
function legacyRisk(row: LegacySnapshotRisk, kind: string, label: string): SnapshotRisk {
  return {
    id: row.id ?? JSON.stringify([kind, row.orderId, row.operationId, row.resourceId]),
    category: { id: kind, label },
    group: {
      id: JSON.stringify(kind === 'material' ? [row.orderId] : [row.resourceId]),
      label: (kind === 'material' ? row.orderId : row.resourceId) ?? '分组名称未提供',
    },
    label: legacyActivityLabel(
      row.orderId,
      row.operationId,
      kind === 'equipment' ? row.resourceId : undefined,
    ),
    message: row.message ?? '风险说明未提供',
    shortages: row.shortages?.map(legacyShortage),
  }
}
const categories = computed(() =>
  groupRows(rows.value, (row) => row.category.id).map(([id, risks]) => ({
    id,
    label: risks[0]!.category.label,
    count: risks.length,
    groups: groupRows(risks, (row) => row.group.id).map(([groupId, entries]) => ({
      id: groupId,
      label: entries[0]!.group.label,
      entries,
    })),
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
    title="风险记录"
    :source="source"
    :provided="
      display !== undefined || (materialRisks !== undefined && equipmentRisks !== undefined)
    "
  >
    <p v-if="!rows.length" role="status">此来源未记录风险；不代表当前没有风险。</p>
    <details
      v-for="category in categories"
      :key="category.id"
      class="rounded-md border border-border p-3"
      :data-risk-category="category.id"
    >
      <summary class="cursor-pointer font-medium">
        {{ category.label }} · {{ category.count }} 项 · {{ category.groups.length }} 组（展开明细）
      </summary>
      <details
        v-for="group in category.groups"
        :key="group.id"
        class="mt-3"
        :data-risk-group="group.id"
      >
        <summary
          :class="
            display === undefined && group.label !== '分组名称未提供'
              ? 'cursor-pointer font-mono text-xs text-muted-foreground'
              : 'cursor-pointer font-medium'
          "
        >
          {{ group.label }} · {{ group.entries.length }} 项
        </summary>
        <article
          v-for="risk in group.entries"
          :key="risk.id"
          class="mt-2 grid gap-2 rounded-md border border-border p-3"
          :data-risk-id="risk.id"
        >
          <div class="flex flex-wrap items-center gap-2">
            <NvStatusBadge
              :tone="severityTones[severity(risk.severity)]"
              :label="severityLabels[severity(risk.severity)]"
            />
            <h4
              :class="
                display === undefined && risk.label !== '活动名称未提供'
                  ? 'font-mono text-xs text-muted-foreground'
                  : 'font-medium'
              "
            >
              {{ risk.label }}
            </h4>
          </div>
          <p>{{ risk.message }}</p>
          <p v-if="risk.activity">
            {{ risk.activity.label }} · {{ risk.activity.location ?? '位置未提供' }} ·
            {{ risk.activity.time ?? '时间未提供' }}
          </p>
          <p v-if="risk.activity?.result">{{ risk.activity.result }}</p>
          <p v-if="risk.shortages == null" class="text-muted-foreground">缺口明细未提供</p>
          <p v-else-if="!risk.shortages.length" class="text-muted-foreground">未记录缺口明细</p>
          <ul v-else class="grid gap-2">
            <li v-for="shortage in risk.shortages" :key="shortage.id" data-risk-shortage>
              <span
                :class="
                  display === undefined && shortage.label !== '物料名称未提供'
                    ? 'font-mono text-xs text-muted-foreground'
                    : undefined
                "
                >{{ shortage.label }}</span
              >
              ·
              <span
                :class="
                  display === undefined && shortage.batch
                    ? 'font-mono text-xs text-muted-foreground'
                    : 'text-muted-foreground'
                "
                >批次 {{ shortage.batch ?? '—' }}</span
              >
              · 缺
              {{ numberText(shortage.quantity) }} {{ shortage.unit ?? '—' }}（需
              {{ numberText(shortage.requiredQuantity) }}，可用
              {{ numberText(shortage.availableQuantity) }}）
            </li>
          </ul>
          <NvButton
            v-if="!readOnly && risk.activity && risk.actionLabel"
            size="sm"
            variant="outline"
            :disabled="!!risk.disabledReason"
            :title="risk.disabledReason"
            @click="select(risk.id)"
            >{{ risk.actionLabel }}</NvButton
          >
          <p v-if="risk.disabledReason" class="text-muted-foreground">{{ risk.disabledReason }}</p>
        </article>
      </details>
    </details>
  </SnapshotContext>
</template>

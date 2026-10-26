<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { NvButton, NvStatusBadge } from '@nerv-iip/ui'
import SnapshotContext from './SnapshotContext.vue'
import {
  groupRows,
  legacyUtcMinuteText,
  numberText,
  percentageText,
  type LegacySnapshotLoad,
  type SnapshotLoad,
  type SnapshotSource,
} from './snapshot'
const props = defineProps<{
  loads?: readonly LegacySnapshotLoad[]
  display?: readonly SnapshotLoad[]
  source?: SnapshotSource
}>()
type Filter = 'all' | 'active' | 'idle' | 'unknown'
const filter = shallowRef<Filter>('all')
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部窗口' },
  { value: 'active', label: '有安排' },
  { value: 'idle', label: '零负荷' },
  { value: 'unknown', label: '负荷未知' },
]
const rows = computed<readonly SnapshotLoad[]>(
  () =>
    props.display ??
    (props.loads ?? []).map((load) => ({
      id: JSON.stringify([load.resourceId, load.windowStartUtc, load.windowEndUtc]),
      resource: { id: load.resourceId ?? '', label: load.resourceId ?? '资源名称未提供' },
      start: legacyUtcMinuteText(load.windowStartUtc),
      end: legacyUtcMinuteText(load.windowEndUtc),
      assignedMinutes: load.assignedMinutes,
      availableMinutes: load.availableMinutes,
      utilization: load.utilization,
    })),
)
function loadKind(row: SnapshotLoad): Exclude<Filter, 'all'> {
  if (typeof row.assignedMinutes !== 'number' || !Number.isFinite(row.assignedMinutes))
    return 'unknown'
  return row.assignedMinutes === 0 ? 'idle' : 'active'
}
const resources = computed(() =>
  groupRows(
    rows.value.filter((row) => filter.value === 'all' || loadKind(row) === filter.value),
    (row) => row.resource.id,
  ).map(([id, loads]) => ({
    id,
    label: loads[0]!.resource.label,
    active: loads.filter((row) => loadKind(row) === 'active'),
    idle: loads.filter((row) => loadKind(row) === 'idle'),
    unknown: loads.filter((row) => loadKind(row) === 'unknown'),
  })),
)
function loadText(row: SnapshotLoad) {
  return `已排 ${numberText(row.assignedMinutes)} / 可用 ${numberText(row.availableMinutes)} 分钟 · 利用率 ${percentageText(row.utilization)}`
}
</script>

<template>
  <SnapshotContext
    title="资源负荷"
    :source="source"
    :provided="display !== undefined || loads !== undefined"
  >
    <p class="text-muted-foreground">
      零负荷仅表示该窗口没有安排，不表示资源可用；未知负荷不计作零。
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="负荷窗口筛选">
      <NvButton
        v-for="item in filters"
        :key="item.value"
        size="sm"
        variant="outline"
        :aria-pressed="filter === item.value"
        :data-load-filter="item.value"
        @click="filter = item.value"
        >{{ item.label }}</NvButton
      >
    </div>
    <p v-if="!rows.length" role="status">此来源未记录资源负荷。</p>
    <p v-else-if="!resources.length" role="status">没有符合筛选的窗口。</p>
    <article
      v-for="resource in resources"
      :key="resource.id"
      class="rounded-md border border-border p-3"
      :data-load-resource="resource.id"
    >
      <h4
        :class="
          display === undefined && resource.label !== '资源名称未提供'
            ? 'font-mono text-xs text-muted-foreground break-words'
            : 'font-medium break-words'
        "
      >
        {{ resource.label }}
      </h4>
      <div
        v-for="load in resource.active"
        :key="load.id"
        class="mt-2 border-t border-border pt-2"
        :data-load-id="load.id"
      >
        <NvStatusBadge tone="info" label="有安排" />
        <p class="tabular-nums">{{ load.start }} 至 {{ load.end }}</p>
        <p>{{ loadText(load) }}</p>
      </div>
      <div
        v-for="load in resource.unknown"
        :key="load.id"
        class="mt-2 border-t border-border pt-2"
        :data-load-id="load.id"
      >
        <NvStatusBadge tone="neutral" label="负荷未知" />
        <p class="tabular-nums">{{ load.start }} 至 {{ load.end }}</p>
        <p>{{ loadText(load) }}</p>
      </div>
      <details v-if="resource.idle.length" class="mt-2">
        <summary class="cursor-pointer font-medium">
          {{ resource.idle.length }} 个零负荷窗口（展开查看）
        </summary>
        <div
          v-for="load in resource.idle"
          :key="load.id"
          class="mt-2 border-t border-border pt-2"
          :data-load-id="load.id"
        >
          <NvStatusBadge tone="neutral" label="零负荷" />
          <p class="tabular-nums">{{ load.start }} 至 {{ load.end }}</p>
          <p>{{ loadText(load) }}</p>
        </div>
      </details>
    </article>
  </SnapshotContext>
</template>

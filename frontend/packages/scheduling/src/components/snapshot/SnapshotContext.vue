<script setup lang="ts">
import { computed } from 'vue'
import { NvStatusBadge } from '@nerv-iip/ui'
import type { SnapshotDataState, SnapshotSource } from './snapshot'
const props = defineProps<{ title: string; source?: SnapshotSource; provided: boolean }>()
const state = computed<SnapshotDataState>(() =>
  !props.provided && (!props.source?.state || props.source.state === 'available')
    ? 'missing'
    : (props.source?.state ?? 'available'),
)
const stateLabels = {
  available: '有记录',
  unknown: '状态未知',
  missing: '未提供数据',
  forbidden: '无权查看',
  unavailable: '暂不可读取',
} as const
const kindLabel = computed(() =>
  props.source?.kind === 'current'
    ? '当前记录'
    : props.source?.kind === 'snapshot'
      ? '冻结快照'
      : '来源未说明',
)
</script>

<template>
  <section
    class="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4 text-sm"
    :aria-label="title"
    data-snapshot-section
  >
    <header class="grid gap-2">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <div class="flex flex-wrap items-center gap-2">
        <NvStatusBadge :tone="source?.kind === 'current' ? 'info' : 'neutral'" :label="kindLabel" />
        <span>{{ source?.label ?? '来源未提供' }}</span>
        <span class="tabular-nums">记录时点：{{ source?.capturedAt ?? '—' }}</span>
      </div>
      <p class="text-muted-foreground" data-source-status>
        来源状态：{{ source?.status ?? '未提供' }}。记录仅反映上述来源与时点，不代表当前准备就绪。
      </p>
    </header>
    <slot v-if="state === 'available'" />
    <p v-else role="status" data-data-state>
      <NvStatusBadge tone="neutral" :label="stateLabels[state]" />
    </p>
  </section>
</template>

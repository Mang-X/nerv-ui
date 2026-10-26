<script setup lang="ts">
import { computed } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import { numberText } from '../snapshot/snapshot'
import type { SchedulingDowntimeItem } from './types'

const props = defineProps<{
  items?: readonly SchedulingDowntimeItem[]
  /** Host-refreshed, timezone-explicit minute text. This component owns no timer. */
  now: string
  contextKey: string
  pending?: boolean
  hasCandidates?: boolean
  readOnly?: boolean
  disabledReason?: string
}>()
const emit = defineEmits<{ preview: [contextKey: string] }>()
const actionReason = computed(() =>
  props.readOnly ? '当前为只读' : props.disabledReason || (props.pending ? '候选核实正在进行' : ''),
)
const phaseLabels = {
  'no-etr': '恢复时间未提供',
  expected: '预计恢复时间尚未到',
  expired: '预计时间已过，仍未恢复',
  recovered: '已恢复',
} as const
function preview() {
  if (!actionReason.value) emit('preview', props.contextKey)
}
</script>

<template>
  <section
    v-if="items?.length"
    class="grid gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4"
    aria-label="停机影响"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="font-semibold">停机影响</h2>
        <p class="text-xs text-muted-foreground">当前 {{ now }}</p>
      </div>
      <NvButton
        type="button"
        variant="outline"
        data-action="preview-downtime"
        :disabled="!!actionReason"
        :title="actionReason || undefined"
        @click="preview"
        >{{
          pending ? '正在核实候选…' : hasCandidates ? '重预览并比较候选' : '生成并比较候选'
        }}</NvButton
      >
    </header>
    <p v-if="actionReason" class="text-xs text-muted-foreground">{{ actionReason }}</p>
    <details
      v-for="item in items"
      :key="item.id"
      :data-downtime="item.id"
      class="rounded-md border border-border p-3 text-sm"
    >
      <summary class="cursor-pointer font-medium">
        {{ item.resourceLabel }} · {{ phaseLabels[item.phase] }} · 展开影响
      </summary>
      <div class="mt-2 grid gap-1">
        <p>实际开始 {{ item.startedAt }} · 已持续 {{ item.duration }}</p>
        <p v-if="item.phase === 'expected' || item.phase === 'expired'">
          预计恢复 {{ item.expectedRestoreAt || '时间未提供' }}
        </p>
        <p v-if="item.phase === 'recovered'">实际恢复 {{ item.recoveredAt || '时间未提供' }}</p>
        <p>
          有可用备选的受影响活动
          <span class="tabular-nums">{{
            item.alternativesCount == null ? '未知' : `备选 ${numberText(item.alternativesCount)}`
          }}</span>
        </p>
        <p v-if="item.affected === undefined">影响明细未提供</p>
        <p v-else-if="!item.affected.length">此来源无影响明细记录</p>
        <p v-for="affected in item.affected" :key="affected.id">
          {{ affected.label }} · {{ affected.message || '影响说明未提供' }}
        </p>
      </div>
    </details>
    <p class="text-xs text-muted-foreground">候选只供核对；保存和发布由来源确认。</p>
  </section>
</template>

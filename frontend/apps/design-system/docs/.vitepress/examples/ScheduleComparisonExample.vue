<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  ScheduleRevisionReview,
  SchedulingPreviewResult,
  type ScheduleSnapshot,
  type SnapshotDataState,
} from '@nerv-iip/scheduling'
import { NvButton } from '@nerv-iip/ui'
import { comparisonSnapshots } from './comparisonFacts'

const props = { venue: 'library' as const }
const original = comparisonSnapshots(props.venue)
const baseline = shallowRef<ScheduleSnapshot>(original.baseline)
const candidate = shallowRef<ScheduleSnapshot>(original.candidate)
const selectedKey = shallowRef('')
const readOnly = shallowRef(false)
const state = shallowRef<SnapshotDataState>('available')
const selected = computed(() =>
  candidate.value.items.find((item) => item.semanticKey === selectedKey.value),
)
const visibleCandidate = computed<ScheduleSnapshot>(() => ({
  ...candidate.value,
  source: { ...candidate.value.source, state: state.value },
}))
function replaceCandidate() {
  const copy = structuredClone(comparisonSnapshots(props.venue).candidate)
  const first = copy.items[0]
  if (first?.task) {
    first.task.startUtc = '2026-11-02T06:00:00Z'
    first.task.endUtc = '2026-11-02T08:00:00Z'
    first.task.segments = [
      { startUtc: '2026-11-02T06:00:00Z', endUtc: '2026-11-02T06:30:00Z' },
      { startUtc: '2026-11-02T07:00:00Z', endUtc: '2026-11-02T08:00:00Z' },
    ]
    first.label = props.venue === 'library' ? '清晨共读 · 替换' : '清晨创作 · 替换'
    first.task.text = first.label
  }
  if (copy.model) copy.model.tasks = copy.items.flatMap((item) => (item.task ? [item.task] : []))
  candidate.value = { ...copy, id: 'candidate-replaced', label: '另一份候选安排' }
  selectedKey.value = ''
}
function clearCandidate() {
  candidate.value = {
    ...candidate.value,
    id: 'candidate-empty',
    items: [],
    model: undefined,
    metrics: undefined,
    shortages: [],
    risks: [],
    conflicts: { conflicts: [], unscheduled: [] },
  }
  selectedKey.value = ''
}
function restore() {
  const fresh = comparisonSnapshots(props.venue)
  baseline.value = fresh.baseline
  candidate.value = fresh.candidate
  state.value = 'available'
  selectedKey.value = ''
}
function setMetrics(metrics: ScheduleSnapshot['metrics']) {
  candidate.value = { ...candidate.value, metrics }
}
function invalidIdentity() {
  const item = candidate.value.items[0]
  if (item) candidate.value = { ...candidate.value, items: [item, { ...item }] }
  selectedKey.value = ''
}
function select(key: string) {
  if (
    !readOnly.value &&
    state.value === 'available' &&
    candidate.value.items.some((item) => item.semanticKey === key && item.task)
  )
    selectedKey.value = key
}
const states = [
  { value: 'available', label: '可读取' },
  { value: 'unknown', label: '状态未知' },
  { value: 'missing', label: '未提供数据' },
  { value: 'forbidden', label: '无权查看' },
  { value: 'unavailable', label: '暂不可读取' },
]
</script>

<template>
  <section class="grid min-w-0 gap-6 p-2 text-sm sm:p-4" data-comparison-page>
    <section class="grid gap-3 rounded-lg border border-border bg-card p-4" aria-label="对照操作">
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" @click="replaceCandidate">载入另一份候选安排</NvButton>
        <NvButton variant="outline" @click="clearCandidate">清空候选</NvButton>
        <NvButton variant="outline" @click="setMetrics([])">清空指标</NvButton>
        <NvButton variant="outline" @click="setMetrics(undefined)">不提供指标</NvButton>
        <NvButton variant="outline" @click="invalidIdentity">查看身份校验提示</NvButton>
        <NvButton variant="outline" @click="restore">恢复两侧记录</NvButton>
        <NvButton variant="outline" :aria-pressed="readOnly" @click="readOnly = !readOnly">{{
          readOnly ? '允许选择' : '只读查看'
        }}</NvButton>
      </div>
      <label class="flex items-center gap-2"
        >候选读取状态
        <select
          v-model="state"
          aria-label="候选读取状态"
          class="rounded-md border border-border bg-background px-3 py-2"
        >
          <option v-for="item in states" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
    </section>
    <ScheduleRevisionReview
      :baseline="baseline"
      :candidate="visibleCandidate"
      :read-only="readOnly"
      @select="select"
    />
    <aside class="rounded-lg border border-border bg-card p-4" aria-label="选中活动">
      <h2 class="font-semibold">选中活动</h2>
      <p v-if="!selected || state !== 'available'">尚未选择活动</p>
      <p v-else>
        {{ selected.label }} · {{ selected.task?.display?.resourceLabel ?? '安排未提供' }}
      </p>
      <p v-if="readOnly">只读查看，选择动作已关闭。</p>
    </aside>
    <SchedulingPreviewResult
      :snapshot="visibleCandidate"
      title="候选预览详情"
      :read-only="readOnly"
      @select="select"
    />
  </section>
</template>

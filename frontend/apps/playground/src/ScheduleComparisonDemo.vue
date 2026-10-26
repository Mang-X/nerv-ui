<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  ScheduleRevisionReview,
  SchedulingPreviewResult,
  scheduleTime,
  type ScheduleSnapshot,
  type SnapshotDataState,
} from '@nerv-iip/scheduling'
import { NvButton, useColorMode, useTheme } from '@nerv-iip/ui'
import { comparisonSnapshots } from './schedule-comparison-fixtures'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const original = comparisonSnapshots(props.venue)
const baseline = shallowRef<ScheduleSnapshot>(original.baseline)
const candidate = shallowRef<ScheduleSnapshot>(original.candidate)
const draft = shallowRef<ScheduleSnapshot>(structuredClone(original.candidate))
const selectedKey = shallowRef('')
const narrow = shallowRef(false)
const readOnly = shallowRef(false)
const state = shallowRef<SnapshotDataState>('available')
const selected = computed(() =>
  candidate.value.items.find((item) => item.semanticKey === selectedKey.value),
)
const draftStart = computed(() => {
  const task = draft.value.items[0]?.task
  return task
    ? scheduleTime(task.startUtc, task.timezone, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
})
const visibleCandidate = computed<ScheduleSnapshot>(() => ({
  ...candidate.value,
  source: { ...candidate.value.source, state: state.value },
}))
function editDraft() {
  const copy = structuredClone(draft.value)
  const first = copy.items[0]?.task
  if (first) {
    first.startUtc = '2026-11-02T05:00:00Z'
    first.endUtc = '2026-11-02T07:00:00Z'
    first.segments = [
      { startUtc: '2026-11-02T05:00:00Z', endUtc: '2026-11-02T05:30:00Z' },
      { startUtc: '2026-11-02T06:00:00Z', endUtc: '2026-11-02T07:00:00Z' },
    ]
  }
  draft.value = copy
}
function previewDraft() {
  const copy = structuredClone(draft.value)
  candidate.value = {
    ...copy,
    id: 'draft-preview',
    label: '未保存草案的候选预览',
    source: {
      ...copy.source,
      kind: 'current',
      label: '未保存草案预览',
      status: '仅供预览；尚未保存或发布',
    },
  }
  selectedKey.value = ''
}
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
  draft.value = structuredClone(fresh.candidate)
  state.value = 'available'
  selectedKey.value = ''
}
function select(key: string) {
  if (!readOnly.value) selectedKey.value = key
}
</script>

<template>
  <main
    class="mx-auto grid max-w-7xl gap-6 p-6 text-sm"
    :class="{ 'max-w-xl': narrow }"
    data-comparison-page
  >
    <nav class="flex flex-wrap gap-3" aria-label="比较页面导航">
      <a href="#desktop" class="inline-flex min-h-11 items-center underline">返回工作空间</a>
      <a href="#schedule-draft/library" class="inline-flex min-h-11 items-center underline"
        >一起安排</a
      >
      <a href="#schedule-snapshot/library" class="inline-flex min-h-11 items-center underline"
        >安排核对</a
      >
      <a href="#schedule-gantt" class="inline-flex min-h-11 items-center underline">时间与空间</a>
      <a
        :href="`#schedule-compare/${venue === 'library' ? 'studio' : 'library'}`"
        class="inline-flex min-h-11 items-center underline"
        >{{ venue === 'library' ? '工作坊比较' : '读书会比较' }}</a
      >
    </nav>
    <header class="grid gap-2">
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ venue === 'library' ? '读书会安排对照' : '工作坊安排对照' }}
      </h1>
      <p class="text-muted-foreground">
        查看已保存安排与候选安排的差异。草案预览不会改动已保存安排。
      </p>
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" :aria-pressed="isDark" @click="toggle">{{
          isDark ? '切换浅色' : '切换深色'
        }}</NvButton>
        <NvButton
          variant="outline"
          :aria-pressed="theme === 'blue'"
          @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
          >蓝色主题</NvButton
        >
        <NvButton variant="outline" :aria-pressed="narrow" @click="narrow = !narrow">{{
          narrow ? '展开阅读宽度' : '收窄阅读宽度'
        }}</NvButton>
      </div>
    </header>
    <section class="grid gap-3 rounded-lg border border-border bg-card p-4" aria-label="对照操作">
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" @click="editDraft">修改未保存草案</NvButton>
        <NvButton variant="outline" @click="previewDraft">预览草案候选</NvButton>
        <NvButton variant="outline" @click="replaceCandidate">载入另一份候选安排</NvButton>
        <NvButton variant="outline" @click="clearCandidate">清空候选</NvButton>
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
          <option value="available">可读取</option>
          <option value="unknown">状态未知</option>
          <option value="missing">未提供数据</option>
          <option value="forbidden">无权查看</option>
          <option value="unavailable">暂不可读取</option>
        </select>
      </label>
      <p data-draft-state>
        未保存草案起点：<time
          v-if="draft.items[0]?.task"
          :datetime="draft.items[0]!.task!.startUtc"
          >{{ draftStart }}</time
        ><span v-else>—</span>。草案修改不会改动已保存安排。
      </p>
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
    <SchedulingPreviewResult :snapshot="visibleCandidate" title="候选预览详情" read-only />
  </main>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, onUnmounted } from 'vue'
import {
  SchedulingWorkbench,
  SchedulingHistory,
  SchedulingSavedPlan,
  type SchedulingHistoryInput,
  type SchedulingHistoryAction,
} from '@nerv-iip/scheduling'
import { NvButton } from '@nerv-iip/ui'
import { panelModel } from './panelModel'
import '@nerv-iip/scheduling/styles.css'
const props = defineProps<{ venue: 'library' | 'studio' }>()

const model = shallowRef(panelModel(props.venue))
let finishPreview: ((accept: boolean) => void) | undefined
let finishDownload: (() => void) | undefined
const preview: NonNullable<import('@nerv-iip/scheduling').SchedulingEditsDeps['preview']> = (
  snapshot,
  control,
) =>
  new Promise((resolve, reject) => {
    finishPreview = (accept) => {
      if (control.signal.aborted) {
        resolve(snapshot)
        return
      }
      if (!accept) {
        reject(new Error('local-rejected'))
        return
      }
      resolve({
        ...snapshot,
        tasks: snapshot.tasks.map((t) => ({ ...t, text: t.text + ' · 本页预览' })),
      })
    }
    control.signal.addEventListener('abort', () => resolve(snapshot), { once: true })
  })
onUnmounted(() => {
  finishPreview?.(false)
  finishDownload?.()
})
const readOnly = shallowRef(false)
const fail = shallowRef(false)
const view = shallowRef('workbench')
const receipt = shallowRef('')
const revision = shallowRef(0)
const state = shallowRef<'loading' | 'ready' | 'error'>('ready')
const history = computed<SchedulingHistoryInput>(() => ({
  source: props.venue,
  revision: String(revision.value),
  state: state.value,
  entries: Array.from({ length: 4 }, (_, i) => ({
    key: `record-${i}`,
    label: `${props.venue === 'library' ? '共读' : '创作'}安排 ${i + 1}`,
    status: { key: i ? 'saved' : 'candidate', label: i ? '已保存' : '待确认', tone: 'neutral' },
    createdAt: '2026-10-29T00:00:00Z',
    timezone: 'Asia/Shanghai',
    quantity: i === 0 ? 0 : i === 1 ? null : 2.1256,
    model: panelModel(props.venue),
    confirmation: { label: '采用此安排', description: '仅记录本地选择，不更改草案或执行计划。' },
  })),
}))
watch(
  () => props.venue,
  () => {
    model.value = panelModel(props.venue)
    receipt.value = ''
    revision.value++
  },
  { flush: 'sync' },
)
const action: SchedulingHistoryAction = async (_entry, control) => {
  // A microtask boundary permits cancel/replacement without timers or background work.
  await Promise.resolve()
  if (control.signal.aborted) return false
  if (fail.value) throw new Error('local-example')
  return true
}
const download: SchedulingHistoryAction = async (entry, control) => {
  await new Promise<void>((resolve) => {
    finishDownload = resolve
    control.signal.addEventListener('abort', () => resolve(), { once: true })
  })
  if (!(await action(entry, control)) || control.signal.aborted) return false
  const blob = new Blob(['安排,数量\n' + entry.label + ',' + (entry.quantity ?? '') + '\n'], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = 'arrangements.csv'
    a.click()
  } finally {
    URL.revokeObjectURL(url)
  }
  return true
}
</script>
<template>
  <section
    class="mx-auto grid w-full min-w-0 max-w-[92rem] grid-cols-[minmax(0,1fr)] gap-4 p-2 sm:p-4"
  >
    <h1 class="text-2xl font-semibold">{{ venue === 'library' ? '书房' : '创作室' }}安排工作台</h1>
    <p>
      本页仅供查阅与尝试安排。草案、历史记录与当前安排分别保留。预览、确认与下载仅使用本页内存，不代表已保存、发布或真实
      APS 计算。
    </p>
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="readOnly = !readOnly">{{
        readOnly ? '恢复编辑' : '仅可查阅'
      }}</NvButton
      ><NvButton variant="outline" @click="fail = !fail">{{
        fail ? '恢复操作' : '暂停处理'
      }}</NvButton
      ><NvButton variant="outline" @click="model = panelModel(venue, true)">查看最新安排</NvButton
      ><NvButton variant="outline" @click="revision++">刷新历史记录</NvButton>
      <NvButton variant="outline" @click="finishPreview?.(true)">接收本轮预览</NvButton>
      <NvButton variant="outline" @click="finishPreview?.(false)">保留当前安排</NvButton>
      <NvButton variant="outline" @click="finishDownload?.()">接收本轮下载</NvButton>
    </div>
    <nav aria-label="工作台视图" class="flex flex-wrap gap-2">
      <NvButton
        v-for="[key, label] in [
          ['workbench', '工作台'],
          ['history', '历史安排'],
          ['gantt', '已保存图面'],
        ]"
        :key="key"
        :variant="view === key ? 'default' : 'outline'"
        @click="view = key"
        >{{ label }}</NvButton
      >
    </nav>
    <div
      v-if="view === 'workbench'"
      class="min-w-0 overflow-x-auto"
      tabindex="0"
      aria-label="工作台可滚动区域"
    >
      <div class="min-w-[360px]">
        <SchedulingWorkbench
          :model="model"
          :read-only="readOnly"
          :context="venue"
          :preview="preview"
          @fix="receipt = '已收到活动处理请求'"
        />
      </div>
    </div>
    <template v-else-if="view === 'history'">
      <label
        >列表状态<select
          v-model="state"
          aria-label="历史读取状态"
          class="rounded border bg-card p-2"
        >
          <option
            v-for="[key, label] in [
              ['ready', '可读取'],
              ['loading', '读取中'],
              ['error', '读取失败'],
            ]"
            :key="key"
            :value="key"
          >
            {{ label }}
          </option>
        </select></label
      >
      <SchedulingHistory
        :input="history"
        :read-only="readOnly"
        :page-size="2"
        :confirm="action"
        :download="download"
        @retry="state = 'ready'"
      >
        <template #detail="{ entry }"
          ><SchedulingSavedPlan
            :plan-id="entry.model?.meta.planId ?? ''"
            :model="entry.model"
            group-by="workCenter"
            :plan-label="entry.label"
        /></template>
      </SchedulingHistory>
    </template>
    <SchedulingSavedPlan
      v-else
      :plan-id="history.entries[0]!.model!.meta.planId"
      :model="history.entries[0]!.model"
      group-by="workCenter"
      plan-label="已保存快照"
    />
    <p role="status">{{ receipt }}</p>
  </section>
</template>

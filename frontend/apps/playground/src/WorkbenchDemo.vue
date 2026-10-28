<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import {
  SchedulingWorkbench,
  SchedulingHistory,
  SchedulingSavedPlan,
  type SchedulingHistoryInput,
  type SchedulingHistoryAction,
} from '@nerv-iip/scheduling'
import { NvButton, useColorMode } from '@nerv-iip/ui'
import { panelModel } from './schedule-panels-fixtures'
import '@nerv-iip/scheduling/styles.css'
const props = defineProps<{ venue: 'library' | 'studio' }>()
const { toggle } = useColorMode()
const model = shallowRef(panelModel(props.venue))
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
  <main class="mx-auto grid w-full min-w-0 max-w-[92rem] grid-cols-[minmax(0,1fr)] gap-4 p-4">
    <h1 class="text-2xl font-semibold">{{ venue === 'library' ? '书房' : '创作室' }}安排工作台</h1>
    <p>本页仅供查阅与尝试安排。草案、历史记录与当前安排分别保留，操作不会保存到计划服务。</p>
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="toggle">切换主题</NvButton
      ><NvButton variant="outline" @click="readOnly = !readOnly">{{
        readOnly ? '恢复编辑' : '仅可查阅'
      }}</NvButton
      ><NvButton variant="outline" @click="fail = !fail">{{
        fail ? '恢复操作' : '暂停处理'
      }}</NvButton
      ><NvButton variant="outline" @click="model = panelModel(venue, true)">查看最新安排</NvButton
      ><NvButton variant="outline" @click="revision++">刷新历史记录</NvButton>
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
    <SchedulingWorkbench
      v-if="view === 'workbench'"
      :model="model"
      :read-only="readOnly"
      :context="venue"
      @fix="receipt = '已收到活动处理请求'"
    />
    <template v-else-if="view === 'history'">
      <label
        >列表状态<select
          v-model="state"
          aria-label="历史读取状态"
          class="rounded border bg-card p-2"
        >
          <option value="ready">可读取</option>
          <option value="loading">读取中</option>
          <option value="error">读取失败</option>
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
  </main>
</template>

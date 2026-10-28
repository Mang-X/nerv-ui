<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ResourceSchedulerBoard,
  SchedulingToolbar,
  SchedulingLegend,
  TaskDetailPanel,
  ConflictPanel,
  UnscheduledPanel,
  ChangeSummaryPanel,
  type TimeScale,
  type LaneOrder,
  type EngineCommand,
} from '@nerv-iip/scheduling'
import { NvButton } from '@nerv-iip/ui'
import { panelModel } from './panelModel'
const model = ref(panelModel('library'))
const base = panelModel('library')
const selectedId = ref('')
const selected = computed(() => model.value.tasks.find((t) => t.id === selectedId.value))
const search = ref(''),
  group = ref('workCenter'),
  order = ref<LaneOrder>('name'),
  scale = ref<TimeScale>('hour')
const readOnly = ref(false),
  accept = ref(true)
const chart = ref<InstanceType<typeof ResourceSchedulerBoard>>()
const matches = computed(() =>
  search.value.trim()
    ? model.value.tasks.filter((t) => !t.blockKind && t.text.includes(search.value.trim()))
    : [],
)
const reason = computed(() =>
  chart.value?.engineName === 'dhtmlx' ? undefined : '当前仅可查看，图面定位尚不可用',
)
function zoom(direction: number) {
  const levels: TimeScale[] = ['hour', 'day', 'week', 'month']
  scale.value = levels[Math.max(0, Math.min(3, levels.indexOf(scale.value) + direction))]!
}
const message = ref('选择活动查看当前事实。')
function command(c: EngineCommand) {
  if (!reason.value) chart.value?.command(c)
}
function select(id: string) {
  if (!model.value.tasks.some((t) => t.id === id)) return
  selectedId.value = id
  command({ kind: 'selectTask', taskId: id })
  command({ kind: 'revealTask', taskId: id })
}
function next(direction: number) {
  if (!matches.value.length) return
  const at = matches.value.findIndex((t) => t.id === selectedId.value)
  select(matches.value[(at + direction + matches.value.length) % matches.value.length]!.id)
}
function lock(id: string, locked: boolean) {
  if (readOnly.value || !model.value.tasks.some((t) => t.id === id)) return
  if (accept.value)
    model.value = {
      ...model.value,
      tasks: model.value.tasks.map((t) => (t.id === id ? { ...t, locked } : t)),
    }
  message.value = accept.value ? '已采用活动状态调整，仅保留在本页。' : '保留原状态。'
}
function replace() {
  model.value = panelModel('library', true)
  selectedId.value = ''
  search.value = ''
}
</script>
<template>
  <section class="space-y-4 text-sm">
    <div class="flex flex-wrap gap-3">
      <label><input v-model="accept" type="checkbox" />采用锁定请求</label>
      <label><input v-model="readOnly" type="checkbox" />只读安排</label>
      <NvButton variant="outline" @click="replace">替换活动来源</NvButton>
    </div>
    <SchedulingToolbar
      :scale="scale"
      :read-only="readOnly"
      :can-undo="false"
      :can-redo="false"
      :dirty="false"
      :busy="false"
      :can-repreview="false"
      :can-release="false"
      searchable
      :search="search"
      :match-count="matches.length"
      :match-index="matches.findIndex((t) => t.id === selectedId) + 1"
      :group-dimensions="model.groupDimensions"
      :group-by="group"
      :lane-order="order"
      :disabled-reasons="{ today: reason, fit: reason, zoomIn: reason, zoomOut: reason }"
      @update:search="search = $event"
      @search-next="next(1)"
      @search-prev="next(-1)"
      @scale-change="scale = $event"
      @group-change="group = $event"
      @lane-order-change="order = $event"
      @toggle-read-only="readOnly = !readOnly"
      @today="command({ kind: 'scrollToToday' })"
      @fit="command({ kind: 'fitToScreen' })"
      @zoom-in="zoom(-1)"
      @zoom-out="zoom(1)"
    />
    <p role="status">{{ message }} {{ reason }}</p>
    <div class="h-[400px]">
      <ResourceSchedulerBoard
        ref="chart"
        :model="model"
        :group-by="group"
        :lane-order="order"
        :scale="scale"
        read-only
        @task-select="select"
        @update:group-by="group = $event"
      />
    </div>
    <SchedulingLegend
      :model="model"
      view="resource"
      :scale="scale"
      :group-by="group"
      :lane-order="order"
      :categories="[{ key: 'weld', label: '活动' }]"
      :toggleable-groups="[]"
      :block-labels="{ maintenance: '空间整理' }"
    />
    <p>图面只读；锁定状态由下方详情请求调整。活动时间使用 Asia/Shanghai。</p>
    <TaskDetailPanel
      :task="selected"
      :read-only="readOnly"
      :labels="{ empty: '尚未选择活动', lock: '锁定活动', unlock: '解锁活动', resource: '空间' }"
      @toggle-lock="lock"
    />
    <ConflictPanel :conflicts="model.conflicts" @select="select" />
    <UnscheduledPanel
      :items="model.unscheduled"
      :read-only="readOnly"
      @fix="message = '已在本页记录联系请求，未调用外部服务。'"
    />
    <ChangeSummaryPanel
      :changes="model.changes"
      :tasks="model.tasks"
      :base-tasks="base.tasks"
      @select="select"
    />
  </section>
</template>

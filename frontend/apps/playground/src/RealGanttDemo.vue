<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  GanttChart,
  ResourceSchedulerBoard,
  type EngineCommand,
  type ScheduleModel,
  type TimeScale,
} from '@nerv-iip/scheduling'
import '@nerv-iip/scheduling/styles.css'
import { NvButton, useColorMode, useTheme } from '@nerv-iip/ui'
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const scenario = ref<'reading' | 'dst'>('reading')
const state = ref<'ready' | 'loading' | 'empty' | 'unresolved' | 'invalid'>('ready')
const first = ref(true)
const second = ref(true)
const resource = ref(false)
const narrow = ref(false)
const readOnly = ref(true)
const scale = ref<TimeScale>('hour')
const selected = ref('')
const chart = ref<InstanceType<typeof GanttChart>>()
const version = ref(0)
const task = (id: string, text: string, startUtc: string, endUtc: string) => ({
  id,
  orderId: 'reading',
  operationId: id,
  operationSequence: 0,
  type: 'operation' as const,
  parentId: 'reading',
  text,
  startUtc,
  endUtc,
  timezone: 'Asia/Shanghai',
  locked: false,
  hasConflict: false,
  resourceId: 'room',
  workCenterId: 'room',
})
const base: ScheduleModel = {
  tasks: [
    {
      ...task('reading', '周末共读', '2026-10-25T00:00:00Z', '2026-10-26T04:00:00Z'),
      type: 'order',
      parentId: undefined,
    },
    {
      ...task('chapter', '第一章 · 共读', '2026-10-25T00:00:00Z', '2026-10-25T03:00:00Z'),
      plannedStartUtc: '2026-10-24T23:00:00Z',
      plannedEndUtc: '2026-10-25T02:00:00Z',
      facts: [{ label: '进度说明', value: '由宿主提供' }],
    },
    {
      ...task('discussion', '讨论与记录', '2026-10-25T03:00:00Z', '2026-10-26T04:00:00Z'),
      segments: [
        { startUtc: '2026-10-25T03:00:00Z', endUtc: '2026-10-25T05:00:00Z' },
        { startUtc: '2026-10-26T02:00:00Z', endUtc: '2026-10-26T04:00:00Z' },
      ],
    },
    {
      ...task('complete', '分享完成', '2026-10-26T04:00:00Z', '2026-10-26T04:00:00Z'),
      isMilestone: true,
    },
  ],
  links: [
    { id: 'chapter-discussion', source: 'chapter', target: 'discussion', type: 'finish_to_start' },
    {
      id: 'discussion-complete',
      source: 'discussion',
      target: 'complete',
      type: 'finish_to_start',
    },
  ],
  resources: [{ id: 'room', text: '阅读室' }],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  horizon: { startUtc: '2026-10-24T16:00:00Z', endUtc: '2026-10-26T16:00:00Z' },
  timezones: ['Asia/Shanghai'],
  meta: { planId: 'reading', status: 'generated', algorithmVersion: 'host-supplied' },
}
const dst: ScheduleModel = {
  ...base,
  tasks: [
    {
      ...task('reading', '纽约回拨日共读', '2026-11-01T04:00:00Z', '2026-11-01T09:00:00Z'),
      type: 'order',
      parentId: undefined,
      timezone: 'America/New_York',
    },
    {
      ...task('chapter', '第一次 01:00 · EDT', '2026-11-01T05:00:00Z', '2026-11-01T05:30:00Z'),
      timezone: 'America/New_York',
    },
    {
      ...task('discussion', '第二次 01:00 · EST', '2026-11-01T06:00:00Z', '2026-11-01T06:30:00Z'),
      timezone: 'America/New_York',
    },
  ],
  links: [{ id: 'dst-fs', source: 'chapter', target: 'discussion', type: 'finish_to_start' }],
  horizon: { startUtc: '2026-11-01T04:00:00Z', endUtc: '2026-11-01T09:00:00Z' },
  timezones: ['America/New_York'],
}
const model = computed(() => ({
  ...(scenario.value === 'dst' ? dst : base),
  tasks:
    state.value === 'empty'
      ? []
      : (scenario.value === 'dst' ? dst : base).tasks.map((t) => ({
          ...t,
          text: t.text + (version.value ? ' · 更新' : ''),
          startUtc: state.value === 'invalid' ? t.startUtc.replace(/Z$/, '') : t.startUtc,
          timezone: state.value === 'unresolved' ? '' : t.timezone,
        })),
  links: state.value === 'empty' ? [] : (scenario.value === 'dst' ? dst : base).links,
  timezones: state.value === 'unresolved' ? [] : (scenario.value === 'dst' ? dst : base).timezones,
}))
function command(value: EngineCommand) {
  chart.value?.command(value)
}
function remount() {
  first.value = false
  queueMicrotask(() => {
    first.value = true
  })
}
</script>
<template>
  <main class="min-h-screen bg-background p-5 text-foreground">
    <header class="mb-4 flex flex-wrap items-center gap-3">
      <a href="#schedule" class="underline">原生时间安排</a><a href="#" class="underline">桌面</a>
      <h1 class="text-xl font-semibold">真实只读甘特图</h1>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '浅色' : '深色' }}</NvButton>
      <NvButton variant="outline" @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
        >主题 {{ theme }}</NvButton
      >
    </header>
    <p class="mb-3 text-sm">
      DHTMLX 9.1.4 Professional Evaluation。声明与水印保留，授权范围
      UNKNOWN；本页仅本地中性数据，无后端。
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <label
        >场景
        <select v-model="scenario" aria-label="排程场景">
          <option value="reading">周末共读</option>
          <option value="dst">纽约回拨日</option>
        </select></label
      >
      <label
        >状态
        <select v-model="state" aria-label="图面状态">
          <option value="ready">正常</option>
          <option value="loading">加载中</option>
          <option value="empty">空计划</option>
          <option value="unresolved">时区未解析</option>
          <option value="invalid">时刻错误</option>
        </select></label
      >
      <label
        >刻度
        <select v-model="scale" aria-label="时间刻度">
          <option value="hour">小时</option>
          <option value="day">日</option>
          <option value="week">周</option>
          <option value="month">月</option>
        </select></label
      >
      <label><input v-model="readOnly" type="checkbox" />只读</label>
      <NvButton variant="outline" @click="first = !first">切换首图</NvButton>
      <NvButton variant="outline" @click="second = !second">切换第二图</NvButton>
      <NvButton variant="outline" @click="remount">快速重挂</NvButton>
      <NvButton variant="outline" @click="narrow = !narrow">容器宽度</NvButton>
      <NvButton variant="outline" @click="resource = !resource">资源只读入口</NvButton>
      <NvButton variant="outline" @click="version++">外部更新</NvButton>
      <NvButton variant="outline" @click="command({ kind: 'selectTask', taskId: 'discussion' })"
        >选择讨论</NvButton
      >
      <NvButton variant="outline" @click="command({ kind: 'revealTask', taskId: 'discussion' })"
        >定位讨论</NvButton
      >
      <NvButton variant="outline" @click="command({ kind: 'revealTask', taskId: 'complete' })"
        >定位完成</NvButton
      >
      <NvButton variant="outline" @click="command({ kind: 'scrollToToday' })">今天</NvButton>
      <NvButton variant="outline" @click="command({ kind: 'fitToScreen' })">重算容器</NvButton>
    </div>
    <p role="status" class="mb-3 text-sm">
      选中：{{ selected || '无' }}。双图使用相同 task
      id，状态独立。适配窗口只重算容器，不自动缩放完整计划期。
    </p>
    <section :style="{ width: narrow ? '900px' : '100%' }" class="max-w-full space-y-5">
      <div
        v-if="first"
        data-seat="first"
        class="h-[440px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <GanttChart
          ref="chart"
          :model="model"
          :scale="scale"
          :read-only="readOnly"
          :loading="state === 'loading'"
          @task-select="selected = 'first:' + $event"
        />
      </div>
      <div
        v-if="second"
        data-seat="second"
        class="h-[440px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <GanttChart
          :model="base"
          scale="hour"
          read-only
          @task-select="selected = 'second:' + $event"
        />
      </div>
      <div
        v-if="resource"
        data-seat="resource"
        class="h-[420px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <ResourceSchedulerBoard :model="base" scale="hour" read-only />
      </div>
    </section>
  </main>
</template>

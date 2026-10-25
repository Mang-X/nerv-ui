<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import {
  GanttChart,
  type ScheduleModel,
  type ScheduleTask,
  type TaskDragPayload,
  type TimeScale,
} from '@nerv-iip/scheduling'
import { NvButton, useColorMode, useTheme } from '@nerv-iip/ui'
const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const readOnly = shallowRef(false)
const locked = shallowRef(false)
const first = shallowRef(true)
const second = shallowRef(true)
const narrow = shallowRef(false)
const scale = shallowRef<TimeScale>('hour')
const policy = shallowRef('accept')
const message = shallowRef('拖动活动调整时间，或拖动两端调整时长。')
const proposals = shallowRef<TaskDragPayload[]>([])
const chart = useTemplateRef<InstanceType<typeof GanttChart>>('chart')
const activity = (id: string, text: string, startUtc: string, endUtc: string): ScheduleTask => ({
  id,
  operationId: `activity:${id}`,
  orderId: 'day',
  parentId: 'day',
  operationSequence: 0,
  type: 'operation',
  text,
  startUtc,
  endUtc,
  timezone: 'Asia/Shanghai',
  locked: false,
  hasConflict: false,
  resourceId: 'space',
})
const initial: ScheduleModel = {
  tasks: [
    {
      ...activity(
        'day',
        props.venue === 'studio' ? '周末创作' : '周末共读',
        '2026-10-25T00:00:00Z',
        '2026-10-25T12:00:00Z',
      ),
      type: 'order',
      parentId: undefined,
    },
    activity(
      'edit',
      props.venue === 'studio' ? '速写与配色' : '阅读与交流',
      '2026-10-25T02:00:00+00:00',
      '2026-10-25T05:00:00+00:00',
    ),
    {
      ...activity('fixed', '已确定的活动', '2026-10-25T06:00:00Z', '2026-10-25T08:00:00Z'),
      locked: true,
    },
    {
      ...activity('parts', '分两次进行', '2026-10-25T03:00:00Z', '2026-10-25T10:00:00Z'),
      segments: [
        { startUtc: '2026-10-25T03:00:00Z', endUtc: '2026-10-25T04:00:00Z' },
        { startUtc: '2026-10-25T09:00:00Z', endUtc: '2026-10-25T10:00:00Z' },
      ],
    },
  ],
  links: [],
  resources: [{ id: 'space', text: '活动空间' }],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-25T12:00:00Z' },
  timezones: ['Asia/Shanghai'],
  meta: { planId: props.venue, status: 'preview', algorithmVersion: 'example' },
}
const authority = shallowRef(initial)
const model = computed(() => ({
  ...authority.value,
  tasks: authority.value.tasks.map((t) => (t.id === 'edit' ? { ...t, locked: locked.value } : t)),
}))
function replace() {
  authority.value = {
    ...authority.value,
    tasks: authority.value.tasks.map((t) =>
      t.id === 'edit'
        ? { ...t, startUtc: '2026-10-25T08:00:00Z', endUtc: '2026-10-25T11:00:00Z' }
        : t,
    ),
  }
  message.value = '已换为新的活动时间。'
}
function proposed(payload: TaskDragPayload) {
  proposals.value = [...proposals.value, payload]
  if (policy.value === 'accept') {
    authority.value = {
      ...authority.value,
      tasks: authority.value.tasks.map((t) =>
        t.id === payload.taskId ? { ...t, startUtc: payload.startUtc, endUtc: payload.endUtc } : t,
      ),
    }
    message.value = '已采用新的时间。'
  } else if (policy.value === 'replace') {
    replace()
  } else message.value = '保留原来的时间。'
}
function reset() {
  authority.value = initial
  proposals.value = []
  locked.value = false
  readOnly.value = false
  message.value = '已恢复最初安排。'
}
</script>
<template>
  <main class="min-h-screen bg-background p-5 text-foreground">
    <header class="mb-4 flex flex-wrap items-center gap-4">
      <a href="#" class="underline">桌面</a><a href="#schedule" class="underline">时间安排</a
      ><a href="#schedule-gantt" class="underline">共读活动图</a
      ><a href="#schedule-resources/library" class="underline">空间安排</a>
      <a
        :href="venue === 'library' ? '#schedule-edit/studio' : '#schedule-edit/library'"
        class="underline"
        >{{ venue === 'library' ? '周末画室' : '晨光书房' }}</a
      >
      <h1 class="text-xl font-semibold">
        {{ venue === 'library' ? '晨光书房 · 安排共读' : '周末画室 · 安排创作' }}
      </h1>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '浅色' : '深色' }}</NvButton>
      <NvButton variant="outline" @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
        >切换主题</NvButton
      >
    </header>
    <p class="mb-3 text-sm">
      拖动整条活动可调整开始时间，拖动左右两端可调整时长。已确定和分段活动保留原来的时间。DHTMLX
      9.1.4 Professional Evaluation；声明与水印保留，授权范围 UNKNOWN。
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <label
        >时间调整<select v-model="policy" aria-label="时间调整">
          <option value="accept">采用新时间</option>
          <option value="reject">保留原时间</option>
          <option value="replace">换为另一安排</option>
        </select></label
      >
      <label><input v-model="readOnly" type="checkbox" />只读</label>
      <label><input v-model="locked" type="checkbox" />确定首项活动</label>
      <label
        >刻度<select v-model="scale" aria-label="时间刻度">
          <option value="hour">小时</option>
          <option value="day">日</option>
          <option value="week">周</option>
          <option value="month">月</option>
        </select></label
      >
      <NvButton variant="outline" @click="replace">换一组时间</NvButton
      ><NvButton variant="outline" @click="reset">恢复最初安排</NvButton>
      <NvButton variant="outline" @click="first = !first">显示或收起活动图</NvButton
      ><NvButton variant="outline" @click="second = !second">显示或收起参考图</NvButton
      ><NvButton variant="outline" @click="narrow = !narrow">切换阅读宽度</NvButton>
      <NvButton variant="outline" @click="chart?.command({ kind: 'revealTask', taskId: 'edit' })"
        >定位首项活动</NvButton
      >
    </div>
    <p role="status" class="mb-3">{{ message }}</p>
    <section :style="{ width: narrow ? '1000px' : '100%' }" class="max-w-full space-y-4">
      <div
        v-if="first"
        data-seat="editing"
        class="h-[400px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <GanttChart
          ref="chart"
          :model="model"
          :scale="scale"
          :read-only="readOnly"
          @task-drag-end="proposed"
          @locked-drag-attempt="message = '这项活动已确定，请先取消确定再调整。'"
        />
      </div>
      <p>
        当前首项活动：<output data-authority
          >{{ model.tasks[1]?.startUtc }} → {{ model.tasks[1]?.endUtc }}</output
        >
      </p>
      <details>
        <summary>时间调整记录（{{ proposals.length }}）</summary>
        <pre data-proposals>{{ JSON.stringify(proposals, null, 2) }}</pre>
      </details>
      <div
        v-if="second"
        data-seat="reference"
        class="h-[330px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <GanttChart :model="initial" scale="hour" read-only />
      </div>
    </section>
  </main>
</template>

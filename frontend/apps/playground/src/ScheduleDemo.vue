<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvApp,
  NvButton,
  NvScheduleTimeline,
  useColorMode,
  useTheme,
  type NvScheduleVisualModel,
} from '@nerv-iip/ui'

const initial: NvScheduleVisualModel = {
  horizon: { start: '2026-01-15T00:00:00Z', end: '2026-01-16T00:00:00Z' },
  timezones: ['UTC'],
  groups: [
    { id: 'reading', label: '阅读计划' },
    { id: 'walking', label: '漫步计划' },
  ],
  resources: [
    { id: 'room', label: '共享书房' },
    { id: 'garden', label: '城市花园' },
    { id: 'reserve', label: '备用空间' },
  ],
  tasks: [
    {
      id: 'read',
      label: '读一本书',
      groupId: 'reading',
      resourceId: 'room',
      start: '2026-01-15T06:00:00Z',
      end: '2026-01-15T12:00:00Z',
      timezone: 'UTC',
      facts: [{ label: '书目', value: '山间来信' }],
      locked: true,
      statusLabels: ['已留出时间'],
      segments: [
        {
          id: 'morning',
          start: '2026-01-15T06:00:00Z',
          end: '2026-01-15T08:00:00Z',
          label: '上篇',
        },
        { id: 'noon', start: '2026-01-15T10:00:00Z', end: '2026-01-15T12:00:00Z', label: '下篇' },
      ],
    },
    {
      id: 'walk',
      label: '午后漫步',
      groupId: 'walking',
      resourceId: 'garden',
      start: '2026-01-15T18:00:00+02:00',
      end: '2026-01-15T22:00:00+02:00',
      timezone: 'Europe/Helsinki',
      facts: [{ label: '路线', value: '湖畔' }],
      conflictLabel: '同行时间待确认',
    },
  ],
  links: [{ id: 'read-walk', source: 'read', target: 'walk' }],
  windows: [
    {
      id: 'reserved',
      laneId: 'reading',
      label: '阅读保留时段',
      start: '2026-01-15T00:00:00Z',
      end: '2026-01-15T08:00:00Z',
    },
  ],
}
const model = shallowRef<NvScheduleVisualModel>(initial)
const selectedId = shallowRef<string>()
const selected = computed(() => model.value.tasks.find((task) => task.id === selectedId.value))
const view = shallowRef<'task' | 'resource'>('task')
const narrow = shallowRef(false)
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
function restore() {
  model.value = initial
  selectedId.value = undefined
}
function replace() {
  model.value = {
    ...initial,
    resources: [
      { id: 'room', label: '窗边书房' },
      { id: 'garden', label: '河畔步道' },
    ],
    tasks: [
      {
        ...initial.tasks[0]!,
        label: '重读一封信',
        attentionLabel: '借阅时间待确认',
        locked: false,
        facts: [{ label: '书目', value: '远方计划' }],
        segments: [
          {
            id: 'afternoon',
            start: '2026-01-15T09:00:00Z',
            end: '2026-01-15T12:00:00Z',
            label: '续篇',
          },
        ],
      },
      {
        ...initial.tasks[1]!,
        label: '沿河走走',
        conflictLabel: undefined,
        facts: [{ label: '路线', value: '河畔' }],
      },
    ],
    links: [{ id: 'new-link', source: 'read', target: 'walk' }],
    windows: [],
  }
}
const routes = [
  ['desktop', '桌面演示'],
  ['touch', '触屏演示'],
  ['mobile', '随行手记'],
  ['mobile-input', '随心记录'],
  ['mobile-overlays', '片刻安排'],
  ['mobile-lists', '翻阅时光'],
  ['mobile-feedback', '片刻回响'],
  ['files', '留住片刻'],
  ['screen/stage', '空间舞台'],
  ['screen/layout', '城市光影'],
  ['screen/controls', '随心安排'],
  ['screen/indicators', '阅读与到访'],
  ['screen/data', '流动消息'],
  ['screen/charts', '内容与到访'],
  ['screen/tables', '清单与事件'],
  ['screen/summary', '空间使用概况'],
]
</script>

<template>
  <a href="#schedule-gantt" class="inline-flex min-h-11 items-center px-4 underline"
    >真实只读甘特图</a
  >
  <NvApp>
    <main class="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <nav
        aria-label="显示表面"
        class="flex flex-wrap gap-x-4 text-sm text-muted-foreground underline"
      >
        <a
          v-for="[hash, label] in routes"
          :key="hash"
          :href="`#${hash}`"
          class="inline-flex min-h-11 items-center"
          >{{ label }}</a
        >
      </nav>
      <header class="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">给片刻留个位置</h1>
          <p class="mt-2 text-sm text-muted-foreground">
            读书、散步，为喜欢的事留出时间。点选一项，看看安排。
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NvButton variant="outline" :aria-pressed="isDark" @click="toggle">{{
            isDark ? '切换亮色' : '切换暗色'
          }}</NvButton
          ><NvButton
            variant="outline"
            :aria-pressed="theme === 'blue'"
            @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
            >蓝色强调色</NvButton
          >
        </div>
      </header>
      <div class="flex flex-wrap gap-2" aria-label="查看安排">
        <NvButton
          variant="outline"
          :aria-pressed="view === 'resource'"
          @click="view = view === 'task' ? 'resource' : 'task'"
          >{{ view === 'task' ? '按空间查看' : '按计划查看' }}</NvButton
        >
        <NvButton variant="outline" :aria-pressed="narrow" @click="narrow = !narrow">{{
          narrow ? '展开容器' : '收窄容器'
        }}</NvButton>
        <NvButton variant="outline" @click="replace">换个安排</NvButton>
        <NvButton
          variant="outline"
          @click="model = { ...initial, tasks: [], links: [], windows: [] }"
          >清空安排</NvButton
        >
        <NvButton variant="outline" @click="restore">恢复安排</NvButton>
      </div>
      <p data-selection role="status" class="text-sm">
        {{ selected ? `已选择 ${selected.label} · ${selected.id}` : '尚未选择' }}
      </p>
      <div :style="{ maxWidth: narrow ? '560px' : '100%' }">
        <NvScheduleTimeline
          :model="model"
          :view="view"
          scale="day"
          :lane-label="view === 'task' ? '计划 / 任务' : '空间 / 任务'"
          @task-select="selectedId = $event"
        />
      </div>
      <p class="text-sm text-muted-foreground">
        仅查看与选择。时间轴按 UTC 实刻对齐；每项安排标明其展示时区。
      </p>
    </main>
  </NvApp>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { SchedulingDaySchedule, type SchedulingDayEntry } from '@nerv-iip/scheduling'
import { NvButton, useColorMode } from '@nerv-iip/ui'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const date = ref('2026-11-02')
const groupId = ref('all')
const readOnly = ref(false)
const library: readonly SchedulingDayEntry[] = [
  {
    semanticKey: 'late-reading',
    assignmentId: 'slot-late-1',
    label: '夜读',
    orderLabel: '秋日共读',
    operationLabel: '开卷',
    operationSequence: 1,
    groupId: 'hall',
    groupLabel: '活动厅',
    resourceLabel: '主厅',
    startUtc: '2026-11-01T15:00:00Z',
    endUtc: '2026-11-02T16:00:00Z',
    segments: [
      { startUtc: '2026-11-01T15:00:00Z', endUtc: '2026-11-01T17:00:00Z' },
      { startUtc: '2026-11-02T14:00:00Z', endUtc: '2026-11-02T16:00:00Z' },
    ],
    quantity: 0,
    unit: '人',
  },
  {
    semanticKey: 'closing',
    assignmentId: 'slot-close-1',
    label: '闭馆整理',
    groupId: 'hall',
    groupLabel: '活动厅',
    startUtc: '2026-11-01T15:30:00Z',
    endUtc: '2026-11-01T16:00:00Z',
  },
  {
    semanticKey: 'morning-reading',
    assignmentId: 'slot-morning-1',
    label: '晨间共读',
    groupId: 'room',
    groupLabel: '阅读室',
    resourceLabel: '南侧书桌',
    startUtc: '2026-11-02T01:00:00Z',
    endUtc: '2026-11-02T03:00:00Z',
    quantity: 12,
    unit: '人',
  },
]
const studio: readonly SchedulingDayEntry[] = [
  {
    semanticKey: 'night-making',
    assignmentId: 'slot-studio-1',
    label: '夜间创作',
    orderLabel: '陶艺工作坊',
    operationLabel: '成形',
    operationSequence: 2,
    groupId: 'craft',
    groupLabel: '创作室',
    resourceLabel: '长桌',
    startUtc: '2026-11-01T15:00:00Z',
    endUtc: '2026-11-02T02:00:00Z',
    quantity: 8,
    unit: '人',
  },
  {
    semanticKey: 'afternoon-making',
    assignmentId: 'slot-studio-2',
    label: '午后速写',
    groupId: 'paint',
    groupLabel: '画室',
    startUtc: '2026-11-02T05:00:00Z',
    endUtc: '2026-11-02T07:00:00Z',
  },
]
const entries = shallowRef<readonly SchedulingDayEntry[]>(
  props.venue === 'library' ? library : studio,
)
const title = props.venue === 'library' ? '读书会日安排' : '工作坊日安排'
function replace() {
  entries.value = entries.value.map((entry) =>
    entry.semanticKey === (props.venue === 'library' ? 'morning-reading' : 'afternoon-making')
      ? { ...entry, assignmentId: `${entry.assignmentId}-new`, label: `${entry.label} · 已调整` }
      : entry,
  )
}
function restoreDay() {
  date.value = '2026-11-02'
  groupId.value = 'all'
}
</script>

<template>
  <main class="mx-auto max-w-6xl space-y-4 p-5 text-foreground">
    <nav aria-label="安排页面" class="flex flex-wrap gap-3 text-sm underline">
      <a href="#">首页</a><a href="#schedule">时间安排</a><a href="#schedule-gantt">只读甘特</a>
      <a href="#schedule-request/library">项目请求</a><a href="#schedule-async/library">异步候选</a>
      <a href="#schedule-compare/library">安排对照</a
      ><a href="#schedule-snapshot/library">风险核对</a>
      <a href="#schedule-draft/library">安排草案</a><a href="#schedule-panels/library">安排详情</a>
      <a href="#schedule-day/library">读书会日安排</a
      ><a href="#schedule-day/studio">工作坊日安排</a>
    </nav>
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p class="text-sm text-muted-foreground">
        本页内存安排用于查看日期筛选与打印样式；未连接实际排程计算或保存。
      </p>
      <p class="text-sm">
        日期按 Asia/Shanghai 日历日筛选，起止时刻显示到分钟。结束恰好在午夜的安排只属于前一日。
      </p>
    </header>
    <div class="flex flex-wrap gap-2" aria-label="本页安排设置">
      <NvButton variant="outline" data-fixture="next-day" @click="date = '2026-11-03'"
        >查看下一日</NvButton
      >
      <NvButton variant="outline" data-fixture="empty-day" @click="date = '2026-11-05'"
        >查看无安排日期</NvButton
      >
      <NvButton variant="outline" data-fixture="restore" @click="restoreDay"
        >返回有安排日期</NvButton
      >
      <NvButton variant="outline" data-fixture="replace" @click="replace"
        >接收调整后的安排</NvButton
      >
      <NvButton variant="outline" data-fixture="readonly" @click="readOnly = !readOnly">{{
        readOnly ? '允许打印' : '只读查看'
      }}</NvButton>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '浅色' : '深色' }}主题</NvButton>
    </div>
    <SchedulingDaySchedule
      :entries="entries"
      :date="date"
      :group-id="groupId"
      timezone="Asia/Shanghai"
      :title="title"
      plan-label="本页内存安排"
      status-label="未保存"
      :read-only="readOnly"
      read-only-reason="当前安排仅供查看，打印由场地方确认。"
      @update:date="date = $event"
      @update:group-id="groupId = $event"
    />
  </main>
</template>

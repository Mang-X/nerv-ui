<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { SchedulingDaySchedule, type SchedulingDayEntry } from '@nerv-iip/scheduling'
import { NvButton } from '@nerv-iip/ui'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const timezone = ref('Asia/Shanghai')
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
  <section class="mx-auto min-w-0 space-y-4 p-2 sm:p-4 text-foreground">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p class="text-sm text-muted-foreground">
        本页内存安排用于查看日期筛选与打印样式；未连接实际排程计算或保存。
      </p>
      <p class="text-sm">
        日期按所选时区的日历日筛选，起止时刻显示到分钟。结束恰好在午夜的安排只属于前一日。
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
      <label
        >安排时区<select
          v-model="timezone"
          aria-label="安排时区"
          class="rounded border bg-card p-2"
        >
          <option
            v-for="zone in ['Asia/Shanghai', 'Asia/Kolkata', 'invalid']"
            :key="zone"
            :value="zone"
          >
            {{ zone === 'invalid' ? '时区待核实' : zone }}
          </option>
        </select></label
      >
      <NvButton variant="outline" @click="date = '2026-02-30'">日期待核实</NvButton>
    </div>
    <div class="min-w-0 overflow-x-auto" tabindex="0" aria-label="日安排可滚动区域">
      <div class="min-w-[360px]">
        <SchedulingDaySchedule
          :entries="entries"
          :date="date"
          :group-id="groupId"
          :timezone="timezone"
          :title="title"
          plan-label="本页内存安排"
          status-label="未保存"
          :read-only="readOnly"
          read-only-reason="当前安排仅供查看，打印由场地方确认。"
          @update:date="date = $event"
          @update:group-id="groupId = $event"
        />
      </div>
    </div>
  </section>
</template>

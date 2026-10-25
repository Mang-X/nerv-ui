<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import {
  ResourceSchedulerBoard,
  type ScheduleModel,
  type ScheduleTask,
  type TaskDragPayload,
} from '@nerv-iip/scheduling'
import { NvButton } from '@nerv-iip/ui'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const library = props.venue === 'library'
const places = library
  ? ['晨光书房', '林间书屋', '河畔阅览室', '安静角落']
  : ['木作工坊', '陶艺工坊', '绘画工坊', '留白空间']
const teams = library ? ['共读小组', '分享小组', '自由小组'] : ['晨间小组', '午后小组', '创意小组']
const activityName = library ? '阅读与交流' : '速写与配色'
const groupBy = shallowRef('workCenter')
const readOnly = shallowRef(false)
const locked = shallowRef(false)
const visible = shallowRef(true)
const reference = shallowRef(true)
const narrow = shallowRef(false)
const policy = shallowRef('accept')
const message = shallowRef('拖动活动调整位置与时间；拖动两端调整开始或结束时间。')
const board = useTemplateRef<InstanceType<typeof ResourceSchedulerBoard>>('board')
const membership = (place: number, team: number) => ({
  workCenter: { id: `place-${place}`, label: places[place]! },
  team: { id: `team-${team}`, label: teams[team]! },
})
const activity = (
  id: string,
  text: string,
  place: number,
  team: number,
  start: number,
  end: number,
): ScheduleTask => ({
  id,
  text,
  operationId: text,
  orderId: library ? '周末共读' : '周末创作',
  operationSequence: 0,
  type: 'operation',
  timezone: 'Asia/Shanghai',
  locked: false,
  hasConflict: false,
  startUtc: `2026-10-25T${String(start).padStart(2, '0')}:00:00Z`,
  endUtc: `2026-10-25T${String(end).padStart(2, '0')}:00:00Z`,
  resourceId: `item-${place}`,
  workCenterId: `place-${place}`,
  dimensions: membership(place, team),
})
const initial: ScheduleModel = {
  tasks: [
    activity('edit', activityName, 0, 0, 2, 5),
    { ...activity('fixed', '已确定的活动', 1, 1, 3, 6), locked: true },
    {
      ...activity('parts', '分两次进行', 2, 2, 2, 10),
      segments: [
        { startUtc: '2026-10-25T02:00:00Z', endUtc: '2026-10-25T03:00:00Z' },
        { startUtc: '2026-10-25T09:00:00Z', endUtc: '2026-10-25T10:00:00Z' },
      ],
    },
    {
      ...activity('care', library ? '整理书架' : '整理工具', 3, 2, 4, 6),
      blockKind: 'maintenance',
    },
  ],
  resources: places.map((text, index) => ({
    id: `item-${index}`,
    text,
    dimensions: membership(index, Math.min(index, 2)),
  })),
  groupDimensions: [
    { key: 'workCenter', label: library ? '阅读空间' : '创作空间' },
    { key: 'team', label: '参与小组' },
  ],
  groupValues: {
    workCenter: places.map((label, index) => ({ id: `place-${index}`, label })),
    team: teams.map((label, index) => ({ id: `team-${index}`, label })),
  },
  horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
  links: [],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  timezones: ['Asia/Shanghai'],
  meta: { planId: props.venue, status: 'preview', algorithmVersion: 'example' },
}
const authority = shallowRef(initial)
const model = computed(() => ({
  ...authority.value,
  tasks: authority.value.tasks.map((t) => (t.id === 'edit' ? { ...t, locked: locked.value } : t)),
}))
const current = computed(() => model.value.tasks.find((t) => t.id === 'edit')!)
const format = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const time = (t: { startUtc: string; endUtc: string }) =>
  `${format.format(new Date(t.startUtc))} 至 ${format.format(new Date(t.endUtc))}`
const location = (t: ScheduleTask) =>
  `${t.dimensions?.workCenter?.label ?? '空间待定'} · ${t.dimensions?.team?.label ?? '小组待定'}`
const records = shallowRef<
  {
    activity: string
    action: string
    before: string
    proposed: string
    result: string
    final: string
  }[]
>([])
function replace() {
  authority.value = {
    ...authority.value,
    tasks: authority.value.tasks.map((t) =>
      t.id === 'edit'
        ? {
            ...t,
            startUtc: '2026-10-25T08:00:00Z',
            endUtc: '2026-10-25T11:00:00Z',
            workCenterId: 'place-2',
            dimensions: membership(2, 1),
          }
        : t,
    ),
  }
  message.value = '已换为另一份活动安排。'
}
function proposed(payload: TaskDragPayload) {
  const previous = authority.value.tasks.find((t) => t.id === payload.taskId)
  if (!previous) return
  // This example explicitly accepts dimensions. It does not infer equipment,
  // eligibility, locking, persistence or a domain scheduling solution.
  const next = {
    ...previous,
    startUtc: payload.startUtc,
    endUtc: payload.endUtc,
    resourceId: payload.resourceId,
  }
  if (payload.assignment) {
    const { dimension, id, label } = payload.assignment
    next.dimensions = { ...previous.dimensions }
    if (id === null) delete next.dimensions[dimension]
    else next.dimensions[dimension] = { id, label }
    if (dimension === 'workCenter') next.workCenterId = id ?? undefined
  }
  if (policy.value === 'accept') {
    authority.value = {
      ...authority.value,
      tasks: authority.value.tasks.map((t) => (t.id === payload.taskId ? next : t)),
    }
    message.value = '已采用新的活动安排。'
  } else if (policy.value === 'replace') replace()
  else message.value = '保留原来的活动安排。'
  const final = authority.value.tasks.find((t) => t.id === payload.taskId)!
  records.value = [
    ...records.value,
    {
      activity: previous.text,
      action:
        payload.kind === 'reassign'
          ? '调整位置'
          : payload.kind === 'move'
            ? '移动时间'
            : Date.parse(previous.startUtc) === Date.parse(payload.startUtc)
              ? '调整结束时间'
              : '调整开始时间',
      before: `${location(previous)}；${time(previous)}`,
      proposed: `${location(next)}；${time(next)}`,
      result: message.value,
      final: `${location(final)}；${time(final)}`,
    },
  ]
}
function reset() {
  authority.value = initial
  locked.value = false
  readOnly.value = false
  records.value = []
  message.value = '已恢复最初安排。'
}
</script>

<template>
  <main class="min-h-screen bg-background p-5 text-foreground">
    <header class="mb-4 flex flex-wrap items-center gap-4">
      <a href="#" class="underline">桌面</a><a href="#schedule" class="underline">时间安排</a>
      <a href="#schedule-gantt" class="underline">共读活动图</a>
      <a :href="`#schedule-resources/${venue}`" class="underline">空间安排</a>
      <a :href="`#schedule-edit/${venue}`" class="underline">活动时间调整</a>
      <a
        :href="library ? '#schedule-resource-edit/studio' : '#schedule-resource-edit/library'"
        class="underline"
        >{{ library ? '去创作室' : '去书房' }}</a
      >
      <h1 class="text-xl font-semibold">{{ library ? '书房活动安排' : '创作室活动安排' }}</h1>
    </header>
    <p class="mb-3 text-sm">
      DHTMLX 9.1.4 Professional Evaluation。声明与水印保留，授权范围 UNKNOWN。
    </p>
    <p class="mb-4 text-sm text-muted-foreground">
      拖到其它空间或小组可调整位置；按 Escape
      或拖到取消区可放弃本次调整。两端只调整时间。已确定与分次进行的活动保持原安排。以下时间均为上海时间。
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-4 text-sm">
      <label
        >查看维度
        <select v-model="groupBy" aria-label="查看维度">
          <option value="workCenter">{{ library ? '阅读空间' : '创作空间' }}</option>
          <option value="team">参与小组</option>
        </select></label
      >
      <label
        >调整处理
        <select v-model="policy" aria-label="调整处理">
          <option value="accept">采用调整</option>
          <option value="reject">保留原安排</option>
          <option value="replace">改为另一安排</option>
        </select></label
      >
      <label><input v-model="readOnly" type="checkbox" /> 只读安排</label>
      <label><input v-model="locked" type="checkbox" /> 确定首项活动</label>
      <NvButton variant="outline" @click="replace">换一份安排</NvButton>
      <NvButton variant="outline" @click="reset">恢复最初安排</NvButton>
      <NvButton variant="outline" @click="visible = !visible">{{
        visible ? '收起安排' : '打开安排'
      }}</NvButton>
      <NvButton variant="outline" @click="reference = !reference">{{
        reference ? '收起对照' : '打开对照'
      }}</NvButton>
      <NvButton variant="outline" @click="narrow = !narrow">切换阅读宽度</NvButton>
      <NvButton variant="outline" @click="board?.command({ kind: 'revealTask', taskId: 'edit' })"
        >定位首项活动</NvButton
      >
    </div>
    <p role="status" class="mb-3">
      {{ readOnly ? '当前只读，可查看活动的位置与时间。' : message }}
    </p>
    <section :style="{ width: narrow ? '1000px' : '100%' }" class="max-w-full space-y-4">
      <div
        v-if="visible"
        data-seat="editing"
        class="h-[620px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <ResourceSchedulerBoard
          ref="board"
          :model="model"
          :read-only="readOnly"
          :group-by="groupBy"
          lane-order="busiest"
          scale="hour"
          @task-drag-end="proposed"
          @locked-drag-attempt="message = '这项活动已确定，请先取消确定再调整。'"
          @task-select="message = '已选择活动，可查看时间与位置。'"
        />
      </div>
      <p>
        当前首项活动：<output data-authority
          >{{ current.text }}；{{ location(current) }}；{{ time(current) }}</output
        >
      </p>
      <details>
        <summary>活动调整记录（{{ records.length }}）</summary>
        <p v-if="records.length === 0" class="my-2">暂无活动调整记录。</p>
        <ol v-else data-proposals class="space-y-3">
          <li v-for="(record, index) in records" :key="index" class="rounded-lg border p-3">
            <p class="font-medium">{{ index + 1 }}. {{ record.activity }} · {{ record.action }}</p>
            <p>调整前：{{ record.before }}</p>
            <p>本次调整：{{ record.proposed }}</p>
            <p>处理结果：{{ record.result }}</p>
            <p>当前安排：{{ record.final }}</p>
          </li>
        </ol>
      </details>
      <div
        v-if="reference"
        data-seat="reference"
        class="h-[360px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <ResourceSchedulerBoard
          :model="initial"
          :group-by="groupBy"
          lane-order="busiest"
          scale="hour"
          read-only
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import {
  ResourceSchedulerBoard,
  type ScheduleModel,
  type ScheduleTask,
  type LaneOrder,
  type TimeScale,
} from '@nerv-iip/scheduling'
import { NvButton, useColorMode, useTheme } from '@nerv-iip/ui'
import '@nerv-iip/scheduling/styles.css'
const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const groupBy = shallowRef('workCenter')
const laneOrder = shallowRef<LaneOrder>('busiest')
const scale = shallowRef<TimeScale>('hour')
const state = shallowRef('ready')
const version = shallowRef(0)
const withWindows = shallowRef(true)
const withSpare = shallowRef(true)
const visible = shallowRef(true)
const reference = shallowRef(false)
const narrow = shallowRef(false)
const selected = shallowRef('')
const board = useTemplateRef('board')
const copy = computed(() =>
  props.venue === 'library'
    ? {
        title: '书房里的相聚',
        dimension: '阅读空间',
        zero: '晨光书房',
        unknown: '林间书屋',
        over: '河畔阅览室',
        spare: '安静角落',
        care: '书架整理区',
        teamA: '共读小组',
        teamB: '分享小组',
        first: '一起读第一章',
        second: '写下阅读感受',
        third: '交换书单',
        reserved: '整理书架',
      }
    : {
        title: '创作室的一天',
        dimension: '创作空间',
        zero: '木作工坊',
        unknown: '陶艺工坊',
        over: '绘画工坊',
        spare: '留白空间',
        care: '工具整理区',
        teamA: '晨间小组',
        teamB: '午后小组',
        first: '准备创作材料',
        second: '完成作品草稿',
        third: '交流创作心得',
        reserved: '整理工具',
      },
)
const model = computed<ScheduleModel>(() => {
  const c = copy.value
  const member = (id: string, label: string, team: string, teamLabel: string) => ({
    workCenter: { id, label },
    team: { id: team, label: teamLabel },
  })
  const operation = (
    id: string,
    text: string,
    resourceId: string,
    wc: string,
    label: string,
    team: string,
    teamLabel: string,
    hour: number,
  ): ScheduleTask => ({
    id,
    orderId: props.venue === 'library' ? '共读约定' : '创作约定',
    operationId: text,
    operationSequence: 0,
    type: 'operation',
    text: text + (version.value ? ' · 已调整' : ''),
    resourceId,
    workCenterId: wc,
    dimensions: member(wc, label, team, teamLabel),
    startUtc: `2026-10-25T${String(hour).padStart(2, '0')}:00:00Z`,
    endUtc: `2026-10-25T${String(hour + 3).padStart(2, '0')}:00:00Z`,
    timezone: state.value === 'unresolved' ? '' : 'UTC',
    locked: id === 'exchange',
    hasConflict: false,
    facts: [{ label: '参与安排', value: '按约定时间到场，活动结束后一起整理' }],
  })
  const tasks = [
    operation('read', c.first, '空间-01', 'zero', c.zero, 'a', c.teamA, 8),
    operation('notes', c.second, '空间-02', '空间-03', c.unknown, 'a', c.teamA, 11),
    operation('exchange', c.third, '空间-03', 'over', c.over, 'b', c.teamB, 14),
  ]
  if (withWindows.value)
    tasks.push({
      ...operation('care', c.reserved, '空间-04', 'care', c.care, 'reserve', '整理小组', 10),
      blockKind: 'maintenance',
    })
  if (state.value === 'invalid') tasks[0]!.startUtc = '2026-10-25T08:00:00'
  const resources: ScheduleModel['resources'] = [
    {
      id: '空间-01',
      text: c.zero,
      utilization: 0,
      oee: 0,
      changeoverCount: 0,
      materialRisk: 0,
      dimensions: member('zero', c.zero, 'a', c.teamA),
    },
    { id: '空间-02', text: c.unknown, dimensions: member('空间-03', c.unknown, 'a', c.teamA) },
    {
      id: '空间-03',
      text: c.over,
      utilization: 1.25,
      oee: 0.8,
      dimensions: member('over', c.over, 'b', c.teamB),
    },
    { id: '空间-04', text: c.care, dimensions: member('care', c.care, 'reserve', '整理小组') },
  ]
  if (withSpare.value)
    resources.push({
      id: '空间-05',
      text: c.spare,
      dimensions: member('empty', c.spare, 'quiet', '自由小组'),
    })
  const groupValues = {
    workCenter: [
      { id: 'zero', label: c.zero },
      { id: '空间-03', label: c.unknown },
      { id: 'over', label: c.over },
      { id: 'care', label: c.care },
      ...(withSpare.value ? [{ id: 'empty', label: c.spare }] : []),
    ],
    team: [
      { id: 'a', label: c.teamA },
      { id: 'b', label: c.teamB },
      { id: 'reserve', label: '整理小组' },
      ...(withSpare.value ? [{ id: 'quiet', label: '自由小组' }] : []),
    ],
  }
  const empty = state.value === 'empty'
  return {
    tasks: empty ? [] : version.value % 2 ? [...tasks].reverse() : tasks,
    resources: empty ? [] : version.value % 2 ? [...resources].reverse() : resources,
    groupDimensions: [
      { key: 'workCenter', label: c.dimension },
      { key: 'team', label: '参与小组' },
    ],
    groupValues: empty ? { workCenter: [], team: [] } : groupValues,
    links: [],
    loads: [],
    conflicts: [],
    unscheduled: [],
    changes: [],
    calendars: withWindows.value
      ? [
          {
            calendarId: 'reading-hours',
            resourceIds: ['空间-01'],
            workCenterIds: [],
            shiftWindows: [
              {
                startUtc: '2026-10-25T08:00:00Z',
                endUtc: '2026-10-25T12:00:00Z',
                shiftCode: 'morning',
              },
              {
                startUtc: '2026-10-25T14:00:00Z',
                endUtc: '2026-10-25T18:00:00Z',
                shiftCode: 'afternoon',
              },
            ],
          },
        ]
      : [],
    freezeContext: withWindows.value
      ? {
          windows: [
            {
              workCenterId: '空间-03',
              startUtc: '2026-10-25T12:30:00Z',
              endUtc: '2026-10-25T13:30:00Z',
            },
          ],
        }
      : null,
    timezones: state.value === 'unresolved' ? [] : ['UTC'],
    horizon: { startUtc: '2026-10-25T06:00:00Z', endUtc: '2026-10-25T20:00:00Z' },
    meta: { planId: props.venue, status: 'generated', algorithmVersion: 'host-supplied' },
  }
})
const selectedLabel = computed(
  () => model.value.tasks.find((task) => task.id === selected.value)?.text ?? '',
)
function changeScale(direction: -1 | 1) {
  const choices = ['hour', 'day', 'week', 'month'] as const
  const current = choices.indexOf(scale.value as (typeof choices)[number])
  scale.value = choices[Math.max(0, Math.min(choices.length - 1, current + direction))]!
}
function selectedText(id: string) {
  selected.value = id
}
</script>
<template>
  <main class="min-h-screen bg-background p-5 text-foreground">
    <header class="mb-4 flex flex-wrap items-center gap-3">
      <a href="#schedule" class="underline">时间安排</a
      ><a href="#schedule-gantt" class="underline">共读活动</a
      ><a href="#" class="underline">桌面</a>
      <a :href="`#schedule-resource-edit/${venue}`" class="underline">调整活动安排</a>
      <a
        :href="venue === 'library' ? '#schedule-resources/studio' : '#schedule-resources/library'"
        class="underline"
        >{{ venue === 'library' ? '去创作室' : '去书房' }}</a
      >
      <h1 class="text-xl font-semibold">{{ copy.title }}</h1>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '浅色' : '深色' }}</NvButton>
      <NvButton variant="outline" @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
        >主题 {{ theme }}</NvButton
      >
    </header>
    <p class="mb-3 text-sm">
      DHTMLX 9.1.4 Professional Evaluation。声明与水印保留，授权范围 UNKNOWN。
    </p>
    <p class="mb-4 text-sm text-muted-foreground">
      按空间或小组查看相聚时间。利用率为 0
      表示本次记录为零，“—”表示尚无记录；超出容量单独标记。底纹只显示已提供的开放时段、整理与保留时间。
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <label
        >查看维度
        <select v-model="groupBy" aria-label="查看维度">
          <option value="workCenter">{{ copy.dimension }}</option>
          <option value="team">参与小组</option>
        </select></label
      >
      <label
        >排列方式
        <select v-model="laneOrder" aria-label="排列方式">
          <option value="busiest">活动较多优先</option>
          <option value="name">按名称</option>
          <option value="onlyScheduled">仅有活动</option>
        </select></label
      >
      <label
        >时间刻度
        <select v-model="scale" aria-label="时间刻度">
          <option value="hour">小时</option>
          <option value="day">日</option>
          <option value="week">周</option>
          <option value="month">月</option>
        </select></label
      >
      <label
        >当前安排
        <select v-model="state" aria-label="当前安排">
          <option value="ready">可查看</option>
          <option value="loading">正在载入</option>
          <option value="empty">尚无安排</option>
          <option value="unresolved">时区待确认</option>
          <option value="invalid">时间待核对</option>
        </select></label
      >
      <NvButton variant="outline" @click="version++">调整活动次序</NvButton>
      <NvButton variant="outline" @click="withSpare = !withSpare">{{
        withSpare ? '收起空闲空间' : '保留空闲空间'
      }}</NvButton>
      <NvButton variant="outline" @click="withWindows = !withWindows">{{
        withWindows ? '收起时段记录' : '显示时段记录'
      }}</NvButton>
      <NvButton variant="outline" @click="narrow = !narrow">切换阅读宽度</NvButton>
      <NvButton variant="outline" @click="reference = !reference">{{
        reference ? '收起对照' : '打开对照'
      }}</NvButton>
      <NvButton variant="outline" @click="visible = !visible">{{
        visible ? '收起安排' : '打开安排'
      }}</NvButton>
      <NvButton variant="outline" @click="changeScale(-1)">放大时间</NvButton>
      <NvButton variant="outline" @click="changeScale(1)">缩小时间</NvButton>
      <NvButton
        variant="outline"
        @click="board?.command({ kind: 'revealTask', taskId: 'exchange' })"
        >定位交流</NvButton
      >
    </div>
    <p role="status" class="mb-3 text-sm">
      已选择：{{ selectedLabel || '请在安排中选择一项活动' }}。当前为只读安排。
    </p>
    <section :style="{ width: narrow ? '760px' : '100%' }" class="max-w-full space-y-5">
      <div
        v-if="visible"
        data-seat="resources"
        class="h-[600px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <ResourceSchedulerBoard
          ref="board"
          :model="model"
          :group-by="groupBy"
          :lane-order="laneOrder"
          :scale="scale"
          :loading="state === 'loading'"
          read-only
          @task-select="selectedText"
        />
      </div>
      <div
        v-if="reference"
        data-seat="reference"
        class="h-[440px] overflow-hidden rounded-lg border border-border bg-card"
      >
        <ResourceSchedulerBoard
          :model="model"
          group-by="team"
          lane-order="busiest"
          scale="hour"
          read-only
          @task-select="selectedText"
        />
      </div>
    </section>
  </main>
</template>

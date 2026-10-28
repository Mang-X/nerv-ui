<script setup lang="ts">
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import {
  SchedulingSavedPlan,
  type LaneOrder,
  type ScheduleModel,
  type ScheduleTask,
  type SavedPlanCommercial,
  type SavedPlanLinks,
  type SavedPlanNavigateRequest,
  type SavedPlanOrdersInput,
} from '@nerv-iip/scheduling'
import { NvButton, useColorMode } from '@nerv-iip/ui'
import '@nerv-iip/scheduling/styles.css'

const props = defineProps<{ venue: 'library' | 'studio'; surface: string }>()
const { isDark, toggle } = useColorMode()
const planId = shallowRef('morning')
const selectedTaskId = shallowRef<string | null>(null)
const groupBy = shallowRef('space')
const laneOrder = shallowRef<LaneOrder>('busiest')
const state = shallowRef<'loading' | 'ready' | 'forbidden' | 'unavailable'>('ready')
const commercialMode = shallowRef<'ready' | 'forbidden' | 'unavailable' | 'empty'>('ready')
const commercial = shallowRef<SavedPlanCommercial>()
const factsVersion = shallowRef(0)
const copy = computed(() => props.venue === 'library' ? {
  title: '书房共读计划', morning: '晨间共读', afternoon: '午后交流',
  first: '共读第一章', second: '分享读书笔记', third: '交流喜欢的句子',
  spaceA: '晨光书房', spaceB: '林间书屋', teamA: '初读小组', teamB: '分享小组',
  group: '秋日读书邀请', order: '共读约定',
} : {
  title: '创作室活动计划', morning: '上午创作', afternoon: '午后展示',
  first: '准备木作材料', second: '完成作品草稿', third: '展示创作心得',
  spaceA: '木作工坊', spaceB: '绘画工坊', teamA: '晨间小组', teamB: '午后小组',
  group: '创作体验邀请', order: '创作约定',
})
const currentPlan = computed(() => `${props.venue}-${planId.value}`)
const orderId = computed(() => planId.value === 'morning' ? 'ORDER-M' : 'ORDER-A')
const model = computed<ScheduleModel>(() => {
  const c = copy.value
  const isMorning = planId.value === 'morning'
  const day = isMorning ? '2026-10-27' : '2026-10-28'
  const task = (id: string, text: string, hour: number, room: 'a' | 'b', sequence: number): ScheduleTask => ({
    id, orderId: orderId.value, operationId: `ACT-${sequence}`, operationSequence: sequence,
    type: 'operation', text: text + (factsVersion.value ? ' · 已更新' : ''),
    startUtc: `${day}T${String(hour).padStart(2, '0')}:00:00Z`,
    endUtc: `${day}T${String(hour + 2).padStart(2, '0')}:00:00Z`,
    timezone: 'Asia/Shanghai', factoryTimeLabel: 'Asia/Shanghai · 本地时间',
    resourceId: `room-${room}`, workCenterId: `room-${room}`,
    dimensions: {
      space: { id: `space-${room}`, label: room === 'a' ? c.spaceA : c.spaceB },
      team: { id: `team-${room}`, label: room === 'a' ? c.teamA : c.teamB },
    },
    locked: false, hasConflict: false,
    facts: [{ label: '活动安排', value: factsVersion.value ? '参加者已收到更新说明' : '活动结束后一起整理空间' }],
  })
  const tasks = [
    task('shared-id', isMorning ? c.first : c.third, 1, 'a', 10),
    task('second', isMorning ? c.second : c.first, 4, 'b', 20),
  ]
  return {
    tasks, resources: [
      { id: 'room-a', text: c.spaceA, utilization: 0, dimensions: { space: { id: 'space-a', label: c.spaceA }, team: { id: 'team-a', label: c.teamA } } },
      { id: 'room-b', text: c.spaceB, dimensions: { space: { id: 'space-b', label: c.spaceB }, team: { id: 'team-b', label: c.teamB } } },
    ],
    groupDimensions: [{ key: 'space', label: '活动空间' }, { key: 'team', label: '参与小组' }],
    groupValues: { space: [{ id: 'space-a', label: c.spaceA }, { id: 'space-b', label: c.spaceB }], team: [{ id: 'team-a', label: c.teamA }, { id: 'team-b', label: c.teamB }] },
    links: [], loads: [], conflicts: [], unscheduled: [], changes: [],
    horizon: { startUtc: `${day}T00:00:00Z`, endUtc: `${day}T09:00:00Z` },
    timezones: ['Asia/Shanghai'],
    meta: { planId: currentPlan.value, status: 'generated', algorithmVersion: 'local-example' },
  }
})
const orders = computed<SavedPlanOrdersInput>(() => ({
  planId: currentPlan.value,
  rows: [{
    orderId: orderId.value, label: copy.value.order,
    statusLabel: '已安排', progress: { state: 'known', completed: 0, planned: 2 },
    taskRefs: model.value.tasks.map(task => ({ taskId: task.id, orderId: task.orderId, operationId: task.operationId })),
  }],
}))
const links = computed<SavedPlanLinks>(() => ({
  planId: currentPlan.value,
  items: [{ orderId: orderId.value, target: `#schedule-saved/${props.venue}/order/${orderId.value}` }],
}))
let timer: ReturnType<typeof setTimeout> | undefined
let generation = 0
function loadCommercial() {
  generation += 1
  const request = generation
  if (timer) clearTimeout(timer)
  commercial.value = { planId: currentPlan.value, state: 'loading' }
  const requestedPlan = currentPlan.value
  const requestedOrder = orderId.value
  const requestedMode = commercialMode.value
  const requestedGroup = copy.value.group
  timer = setTimeout(() => {
    if (request !== generation) return
    commercial.value = requestedMode === 'ready'
      ? { planId: requestedPlan, state: 'ready', groups: [{ key: `invite-${requestedPlan}`, label: requestedGroup, orderIds: [requestedOrder], target: `#schedule-saved/${props.venue}/group/${requestedPlan}` }] }
      : requestedMode === 'empty' ? { planId: requestedPlan, state: 'ready', groups: [] }
        : { planId: requestedPlan, state: requestedMode }
    timer = undefined
  }, 220)
}
watch([currentPlan, commercialMode], loadCommercial, { immediate: true })
onUnmounted(() => { generation += 1; if (timer) clearTimeout(timer) })
function choosePlan(value: 'morning' | 'afternoon') {
  planId.value = value
  selectedTaskId.value = null
  state.value = 'ready'
}
function navigate(request: SavedPlanNavigateRequest) { window.location.hash = request.target }
function openDetail(id: string) { window.location.hash = `#schedule-saved/${props.venue}/plan/${id}` }
const destination = computed(() => {
  const suffix = props.surface.split('/').slice(2)
  if (suffix[0] === 'order') return `工单 ${suffix[1]} · 本地示例详情`
  if (suffix[0] === 'group') return `关联分组 ${suffix[1]} · 本地示例详情`
  if (suffix[0] === 'plan') return `计划 ${currentPlan.value} · 本地示例详情`
  return ''
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
      <nav class="flex flex-wrap gap-4 text-sm">
        <a href="#" class="text-primary underline">桌面</a>
        <a href="#schedule-resources/library" class="text-primary underline">资源安排</a>
        <a href="#schedule-panels/library" class="text-primary underline">活动面板</a>
        <a :href="`#schedule-saved/${venue === 'library' ? 'studio' : 'library'}`" class="text-primary underline">{{ venue === 'library' ? '创作室' : '书房' }}已保存计划</a>
      </nav>
      <NvButton size="sm" variant="outline" type="button" @click="toggle">{{ isDark ? '浅色' : '深色' }}主题</NvButton>
    </header>
    <main class="mx-auto max-w-[92rem] space-y-4 p-5">
      <div>
        <h1 class="text-2xl font-semibold">{{ copy.title }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">本地示例数据。计划、关联分组与工单详情均由当前页面提供，未连接计划服务。</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <span class="text-sm font-medium">已保存计划</span>
        <NvButton size="sm" type="button" :variant="planId === 'morning' ? 'default' : 'outline'" @click="choosePlan('morning')">{{ copy.morning }}</NvButton>
        <NvButton size="sm" type="button" :variant="planId === 'afternoon' ? 'default' : 'outline'" @click="choosePlan('afternoon')">{{ copy.afternoon }}</NvButton>
        <span class="mx-2 text-muted-foreground">|</span>
        <NvButton size="sm" type="button" variant="outline" @click="factsVersion++">更新活动事实</NvButton>
        <NvButton size="sm" type="button" variant="outline" @click="state = state === 'forbidden' ? 'ready' : 'forbidden'">{{ state === 'forbidden' ? '恢复计划读取' : '计划无权' }}</NvButton>
        <NvButton size="sm" type="button" variant="outline" @click="state = state === 'unavailable' ? 'ready' : 'unavailable'">{{ state === 'unavailable' ? '恢复计划读取' : '计划暂不可读' }}</NvButton>
        <select v-model="commercialMode" aria-label="关联分组状态" class="rounded border bg-card px-2 py-1 text-sm">
          <option value="ready">有关联</option><option value="empty">无关联</option><option value="forbidden">无权</option><option value="unavailable">暂不可读</option>
        </select>
      </div>
      <p v-if="destination" role="status" class="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">{{ destination }} <a :href="`#schedule-saved/${venue}`" class="ml-2 text-primary underline">返回计划</a></p>
      <SchedulingSavedPlan
        :plan-id="currentPlan" :model="model" :state="state" :orders="orders" :commercial="commercial" :links="links"
        v-model:selected-task-id="selectedTaskId" v-model:group-by="groupBy" v-model:lane-order="laneOrder"
        :plan-label="planId === 'morning' ? copy.morning : copy.afternoon" plan-status-label="已保存 · 只读" plan-range-label="Asia/Shanghai · 本地时间"
        :on-navigate="navigate" :on-open-plan-detail="openDetail"
      />
    </main>
  </div>
</template>

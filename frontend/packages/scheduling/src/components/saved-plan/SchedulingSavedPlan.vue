<script setup lang="ts">
import { computed, nextTick, shallowRef, watch } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import ResourceSchedulerBoard from '../ResourceSchedulerBoard.vue'
import ConflictPanel from '../panels/ConflictPanel.vue'
import UnscheduledPanel from '../panels/UnscheduledPanel.vue'
import SchedulingLegend from '../panels/SchedulingLegend.vue'
import SchedulingToolbar from '../panels/SchedulingToolbar.vue'
import TaskDetailPanel from '../panels/TaskDetailPanel.vue'
import MaterialShortageSummary from '../snapshot/MaterialShortageSummary.vue'
import type { SnapshotShortage, SnapshotSource } from '../snapshot/snapshot'
import type { LaneOrder, ScheduleModel, ScheduleTask, TimeScale } from '../../model/types'
import SavedPlanOrders from './SavedPlanOrders.vue'
import SavedPlanWorkOrderLink from './SavedPlanWorkOrderLink.vue'
import type {
  SavedPlanCommercial,
  SavedPlanLinks,
  SavedPlanNavigateRequest,
  SavedPlanOrders as OrdersInput,
} from './types'

const props = withDefaults(
  defineProps<{
    planId: string
    model?: ScheduleModel
    state?: 'loading' | 'ready' | 'forbidden' | 'unavailable'
    orders?: OrdersInput
    commercial?: SavedPlanCommercial
    links?: SavedPlanLinks
    selectedTaskId?: string | null
    groupBy: string
    laneOrder?: LaneOrder
    /** Host facts include optional KPI, validity and unrenderable-row notices. */
    summary?: {
      planId: string
      facts: readonly { label: string; value: string | number | null }[]
      notices?: readonly string[]
    }
    categories?: { key: string; label: string }[]
    planLabel?: string
    planStatusLabel?: string
    planRangeLabel?: string
    /** Host-formatted snapshot; never interpreted as current inventory. */
    shortages?: { planId: string; source: SnapshotSource; rows: readonly SnapshotShortage[] }
    onNavigate?: (request: SavedPlanNavigateRequest) => void | Promise<void>
    onOpenPlanDetail?: (planId: string) => void | Promise<void>
  }>(),
  { state: 'ready', laneOrder: 'busiest' },
)
defineSlots<{ actions(props: { planId: string }): unknown }>()
const emit = defineEmits<{
  'update:selectedTaskId': [taskId: string | null]
  'update:groupBy': [groupBy: string]
  'update:laneOrder': [laneOrder: LaneOrder]
}>()

const currentModel = computed(() =>
  props.state === 'ready' && props.model?.meta.planId === props.planId ? props.model : undefined,
)
const selectionPlan = shallowRef(props.selectedTaskId ? props.planId : '')
const selectedTask = computed(() =>
  selectionPlan.value === props.planId
    ? currentModel.value?.tasks.find((task) => task.id === props.selectedTaskId)
    : undefined,
)
const board = shallowRef<InstanceType<typeof ResourceSchedulerBoard>>()
const boardEpoch = shallowRef(0)
const scale = shallowRef<TimeScale>('auto')
const search = shallowRef('')
const sideOpen = shallowRef(true)
const searchMatches = computed(() => {
  const q = search.value.trim().toLocaleLowerCase()
  if (!q) return [] as ScheduleTask[]
  return (currentModel.value?.tasks ?? []).filter(
    (task) =>
      task.type === 'operation' &&
      !task.blockKind &&
      [
        task.orderId,
        task.operationId,
        task.text,
        task.resourceId,
        task.workCenterId,
        ...Object.values(task.dimensions ?? {}).map((value) => value.label),
        task.product,
      ].some((value) => value?.toLocaleLowerCase().includes(q)),
  )
})
const matchIndex = computed(
  () => searchMatches.value.findIndex((task) => task.id === selectedTask.value?.id) + 1,
)
const vendorReady = computed(() => board.value?.engineName === 'dhtmlx')
const viewMessage = computed(() => {
  if (props.state === 'loading') return '正在读取已保存计划'
  if (props.state === 'forbidden') return '无权读取该计划'
  if (props.state === 'unavailable') return '计划暂不可读取'
  if (!props.model) return '请选择已保存计划'
  if (props.model.meta.planId !== props.planId) return '正在等待所选计划的数据'
  return ''
})
const currentShortages = computed(() =>
  props.shortages?.planId === props.planId ? props.shortages : undefined,
)
const currentSummary = computed(() =>
  props.summary?.planId === props.planId ? props.summary : undefined,
)
const openPlanDetail = computed(() => {
  const navigate = props.onOpenPlanDetail
  const planId = props.planId
  return navigate ? () => navigate(planId) : undefined
})
const selectedConflicts = computed(
  () =>
    currentModel.value?.conflicts.filter((item) => item.taskId === selectedTask.value?.id) ?? [],
)
const selectedLink = computed(() =>
  props.links?.planId === props.planId && selectedTask.value
    ? props.links.items.find((item) => item.orderId === selectedTask.value?.orderId)?.target
    : undefined,
)

// Selection is always the parent's accepted value. A stale identifier is never displayed.
let lastInvalid = ''
watch(
  [() => props.planId, () => props.selectedTaskId, currentModel],
  ([planId, taskId, model]) => {
    const invalid = taskId && (!model || !model.tasks.some((task) => task.id === taskId))
    const key = invalid ? `${planId}\u0000${taskId}` : ''
    if (key) selectionPlan.value = ''
    if (key && key !== lastInvalid) emit('update:selectedTaskId', null)
    lastInvalid = key || ''
  },
  { immediate: true, deep: true },
)
watch(
  () => props.selectedTaskId,
  (taskId) => {
    selectionPlan.value = taskId ? props.planId : ''
  },
)
watch(selectedTask, (task, previous) => {
  if (!task && previous) boardEpoch.value++
})
watch(
  () => props.planId,
  () => {
    selectionPlan.value = ''
    if (props.selectedTaskId) emit('update:selectedTaskId', null)
    search.value = ''
    sideOpen.value = true
  },
)
watch([search, currentModel, vendorReady], () => {
  if (vendorReady.value)
    board.value?.command({
      kind: 'setSearchHighlight',
      taskIds: searchMatches.value.map((task) => task.id),
    })
})
watch(
  [selectedTask, vendorReady, () => props.groupBy, () => props.laneOrder],
  async ([task, ready]) => {
    if (!task) return
    if (!ready) return
    await nextTick()
    if (task.id !== selectedTask.value?.id || !vendorReady.value) return
    board.value?.command({ kind: 'selectTask', taskId: task.id })
    board.value?.command({ kind: 'revealTask', taskId: task.id })
  },
  { flush: 'post' },
)
function propose(taskId: string) {
  if (selectedTask.value?.id === taskId) return
  if (!currentModel.value?.tasks.some((task) => task.id === taskId)) return
  emit('update:selectedTaskId', taskId)
  nextTick(() => {
    if (selectedTask.value?.id !== taskId) boardEpoch.value++
  })
}
function moveMatch(delta: number) {
  const matches = searchMatches.value
  if (!matches.length) return
  const current = matchIndex.value - 1
  const next = current < 0 ? 0 : (current + delta + matches.length) % matches.length
  propose(matches[next]!.id)
}
function updateSearch(value: string) {
  search.value = value
  const q = value.trim().toLocaleLowerCase()
  if (!q) return
  const match = (currentModel.value?.tasks ?? []).find(
    (task) =>
      task.type === 'operation' &&
      !task.blockKind &&
      [
        task.orderId,
        task.operationId,
        task.text,
        task.resourceId,
        task.workCenterId,
        ...Object.values(task.dimensions ?? {}).map((value) => value.label),
        task.product,
      ].some((field) => field?.toLocaleLowerCase().includes(q)),
  )
  if (match) propose(match.id)
}
function command(kind: 'zoomIn' | 'zoomOut' | 'scrollToToday' | 'fitToScreen') {
  if (vendorReady.value) board.value?.command({ kind })
}
</script>

<template>
  <section class="grid gap-3" data-testid="scheduling-saved-plan">
    <div
      v-if="viewMessage"
      role="status"
      class="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground"
    >
      {{ viewMessage }}
    </div>
    <template v-else-if="currentModel">
      <header
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4"
      >
        <div>
          <h2 class="text-sm font-semibold">{{ planLabel || '已保存计划' }}</h2>
          <p class="text-sm text-muted-foreground">
            {{ planStatusLabel || '只读'
            }}<span v-if="planRangeLabel"> · {{ planRangeLabel }}</span>
          </p>
          <p class="font-mono text-xs text-muted-foreground">{{ planId }}</p>
        </div>
        <SavedPlanWorkOrderLink
          v-if="onOpenPlanDetail"
          label="查看计划明细"
          :target="planId"
          action="group-link"
          :request="{ kind: 'group', planId, groupKey: planId }"
          :navigate="openPlanDetail"
        />
        <slot name="actions" :plan-id="planId" />
      </header>
      <dl v-if="currentSummary" class="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div v-for="fact in currentSummary.facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value ?? '—' }}</dd>
        </div>
      </dl>
      <p v-for="notice in currentSummary?.notices" :key="notice" role="status">{{ notice }}</p>
      <MaterialShortageSummary
        v-if="currentShortages"
        :display="currentShortages.rows"
        :source="currentShortages.source"
      />
      <SchedulingLegend
        :model="currentModel"
        view="resource"
        :scale="scale"
        :group-by="groupBy"
        :lane-order="laneOrder"
        :toggleable-groups="[]"
        :categories="categories"
      />
      <div class="flex flex-col gap-3 xl:h-[36rem] xl:flex-row">
        <SavedPlanOrders
          v-if="sideOpen"
          :plan-id="planId"
          :model="currentModel"
          :orders="orders"
          :commercial="commercial"
          :links="links"
          :selected-task-id="selectedTask?.id"
          :navigate="onNavigate"
          @select="propose"
        />
        <div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
          <div class="flex items-center justify-between gap-2 border-b px-3 py-2">
            <span class="text-sm font-medium">资源时间轴</span>
            <NvButton
              type="button"
              variant="outline"
              size="sm"
              data-action="toggle-side"
              :aria-expanded="sideOpen"
              @click="sideOpen = !sideOpen"
              >{{ sideOpen ? '收起工单侧栏' : '展开工单侧栏' }}</NvButton
            >
          </div>
          <SchedulingToolbar
            :scale="scale"
            :read-only="true"
            :can-undo="false"
            :can-redo="false"
            :dirty="false"
            :busy="false"
            :can-edit="false"
            :can-repreview="false"
            :can-release="false"
            :group-dimensions="currentModel.groupDimensions ?? []"
            :group-by="groupBy"
            :lane-order="laneOrder"
            searchable
            :search="search"
            :match-count="searchMatches.length"
            :match-index="matchIndex"
            search-placeholder="搜工单 / 活动 / 资源"
            :disabled-reasons="
              vendorReady
                ? {}
                : {
                    scale: '图面尚未就绪，当前仅可只读查看',
                    zoomIn: '图面尚未就绪',
                    zoomOut: '图面尚未就绪',
                    today: '图面尚未就绪',
                    fit: '图面尚未就绪',
                  }
            "
            @scale-change="scale = $event"
            @group-change="emit('update:groupBy', $event)"
            @lane-order-change="emit('update:laneOrder', $event)"
            @zoom-in="command('zoomIn')"
            @zoom-out="command('zoomOut')"
            @today="command('scrollToToday')"
            @fit="command('fitToScreen')"
            @update:search="updateSearch"
            @search-prev="moveMatch(-1)"
            @search-next="moveMatch(1)"
          />
          <p v-if="search && !vendorReady" class="px-4 py-1 text-xs text-muted-foreground">
            可从匹配列表查看详情；图面尚未就绪，未定位活动。
          </p>
          <div
            class="min-h-[18rem] flex-1 p-2"
            data-testid="saved-plan-board"
            :data-group="groupBy"
          >
            <ResourceSchedulerBoard
              ref="board"
              :key="`${planId}:${boardEpoch}`"
              :model="currentModel"
              :scale="scale"
              :read-only="true"
              :group-by="groupBy"
              :lane-order="laneOrder"
              @task-select="propose"
            />
          </div>
        </div>
        <aside
          v-if="selectedTask"
          aria-label="活动详情"
          data-testid="saved-plan-detail"
          class="max-h-[34rem] overflow-y-auto rounded-lg border bg-card xl:w-[21rem] xl:flex-none"
        >
          <div class="flex items-center justify-between px-4 pt-3">
            <h3 class="text-sm font-semibold">
              {{
                selectedTask.blockKind
                  ? '资源时间块'
                  : selectedTask.type === 'order'
                    ? '工单详情'
                    : '活动详情'
              }}
            </h3>
            <NvButton
              type="button"
              variant="ghost"
              size="sm"
              @click="emit('update:selectedTaskId', null)"
              >关闭详情</NvButton
            >
          </div>
          <TaskDetailPanel :task="selectedTask" :read-only="true" />
          <ConflictPanel
            v-if="selectedConflicts.length"
            :conflicts="selectedConflicts"
            @select="propose"
          />
          <div v-if="!selectedTask.blockKind" class="px-4 py-3 text-sm">
            <SavedPlanWorkOrderLink
              :label="`工单 ${selectedTask.orderId}`"
              :target="selectedLink"
              :navigate="onNavigate"
              action="task-link"
              :request="{
                kind: 'task',
                planId,
                taskId: selectedTask.id,
                orderId: selectedTask.orderId,
              }"
            />
          </div>
        </aside>
      </div>
      <UnscheduledPanel
        v-if="currentModel.unscheduled.length"
        :items="currentModel.unscheduled"
        read-only
      />
    </template>
  </section>
</template>

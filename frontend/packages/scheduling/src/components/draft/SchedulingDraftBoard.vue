<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import SchedulingDraftClearDialog from './SchedulingDraftClearDialog.vue'
import SchedulingDraftFeedback from './SchedulingDraftFeedback.vue'
import { actionFailureMessage } from './action-feedback'
import { cloneModel } from '../../model/clone'
import GanttChart from '../GanttChart.vue'
import ResourceSchedulerBoard from '../ResourceSchedulerBoard.vue'
import TaskDetailPanel from '../panels/TaskDetailPanel.vue'
import TaskFacts from '../panels/TaskFacts.vue'
import SchedulingLegend from '../panels/SchedulingLegend.vue'
import SchedulingToolbar from '../panels/SchedulingToolbar.vue'
import { factoryTimeInput, factoryTimeInstant } from '../../model/factory-time'
import type { ScheduleModel, ScheduleTask, DraftFeedback, TimeScale } from '../../model/types'
import type { EngineCommand, TaskDragPayload } from '../../engine/engine'
import type {
  SchedulingDraftAction,
  SchedulingDraftActionError,
  SchedulingDraftErrorFormatter,
  SchedulingDraftPatch,
  SchedulingDraftPendingItem,
} from './types'

const props = defineProps<{
  clear?: SchedulingDraftAction
  save?: SchedulingDraftAction
  formatActionError?: SchedulingDraftErrorFormatter
  model?: ScheduleModel
  selectedTaskId?: string
  feedback?: DraftFeedback
  pendingOperations?: SchedulingDraftPendingItem[]
  readOnly?: boolean
  pending?: boolean
  canUndo?: boolean
  canRedo?: boolean
  dirty?: boolean
  title?: string
  groupBy?: string
}>()
const emit = defineEmits<{
  'update:selectedTaskId': [taskId: string]
  'update:groupBy': [groupBy: string]
  move: [payload: TaskDragPayload]
  update: [taskId: string, patch: SchedulingDraftPatch]
  lock: [taskId: string, locked: boolean]
  lockedAttempt: [taskId: string]
  moveToPending: [taskId: string]
  restorePending: [taskId: string]
  actionError: [failure: SchedulingDraftActionError]
  cleared: []
  undo: []
  redo: []
}>()
const view = shallowRef<'gantt' | 'resource' | 'table'>('gantt')
const scale = shallowRef<TimeScale>('hour')
const selectionReset = shallowRef(0)
// A fresh model envelope clears vendor-native selection through its existing data path,
// without retiring the active chart while the user's pointer sequence is in progress.
const graphModel = computed(() => {
  void selectionReset.value
  return props.model ? { ...props.model } : undefined
})
let syncingSelection = false
const localSelected = shallowRef('')
const selectedId = computed(() => props.selectedTaskId ?? localSelected.value)
const selected = computed(() => props.model?.tasks.find((t) => t.id === selectedId.value))
const operations = computed(
  () => props.model?.tasks.filter((t) => t.type === 'operation' && !t.blockKind) ?? [],
)
// Join feedback to the current model by task.id; stale or orphan feedback is never reassigned.
const feedbackTasks = computed(() =>
  (props.model?.tasks ?? []).flatMap((task) => {
    const issues = props.feedback?.tasks[task.id]?.issues ?? []
    return issues.length ? [{ task, issues }] : []
  }),
)
const attentionCount = computed(
  () =>
    feedbackTasks.value.filter(({ issues }) => issues.some((issue) => issue.kind !== 'unknown'))
      .length,
)
const unknownCount = computed(
  () =>
    feedbackTasks.value.filter(({ issues }) => issues.some((issue) => issue.kind === 'unknown'))
      .length,
)
const clearOpen = shallowRef(false)
const clearPending = shallowRef(false)
const clearScope = computed(() => ({
  model: props.model,
  pendingOperations: props.pendingOperations,
}))
const clearAction = computed(() =>
  props.clear && props.model
    ? (control: Parameters<SchedulingDraftAction>[1]) =>
        props.clear!(cloneModel(props.model!), control)
    : undefined,
)
const savePending = shallowRef(false)
const saveStatus = shallowRef('')
let saveController: AbortController | undefined
let disposed = false
function cancelSave() {
  saveController?.abort()
  saveController = undefined
  savePending.value = false
  saveStatus.value = ''
}
watch(() => [props.model, props.pendingOperations, props.save, props.readOnly], cancelSave, {
  deep: true,
  flush: 'sync',
})
onBeforeUnmount(() => {
  disposed = true
  cancelSave()
})
const disabled = computed(() =>
  Boolean(props.readOnly || props.pending || savePending.value || clearPending.value),
)
async function saveDraft() {
  if (disabled.value || !props.model || disposed) return
  if (!props.save) {
    saveStatus.value = '尚未提供保存方式，草案仍保留。'
    return
  }
  const controller = new AbortController()
  saveController = controller
  savePending.value = true
  saveStatus.value = '正在保存草案…'
  const current = () => !disposed && saveController === controller && !controller.signal.aborted
  try {
    const result = await props.save(cloneModel(props.model), {
      signal: controller.signal,
      context: undefined,
    })
    if (current())
      saveStatus.value = result === true ? '草案已保存。' : '未能保存，草案仍保留，可重试。'
  } catch (error) {
    if (current()) {
      emit('actionError', { operation: 'save', error })
      if (current()) saveStatus.value = actionFailureMessage(error, 'save', props.formatActionError)
    }
  } finally {
    if (current()) {
      savePending.value = false
      saveController = undefined
    }
  }
}
const gantt = shallowRef<InstanceType<typeof GanttChart>>()
const resource = shallowRef<InstanceType<typeof ResourceSchedulerBoard>>()
const group = shallowRef('')
const actualGroup = computed(
  () =>
    props.groupBy ??
    (props.model?.groupDimensions?.some((d) => d.key === group.value)
      ? group.value
      : props.model?.groupDimensions?.[0]?.key || 'workCenter'),
)
async function changeGroup(event: Event) {
  const input = event.target as HTMLSelectElement
  const requested = input.value
  if (props.groupBy === undefined) group.value = requested
  if (requested !== actualGroup.value || props.groupBy === undefined)
    emit('update:groupBy', requested)
  await nextTick()
  input.value = actualGroup.value
}
const search = shallowRef('')
const cursor = shallowRef(0)
const errors = shallowRef<Record<string, string>>({})
const matches = computed(() =>
  operations.value.filter(
    (t) =>
      search.value.trim() &&
      [t.text, t.orderId, t.operationId, t.display?.resourceLabel].some((v) =>
        v?.toLowerCase().includes(search.value.trim().toLowerCase()),
      ),
  ),
)
function command(cmd: EngineCommand) {
  ;(view.value === 'gantt' ? gantt.value : resource.value)?.command(cmd)
}
function syncSelection() {
  syncingSelection = true
  try {
    command({ kind: 'selectTask', taskId: selected.value?.id ?? '' })
  } finally {
    syncingSelection = false
  }
}
async function select(id: string) {
  // selectTask also emits taskSelect. It is an acknowledgement, not another user request.
  if (syncingSelection || id === selectedId.value) return
  if (props.selectedTaskId === undefined) localSelected.value = id
  emit('update:selectedTaskId', id)
  await nextTick()
  if (disposed) return
  syncSelection()
  // Clear the native selection as well as the engine's visual selection, through
  // the existing model input; no engine or lifecycle implementation changes.
  if (!selected.value && id) selectionReset.value++
}
function locate(index: number) {
  if (!matches.value.length) return
  cursor.value = (index + matches.value.length) % matches.value.length
  select(matches.value[cursor.value]!.id)
  command({ kind: 'revealTask', taskId: matches.value[cursor.value]!.id })
}
watch([view, gantt, resource, selected, () => props.model], syncSelection, {
  flush: 'post',
  deep: true,
})
watch(
  () => selected.value?.id,
  (id, previous) => {
    if (!id && previous) selectionReset.value++
  },
  { flush: 'post' },
)
watch(
  [matches, gantt, resource],
  () => command({ kind: 'setSearchHighlight', taskIds: matches.value.map((t) => t.id) }),
  { flush: 'post' },
)
watch(search, () => {
  cursor.value = 0
  if (matches.value.length) locate(0)
})
watch(
  () => props.model,
  () => {
    errors.value = {}
    if (!selected.value && selectedId.value) select('')
  },
  { deep: true },
)
watch(
  () => props.model?.meta.planId,
  () => {
    select('')
    search.value = ''
    group.value = ''
    clearOpen.value = false
  },
)
function patch(task: ScheduleTask, value: SchedulingDraftPatch) {
  if (!disabled.value && !task.locked) emit('update', task.id, value)
}
async function editTime(task: ScheduleTask, field: 'startUtc' | 'endUtc', event: Event) {
  const input = event.target as HTMLInputElement
  const instant = factoryTimeInstant(input.value, task.timezone ?? '', task[field])
  const start = field === 'startUtc' ? instant : task.startUtc
  const end = field === 'endUtc' ? instant : task.endUtc
  const valid = instant && Date.parse(end!) > Date.parse(start!)
  errors.value = {
    ...errors.value,
    [task.id]: valid ? '' : '请输入时区内唯一有效且结束晚于开始的时间。',
  }
  if (valid && (task.segments?.length ?? 0) <= 1 && instant !== task[field])
    patch(task, { [field]: instant })
  await nextTick()
  const current = props.model?.tasks.find((t) => t.id === task.id)
  input.value = current ? factoryTimeInput(current[field], current.timezone ?? '') : ''
}
async function editResource(task: ScheduleTask, event: Event) {
  const input = event.target as HTMLSelectElement
  patch(task, { resourceId: input.value || undefined })
  await nextTick()
  input.value = props.model?.tasks.find((t) => t.id === task.id)?.resourceId ?? ''
}
function move(payload: TaskDragPayload) {
  const task = props.model?.tasks.find((t) => t.id === payload.taskId)
  if (!disabled.value && task && !task.locked) {
    select(task.id)
    emit('move', payload)
  }
}
function lock(id: string, locked: boolean) {
  if (!disabled.value) emit('lock', id, locked)
}
</script>

<template>
  <section class="grid gap-3 rounded-lg border bg-card p-4" data-testid="scheduling-draft-board">
    <header>
      <h2 class="text-lg font-semibold">{{ title ?? '排程草案工作区' }}</h2>
      <p class="text-sm text-muted-foreground">三个视图共享当前安排；撤销与重做只调整本地草案。</p>
    </header>
    <div class="flex flex-wrap gap-2" role="group" aria-label="安排视图">
      <NvButton
        v-for="tab in [
          ['gantt', '活动时间图'],
          ['resource', '资源安排图'],
          ['table', '表格编辑'],
        ] as const"
        :key="tab[0]"
        :aria-pressed="view === tab[0]"
        variant="outline"
        @click="view = tab[0]"
        >{{ tab[1] }}</NvButton
      >
    </div>
    <SchedulingToolbar
      :scale="scale"
      :read-only="disabled"
      :busy="Boolean(pending)"
      :dirty="Boolean(dirty)"
      :can-undo="Boolean(canUndo)"
      :can-redo="Boolean(canRedo)"
      :can-edit="false"
      :can-repreview="false"
      :can-release="false"
      searchable
      search-placeholder="搜索活动 / 资源"
      :search="search"
      :match-count="matches.length"
      :match-index="matches.length ? cursor + 1 : 0"
      @undo="!disabled && emit('undo')"
      @redo="!disabled && emit('redo')"
      @scale-change="scale = $event"
      @today="command({ kind: 'scrollToToday' })"
      @fit="command({ kind: 'fitToScreen' })"
      @zoom-in="scale = scale === 'month' ? 'week' : scale === 'week' ? 'day' : 'hour'"
      @zoom-out="scale = scale === 'hour' ? 'day' : scale === 'day' ? 'week' : 'month'"
      @update:search="search = $event"
      @search-next="locate(cursor + 1)"
      @search-prev="locate(cursor - 1)"
    />
    <div class="flex flex-wrap items-center gap-3">
      <NvButton
        variant="outline"
        :disabled="disabled || !canUndo"
        @click="!disabled && canUndo && emit('undo')"
        >撤销</NvButton
      ><NvButton
        variant="outline"
        :disabled="disabled || !canRedo"
        @click="!disabled && canRedo && emit('redo')"
        >重做</NvButton
      ><NvButton :disabled="disabled || !model" @click="saveDraft">保存草案</NvButton>
      <p role="status" data-draft-save-status class="text-sm">{{ saveStatus }}</p>
      <NvButton variant="outline" :disabled="disabled || !model" @click="clearOpen = true"
        >清空草案</NvButton
      ><slot name="actions" />
    </div>
    <SchedulingDraftClearDialog
      v-model:open="clearOpen"
      :scope-key="clearScope"
      :clear="clearAction"
      :format-action-error="formatActionError"
      @action-error="emit('actionError', $event)"
      :pending="pending"
      :disabled="readOnly || savePending"
      @update:pending="clearPending = $event"
      @cleared="emit('cleared')"
    />
    <section
      class="grid gap-2 rounded-md border p-3 text-sm"
      data-testid="draft-feedback-attention"
      aria-label="即时反馈摘要"
    >
      <h3 class="font-semibold">
        即时反馈<span v-if="feedback"> · {{ attentionCount }} 项活动需核对</span>
      </h3>
      <p v-if="!feedback" class="text-muted-foreground">尚未提供校验反馈。</p>
      <p v-else-if="!feedbackTasks.length" class="text-muted-foreground">
        未记录待核对问题，不代表校验通过。
      </p>
      <p v-if="unknownCount" class="text-muted-foreground">
        {{ unknownCount }} 项活动校验依据未明。
      </p>
      <ul v-if="feedbackTasks.length" class="grid max-h-40 gap-2 overflow-auto">
        <li v-for="item in feedbackTasks" :key="item.task.id" :data-feedback-task="item.task.id">
          <NvButton variant="link" @click="select(item.task.id)">{{ item.task.text }}</NvButton>
          <p
            v-for="(issue, index) in item.issues"
            :key="index"
            :class="issue.kind === 'unknown' ? 'text-muted-foreground' : 'text-warning'"
          >
            {{ issue.message }}
          </p>
        </li>
      </ul>
    </section>
    <p v-if="!model" class="text-sm text-muted-foreground">尚无可编辑的安排。</p>
    <div v-else class="nv-sched-draft-layout">
      <div class="min-w-0">
        <div
          v-if="view === 'gantt'"
          class="nv-sched-draft-figure rounded-md border"
          data-draft-view="order"
        >
          <GanttChart
            ref="gantt"
            :model="graphModel"
            :scale="scale"
            :read-only="disabled"
            @task-select="(id) => id && select(id)"
            @task-drag-end="move"
            @locked-drag-attempt="emit('lockedAttempt', $event)"
          />
        </div>
        <div
          v-else-if="view === 'resource'"
          class="nv-sched-draft-figure flex flex-col rounded-md border"
          data-draft-view="resource"
        >
          <label v-if="model.groupDimensions?.length" class="flex items-center gap-2 p-2 text-sm"
            >查看维度
            <select :value="actualGroup" aria-label="查看维度" @change="changeGroup">
              <option v-for="d in model.groupDimensions" :key="d.key" :value="d.key">
                {{ d.label }}
              </option>
            </select>
          </label>
          <ResourceSchedulerBoard
            class="min-h-0 flex-1"
            ref="resource"
            :model="graphModel"
            :scale="scale"
            :group-by="actualGroup"
            :read-only="disabled"
            @task-select="(id) => id && select(id)"
            @task-drag-end="move"
            @locked-drag-attempt="emit('lockedAttempt', $event)"
          />
        </div>
        <div
          v-else
          class="nv-sched-draft-table overflow-auto rounded-md border"
          data-draft-view="table"
        >
          <table class="w-full text-sm">
            <caption class="sr-only">
              当前活动安排
            </caption>
            <thead>
              <tr class="bg-muted text-left">
                <th class="p-2">活动</th>
                <th class="p-2">资源与时间</th>
                <th class="p-2">锁定与待排</th>
                <th class="p-2">即时反馈</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="task in operations"
                :key="task.id"
                :data-draft-task="task.id"
                class="border-t align-top"
              >
                <td class="p-2">
                  <NvButton variant="link" @click="select(task.id)">{{ task.text }}</NvButton
                  ><TaskFacts :task="task" />
                </td>
                <td class="grid min-w-64 gap-2 p-2">
                  <label
                    >资源
                    <select
                      class="w-full rounded border bg-background p-2"
                      :aria-label="`${task.text} 的资源`"
                      :value="task.resourceId ?? ''"
                      :disabled="disabled || task.locked"
                      @change="editResource(task, $event)"
                    >
                      <option value="">未分配</option>
                      <option v-for="r in model.resources" :key="r.id" :value="r.id">
                        {{ r.text }}
                      </option>
                    </select></label
                  >
                  <p class="text-muted-foreground">
                    {{ task.factoryTimeLabel ?? task.timezone ?? '时区未解析' }}
                  </p>
                  <label v-for="field in ['startUtc', 'endUtc'] as const" :key="field"
                    >{{ field === 'startUtc' ? '开始' : '结束' }}
                    <input
                      class="w-full rounded border bg-background p-2"
                      type="datetime-local"
                      step="1"
                      :aria-label="`${task.text} 的${field === 'startUtc' ? '开始' : '结束'}时间`"
                      :value="factoryTimeInput(task[field], task.timezone ?? '')"
                      :disabled="
                        disabled ||
                        task.locked ||
                        !factoryTimeInput(task[field], task.timezone ?? '') ||
                        (task.segments?.length ?? 0) > 1
                      "
                      @change="editTime(task, field, $event)"
                    />
                  </label>
                  <p v-if="errors[task.id]" role="alert" class="text-destructive">
                    {{ errors[task.id] }}
                  </p>
                  <p v-for="(segment, index) in task.segments" :key="index">
                    第 {{ index + 1 }} 段 ·
                    {{ factoryTimeInput(segment.startUtc, task.timezone ?? '') }} 至
                    {{ factoryTimeInput(segment.endUtc, task.timezone ?? '') }}
                  </p>
                  <p v-if="(task.segments?.length ?? 0) > 1" class="text-muted-foreground">
                    分段时间由安排提供方确定。
                  </p>
                </td>
                <td class="space-y-2 p-2">
                  <NvButton
                    variant="outline"
                    :disabled="disabled"
                    @click="lock(task.id, !task.locked)"
                    >{{ task.locked ? '解锁' : '锁定' }}</NvButton
                  ><NvButton
                    variant="ghost"
                    :disabled="disabled || task.locked"
                    @click="!disabled && !task.locked && emit('moveToPending', task.id)"
                    >移回待排</NvButton
                  ><slot name="task-actions" :task="task" :disabled="disabled" />
                </td>
                <td class="p-2">
                  <slot name="feedback" :task="task" :feedback="feedback?.tasks[task.id]"
                    ><SchedulingDraftFeedback
                      :feedback="feedback?.tasks[task.id]"
                      :timezone="task.timezone"
                  /></slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <SchedulingLegend
          v-if="view !== 'table'"
          :model="model"
          :scale="scale"
          :view="view === 'gantt' ? 'order' : 'resource'"
          :group-by="actualGroup"
        />
      </div>
      <aside
        class="nv-sched-draft-table overflow-y-auto rounded border"
        data-draft-detail
        aria-label="活动详情"
      >
        <TaskDetailPanel
          :task="selected"
          :read-only="disabled"
          :labels="{
            empty: '尚未选择活动',
            lock: '锁定活动',
            unlock: '解锁活动',
            resource: '资源',
          }"
          @toggle-lock="lock"
        /><slot
          v-if="selected"
          name="feedback"
          :task="selected"
          :feedback="feedback?.tasks[selected.id]"
          ><SchedulingDraftFeedback
            :feedback="feedback?.tasks[selected.id]"
            :timezone="selected.timezone"
        /></slot>
      </aside>
    </div>
    <section class="rounded border p-3" data-testid="operation-pending-pool">
      <h3 class="font-semibold">待排活动</h3>
      <p v-if="!pendingOperations?.length" class="text-sm text-muted-foreground">暂无待排活动。</p>
      <ul v-else class="grid gap-2">
        <li
          v-for="item in pendingOperations"
          :key="item.id"
          class="flex items-center justify-between gap-3"
        >
          <div>
            {{ item.label }}
            <p class="text-sm text-muted-foreground">{{ item.message }}</p>
          </div>
          <NvButton
            v-if="item.canRestore && item.taskId"
            variant="outline"
            :disabled="disabled"
            @click="!disabled && emit('restorePending', item.taskId)"
            >恢复</NvButton
          >
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
@layer nv-components {
  .nv-sched-draft-layout {
    display: grid;
    gap: 0.75rem;
  }
  .nv-sched-draft-figure {
    height: 34rem;
    overflow: hidden;
  }
  .nv-sched-draft-table {
    max-height: 38rem;
  }
  @media (min-width: 80rem) {
    .nv-sched-draft-layout {
      grid-template-columns: minmax(0, 1fr) 20rem;
    }
  }
}
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import {
  SchedulingDraftBoard,
  factoryTimeInput,
  type ScheduleModel,
  type ScheduleTask,
  type SchedulingDraftAction,
  type SchedulingDraftPatch,
  type TaskDragPayload,
  type DraftFeedback,
} from '@nerv-iip/scheduling'
import { NvButton } from '@nerv-iip/ui'
const props = withDefaults(defineProps<{ venue?: 'library' | 'studio' }>(), { venue: 'library' })
const reading = props.venue === 'library'
const places = reading
  ? ['晨光书房', '林间书屋', '河畔阅览室']
  : ['向阳画室', '陶艺工坊', '留白空间']
const names = reading ? ['晨间共读', '午间分享'] : ['晨间创作', '午间交流']
function initial(replacement = false): ScheduleModel {
  const task = (index: number): ScheduleTask => ({
    id: `activity-${index}`,
    text: names[index]! + (replacement ? ' · 新安排' : ''),
    orderId: reading ? '周末阅读' : '周末创作',
    operationId: names[index]!,
    operationSequence: 0,
    product: reading ? '阅读活动' : '创作活动',
    type: 'operation',
    startUtc: `2026-10-25T0${replacement ? 5 + index : 2 + index}:00:00Z`,
    endUtc: `2026-10-25T0${replacement ? 7 + index : 4 + index}:00:00Z`,
    timezone: 'Asia/Shanghai',
    factoryTimeLabel: '上海时间',
    locked: false,
    hasConflict: false,
    resourceId: `room-${index}`,
    workCenterId: `place-${index}`,
    dimensions: {
      workCenter: { id: `place-${index}`, label: places[index]! },
      team: { id: `team-${index}`, label: index ? '分享小组' : '晨间小组' },
    },
    display: { groupLabel: reading ? '周末阅读' : '周末创作', resourceLabel: places[index] },
    facts: [{ label: '位置', value: places[index]! }],
  })
  return {
    tasks: [task(0), task(1)],
    resources: places.map((text, index) => ({
      id: `room-${index}`,
      text,
      dimensions: { workCenter: { id: `place-${index}`, label: text } },
    })),
    groupDimensions: [
      { key: 'workCenter', label: '活动空间' },
      { key: 'team', label: '参与小组' },
    ],
    groupValues: {
      workCenter: places.map((label, index) => ({ id: `place-${index}`, label })),
      team: [
        { id: 'team-0', label: '晨间小组' },
        { id: 'team-1', label: '分享小组' },
      ],
    },
    horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
    links: [],
    loads: [],
    conflicts: [],
    unscheduled: [],
    changes: [],
    timezones: ['Asia/Shanghai'],
    meta: {
      planId: `${props.venue}-${replacement ? 'new' : 'first'}`,
      status: 'preview',
      algorithmVersion: 'local-example',
    },
  }
}
// A local, neutral host recipe. These snapshots are neither MES overrides nor service receipts.
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
type Snapshot = { model: ScheduleModel; removed: ScheduleTask[] }
const baseline = shallowRef(initial())
const history = shallowRef<Snapshot[]>([{ model: clone(baseline.value), removed: [] }])
const pointer = shallowRef(0)
const state = computed(() => history.value[pointer.value]!)
const model = computed(() => state.value.model)
const selected = shallowRef('')
const readOnly = shallowRef(false)
const policy = shallowRef('accept')
const saveMode = shallowRef('success')
const clearMode = shallowRef('success')
const feedbackMode = shallowRef('unknown')
const saveChoices = [
  ['success', '完成保存'],
  ['false', '保留草案'],
  ['failure', '保存失败'],
  ['delay-failure', '稍后返回失败'],
  ['missing', '暂未提供保存'],
] as const
const clearChoices = [
  ['success', '完成清空'],
  ['throw', '清空异常'],
  ['failure', '清空失败'],
  ['retry', '首次失败后重试'],
  ['delay-failure', '稍后返回失败'],
] as const
const saved = shallowRef<ScheduleModel>()
const visible = shallowRef(true)
const records = shallowRef<{ activity: string; before: string; after: string; result: string }[]>(
  [],
)
const feedback = computed<DraftFeedback>(() => ({
  tasks: Object.fromEntries(
    model.value.tasks.map((t) => [
      t.id,
      {
        issues: [
          {
            kind: feedbackMode.value === 'unknown' ? 'unknown' : 'calendar',
            message:
              feedbackMode.value === 'unknown'
                ? '尚未核对活动时间，请与参与者确认。'
                : '请确认空间开放时间；此提示由安排提供方输入。',
          },
        ],
      },
    ]),
  ),
}))
const pending = computed(() =>
  state.value.removed.map((t) => ({
    id: t.id,
    taskId: t.id,
    label: t.text,
    message: '已移回待排，仍保留原来的时间和位置。',
    canRestore: true,
  })),
)
function describe(t?: ScheduleTask) {
  return t
    ? `${t.display?.resourceLabel ?? '未分配'} · ${factoryTimeInput(t.startUtc, t.timezone ?? '')
        .slice(0, 16)
        .replace('T', ' ')} 至 ${factoryTimeInput(t.endUtc, t.timezone ?? '')
        .slice(0, 16)
        .replace('T', ' ')}` + ` (${t.timezone})`
    : '待排'
}
function commit(next: Snapshot, activity: string, before: string, after: string) {
  if (readOnly.value) return
  const accepted = policy.value === 'accept'
  if (accepted) {
    history.value = [...history.value.slice(0, pointer.value + 1), clone(next)]
    pointer.value++
  }
  records.value = [
    ...records.value,
    {
      activity,
      before,
      after,
      result: accepted ? '已采用调整，仅保留在本地草案。' : '保留原安排。',
    },
  ]
}
function update(
  id: string,
  patch: SchedulingDraftPatch,
  assignment?: TaskDragPayload['assignment'],
) {
  const old = model.value.tasks.find((t) => t.id === id)
  if (!old || old.locked || readOnly.value) return
  const next = clone(state.value)
  const t = next.model.tasks.find((t) => t.id === id)!
  Object.assign(t, patch)
  // The example host explicitly maps a resource choice. The library does not infer equipment identity.
  if ('resourceId' in patch) {
    const r = model.value.resources.find((r) => r.id === patch.resourceId)
    t.dimensions = { ...t.dimensions }
    t.unassignedDimensions = (t.unassignedDimensions ?? []).filter((d) => d !== 'workCenter')
    if (r?.dimensions?.workCenter) t.dimensions.workCenter = clone(r.dimensions.workCenter)
    else delete t.dimensions.workCenter
    t.workCenterId = r?.dimensions?.workCenter?.id
    t.display = { ...t.display, resourceLabel: r?.text ?? '未分配' }
  }
  if (assignment) {
    t.dimensions = { ...t.dimensions }
    const retained = (t.unassignedDimensions ?? []).filter((d) => d !== assignment.dimension)
    t.unassignedDimensions = assignment.id === null ? [...retained, assignment.dimension] : retained
    if (assignment.id === null) delete t.dimensions[assignment.dimension]
    else t.dimensions[assignment.dimension] = { id: assignment.id, label: assignment.label }
    if (assignment.dimension === 'workCenter') {
      // Only this recipe's space directory defines a room identity; other dimensions stay independent.
      const room =
        assignment.id === null
          ? undefined
          : model.value.resources.find((r) => r.dimensions?.workCenter?.id === assignment.id)
      t.resourceId = room?.id
      t.workCenterId = assignment.id ?? undefined
      t.display = { ...t.display, resourceLabel: room?.text ?? assignment.label }
    }
  }
  if (t.segments?.length === 1) t.segments = [{ startUtc: t.startUtc, endUtc: t.endUtc }]
  t.facts = [{ label: '位置', value: t.display?.resourceLabel ?? '未分配' }]
  commit(next, old.text, describe(old), describe(t))
}
function move(p: TaskDragPayload) {
  const patch: SchedulingDraftPatch = { startUtc: p.startUtc, endUtc: p.endUtc }
  // A dimension drag carries the source resourceId, not a new room choice.
  if (!p.assignment && (p.kind === 'reassign' || p.resourceId !== undefined))
    patch.resourceId = p.resourceId
  update(p.taskId, patch, p.assignment)
}
function lock(id: string, locked: boolean) {
  const next = clone(state.value),
    t = next.model.tasks.find((t) => t.id === id)
  if (!t) return
  t.locked = locked
  commit(next, t.text, locked ? '可调整' : '已锁定', locked ? '已锁定' : '可调整')
}
function remove(id: string) {
  const next = clone(state.value),
    t = next.model.tasks.find((t) => t.id === id)
  if (!t || t.locked) return
  next.removed.push(t)
  next.model.tasks = next.model.tasks.filter((t) => t.id !== id)
  commit(next, t.text, describe(t), '待排')
}
function restore(id: string) {
  const next = clone(state.value),
    t = next.removed.find((t) => t.id === id)
  if (!t) return
  next.removed = next.removed.filter((t) => t.id !== id)
  next.model.tasks.push(t)
  commit(next, t.text, '待排', describe(t))
}
function replace() {
  baseline.value = initial(baseline.value.meta.planId.endsWith('first'))
  history.value = [{ model: clone(baseline.value), removed: [] }]
  pointer.value = 0
  selected.value = ''
  saved.value = undefined
}
const timers = new Map<ReturnType<typeof setTimeout>, () => void>()
function pause(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      timers.delete(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    const timer = setTimeout(finish, 900)
    timers.set(timer, finish)
    signal.addEventListener('abort', finish, { once: true })
  })
}
onBeforeUnmount(() => {
  for (const finish of timers.values()) finish()
})
const save = computed<SchedulingDraftAction | undefined>(() => {
  const mode = saveMode.value
  return mode === 'missing'
    ? undefined
    : async (snapshot, { signal }) => {
        if (mode === 'delay-failure') await pause(signal)
        if (signal.aborted) return false
        if (mode === 'false') return false
        if (mode === 'failure' || mode === 'delay-failure')
          throw new Error('本次保存未完成，请重试')
        saved.value = clone(snapshot)
        return true
      }
})
const clear = computed<SchedulingDraftAction>(() => {
  const mode = clearMode.value
  let attempts = 0
  return async (_snapshot, { signal }) => {
    if (mode === 'delay-failure') await pause(signal)
    if (signal.aborted) return false
    if (mode === 'throw') throw new Error('本次清空未完成，请重试')
    return mode === 'success' || (mode === 'retry' && ++attempts > 1)
  }
})
function cleared() {
  history.value = [{ model: clone(baseline.value), removed: [] }]
  pointer.value = 0
  selected.value = ''
}
</script>
<template>
  <main
    class="min-w-0 max-w-full overflow-x-auto bg-background p-2 text-foreground sm:p-5"
    tabindex="0"
    aria-label="活动草案示例"
  >
    <p class="mb-2 text-sm">
      DHTMLX 9.1.4 Professional Evaluation；声明与水印保留，授权范围 UNKNOWN。
    </p>
    <p class="mb-4 text-sm text-muted-foreground">
      撤销与重做只改草案；保存到本页的独立副本，刷新即结束，不连接服务。时间均为上海时间。
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-4 text-sm">
      <label
        >调整处理
        <select v-model="policy" aria-label="调整处理">
          <option value="accept">采用调整</option>
          <option value="reject">保留原安排</option>
        </select></label
      >
      <label
        >保存处理
        <select v-model="saveMode" aria-label="保存处理">
          <option v-for="[value, label] in saveChoices" :key="value" :value="value">
            {{ label }}
          </option>
        </select></label
      >
      <label
        >清空处理
        <select v-model="clearMode" aria-label="清空处理">
          <option v-for="[value, label] in clearChoices" :key="value" :value="value">
            {{ label }}
          </option>
        </select></label
      >
      <label
        >核对反馈
        <select v-model="feedbackMode" aria-label="核对反馈">
          <option value="unknown">尚待核对</option>
          <option value="notice">开放时间提醒</option>
        </select></label
      >
      <label><input v-model="readOnly" type="checkbox" /> 只读安排</label
      ><NvButton variant="outline" @click="replace">换一份安排</NvButton
      ><NvButton variant="outline" @click="visible = !visible">{{
        visible ? '收起安排' : '打开安排'
      }}</NvButton>
    </div>
    <SchedulingDraftBoard
      v-if="visible"
      :model="model"
      v-model:selected-task-id="selected"
      :feedback="feedback"
      :pending-operations="pending"
      :read-only="readOnly"
      :can-undo="pointer > 0"
      :can-redo="pointer < history.length - 1"
      :dirty="pointer > 0"
      :save="save"
      :clear="clear"
      title="活动草案"
      @update="update"
      @move="move"
      @lock="lock"
      @move-to-pending="remove"
      @restore-pending="restore"
      @undo="pointer--"
      @redo="pointer++"
      @cleared="cleared"
    />
    <section class="mt-4 grid gap-2 rounded border p-3 text-sm">
      <h2 class="font-semibold">当前安排</h2>
      <div data-current-arrangement>
        <p v-for="t in model.tasks" :key="t.id">
          {{ t.text }} · {{ describe(t) }} · {{ t.locked ? '已锁定' : '可调整' }}
        </p>
      </div>
      <p data-saved-arrangement>
        {{
          saved
            ? `已保存的副本：${saved.tasks.map((t) => `${t.text} · ${describe(t)}`).join('；')}`
            : '尚未保存独立副本。'
        }}
      </p>
    </section>
    <details class="mt-4">
      <summary>活动调整记录（{{ records.length }}）</summary>
      <ol data-draft-records class="grid gap-2">
        <li v-for="(r, index) in records" :key="index" class="rounded border p-3">
          <p>{{ r.activity }}</p>
          <p>调整前：{{ r.before }}</p>
          <p>本次提议：{{ r.after }}</p>
          <p>处理结果：{{ r.result }}</p>
        </li>
      </ol>
    </details>
  </main>
</template>

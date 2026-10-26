<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import {
  SchedulingCandidatePanel,
  SchedulingDowntimeBanner,
  SchedulingInsertionPreview,
  SchedulingRushInsertionResult,
  type SchedulingAsyncJob,
  type SchedulingAsyncResult,
  type SchedulingCandidateSet,
  type SchedulingDowntimeItem,
  type SchedulingHistoryPlan,
} from '@nerv-iip/scheduling'
import { NvButton, useColorMode, useTheme } from '@nerv-iip/ui'
import { comparisonSnapshots } from './schedule-comparison-fixtures'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const targetLabel = computed(() => (props.venue === 'library' ? '晨间共读' : '午后创作'))
const targetKey = computed(() =>
  props.venue === 'library' ? 'reading-morning' : 'studio-afternoon',
)
const contextKey = computed(() => props.venue)
const baselineId = computed(() => selectedPlanId.value)
const readOnly = shallowRef(false)
const pageIndex = shallowRef(0)
const pageSize = 5
const plans: readonly SchedulingHistoryPlan[] = Array.from({ length: 11 }, (_, index) => ({
  id: index === 0 ? 'saved-baseline' : `saved-${index + 1}`,
  label: `已保存安排 ${index + 1}`,
  status: '已保存',
  assignmentCount: index === 0 ? 0 : index + 1,
}))
const selectedPlanId = shallowRef(plans[0]!.id)
const visiblePlans = computed(() =>
  plans.slice(pageIndex.value * pageSize, (pageIndex.value + 1) * pageSize),
)
const job = shallowRef<SchedulingAsyncJob>()
const candidateSet = shallowRef<SchedulingCandidateSet>()
const failureMessage = shallowRef('')
const saving = shallowRef(false)
const selected = shallowRef(false)
const savedError = shallowRef('')
const downtimePhase = shallowRef<SchedulingDowntimeItem['phase']>('no-etr')
const now = shallowRef(new Date())
const nowText = computed(
  () =>
    `${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now.value)}（Asia/Shanghai）`,
)
const downtimeItems = computed<readonly SchedulingDowntimeItem[]>(() => [
  {
    id: `room-${props.venue}`,
    resourceLabel: props.venue === 'library' ? '晨光书房' : '林间工坊',
    startedAt: '09:00（Asia/Shanghai）',
    duration: '45 分钟',
    phase: downtimePhase.value,
    expectedRestoreAt:
      downtimePhase.value === 'expected' || downtimePhase.value === 'expired'
        ? '09:30（Asia/Shanghai）'
        : undefined,
    recoveredAt: downtimePhase.value === 'recovered' ? '09:45（Asia/Shanghai）' : undefined,
    alternativesCount: downtimePhase.value === 'no-etr' ? null : 0,
    affected: [{ id: 'morning', label: targetLabel.value, message: '原位置保留，等待候选核对' }],
  },
])

interface Held<T> {
  promise: Promise<T>
  resolve(value: T): void
  reject(reason: unknown): void
}
function held<T>(): Held<T> {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
interface PendingRequest {
  deferred: Held<SchedulingAsyncResult>
  controller: AbortController
  requestKey: string
  context: string
  baselineId: string
}
const pending = new Map<string, PendingRequest>()
let previousRequest: { id: string; request: PendingRequest } | undefined
interface SaveOperation {
  jobId: string
  requestKey: string
  context: string
  baselineId: string
  candidateId: string
  deferred: Held<void>
  controller: AbortController
}
let pendingSave: SaveOperation | undefined
let previousSave: SaveOperation | undefined
let timer: ReturnType<typeof setInterval> | undefined
let serial = 0
let disposed = false
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 30_000)
})
onUnmounted(() => {
  disposed = true
  if (timer) clearInterval(timer)
  for (const request of pending.values()) request.controller.abort()
  pending.clear()
  previousRequest?.request.controller.abort()
  previousRequest = undefined
  pendingSave?.controller.abort()
  previousSave?.controller.abort()
  pendingSave = undefined
  previousSave = undefined
})

function invalidateSave() {
  if (pendingSave) {
    pendingSave.controller.abort()
    previousSave = pendingSave
    pendingSave = undefined
  }
  saving.value = false
  savedError.value = ''
}
function retireRequest(id: string) {
  const request = pending.get(id)
  if (request) {
    previousRequest = { id, request }
    request.controller.abort()
    pending.delete(id)
  }
}
function invalidateJob(clear: boolean) {
  if (job.value) {
    retireRequest(job.value.id)
    if (clear) job.value = undefined
    else if (job.value.status === 'created' || job.value.status === 'running')
      job.value = { ...job.value, status: 'stopped' }
  }
  if (clear) {
    candidateSet.value = undefined
    selected.value = false
    failureMessage.value = ''
  }
  invalidateSave()
}
watch(
  () => props.venue,
  () => invalidateJob(true),
  { flush: 'sync' },
)
watch(
  readOnly,
  (value) => {
    if (value) invalidateJob(false)
  },
  { flush: 'sync' },
)

function current(id: string, requestKey: string, context: string, controller: AbortController) {
  return (
    !disposed &&
    !controller.signal.aborted &&
    contextKey.value === context &&
    job.value?.id === id &&
    job.value.requestKey === requestKey &&
    job.value.status !== 'stopped'
  )
}
function createResult(
  id: string,
  context: string,
  requestKey: string,
  selectedBaselineId: string,
): SchedulingAsyncResult {
  const venue = context as 'library' | 'studio'
  const label = venue === 'library' ? '晨间共读' : '午后创作'
  const { baseline, candidate } = comparisonSnapshots(venue)
  return {
    jobId: id,
    contextKey: context,
    requestKey,
    promise: { state: 'unknown', reasons: ['尚无可核实的承诺时间'] },
    metrics: [{ id: 'moved', label: '移动活动', value: 0, format: 'number' }],
    orders: [
      {
        id: 'morning',
        label,
        impact: '位置待核对',
        beforeCompletion: '11:00（Asia/Shanghai）',
        afterCompletion: null,
        delayDays: null,
        baselineLate: false,
        candidateLate: null,
      },
    ],
    operations: [
      {
        id: 'movement',
        label,
        reasons: ['场地调整'],
        paths: [
          {
            id: 'path',
            steps: [`${label} → ${venue === 'library' ? '午间分享' : '午后交流'}`],
          },
        ],
      },
    ],
    baseline: {
      ...baseline,
      id: selectedBaselineId,
      label: plans.find((plan) => plan.id === selectedBaselineId)?.label || baseline.label,
    },
    candidate: { ...candidate, id: `${candidate.id}-${id}` },
  }
}
function startJob(force = false) {
  if (
    !force &&
    (job.value?.status === 'created' || job.value?.status === 'running' || saving.value)
  )
    return
  if (readOnly.value || !selectedPlanId.value) return
  invalidateSave()
  if (job.value) {
    retireRequest(job.value.id)
  }
  const id = `job-${++serial}`
  const requestKey = `request-${serial}`
  const context = contextKey.value
  const controller = new AbortController()
  const deferred = held<SchedulingAsyncResult>()
  const selectedBaselineId = selectedPlanId.value
  pending.set(id, { deferred, controller, requestKey, context, baselineId: selectedBaselineId })
  job.value = {
    id,
    contextKey: context,
    requestKey,
    status: 'created',
    input: {
      baselineId: selectedBaselineId,
      targetKey: targetKey.value,
      targetLabel: targetLabel.value,
      windowLabel: '09:00–18:00（Asia/Shanghai）',
    },
  }
  candidateSet.value = undefined
  failureMessage.value = ''
  savedError.value = ''
  selected.value = false
  saving.value = false
  void deferred.promise
    .then(
      (result) => {
        if (
          !current(id, requestKey, context, controller) ||
          result.jobId !== id ||
          result.contextKey !== context ||
          result.requestKey !== requestKey ||
          selectedPlanId.value !== selectedBaselineId
        )
          return
        job.value = { ...job.value!, status: 'completed', result }
        candidateSet.value = {
          contextKey: context,
          baselineId: selectedBaselineId,
          jobId: id,
          requestKey,
          candidates: [
            {
              id: result.candidate!.id,
              label: props.venue === 'library' ? '保留晨间节奏' : '调整创作场地',
              snapshot: result.candidate,
              metrics: [
                {
                  id: 'on-time',
                  label: '可承诺比例',
                  format: 'percent',
                  before: null,
                  after: 0,
                  beforeDenominator: 0,
                  afterDenominator: 1,
                  delta: null,
                },
              ],
              locked: {
                preserved: 0,
                total: 1,
                details: [
                  { id: 'afternoon', label: '午间分享', preserved: false, message: '来源要求复核' },
                ],
              },
              movements: [
                {
                  id: 'morning',
                  label: targetLabel.value,
                  before: {
                    resource: '晨光书房',
                    start: '09:00（Asia/Shanghai）',
                    end: '10:00（Asia/Shanghai）',
                    segments: ['09:00–09:30（Asia/Shanghai）'],
                  },
                  after: {
                    resource: '林间书屋',
                    start: '10:00（Asia/Shanghai）',
                    end: '11:00（Asia/Shanghai）',
                    segments: ['10:00–10:30（Asia/Shanghai）'],
                  },
                  reasons: ['场地调整'],
                  paths: [
                    {
                      id: 'path',
                      steps: [
                        `${targetLabel.value} → ${props.venue === 'library' ? '午间分享' : '午后交流'}`,
                      ],
                    },
                  ],
                  transfers: [
                    {
                      id: 'transfer',
                      label: '转至林间书屋',
                      setupMinutes: 0,
                      sources: ['场地登记'],
                    },
                  ],
                },
              ],
              explanations: [{ id: 'afternoon', label: '午间分享', message: '等待场地确认' }],
            },
          ],
        }
      },
      () => {
        if (!current(id, requestKey, context, controller)) return
        job.value = { ...job.value!, status: 'failed' }
        failureMessage.value = '本次未能生成候选，已保留所选方案。'
      },
    )
    .finally(() => {
      pending.delete(id)
      if (previousRequest?.id === id) previousRequest = undefined
      // A settled old request never clears the active job or its busy state.
      if (
        current(id, requestKey, context, controller) &&
        (job.value?.status === 'created' || job.value?.status === 'running')
      ) {
        job.value = { ...job.value, status: 'failed' }
        failureMessage.value = '本次结果未能核实，已保留所选方案。'
      }
    })
}
function markRunning() {
  if (job.value?.status === 'created') job.value = { ...job.value, status: 'running' }
}
function complete(id?: string) {
  const target = id || job.value?.id
  const request = target ? pending.get(target) : undefined
  if (request && target)
    request.deferred.resolve(
      createResult(target, request.context, request.requestKey, request.baselineId),
    )
}
function completeOld() {
  const previous = previousRequest
  if (previous)
    previous.request.deferred.resolve(
      createResult(
        previous.id,
        previous.request.context,
        previous.request.requestKey,
        previous.request.baselineId,
      ),
    )
}
function failCurrent() {
  const id = job.value?.id
  if (id) pending.get(id)?.deferred.reject(new Error('RAW_HTTP_500: fixture-only diagnostic'))
}
function failOld() {
  previousRequest?.request.deferred.reject(new Error('RAW_HTTP_500: old fixture diagnostic'))
}
function stop(id: string, requestKey: string) {
  if (
    job.value?.id !== id ||
    job.value.requestKey !== requestKey ||
    !['created', 'running'].includes(job.value.status)
  )
    return
  retireRequest(id)
  job.value = { ...job.value, status: 'stopped' }
}
function retry(id: string, requestKey: string) {
  if (job.value?.id === id && job.value.requestKey === requestKey && job.value.status === 'failed')
    startJob(true)
}
function save(id: string, candidateId: string) {
  const activeJob = job.value
  if (
    readOnly.value ||
    saving.value ||
    selected.value ||
    activeJob?.id !== id ||
    activeJob.status !== 'completed' ||
    activeJob.result?.candidate?.id !== candidateId ||
    activeJob.result.jobId !== activeJob.id ||
    activeJob.result.contextKey !== activeJob.contextKey ||
    activeJob.result.requestKey !== activeJob.requestKey ||
    activeJob.input.baselineId !== selectedPlanId.value ||
    activeJob.contextKey !== contextKey.value
  )
    return
  const deferred = held<void>()
  const operation: SaveOperation = {
    jobId: id,
    requestKey: activeJob.requestKey,
    context: activeJob.contextKey,
    baselineId: activeJob.input.baselineId,
    candidateId,
    deferred,
    controller: new AbortController(),
  }
  pendingSave = operation
  saving.value = true
  savedError.value = ''
  const stillCurrent = () =>
    !disposed &&
    !operation.controller.signal.aborted &&
    !readOnly.value &&
    pendingSave === operation &&
    contextKey.value === operation.context &&
    selectedPlanId.value === operation.baselineId &&
    job.value?.id === operation.jobId &&
    job.value.requestKey === operation.requestKey &&
    job.value.contextKey === operation.context &&
    job.value.input.baselineId === operation.baselineId &&
    job.value.status === 'completed' &&
    job.value.result?.jobId === operation.jobId &&
    job.value.result?.candidate?.id === operation.candidateId
  void deferred.promise
    .then(
      () => {
        if (stillCurrent()) selected.value = true
      },
      () => {
        if (stillCurrent()) savedError.value = '修订未保存，请稍后重试。'
      },
    )
    .finally(() => {
      if (stillCurrent()) {
        saving.value = false
        pendingSave = undefined
      }
      if (previousSave === operation) previousSave = undefined
    })
}
function confirmSave() {
  pendingSave?.deferred.resolve()
}
function rejectSave() {
  pendingSave?.deferred.reject(new Error('RAW_SAVE_ERROR'))
}
function confirmOldSave() {
  previousSave?.deferred.resolve()
}
function rejectOldSave() {
  previousSave?.deferred.reject(new Error('RAW_SAVE_ERROR: old fixture diagnostic'))
}
function previewCandidates() {
  startJob()
}
function choosePlan(id: string) {
  if (readOnly.value || selectedPlanId.value === id) return
  invalidateJob(true)
  selectedPlanId.value = id
}
function selectCandidate(id: string, candidateId: string) {
  save(id, candidateId)
}
</script>

<template>
  <main class="mx-auto grid max-w-7xl gap-6 p-6 text-sm" data-async-candidates-page>
    <nav class="flex flex-wrap gap-3" aria-label="候选安排页面导航">
      <a href="#desktop" class="inline-flex min-h-11 items-center underline">返回工作空间</a>
      <a href="#schedule-compare/library" class="inline-flex min-h-11 items-center underline"
        >安排对照</a
      >
      <a href="#schedule-snapshot/library" class="inline-flex min-h-11 items-center underline"
        >安排核对</a
      >
      <a
        :href="`#schedule-async/${venue === 'library' ? 'studio' : 'library'}`"
        class="inline-flex min-h-11 items-center underline"
        >{{ venue === 'library' ? '工作坊候选' : '读书会候选' }}</a
      >
    </nav>
    <header class="grid gap-2">
      <h1 class="text-2xl font-semibold">
        {{ venue === 'library' ? '读书会候选安排' : '工作坊候选安排' }}
      </h1>
      <p class="text-muted-foreground">
        候选结果和保存响应仅在本页内存中生成；没有连接实际排程计算或后端保存。本页显示的“已保存”仅代表当前页面确认，刷新后不保留。
      </p>
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" :aria-pressed="isDark" @click="toggle">{{
          isDark ? '切换浅色' : '切换深色'
        }}</NvButton>
        <NvButton
          variant="outline"
          :aria-pressed="theme === 'blue'"
          @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
          >蓝色主题</NvButton
        >
        <NvButton variant="outline" :aria-pressed="readOnly" @click="readOnly = !readOnly">{{
          readOnly ? '允许操作' : '只读查看'
        }}</NvButton>
      </div>
    </header>
    <section
      class="grid gap-3 rounded-lg border border-border bg-card p-4"
      aria-label="本页状态设置"
    >
      <h2 class="font-semibold">状态设置</h2>
      <p class="text-muted-foreground">以下操作仅调整本页结果和保存响应，便于查看不同状态。</p>
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" data-fixture="start-job" @click="startJob()">开始核实</NvButton>
        <NvButton variant="outline" data-fixture="running" @click="markRunning"
          >显示计算中</NvButton
        >
        <NvButton variant="outline" data-fixture="replace-job" @click="startJob(true)"
          >重新核实当前方案</NvButton
        >
        <NvButton variant="outline" data-fixture="complete-old" @click="completeOld"
          >接收上轮结果</NvButton
        >
        <NvButton variant="outline" data-fixture="complete-current" @click="complete()"
          >接收本轮结果</NvButton
        >
        <NvButton variant="outline" data-fixture="fail-current" @click="failCurrent"
          >本轮结果不可用</NvButton
        >
        <NvButton variant="outline" data-fixture="fail-old" @click="failOld"
          >上轮结果不可用</NvButton
        >
        <NvButton variant="outline" data-fixture="confirm-save" @click="confirmSave"
          >接收本轮保存确认</NvButton
        >
        <NvButton variant="outline" data-fixture="reject-save" @click="rejectSave"
          >本轮保存未确认</NvButton
        >
        <NvButton variant="outline" data-fixture="confirm-old-save" @click="confirmOldSave"
          >接收上轮保存确认</NvButton
        >
        <NvButton variant="outline" data-fixture="reject-old-save" @click="rejectOldSave"
          >上轮保存未确认</NvButton
        >
      </div>
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" @click="downtimePhase = 'no-etr'">无预计恢复时间</NvButton>
        <NvButton variant="outline" @click="downtimePhase = 'expected'">尚在预计时间内</NvButton>
        <NvButton variant="outline" @click="downtimePhase = 'expired'">预计时间已过</NvButton>
        <NvButton variant="outline" @click="downtimePhase = 'recovered'">实际已恢复</NvButton>
      </div>
    </section>
    <SchedulingDowntimeBanner
      :items="downtimeItems"
      :now="nowText"
      :context-key="contextKey"
      :read-only="readOnly"
      :pending="job?.status === 'created' || job?.status === 'running'"
      :has-candidates="!!candidateSet"
      @preview="previewCandidates"
    />
    <SchedulingInsertionPreview
      :context-key="contextKey"
      :target-key="targetKey"
      :target-label="targetLabel"
      :plans="visiblePlans"
      :page-index="pageIndex"
      :page-size="pageSize"
      :total="plans.length"
      :selected-plan-id="selectedPlanId"
      history-state="ready"
      :job="job"
      :read-only="readOnly"
      @page="pageIndex = $event"
      @choose="choosePlan"
      @start="startJob()"
      @stop="stop"
      @retry="retry"
    />
    <SchedulingCandidatePanel
      :candidates="candidateSet"
      :baseline="job?.result?.baseline"
      :context-key="contextKey"
      :baseline-id="baselineId"
      :job-id="job?.id"
      :request-key="job?.requestKey"
      :read-only="readOnly"
      :pending="job?.status === 'created' || job?.status === 'running'"
      @preview="previewCandidates"
      @select="selectCandidate"
    />
    <SchedulingRushInsertionResult
      :job="job"
      :failure-message="failureMessage"
      :saving="saving"
      :selected="selected"
      :read-only="readOnly"
      @stop="stop"
      @retry="retry"
      @select="save"
    />
    <p v-if="savedError" role="alert">{{ savedError }}</p>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import SchedulingPreviewResult from '../comparison/SchedulingPreviewResult.vue'
import { numberText } from '../snapshot/snapshot'
import type { SchedulingAsyncJob, SchedulingHistoryPlan } from './types'

const props = defineProps<{
  contextKey: string
  targetKey: string
  targetLabel: string
  notice?: string
  plans?: readonly SchedulingHistoryPlan[]
  pageIndex: number
  pageSize: number
  /** Server reported total; absent is unknown, never a fabricated page count. */
  total?: number | null
  selectedPlanId?: string
  historyState?: 'loading' | 'ready' | 'failed'
  historyMessage?: string
  job?: SchedulingAsyncJob
  busy?: boolean
  readOnly?: boolean
  disabledReason?: string
}>()
const emit = defineEmits<{
  page: [index: number]
  choose: [planId: string]
  start: [request: { contextKey: string; targetKey: string; planId: string }]
  stop: [jobId: string, requestKey: string]
  retry: [jobId: string, requestKey: string]
}>()
const currentJob = computed(() =>
  props.job?.contextKey === props.contextKey &&
  props.job.input.targetKey === props.targetKey &&
  props.job.input.baselineId === props.selectedPlanId
    ? props.job
    : undefined,
)
const result = computed(() =>
  currentJob.value?.status === 'completed' &&
  currentJob.value.result?.jobId === currentJob.value.id &&
  currentJob.value.result.contextKey === props.contextKey &&
  currentJob.value.result.requestKey === currentJob.value.requestKey
    ? currentJob.value.result
    : undefined,
)
const actionReason = computed(() =>
  props.readOnly
    ? '当前为只读'
    : props.disabledReason ||
      (props.busy
        ? '操作正在进行'
        : currentJob.value?.status === 'created' || currentJob.value?.status === 'running'
          ? '本次核实仍在进行'
          : !props.targetKey
            ? '请先选择活动'
            : !props.selectedPlanId
              ? '请选择现有方案'
              : ''),
)
const canNext = computed(
  () =>
    props.total != null &&
    Number.isSafeInteger(props.total) &&
    props.pageSize > 0 &&
    (props.pageIndex + 1) * props.pageSize < props.total,
)
function start() {
  if (!actionReason.value && props.selectedPlanId)
    emit('start', {
      contextKey: props.contextKey,
      targetKey: props.targetKey,
      planId: props.selectedPlanId,
    })
}
</script>

<template>
  <section class="grid gap-4 rounded-lg border border-border bg-card p-4" aria-label="插入现有方案">
    <header>
      <h2 class="font-semibold">选择现有方案</h2>
      <p class="text-sm text-muted-foreground">
        为 {{ targetLabel }} 选择已保存安排；计算和资格由来源处理。
      </p>
      <p v-if="notice" class="text-sm text-muted-foreground">{{ notice }}</p>
    </header>
    <p v-if="historyState === 'loading'" role="status">正在读取方案…</p>
    <p v-if="historyState === 'failed'" role="alert">
      {{ historyMessage || '现有方案读取失败，可稍后重试。' }}
    </p>
    <p
      v-if="plans === undefined && historyState !== 'loading' && historyState !== 'failed'"
      role="status"
    >
      方案记录未提供。
    </p>
    <p v-if="plans && !plans.length && historyState === 'ready'" role="status">本页没有方案。</p>
    <ul v-if="plans?.length" class="grid gap-2">
      <li
        v-for="plan in plans"
        :key="plan.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-sm"
      >
        <div>
          <p class="font-medium">{{ plan.label }}</p>
          <p class="text-xs text-muted-foreground">
            {{ plan.status }} · 已排活动
            <span class="tabular-nums">{{ numberText(plan.assignmentCount) }}</span>
          </p>
        </div>
        <NvButton
          type="button"
          variant="outline"
          data-action="choose-plan"
          :aria-pressed="selectedPlanId === plan.id"
          :disabled="readOnly || busy"
          :title="readOnly ? '当前为只读' : busy ? '操作正在进行' : undefined"
          @click="emit('choose', plan.id)"
          >{{ selectedPlanId === plan.id ? '已选择' : '选择' }}</NvButton
        >
      </li>
    </ul>
    <div class="flex flex-wrap items-center justify-end gap-2 text-sm">
      <span
        >{{ total == null ? '方案总数未提供' : `共 ${numberText(total)} 个方案` }} · 第
        {{ pageIndex + 1 }} 页</span
      >
      <NvButton
        type="button"
        size="sm"
        variant="outline"
        data-action="previous-page"
        :disabled="pageIndex <= 0 || busy"
        @click="emit('page', pageIndex - 1)"
        >上一页</NvButton
      >
      <NvButton
        type="button"
        size="sm"
        variant="outline"
        data-action="next-page"
        :disabled="!canNext || busy"
        @click="emit('page', pageIndex + 1)"
        >下一页</NvButton
      >
    </div>
    <p v-if="selectedPlanId" class="text-sm">
      所选方案 · {{ plans?.find((plan) => plan.id === selectedPlanId)?.label || '已选方案' }} ＋
      {{ targetLabel }}
    </p>
    <p v-if="actionReason" role="status" class="text-sm text-muted-foreground">
      {{ actionReason }}
    </p>
    <NvButton
      type="button"
      class="justify-self-end"
      data-action="start"
      :disabled="!!actionReason"
      :title="actionReason || undefined"
      @click="start"
      >{{ busy ? '正在提交请求…' : '插入并预览候选' }}</NvButton
    >
    <div
      v-if="currentJob"
      class="grid gap-2 rounded-md border border-border p-3 text-sm"
      role="status"
    >
      <p>
        {{ currentJob.input.targetLabel }} · {{ currentJob.input.windowLabel || '原窗口未提供' }}
      </p>
      <p>
        {{
          {
            created: '等待计算',
            running: '计算中',
            failed: '计算失败',
            completed: result ? '预览完成' : '结果待核对',
            stopped: '已停止等待',
          }[currentJob.status]
        }}
      </p>
      <p v-if="currentJob.status === 'completed' && !result" role="alert">
        本次结果身份不一致或尚未提供。
      </p>
      <div class="flex gap-2">
        <NvButton
          v-if="currentJob.status === 'created' || currentJob.status === 'running'"
          type="button"
          variant="outline"
          data-action="stop"
          :disabled="readOnly || busy"
          @click="emit('stop', currentJob.id, currentJob.requestKey)"
          >停止等待</NvButton
        >
        <NvButton
          v-if="currentJob.status === 'failed'"
          type="button"
          variant="outline"
          data-action="retry"
          :disabled="readOnly || busy"
          @click="emit('retry', currentJob.id, currentJob.requestKey)"
          >手动重试</NvButton
        >
      </div>
    </div>
    <SchedulingPreviewResult v-if="result?.candidate" :snapshot="result.candidate" read-only />
  </section>
</template>

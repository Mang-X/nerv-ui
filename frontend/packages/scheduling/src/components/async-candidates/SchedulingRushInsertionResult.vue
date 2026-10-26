<script setup lang="ts">
import { computed } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import SchedulingPreviewResult from '../comparison/SchedulingPreviewResult.vue'
import ScheduleRevisionReview from '../comparison/ScheduleRevisionReview.vue'
import { numberText } from '../snapshot/snapshot'
import { metricText } from './presentation'
import type { SchedulingAsyncJob } from './types'

const props = defineProps<{
  job?: SchedulingAsyncJob
  failureMessage?: string
  busy?: boolean
  saving?: boolean
  selected?: boolean
  readOnly?: boolean
  disabledReason?: string
}>()
const emit = defineEmits<{
  retry: [jobId: string, requestKey: string]
  stop: [jobId: string, requestKey: string]
  select: [jobId: string, candidateId: string]
}>()
const labels = {
  created: '已受理，等待计算',
  running: '计算中',
  failed: '计算失败',
  completed: '候选计算完成',
  stopped: '已停止核实',
} as const
const result = computed(() => {
  const job = props.job
  return job?.status === 'completed' &&
    job.result?.jobId === job.id &&
    job.result.contextKey === job.contextKey &&
    job.result.requestKey === job.requestKey
    ? job.result
    : undefined
})
const actionReason = computed(() =>
  props.readOnly ? '当前为只读' : props.disabledReason || (props.busy ? '操作正在进行' : ''),
)
function select() {
  const job = props.job
  const candidate = result.value?.candidate
  if (job && candidate && !props.selected && !props.saving && !actionReason.value)
    emit('select', job.id, candidate.id)
}
</script>

<template>
  <section
    v-if="job"
    class="grid gap-4 rounded-lg border border-border bg-card p-4"
    aria-label="急单插单候选"
  >
    <header class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold">急单插单候选</h2>
      <span role="status">{{ labels[job.status] }}</span>
    </header>
    <p class="text-sm text-muted-foreground">
      受理基线 <span class="font-mono text-xs">{{ job.input.baselineId }}</span> ·
      {{ job.input.targetLabel }}
    </p>
    <p v-if="job.input.windowLabel" class="text-sm">原窗口 · {{ job.input.windowLabel }}</p>
    <p
      v-if="job.status === 'created' || job.status === 'running'"
      class="text-sm text-muted-foreground"
    >
      正在读取本次计算状态。
    </p>
    <div v-if="job.status === 'created' || job.status === 'running'">
      <NvButton
        type="button"
        variant="outline"
        data-action="stop"
        :disabled="!!actionReason"
        :title="actionReason || undefined"
        @click="emit('stop', job.id, job.requestKey)"
        >停止等待</NvButton
      >
    </div>
    <div v-if="job.status === 'failed'" class="grid justify-items-start gap-2">
      <p role="alert">{{ failureMessage || '本次未能生成候选；可保留选择后重试。' }}</p>
      <NvButton
        type="button"
        variant="outline"
        data-action="retry"
        :disabled="!!actionReason"
        :title="actionReason || undefined"
        @click="emit('retry', job.id, job.requestKey)"
        >手动重试</NvButton
      >
    </div>
    <p v-if="job.status === 'stopped'" role="status">本次等待已停止，未收到可用候选。</p>
    <p v-if="job.status === 'completed' && !result" role="alert">
      本次结果身份不一致或尚未提供，请核对来源。
    </p>
    <template v-if="result">
      <div class="rounded-md border border-border p-3">
        <p class="text-sm text-muted-foreground">承诺时间</p>
        <p class="font-semibold">
          {{
            result.promise?.state === 'known'
              ? result.promise.at || '时间未提供'
              : result.promise?.state === 'unavailable'
                ? '无法承诺'
                : '承诺时间未知'
          }}
        </p>
        <p
          v-for="reason in result.promise?.reasons"
          :key="reason"
          class="text-sm text-muted-foreground"
        >
          {{ reason }}
        </p>
      </div>
      <dl v-if="result.metrics?.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="metric in result.metrics" :key="metric.id" class="rounded-md bg-muted/40 p-3">
          <dt class="text-xs text-muted-foreground">{{ metric.label }}</dt>
          <dd class="text-right font-semibold tabular-nums">
            {{ metricText(metric.value, metric.format, metric.unit) }}
          </dd>
        </div>
      </dl>
      <section v-if="result.orders" class="grid gap-2" aria-label="工单影响">
        <h3 class="font-semibold">工单影响</h3>
        <p v-if="!result.orders.length">本次没有工单影响记录。</p>
        <article
          v-for="order in result.orders"
          :key="order.id"
          class="grid gap-1 rounded-md border border-border p-3 text-sm"
        >
          <h4 class="font-medium">{{ order.label }} · {{ order.impact }}</h4>
          <p>
            原完工 {{ order.beforeCompletion ?? '—' }} → 新完工 {{ order.afterCompletion ?? '—' }}
          </p>
          <p>
            推迟天数 <span class="tabular-nums">{{ numberText(order.delayDays) }}</span> · 原破交期
            {{ order.baselineLate == null ? '未知' : order.baselineLate ? '是' : '否' }} · 新破交期
            {{ order.candidateLate == null ? '未知' : order.candidateLate ? '是' : '否' }}
          </p>
        </article>
      </section>
      <section v-if="result.operations" class="grid gap-2" aria-label="工序传播">
        <h3 class="font-semibold">工序传播</h3>
        <p v-if="!result.operations.length">本次没有工序传播记录。</p>
        <details
          v-for="operation in result.operations"
          :key="operation.id"
          class="rounded-md border border-border p-3 text-sm"
        >
          <summary class="cursor-pointer font-medium">{{ operation.label }} · 展开影响原因</summary>
          <p v-if="operation.reasons === undefined">原因未提供</p>
          <p v-for="reason in operation.reasons" :key="reason">{{ reason }}</p>
          <ol v-for="path in operation.paths" :key="path.id" class="list-inside list-decimal">
            <li v-for="step in path.steps" :key="step">{{ step }}</li>
          </ol>
        </details>
      </section>
      <ScheduleRevisionReview
        v-if="result.baseline && result.candidate"
        :baseline="result.baseline"
        :candidate="result.candidate"
        read-only
      />
      <SchedulingPreviewResult v-if="result.candidate" :snapshot="result.candidate" read-only />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground">候选尚未发布；选定和保存须由来源确认。</p>
        <NvButton
          type="button"
          data-action="select"
          :disabled="!!actionReason || saving || selected || !result.candidate"
          :title="actionReason || (!result.candidate ? '候选安排未提供' : undefined)"
          @click="select"
          >{{
            selected ? '候选修订已保存' : saving ? '正在保存修订…' : '选定候选并保存修订'
          }}</NvButton
        >
      </div>
    </template>
  </section>
</template>

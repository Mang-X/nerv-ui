<script setup lang="ts">
import { computed } from 'vue'
import { NvButton, NvStatusBadge } from '@nerv-iip/ui'
import ScheduleRevisionReview from '../comparison/ScheduleRevisionReview.vue'
import { numberText } from '../snapshot/snapshot'
import { metricText } from './presentation'
import type { SchedulingCandidateSet } from './types'
import type { ScheduleSnapshot } from '../comparison/comparison'

const props = defineProps<{
  candidates?: SchedulingCandidateSet
  baseline?: ScheduleSnapshot
  contextKey: string
  baselineId?: string
  jobId?: string
  requestKey?: string
  pending?: boolean
  readOnly?: boolean
  disabledReason?: string
}>()
const emit = defineEmits<{
  preview: [contextKey: string, baselineId: string]
  select: [jobId: string, candidateId: string]
}>()
const stale = computed(
  () =>
    !!props.candidates &&
    (props.candidates.contextKey !== props.contextKey ||
      props.candidates.baselineId !== props.baselineId ||
      (props.jobId !== undefined && props.candidates.jobId !== props.jobId) ||
      (props.requestKey !== undefined && props.candidates.requestKey !== props.requestKey)),
)
const actionReason = computed(() =>
  props.readOnly
    ? '当前为只读'
    : props.disabledReason ||
      (props.pending ? '候选核实正在进行' : !props.baselineId ? '请先选择已保存基线' : ''),
)
const selectionReason = computed(() =>
  stale.value ? '来源范围已变化，请重新生成候选' : actionReason.value,
)
function preview() {
  if (!actionReason.value && props.baselineId) emit('preview', props.contextKey, props.baselineId)
}
function select(id: string, disabledReason?: string) {
  if (!selectionReason.value && !disabledReason && props.candidates)
    emit('select', props.candidates.jobId, id)
}
</script>

<template>
  <section class="grid gap-4 rounded-lg border border-border bg-card p-4" aria-label="局部重排候选">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="font-semibold">局部重排候选</h2>
        <p class="text-sm text-muted-foreground">
          候选来自当前已保存基线；选定后仍需由来源确认保存。
        </p>
      </div>
      <NvButton
        type="button"
        variant="outline"
        data-action="preview-candidates"
        :disabled="!!actionReason"
        :title="actionReason || undefined"
        @click="preview"
        >{{ pending ? '正在核实候选…' : candidates ? '重预览候选' : '生成重排候选' }}</NvButton
      >
    </header>
    <p v-if="actionReason" class="text-sm text-muted-foreground">{{ actionReason }}</p>
    <p v-if="stale" role="status" class="text-sm text-muted-foreground">
      来源范围已变化，请重新生成候选。
    </p>
    <p v-if="!candidates" role="status" class="text-sm text-muted-foreground">候选尚未提供。</p>
    <div
      v-else-if="!stale"
      class="grid items-start gap-4"
      :class="candidates.candidates.length === 1 ? '' : 'lg:grid-cols-2'"
    >
      <article
        v-for="candidate in candidates.candidates"
        :key="candidate.id"
        class="grid gap-4 rounded-md border border-border p-4"
      >
        <header class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold">{{ candidate.label }}</h3>
            <NvStatusBadge label="预览" tone="neutral" />
          </div>
          <NvButton
            type="button"
            data-action="select-candidate"
            :disabled="!!selectionReason || !!candidate.disabledReason"
            :title="candidate.disabledReason || selectionReason || undefined"
            @click="select(candidate.id, candidate.disabledReason)"
            >选定并进入草稿</NvButton
          >
        </header>
        <p v-if="candidate.disabledReason" class="text-xs text-muted-foreground">
          {{ candidate.disabledReason }}
        </p>
        <section aria-label="候选指标">
          <p v-if="candidate.metrics === undefined">指标未提供</p>
          <p v-else-if="!candidate.metrics.length">此来源无指标记录</p>
          <dl v-else class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="metric in candidate.metrics"
              :key="metric.id"
              class="rounded-md bg-muted/40 p-3"
            >
              <dt class="text-xs text-muted-foreground">{{ metric.label }}</dt>
              <dd class="text-right font-semibold tabular-nums">
                {{ metricText(metric.before, metric.format, metric.unit) }} →
                {{ metricText(metric.after, metric.format, metric.unit) }}
              </dd>
              <dd
                v-if="
                  metric.beforeDenominator !== undefined || metric.afterDenominator !== undefined
                "
                class="text-right text-xs tabular-nums text-muted-foreground"
              >
                分母 {{ numberText(metric.beforeDenominator) }} →
                {{ numberText(metric.afterDenominator) }}
              </dd>
              <dd class="text-right text-xs tabular-nums text-muted-foreground">
                变化
                {{ metric.deltaDisplay ?? metricText(metric.delta, metric.format, metric.unit) }}
              </dd>
            </div>
          </dl>
        </section>
        <details v-if="candidate.locked" class="text-sm">
          <summary class="cursor-pointer font-medium">
            锁定保持
            <span class="tabular-nums"
              >{{ numberText(candidate.locked.preserved) }} /
              {{ numberText(candidate.locked.total) }}</span
            >
          </summary>
          <p v-if="candidate.locked.details === undefined">逐项记录未提供</p>
          <p v-for="row in candidate.locked.details" :key="row.id" class="mt-1">
            {{ row.label }} ·
            {{ row.preserved ? '保持原位置' : row.message || '未保持，原因未提供' }}
          </p>
        </details>
        <section aria-label="移动与传播" class="grid gap-2 text-sm">
          <h4 class="font-semibold">移动原因与传播路径</h4>
          <p v-if="candidate.movements === undefined">移动明细未提供</p>
          <p v-else-if="!candidate.movements.length">本候选没有移动记录。</p>
          <details
            v-for="movement in candidate.movements"
            :key="movement.id"
            :data-movement="movement.id"
            class="rounded-md border border-border p-3"
          >
            <summary class="cursor-pointer font-medium">
              {{ movement.label }} · 展开移动明细
            </summary>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <h5 class="font-medium">原安排</h5>
                <p>
                  {{ movement.before?.resource ?? '资源未提供' }} ·
                  {{ movement.before?.start ?? '时间未提供' }} —
                  {{ movement.before?.end ?? '时间未提供' }}
                </p>
                <p
                  v-for="segment in movement.before?.segments"
                  :key="segment"
                  class="text-xs text-muted-foreground"
                >
                  分段 {{ segment }}
                </p>
              </div>
              <div>
                <h5 class="font-medium">候选安排</h5>
                <p>
                  {{ movement.after?.resource ?? '资源未提供' }} ·
                  {{ movement.after?.start ?? '时间未提供' }} —
                  {{ movement.after?.end ?? '时间未提供' }}
                </p>
                <p
                  v-for="segment in movement.after?.segments"
                  :key="segment"
                  class="text-xs text-muted-foreground"
                >
                  分段 {{ segment }}
                </p>
              </div>
            </div>
            <p v-if="movement.reasons === undefined">移动原因未提供</p>
            <p v-for="reason in movement.reasons" :key="reason">{{ reason }}</p>
            <div
              v-for="transfer in movement.transfers"
              :key="transfer.id"
              class="mt-2 rounded-md bg-muted/40 p-2"
            >
              <p>
                {{ transfer.label }} · 换型
                <span class="tabular-nums">{{ numberText(transfer.setupMinutes) }}</span> 分钟
              </p>
              <p
                v-for="source in transfer.sources"
                :key="source"
                class="text-xs text-muted-foreground"
              >
                {{ source }}
              </p>
            </div>
            <ol v-for="path in movement.paths" :key="path.id" class="mt-2 list-inside list-decimal">
              <li v-for="step in path.steps" :key="step">{{ step }}</li>
            </ol>
          </details>
        </section>
        <details v-if="candidate.explanations?.length" class="text-sm">
          <summary class="cursor-pointer font-medium">未排与约束说明</summary>
          <p v-for="item in candidate.explanations" :key="item.id" class="mt-1">
            {{ item.label }} · {{ item.message || '原因未提供' }}
          </p>
        </details>
        <details v-if="baseline && candidate.snapshot" class="text-sm">
          <summary class="cursor-pointer font-medium">基线与候选安排</summary>
          <ScheduleRevisionReview :baseline="baseline" :candidate="candidate.snapshot" read-only />
        </details>
      </article>
    </div>
  </section>
</template>

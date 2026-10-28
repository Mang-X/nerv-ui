<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  MaterialShortageSummary,
  PlanRisks,
  PlanConflicts,
  ResourceLoads,
  type SnapshotDataState,
} from '@nerv-iip/scheduling'
import { NvButton, NvStatusBadge } from '@nerv-iip/ui'
import { snapshotReading } from './snapshotFacts'
const props = { venue: 'library' as const }
const reading = shallowRef(snapshotReading(props.venue))
const revision = shallowRef(0)
const current = shallowRef(false)
const readOnly = shallowRef(false)
const warningOnly = shallowRef(false)
const state = shallowRef<SnapshotDataState>('available')
const selectedId = shallowRef('')
const records = shallowRef<{ name: string; location: string; time: string; result: string }[]>([])
const source = computed(() => ({ ...reading.value.source, state: state.value }))
const selected = computed(() => reading.value.activities.find((row) => row.id === selectedId.value))
const risks = computed(() =>
  warningOnly.value
    ? reading.value.risks.filter((row) => row.severity === 'warning')
    : reading.value.risks,
)
const conflicts = computed(() => ({
  conflicts: warningOnly.value
    ? reading.value.conflicts.filter((row) => row.severity === 'warning')
    : reading.value.conflicts,
  unscheduled: warningOnly.value ? [] : reading.value.pending,
}))
function select(id: string) {
  const activity = reading.value.activities.find((row) => row.id === id)
  if (readOnly.value || state.value !== 'available' || !activity) return
  selectedId.value = id
  records.value = [
    ...records.value,
    {
      name: activity.label,
      location: activity.location ?? '位置未提供',
      time: new Date().toLocaleTimeString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }),
      result: '已查看关联活动',
    },
  ]
}
function replace() {
  revision.value += 1
  reading.value = snapshotReading(props.venue, revision.value, current.value)
  selectedId.value = ''
}
function changeSource() {
  current.value = !current.value
  reading.value = snapshotReading(props.venue, revision.value, current.value)
  selectedId.value = ''
}
function clear() {
  reading.value = {
    ...reading.value,
    activities: [],
    shortages: [],
    risks: [],
    conflicts: [],
    pending: [],
    loads: [],
  }
  selectedId.value = ''
}
function restore() {
  reading.value = snapshotReading(props.venue, revision.value, current.value)
  selectedId.value = ''
}
const states = [
  { value: 'available', label: '可读取' },
  { value: 'unknown', label: '状态未知' },
  { value: 'missing', label: '未提供数据' },
  { value: 'forbidden', label: '无权查看' },
  { value: 'unavailable', label: '暂不可读取' },
]
</script>

<template>
  <section class="grid min-w-0 gap-6 p-2 text-sm sm:p-4" data-snapshot-page>
    <aside class="grid gap-2 rounded-lg border border-border bg-card p-4" aria-label="现场核对">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-lg font-semibold">现场核对</h2>
        <NvStatusBadge tone="warning" label="等待现场确认" />
      </div>
      <p>当前现场情况尚未确认。下方冻结记录中的预警、缺口或空记录不能替代这一步。</p>
    </aside>
    <div class="flex flex-wrap gap-2" aria-label="记录查看选项">
      <NvButton variant="outline" @click="changeSource">{{
        current ? '查看冻结记录' : '查看当前记录'
      }}</NvButton>
      <NvButton variant="outline" @click="warningOnly = !warningOnly">{{
        warningOnly ? '显示全部记录' : '仅保留预警'
      }}</NvButton>
      <NvButton variant="outline" @click="replace">替换全部记录</NvButton>
      <NvButton variant="outline" @click="clear">清空记录</NvButton>
      <NvButton variant="outline" @click="restore">恢复记录</NvButton>
      <NvButton variant="outline" :aria-pressed="readOnly" @click="readOnly = !readOnly">{{
        readOnly ? '允许查看活动' : '仅查看记录'
      }}</NvButton>
    </div>
    <label class="flex flex-wrap items-center gap-3 font-medium"
      >数据读取状态
      <select
        v-model="state"
        class="rounded-md border border-border bg-background px-3 py-2"
        aria-label="数据读取状态"
      >
        <option v-for="item in states" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </label>
    <MaterialShortageSummary :display="reading.shortages" :source="source" />
    <PlanRisks :display="risks" :source="source" :read-only="readOnly" @select="select" />
    <PlanConflicts :display="conflicts" :source="source" :read-only="readOnly" @select="select" />
    <ResourceLoads :display="reading.loads" :source="source" />
    <aside
      class="grid gap-2 rounded-lg border border-border bg-card p-4"
      aria-label="关联活动详情"
      data-snapshot-selection
    >
      <h2 class="text-lg font-semibold">关联活动详情</h2>
      <p v-if="!selected || state !== 'available'">尚未选择活动</p>
      <dl v-else class="grid gap-2">
        <div>
          <dt class="text-muted-foreground">活动</dt>
          <dd>{{ selected.label }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">位置</dt>
          <dd>{{ selected.location }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">时间</dt>
          <dd>{{ selected.time }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">结果</dt>
          <dd>{{ selected.result }}</dd>
        </div>
      </dl>
      <p v-if="readOnly">仅查看记录，关联活动动作已关闭。</p>
    </aside>
    <section class="grid gap-2" aria-label="查看记录" data-snapshot-records>
      <h2 class="text-lg font-semibold">查看记录</h2>
      <p v-if="!records.length">尚无查看记录。</p>
      <ul v-else class="grid gap-2">
        <li v-for="(record, index) in records" :key="index">
          {{ record.name }} · {{ record.location }} · {{ record.time }}（Asia/Shanghai） ·
          {{ record.result }}
        </li>
      </ul>
    </section>
  </section>
</template>

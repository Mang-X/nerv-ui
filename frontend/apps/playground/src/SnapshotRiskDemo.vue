<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  MaterialShortageSummary,
  PlanRisks,
  PlanConflicts,
  ResourceLoads,
  type SnapshotDataState,
} from '@nerv-iip/scheduling'
import { NvButton, NvStatusBadge, useColorMode, useTheme } from '@nerv-iip/ui'
import { snapshotReading } from './snapshot-risk-fixtures'
const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const reading = shallowRef(snapshotReading(props.venue))
const revision = shallowRef(0)
const current = shallowRef(false)
const readOnly = shallowRef(false)
const narrow = shallowRef(false)
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
      time: new Date().toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
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
</script>

<template>
  <main
    class="mx-auto grid max-w-7xl gap-6 p-6 text-sm"
    :class="{ 'max-w-xl': narrow }"
    data-snapshot-page
  >
    <nav class="flex flex-wrap items-center gap-3" aria-label="核对页面导航">
      <a href="#desktop" class="inline-flex min-h-11 items-center underline">返回工作空间</a>
      <a href="#schedule-draft/library" class="inline-flex min-h-11 items-center underline"
        >一起安排</a
      >
      <a href="#schedule-compare/library" class="inline-flex min-h-11 items-center underline"
        >安排对照</a
      >
      <a href="#schedule-gantt" class="inline-flex min-h-11 items-center underline">时间与空间</a>
      <a
        :href="`#schedule-snapshot/${venue === 'library' ? 'studio' : 'library'}`"
        class="inline-flex min-h-11 items-center underline"
        >{{ venue === 'library' ? '工作坊核对' : '读书会核对' }}</a
      >
    </nav>
    <header class="grid gap-3">
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ venue === 'library' ? '共读前的核对' : '创作前的核对' }}
      </h1>
      <p class="text-muted-foreground">
        查看安排记录中的用料、提醒与空间负荷，展开明细后再核对现场情况。
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
        <NvButton variant="outline" :aria-pressed="narrow" @click="narrow = !narrow">{{
          narrow ? '展开阅读宽度' : '收窄阅读宽度'
        }}</NvButton>
      </div>
    </header>
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
        <option value="available">可读取</option>
        <option value="unknown">状态未知</option>
        <option value="missing">未提供数据</option>
        <option value="forbidden">无权查看</option>
        <option value="unavailable">暂不可读取</option>
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
  </main>
</template>

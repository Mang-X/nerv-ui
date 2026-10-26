<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'
import {
  isDhtmlxAvailable,
  GanttChart,
  ResourceSchedulerBoard,
  SchedulingToolbar,
  SchedulingLegend,
  TaskDetailPanel,
  TaskFacts,
  ConflictPanel,
  UnscheduledPanel,
  ChangeSummaryPanel,
  type EngineCommand,
  type TimeScale,
  type LaneOrder,
  type ScheduleTask,
} from '@nerv-iip/scheduling'
import {
  NvButton,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  useColorMode,
  useTheme,
} from '@nerv-iip/ui'
import '@nerv-iip/scheduling/styles.css'
import { panelModel } from './schedule-panels-fixtures'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
const authority = shallowRef(panelModel(props.venue))
const vendorAvailable = shallowRef(false)
let alive = true
onBeforeUnmount(() => {
  alive = false
})
onMounted(async () => {
  const available = await isDhtmlxAvailable()
  if (alive) vendorAvailable.value = available
})
const base = panelModel(props.venue)
const selectedId = shallowRef('')
const search = shallowRef('')
const scale = shallowRef<TimeScale>('hour')
const groupBy = shallowRef('workCenter')
const laneOrder = shallowRef<LaneOrder>('name')
const readOnly = shallowRef(false)
const busy = shallowRef(false)
const dirty = shallowRef(false)
const acceptLock = shallowRef(true)
const denyLock = shallowRef(false)
const referenceVisible = shallowRef(false)
const chartVisible = shallowRef(true)
const narrow = shallowRef(false)
const sheetOpen = shallowRef(false)
const hiddenGroups = shallowRef<string[]>([])
const message = shallowRef('选择一项活动查看详情。')
const records = shallowRef<{ name: string; action: string; time: string; result: string }[]>([])
const chart = useTemplateRef<InstanceType<typeof GanttChart>>('chart')
const reference = useTemplateRef<InstanceType<typeof ResourceSchedulerBoard>>('reference')
const chartCommandReason = computed(() =>
  !chartVisible.value
    ? '活动图已收起，请先展开活动图'
    : !vendorAvailable.value
      ? '当前仅提供只读时间查看'
      : !chart.value
        ? '活动图正在打开，请稍候'
        : undefined,
)
const locateReason = computed(() => (!selected.value ? '请先选择活动' : chartCommandReason.value))
const model = computed(() => ({
  ...authority.value,
  tasks: hiddenGroups.value.includes('category')
    ? authority.value.tasks.filter((t) => !t.colorKey)
    : authority.value.tasks,
  links: hiddenGroups.value.includes('category') ? [] : authority.value.links,
}))
const activities = computed(() =>
  model.value.tasks.filter((t) => !t.blockKind && t.type === 'operation'),
)
const selected = computed(() => activities.value.find((t) => t.id === selectedId.value))
const matches = computed(() =>
  search.value.trim()
    ? activities.value.filter((t) =>
        `${t.text} ${t.display?.groupLabel ?? ''} ${t.display?.resourceLabel ?? ''}`.includes(
          search.value.trim(),
        ),
      )
    : [],
)
const matchIndex = computed(() => matches.value.findIndex((t) => t.id === selectedId.value) + 1)
const lockDisabledReason = computed(() =>
  busy.value ? '正在处理，请稍候' : denyLock.value ? '活动尚未确认' : undefined,
)
watch(activities, () => {
  if (!selected.value) selectedId.value = ''
})
watch(
  () => props.venue,
  () => {
    authority.value = panelModel(props.venue)
    selectedId.value = ''
    search.value = ''
    hiddenGroups.value = []
  },
)
function record(
  action: string,
  result: string,
  task: Pick<ScheduleTask, 'text'> | undefined = selected.value,
) {
  records.value = [
    {
      name: task?.text ?? (props.venue === 'library' ? '读书会' : '工作坊'),
      action,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      result,
    },
    ...records.value,
  ].slice(0, 12)
  message.value = result
}
function command(value: EngineCommand) {
  if (chartCommandReason.value) return
  chart.value?.command(value)
}
function select(id: string) {
  const task = activities.value.find((t) => t.id === id)
  if (!task) {
    message.value = '该活动当前不可查看。'
    return
  }
  selectedId.value = id
  if (!chartCommandReason.value) {
    command({ kind: 'selectTask', taskId: id })
    command({ kind: 'revealTask', taskId: id })
  }
  record(
    chartCommandReason.value ? '查看' : '查看并定位',
    !chartVisible.value
      ? `已选择 ${task.text}，活动图已收起；展开后点击“定位选中活动”。`
      : chartCommandReason.value
        ? `已选择 ${task.text}，${chartCommandReason.value}`
        : `已请求定位 ${task.text}`,
    task,
  )
}
function locate() {
  if (!locateReason.value) select(selectedId.value)
}
function toggleChart() {
  chartVisible.value = !chartVisible.value
  message.value = chartVisible.value
    ? selected.value
      ? vendorAvailable.value
        ? '活动图已展开，点击“定位选中活动”在图中查看所选活动。'
        : '活动图已展开，当前仅提供只读时间查看。'
      : '活动图已展开，请选择活动。'
    : '活动图已收起，仍可选择活动查看详情。'
}
function chartSelection(id: string) {
  if (selectedId.value === id) return
  const task = activities.value.find((t) => t.id === id)
  if (!task) return
  selectedId.value = id
  record('查看', `已选择 ${task.text}`, task)
}
function navigate(direction: number) {
  if (!matches.value.length) return
  const at = matches.value.findIndex((t) => t.id === selectedId.value)
  const index =
    at < 0
      ? direction > 0
        ? 0
        : matches.value.length - 1
      : (at + direction + matches.value.length) % matches.value.length
  select(matches.value[index]!.id)
}
function lock(id: string, locked: boolean) {
  const task = authority.value.tasks.find((t) => t.id === id)
  if (!task || readOnly.value || lockDisabledReason.value) return
  if (acceptLock.value) {
    authority.value = {
      ...authority.value,
      tasks: authority.value.tasks.map((t) => (t.id === id ? { ...t, locked } : t)),
    }
    dirty.value = true
  }
  record(
    locked ? '锁定' : '解锁',
    acceptLock.value ? (locked ? '已锁定活动' : '已解锁活动') : '保留原状态',
    task,
  )
}
function update() {
  authority.value = {
    ...authority.value,
    tasks: authority.value.tasks.map((t) => ({
      ...t,
      text: t.blockKind ? t.text : t.text + ' · 更新',
      facts: t.facts?.map((f) => (f.label === '反馈' ? { ...f, value: '已收到反馈' } : f)),
    })),
  }
  record('更新内容', '已更新活动内容')
}
function replace() {
  authority.value = panelModel(props.venue, true)
  search.value = ''
  selectedId.value = ''
  record('替换安排', '已切换到新的活动安排')
}
function reverse() {
  authority.value = {
    ...authority.value,
    tasks: [...authority.value.tasks].reverse(),
    conflicts: [...authority.value.conflicts].reverse(),
    changes: [...authority.value.changes].reverse(),
  }
  record('调整清单顺序', '已倒序显示清单')
}
function visibility(payload: { key: string; visible: boolean }) {
  if (payload.key !== 'category') return
  hiddenGroups.value = payload.visible ? [] : ['category']
  record(payload.visible ? '显示活动' : '隐藏活动', payload.visible ? '已显示活动' : '已隐藏活动')
}
function zoom(direction: number) {
  const levels: TimeScale[] = ['hour', 'day', 'week', 'month']
  const at = scale.value === 'auto' ? 0 : levels.indexOf(scale.value)
  scale.value = levels[Math.max(0, Math.min(3, at + direction))]!
  record('调整刻度', '已调整时间刻度')
}
function contact(order: string, operation: string) {
  const item = authority.value.unscheduled.find(
    (i) => i.orderId === order && i.operationId === operation,
  )
  if (!item || readOnly.value || busy.value) return
  record('联系组织者', `已记录 ${item.label} 的联系请求`, { text: item.label ?? '待安排活动' })
}
function restore() {
  authority.value = panelModel(props.venue)
  hiddenGroups.value = []
}
function today() {
  if (chartCommandReason.value) return
  command({ kind: 'scrollToToday' })
  record('定位当前', '已请求定位当前时间')
}
function fit() {
  if (chartCommandReason.value) return
  command({ kind: 'fitToScreen' })
  record('适配窗口', '已适配当前阅读宽度')
}
function toggleReadOnly() {
  readOnly.value = !readOnly.value
  record('切换查看方式', readOnly.value ? '当前为只读' : '可以请求调整活动状态')
}
function referenceSelect(id: string) {
  const task = base.tasks.find((t) => t.id === id)
  if (task) message.value = `参考安排 · ${task.text}`
}
</script>

<template>
  <main class="min-h-screen bg-background p-6 text-foreground">
    <header class="mb-4 flex flex-wrap items-center gap-3">
      <a :href="`#schedule-draft/${venue}`" class="underline">一起安排</a>
      <a href="#" class="underline">桌面</a
      ><a href="#schedule-gantt" class="underline">共读活动图</a>
      <a href="#schedule-resource-edit/library" class="underline">空间安排</a>
      <a
        :href="venue === 'library' ? '#schedule-panels/studio' : '#schedule-panels/library'"
        class="underline"
        >{{ venue === 'library' ? '创作工作坊' : '周一读书会' }}</a
      >
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ venue === 'library' ? '周一读书会' : '创作工作坊' }}
      </h1>
      <NvButton variant="outline" @click="toggle">{{ isDark ? '浅色' : '深色' }}</NvButton>
      <NvButton variant="outline" @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
        >主题 {{ theme }}</NvButton
      >
    </header>
    <p class="mb-4 text-sm text-muted-foreground">
      DHTMLX 9.1.4 Professional Evaluation，声明与水印保留，授权范围 UNKNOWN。查看活动与空间安排。
    </p>
    <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <label><input v-model="acceptLock" type="checkbox" />采用锁定请求</label>
      <label><input v-model="denyLock" type="checkbox" />活动待确认</label>
      <label><input v-model="busy" type="checkbox" />正在处理</label>
      <NvButton variant="outline" @click="update">更新活动内容</NvButton>
      <NvButton variant="outline" @click="reverse">倒序显示清单</NvButton>
      <NvButton variant="outline" @click="replace">替换全部活动</NvButton>
      <NvButton
        variant="outline"
        @click="
          authority = {
            ...authority,
            tasks: [],
            links: [],
            conflicts: [],
            unscheduled: [],
            changes: [],
          }
        "
        >清空活动</NvButton
      >
      <NvButton variant="outline" @click="restore">恢复活动</NvButton>
      <NvButton variant="outline" @click="narrow = !narrow">切换阅读宽度</NvButton>
      <NvButton variant="outline" @click="referenceVisible = !referenceVisible"
        >显示或收起参考图</NvButton
      >
      <NvButton variant="outline" @click="toggleChart">显示或收起活动图</NvButton>
    </div>
    <section
      :style="{ maxWidth: narrow ? '880px' : '100%' }"
      class="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div data-toolbar>
        <SchedulingToolbar
          :scale="scale"
          :read-only="readOnly"
          :can-undo="false"
          :can-redo="false"
          :dirty="dirty"
          :busy="busy"
          searchable
          :search="search"
          :match-count="matches.length"
          :match-index="matchIndex"
          search-placeholder="搜索活动或空间"
          :group-dimensions="authority.groupDimensions"
          :group-by="groupBy"
          :lane-order="laneOrder"
          :labels="{ repreview: '核对活动', release: '确认安排', dirty: '活动状态已更新' }"
          :disabled-reasons="{
            scale: !vendorAvailable ? '当前仅提供只读时间查看' : undefined,
            today: chartCommandReason,
            fit: chartCommandReason,
            undo: '没有可撤销的调整',
            redo: '没有可重做的调整',
            zoomIn: !vendorAvailable
              ? '当前仅提供只读时间查看'
              : scale === 'hour'
                ? '已到小时刻度'
                : undefined,
            zoomOut: !vendorAvailable
              ? '当前仅提供只读时间查看'
              : scale === 'month'
                ? '已到月刻度'
                : undefined,
          }"
          @update:search="search = $event"
          @search-next="navigate(1)"
          @search-prev="navigate(-1)"
          @scale-change="scale = $event"
          @zoom-in="zoom(-1)"
          @zoom-out="zoom(1)"
          @today="today"
          @fit="fit"
          @toggle-read-only="toggleReadOnly"
          @group-change="groupBy = $event"
          @lane-order-change="laneOrder = $event"
          @repreview="record('核对活动', '已记录核对请求，安排保持不变')"
          @release="record('确认安排', '已记录确认请求，安排保持不变')"
        />
      </div>
      <div class="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
        <p data-selection>选中：{{ selected?.text ?? '尚未选择活动' }}</p>
        <p data-visible-count>{{ activities.length }} 项活动</p>
        <p role="status">{{ message }}</p>
        <NvButton variant="outline" :disabled="!!locateReason" :title="locateReason" @click="locate"
          >定位选中活动</NvButton
        >
        <NvButton variant="outline" :disabled="!selected" @click="sheetOpen = true"
          >展开活动详情</NvButton
        >
      </div>
      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0">
          <div v-if="chartVisible" data-seat="panels" class="h-[400px]">
            <GanttChart
              ref="chart"
              :model="model"
              :scale="scale"
              read-only
              @task-select="chartSelection"
            />
          </div>
          <SchedulingLegend
            v-if="vendorAvailable && chartVisible"
            :model="model"
            :scale="scale"
            :categories="[{ key: 'weld', label: '活动' }]"
            category-label="活动分色"
            :hidden-groups="hiddenGroups"
            :toggleable-groups="['category']"
            :block-labels="{ maintenance: '空间整理' }"
            @toggle-category="visibility"
          />
          <NvButton
            v-if="!vendorAvailable"
            variant="outline"
            @click="visibility({ key: 'category', visible: hiddenGroups.includes('category') })"
            >{{ hiddenGroups.includes('category') ? '显示活动' : '隐藏活动' }}</NvButton
          >
          <div v-if="referenceVisible" data-seat="panels-reference">
            <div class="h-[300px]">
              <ResourceSchedulerBoard
                ref="reference"
                :model="base"
                :group-by="groupBy"
                :lane-order="laneOrder"
                :scale="scale"
                read-only
                @task-select="referenceSelect"
              />
            </div>
            <SchedulingLegend
              v-if="vendorAvailable"
              :model="base"
              :scale="scale"
              view="resource"
              :group-by="groupBy"
              :lane-order="laneOrder"
              :toggleable-groups="[]"
              :block-labels="{ maintenance: '空间整理' }"
            />
          </div>
        </div>
        <aside class="min-w-0">
          <div data-detail>
            <TaskDetailPanel
              :task="selected"
              :read-only="readOnly"
              :lock-disabled-reason="lockDisabledReason"
              :labels="{
                empty: '尚未选择活动',
                lock: '锁定活动',
                unlock: '解锁活动',
                resource: '空间',
                changeover: '准备',
              }"
              @toggle-lock="lock"
            />
          </div>
          <details class="px-4 py-3 text-sm">
            <summary>活动事实</summary>
            <TaskFacts :task="selected" empty-label="尚未选择活动" />
          </details>
        </aside>
      </div>
    </section>
    <section class="mt-4 grid gap-4 lg:grid-cols-3">
      <ConflictPanel
        :conflicts="authority.conflicts"
        :labels="{
          title: '待确认事项',
          emptyTitle: '暂无待确认事项',
          emptyDescription: '当前没有提供待确认记录。',
        }"
        @select="select"
      />
      <UnscheduledPanel
        :items="
          authority.unscheduled.map((i) => ({
            ...i,
            actionDisabledReason: busy ? '正在处理，请稍候' : i.actionDisabledReason,
          }))
        "
        :read-only="readOnly"
        :labels="{
          title: '等待安排',
          emptyTitle: '暂无待安排活动',
          emptyDescription: '当前没有提供等待安排的记录。',
        }"
        @fix="contact"
      />
      <ChangeSummaryPanel
        :changes="authority.changes"
        :tasks="authority.tasks"
        :base-tasks="base.tasks"
        :labels="{ title: '活动调整', filter: '筛选活动', emptyTitle: '暂无活动调整' }"
        @select="select"
      />
    </section>
    <section
      class="mt-4 rounded-lg border border-border p-4 text-sm"
      data-records
      aria-label="活动记录"
    >
      <h2 class="text-lg font-semibold">活动记录</h2>
      <p v-if="!records.length" class="mt-2 text-muted-foreground">尚无活动记录</p>
      <ul v-else class="mt-2 space-y-2">
        <li v-for="(entry, i) in records" :key="i" class="flex flex-wrap gap-3">
          <span>{{ entry.name }}</span
          ><span>{{ entry.action }}</span
          ><time class="tabular-nums">{{ entry.time }}</time
          ><span>{{ entry.result }}</span>
        </li>
      </ul>
    </section>
    <Sheet :open="sheetOpen" @update:open="sheetOpen = $event">
      <SheetContent class="overflow-y-auto"
        ><SheetHeader
          ><SheetTitle>活动详情</SheetTitle
          ><SheetDescription>查看当前选中的活动与事实。</SheetDescription></SheetHeader
        >
        <TaskDetailPanel
          :task="selected"
          read-only
          :labels="{ empty: '尚未选择活动', resource: '空间', changeover: '准备' }"
        />
      </SheetContent>
    </Sheet>
  </main>
</template>

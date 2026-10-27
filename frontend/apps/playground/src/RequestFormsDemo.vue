<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import { NvButton, useColorMode } from '@nerv-iip/ui'
import {
  SchedulingOrderPool,
  SchedulingSingleOrderDialog,
  type SchedulingHorizonInput,
  type SchedulingHorizonValidation,
  type SchedulingRequestItem,
  type SchedulingRequestReceipt,
  type SchedulingSingleRequest,
  type SchedulingRequestSourceState,
} from '@nerv-iip/scheduling'

const props = defineProps<{ venue: 'library' | 'studio' }>()
const { isDark, toggle } = useColorMode()
const sourceKey = computed(() => `${props.venue}:${sourceVersion.value}`)
const contextKey = computed(() => `${props.venue}-room`)
const sourceVersion = ref(1)
const state = ref<SchedulingRequestSourceState>('ready')
const readOnly = ref(false)
const selectionOnFilter = ref<'retain' | 'clear-hidden'>('retain')
const selected = ref<string[]>([])
const libraryItems: SchedulingRequestItem[] = [
  {
    key: 'session-a',
    label: '晨间共读',
    detail: '阅读室 · 适合 12 人',
    searchTerms: ['共读', '阅读'],
    dueDisplay: '2026-11-03 10:00（Asia/Shanghai）',
    urgencyDisplay: '常规',
    priority: 20,
    isRush: false,
  },
  {
    key: 'session-b',
    label: '午后交流',
    detail: '小剧场 · 适合 24 人',
    searchTerms: ['交流', '剧场'],
    dueDisplay: '2026-11-04 14:00（Asia/Shanghai）',
    urgencyDisplay: '待确认',
    priority: 40,
    isRush: false,
  },
  {
    key: 'session-c',
    label: '夜间工作坊',
    detail: '活动室 · 适合 16 人',
    searchTerms: ['工作坊', '活动'],
    dueDisplay: '2026-11-05 19:00（Asia/Shanghai）',
    urgencyDisplay: '—',
    priority: 60,
    isRush: true,
  },
]
const base: SchedulingRequestItem[] =
  props.venue === 'library'
    ? libraryItems
    : [
        {
          key: 'session-a',
          label: '陶艺入门',
          detail: '创作室 · 适合 10 人',
          searchTerms: ['陶艺', '创作'],
          dueDisplay: '2026-11-06 09:30（Asia/Shanghai）',
          urgencyDisplay: '常规',
          priority: 15,
          isRush: false,
        },
        {
          key: 'session-b',
          label: '城市速写',
          detail: '画室 · 适合 18 人',
          searchTerms: ['速写', '画室'],
          dueDisplay: '2026-11-07 14:30（Asia/Shanghai）',
          urgencyDisplay: '待确认',
          priority: 35,
          isRush: false,
        },
        {
          key: 'session-c',
          label: '木作体验',
          detail: '工坊 · 适合 8 人',
          searchTerms: ['木作', '工坊'],
          dueDisplay: '2026-11-08 19:00（Asia/Shanghai）',
          urgencyDisplay: '—',
          priority: 55,
          isRush: true,
        },
      ]
const items = shallowRef<readonly SchedulingRequestItem[]>(base)
const count = ref(0)
const dialogOpen = ref(false)
const fixedItem = shallowRef<SchedulingRequestItem | null>(null)
const initialKeyword = ref('')
const responseMode = ref<'accept' | 'reject' | 'throw' | 'hold' | 'incomplete'>('accept')
const waiting = ref<{ label: string; accept: () => void; reject: () => void }[]>([])
const notice = ref('')
const updateTimers = new Set<ReturnType<typeof setTimeout>>()
const presets = [
  { key: 'week', label: '接下来一周' },
  { key: 'fortnight', label: '接下来两周' },
]
const initialHorizon: SchedulingHorizonInput = {
  mode: 'preset',
  presetKey: 'week',
  startLocal: '',
  endLocal: '',
}
const plans =
  props.venue === 'library'
    ? [
        { key: 'existing-a', label: '已保存的晨光场次' },
        { key: 'existing-b', label: '已保存的城市夜读' },
      ]
    : [
        { key: 'existing-a', label: '已保存的陶艺场次' },
        { key: 'existing-b', label: '已保存的创作日程' },
      ]
function validateHorizon(input: Readonly<SchedulingHorizonInput>): SchedulingHorizonValidation {
  if (input.mode === 'preset')
    return presets.some((preset) => preset.key === input.presetKey)
      ? { valid: true, message: '将使用所选预设；实际时区与日期由来源核对。' }
      : { valid: false, message: '请选择可用的窗口预设。' }
  if (!input.startLocal || !input.endLocal)
    return { valid: false, message: '请填写开始和结束时间。' }
  if (input.endLocal <= input.startLocal)
    return { valid: false, message: '结束时间须晚于开始时间。' }
  const startDay = Date.UTC(...dateParts(input.startLocal))
  const endDay = Date.UTC(...dateParts(input.endLocal))
  if (!Number.isFinite(startDay) || !Number.isFinite(endDay))
    return { valid: false, message: '时间格式无法识别。' }
  if ((endDay - startDay) / 86400000 > 14)
    return { valid: false, message: '本页来源允许的日历跨度最多为 14 天。' }
  return { valid: true, message: '本页已核对日历跨度；请再确认场地时区及夏令时对所选时间的影响。' }
}
function dateParts(value: string): [number, number, number] {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return [year, month - 1, day]
}
function include(keys: string[], included: boolean) {
  const next = new Set(selected.value)
  keys.forEach((key) => (included ? next.add(key) : next.delete(key)))
  selected.value = [...next]
  notice.value = `${included ? '加入' : '移出'} ${keys.length} 项；仅本页内存。`
}
function applyState(next: SchedulingRequestSourceState) {
  state.value = next
}
function switchSource() {
  sourceVersion.value++
  items.value = base.map((item) => ({ ...item }))
  selected.value = []
  notice.value = '已切换来源，当前选择已清除。'
}
function replaceRows() {
  items.value = [
    items.value[2]!,
    { ...items.value[1]!, label: `${items.value[1]!.label} · 更新` },
    items.value[0]!,
  ]
  notice.value = '项目已重排并更新；选择仍按稳定编号。'
}
function renameFirstRow() {
  items.value = items.value.map((item) =>
    item.key === 'session-a' ? { ...item, label: '已更新的项目', searchTerms: [] } : item,
  )
  notice.value = '首个项目已改名，编号保持不变。'
}
function openFixed(index: number) {
  fixedItem.value = items.value[index] ?? null
  initialKeyword.value = ''
  dialogOpen.value = true
}
function openPicker() {
  fixedItem.value = null
  initialKeyword.value = props.venue === 'library' ? '交流' : '速写'
  dialogOpen.value = true
}
function hold<T>(label: string, accepted: T): Promise<T | false> {
  return new Promise(
    (resolve, reject) =>
      (waiting.value = [
        ...waiting.value,
        {
          label,
          accept: () => resolve(accepted),
          reject: () => reject(new Error('本页来源拒绝')),
        },
      ]),
  )
}
function settle(accept: boolean) {
  const [first, ...rest] = waiting.value
  if (!first) return
  waiting.value = rest
  if (accept) first.accept()
  else first.reject()
}
async function saveItem(
  key: string,
  draft: { readonly priority: number | null; readonly isRush: boolean },
): Promise<boolean> {
  const source = sourceKey.value
  const row = items.value.find((item) => item.key === key)
  let accepted: boolean | false
  if (responseMode.value === 'hold') accepted = await hold(`保存 ${row?.label ?? key}`, true)
  else if (responseMode.value === 'throw') throw new Error('本页来源拒绝')
  else accepted = responseMode.value === 'accept'
  if (accepted && source === sourceKey.value && row && items.value.includes(row)) {
    const timer = setTimeout(() => {
      updateTimers.delete(timer)
      if (source === sourceKey.value && items.value.includes(row)) {
        items.value = items.value.map((item) => (item === row ? { ...item, ...draft } : item))
        notice.value = `${row.label} 的更改已在本页内存中确认。`
      }
    }, 0)
    updateTimers.add(timer)
  }
  return accepted
}
async function submit(request: SchedulingSingleRequest): Promise<SchedulingRequestReceipt | false> {
  const source = sourceKey.value
  const context = contextKey.value
  const key = request.itemKey
  const mode = request.mode
  const window = { ...request.horizon }
  const current = () =>
    source === sourceKey.value &&
    context === contextKey.value &&
    dialogOpen.value &&
    !readOnly.value &&
    key === request.itemKey &&
    mode === request.mode &&
    window.mode === request.horizon.mode &&
    window.startLocal === request.horizon.startLocal &&
    window.endLocal === request.horizon.endLocal
  const receipt = {
    key: `local-${++count.value}`,
    label: `${mode === 'new' ? '新安排' : '加入安排'} · ${items.value.find((item) => item.key === key)?.label ?? key}`,
  }
  if (responseMode.value === 'incomplete') {
    // Simulate a JavaScript host crossing the TypeScript boundary with an incomplete receipt.
    return { key: receipt.key } as SchedulingRequestReceipt
  }
  let result: SchedulingRequestReceipt | false
  if (responseMode.value === 'hold') result = await hold(`请求 ${key}`, receipt)
  else if (responseMode.value === 'throw') throw new Error('本页来源拒绝')
  else result = responseMode.value === 'accept' ? receipt : false
  if (!current()) return false
  return result
}
watch(
  () => props.venue,
  () => {
    switchSource()
    dialogOpen.value = false
  },
)
watch(items, (next) => {
  if (!fixedItem.value) return
  const current = next.find((item) => item.key === fixedItem.value?.key)
  if (current) fixedItem.value = current
  else dialogOpen.value = false
})
onUnmounted(() => {
  for (const timer of updateTimers) clearTimeout(timer)
  updateTimers.clear()
  waiting.value = []
})
</script>

<template>
  <main class="mx-auto grid max-w-7xl gap-6 p-6 text-sm" data-request-forms-page>
    <nav class="flex flex-wrap gap-3" aria-label="页面导航">
      <a href="#desktop" class="underline">返回工作空间</a>
      <a
        :href="`#schedule-request/${venue === 'library' ? 'studio' : 'library'}`"
        class="underline"
        >{{ venue === 'library' ? '工作坊请求' : '读书会请求' }}</a
      >
      <a href="#schedule" class="underline">原生时间安排</a
      ><a href="#schedule-gantt" class="underline">安排图</a
      ><a href="#schedule-resources/library" class="underline">资源安排</a
      ><a href="#schedule-edit/library" class="underline">工单调整</a
      ><a href="#schedule-resource-edit/library" class="underline">资源调整</a
      ><a href="#schedule-draft/library" class="underline">草案</a
      ><a href="#schedule-panels/library" class="underline">面板</a
      ><a href="#schedule-snapshot/library" class="underline">快照</a
      ><a href="#schedule-compare/library" class="underline">对照</a
      ><a href="#schedule-async/library" class="underline">异步候选</a>
    </nav>
    <header class="grid gap-2">
      <h1 class="text-2xl font-semibold">
        {{ venue === 'library' ? '读书会项目安排' : '工作坊项目安排' }}
      </h1>
      <p class="text-muted-foreground">
        项目与确认只保存在本页内存，刷新后消失；未连接实际排程计算或后端保存。
      </p>
      <div class="flex flex-wrap gap-2">
        <NvButton type="button" variant="outline" @click="toggle">{{
          isDark ? '切换浅色' : '切换深色'
        }}</NvButton
        ><NvButton
          type="button"
          variant="outline"
          :aria-pressed="readOnly"
          @click="readOnly = !readOnly"
          >{{ readOnly ? '允许操作' : '只读查看' }}</NvButton
        >
      </div>
    </header>
    <SchedulingOrderPool
      :source-key="sourceKey"
      :state="state"
      :state-message="
        state === 'unready' ? '请先选择可使用的场地范围；目前尚未读取项目。' : undefined
      "
      :items="items"
      :selected-keys="selected"
      :read-only="readOnly"
      :selection-on-filter="selectionOnFilter"
      :save-item="saveItem"
      @include="include"
      @retry="state = 'loading'"
    >
      <template #scope
        ><span class="text-sm text-muted-foreground">{{
          venue === 'library' ? '阅读室' : '活动室'
        }}</span></template
      >
    </SchedulingOrderPool>
    <section class="grid gap-3 rounded-lg border border-border bg-card p-4">
      <h2 class="font-semibold">选择保留方式</h2>
      <div class="flex gap-2">
        <NvButton
          type="button"
          variant="outline"
          :aria-pressed="selectionOnFilter === 'retain'"
          @click="selectionOnFilter = 'retain'"
          >筛选后保留选择</NvButton
        ><NvButton
          type="button"
          variant="outline"
          :aria-pressed="selectionOnFilter === 'clear-hidden'"
          @click="selectionOnFilter = 'clear-hidden'"
          >筛选后清除隐藏项</NvButton
        >
      </div>
      <p class="text-muted-foreground">
        已选编号：<span class="font-mono text-xs">{{ selected.join('、') || '—' }}</span>
      </p>
    </section>
    <section class="grid gap-3 rounded-lg border border-border bg-card p-4">
      <h2 class="font-semibold">从不同位置发起</h2>
      <p class="text-muted-foreground">已知目标可直接核对；从相关记录进入时先搜索并人工选择。</p>
      <div class="flex flex-wrap gap-2">
        <NvButton type="button" variant="outline" data-entry="list" @click="openFixed(0)"
          >项目清单 · {{ items[0]?.label || '项目' }}</NvButton
        ><NvButton type="button" variant="outline" data-entry="detail" @click="openFixed(1)"
          >项目详情 · {{ items[1]?.label || '项目' }}</NvButton
        ><NvButton type="button" variant="outline" data-entry="suggestion" @click="openFixed(2)"
          >安排建议 · {{ items[2]?.label || '项目' }}</NvButton
        ><NvButton type="button" variant="outline" data-entry="related" @click="openPicker"
          >关联记录 · 选择项目</NvButton
        >
      </div>
    </section>
    <section
      class="grid gap-3 rounded-lg border border-border bg-card p-4"
      aria-label="本页状态设置"
    >
      <h2 class="font-semibold">本页状态设置</h2>
      <p class="text-muted-foreground">
        可查看来源未就绪、失败、项目变化和确认结果；这些设置只作用于本页。
      </p>
      <div class="flex flex-wrap gap-2">
        <NvButton
          v-for="next in ['unready', 'loading', 'error', 'ready'] as const"
          :key="next"
          type="button"
          size="sm"
          variant="outline"
          :data-state="next"
          @click="applyState(next)"
          >{{
            { unready: '范围未就绪', loading: '读取中', error: '读取失败', ready: '显示项目' }[next]
          }}</NvButton
        ><NvButton type="button" size="sm" variant="outline" @click="items = []"
          >显示空结果</NvButton
        ><NvButton
          type="button"
          size="sm"
          variant="outline"
          @click="items = base.map((item) => ({ ...item }))"
          >恢复项目</NvButton
        ><NvButton type="button" size="sm" variant="outline" @click="replaceRows"
          >重排并更新</NvButton
        ><NvButton type="button" size="sm" variant="outline" @click="renameFirstRow"
          >更新首个项目名称</NvButton
        ><NvButton type="button" size="sm" variant="outline" @click="switchSource"
          >切换来源</NvButton
        >
      </div>
      <div class="flex flex-wrap gap-2">
        <NvButton
          v-for="response in ['accept', 'reject', 'throw', 'hold', 'incomplete'] as const"
          :key="response"
          type="button"
          size="sm"
          variant="outline"
          :aria-pressed="responseMode === response"
          :data-response="response"
          @click="responseMode = response"
          >{{
            {
              accept: '来源接受',
              reject: '来源未确认',
              throw: '来源失败',
              hold: '等待来源确认',
              incomplete: '来源回执缺信息',
            }[response]
          }}</NvButton
        ><NvButton
          type="button"
          size="sm"
          variant="outline"
          :disabled="!waiting.length"
          data-action="confirm-pending"
          @click="settle(true)"
          >接受待处理请求</NvButton
        ><NvButton
          type="button"
          size="sm"
          variant="outline"
          :disabled="!waiting.length"
          data-action="reject-pending"
          @click="settle(false)"
          >拒绝待处理请求</NvButton
        >
      </div>
      <p v-if="waiting.length" role="status">待处理：{{ waiting[0]?.label }}</p>
      <p v-if="notice" role="status">{{ notice }}</p>
    </section>
    <SchedulingSingleOrderDialog
      v-model:open="dialogOpen"
      :source-key="sourceKey"
      :context-key="contextKey"
      :context-label="venue === 'library' ? '阅读室' : '活动室'"
      :fixed-item="fixedItem"
      :initial-keyword="initialKeyword"
      :candidate-state="state"
      :candidate-message="state === 'unready' ? '场地范围未就绪，尚未读取可选项目。' : undefined"
      :candidates="items"
      :initial-horizon="initialHorizon"
      :presets="presets"
      timezone-label="Asia/Shanghai 场地时区的本地时间"
      :validate-horizon="validateHorizon"
      :plans="plans"
      :read-only="readOnly"
      :submit="submit"
      @retry:candidates="state = 'loading'"
    />
  </main>
</template>

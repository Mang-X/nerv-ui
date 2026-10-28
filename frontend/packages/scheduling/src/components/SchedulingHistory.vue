<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { NvButton, NvInput, NvStatusBadge } from '@nerv-iip/ui'
import type {
  SchedulingHistoryAction,
  SchedulingHistoryEntry,
  SchedulingHistoryInput,
} from './history-types'
import { cloneModel } from '../model/clone'

const props = withDefaults(
  defineProps<{
    input: SchedulingHistoryInput
    readOnly?: boolean
    pageSize?: number
    confirm?: SchedulingHistoryAction
    download?: SchedulingHistoryAction
  }>(),
  { pageSize: 5 },
)
const emit = defineEmits<{ retry: [] }>()
defineSlots<{ detail(props: { entry: SchedulingHistoryEntry }): unknown }>()
const query = shallowRef('')
const status = shallowRef('')
const date = shallowRef('')
const page = shallowRef(1)
const selected = shallowRef<SchedulingHistoryEntry>()
const confirming = shallowRef(false)
const busy = shallowRef<'confirm' | 'download'>()
const message = shallowRef('')
let controller: AbortController | undefined
let disposed = false
function cancel() {
  controller?.abort()
  controller = undefined
  busy.value = undefined
  message.value = ''
  confirming.value = false
}
function goPage(delta: number) {
  page.value += delta
  cancel()
}
function clearFilters() {
  cancel()
  query.value = ''
  status.value = ''
  date.value = ''
}
function close() {
  cancel()
  selected.value = undefined
}
watch(
  () => props.input,
  () => {
    close()
    page.value = 1
  },
  { deep: true, flush: 'sync' },
)
watch(
  () => props.pageSize,
  () => {
    cancel()
    page.value = 1
  },
  { flush: 'sync' },
)
watch(() => [props.readOnly, props.confirm, props.download], cancel, { flush: 'sync' })
watch(
  [query, status, date],
  () => {
    page.value = 1
    cancel()
  },
  { flush: 'sync' },
)
onBeforeUnmount(() => {
  disposed = true
  close()
})
const statuses = computed(() => [
  ...new Map(props.input.entries.map((e) => [e.status.key, e.status.label])).entries(),
])
const filtered = computed(() =>
  props.input.state === 'ready'
    ? props.input.entries.filter(
        (e) =>
          e.label.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()) &&
          (!status.value || e.status.key === status.value) &&
          (!date.value || localDate(e) === date.value),
      )
    : [],
)
const pages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / Math.max(1, props.pageSize))),
)
const visible = computed(() =>
  filtered.value.slice(
    (page.value - 1) * Math.max(1, props.pageSize),
    page.value * Math.max(1, props.pageSize),
  ),
)
function localDate(entry: SchedulingHistoryEntry) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: entry.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(entry.createdAt))
  } catch {
    return ''
  }
}
function time(entry: SchedulingHistoryEntry) {
  try {
    return (
      new Intl.DateTimeFormat('zh-CN', {
        timeZone: entry.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(entry.createdAt)) +
      ' · ' +
      entry.timezone
    )
  } catch {
    return '时间未知'
  }
}
function open(entry: SchedulingHistoryEntry) {
  cancel()
  selected.value = {
    ...entry,
    status: { ...entry.status },
    confirmation: entry.confirmation ? { ...entry.confirmation } : undefined,
    model: entry.model ? cloneModel(entry.model) : undefined,
  }
}
async function act(kind: 'confirm' | 'download') {
  const action = kind === 'confirm' ? props.confirm : props.download
  const entry = selected.value
  if (
    disposed ||
    busy.value ||
    !entry ||
    !action ||
    props.input.state !== 'ready' ||
    (kind === 'confirm' &&
      (props.readOnly || !entry.confirmation || entry.confirmation.disabledReason))
  )
    return
  const request = new AbortController()
  controller = request
  busy.value = kind
  message.value = ''
  const current = () => !disposed && controller === request && !request.signal.aborted
  try {
    const ok = await action(
      {
        ...entry,
        status: { ...entry.status },
        confirmation: entry.confirmation ? { ...entry.confirmation } : undefined,
        model: entry.model ? cloneModel(entry.model) : undefined,
      },
      { signal: request.signal, source: props.input.source, revision: props.input.revision },
    )
    if (current()) {
      message.value =
        ok === true ? (kind === 'download' ? '下载已准备。' : '操作已确认。') : '未能完成，请重试。'
      if (ok === true) confirming.value = false
    }
  } catch {
    if (current()) message.value = '未能完成，请稍后重试。'
  } finally {
    if (current()) {
      busy.value = undefined
      controller = undefined
    }
  }
}
</script>

<template>
  <section class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4" aria-label="历史安排">
    <div class="flex flex-wrap gap-3">
      <label>搜索安排<NvInput v-model="query" aria-label="搜索安排" /></label>
      <label
        >状态<select
          v-model="status"
          aria-label="历史状态"
          class="block rounded border bg-card p-2"
        >
          <option value="">全部状态</option>
          <option v-for="[key, label] in statuses" :key="key" :value="key">{{ label }}</option>
        </select></label
      >
      <label>记录日（各记录时区）<NvInput v-model="date" type="date" aria-label="记录日" /></label>
      <NvButton variant="outline" @click="clearFilters">清空筛选</NvButton>
    </div>
    <p v-if="input.state === 'loading'" role="status">正在读取历史安排…</p>
    <div v-else-if="input.state === 'error'" role="alert">
      暂时无法读取历史安排。<NvButton @click="emit('retry')">重试</NvButton>
    </div>
    <template v-else>
      <div class="min-w-0 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="text-left">安排</th>
              <th class="text-left">状态</th>
              <th class="text-left">记录时间</th>
              <th class="text-right">数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in visible" :key="entry.key" class="border-b">
              <td class="p-2">
                {{ entry.label
                }}<span class="block font-mono text-xs text-muted-foreground">{{ entry.key }}</span>
              </td>
              <td><NvStatusBadge :label="entry.status.label" :tone="entry.status.tone" /></td>
              <td>{{ time(entry) }}</td>
              <td class="text-right tabular-nums">
                {{
                  entry.quantity === null
                    ? '—'
                    : entry.quantity.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
                }}
              </td>
              <td>
                <NvButton variant="outline" @click="open(entry)">明细 · {{ entry.label }}</NvButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filtered.length" role="status">没有符合条件的安排，可清空筛选或返回工作台。</p>
      <nav aria-label="历史分页" class="flex items-center gap-3">
        <NvButton :disabled="page <= 1" variant="outline" @click="goPage(-1)">上一页</NvButton
        ><span>{{ page }} / {{ pages }} · {{ filtered.length }} 项</span
        ><NvButton :disabled="page >= pages" variant="outline" @click="goPage(1)">下一页</NvButton>
      </nav>
    </template>
    <section
      v-if="selected"
      aria-label="历史明细"
      class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 rounded-lg border bg-card p-4"
    >
      <h2 class="font-semibold">{{ selected.label }} · 已选快照</h2>
      <p>列表翻页不更换此快照，当前草案独立保留。</p>
      <slot name="detail" :entry="selected" />
      <div class="flex flex-wrap gap-2">
        <NvButton variant="outline" @click="close">关闭明细</NvButton
        ><NvButton :disabled="!download || !!busy" @click="act('download')">{{
          busy === 'download' ? '正在准备下载…' : '下载安排'
        }}</NvButton
        ><NvButton
          v-if="selected.confirmation"
          :disabled="readOnly || !confirm || !!busy || !!selected.confirmation.disabledReason"
          :title="selected.confirmation.disabledReason"
          @click="confirming = true"
          >{{ selected.confirmation.label }}</NvButton
        >
      </div>
      <section v-if="confirming" aria-label="确认操作" class="rounded border p-3">
        <p>{{ selected.confirmation?.description }}</p>
        <NvButton :disabled="!!busy" @click="act('confirm')">{{
          busy === 'confirm' ? '正在确认…' : '确认操作'
        }}</NvButton
        ><NvButton variant="outline" @click="cancel">取消操作</NvButton>
      </section>
      <NvButton v-if="busy" variant="outline" @click="cancel">取消等待</NvButton>
      <p role="status">{{ message }}</p>
    </section>
  </section>
</template>

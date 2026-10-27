<script lang="ts">
let printSequence = 0
</script>
<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { dayWindow, entriesOnDay } from './day-window'
import SchedulingDaySheet from './SchedulingDaySheet.vue'
import type { SchedulingDayEntry } from './types'
import './day-print.css'

const props = defineProps<{
  entries: readonly SchedulingDayEntry[]
  date: string
  groupId: string
  timezone: string
  title: string
  planLabel?: string
  statusLabel?: string
  readOnly?: boolean
  readOnlyReason?: string
}>()
const emit = defineEmits<{ 'update:date': [date: string]; 'update:groupId': [groupId: string] }>()
const owner = `nv-day-${++printSequence}`
const printing = ref(false)
const printError = ref('')
const validDay = computed(() => !!dayWindow(props.date, props.timezone))
const groups = computed(() =>
  [...new Map(props.entries.map((entry) => [entry.groupId, entry.groupLabel])).entries()].sort(
    (a, b) => a[1].localeCompare(b[1]),
  ),
)
const visible = computed(() =>
  entriesOnDay(props.entries, props.date, props.timezone, props.groupId),
)
const groupLabel = computed(() =>
  props.groupId === 'all'
    ? '全部分组'
    : (groups.value.find(([id]) => id === props.groupId)?.[1] ?? '未知分组'),
)
let timeout: ReturnType<typeof setTimeout> | undefined
let focusTimeout: ReturnType<typeof setTimeout> | undefined
let printReturned = false

function cleanup() {
  window.removeEventListener('beforeprint', beforePrint)
  window.removeEventListener('afterprint', cleanup)
  window.removeEventListener('focus', onFocus)
  if (timeout) clearTimeout(timeout)
  if (focusTimeout) clearTimeout(focusTimeout)
  timeout = undefined
  focusTimeout = undefined
  printReturned = false
  if (document.body.getAttribute('data-nv-day-print-owner') === owner)
    document.body.removeAttribute('data-nv-day-print-owner')
  printing.value = false
}
function beforePrint() {
  if (document.body.getAttribute('data-nv-day-print-owner') !== owner) cleanup()
}
function onFocus() {
  if (printing.value && printReturned && !focusTimeout) focusTimeout = setTimeout(cleanup, 500)
}
function requestDate(event: Event) {
  emit('update:date', (event.target as HTMLInputElement).value)
  ;(event.target as HTMLInputElement).value = props.date
}
function requestGroup(event: Event) {
  emit('update:groupId', (event.target as HTMLSelectElement).value)
  ;(event.target as HTMLSelectElement).value = props.groupId
}
async function printDay() {
  if (!validDay.value || !visible.value.length || props.readOnly) return
  const current = document.body.getAttribute('data-nv-day-print-owner')
  if (current && current !== owner) return
  if (printing.value) return
  printError.value = ''
  document.body.setAttribute('data-nv-day-print-owner', owner)
  printing.value = true
  printReturned = false
  window.addEventListener('beforeprint', beforePrint)
  window.addEventListener('afterprint', cleanup)
  window.addEventListener('focus', onFocus)
  timeout = setTimeout(cleanup, 300000)
  try {
    await nextTick()
    if (printing.value) {
      window.print()
      printReturned = true
    }
  } catch {
    printError.value = '打印未打开，请重试。'
    cleanup()
  }
}
onUnmounted(cleanup)
watch(
  () => [props.date, props.groupId, props.timezone, props.entries],
  () => {
    if (printing.value) cleanup()
  },
)
</script>

<template>
  <section class="nv-day-schedule" :aria-label="title">
    <div class="nv-day-actions" data-no-print>
      <label>日期 <input type="date" :value="date" @change="requestDate" /></label>
      <label
        >分组
        <select :value="groupId" @change="requestGroup">
          <option value="all">全部分组</option>
          <option v-for="[id, label] in groups" :key="id" :value="id">{{ label }}</option>
        </select></label
      >
      <button
        type="button"
        data-action="print-day"
        :disabled="!validDay || !visible.length || readOnly"
        @click="printDay"
      >
        打印日安排
      </button>
    </div>
    <p v-if="!validDay" role="status">日期或时区未解析，无法筛选或打印。</p>
    <p v-else-if="readOnly && readOnlyReason" role="status">{{ readOnlyReason }}</p>
    <p v-if="printError" role="alert">{{ printError }}</p>
    <SchedulingDaySheet
      :entries="visible"
      :date="date"
      :group-label="groupLabel"
      :timezone="timezone"
      :title="title"
      :plan-label="planLabel"
      :status-label="statusLabel"
    />
    <Teleport to="body"
      ><div
        v-if="printing"
        class="nv-day-print-target"
        data-nv-day-print-active
        :data-print-owner="owner"
      >
        <SchedulingDaySheet
          :entries="visible"
          :date="date"
          :group-label="groupLabel"
          :timezone="timezone"
          :title="title"
          :plan-label="planLabel"
          :status-label="statusLabel"
        /></div
    ></Teleport>
  </section>
</template>

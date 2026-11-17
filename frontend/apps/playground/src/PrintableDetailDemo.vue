<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import {
  NvButton,
  NvDialog,
  NvDialogContent,
  NvDialogHeader,
  NvDialogTitle,
  NvDialogDescription,
  useColorMode,
} from '@nerv-iip/ui'
import RecordDetailBody from './RecordDetailBody.vue'
import './printable-detail.css'
const records = [
  {
    id: 'READ-028',
    title: '阅读摘记',
    status: '已整理',
    amount: 12.125,
    unit: '页',
    time: '2026-10-28T08:30:00+08:00',
    note: '沿着河岸读完这一章。记下关于花园和季节的段落，留待下次读书会慢慢讨论。',
  },
  {
    id: 'CRAFT-016',
    title: '手作记录',
    status: '已整理',
    amount: 2.5,
    unit: '小时',
    time: '2026-10-27T16:15:00+08:00',
    note: '完成陶杯的初步修整。杯沿还需要耐心打磨，下次先检查干燥情况，再决定上釉的时间。',
  },
]
const current = ref<(typeof records)[number]>()
const opened = ref(false)
const printing = ref(false)
const error = ref('')
const { isDark, toggle } = useColorMode()
let request: object | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let focusTimer: ReturnType<typeof setTimeout> | undefined
let returned = false
const target = ref<HTMLElement>()
// Unique per mounted recipe; no global coordinator or scheduling dependency.
const owner = `detail-${crypto.randomUUID()}`
function cleanup() {
  request = undefined
  window.removeEventListener('afterprint', cleanup)
  window.removeEventListener('focus', onFocus)
  if (timer) clearTimeout(timer)
  if (focusTimer) clearTimeout(focusTimer)
  timer = focusTimer = undefined
  returned = false
  target.value?.removeAttribute('data-detail-print-active')
  if (document.body.getAttribute('data-detail-print-owner') === owner)
    document.body.removeAttribute('data-detail-print-owner')
  printing.value = false
}
function onFocus() {
  if (returned && !focusTimer) focusTimer = setTimeout(cleanup, 500)
}
async function printRecord() {
  if (
    !opened.value ||
    !current.value ||
    request ||
    document.body.hasAttribute('data-detail-print-owner') ||
    document.body.hasAttribute('data-nv-day-print-owner')
  )
    return
  const token = {}
  request = token
  error.value = ''
  document.body.setAttribute('data-detail-print-owner', owner)
  printing.value = true
  window.addEventListener('afterprint', cleanup)
  window.addEventListener('focus', onFocus)
  timer = setTimeout(cleanup, 300000)
  try {
    await nextTick()
    if (request !== token || document.body.getAttribute('data-detail-print-owner') !== owner) return
    window.print()
    if (request === token) returned = true
  } catch {
    if (request === token) {
      error.value = '打印未打开，请重试。'
      cleanup()
    }
  }
}
watch([opened, current], cleanup, { flush: 'sync' })
onUnmounted(cleanup)
function select(index: number) {
  current.value = records[index]
  opened.value = true
  error.value = ''
}
</script>
<template>
  <main class="mx-auto max-w-3xl space-y-6 p-6 text-foreground">
    <a href="#desktop" class="text-brand-strong underline">返回桌面</a>
    <h1 class="text-2xl font-semibold">生活手记</h1>
    <NvButton variant="outline" @click="toggle">{{ isDark ? '切换浅色' : '切换深色' }}</NvButton>
    <p class="text-sm text-muted-foreground">打开一份手记查看详情。打印不会保存或修改内容。</p>
    <div class="flex gap-3">
      <NvButton
        v-for="(record, index) in records"
        :key="record.id"
        :data-open="index"
        variant="outline"
        @click="select(index)"
        >{{ record.title }}</NvButton
      >
    </div>
    <NvDialog v-model:open="opened">
      <NvDialogContent class="max-h-[85vh] overflow-y-auto">
        <NvDialogHeader
          ><NvDialogTitle>{{ current?.title }}</NvDialogTitle
          ><NvDialogDescription>只读手记详情，可打印留存。</NvDialogDescription></NvDialogHeader
        >
        <RecordDetailBody v-if="current" :record="current" />
        <p v-if="error" role="alert">{{ error }}</p>
        <div data-print-hidden class="flex justify-end gap-3">
          <NvButton data-close variant="outline" @click="opened = false">关闭</NvButton
          ><NvButton data-print variant="outline" :disabled="printing" @click="printRecord"
            >打印详情</NvButton
          >
        </div>
      </NvDialogContent>
    </NvDialog>
    <Teleport to="body"
      ><article
        v-if="printing && current"
        ref="target"
        class="nv-detail-print-target"
        data-detail-print-active
        :data-owner="owner"
      >
        <RecordDetailBody :record="current" /></article
    ></Teleport>
  </main>
</template>

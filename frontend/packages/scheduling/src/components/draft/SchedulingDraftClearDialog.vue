<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  NvAlertDialog,
  NvAlertDialogCancel,
  NvAlertDialogContent,
  NvAlertDialogDescription,
  NvAlertDialogFooter,
  NvAlertDialogHeader,
  NvAlertDialogTitle,
  NvButton,
} from '@nerv-iip/ui'
import type { SchedulingEditControl } from '../../composables/useSchedulingEdits'
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{
  pending?: boolean
  disabled?: boolean
  scopeKey?: unknown
  clear?: (control: SchedulingEditControl) => Promise<boolean>
}>()
const emit = defineEmits<{ cleared: []; 'update:pending': [pending: boolean] }>()
const localPending = shallowRef(false)
watch(localPending, (value) => emit('update:pending', value), { flush: 'sync' })
const message = shallowRef('')
const busy = computed(() => Boolean(props.pending || localPending.value))
let controller: AbortController | undefined
let disposed = false
function cancel() {
  controller?.abort()
  controller = undefined
  localPending.value = false
  message.value = ''
}
watch(() => [props.scopeKey, props.clear, props.disabled], cancel, { deep: true, flush: 'sync' })
watch(open, cancel, { flush: 'sync' })
onBeforeUnmount(() => {
  disposed = true
  cancel()
})
async function confirm() {
  if (disposed || !open.value || busy.value || props.disabled) return
  if (!props.clear) {
    message.value = '尚未提供清空方式，草案仍保留。'
    return
  }
  const current = new AbortController()
  controller = current
  localPending.value = true
  message.value = '正在清空…'
  const active = () => !disposed && controller === current && !current.signal.aborted && open.value
  try {
    const success = await props.clear({ signal: current.signal, context: undefined })
    if (!active()) return
    if (success === true) {
      open.value = false
      emit('cleared')
    } else message.value = '未能清空，草案仍保留，可重试。'
  } catch (error) {
    if (active())
      message.value =
        error instanceof Error
          ? `未能清空：${error.message}。可重试。`
          : '未能清空，草案仍保留，可重试。'
  } finally {
    if (active()) {
      localPending.value = false
      controller = undefined
    }
  }
}
</script>
<template>
  <NvAlertDialog v-model:open="open">
    <NvAlertDialogContent @escape-key-down="busy && $event.preventDefault()">
      <NvAlertDialogHeader
        ><NvAlertDialogTitle>确认清空当前方案草稿？</NvAlertDialogTitle
        ><NvAlertDialogDescription
          >清空范围由当前安排提供方确定。操作成功前会保留草案；其他方案不受影响。</NvAlertDialogDescription
        ></NvAlertDialogHeader
      >
      <p role="status" class="text-sm">{{ message }}</p>
      <NvAlertDialogFooter
        ><NvAlertDialogCancel :disabled="busy">取消</NvAlertDialogCancel
        ><NvButton
          data-clear-confirm
          variant="destructive"
          :disabled="busy || disabled"
          @click="confirm"
          >确认清空</NvButton
        ></NvAlertDialogFooter
      >
    </NvAlertDialogContent>
  </NvAlertDialog>
</template>

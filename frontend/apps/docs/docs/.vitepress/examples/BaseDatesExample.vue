<script setup lang="ts">
import { computed, ref } from 'vue'
import { DatePicker, DateRangePicker, NvButton, type DateRangeValue } from '@nerv-ui/ui'
const single = ref<string | null>('2026-06-18')
const range = ref<DateRangeValue | null>({ from: '2026-06-10', to: '2026-06-18' })
const disabled = ref(false)
const singleFeedback = ref('尚未采用')
const rangeFeedback = ref('尚未采用')
const rangeText = computed(() => describeRange(range.value))
function describeRange(value: DateRangeValue | null) {
  return value ? `${value.from || '待选起点'} → ${value.to || '待选终点'}` : '未选择'
}
function replace(restore = false) {
  single.value = restore ? '2026-06-18' : '2026-07-08'
  range.value = restore
    ? { from: '2026-06-10', to: '2026-06-18' }
    : { from: '2026-07-08', to: '2026-07-12' }
  singleFeedback.value = rangeFeedback.value = restore ? '已外部恢复' : '已外部替换'
}
</script>

<template>
  <section class="flex min-w-0 flex-col gap-4" aria-label="基础日期安排">
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="disabled = !disabled">
        {{ disabled ? '启用日期入口' : '禁用日期入口' }}
      </NvButton>
      <NvButton variant="outline" @click="replace()">外部替换</NvButton>
      <NvButton variant="outline" @click="replace(true)">恢复初始安排</NvButton>
    </div>
    <p>日期入口：{{ disabled ? '已禁用' : '可操作' }}</p>
    <div data-single-picker class="flex min-w-0 flex-col gap-2">
      <h3>单日安排</h3>
      <DatePicker
        v-model="single"
        :disabled="disabled"
        class="w-full"
        @apply="singleFeedback = `已采用：${$event ?? '未选择'}`"
        @clear="singleFeedback = '已清除'"
      />
      <p data-single-value class="break-words">{{ single ?? '未选择' }}</p>
      <p data-single-feedback role="status">{{ singleFeedback }}</p>
    </div>
    <div data-range-picker class="flex min-w-0 flex-col gap-2">
      <h3>范围安排</h3>
      <DateRangePicker
        v-model="range"
        :disabled="disabled"
        class="w-full"
        @apply="rangeFeedback = `已采用：${describeRange($event)}`"
        @clear="rangeFeedback = '已清除'"
      />
      <p data-range-value class="break-words">{{ rangeText }}</p>
      <p data-range-feedback role="status">{{ rangeFeedback }}</p>
    </div>
  </section>
</template>

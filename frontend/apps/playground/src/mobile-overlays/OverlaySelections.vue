<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { NvMobileButton, NvPicker, NvMobileDatePicker } from '@nerv-iip/ui-mobile'
const places = [
  { label: '湖畔', value: 'lake' },
  { label: '林间', value: 'woods' },
  { label: '庭院', value: 'garden' },
]
const place = shallowRef('lake')
const reversed = shallowRef(false)
const empty = shallowRef(false)
const options = computed(() => (empty.value ? [] : reversed.value ? [...places].reverse() : places))
const placeLabel = computed(() => places.find((p) => p.value === place.value)?.label ?? '待选择')
const pickerOpen = shallowRef(false)
const dateOpen = shallowRef(false)
const date = shallowRef('2024-01-31')
function reset() {
  place.value = 'lake'
  date.value = '2024-01-31'
}
</script>

<template>
  <section
    aria-labelledby="selection-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="selection-heading" class="text-lg font-semibold">选个去处与日子</h2>
    <p class="text-sm text-muted-foreground">滚动高亮项，确定才收下；取消保留上次选择。</p>
    <output aria-label="去处回显" class="block text-sm">{{ placeLabel }} · {{ place }}</output>
    <div class="flex flex-wrap gap-3">
      <NvMobileButton @click="pickerOpen = true">选择去处</NvMobileButton>
      <NvMobileButton variant="outline" @click="reversed = !reversed">重排去处</NvMobileButton>
    </div>
    <label class="flex min-h-touch items-center gap-3 text-sm"
      ><input v-model="empty" type="checkbox" aria-label="暂无去处选项" />暂无去处选项</label
    >
    <output aria-label="日期回显" class="block text-sm">{{ date }}</output>
    <p class="text-xs text-muted-foreground">
      年份范围 2023–2025；月末随年月调整，使用 YYYY-MM-DD。
    </p>
    <div class="flex flex-wrap gap-3">
      <NvMobileButton @click="dateOpen = true">选择日期</NvMobileButton>
      <NvMobileButton variant="outline" @click="reset">恢复选择</NvMobileButton>
    </div>
    <NvPicker v-model:open="pickerOpen" v-model="place" :options="options" title="想去哪里" />
    <NvMobileDatePicker
      v-model:open="dateOpen"
      v-model="date"
      :min-year="2023"
      :max-year="2025"
      title="哪天出发"
    />
  </section>
</template>

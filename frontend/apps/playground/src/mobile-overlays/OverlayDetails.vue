<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  NvActionSheet,
  NvMobileButton,
  NvMobileCollapse,
  NvMobileDropdownMenu,
  NvMobileDropdownMenuItem,
} from '@nerv-iip/ui-mobile'
const actions = [
  { label: '收好心愿', value: 'save' },
  { label: '暂时收起', value: 'archive', danger: true },
]
const reversed = shallowRef(false)
const actionOptions = computed(() => (reversed.value ? [...actions].reverse() : actions))
const actionOpen = shallowRef(false)
const selectedAction = shallowRef('')
const actionLabel = computed(() => actions.find((a) => a.value === selectedAction.value)?.label)
const time = shallowRef<string | number>()
const pace = shallowRef<string | number>()
const times = [
  { label: '清晨', value: 'morning' },
  { label: '傍晚', value: 'evening' },
]
const paces = [
  { label: '随心走', value: 1 },
  { label: '慢慢来', value: 2 },
]
const changed = shallowRef('尚无 change')
function record(value: string | number) {
  changed.value = `change：${typeof value} ${value}`
}
const expanded = shallowRef(false)
</script>

<template>
  <section
    aria-labelledby="details-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="details-heading" class="text-lg font-semibold">随心做些选择</h2>
    <div class="flex flex-wrap gap-3">
      <NvMobileButton @click="actionOpen = true">打开动作</NvMobileButton>
      <NvMobileButton variant="outline" @click="reversed = !reversed">重排动作</NvMobileButton>
    </div>
    <output aria-label="动作回显" class="block text-sm">{{
      selectedAction ? `${actionLabel} · ${selectedAction}` : '尚未选择动作'
    }}</output>
    <p class="text-xs text-muted-foreground">
      动作选中即回传，取消不选择；下拉每组只打开一项，点下方遮罩关闭。
    </p>
    <NvMobileDropdownMenu>
      <NvMobileDropdownMenuItem v-model="time" title="时段" :options="times" @change="record" />
      <NvMobileDropdownMenuItem v-model="pace" title="节奏" :options="paces" @change="record" />
    </NvMobileDropdownMenu>
    <output aria-label="筛选回显" class="block text-sm"
      >{{ time ?? '未选时段' }} · {{ pace ?? '未选节奏' }} · {{ changed }}</output
    >
    <NvMobileCollapse v-model:open="expanded">
      <template #title><span class="font-medium">随行提示</span></template>
      <p>留出空白，也是一种安排。</p>
      <NvMobileButton variant="text" @click="expanded = false">收起提示</NvMobileButton>
    </NvMobileCollapse>
    <output aria-label="提示展开状态" class="block text-xs text-muted-foreground">{{
      expanded ? '提示已展开' : '提示已收起'
    }}</output>
    <NvActionSheet
      v-model:open="actionOpen"
      title="如何收好心愿"
      :actions="actionOptions"
      @select="selectedAction = $event"
    />
  </section>
</template>

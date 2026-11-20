<script setup lang="ts">
import { computed, ref } from 'vue'
import { NvLineChart, NvButton, type NvLineBand, type NvLineMarker } from '@nerv-ui/ui'
const props = defineProps<{ space: 'library' | 'garden' }>()
const reversed = ref(false)
const alternate = ref(false)
const showSecond = ref(true)
const selected = ref('')
const title = computed(() => (props.space === 'library' ? '书房到访时段' : '共享花园用水'))
const unit = computed(() => (props.space === 'library' ? ' 人' : ' L'))
const rows = computed(() => {
  const values = props.space === 'library' ? [12, 24, 18, 0] : [40, 65, 50, 20]
  const result = values.map((value, index) => ({
    id: `${props.space}-${index}`,
    time: `2026-10-28 ${String(8 + index).padStart(2, '0')}:00`,
    value: alternate.value ? value + 5 : value,
    comparison: value / 2,
  }))
  return reversed.value ? result.reverse() : result
})
const series = computed(() => [
  { key: 'value', label: props.space === 'library' ? '到访人数' : '用水量' },
  ...(showSecond.value ? [{ key: 'comparison', label: '前次记录' }] : []),
])
const bands = computed<NvLineBand[]>(() => [
  { id: 'window', axis: 'x', from: 0, to: 1, label: '重点查看时段', tone: 'info' },
  {
    id: 'reference',
    axis: 'y',
    from: 10,
    to: props.space === 'library' ? 20 : 50,
    label: '本页参考范围，仅作阅读提示',
    tone: 'neutral',
  },
])
const markers = computed<NvLineMarker[]>(() =>
  rows.value.map((row, index) => ({
    id: row.id,
    index,
    seriesKey: 'value',
    label: `${row.time}，${row.value}${unit.value}，查看明细`,
    href: `#detail-${row.id}`,
  })),
)
function locate(marker: NvLineMarker, event: MouseEvent | KeyboardEvent) {
  event.preventDefault()
  selected.value = marker.id
  const target = document.getElementById(`detail-${marker.id}`)
  target?.focus()
  target?.scrollIntoView?.({ block: 'nearest' })
}
</script>
<template>
  <main class="mx-auto grid max-w-5xl gap-6 p-6">
    <nav class="flex flex-wrap gap-4 text-sm text-brand" aria-label="图表导航">
      <a href="#">桌面</a><a href="#line-annotations/library">书房到访</a
      ><a href="#line-annotations/garden">花园用水</a>
    </nav>
    <header>
      <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
      <p class="text-sm text-muted-foreground">
        选择图中圆点查看对应记录。范围与数据保存在本页内存。
      </p>
    </header>
    <div class="flex flex-wrap gap-3">
      <NvButton data-reorder variant="outline" @click="reversed = !reversed">调整顺序</NvButton>
      <NvButton data-replace variant="outline" @click="alternate = !alternate">换一组记录</NvButton>
      <NvButton data-series variant="outline" @click="showSecond = !showSecond"
        >{{ showSecond ? '隐藏' : '显示' }}前次记录</NvButton
      >
    </div>
    <section aria-label="时段趋势" class="min-w-0 rounded-xl border bg-card p-6">
      <NvLineChart
        :data="rows"
        x-key="time"
        :series="series"
        :bands="bands"
        :markers="markers"
        :value-suffix="unit"
        @marker-click="locate"
      />
    </section>
    <ul class="grid gap-3" aria-label="记录明细">
      <li
        v-for="row in rows"
        :id="`detail-${row.id}`"
        :key="row.id"
        tabindex="-1"
        :data-selected="selected === row.id"
        class="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-ring"
      >
        <span>{{ row.time }}</span
        ><span class="ml-auto text-right tabular-nums"
          >{{ row.value }}<span class="font-normal text-muted-foreground">{{ unit }}</span></span
        >
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChartContainer, ChartLegendContent, ChartTooltipContent, NvButton } from '@nerv-ui/ui'
type Item = { key: string; label: string; value: number }
const initial: Item[] = [
  { key: 'reading', label: '阅读角', value: 0 },
  { key: 'garden', label: '窗边花园与共享阅读空间', value: 12.3456 },
]
const rows = ref(initial)
const hidden = ref(false)
const currentKey = ref('reading')
const visible = computed(() => (hidden.value ? [] : rows.value))
const current = computed(() => visible.value.find((item) => item.key === currentKey.value))
const config = { visits: { label: '到访', color: 'var(--chart-1)' } }
const legend = computed(() =>
  visible.value.map((item) => ({ key: item.key, label: item.label, color: config.visits.color })),
)
const maximum = computed(() => Math.max(1, ...visible.value.map((item) => item.value)))
const format = (value: number) =>
  new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 }).format(value)
function replace() {
  rows.value = [
    { key: 'garden', label: '窗边花园（更新）', value: 3.5 },
    { key: 'studio', label: '手作角', value: 0 },
  ]
}
</script>

<template>
  <section class="flex min-w-0 flex-col gap-4" aria-label="基础图表组合">
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="replace">替换数据</NvButton>
      <NvButton variant="outline" @click="rows = []">清空数据</NvButton>
      <NvButton variant="outline" @click="rows = initial">恢复数据</NvButton>
      <NvButton variant="outline" :aria-pressed="hidden" @click="hidden = !hidden">{{
        hidden ? '显示数据' : '隐藏数据'
      }}</NvButton>
    </div>
    <p>各空间到访数量 · 单位：人次。选择条目查看当前提示。</p>
    <ChartContainer :config="config" class="!aspect-auto !h-auto min-w-0 gap-4">
      <ul
        v-if="visible.length"
        aria-label="到访图面"
        class="!m-0 grid min-w-0 gap-3 !p-0 list-none"
      >
        <li v-for="item in visible" :key="item.key" class="min-w-0">
          <!-- intentional native control: 整行复合图表条目作为可点按钮，NvButton 的标准内边距与排版会破坏布局 -->
          <button type="button"
            class="w-full min-w-0 rounded-md border border-border p-3 text-left whitespace-normal break-words focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            :aria-pressed="currentKey === item.key"
            @click="currentKey = item.key"
            @focus="currentKey = item.key"
          >
            <span>{{ item.label }}</span>
            <span class="ml-2 font-mono tabular-nums"
              >{{ format(item.value) }}
              <span class="font-sans text-muted-foreground">人次</span></span
            >
            <meter
              class="mt-2 block w-full"
              min="0"
              :max="maximum"
              :value="item.value"
              :aria-label="item.label + '到访数量'"
            >
              {{ format(item.value) }}
            </meter>
          </button>
        </li>
      </ul>
      <p v-else>{{ hidden ? '数据已隐藏' : '暂无数据' }}</p>
      <ChartLegendContent
        :items="legend"
        class="flex-wrap break-words [&>div]:min-w-0 [&>div]:max-w-full"
      />
      <div role="status" aria-live="polite" class="min-w-0">
        <ChartTooltipContent class="!min-w-0 w-full whitespace-normal break-words">
          <template v-if="current"
            ><strong>{{ current.label }}</strong
            ><span class="font-mono tabular-nums"
              >{{ format(current.value) }}
              <span class="font-sans text-muted-foreground">人次</span></span
            ></template
          >
          <span v-else>尚无当前项，请选择可见条目</span>
        </ChartTooltipContent>
      </div>
    </ChartContainer>
  </section>
</template>

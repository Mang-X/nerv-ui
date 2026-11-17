<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import ChartLegend from '../../internal/chart/ChartLegend.vue'
import ChartTooltip from '../../internal/chart/ChartTooltip.vue'
import {
  categoryAnchor,
  chartColor,
  clamp,
  collectCategories,
  formatTick,
  formatValue,
  isFiniteNumber,
  labelEvery,
  niceDomain,
  useContainerWidth,
  type ChartTooltipItem,
} from '../../internal/chart/chart'
import { chartStyles } from '../../internal/chart/chart.styles'
import { styles } from './BarChart.styles'
import type { NvBarChartProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvBarChartProps>(), {
  height: 240,
  showLegend: true,
  ariaLabel: '柱状图',
  valueSuffix: '',
})

const margin = { top: 12, right: 14, bottom: 28, left: 48 }

const rootEl = ref<HTMLElement | null>(null)
const width = useContainerWidth(rootEl)

const svgHeight = computed(() => Math.max(96, Math.round(props.height)))
const plotWidth = computed(() => Math.max(0, width.value - margin.left - margin.right))
const plotHeight = computed(() => Math.max(0, svgHeight.value - margin.top - margin.bottom))

const categories = computed(() => collectCategories(props.data))
const seriesRows = computed(() =>
  props.data.map((series, index) => {
    const values = new Map<string, number>()
    for (const point of series.data ?? []) {
      if (isFiniteNumber(point.y)) values.set(String(point.x), point.y)
    }
    return {
      key: series.key,
      label: series.label,
      color: chartColor(series.color, index),
      values,
    }
  }),
)

const yValues = computed(() => {
  const out: number[] = []
  for (const row of seriesRows.value) {
    for (const value of row.values.values()) out.push(value)
  }
  return out
})

const domain = computed(() => niceDomain(yValues.value, { includeZero: true, targetTicks: 4 }))
const range = computed(() => domain.value.max - domain.value.min || 1)
const hasData = computed(() => categories.value.length > 0 && yValues.value.length > 0)
const baselineY = computed(() =>
  margin.top + plotHeight.value - ((0 - domain.value.min) / range.value) * plotHeight.value,
)

const groupWidth = computed(() => {
  const count = Math.max(1, categories.value.length)
  return Math.max(4, (plotWidth.value / count) * 0.7)
})

const barWidth = computed(() => {
  const count = Math.max(1, seriesRows.value.length)
  const gap = Math.min(3, groupWidth.value * 0.08)
  return Math.max(1, (groupWidth.value - gap * (count - 1)) / count)
})

function categoryCenter(index: number): number {
  const count = Math.max(1, categories.value.length)
  return margin.left + (plotWidth.value / count) * (index + 0.5)
}

function yAt(value: number): number {
  return margin.top + plotHeight.value - ((value - domain.value.min) / range.value) * plotHeight.value
}

interface BarGeometry {
  key: string
  label: string
  color: string
  categoryIndex: number
  category: string
  x: number
  y: number
  width: number
  height: number
  value: number
}

const bars = computed<BarGeometry[]>(() => {
  const output: BarGeometry[] = []
  const group = groupWidth.value
  const unit = barWidth.value
  const seriesCount = Math.max(1, seriesRows.value.length)
  for (let categoryIndex = 0; categoryIndex < categories.value.length; categoryIndex += 1) {
    const category = categories.value[categoryIndex]
    if (category === undefined) continue
    const center = categoryCenter(categoryIndex)
    for (let seriesIndex = 0; seriesIndex < seriesRows.value.length; seriesIndex += 1) {
      const row = seriesRows.value[seriesIndex]
      if (!row) continue
      const value = row.values.get(category)
      if (!isFiniteNumber(value)) continue
      const zeroY = yAt(0)
      const valueY = yAt(value)
      const top = Math.min(zeroY, valueY)
      const height = Math.abs(valueY - zeroY)
      const x = center - group / 2 + seriesIndex * (unit + Math.min(3, group * 0.08))
      output.push({
        key: `${row.key}-${category}`,
        label: row.label,
        color: row.color,
        categoryIndex,
        category,
        x,
        y: top,
        width: unit,
        height: Math.max(height, value === 0 ? 0 : 1),
        value,
      })
    }
  }
  return output
})

const xLabelIndices = computed(() => {
  const step = labelEvery(categories.value.length, plotWidth.value)
  const indices: number[] = []
  for (let index = 0; index < categories.value.length; index += step) indices.push(index)
  return indices
})

const legendItems = computed(() =>
  seriesRows.value.map((row) => ({ label: row.label, color: row.color })),
)

const activeIndex = ref<number | null>(null)
const activeCategory = computed(() =>
  activeIndex.value === null ? undefined : categories.value[activeIndex.value],
)

function onCategoryMove(index: number) {
  activeIndex.value = index
}

function clearHover() {
  activeIndex.value = null
}

const activePoints = computed(() => {
  const category = activeCategory.value
  if (category === undefined) return []
  return seriesRows.value.flatMap((row) => {
    const value = row.values.get(category)
    return isFiniteNumber(value)
      ? [{ label: row.label, color: row.color, value }]
      : []
  })
})

const tooltipItems = computed<ChartTooltipItem[]>(() =>
  activePoints.value.map((point) => ({
    label: point.label,
    value: `${formatValue(point.value)}${props.valueSuffix}`,
    color: point.color,
  })),
)

const tooltipX = computed(() => {
  const x = activeIndex.value === null ? plotWidth.value / 2 : categoryCenter(activeIndex.value)
  return clamp(x, 90, Math.max(90, width.value - 90))
})

const tooltipY = computed(() => {
  if (activePoints.value.length === 0) return margin.top + plotHeight.value / 2
  return Math.max(64, Math.min(...activePoints.value.map((point) => yAt(point.value))))
})

const rootSx = stylex.props(chartStyles.root)
const canvasSx = stylex.props(chartStyles.canvas)
const svgSx = stylex.props(chartStyles.svg)
const gridSx = stylex.props(chartStyles.grid)
const tickSx = stylex.props(chartStyles.tick)
const baselineSx = stylex.props(chartStyles.baseline)
const hitSx = stylex.props(chartStyles.hitArea)
const emptySx = stylex.props(chartStyles.empty)
const barSx = stylex.props(styles.bar)
</script>

<template>
  <div
    ref="rootEl"
    role="img"
    :aria-label="ariaLabel"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
    v-bind="omitClassStyle($attrs)"
  >
    <ChartLegend v-if="showLegend && legendItems.length > 0" :items="legendItems" />
    <div :class="canvasSx.className" :style="{ height: `${svgHeight}px` }">
      <svg
        v-if="width > 0 && hasData"
        :class="svgSx.className"
        :width="width"
        :height="svgHeight"
        :viewBox="`0 0 ${width} ${svgHeight}`"
        aria-hidden="true"
        focusable="false"
      >
        <line
          v-for="tick in domain.ticks"
          :key="`grid-${tick}`"
          :x1="margin.left"
          :x2="width - margin.right"
          :y1="yAt(tick)"
          :y2="yAt(tick)"
          :class="gridSx.className"
        />

        <text
          v-for="tick in domain.ticks"
          :key="`y-${tick}`"
          :x="margin.left - 8"
          :y="yAt(tick)"
          text-anchor="end"
          dominant-baseline="middle"
          :class="tickSx.className"
        >
          {{ formatTick(tick) }}
        </text>

        <line
          :x1="margin.left"
          :x2="width - margin.right"
          :y1="baselineY"
          :y2="baselineY"
          :class="baselineSx.className"
        />

        <rect
          v-for="bar in bars"
          :key="`bar-${bar.key}`"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :rx="Math.min(4, bar.width / 2, bar.height / 2)"
          :fill="bar.color"
          :opacity="activeIndex === null || activeIndex === bar.categoryIndex ? 1 : 0.35"
          :class="barSx.className"
        />

        <text
          v-for="index in xLabelIndices"
          :key="`x-${categories[index]}`"
          :x="categoryCenter(index)"
          :y="svgHeight - 9"
          :text-anchor="categoryAnchor(index, categories.length)"
          :class="tickSx.className"
        >
          {{ categories[index] }}
        </text>

        <rect
          v-for="(category, index) in categories"
          :key="`hit-${category}`"
          :x="margin.left + (plotWidth / Math.max(1, categories.length)) * index"
          :y="margin.top"
          :width="plotWidth / Math.max(1, categories.length)"
          :height="plotHeight"
          :class="hitSx.className"
          @pointerenter="onCategoryMove(index)"
          @pointerleave="clearHover"
        />
      </svg>

      <div v-if="!hasData" :class="emptySx.className">暂无数据</div>
      <ChartTooltip
        v-if="activeIndex !== null && hasData"
        :visible="true"
        :x="tooltipX"
        :y="tooltipY"
        :title="activeCategory"
        :items="tooltipItems"
      />
    </div>
  </div>
</template>

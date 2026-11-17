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
import { styles } from './LineChart.styles'
import type { NvLineChartProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvLineChartProps>(), {
  height: 240,
  showLegend: true,
  ariaLabel: '折线图',
  area: false,
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
const domain = computed(() => niceDomain(yValues.value, { includeZero: false, targetTicks: 4 }))
const range = computed(() => domain.value.max - domain.value.min || 1)
const hasData = computed(() => categories.value.length > 0 && yValues.value.length > 0)

function xAt(index: number): number {
  const count = categories.value.length
  if (count <= 1) return margin.left + plotWidth.value / 2
  return margin.left + (index / (count - 1)) * plotWidth.value
}

function yAt(value: number): number {
  return margin.top + plotHeight.value - ((value - domain.value.min) / range.value) * plotHeight.value
}

const xLabelIndices = computed(() => {
  const step = labelEvery(categories.value.length, plotWidth.value)
  const indices: number[] = []
  for (let index = 0; index < categories.value.length; index += step) indices.push(index)
  return indices
})

interface SeriesGeometry {
  key: string
  label: string
  color: string
  path: string
  area: string
  points: { x: number; y: number; index: number; value: number }[]
}

const geometry = computed<SeriesGeometry[]>(() =>
  seriesRows.value.map((row) => {
    const points = categories.value.flatMap((category, index) => {
      const value = row.values.get(category)
      return isFiniteNumber(value) ? [{ x: xAt(index), y: yAt(value), index, value }] : []
    })
    const path =
      points.length > 0
        ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
        : ''
    const baseline = margin.top + plotHeight.value
    const first = points[0]
    const last = points[points.length - 1]
    const area =
      points.length > 0 && first && last
        ? `${path} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
        : ''
    return { key: row.key, label: row.label, color: row.color, path, area, points }
  }),
)

const legendItems = computed(() =>
  seriesRows.value.map((row) => ({ label: row.label, color: row.color })),
)

const activeIndex = ref<number | null>(null)
const activeCategory = computed(() =>
  activeIndex.value === null ? undefined : categories.value[activeIndex.value],
)

function onPointerMove(event: PointerEvent) {
  const element = event.currentTarget as SVGRectElement | null
  const count = categories.value.length
  if (!element || count === 0) return
  const bounds = element.getBoundingClientRect()
  if (bounds.width <= 0) return
  const ratio = clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
  activeIndex.value = count <= 1 ? 0 : Math.round(ratio * (count - 1))
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
  const x = xAt(activeIndex.value ?? 0)
  return clamp(x, 90, Math.max(90, width.value - 90))
})

const tooltipY = computed(() => {
  if (activePoints.value.length === 0) return margin.top + plotHeight.value / 2
  return Math.max(64, Math.min(...activePoints.value.map((point) => yAt(point.value))))
})

const guideX = computed(() => xAt(activeIndex.value ?? 0))

function pointRadius(index: number): number {
  if (activeIndex.value === index) return 4.5
  return categories.value.length > 24 ? 2.5 : 3
}

const rootSx = stylex.props(chartStyles.root)
const canvasSx = stylex.props(chartStyles.canvas)
const svgSx = stylex.props(chartStyles.svg)
const gridSx = stylex.props(chartStyles.grid)
const tickSx = stylex.props(chartStyles.tick)
const guideSx = stylex.props(chartStyles.guide)
const hitSx = stylex.props(chartStyles.hitArea)
const emptySx = stylex.props(chartStyles.empty)
const lineSx = stylex.props(styles.line)
const areaSx = stylex.props(styles.area)
const pointSx = stylex.props(styles.point)
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

        <path
          v-for="item in geometry"
          v-show="area"
          :key="`area-${item.key}`"
          :d="item.area"
          :fill="item.color"
          fill-opacity="0.16"
          :class="areaSx.className"
        />

        <path
          v-for="item in geometry"
          :key="`line-${item.key}`"
          :d="item.path"
          :stroke="item.color"
          :class="lineSx.className"
        />

        <g v-for="item in geometry" :key="`points-${item.key}`">
          <circle
            v-for="point in item.points"
            :key="`p-${item.key}-${point.index}`"
            :cx="point.x"
            :cy="point.y"
            :r="pointRadius(point.index)"
            :fill="item.color"
            :class="pointSx.className"
          />
        </g>

        <line
          v-if="activeIndex !== null"
          :x1="guideX"
          :x2="guideX"
          :y1="margin.top"
          :y2="margin.top + plotHeight"
          :class="guideSx.className"
        />

        <text
          v-for="index in xLabelIndices"
          :key="`x-${categories[index]}`"
          :x="xAt(index)"
          :y="svgHeight - 9"
          :text-anchor="categoryAnchor(index, categories.length)"
          :class="tickSx.className"
        >
          {{ categories[index] }}
        </text>

        <rect
          :x="margin.left"
          :y="margin.top"
          :width="plotWidth"
          :height="plotHeight"
          :class="hitSx.className"
          @pointermove="onPointerMove"
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

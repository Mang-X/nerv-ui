<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import ChartLegend from '../../internal/chart/ChartLegend.vue'
import ChartTooltip from '../../internal/chart/ChartTooltip.vue'
import {
  chartColor,
  donutArcPath,
  formatValue,
  isFiniteNumber,
  useContainerWidth,
  type ChartTooltipItem,
} from '../../internal/chart/chart'
import { chartStyles } from '../../internal/chart/chart.styles'
import { styles } from './DonutChart.styles'
import type { NvDonutChartProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDonutChartProps>(), {
  height: 200,
  showLegend: true,
  ariaLabel: '环形图',
})

const canvasEl = ref<HTMLElement | null>(null)
const width = useContainerWidth(canvasEl)

const svgHeight = computed(() => Math.max(120, Math.round(props.height)))
const hasData = computed(
  () => props.data.some((datum) => isFiniteNumber(datum.value) && datum.value > 0),
)

const slices = computed(() => {
  const usable = props.data.filter((datum) => isFiniteNumber(datum.value) && datum.value > 0)
  const total = usable.reduce((sum, datum) => sum + datum.value, 0)
  if (total <= 0) return []
  let cursor = 0
  return usable.map((datum, index) => {
    const span = (datum.value / total) * Math.PI * 2
    const start = cursor
    const end = cursor + span
    cursor = end
    return {
      key: `${datum.label}-${index}`,
      label: datum.label,
      value: datum.value,
      share: (datum.value / total) * 100,
      color: chartColor(datum.color, index),
      start,
      end,
      mid: (start + end) / 2,
    }
  })
})

const totalValue = computed(() =>
  slices.value.reduce((sum, slice) => sum + slice.value, 0),
)

const outerRadius = computed(() => Math.max(0, Math.min(width.value, svgHeight.value) / 2 - 6))
const innerRadius = computed(() => {
  const outer = outerRadius.value
  if (outer <= 0) return 0
  const thickness = Math.max(14, Math.min(34, outer * 0.28))
  return Math.max(1, outer - thickness)
})

const centerX = computed(() => width.value / 2)
const centerY = computed(() => svgHeight.value / 2)

const centerLabel = computed(() => {
  if (!hasData.value) return '—'
  if (props.centralLabel) return props.centralLabel
  return formatValue(totalValue.value)
})

const centerSubLabel = computed(() => props.centralSubLabel ?? '总计')

interface SliceGeometry {
  key: string
  label: string
  color: string
  value: number
  share: number
  path: string
  offsetX: number
  offsetY: number
}

const geometry = computed<SliceGeometry[]>(() => {
  const count = slices.value.length
  const pad = count > 1 ? 0.025 : 0
  const outer = outerRadius.value
  const inner = innerRadius.value
  return slices.value.map((slice) => {
    const start = slice.start + pad / 2
    const end = Math.max(start + 0.0001, slice.end - pad / 2)
    return {
      key: slice.key,
      label: slice.label,
      color: slice.color,
      value: slice.value,
      share: slice.share,
      path: donutArcPath(centerX.value, centerY.value, outer, inner, start, end),
      offsetX: Math.cos(slice.mid - Math.PI / 2) * 4,
      offsetY: Math.sin(slice.mid - Math.PI / 2) * 4,
    }
  })
})

const legendItems = computed(() =>
  slices.value.map((slice) => ({
    label: slice.label,
    color: slice.color,
    meta: `${formatValue(slice.value)} · ${shareLabel(slice.share)}`,
  })),
)

function shareLabel(share: number): string {
  return `${Math.round(share * 10) / 10}%`
}

const activeIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

function onSliceMove(index: number, event: PointerEvent) {
  activeIndex.value = index
  const bounds = canvasEl.value?.getBoundingClientRect()
  if (!bounds) return
  tooltipPosition.value = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
}

function clearHover() {
  activeIndex.value = null
}

const activeSlice = computed(() =>
  activeIndex.value === null ? undefined : geometry.value[activeIndex.value],
)

const tooltipItems = computed<ChartTooltipItem[]>(() => {
  const slice = activeSlice.value
  if (!slice) return []
  return [
    {
      label: `${slice.label} · ${shareLabel(slice.share)}`,
      value: formatValue(slice.value),
      color: slice.color,
    },
  ]
})

const rootSx = stylex.props(chartStyles.root)
const canvasSx = stylex.props(chartStyles.canvas)
const svgSx = stylex.props(chartStyles.svg)
const emptySx = stylex.props(chartStyles.empty)
const sliceSx = stylex.props(styles.slice)
const centerSx = stylex.props(styles.center)
const centerValueSx = stylex.props(styles.centerValue)
const centerLabelSx = stylex.props(styles.centerLabel)
</script>

<template>
  <div
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
    role="img"
    :aria-label="ariaLabel"
    v-bind="omitClassStyle($attrs)"
  >
    <div ref="canvasEl" :class="canvasSx.className" :style="{ height: `${svgHeight}px` }">
      <svg
        v-if="width > 0 && hasData"
        :class="svgSx.className"
        :width="width"
        :height="svgHeight"
        :viewBox="`0 0 ${width} ${svgHeight}`"
        aria-hidden="true"
        focusable="false"
        @pointerleave="clearHover"
      >
        <path
          v-for="(slice, index) in geometry"
          :key="slice.key"
          :d="slice.path"
          :fill="slice.color"
          :transform="activeIndex === index ? `translate(${slice.offsetX} ${slice.offsetY})` : undefined"
          :opacity="activeIndex === null || activeIndex === index ? 1 : 0.42"
          :class="sliceSx.className"
          @pointerenter="onSliceMove(index, $event)"
          @pointermove="onSliceMove(index, $event)"
        />
      </svg>

      <div v-if="hasData" :class="centerSx.className">
        <span :class="centerValueSx.className">{{ centerLabel }}</span>
        <span :class="centerLabelSx.className">{{ centerSubLabel }}</span>
      </div>
      <div v-else :class="emptySx.className">暂无数据</div>

      <ChartTooltip
        v-if="activeSlice"
        :visible="true"
        :x="tooltipPosition.x"
        :y="tooltipPosition.y"
        :items="tooltipItems"
      />
    </div>
    <ChartLegend v-if="showLegend && legendItems.length > 0" :items="legendItems" />
  </div>
</template>

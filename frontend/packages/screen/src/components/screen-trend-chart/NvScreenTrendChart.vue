<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import {
  areaPath,
  finiteExtent,
  formatAxis,
  formatOptional,
  lineSegments,
  niceTicks,
} from '../../charts/geometry'
import { styles } from './ScreenTrendChart.styles'
import type { ScreenTrendSeries, TrendChartTone } from './types'

const props = withDefaults(
  defineProps<{
    series: ScreenTrendSeries[]
    /** X labels; frequency is free — values are spread evenly across the axis. */
    xLabels?: string[]
    /** Y axis tick count; the scale itself is derived from the data. */
    yTicks?: number
    unit?: string
    showArea?: boolean
    /** Accessible description; defaults to the series labels. */
    ariaLabel?: string
    emptyLabel?: string
    /** Show marker dots at each finite sample. */
    showDots?: boolean
    /** Height of the plot area in CSS px. */
    height?: number
    hoverLabels?: string[]
  }>(),
  {
    xLabels: () => [],
    yTicks: 5,
    showArea: true,
    showDots: true,
    height: 220,
    emptyLabel: '暂无数据',
  },
)

const VIEW_W = 1000
const PAD_T = 10
const PAD_B = 10
const PAD_L = 6
const PAD_R = 24

const lineTones: Record<TrendChartTone, stylex.StyleXStyles> = {
  accent: styles.lineAccent,
  success: styles.lineSuccess,
  warning: styles.lineWarning,
  danger: styles.lineDanger,
  muted: styles.lineMuted,
}

const fillTones: Record<TrendChartTone, stylex.StyleXStyles> = {
  accent: styles.fillAccent,
  success: styles.fillSuccess,
  warning: styles.fillWarning,
  danger: styles.fillDanger,
  muted: styles.fillMuted,
}

const dotTones: Record<TrendChartTone, stylex.StyleXStyles> = {
  accent: styles.dotAccent,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
  muted: styles.dotMuted,
}

const rootSx = computed(() => stylex.props(styles.root))
const bodySx = computed(() => stylex.props(styles.body))
const svgSx = computed(() => stylex.props(styles.svg))
const gridSx = computed(() => stylex.props(styles.grid))

/** X axis spans the longest series; shorter series are left-aligned on the
 *  same index scale (callers should pass equal-length series for aligned trends). */
const sampleCount = computed(() => {
  let count = 0
  for (const entry of props.series) count = Math.max(count, entry.data.length)
  return count
})

const scale = computed(() => {
  const extent = finiteExtent(props.series.flatMap((entry) => entry.data))
  return niceTicks(extent, props.yTicks)
})

const plotHeight = computed(() => VIEW_W * 0.36)

const xAt = (index: number) => {
  const count = sampleCount.value
  if (count <= 1) return PAD_L
  return PAD_L + ((VIEW_W - PAD_L - PAD_R) * index) / (count - 1)
}

const yAt = (value: number) => {
  const range = scale.value.max - scale.value.min || 1
  return plotHeight.value - PAD_B - ((value - scale.value.min) / range) * (plotHeight.value - PAD_T - PAD_B)
}

interface RenderSeries {
  key: string
  label: string
  tone: TrendChartTone
  segments: string[]
  area: string
  points: Array<{ x: number; y: number; value: number; index: number }>
  lineSx: ReturnType<typeof stylex.props>
  fillSx: ReturnType<typeof stylex.props>
  dot: stylex.StyleXStyles
}

const renderSeries = computed<RenderSeries[]>(() =>
  props.series.map((entry, entryIndex) => {
    const tone = entry.tone ?? (entryIndex === 0 ? 'accent' : 'muted')
    return {
      key: `${entryIndex}-${entry.label}`,
      label: entry.label,
      tone,
      segments: lineSegments(entry.data, xAt, yAt),
      area: entryIndex === 0 ? areaPath(entry.data, xAt, yAt, plotHeight.value - PAD_B) : '',
      points: entry.data
        .map((value, index) =>
          typeof value === 'number' && Number.isFinite(value)
            ? { x: xAt(index), y: yAt(value), value, index }
            : null,
        )
        .filter((point): point is { x: number; y: number; value: number; index: number } => point !== null),
      lineSx: stylex.props(styles.line, lineTones[tone]),
      fillSx: stylex.props(styles.area, fillTones[tone]),
      dot: dotTones[tone],
    }
  }),
)

const gridTicks = computed(() => [...scale.value.ticks].sort((a, b) => a - b))
const axisLabels = computed(() => [...gridTicks.value].reverse().map((tick) => formatAxis(tick)))

const xTickLabels = computed(() => {
  if (!props.xLabels.length) return []
  const count = sampleCount.value
  if (count <= 0) return []
  const maxLabels = 8
  if (props.xLabels.length <= maxLabels) return props.xLabels
  const stride = Math.ceil(props.xLabels.length / maxLabels)
  return props.xLabels.filter((_, index) => index % stride === 0)
})

const hover = ref<number | null>(null)

function onMove(event: MouseEvent) {
  const target = event.currentTarget as SVGElement | null
  if (!target || !sampleCount.value) return
  const rect = target.getBoundingClientRect()
  if (!rect.width) return
  const relative = (event.clientX - rect.left) / rect.width
  const ratio = (relative * VIEW_W - PAD_L) / (VIEW_W - PAD_L - PAD_R)
  const index = Math.round(ratio * (sampleCount.value - 1))
  hover.value = Math.max(0, Math.min(sampleCount.value - 1, index))
}

const hoverX = computed(() => (hover.value === null ? 0 : xAt(hover.value)))
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <div v-if="series.length > 1" :class="stylex.props(styles.legend).className">
      <span
        v-for="entry in renderSeries"
        :key="entry.key"
        :class="stylex.props(styles.legendItem).className"
      >
        <span :class="stylex.props(styles.legendDot, entry.dot).className" aria-hidden="true" />
        {{ entry.label }}
      </span>
    </div>
    <div v-if="!sampleCount" :class="stylex.props(styles.empty).className">{{ emptyLabel }}</div>
    <template v-else>
      <div :class="bodySx.className" :style="bodySx.style">
        <div :class="stylex.props(styles.yAxis).className" aria-hidden="true">
          <span v-for="tick in axisLabels" :key="tick">{{ tick }}</span>
        </div>
        <div :class="stylex.props(styles.plot).className" :style="{ height: `${height}px` }">
          <svg
            :class="svgSx.className"
            :style="svgSx.style"
            :viewBox="`0 0 ${VIEW_W} ${plotHeight}`"
            preserveAspectRatio="none"
            :role="ariaLabel ? 'img' : undefined"
            :aria-label="ariaLabel"
            @mousemove="onMove"
            @mouseleave="hover = null"
          >
            <g :class="gridSx.className" :style="gridSx.style" stroke-dasharray="3 6">
              <line
                v-for="tick in gridTicks"
                :key="tick"
                :x1="PAD_L"
                :x2="VIEW_W - PAD_R"
                :y1="yAt(tick)"
                :y2="yAt(tick)"
              />
            </g>
            <template v-for="entry in renderSeries" :key="entry.key">
              <path v-if="showArea && entry.area" :d="entry.area" :class="entry.fillSx.className" :style="entry.fillSx.style" />
              <path
                v-for="(segment, segmentIndex) in entry.segments"
                :key="segmentIndex"
                :d="segment"
                :class="entry.lineSx.className"
                :style="entry.lineSx.style"
              />
              <circle
                v-for="point in showDots ? entry.points : []"
                :key="`${point.index}-${point.value}`"
                :cx="point.x"
                :cy="point.y"
                r="3"
                :class="stylex.props(entry.dot).className"
              />
            </template>
            <line
              v-if="hover !== null"
              :x1="hoverX"
              :x2="hoverX"
              :y1="PAD_T"
              :y2="plotHeight - PAD_B"
              :class="gridSx.className"
              :style="gridSx.style"
              stroke-dasharray="2 4"
            />
          </svg>
          <div
            v-if="hover !== null"
            :class="stylex.props(styles.legendItem).className"
            :style="{
              position: 'absolute',
              top: 0,
              left: `${(hoverX / VIEW_W) * 100}%`,
              transform: hoverX > VIEW_W / 2 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
              pointerEvents: 'none',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
            }"
            role="tooltip"
          >
            <span v-if="hoverLabels && hoverLabels[hover]">{{ hoverLabels[hover] }}</span>
            <span
              v-for="entry in renderSeries"
              :key="entry.key"
              :class="stylex.props(styles.legendItem).className"
            >
              <span :class="stylex.props(styles.legendDot, entry.dot).className" aria-hidden="true" />
              {{ entry.label }}
              <b>
                {{ formatOptional(entry.points.find((point) => point.index === hover)?.value, { unit }) }}
              </b>
            </span>
          </div>
        </div>
      </div>
      <div v-if="xTickLabels.length" :class="stylex.props(styles.xAxis).className">
        <span
          v-for="(label, index) in xTickLabels"
          :key="`${index}-${label}`"
          :class="stylex.props(styles.xLabel).className"
        >
          {{ label }}
        </span>
      </div>
    </template>
  </div>
</template>

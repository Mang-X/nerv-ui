<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { finiteExtent, formatAxis, formatOptional, niceTicks } from '../../charts/geometry'
import { styles } from './ScreenBarChart.styles'
import type { BarChartTone, ScreenBarSeries } from './types'

const props = withDefaults(
  defineProps<{
    series: ScreenBarSeries[]
    /** Category labels under the plot. */
    xLabels?: string[]
    yTicks?: number
    unit?: string
    /** Plot height in CSS px. */
    height?: number
    ariaLabel?: string
    emptyLabel?: string
    /** Readout label per category, shown on hover. Defaults to the x label. */
    hoverLabels?: string[]
  }>(),
  {
    xLabels: () => [],
    yTicks: 4,
    height: 200,
    emptyLabel: '暂无数据',
  },
)

const VIEW_W = 1000
const PAD_T = 8
const PAD_B = 4

const barTones: Record<BarChartTone, stylex.StyleXStyles> = {
  accent: styles.barAccent,
  success: styles.barSuccess,
  warning: styles.barWarning,
  danger: styles.barDanger,
  muted: styles.barMuted,
}

const swatchTones: Record<BarChartTone, stylex.StyleXStyles> = {
  accent: styles.swatchAccent,
  success: styles.swatchSuccess,
  warning: styles.swatchWarning,
  danger: styles.swatchDanger,
  muted: styles.swatchMuted,
}

const rootSx = computed(() => stylex.props(styles.root))
const svgSx = computed(() => stylex.props(styles.svg))
const gridSx = computed(() => stylex.props(styles.grid))

const plotHeight = computed(() => VIEW_W * 0.28)

const categoryCount = computed(() => {
  let count = 0
  for (const entry of props.series) count = Math.max(count, entry.data.length)
  return count
})

const scale = computed(() => {
  const extent = finiteExtent(props.series.flatMap((entry) => entry.data))
  return niceTicks(extent, props.yTicks)
})

const gridTicks = computed(() => [...scale.value.ticks].sort((a, b) => a - b))
const yLabels = computed(() => [...gridTicks.value].reverse().map((tick) => formatAxis(tick)))

function yAt(value: number) {
  const range = scale.value.max - scale.value.min || 1
  return plotHeight.value - PAD_B - ((value - scale.value.min) / range) * (plotHeight.value - PAD_T - PAD_B)
}

/** Zero line, clamped into the visible scale for all-negative data. */
function zeroY() {
  const zero = Math.max(scale.value.min, Math.min(scale.value.max, 0))
  return yAt(zero)
}

interface RenderBar {
  key: string
  x: number
  y: number
  width: number
  height: number
  categoryIndex: number
  value: number
  style: ReturnType<typeof stylex.props>
}

const bars = computed<RenderBar[]>(() => {
  const count = categoryCount.value
  if (!count) return []
  const seriesCount = Math.max(1, props.series.length)
  const slot = VIEW_W / count
  const groupWidth = slot * 0.66
  const barWidth = groupWidth / seriesCount
  const out: RenderBar[] = []
  props.series.forEach((entry, seriesIndex) => {
    const tone = entry.tone ?? (seriesIndex === 0 ? 'accent' : 'muted')
    entry.data.forEach((raw, index) => {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return
      const clamped = Math.max(scale.value.min, Math.min(scale.value.max, raw))
      const zero = zeroY()
      const valueY = yAt(clamped)
      out.push({
        key: `${seriesIndex}-${index}`,
        x: slot * index + (slot - groupWidth) / 2 + barWidth * seriesIndex,
        y: Math.min(zero, valueY),
        width: Math.max(1, barWidth * 0.92),
        height: Math.abs(zero - valueY),
        categoryIndex: index,
        value: raw,
        style: stylex.props(styles.bar, barTones[tone]),
      })
    })
  })
  return out
})

const hoverIndex = ref<number | null>(null)

function onMove(event: MouseEvent) {
  const target = event.currentTarget as SVGElement | null
  const count = categoryCount.value
  if (!target || !count) return
  const rect = target.getBoundingClientRect()
  if (!rect.width) return
  const ratio = (event.clientX - rect.left) / rect.width
  hoverIndex.value = Math.max(0, Math.min(count - 1, Math.floor(ratio * count)))
}

const tooltipSx = computed(() => stylex.props(styles.tooltip))

const readout = computed(() => {
  if (hoverIndex.value === null) return null
  const index = hoverIndex.value
  return {
    index,
    x: ((index + 0.5) / categoryCount.value) * 100,
    label: props.hoverLabels?.[index] ?? props.xLabels[index] ?? `#${index + 1}`,
    entries: props.series.map((entry, seriesIndex) => ({
      key: `${seriesIndex}-${entry.label}`,
      label: entry.label,
      tone: entry.tone ?? (seriesIndex === 0 ? 'accent' : 'muted'),
      value: formatOptional(entry.data[index], { unit: props.unit }),
    })),
  }
})
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <div v-if="series.length > 1" :class="stylex.props(styles.legend).className">
      <span
        v-for="(entry, index) in series"
        :key="`${index}-${entry.label}`"
        :class="stylex.props(styles.legendItem).className"
      >
        <span
          :class="stylex.props(styles.legendSwatch, swatchTones[entry.tone ?? (index === 0 ? 'accent' : 'muted')]).className"
          aria-hidden="true"
        />
        {{ entry.label }}
      </span>
    </div>
    <div v-if="!categoryCount" :class="stylex.props(styles.empty).className">{{ emptyLabel }}</div>
    <template v-else>
      <div :class="stylex.props(styles.plotWrap).className">
        <div :class="stylex.props(styles.yAxis).className" aria-hidden="true">
          <span v-for="label in yLabels" :key="label">{{ label }}</span>
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
            @mouseleave="hoverIndex = null"
          >
            <g :class="gridSx.className" :style="gridSx.style" stroke-dasharray="3 6">
              <line
                v-for="tick in gridTicks"
                :key="tick"
                :x1="0"
                :x2="VIEW_W"
                :y1="yAt(tick)"
                :y2="yAt(tick)"
              />
            </g>
            <rect
              v-for="bar in bars"
              :key="bar.key"
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              rx="2"
              :class="[bar.style.className, hoverIndex !== null && hoverIndex !== bar.categoryIndex ? stylex.props(styles.barDim).className : null]"
              :style="bar.style.style"
            />
          </svg>
          <div
            v-if="readout"
            role="tooltip"
            :class="tooltipSx.className"
            :style="[
              tooltipSx.style,
              {
                left: `${readout.x}%`,
                transform: readout.x > 50 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
              },
            ]"
          >
            <span :class="stylex.props(styles.legendItem).className">{{ readout.label }}</span>
            <span
              v-for="entry in readout.entries"
              :key="entry.key"
              :class="stylex.props(styles.legendItem).className"
            >
              <span
                :class="stylex.props(styles.legendSwatch, swatchTones[entry.tone]).className"
                aria-hidden="true"
              />
              {{ entry.label }}
              <b>{{ entry.value }}</b>
            </span>
          </div>
        </div>
      </div>
      <div v-if="xLabels.length" :class="stylex.props(styles.xAxis).className">
        <span v-for="(label, index) in xLabels" :key="`${index}-${label}`">{{ label }}</span>
      </div>
    </template>
  </div>
</template>

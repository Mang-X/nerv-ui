<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { formatNumber } from '../../charts/geometry'
import { styles } from './ScreenPareto.styles'
import type { ParetoTone, ScreenParetoItem } from './types'

const props = withDefaults(
  defineProps<{
    items: ScreenParetoItem[]
    /** Sort by value descending. Pre-sorted input keeps its order regardless. */
    sort?: boolean
    /** Total amount for the long-tail row; omit to hide the row. */
    total?: number
    unit?: string
    /** Reference line for the cumulative percentage, in percent. */
    reference?: number
    /** Plot height in CSS px. */
    height?: number
    ariaLabel?: string
    emptyLabel?: string
  }>(),
  { sort: true, reference: 80, height: 180, emptyLabel: '暂无数据' },
)

const VIEW_W = 1000
const PAD_T = 8
const PAD_B = 4

const barTones: Record<ParetoTone, stylex.StyleXStyles> = {
  accent: styles.barAccent,
  success: styles.barSuccess,
  warning: styles.barWarning,
  danger: styles.barDanger,
}

const rootSx = computed(() => stylex.props(styles.root))
const svgSx = computed(() => stylex.props(styles.svg))
const gridSx = computed(() => stylex.props(styles.grid))

const plotHeight = computed(() => VIEW_W * 0.18)
const resolvedHeight = computed(() => props.height)

const ordered = computed(() => {
  const list = props.items.filter((item) => Number.isFinite(item.value) && item.value >= 0)
  return props.sort ? [...list].sort((a, b) => b.value - a.value) : list
})

const totalValue = computed(() => {
  const sum = ordered.value.reduce((acc, item) => acc + item.value, 0)
  if (typeof props.total === 'number' && Number.isFinite(props.total) && props.total > 0) return props.total
  return sum
})

const peak = computed(() => Math.max(0, ...ordered.value.map((item) => item.value)))

const cumulative = computed(() => {
  let acc = 0
  const total = totalValue.value
  return ordered.value.map((item) => {
    acc += item.value
    return total > 0 ? (acc / total) * 100 : 0
  })
})

const summary = computed(() => {
  const top = cumulative.value.at(-1) ?? 0
  const tail =
    typeof props.total === 'number' && totalValue.value > 0
      ? Math.max(0, props.total - ordered.value.reduce((acc, item) => acc + item.value, 0))
      : null
  return { top, tail }
})

function barY(value: number) {
  return plotHeight.value - PAD_B - (peak.value > 0 ? (value / peak.value) * (plotHeight.value - PAD_T - PAD_B) : 0)
}

function cumY(percent: number) {
  return plotHeight.value - PAD_B - (Math.max(0, Math.min(100, percent)) / 100) * (plotHeight.value - PAD_T - PAD_B)
}

function slotWidth() {
  return ordered.value.length ? VIEW_W / ordered.value.length : VIEW_W
}

const bars = computed(() =>
  ordered.value.map((item, index) => {
    const width = slotWidth() * 0.62
    const x = slotWidth() * index + (slotWidth() - width) / 2
    const y = barY(item.value)
    const tone: ParetoTone = item.tone ?? (index === 0 ? 'danger' : index === 1 ? 'warning' : 'accent')
    return {
      key: `${index}-${item.key ?? item.label}`,
      x,
      y,
      width,
      height: Math.max(0, plotHeight.value - PAD_B - y),
      tone,
      style: stylex.props(styles.bar, barTones[tone]),
    }
  }),
)

const linePath = computed(() => {
  if (ordered.value.length < 2) return ''
  return cumulative.value
    .map((percent, index) => {
      const x = slotWidth() * index + slotWidth() / 2
      const y = cumY(percent)
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
})

const points = computed(() =>
  ordered.value.map((item, index) => ({
    key: `${index}-${item.key ?? item.label}`,
    x: slotWidth() * index + slotWidth() / 2,
    y: cumY(cumulative.value[index] ?? 0),
  })),
)

const referenceY = computed(() => cumY(props.reference))
const gridTicks = computed(() => [0, 25, 50, 75, 100])

function percentText(value: number) {
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`
}
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <div :class="stylex.props(styles.legend).className">
      <span :class="stylex.props(styles.legendItem).className">
        <span :class="stylex.props(styles.legendBar).className" aria-hidden="true" />
        数量
      </span>
      <span :class="stylex.props(styles.legendItem).className">
        <span :class="stylex.props(styles.legendLine).className" aria-hidden="true" />
        累计占比
      </span>
      <span :class="stylex.props(styles.legendItem).className">
        <span :class="stylex.props(styles.legendDash).className" aria-hidden="true" />
        参考线 {{ reference }}%
      </span>
    </div>
    <div v-if="!ordered.length" :class="stylex.props(styles.empty).className">{{ emptyLabel }}</div>
    <template v-else>
      <div :class="stylex.props(styles.plot).className" :style="{ height: `${resolvedHeight}px` }">
        <svg
          :class="svgSx.className"
          :style="svgSx.style"
          :viewBox="`0 0 ${VIEW_W} ${plotHeight}`"
          preserveAspectRatio="none"
          :role="ariaLabel ? 'img' : undefined"
          :aria-label="ariaLabel"
        >
          <g :class="gridSx.className" :style="gridSx.style" stroke-dasharray="3 6">
            <line
              v-for="tick in gridTicks"
              :key="tick"
              :x1="0"
              :x2="VIEW_W"
              :y1="cumY(tick)"
              :y2="cumY(tick)"
            />
          </g>
          <line
            :x1="0"
            :x2="VIEW_W"
            :y1="referenceY"
            :y2="referenceY"
            :class="stylex.props(styles.reference).className"
          />
          <rect
            v-for="bar in bars"
            :key="bar.key"
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
            rx="2"
            :class="bar.style.className"
            :style="bar.style.style"
          />
          <path v-if="linePath" :d="linePath" :class="stylex.props(styles.line).className" />
          <circle
            v-for="point in points"
            :key="point.key"
            :cx="point.x"
            :cy="point.y"
            r="3"
            :class="stylex.props(styles.point).className"
          />
        </svg>
      </div>
      <div
        :class="stylex.props(styles.labels).className"
        :style="{ gridTemplateColumns: `repeat(${ordered.length}, minmax(0, 1fr))` }"
      >
        <span
          v-for="(item, index) in ordered"
          :key="`${index}-${item.key ?? item.label}`"
          :class="stylex.props(styles.labelCell).className"
        >
          <span :class="stylex.props(styles.rank).className">{{ String(index + 1).padStart(2, '0') }}</span>
          <span :class="stylex.props(styles.label).className" :title="item.label">{{ item.label }}</span>
          <span v-if="item.sub" :class="stylex.props(styles.sub).className" :title="item.sub">{{ item.sub }}</span>
          <span :class="stylex.props(styles.pct).className">
            {{ formatNumber(item.value) }}{{ unit ? ` ${unit}` : '' }}
            · {{ percentText(cumulative[index] ?? 0) }}
          </span>
        </span>
      </div>
      <div :class="stylex.props(styles.summary).className">
        <span>
          TOP{{ ordered.length }} 累计 <b :class="stylex.props(styles.summaryValue).className">{{ percentText(summary.top) }}</b>
        </span>
        <span v-if="summary.tail !== null">
          长尾 {{ formatNumber(summary.tail) }}{{ unit ? ` ${unit}` : '' }}
          · {{ percentText(Math.max(0, 100 - summary.top)) }}
        </span>
      </div>
    </template>
  </div>
</template>

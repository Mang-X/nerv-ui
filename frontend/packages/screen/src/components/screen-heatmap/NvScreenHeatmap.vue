<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui-sdk/vue/tooltip'
import * as stylex from '@stylexjs/stylex'
import { computed, shallowRef, watch } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import { formatOptional } from '../../charts/geometry'
import { styles } from './ScreenHeatmap.styles'
import type { HeatmapTone, ScreenHeatmapBand, ScreenHeatmapCell } from './types'

const props = withDefaults(
  defineProps<{
    cells: ScreenHeatmapCell[]
    thresholds: ScreenHeatmapBand[]
    /** Band for values under the lowest threshold; also used for unknown values. */
    below: ScreenHeatmapBand
    columns?: number
    unit?: string
    unknownLabel?: string
    emptyLabel?: string
    axisStart?: string
    axisEnd?: string
    ariaLabel?: string
  }>(),
  {
    columns: 6,
    unit: '',
    unknownLabel: '未知',
    emptyLabel: '暂无记录',
    axisStart: '',
    axisEnd: '',
    ariaLabel: '分档数值',
  },
)

const bandStyles: Record<HeatmapTone, stylex.StyleXStyles> = {
  accent: styles.bandAccent,
  success: styles.bandSuccess,
  warning: styles.bandWarning,
  danger: styles.bandDanger,
}

const valueStyles: Record<HeatmapTone, stylex.StyleXStyles> = {
  accent: styles.valueAccent,
  success: styles.valueSuccess,
  warning: styles.valueWarning,
  danger: styles.valueDanger,
}

const legendStyles: Record<HeatmapTone, stylex.StyleXStyles> = {
  accent: styles.legendAccent,
  success: styles.legendSuccess,
  warning: styles.legendWarning,
  danger: styles.legendDanger,
}

/** ui-sdk Tooltip 负责 hover/focus/Escape；这里只记当前打开的那格。 */
const activeKey = shallowRef<string | number | null>(null)

const rootSx = computed(() => stylex.props(darkTheme, styles.root))

const active = computed(() => props.cells.find((cell) => cell.key === activeKey.value) ?? null)

// A malformed scale is unknown as a whole: duplicate or non-finite bounds never
// silently win; the component reports every cell as unknown instead of guessing.
const ordered = computed<ScreenHeatmapBand[] | null>(() => {
  const sorted = [...props.thresholds].sort((a, b) => a.min - b.min)
  const valid = sorted.every(
    (entry, index) => Number.isFinite(entry.min) && (index === 0 || entry.min > sorted[index - 1]!.min),
  )
  return valid ? sorted : null
})

const columnCount = computed(() =>
  Number.isInteger(props.columns) && props.columns > 0 ? props.columns : 6,
)

const gridSx = computed(() => stylex.props(styles.grid))

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function bandFor(value: unknown): ScreenHeatmapBand | null {
  if (!isFiniteNumber(value) || !ordered.value) return null
  const threshold = [...ordered.value].reverse().find((entry) => value >= entry.min)
  return threshold ?? props.below
}

const renderCells = computed(() =>
  props.cells.map((cell) => {
    const band = bandFor(cell.value)
    return {
      key: cell.key,
      label: cell.label,
      value: formatOptional(cell.value, { unit: props.unit }),
      bandLabel: band?.label ?? props.unknownLabel,
      band,
    }
  }),
)

function cellSx(band: ScreenHeatmapBand | null) {
  return stylex.props(styles.cell, focus.subtle, band && bandStyles[band.tone])
}

function valueSx(band: ScreenHeatmapBand | null) {
  return stylex.props(styles.value, band && valueStyles[band.tone])
}





function dismiss() {
  activeKey.value = null
}

watch(
  () => props.cells.map((cell) => cell.key),
  (keys) => {
    if (activeKey.value !== null && !keys.includes(activeKey.value)) activeKey.value = null
  },
  { flush: 'sync' },
)

const legendEntries = computed(() => {
  const bands = ordered.value ?? []
  return [
    ...bands.map((band) => ({
      key: `threshold-${band.min}`,
      label: band.label,
      tone: band.tone,
      style: legendStyles[band.tone],
    })),
    { key: 'below', label: props.below.label, tone: props.below.tone, style: legendStyles[props.below.tone] },
    { key: 'unknown', label: props.unknownLabel, tone: null, style: null },
  ]
})

const tipText = computed(() => {
  const cell = active.value
  if (!cell) return ''
  const band = bandFor(cell.value)
  return `${cell.label} · ${formatOptional(cell.value, { unit: props.unit })} · ${band?.label ?? props.unknownLabel}`
})
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <ul :class="stylex.props(styles.legend).className" aria-label="分档图例">
      <li
        v-for="entry in legendEntries"
        :key="entry.key"
        :class="stylex.props(styles.legendItem, entry.style).className"
        aria-hidden="false"
      >
        {{ entry.label }}
      </li>
    </ul>
    <ul
      :class="gridSx.className"
      :style="[gridSx.style, { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }]"
      :aria-label="ariaLabel"
    >
      <li v-for="cell in renderCells" :key="cell.key" :data-heatmap-cell="cell.key">
        <!-- hover / focus / Escape 都由 ui-sdk Tooltip 处理，不再自维护悬停状态 -->
        <Tooltip @update:open="(next: boolean) => (activeKey = next ? cell.key : null)">
          <TooltipTrigger as-child>
            <span
              :class="cellSx(cell.band).className"
              :style="cellSx(cell.band).style"
              :aria-label="`${cell.label} · ${cell.value} · ${cell.bandLabel}`"
            >
              <span :class="valueSx(cell.band).className" :style="valueSx(cell.band).style">{{ cell.value }}</span>
              <span :class="stylex.props(styles.cellLabel).className">{{ cell.label }}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>{{ cell.label }} · {{ cell.value }} · {{ cell.bandLabel }}</TooltipContent>
        </Tooltip>
      </li>
    </ul>
    <p v-if="!renderCells.length" :class="stylex.props(styles.empty).className" role="status">
      {{ emptyLabel }}
    </p>
    <div v-if="axisStart || axisEnd" :class="stylex.props(styles.axis).className">
      <span>{{ axisStart }}</span>
      <span>{{ axisEnd }}</span>
    </div>
  </div>
</template>

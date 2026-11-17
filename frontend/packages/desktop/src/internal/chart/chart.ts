import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { color } from '../../theme/tokens.stylex'

/** Minimal structural shape the chart helpers accept from any series prop. */
interface SeriesLike {
  data?: readonly { x: string | number; y: number }[] | undefined
}

export interface AxisDomain {
  min: number
  max: number
  ticks: number[]
}

export interface ChartTooltipItem {
  label: string
  value: string
  color: string
}

/**
 * Chart palette derived from semantic tokens: two base hues plus tone mixes.
 * No raw color values are introduced, and dark theme swaps propagate because
 * every entry is a `var(...)` reference (or a color-mix of them).
 */
export const chartPalette: readonly string[] = [
  color.brand,
  color.danger,
  `color-mix(in oklch, ${color.brand} 52%, ${color.danger})`,
  `color-mix(in oklch, ${color.brand} 52%, ${color.fg})`,
  `color-mix(in oklch, ${color.danger} 52%, ${color.mutedFg})`,
]

export function chartColor(explicit: string | undefined, index: number): string {
  const trimmed = explicit?.trim()
  if (trimmed) return trimmed
  return chartPalette[index % chartPalette.length] as string
}

/** Collect the union of x labels in encounter order across every series. */
export function collectCategories(series: readonly SeriesLike[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of series) {
    for (const point of item.data ?? []) {
      const key = String(point.x)
      if (!seen.has(key)) {
        seen.add(key)
        out.push(key)
      }
    }
  }
  return out
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Pick a "nice" tick step (1/2/2.5/5 × 10ⁿ) around the data range. `includeZero`
 * keeps bar charts anchored to a zero baseline.
 */
export function niceDomain(
  values: readonly number[],
  options: { includeZero?: boolean; targetTicks?: number } = {},
): AxisDomain {
  const finite = values.filter(isFiniteNumber)
  let min = finite.length > 0 ? Math.min(...finite) : 0
  let max = finite.length > 0 ? Math.max(...finite) : 1

  if (options.includeZero) {
    min = Math.min(min, 0)
    max = Math.max(max, 0)
  }

  if (min === max) {
    if (min === 0) {
      max = 1
    } else {
      const pad = Math.abs(min) * 0.1
      min -= pad
      max += pad
    }
  }

  const target = Math.max(1, options.targetTicks ?? 4)
  const rawStep = (max - min) / target
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  const step = factor * magnitude

  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const count = Math.max(1, Math.round((niceMax - niceMin) / step))
  const ticks = Array.from({ length: count + 1 }, (_, index) =>
    round(niceMin + index * step),
  )

  return { min: niceMin, max: niceMax, ticks }
}

/** Trim floating-point noise so ticks read as 0.3 rather than 0.30000000004. */
function round(value: number): number {
  return Math.round(value * 1e10) / 1e10
}

const fullFormatter = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 })
const compactFormatter = new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatValue(value: number): string {
  return Number.isFinite(value) ? fullFormatter.format(value) : '—'
}

/** Axis ticks switch to compact notation once labels would get long. */
export function formatTick(value: number): string {
  if (!Number.isFinite(value)) return ''
  return Math.abs(value) >= 10_000 ? compactFormatter.format(value) : fullFormatter.format(value)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Skip x labels so they stay readable as the container narrows. */
export function labelEvery(count: number, plotWidth: number, minGap = 56): number {
  if (count <= 1 || plotWidth <= 0) return 1
  const maxLabels = Math.max(1, Math.floor(plotWidth / minGap))
  return Math.max(1, Math.ceil(count / maxLabels))
}

/** First/last category labels anchor inward so they do not spill past the plot. */
export function categoryAnchor(index: number, count: number): 'start' | 'middle' | 'end' {
  if (count <= 1) return 'middle'
  if (index === 0) return 'start'
  if (index === count - 1) return 'end'
  return 'middle'
}

/**
 * Donut segment path: outer arc, radial cut to the inner ring, inner arc back.
 * Angles are radians from 12 o'clock, clockwise.
 */
export function donutArcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const span = endAngle - startAngle
  if (span <= 0 || outerRadius <= 0 || innerRadius <= 0) return ''

  const start = startAngle - Math.PI / 2
  const end = endAngle - Math.PI / 2
  const largeArc = span > Math.PI ? 1 : 0

  const outerStart = [cx + outerRadius * Math.cos(start), cy + outerRadius * Math.sin(start)] as const
  const outerEnd = [cx + outerRadius * Math.cos(end), cy + outerRadius * Math.sin(end)] as const
  const innerEnd = [cx + innerRadius * Math.cos(end), cy + innerRadius * Math.sin(end)] as const
  const innerStart = [cx + innerRadius * Math.cos(start), cy + innerRadius * Math.sin(start)] as const

  return [
    `M ${outerStart[0]} ${outerStart[1]}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd[0]} ${outerEnd[1]}`,
    `L ${innerEnd[0]} ${innerEnd[1]}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart[0]} ${innerStart[1]}`,
    'Z',
  ].join(' ')
}

/**
 * Track the rendered width of a container so charts stay responsive without a
 * charting dependency. Falls back to window resize where ResizeObserver is
 * unavailable and does nothing during SSR.
 */
export function useContainerWidth(target: Ref<HTMLElement | null>) {
  const width = ref(0)
  let observer: ResizeObserver | undefined

  const update = () => {
    width.value = target.value ? Math.round(target.value.clientWidth) : 0
  }

  onMounted(() => {
    update()
    const element = target.value
    if (!element) return
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update)
      observer.observe(element)
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', update)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = undefined
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', update)
    }
  })

  return width
}

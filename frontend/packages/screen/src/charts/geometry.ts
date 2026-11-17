/**
 * Small, dependency-free geometry helpers shared by the self-drawn screen
 * charts. Everything is pure: callers pass raw data and receive numbers or SVG
 * path strings. Non-finite and `null` samples are treated as gaps, never as 0.
 */

export interface NumberRange {
  min: number
  max: number
}

export interface AxisScale {
  min: number
  max: number
  step: number
  ticks: number[]
}

export interface SparklineGeometry {
  line: string
  area: string
  last: { x: number; y: number }
}

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const plainFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 3,
})

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Inclusive extent of every finite sample; `null` when there is none. */
export function finiteExtent(
  values: ReadonlyArray<number | null | undefined> | Iterable<number | null | undefined>,
): NumberRange | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let seen = false
  for (const value of values) {
    if (!isFiniteNumber(value)) continue
    if (value < min) min = value
    if (value > max) max = value
    seen = true
  }
  return seen ? { min, max } : null
}

function niceStep(span: number, count: number): number {
  const target = Math.max(1, count)
  const rough = span / target
  if (!Number.isFinite(rough) || rough <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

function tidy(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Number(value.toPrecision(12))
}

/**
 * Rounds an extent up to human tick values. Non-negative data starts at zero so
 * column and line heights stay honest; negative data extends the lower bound.
 */
export function niceTicks(range: NumberRange | null, count = 4): AxisScale {
  if (!range) return { min: 0, max: 1, step: 1, ticks: [0, 1] }
  const span = Math.max(range.max - range.min, Math.abs(range.max), 1)
  const step = niceStep(span, count)
  const min = range.min >= 0 ? 0 : Math.floor(range.min / step) * step
  let max = Math.ceil(range.max / step) * step
  if (max <= min) max = min + step
  const ticks: number[] = []
  for (let value = min; value <= max + step / 2 && ticks.length < 64; value += step) {
    ticks.push(tidy(value))
  }
  if (!ticks.length) ticks.push(tidy(min), tidy(max))
  return { min: tidy(min), max: tidy(max), step, ticks }
}

/** SVG polyline path for already-projected points. */
export function polylinePath(points: ReadonlyArray<{ x: number; y: number }>): string {
  return points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
}

/**
 * Builds one or more path commands, breaking the line at null/non-finite
 * samples so gaps stay gaps.
 */
export function lineSegments(
  values: ReadonlyArray<number | null | undefined>,
  xAt: (index: number) => number,
  yAt: (value: number) => number,
): string[] {
  const segments: string[] = []
  let current: string[] = []
  values.forEach((value, index) => {
    if (isFiniteNumber(value)) {
      current.push(`${current.length ? 'L' : 'M'}${xAt(index).toFixed(1)} ${yAt(value).toFixed(1)}`)
      return
    }
    if (current.length) {
      segments.push(current.join(' '))
      current = []
    }
  })
  if (current.length) segments.push(current.join(' '))
  return segments
}

/** Area polygon under a fully finite series, or `''` when any sample is a gap. */
export function areaPath(
  values: ReadonlyArray<number | null | undefined>,
  xAt: (index: number) => number,
  yAt: (value: number) => number,
  baseline: number,
): string {
  if (!values.length) return ''
  if (!values.every(isFiniteNumber)) return ''
  const points = values.map((value, index) => {
    const x = xAt(index).toFixed(1)
    const y = yAt(value as number).toFixed(1)
    return `${index ? 'L' : 'M'}${x} ${y}`
  })
  const lastX = xAt(values.length - 1).toFixed(1)
  const firstX = xAt(0).toFixed(1)
  return `${points.join(' ')} L${lastX} ${baseline.toFixed(1)} L${firstX} ${baseline.toFixed(1)} Z`
}

/** Compact sparkline geometry; `null` when fewer than two finite samples. */
export function sparklineGeometry(
  values: ReadonlyArray<number | null | undefined>,
  width: number,
  height: number,
  padding = 4,
): SparklineGeometry | null {
  const finite = values.filter(isFiniteNumber) as number[]
  if (finite.length < 2) return null
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  const span = max - min || 1
  const innerW = Math.max(1, width - padding * 2)
  const innerH = Math.max(1, height - padding * 2)
  const xAt = (index: number) =>
    padding + (values.length <= 1 ? innerW / 2 : (index / (values.length - 1)) * innerW)
  const yAt = (value: number) => padding + (1 - (value - min) / span) * innerH
  const points = values
    .map((value, index) => (isFiniteNumber(value) ? { x: xAt(index), y: yAt(value) } : null))
    .filter((point): point is { x: number; y: number } => point !== null)
  const line = polylinePath(points)
  const last = points[points.length - 1]!
  return {
    line,
    area: `${line} L${last.x.toFixed(1)} ${(height - padding).toFixed(1)} L${points[0]!.x.toFixed(1)} ${(height - padding).toFixed(1)} Z`,
    last,
  }
}

/** Plain grouped number for values and readouts. */
export function formatNumber(value: number, maximumFractionDigits = 3): string {
  if (!Number.isFinite(value)) return '—'
  return plainFormatter.format(value)
}

/** Short grouped number for axis labels. */
export function formatAxis(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Math.abs(value) >= 10000 ? compactFormatter.format(value) : plainFormatter.format(value)
}

/** Display text for optional numeric cells; missing numbers become an em dash. */
export function formatOptional(
  value: number | string | null | undefined,
  options: { unit?: string; maximumFractionDigits?: number } = {},
): string {
  const { unit, maximumFractionDigits = 3 } = options
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '—'
    const text = formatNumber(value, maximumFractionDigits)
    return unit ? `${text} ${unit}` : text
  }
  return unit ? `${value} ${unit}` : value
}

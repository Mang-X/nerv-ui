import { numberText } from '../snapshot/snapshot'

/** Format a host fact only; no scheduler, CTP or elapsed-time inference. */
export function metricText(
  value: number | null | undefined,
  format: 'number' | 'percent',
  unit?: string,
) {
  if (value == null || !Number.isFinite(value)) return '—'
  const shown = numberText(format === 'percent' ? value * 100 : value)
  return `${shown}${format === 'percent' ? '%' : unit ? ` ${unit}` : ''}`
}

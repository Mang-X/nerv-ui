import * as stylex from '@stylexjs/stylex'
import { color, typography } from '../../theme/tokens.stylex'

/**
 * Shared visual scaffolding for the chart family: axis marks, empty state and
 * the measured canvas. Series colors stay dynamic because they are data-driven.
 */
export const chartStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    minWidth: 0,
    color: color.fg,
    fontFamily: typography.fontSans,
  },
  canvas: {
    position: 'relative',
    width: '100%',
    minWidth: 0,
  },
  svg: {
    display: 'block',
    overflow: 'visible',
  },
  grid: {
    stroke: color.border,
    strokeWidth: 1,
  },
  axis: {
    stroke: color.border,
    strokeWidth: 1,
  },
  baseline: {
    stroke: color.mutedFg,
    strokeWidth: 1,
    opacity: 0.45,
  },
  tick: {
    fill: color.mutedFg,
    fontSize: 11,
    fontFamily: typography.fontSans,
    fontVariantNumeric: 'tabular-nums',
  },
  guide: {
    stroke: color.mutedFg,
    strokeWidth: 1,
    opacity: 0.35,
    strokeDasharray: '3 3',
  },
  hitArea: {
    fill: 'transparent',
    cursor: 'crosshair',
  },
  empty: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color.mutedFg,
    fontSize: 13,
    pointerEvents: 'none',
  },
})

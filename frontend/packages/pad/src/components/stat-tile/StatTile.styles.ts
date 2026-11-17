import * as stylex from '@stylexjs/stylex'
import { color, elevation, shape } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 168,
    padding: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radiusLg,
    backgroundColor: color.card,
    boxShadow: elevation.sm,
  },
  active: {
    borderColor: color.brand,
    boxShadow: `0 0 0 1px ${color.brand}, ${elevation.md}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: color.mutedFg,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: '20px',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color.mutedFg,
    fontSize: 22,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    color: color.fg,
    fontSize: 38,
    fontWeight: 700,
    lineHeight: '44px',
    fontVariantNumeric: 'tabular-nums',
  },
  unit: {
    color: color.mutedFg,
    fontSize: 16,
    fontWeight: 500,
  },
  hint: {
    color: color.mutedFg,
    fontSize: 14,
    lineHeight: '18px',
  },
  brand: { color: color.brand },
  danger: { color: color.danger },
})

import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radiusSm,
    fontFamily: typography.fontSans,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    userSelect: 'none',
  },
  neutral: {
    backgroundColor: color.muted,
    color: color.fg,
  },
  brand: {
    backgroundColor: color.brandSoft,
    color: color.brand,
  },
  danger: {
    backgroundColor: `color-mix(in oklch, ${color.danger} 14%, transparent)`,
    color: color.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: color.border,
    color: color.fg,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: color.mutedFg,
  },
  sm: {
    minHeight: 20,
    paddingInline: 7,
    fontSize: 12,
    lineHeight: '16px',
  },
  md: {
    minHeight: 24,
    paddingInline: 9,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
  },
  round: {
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: 'currentColor',
  },
})

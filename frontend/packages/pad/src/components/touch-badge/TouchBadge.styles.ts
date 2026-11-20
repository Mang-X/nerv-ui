import * as stylex from '@stylexjs/stylex'
import { color, shape } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radiusSm,
    fontFamily: 'inherit',
    fontWeight: 600,
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
  md: {
    minHeight: 28,
    paddingInline: 10,
    fontSize: 16,
    lineHeight: '20px',
  },
  lg: {
    minHeight: 36,
    paddingInline: 14,
    fontSize: 17,
    lineHeight: '22px',
  },
  round: {
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: 'currentColor',
  },
})

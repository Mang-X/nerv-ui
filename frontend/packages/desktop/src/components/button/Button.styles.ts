import * as stylex from '@stylexjs/stylex'
import { color, motion, shape } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radius,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
    outlineStyle: 'none',
    transitionProperty: 'background-color, border-color, box-shadow, transform, color',
    ':hover:not(:disabled)': { backgroundColor: color.muted },
    ':focus-visible': {
      borderColor: color.brand,
      boxShadow: `0 0 0 1px ${color.brand}, 0 0 0 4px ${color.brandSoft}`,
    },
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
    ':active:not(:disabled)': { transform: 'translateY(0.5px)' },
  },
  primary: {
    backgroundColor: color.brand,
    color: color.brandFg,
  },
  secondary: {
    backgroundColor: color.muted,
    color: color.fg,
    borderColor: color.border,
  },

  outline: {
    backgroundColor: color.card,
    color: color.fg,
    borderColor: color.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: color.fg,
    // 亮色下纯透明按钮几乎不可见；hover 给浅底 + 细边，让可点区域明确。
    ':hover:not(:disabled)': { backgroundColor: color.muted, borderColor: color.border },
  },
  danger: {
    backgroundColor: color.danger,
    color: color.dangerFg,
  },
  link: {
    backgroundColor: 'transparent',
    color: color.brand,
    borderColor: 'transparent',
    textUnderlineOffset: 3,
    textDecorationLine: 'underline',
  },
  sm: { height: 30, paddingInline: 10, fontSize: 13 },
  md: { height: 36, paddingInline: 14 },
  lg: { height: 42, paddingInline: 18, fontSize: 15 },
  block: { width: '100%' },
})


import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

export const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingInline: 18,
    whiteSpace: 'nowrap',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radius,
    fontFamily: typography.fontSans,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transitionProperty: 'background-color, border-color, box-shadow, color, opacity',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
    ':active:not(:disabled)': { opacity: 0.82 },
  },
  primary: {
    backgroundColor: color.brand,
    color: color.brandFg,
  },
  secondary: {
    backgroundColor: color.muted,
    color: color.fg,
  },
  outline: {
    backgroundColor: color.card,
    color: color.fg,
    borderColor: color.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: color.fg,
  },
  danger: {
    backgroundColor: color.danger,
    color: color.dangerFg,
  },
  link: {
    minHeight: 44,
    paddingInline: 4,
    backgroundColor: 'transparent',
    color: color.brand,
    borderColor: 'transparent',
    textDecorationLine: 'underline',
    textUnderlineOffset: 3,
  },
  md: { minHeight: 44, paddingInline: 18 },
  lg: { minHeight: 52, paddingInline: 22, fontSize: 16 },
  block: { width: '100%' },
  content: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingIcon: {
    animationName: spin,
    animationDuration: '760ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
})

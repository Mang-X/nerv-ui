import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

const indeterminate = stylex.keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(250%)' },
})

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    minWidth: 0,
    fontFamily: typography.fontSans,
  },
  head: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    color: color.fg,
    fontSize: 18,
    fontWeight: 600,
    lineHeight: '24px',
  },
  value: {
    color: color.mutedFg,
    fontSize: 18,
    fontWeight: 600,
    lineHeight: '24px',
    fontVariantNumeric: 'tabular-nums',
  },
  track: {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: color.muted,
  },
  md: { height: 14 },
  lg: { height: 20 },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineStart: 0,
    borderRadius: 999,
    backgroundColor: color.brand,
    transitionProperty: 'width, background-color',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeOut,
    '[data-indeterminate]': {
      width: '40%',
      animationName: indeterminate,
      animationDuration: '1.2s',
      animationIterationCount: 'infinite',
      animationTimingFunction: motion.easeInOut,
    },
  },
  danger: { backgroundColor: color.danger },
  neutral: { backgroundColor: color.mutedFg },
})

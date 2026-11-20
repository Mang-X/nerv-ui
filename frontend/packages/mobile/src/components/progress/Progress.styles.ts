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
    gap: 8,
    width: '100%',
    minWidth: 0,
    fontFamily: typography.fontSans,
  },
  head: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: color.fg,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
  },
  value: {
    color: color.mutedFg,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
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
  sm: { height: 6 },
  md: { height: 8 },
  lg: { height: 12 },
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
  indicatorDanger: {
    backgroundColor: color.danger,
  },
  indicatorNeutral: {
    backgroundColor: color.mutedFg,
  },
})

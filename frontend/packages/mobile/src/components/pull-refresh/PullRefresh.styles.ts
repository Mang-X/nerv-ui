import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

export const styles = stylex.create({
  root: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    overscrollBehaviorY: 'contain',
    touchAction: 'pan-y',
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 0,
    overflow: 'hidden',
    color: color.mutedFg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
    transitionProperty: 'height, opacity',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    opacity: 0,
  },
  indicatorVisible: {
    opacity: 1,
  },
  content: {
    transitionProperty: 'transform',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
  contentDragging: {
    transitionDuration: '0ms',
  },
  spinner: {
    animationName: spin,
    animationDuration: '760ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  arrow: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: motion.durationFast,
  },
  arrowReady: {
    transform: 'rotate(180deg)',
  },
})

import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  slice: {
    stroke: 'none',
    cursor: 'pointer',
    transitionProperty: 'opacity, transform',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    pointerEvents: 'none',
    textAlign: 'center',
    color: color.fg,
    fontFamily: typography.fontSans,
  },
  centerValue: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  centerLabel: {
    fontSize: 12,
    lineHeight: '16px',
    color: color.mutedFg,
    maxWidth: '70%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

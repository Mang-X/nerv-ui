import * as stylex from '@stylexjs/stylex'
import { color, elevation, motion, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    fontFamily: typography.fontSans,
  },
  label: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: '20px',
    color: color.fg,
  },
  track: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: 52,
    height: 32,
    padding: 3,
    borderWidth: 0,
    borderRadius: 999,
    backgroundColor: color.muted,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    transitionProperty: 'background-color, box-shadow, opacity',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    '::before': {
      content: '""',
      position: 'absolute',
      inset: -6,
      borderRadius: 999,
    },
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
  },
  trackChecked: {
    backgroundColor: color.brand,
  },
  thumb: {
    display: 'block',
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: color.card,
    boxShadow: elevation.sm,
    transitionProperty: 'transform',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeOut,
  },
  thumbChecked: {
    transform: 'translateX(20px)',
  },
})

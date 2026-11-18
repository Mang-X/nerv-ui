import * as stylex from '@stylexjs/stylex'
import { color, motion, elevation } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: 36,
    height: 20,
    padding: 2,
    borderWidth: 0,
    borderRadius: 999,
    backgroundColor: color.mutedStrong,
    cursor: 'pointer',
    outlineStyle: 'none',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    '[data-checked]': { backgroundColor: color.brand },
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
  },
  thumb: {
    display: 'block',
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: color.card,
    boxShadow: elevation.sm,
    transform: 'translateX(0)',
    transitionProperty: 'transform',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    '[data-checked]': { transform: 'translateX(16px)' },
  },
})

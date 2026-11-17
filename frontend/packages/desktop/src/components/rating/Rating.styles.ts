import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    color: color.border,
    fontFamily: typography.fontSans,
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    '[data-readonly]': { cursor: 'default' },
  },
  item: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 6,
    outlineStyle: 'none',
    transitionProperty: 'color, transform',
    transitionDuration: motion.durationFast,
    '[data-filled]': { color: color.brand },
    '[data-partial]': { color: color.brand },
    '[data-highlighted]': { color: color.brand },
    '[data-disabled]': { cursor: 'not-allowed' },
    ':focus-visible': { boxShadow: `0 0 0 1px ${color.brand}` },
  },
  icon: {
    display: 'inline-flex',
    width: 20,
    height: 20,
    pointerEvents: 'none',
  },
})

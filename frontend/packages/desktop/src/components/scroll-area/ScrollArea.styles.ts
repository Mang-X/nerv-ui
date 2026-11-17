import * as stylex from '@stylexjs/stylex'
import { color, motion, shape } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radius,
    backgroundColor: color.card,
    overflow: 'hidden',
  },
  viewport: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    borderRadius: 'inherit',
    outlineStyle: 'none',
  },
  content: {
    minWidth: 0,
  },
  scrollbar: {
    display: 'flex',
    padding: 2,
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    '[data-visible]': { opacity: 1 },
  },
  scrollbarVertical: {
    width: 10,
  },
  scrollbarHorizontal: {
    height: 10,
  },
  thumb: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: color.border,
    transitionProperty: 'background-color',
    transitionDuration: motion.durationFast,
    ':hover': { backgroundColor: color.mutedFg },
    '[data-dragging]': { backgroundColor: color.brand },
  },
  corner: {
    backgroundColor: 'transparent',
  },
})

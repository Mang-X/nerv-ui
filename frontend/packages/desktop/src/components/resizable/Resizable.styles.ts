import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 240,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radiusLg,
    backgroundColor: color.card,
    color: color.fg,
    fontFamily: typography.fontSans,
    overflow: 'hidden',
    '[data-orientation="vertical"]': { flexDirection: 'column' },
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    padding: 12,
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  handle: {
    position: 'relative',
    flexShrink: 0,
    width: 1,
    backgroundColor: color.border,
    outlineStyle: 'none',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { backgroundColor: color.brand },
    '[data-hovering]': { backgroundColor: color.brand },
    '[data-dragging]': { backgroundColor: color.brand },
  },
  handleVertical: {
    width: '100%',
    height: 1,
  },
})

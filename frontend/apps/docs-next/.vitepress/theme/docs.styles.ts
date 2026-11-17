import * as stylex from '@stylexjs/stylex'
import { color, motion, shape } from './gen/tokens.stylex'

export const styles = stylex.create({
  page: {
    minHeight: '100vh',
    backgroundColor: color.bg,
    color: color.fg,
    transitionProperty: 'background-color, color',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeOut,
  },
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: shape.radiusSm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    backgroundColor: 'transparent',
    color: color.fg,
    cursor: 'pointer',
  },
})

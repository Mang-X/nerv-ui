import * as stylex from '@stylexjs/stylex'
import { color, motion } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  line: {
    fill: 'none',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    transitionProperty: 'opacity',
    transitionDuration: motion.durationFast,
  },
  area: {
    stroke: 'none',
  },
  point: {
    stroke: color.card,
    strokeWidth: 1.5,
    transitionProperty: 'r',
    transitionDuration: motion.durationFast,
  },
})

import * as stylex from '@stylexjs/stylex'
import { motion } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  bar: {
    transitionProperty: 'opacity',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
})

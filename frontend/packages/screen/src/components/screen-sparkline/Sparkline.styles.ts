import * as stylex from '@stylexjs/stylex'
import { scr } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'block',
    width: '100%',
    height: 56,
  },
  line: {
    fill: 'none',
    stroke: scr.accent,
    strokeWidth: 1.5,
    vectorEffect: 'non-scaling-stroke',
    strokeLinecap: 'round',
  },
  dot: {
    fill: scr.accent,
  },
  area: { stroke: 'none' },
})

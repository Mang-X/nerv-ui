import * as stylex from '@stylexjs/stylex'
import { color } from '../../theme/tokens.stylex'

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
})

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: color.mutedFg,
    animationName: spin,
    animationDuration: '760ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
})

import * as stylex from '@stylexjs/stylex'
import { color, shape } from '../../theme/tokens.stylex'

const pulse = stylex.keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0.5 },
  '100%': { opacity: 1 },
})

export const styles = stylex.create({
  base: {
    boxSizing: 'border-box',
    backgroundColor: color.muted,
    flexShrink: 0,
  },
  rect: { borderRadius: shape.radiusSm },
  circle: { borderRadius: 999 },
  text: { borderRadius: 4, height: 12 },
  lines: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  animated: {
    animationName: pulse,
    animationDuration: '1.4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
})

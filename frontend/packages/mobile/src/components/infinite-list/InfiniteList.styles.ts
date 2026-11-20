import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

const spin = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
})

export const styles = stylex.create({
  viewport: {
    position: 'relative',
    overflowY: 'auto',
    minHeight: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBlock: 14,
    color: color.mutedFg,
    fontSize: typography.sizeSm,
  },
  spinner: {
    display: 'inline-flex',
    animationName: spin,
    animationDuration: '0.9s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': { animationName: 'none' },
  },
})

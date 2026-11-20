import * as stylex from '@stylexjs/stylex'
import { scr, scrShape } from '../../tokens.stylex'

const sheenSlide = stylex.keyframes({
  '0%': { transform: 'translateX(-30%)', opacity: 0 },
  '20%': { opacity: 0.7 },
  '80%': { opacity: 0.7 },
  '100%': { transform: 'translateX(480%)', opacity: 0 },
})

export const styles = stylex.create({
  root: {
    position: 'relative',
    height: 1,
    width: '100%',
    backgroundImage: `linear-gradient(90deg, transparent, ${scr.borderStrong} 25%, ${scr.accent} 50%, ${scr.borderStrong} 75%, transparent)`,
    overflowX: 'hidden',
  },
  dot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 5,
    height: 5,
    borderRadius: scrShape.radius,
    transform: 'translate(-50%, -50%)',
    backgroundColor: scr.accent,
    boxShadow: `0 0 8px ${scr.accentSoft}`,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '22%',
    backgroundImage: `linear-gradient(90deg, transparent, ${scr.accent}, transparent)`,
    opacity: 0.7,
    animationName: sheenSlide,
    animationDuration: '3.4s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
      display: 'none',
    },
  },
})

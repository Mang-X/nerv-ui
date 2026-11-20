import * as stylex from '@stylexjs/stylex'
import { motion } from '../../theme/tokens.stylex'
import { scr, scrType } from '../../tokens.stylex'

const breathe = stylex.keyframes({
  '0%, 100%': { opacity: 0.55 },
  '50%': { opacity: 1 },
})

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    color: scr.fgMuted,
    fontVariantNumeric: 'tabular-nums',
  },
  dot: {
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: scr.fgSubtle,
    animationName: breathe,
    animationDuration: '2s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
  pulseOff: { animationName: 'none' },
  sizeSm: { width: 10, height: 10 },
  sizeMd: { width: 13, height: 13 },
  sizeLg: { width: 16, height: 16 },
  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  },
  labelSm: { fontSize: scrType.xs },
  labelMd: { fontSize: scrType.sm },
  labelLg: { fontSize: scrType.md },
  dotAccent: { backgroundColor: scr.accent, boxShadow: `0 0 10px ${scr.accent}` },
  dotSuccess: { backgroundColor: scr.success, boxShadow: `0 0 10px ${scr.success}` },
  dotWarning: { backgroundColor: scr.warning, boxShadow: `0 0 10px ${scr.warning}` },
  dotDanger: { backgroundColor: scr.danger, boxShadow: `0 0 10px ${scr.danger}` },
  textDefault: { color: scr.fgMuted },
  textAccent: { color: scr.accent },
  textSuccess: { color: scr.success },
  textWarning: { color: scr.warning },
  textDanger: { color: scr.danger },
  transition: {
    transitionProperty: 'opacity, background-color, box-shadow, color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
})

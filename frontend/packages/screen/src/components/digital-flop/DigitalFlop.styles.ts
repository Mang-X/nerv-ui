import * as stylex from '@stylexjs/stylex'
import { motion } from '../../theme/tokens.stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

const flopIn = stylex.keyframes({
  '0%': { opacity: 0, transform: 'translateY(-70%) rotateX(-70deg)' },
  '100%': { opacity: 1, transform: 'translateY(0) rotateX(0deg)' },
})

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    color: scr.fgMuted,
    fontSize: scrType.sm,
    fontWeight: 500,
    lineHeight: '20px',
  },
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  cell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.border,
    borderRadius: scrShape.radius,
    backgroundColor: scr.panel,
    color: scr.fg,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    boxShadow: `inset 0 1px 0 ${scr.borderStrong}`,
  },
  animated: {
    animationName: flopIn,
    animationDuration: motion.durationBase,
    animationTimingFunction: motion.easeOut,
  },
  md: { width: 46, height: 62, fontSize: 38 },
  lg: { width: 60, height: 80, fontSize: 50 },
  xl: { width: 76, height: 100, fontSize: 64 },
  separator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: scr.fgMuted,
    fontWeight: 700,
    lineHeight: 1,
    paddingInline: 2,
  },
  sepMd: { fontSize: 38 },
  sepLg: { fontSize: 50 },
  sepXl: { fontSize: 64 },
  toneAccent: { color: scr.accent },
  toneSuccess: { color: scr.success },
  toneWarning: { color: scr.warning },
  toneDanger: { color: scr.danger },
})

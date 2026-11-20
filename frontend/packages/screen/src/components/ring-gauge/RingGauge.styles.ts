import * as stylex from '@stylexjs/stylex'
import { motion } from '../../theme/tokens.stylex'
import { scr } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  svg: { display: 'block' },
  track: {
    fill: 'none',
    stroke: scr.track,
    strokeLinecap: 'round',
  },
  ring: {
    fill: 'none',
    stroke: scr.accent,
    strokeLinecap: 'round',
    transitionProperty: 'stroke-dasharray, stroke-dashoffset',
    transitionDuration: motion.durationSlow,
    transitionTimingFunction: motion.easeOut,
  },
  success: { stroke: scr.success },
  warning: { stroke: scr.warning },
  danger: { stroke: scr.danger },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    pointerEvents: 'none',
    textAlign: 'center',
  },
  value: {
    color: scr.fg,
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.05,
    fontVariantNumeric: 'tabular-nums',
  },
  unit: {
    color: scr.fgMuted,
    fontSize: 15,
    fontWeight: 500,
  },
  label: {
    color: scr.fgMuted,
    fontSize: 14,
    lineHeight: '18px',
    maxWidth: '82%',
  },
})

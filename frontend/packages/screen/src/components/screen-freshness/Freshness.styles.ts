import * as stylex from '@stylexjs/stylex'
import { scr, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    color: scr.fgSubtle,
    fontSize: scrType.xs,
    fontVariantNumeric: 'tabular-nums',
  },
  dot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: scr.fgSubtle,
  },
  live: { color: scr.success },
  liveDot: { backgroundColor: scr.success, boxShadow: `0 0 6px ${scr.successSoft}` },
  stale: { color: scr.warning },
  staleDot: { backgroundColor: scr.warning, boxShadow: `0 0 6px ${scr.warningSoft}` },
  wait: {
    color: scr.fgSubtle,
  },
  waitDot: {},
})

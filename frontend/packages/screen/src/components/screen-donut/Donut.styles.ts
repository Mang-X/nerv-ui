import * as stylex from '@stylexjs/stylex'
import { scr, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: { display: 'flex', alignItems: 'center', gap: 18, color: scr.fg },
  figure: { position: 'relative', flexShrink: 0 },
  ring: { stroke: scr.track, fill: 'none', strokeWidth: 11 },
  centerSlot: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
    fontSize: scrType.xs,
  },
  legendRow: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
  swatch: { width: 8, height: 8, flexShrink: 0, borderRadius: 999 },
  legendLabel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: scr.fgMuted,
  },
  legendValue: { color: scr.fg, fontVariantNumeric: 'tabular-nums' },
})

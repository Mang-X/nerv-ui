import * as stylex from '@stylexjs/stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    padding: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.border,
    borderRadius: scrShape.radius,
    backgroundColor: scr.panelAlt,
    color: scr.fg,
    overflowWrap: 'anywhere',
  },
  header: { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 },
  label: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, margin: 0, fontWeight: 500 },
  value: { margin: 0, textAlign: 'end', fontSize: scrType.md, fontVariantNumeric: 'tabular-nums' },
  unit: { color: scr.fgMuted },
  range: { margin: 0, marginTop: 2, color: scr.fgMuted, fontSize: scrType.xs },
  plot: {
    position: 'relative',
    height: 68,
    marginBlock: 12,
    borderRadius: scrShape.radius,
    outlineStyle: 'none',
    ':focus-visible': { boxShadow: `0 0 0 1px ${scr.accent}` },
  },
  cursor: {
    position: 'absolute',
    insetBlock: 0,
    width: 1,
    backgroundColor: scr.fg,
    pointerEvents: 'none',
  },
  sample: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'end',
    gap: 8,
    margin: 0,
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    color: scr.fgMuted,
  },
})

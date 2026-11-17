import * as stylex from '@stylexjs/stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    minWidth: 0,
    paddingInline: 16,
    paddingBlock: 10,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.border,
    borderRadius: scrShape.radiusLg,
    backgroundColor: scr.panel,
    color: scr.fg,
  },
  wrap: { flexWrap: 'wrap' },
  scroll: { flexWrap: 'nowrap', overflowX: 'auto' },
  disabled: { opacity: 0.5, pointerEvents: 'none' },
  group: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 0 },
  label: {
    color: scr.fgMuted,
    fontSize: scrType.xs,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  spacer: { flex: 1, minWidth: 8 },
  separator: {
    flexShrink: 0,
    width: 1,
    alignSelf: 'stretch',
    minHeight: 32,
    backgroundColor: scr.border,
  },
})

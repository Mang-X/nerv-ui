import * as stylex from '@stylexjs/stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'stretch',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.border,
    borderRadius: scrShape.radiusXl,
    backgroundColor: scr.panel,
    color: scr.fg,
    overflowX: 'hidden',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    minWidth: 160,
    paddingInline: 20,
    ':not(:first-child)': {
      borderInlineStartWidth: 1,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: scr.border,
    },
  },
  mdItem: { paddingBlock: 14 },
  lgItem: { paddingBlock: 20 },
  label: {
    color: scr.fgMuted,
    fontSize: scrType.sm,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    color: scr.fg,
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  unit: {
    color: scr.fgMuted,
    fontSize: 16,
    fontWeight: 500,
  },
  hint: {
    color: scr.fgSubtle,
    fontSize: scrType.xs,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
  },
  trend: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
  },
  trendUp: { color: scr.success },
  trendDown: { color: scr.danger },
  trendFlat: { color: scr.fgMuted },
  toneAccent: { color: scr.accent },
  toneSuccess: { color: scr.success },
  toneWarning: { color: scr.warning },
  toneDanger: { color: scr.danger },
})

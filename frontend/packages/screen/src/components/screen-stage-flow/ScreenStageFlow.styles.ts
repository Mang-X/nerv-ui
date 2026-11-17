import * as stylex from '@stylexjs/stylex'
import { motion } from '../../theme/tokens.stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: { display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 10, minWidth: 0, color: scr.fg },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: '1 1 96px',
    minWidth: 0,
    paddingInline: 14,
    paddingBlock: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.border,
    borderRadius: scrShape.radiusLg,
    backgroundColor: scr.panel,
    transitionProperty: 'border-color, background-color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
  heading: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, minWidth: 0 },
  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: scr.fgMuted,
    fontSize: scrType.xs,
    fontWeight: 500,
  },
  valueRow: { display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 0 },
  value: {
    color: scr.fg,
    fontSize: scrType.lg,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
  unit: { color: scr.fgMuted, fontSize: scrType.xs },
  connector: {
    flexShrink: 0,
    alignSelf: 'center',
    color: scr.fgSubtle,
    fontSize: scrType.md,
    lineHeight: 1,
  },
  accent: {
    borderColor: scr.accent,
    backgroundColor: scr.accentSoft,
  },
  success: {
    borderColor: scr.success,
    backgroundColor: scr.successSoft,
  },
  warning: {
    borderColor: scr.warning,
    backgroundColor: scr.warningSoft,
  },
  danger: {
    borderColor: scr.danger,
    backgroundColor: scr.dangerSoft,
  },
  valueToneAccent: { color: scr.accent },
  valueToneSuccess: { color: scr.success },
  valueToneWarning: { color: scr.warning },
  valueToneDanger: { color: scr.danger },
})

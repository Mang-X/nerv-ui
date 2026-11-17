import * as stylex from '@stylexjs/stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    maxWidth: '100%',
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.borderStrong,
    borderRadius: 999,
    backgroundColor: scr.panelAlt,
    color: scr.fg,
    fontVariantNumeric: 'tabular-nums',
    verticalAlign: 'middle',
    overflow: 'hidden',
  },
  dot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: scr.fgSubtle,
  },
  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.1,
  },
  sm: { height: 26, paddingInline: 10, fontSize: scrType.xs },
  md: { height: 32, paddingInline: 12, fontSize: scrType.sm },
  lg: { height: 38, paddingInline: 14, fontSize: scrType.md },
  toneAccent: {
    borderColor: scr.accent,
    backgroundColor: scr.accentSoft,
    color: scr.accent,
  },
  toneSuccess: {
    borderColor: scr.success,
    backgroundColor: scr.successSoft,
    color: scr.success,
  },
  toneWarning: {
    borderColor: scr.warning,
    backgroundColor: scr.warningSoft,
    color: scr.warning,
  },
  toneDanger: {
    borderColor: scr.danger,
    backgroundColor: scr.dangerSoft,
    color: scr.danger,
  },
  textDefault: { color: scr.fgMuted },
  radius: { borderRadius: scrShape.radius },
})

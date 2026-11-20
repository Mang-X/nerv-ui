import * as stylex from '@stylexjs/stylex'
import { color, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  content: {
    width: 280,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    margin: 0,
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeMd,
    fontWeight: 600,
    lineHeight: typography.lineMd,
  },
  description: {
    margin: 0,
    color: color.mutedFg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineMd,
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  dangerIcon: { display: 'inline-flex', color: color.danger, flexShrink: 0 },
})

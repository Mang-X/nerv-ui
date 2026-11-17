import * as stylex from '@stylexjs/stylex'
import { color, typography } from '../../theme/tokens.stylex'

export const dateStyles = stylex.create({
  columns: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 6,
    paddingBlock: 8,
  },
  yearColumn: {
    flex: 1.4,
    minWidth: 0,
  },
  monthColumn: {
    flex: 1,
    minWidth: 0,
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
  },
  caption: {
    paddingBlock: 6,
    color: color.mutedFg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
    textAlign: 'center',
  },
})

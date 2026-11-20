import * as stylex from '@stylexjs/stylex'
import { color, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxSizing: 'border-box',
    width: '100%',
  },
  rootVertical: {
    display: 'inline-flex',
    alignSelf: 'stretch',
    width: 'auto',
    minHeight: 16,
  },
  line: {
    flex: 1,
    minWidth: 0,
    height: 1,
    borderWidth: 0,
    backgroundColor: color.border,
  },
  lineVertical: {
    flex: 'none',
    width: 1,
    height: '100%',
    minHeight: 16,
  },
  label: {
    flexShrink: 0,
    fontFamily: typography.fontSans,
    fontSize: 12,
    lineHeight: '16px',
    color: color.mutedFg,
    whiteSpace: 'nowrap',
  },
})

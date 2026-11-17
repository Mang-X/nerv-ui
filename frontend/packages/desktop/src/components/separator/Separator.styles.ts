import * as stylex from '@stylexjs/stylex'
import { color } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    flexShrink: 0,
    borderWidth: 0,
    backgroundColor: color.border,
  },
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    width: 1,
    height: '100%',
    minHeight: 8,
  },
})

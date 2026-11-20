import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    padding: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radius,
    backgroundColor: color.card,
    color: color.fg,
    fontFamily: typography.fontSans,
    '[data-orientation="vertical"]': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    '[data-disabled]': { opacity: 0.6 },
  },
})

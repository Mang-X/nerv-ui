import * as stylex from '@stylexjs/stylex'
import { color, shape } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxSizing: 'border-box',
    width: 280,
    maxWidth: 'calc(100vw - 24px)',
    padding: 16,
    borderRadius: shape.radius,
    color: color.fg,
    zIndex: 50,
    // ui-sdk marks entry with `data-starting-style` and exit with
    // `data-ending-style`, same as dialog and select.
    '[data-starting-style]': { opacity: 0, transform: 'scale(0.97)' },
    '[data-ending-style]': { opacity: 0, transform: 'scale(0.97)' },
  },
})

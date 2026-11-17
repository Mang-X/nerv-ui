import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: typography.fontSans,
    cursor: 'pointer',
    outlineStyle: 'none',
  },
  content: {
    boxSizing: 'border-box',
    width: 'max-content',
    maxWidth: 240,
    paddingBlock: 6,
    paddingInline: 10,
    borderRadius: shape.radiusSm,
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: 12,
    lineHeight: '16px',
    zIndex: 60,
    // ui-sdk tooltip uses the same `data-starting-style` / `data-ending-style` pair.
    '[data-starting-style]': { opacity: 0 },
    '[data-ending-style]': { opacity: 0 },
  },
})

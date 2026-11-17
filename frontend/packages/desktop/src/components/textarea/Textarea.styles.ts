import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

const dangerHalo = `color-mix(in oklch, ${color.danger} 18%, transparent)`

export const styles = stylex.create({
  root: {
    display: 'block',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: 80,
    paddingBlock: 8,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radius,
    backgroundColor: color.card,
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
    outlineStyle: 'none',
    resize: 'vertical',
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    '::placeholder': { color: color.mutedFg },
    ':disabled': { opacity: 0.5, cursor: 'not-allowed', resize: 'none' },
  },
  autoResize: { resize: 'none', overflow: 'hidden' },
  invalid: {
    borderColor: color.danger,
    ':focus-visible': {
      borderColor: color.danger,
      boxShadow: `0 0 0 1px ${color.danger}, 0 0 0 4px ${dangerHalo}`,
    },
  },
})

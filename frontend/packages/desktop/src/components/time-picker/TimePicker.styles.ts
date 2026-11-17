import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

const dangerHalo = `color-mix(in oklch, ${color.danger} 18%, transparent)`

export const styles = stylex.create({
  field: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    boxSizing: 'border-box',
    height: 36,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radius,
    backgroundColor: color.card,
    color: color.fg,
    fontFamily: typography.fontSans,
    transitionProperty: 'border-color, box-shadow, background-color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { borderColor: color.mutedFg },
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    '[data-invalid]': { borderColor: color.danger },
    '[data-invalid]:focus-within': {
      borderColor: color.danger,
      boxShadow: `0 0 0 1px ${color.danger}, 0 0 0 4px ${dangerHalo}`,
    },
  },
  segment: {
    width: '2.2ch',
    paddingInline: 2,
    borderWidth: 0,
    borderRadius: shape.radiusSm,
    backgroundColor: 'transparent',
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    outlineStyle: 'none',
    ':focus': { backgroundColor: color.brandSoft },
    '[data-type="dayPeriod"]': { width: '3.4ch' },
    '[data-type="literal"]': {
      width: 'auto',
      paddingInline: 2,
      color: color.mutedFg,
      userSelect: 'none',
    },
    '[data-empty]': { color: color.mutedFg },
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    '[data-invalid]': { color: color.danger },
  },
})

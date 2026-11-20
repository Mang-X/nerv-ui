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
    '[data-invalid]:has(:focus-visible)': {
      borderColor: color.danger,
      boxShadow: `0 0 0 1px ${color.danger}, 0 0 0 4px ${dangerHalo}`,
    },
  },
  segment: {
    // 2 位数字 + 左右各 2px 内边距：纯 `2.2ch` 会把数字右侧裁掉（scrollWidth > clientWidth）。
    width: 'calc(2ch + 6px)',
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
    '[data-type="dayPeriod"]': { width: 'calc(3ch + 6px)' },
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

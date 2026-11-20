import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'inline-flex',
    // 居中而不是顶对齐：表格里没有标签文本时，顶对齐 + marginTop 会让
    // 勾选前后行高差 3px（勾选后行高会变矮）。
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
    userSelect: 'none',
  },
  box: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 18,
    height: 18,
    marginTop: 0,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radiusSm,
    backgroundColor: color.card,
    color: 'transparent',
    cursor: 'pointer',
    outlineStyle: 'none',
    transitionProperty: 'background-color, border-color, color, box-shadow',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { borderColor: color.mutedFg },
    '[data-checked]': {
      backgroundColor: color.brand,
      borderColor: color.brand,
      color: color.brandFg,
    },
    '[data-indeterminate]': {
      backgroundColor: color.brand,
      borderColor: color.brand,
      color: color.brandFg,
    },
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
  },
  indicator: {
    display: 'grid',
    placeItems: 'center',
    width: 12,
    height: 12,
  },
  label: {
    cursor: 'pointer',
    color: color.fg,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
  },
})

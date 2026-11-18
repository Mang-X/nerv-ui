import * as stylex from '@stylexjs/stylex'
import { color, motion, shape } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radius,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
    outlineStyle: 'none',
    transitionProperty: 'background-color, border-color, box-shadow, transform, color',
    // 悬停统一用 mutedStrong（比 muted 深一档）。用 muted 的话，次级按钮
    // 静止态本身就是 muted，hover 完全没有反馈。
    ':hover:not(:disabled)': { backgroundColor: color.mutedStrong },
    ':focus-visible': {
      borderColor: color.brand,
      boxShadow: `0 0 0 1px ${color.brand}, 0 0 0 4px ${color.brandSoft}`,
    },
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
    ':active:not(:disabled)': { transform: 'translateY(0.5px)' },
  },
  primary: {
    backgroundColor: color.brand,
    color: color.brandFg,
    ':hover:not(:disabled)': { backgroundColor: color.brandHover },
  },
  // 次级：无描边，靠 muted 填充和 card 表面区分（对比 ≈1.20）。加描边是
  // 用线补色阶的洞——表面层级拉开后不需要它。
  secondary: {
    backgroundColor: color.muted,
    color: color.fg,
  },

  outline: {
    backgroundColor: color.card,
    color: color.fg,
    borderColor: color.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: color.fg,
  },
  danger: {
    backgroundColor: color.danger,
    color: color.dangerFg,
    ':hover:not(:disabled)': { backgroundColor: color.dangerHover },
  },
  link: {
    backgroundColor: 'transparent',
    color: color.brand,
    borderColor: 'transparent',
    textUnderlineOffset: 3,
    textDecorationLine: 'underline',
  },
  sm: { height: 30, paddingInline: 10, fontSize: 13 },
  md: { height: 36, paddingInline: 14 },
  lg: { height: 42, paddingInline: 18, fontSize: 15 },
  block: { width: '100%' },
})

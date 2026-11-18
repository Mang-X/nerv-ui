import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxSizing: 'border-box',
    height: 36,
    paddingInline: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radiusSm,
    backgroundColor: 'transparent',
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeMd,
    fontWeight: 500,
    lineHeight: typography.lineMd,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    outlineStyle: 'none',
    transitionProperty: 'background-color, border-color, box-shadow, color, transform',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { backgroundColor: color.muted },
    // 按下瞬间的物理反馈：轻微内缩，松手回落由过渡完成。
    ':active': { transform: 'scale(0.96)' },
    '[data-pressed]': {
      backgroundColor: color.brandSoft,
      color: color.brand,
    },
    ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
  },
  outline: {
    borderColor: color.border,
    backgroundColor: color.card,
    // 卡片底上的描边按钮：按下后再用品牌色描边 + 浅底，避免和未按下状态只差一层灰。
    '[data-pressed]': {
      borderColor: color.brand,
      backgroundColor: color.brandSoft,
      color: color.brand,
    },
  },
  sm: {
    height: 30,
    paddingInline: 8,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
  },
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    width: 'fit-content',
    padding: 2,
    boxSizing: 'border-box',
    // 外圈 8、内边距 2 → 药丸 6，内外圆角同心。
    borderRadius: 8,
    // 放在工具栏卡片里时，用更浅的底色分层；单独使用时交给 outline 变体。
    backgroundColor: color.muted,
    '[data-orientation="vertical"]': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    '[data-disabled]': { opacity: 0.6 },
  },
})

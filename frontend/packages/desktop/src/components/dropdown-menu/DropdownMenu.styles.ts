import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  content: {
    minWidth: 180,
    paddingBlock: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
    boxSizing: 'border-box',
    paddingInline: 10,
    paddingBlock: 7,
    borderRadius: shape.radiusSm,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
    textAlign: 'start',
    cursor: 'pointer',
    outlineStyle: 'none',
    transitionProperty: 'background-color',
    transitionDuration: motion.durationFast,
    // 原语在条目上写 data-highlighted（键盘与指针悬停共用同一份高亮态），
    // 比自己监听 mouseenter 更可靠：键盘导航时也会亮。
    '[data-highlighted]': { backgroundColor: color.muted },
    ':disabled': { color: color.mutedFg, cursor: 'not-allowed' },
  },
  destructive: {
    color: color.danger,
  },
  shortcut: {
    marginInlineStart: 'auto',
    color: color.mutedFg,
    fontSize: typography.sizeSm,
    letterSpacing: 0.4,
  },
  groupLabel: {
    paddingInline: 10,
    paddingBlock: 6,
    color: color.mutedFg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
  },
  separator: {
    height: 1,
    marginBlock: 4,
    backgroundColor: color.border,
  },
  indicatorSlot: {
    display: 'inline-flex',
    width: 14,
    marginInlineEnd: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

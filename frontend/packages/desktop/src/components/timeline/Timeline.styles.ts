import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

/**
 * 时间线的排版。
 *
 * 元素上的 `data-slot` / `data-first` / `data-last` / `data-current` 由 ui-sdk 原语
 * 写：部件的先后顺序、最后一条不画连接线、进行中的节点加粗，都是原语算出来的，
 * 这里只负责照着这些属性画。
 */
export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    fontFamily: typography.fontSans,
    color: color.fg,
  },
  item: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    paddingInlineStart: 24,
    paddingBlockEnd: 20,
    boxSizing: 'border-box',
    outlineStyle: 'none',
    // 原语把 Tab 停在一个事件上；焦点环要落在这一条上。
    ':focus-visible': {
      borderRadius: 4,
      boxShadow: `0 0 0 2px ${color.brandSoft}`,
    },
    '[data-last]': { paddingBlockEnd: 0 },
    // 原语只在 item 上写 `data-last`；连接线挂在 item 里，按祖先判断。
    '[data-last] [data-nv-timeline-rail]': { display: 'none' },
  },
  /** 连接线：最后一条不出线，剩下的从标记下方接到下一条。 */
  rail: {
    position: 'absolute',
    insetInlineStart: 4.5,
    top: 17,
    bottom: 0,
    width: 1,
    backgroundColor: color.border,
  },
  dot: {
    position: 'absolute',
    insetInlineStart: 0,
    top: 5,
    width: 10,
    height: 10,
    boxSizing: 'border-box',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: '50%',
    backgroundColor: color.card,
    transitionProperty: 'background-color, border-color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
  dotComplete: {
    borderColor: color.brand,
    backgroundColor: color.brand,
  },
  dotCurrent: {
    borderColor: color.brand,
    backgroundColor: color.card,
    boxShadow: `0 0 0 4px ${color.brandSoft}`,
  },
  dotDanger: {
    borderColor: color.danger,
    backgroundColor: color.danger,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  time: {
    color: color.mutedFg,
    fontSize: 12,
    lineHeight: '16px',
  },
  heading: {
    minWidth: 0,
    color: color.fg,
    fontSize: typography.sizeMd,
    fontWeight: 500,
    lineHeight: typography.lineMd,
    '[data-current]': { fontWeight: 600 },
  },
  link: {
    color: color.brand,
    textDecorationLine: 'none',
    borderRadius: 2,
    outlineStyle: 'none',
    ':hover': { textDecorationLine: 'underline' },
  },
  description: {
    margin: 0,
    color: color.mutedFg,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
    overflowWrap: 'anywhere',
  },
})

import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from './gen/tokens.stylex'

/**
 * 组件总览页：分区标题 + 卡片网格。
 *
 * 卡片只由名字和一句话说明构成——库里的组件没有配图，硬凑缩略图会变成
 * 一堆看不懂的色块。名字负责认出组件，说明负责回答「这是干什么的」。
 */
export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    fontFamily: typography.fontSans,
  },

  search: {
    width: '100%',
    maxWidth: 420,
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    margin: 0,
    color: color.fg,
    fontSize: typography.sizeLg,
    fontWeight: 600,
    lineHeight: typography.lineLg,
    letterSpacing: '-0.005em',
  },
  count: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    paddingInline: 6,
    borderRadius: shape.radiusSm,
    backgroundColor: color.muted,
    color: color.mutedFg,
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },

  // 单分组分区（移动 / 触屏 / 大屏）不重复画一遍与页面标题同名的分组标题，
  // 只留一行数量。
  totalLine: {
    margin: 0,
    color: color.mutedFg,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
    fontVariantNumeric: 'tabular-nums',
  },

  grid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fill, minmax(212px, 1fr))',
    '@media (max-width: 639px)': { gridTemplateColumns: '1fr' },
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxSizing: 'border-box',
    paddingBlock: 14,
    paddingInline: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: shape.radius,
    backgroundColor: color.card,
    // 一屏能看到十几张卡，逐张描边会把页面变成绩效表格；靠浮起阴影区分，
    // 描边只在 hover/focus 时出现，顺带成为选中反馈。
    boxShadow: `0 1px 2px oklch(0.3 0.01 262 / 0.06)`,
    color: color.fg,
    textDecorationLine: 'none',
    outlineStyle: 'none',
    transitionProperty: 'border-color, box-shadow, transform, background-color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': {
      borderColor: color.brand,
      boxShadow: `0 4px 14px -4px ${color.brandSoft}`,
      transform: 'translateY(-1px)',
    },
    ':focus-visible': {
      borderColor: color.brand,
      boxShadow: `0 0 0 1px ${color.brand}, 0 0 0 4px ${color.brandSoft}`,
    },
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    minWidth: 0,
    color: color.fg,
    fontSize: typography.sizeMd,
    fontWeight: 600,
    lineHeight: typography.lineMd,
  },
  // 「NvButton」比中文名更常用，抽出来单独控制字重；整串仍然是一个链接文本。
  cardName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardDesc: {
    color: color.mutedFg,
    fontSize: typography.sizeSm,
    // 13px 配 20px 行高（1.54）：18px 只有 1.38，两行说明会显得挤。
    lineHeight: typography.lineMd,
    // 两行截断：说明长短不一，不截会把网格撑成参差的锯齿。
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },

  empty: {
    paddingBlock: 32,
    color: color.mutedFg,
    fontSize: typography.sizeMd,
  },
})

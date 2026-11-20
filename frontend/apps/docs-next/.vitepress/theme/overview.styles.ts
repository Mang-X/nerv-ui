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

  grid: {
    display: 'grid',
    gap: 12,
    // 卡片带示意图后需要更宽的落脚：212px 只能放三列且挤压名字，236px 在
    // 1080px 容器里正好四列。
    gridTemplateColumns: 'repeat(auto-fill, minmax(236px, 1fr))',
    // 手机上单列时一屏只能放 4 张卡（桌面分区 46 个组件要滚十几屏），
    // 两列后一屏能放 6 张以上，且封面随卡片宽度缩放。
    '@media (max-width: 639px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 },
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
    padding: 0,
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
  // 名字在上、示意图在下：先认出是哪个组件，再用图形确认形态（与 antd 总览一致）。
  cardHead: {
    paddingBlock: '12px 10px',
    paddingInline: 14,
    color: color.fg,
    fontSize: typography.sizeMd,
    fontWeight: 600,
    lineHeight: typography.lineMd,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    // 断行只在空格处发生：`overflowWrap: anywhere` 会把「告警列表」从中间
    // 拆成「告警列 / 表」，窄屏双列时还会把英文标识劈开。英文标识本身超长时
    // 才允许词内断行（break-word）。
    overflowWrap: 'break-word',
    wordBreak: 'normal',
  },

  // 标题拆成「英文标识」「中文名」两段：英文标识整体不拆（它是组件名，
  // 拆开就没法搜），中文名允许在字间断行。窄屏双列时长标题因此整齐。
  cardEn: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  cardZh: {
    display: 'block',
    color: color.mutedFg,
    fontWeight: 500,
  },

  empty: {
    paddingBlock: 32,
    color: color.mutedFg,
    fontSize: typography.sizeMd,
  },
})

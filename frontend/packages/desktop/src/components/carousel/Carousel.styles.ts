import * as stylex from '@stylexjs/stylex'
import { color, elevation, motion, shape, typography } from '../../theme/tokens.stylex'

/**
 * 自动轮播的计时进度：选中圆点里的填充从左铺满一整条。
 * 时长由根上的 `--nv-carousel-interval` 决定（跟随 `interval` 属性）。
 */
const progressSweep = stylex.keyframes({
  from: { transform: 'scaleX(0)' },
  to: { transform: 'scaleX(1)' },
})

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    fontFamily: typography.fontSans,
    color: color.fg,
    // 自动轮播在悬停 / 页面隐藏 / 移出视口时暂停，ui-sdk 把这件事写在根元素的
    // `data-paused` 上。进度条跟着停，否则「看到满格却还要再等一整个间隔」。
    // 这里只声明暂停分支：进度条自己的样式里不写 animation-play-state，
    // 免得两处声明在同等特化下抢归属。
    '[data-paused] [data-progress]': { animationPlayState: 'paused' },
  },
  frame: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    // 「悬停才出箭头」的规则必须写在 frame 上：控件的原子类带 `:not(#\#)`
    // 特化，从外部规则压不过它，所以隐显也由这里声明，控件本身不碰 opacity。
    // 三个分支都覆盖禁用箭头——禁用的那侧只是图标变灰，不该在静息态单独浮着一个
    // 空圆；聚焦进来时整组一起亮，键盘焦点不会落在看不见的按钮上。
    '@media (hover: hover)': {
      '[data-arrows="hover"] button': { opacity: 0 },
      '[data-arrows="hover"]:hover button': { opacity: 1 },
      '[data-arrows="hover"]:focus-within button': { opacity: 1 },
    },
  },
  viewport: {
    width: '100%',
    minWidth: 0,
    // ui-sdk 的 viewport 自己在内联样式里写了 `overflow: auto`（内联样式压过原子类），
    // 于是翻页时能看到一条横向滚动条。这里把滚动条本身隐藏，滚动能力保留。
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
    borderRadius: shape.radiusLg,
    outlineStyle: 'none',
    // 可拖拽时才给「能抓住」的手感（`drag=false` 的轮播不该出现 grab），
    // 拖拽中 ui-sdk 在 viewport 上写 data-dragging。
    '[data-grab]': { cursor: 'grab' },
    '[data-grab][data-dragging]': { cursor: 'grabbing' },
  },
  // 竖向轮播要「一屏几行」，必须把高度沿 root → frame → viewport 传下去；
  // 不传的话 viewport 会被四张卡片撑开，四张全露、翻页无从谈起。
  rootV: { height: '100%' },
  frameV: { flexGrow: 1, minHeight: 0 },
  viewportV: { height: '100%', minHeight: 0 },
  content: {
    display: 'flex',
    boxSizing: 'border-box',
    // 间距走根上的 CSS 变量：幻灯片要靠同一个数字算自己的宽度，
    // 写死在两张原子表里迟早对不上。
    gap: 'var(--nv-carousel-gap)',
  },
  item: {
    flexShrink: 0,
    minWidth: 0,
    boxSizing: 'border-box',
  },

  // 箭头本身只管长相与状态；放哪儿由下面几个定位变体决定（横向压住内容边缘、
  // 竖向落在底栏）。
  control: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: '50%',
    backgroundColor: color.card,
    color: color.fg,
    cursor: 'pointer',
    boxShadow: elevation.sm,
    outlineStyle: 'none',
    transitionProperty: 'background-color, border-color, box-shadow, color, opacity',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    // 悬停不用整体换底色（那样箭头会和轮播内容一起「跳一下」），只把描边和
    // 图标换成品牌色，指向性更准。
    ':hover:not([data-disabled])': {
      borderColor: color.brand,
      color: color.brand,
      boxShadow: `0 4px 12px -4px ${color.brandSoft}`,
    },
    // 禁用态只降图标明度、不动整颗按钮的 opacity：浅色底上按钮底色本就接近
    // 面板，叠一层 0.35 会把胶囊整颗抹掉，只剩一个悬空的箭头图形。
    '[data-disabled]': { color: color.mutedFg, cursor: 'default', boxShadow: 'none' },
  },
  previousH: {
    position: 'absolute',
    zIndex: 1,
    insetInlineStart: 8,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  nextH: {
    position: 'absolute',
    zIndex: 1,
    insetInlineEnd: 8,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  // 底栏右侧的动作区：竖向轮播的上/下箭头与播放按钮排在一起，
  // 不去压内容——竖向内容本身是满宽的，压上去必然盖字。
  actions: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gridColumn: 3,
    gap: 6,
  },

  // 指示区：三栏网格让圆点/计数始终居中，播放按钮靠右时也不会把中点推走。
  footer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: 8,
    minHeight: 24,
  },
  indicators: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    // 三栏网格的中栏：圆点、计数、播放按钮各自就位，谁在谁不在都不会把中点推走。
    gridColumn: 2,
    // 每个指示按钮本身就是 24px 的点击区，间距靠热区叠出来（与 Aero 一致），
    // 视觉上圆点仍是 7px，热区却够手指点。
    gap: 0,
  },
  indicator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: 24,
    height: 24,
    padding: 0,
    borderWidth: 0,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    outlineStyle: 'none',
    // 悬停只抬高未选中那条的明度；选中的保持品牌色，两者互不抢。
    ':hover > span:not([data-selected])': { backgroundColor: color.mutedFg },
  },
  // 圆点与分段线是两套完整形态，不互相叠加：叠加会让 `[data-selected]` 的宽度
  // 在两张原子表里各写一遍，谁生效只能靠样式表顺序。
  markDot: {
    position: 'relative',
    display: 'block',
    width: 7,
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: color.border,
    transitionProperty: 'width, background-color',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeOut,
    // 选中不是缩放（缩放会让圆点重叠），是把圆点拉成一条胶囊：位置不跳，
    // 也直接对应「正在第几页」。
    '[data-selected]': { width: 18, backgroundColor: color.brand },
    // 自动轮播时胶囊先当进度槽（中性底），品牌色填充从左扫过。
    '[data-selected][data-playing]': { backgroundColor: color.mutedStrong },
    // 减弱动效时不做扫动：槽直接收成品牌实心，选中态照旧一眼可辨。
    '@media (prefers-reduced-motion: reduce)': {
      '[data-selected][data-playing]': { backgroundColor: color.brand },
    },
  },
  markLine: {
    position: 'relative',
    display: 'block',
    width: 12,
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: color.border,
    transitionProperty: 'width, background-color',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeOut,
    '[data-selected]': { width: 24, backgroundColor: color.brand },
    '[data-selected][data-playing]': { backgroundColor: color.mutedStrong },
    '@media (prefers-reduced-motion: reduce)': {
      '[data-selected][data-playing]': { backgroundColor: color.brand },
    },
  },
  progress: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: '100%',
    backgroundColor: color.brand,
    transformOrigin: 'left center',
    animationName: progressSweep,
    animationDuration: 'var(--nv-carousel-interval)',
    animationTimingFunction: 'linear',
    animationFillMode: 'both',
    '@media (prefers-reduced-motion: reduce)': { display: 'none' },
  },

  count: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 3,
    gridColumn: 2,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    lineHeight: '24px',
    letterSpacing: '0.01em',
    color: color.mutedFg,
  },
  countCurrent: { color: color.fg, fontWeight: 600 },
  /** 计数只显示 `1 / 4`，把「第几页、共几页」留给读屏。 */
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },

  play: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: 24,
    height: 24,
    padding: 0,
    borderWidth: 0,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: color.mutedFg,
    cursor: 'pointer',
    outlineStyle: 'none',
    transitionProperty: 'background-color, color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { backgroundColor: color.mutedStrong, color: color.fg },
  },
})

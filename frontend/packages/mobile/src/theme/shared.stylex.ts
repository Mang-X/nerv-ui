import * as stylex from '@stylexjs/stylex'
import { color, motion } from './tokens.stylex'

/**
 * Shared interaction contract: the one focus affordance every input/trigger
 * uses. Navigation/selection rows use `focusSubtle` instead so they never get
 * a heavy halo (see issue #340 lesson).
 */
export const focus = stylex.create({
  ring: {
    outlineStyle: 'none',
    // 不在这里声明 transitionProperty：组件自己往往要过渡背景色/位移，
    // 这里再写一次会在 stylex.props 里把组件的过渡整组覆盖掉（开关、切换按钮
    // 的「变色瞬间跳变、滑块才动」就是这么来的）。
    ':focus-visible': {
      borderColor: color.brand,
      boxShadow: `0 0 0 1px ${color.brand}, 0 0 0 4px ${color.brandSoft}`,
    },
    // 包裹真实输入件的容器要跟着亮，但只能用 `:has(:focus-visible)`：`:focus-within`
    // 在鼠标点击时也成立，按钮类控件会「按下后聚焦环永不消失」。
    ':has(:focus-visible)': {
      borderColor: color.brand,
      boxShadow: `0 0 0 1px ${color.brand}, 0 0 0 4px ${color.brandSoft}`,
    },
  },
  /** Light affordance for tabs/rows/menu items: 1px only, keyboard focus only. */
  subtle: {
    outlineStyle: 'none',
    ':focus-visible': {
      boxShadow: `0 0 0 1px ${color.brand}`,
    },
  },
})

/** Floating surfaces share one glass recipe. */
export const glass = stylex.create({
  surface: {
    backgroundColor: `color-mix(in oklch, ${color.card} 82%, transparent)`,
    backdropFilter: 'blur(16px) saturate(1.6)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
  },
})

/** Overlay scaffolding shared by dialogs, drawers, popovers and menus. */
export const overlay = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: 'oklch(0 0 0 / 0.4)',
    backdropFilter: 'blur(2px)',
  },
  panel: {
    zIndex: 50,
    borderRadius: 14,
    boxShadow: '0 12px 24px -6px oklch(0 0 0 / 0.1), 0 4px 8px -4px oklch(0 0 0 / 0.05)',
    padding: 20,
    color: color.fg,
  },
})

/** Enter/exit for overlays: ui-sdk marks the leaving frame with data-ending-style. */
export const presence = stylex.create({
  fadeZoom: {
    transitionProperty: 'opacity, transform',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    opacity: 1,
    transform: 'scale(1)',
    '@starting-style': { opacity: 0, transform: 'scale(0.97)' },
  },
  fade: {
    transitionProperty: 'opacity',
    transitionDuration: motion.durationFast,
    opacity: 1,
    '@starting-style': { opacity: 0 },
  },
})

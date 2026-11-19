import * as stylex from '@stylexjs/stylex'

/**
 * Design tokens for @nerv-ui. Defined as StyleX variables so they compile to
 * typed CSS custom properties shared across the four form-factor packages.
 */
export const color = stylex.defineVars({
  // 表面三层：canvas（bg）< 控件填充（muted）< chrome/卡片（card）。
  // 层级靠亮度差表达，不靠描边；控件在 card 上的对比 ≈1.20，肉眼可辨。
  bg: 'oklch(0.972 0.004 258)',
  fg: 'oklch(0.205 0.016 262)',
  card: 'oklch(1 0 0)',
  muted: 'oklch(0.944 0.007 258)',
  // 悬停/按下的填充。和 muted 是同一族，只降亮度——次级按钮的 hover 必须能
  // 和它的静止态分开，共用 muted 会让 hover 完全没有反馈。
  mutedStrong: 'oklch(0.905 0.01 258)',
  mutedFg: 'oklch(0.50 0.018 260)',
  border: 'oklch(0.90 0.008 258)',
  brand: 'oklch(0.548 0.212 262)',
  brandHover: 'oklch(0.492 0.205 262)',
  brandFg: 'oklch(1 0 0)',
  brandSoft: 'oklch(0.548 0.212 262 / 0.12)',
  danger: 'oklch(0.575 0.205 26)',
  dangerHover: 'oklch(0.52 0.2 26)',
  dangerFg: 'oklch(1 0 0)',
  // 语义色：只在「状态」上出现（成功/进行中/预警），不参与品牌强调。
  success: 'oklch(0.62 0.17 152)',
  warning: 'oklch(0.72 0.16 78)',
})

export const shape = stylex.defineVars({
  radius: '10px',
  radiusSm: '6px',
  radiusLg: '14px',
})

export const motion = stylex.defineVars({
  durationFast: '150ms',
  durationBase: '220ms',
  durationSlow: '320ms',
  easeOut: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOut: 'cubic-bezier(0.76, 0, 0.24, 1)',
})

/** Dark theme: swap only the surface/text/border family; brand stays tinted. */
export const darkTheme = stylex.createTheme(color, {
  bg: 'oklch(0.150 0.006 262)',
  fg: 'oklch(0.975 0.002 260)',
  card: 'oklch(0.205 0.007 262)',
  muted: 'oklch(0.278 0.009 262)',
  mutedStrong: 'oklch(0.330 0.011 262)',
  mutedFg: 'oklch(0.720 0.012 260)',
  border: 'oklch(0.310 0.010 262)',
  brand: 'oklch(0.655 0.175 260)',
  brandHover: 'oklch(0.715 0.16 260)',
  brandFg: 'oklch(0.150 0.006 262)',
  brandSoft: 'oklch(0.655 0.175 260 / 0.18)',
  danger: 'oklch(0.700 0.180 24)',
  dangerHover: 'oklch(0.755 0.165 24)',
  dangerFg: 'oklch(0.150 0.006 262)',
  success: 'oklch(0.72 0.16 152)',
  warning: 'oklch(0.80 0.16 80)',
})

export const elevation = stylex.defineVars({
  sm: '0 1px 3px 0 oklch(0 0 0 / 0.08), 0 1px 2px -1px oklch(0 0 0 / 0.06)',
  md: '0 4px 8px -2px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.05)',
  lg: '0 12px 24px -6px oklch(0 0 0 / 0.1), 0 4px 8px -4px oklch(0 0 0 / 0.05)',
})

export const typography = stylex.defineVars({
  fontSans:
    'Inter Variable, ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
  sizeSm: '13px',
  sizeMd: '14px',
  sizeLg: '15px',
  lineSm: '18px',
  lineMd: '20px',
  lineLg: '22px',
})

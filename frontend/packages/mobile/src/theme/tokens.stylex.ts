import * as stylex from '@stylexjs/stylex'

/**
 * Design tokens for @nerv-ui. Defined as StyleX variables so they compile to
 * typed CSS custom properties shared across the four form-factor packages.
 */
export const color = stylex.defineVars({
  bg: 'oklch(0.985 0 0)',
  fg: 'oklch(0.145 0 0)',
  card: 'oklch(1 0 0)',
  muted: 'oklch(0.97 0 0)',
  mutedFg: 'oklch(0.556 0 0)',
  border: 'oklch(0.922 0 0)',
  brand: 'oklch(0.54 0.16 256)',
  brandFg: 'oklch(0.985 0 0)',
  brandSoft: 'oklch(0.54 0.16 256 / 0.14)',
  danger: 'oklch(0.577 0.245 27.3)',
  dangerFg: 'oklch(0.985 0 0)',
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
  bg: 'oklch(0.145 0 0)',
  fg: 'oklch(0.985 0 0)',
  card: 'oklch(0.205 0 0)',
  muted: 'oklch(0.269 0 0)',
  mutedFg: 'oklch(0.708 0 0)',
  border: 'oklch(1 0 0 / 0.1)',
  brand: 'oklch(0.64 0.15 256)',
  brandFg: 'oklch(0.145 0 0)',
  brandSoft: 'oklch(0.64 0.15 256 / 0.18)',
  danger: 'oklch(0.704 0.191 22.2)',
  dangerFg: 'oklch(0.145 0 0)',
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

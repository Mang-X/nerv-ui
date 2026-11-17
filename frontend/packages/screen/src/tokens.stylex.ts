import * as stylex from '@stylexjs/stylex'

/**
 * Screen-only palette. The screen package never consumes the light desktop
 * surface tokens: a wall display is read from several metres away, so it gets
 * its own deep, high-contrast set of CSS variables (`--scr-*`).
 *
 * These are the default (dark stage) values. `screenDarkTheme` is an explicit
 * even-deeper variant that `NvScreenScaler` applies to a whole stage.
 */
export const scr = stylex.defineVars({
  bg: 'oklch(0.145 0.02 255)',
  bgSoft: 'oklch(0.185 0.022 255)',
  panel: 'oklch(0.205 0.024 255)',
  panelAlt: 'oklch(0.24 0.026 255)',
  panelRaised: 'oklch(0.265 0.028 255)',
  fg: 'oklch(0.97 0.008 255)',
  fgMuted: 'oklch(0.72 0.02 255)',
  fgSubtle: 'oklch(0.58 0.02 255)',
  border: 'oklch(1 0 0 / 0.12)',
  borderStrong: 'oklch(1 0 0 / 0.22)',
  accent: 'oklch(0.78 0.14 205)',
  accentFg: 'oklch(0.16 0.02 255)',
  accentSoft: 'oklch(0.78 0.14 205 / 0.16)',
  success: 'oklch(0.79 0.16 152)',
  successSoft: 'oklch(0.79 0.16 152 / 0.16)',
  warning: 'oklch(0.83 0.15 82)',
  warningSoft: 'oklch(0.83 0.15 82 / 0.16)',
  danger: 'oklch(0.69 0.2 25)',
  dangerSoft: 'oklch(0.69 0.2 25 / 0.16)',
  track: 'oklch(1 0 0 / 0.08)',
  scrim: 'oklch(0 0 0 / 0.55)',
})

export const scrShape = stylex.defineVars({
  radius: '10px',
  radiusLg: '16px',
  radiusXl: '22px',
})

export const scrType = stylex.defineVars({
  xs: '13px',
  sm: '15px',
  md: '18px',
  lg: '24px',
  xl: '34px',
  display: '48px',
})

/**
 * Forced deep-stage theme. Apply to a stage root (NvScreenScaler does) when a
 * page needs stronger separation than the default dark tokens give.
 */
export const screenDarkTheme = stylex.createTheme(scr, {
  bg: 'oklch(0.105 0.016 255)',
  bgSoft: 'oklch(0.15 0.018 255)',
  panel: 'oklch(0.175 0.021 255)',
  panelAlt: 'oklch(0.205 0.023 255)',
  panelRaised: 'oklch(0.235 0.025 255)',
  border: 'oklch(1 0 0 / 0.16)',
  borderStrong: 'oklch(1 0 0 / 0.3)',
  accentSoft: 'oklch(0.78 0.14 205 / 0.22)',
  track: 'oklch(1 0 0 / 0.1)',
})

import * as stylex from '@stylexjs/stylex'
import { scr, scrShape } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: 56,
    height: 30,
    padding: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.borderStrong,
    borderRadius: 999,
    backgroundColor: scr.track,
    cursor: 'pointer',
    outlineStyle: 'none',
    transitionProperty: 'background-color, border-color, box-shadow',
    transitionDuration: '0.18s',
    transitionTimingFunction: 'ease-out',
    ':focus-visible': { boxShadow: `0 0 0 1px ${scr.accent}, 0 0 0 4px ${scr.accentSoft}` },
    // 开态由原语写的 data-checked 驱动；不自己在组件里存一份布尔。
    '[data-checked]': {
      backgroundColor: scr.accent,
      borderColor: scr.accent,
      boxShadow: `0 0 10px ${scr.accentSoft}`,
    },
    '[data-disabled]': { opacity: 0.45, cursor: 'not-allowed' },
    '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  },
  thumb: {
    display: 'block',
    width: 22,
    height: 22,
    borderRadius: scrShape.radius,
    backgroundColor: scr.fg,
    transform: 'translateX(0)',
    transitionProperty: 'transform, background-color',
    transitionDuration: '0.18s',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    '[data-checked]': { transform: 'translateX(26px)', backgroundColor: scr.accentFg },
    '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  },
})

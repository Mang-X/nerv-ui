import * as stylex from '@stylexjs/stylex'
import { color, elevation, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxSizing: 'border-box',
    borderWidth: 0,
    backgroundColor: color.brand,
    color: color.brandFg,
    fontFamily: typography.fontSans,
    fontWeight: 600,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    boxShadow: elevation.lg,
    transitionProperty: 'transform, opacity, background-color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
    ':active:not(:disabled)': { transform: 'scale(0.96)' },
  },
  floating: {
    position: 'fixed',
    zIndex: 40,
  },
  bottomRight: {
    right: 16,
  },
  bottomLeft: {
    left: 16,
  },
  bottomCenter: {
    left: '50%',
    translate: '-50% 0',
  },
  md: {
    minWidth: 48,
    minHeight: 48,
    paddingInline: 18,
    borderRadius: shape.radiusLg,
    fontSize: typography.sizeLg,
  },
  lg: {
    width: 56,
    height: 56,
    paddingInline: 0,
    borderRadius: 999,
    fontSize: typography.sizeLg,
  },
  round: {
    borderRadius: 999,
  },
})

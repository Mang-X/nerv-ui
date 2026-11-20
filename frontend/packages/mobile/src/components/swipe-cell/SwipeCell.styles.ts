import * as stylex from '@stylexjs/stylex'
import { color, motion, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: color.card,
    touchAction: 'pan-y',
  },
  actions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'stretch',
  },
  actionsEnd: {
    right: 0,
  },
  actionsStart: {
    left: 0,
  },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
    boxSizing: 'border-box',
    minHeight: 44,
    paddingInline: 12,
    borderWidth: 0,
    backgroundColor: color.brand,
    color: color.brandFg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeSm,
    fontWeight: 600,
    lineHeight: typography.lineSm,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    ':disabled': { cursor: 'not-allowed', opacity: 0.5 },
    ':active:not(:disabled)': { opacity: 0.85 },
  },
  actionDanger: {
    backgroundColor: color.danger,
    color: color.dangerFg,
  },
  actionNeutral: {
    backgroundColor: color.muted,
    color: color.fg,
  },
  content: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: color.card,
    transitionProperty: 'transform',
    transitionDuration: motion.durationBase,
    transitionTimingFunction: motion.easeOut,
    willChange: 'transform',
    touchAction: 'pan-y',
  },
  contentDragging: {
    transitionDuration: '0ms',
  },
})

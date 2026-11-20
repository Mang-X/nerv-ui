import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    boxSizing: 'border-box',
    width: '100%',
    paddingInline: 12,
    paddingBlock: 10,
    borderRadius: shape.radius,
    backgroundColor: color.brandSoft,
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: 14,
    lineHeight: '20px',
  },
  neutral: {
    backgroundColor: color.muted,
  },
  danger: {
    backgroundColor: `color-mix(in oklch, ${color.danger} 12%, transparent)`,
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
    color: color.brand,
  },
  iconNeutral: {
    color: color.mutedFg,
  },
  iconDanger: {
    color: color.danger,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  close: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 28,
    height: 28,
    margin: -4,
    borderWidth: 0,
    borderRadius: 999,
    backgroundColor: 'transparent',
    color: color.mutedFg,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    '::before': {
      content: '""',
      position: 'absolute',
      inset: -8,
      borderRadius: 999,
    },
  },
})

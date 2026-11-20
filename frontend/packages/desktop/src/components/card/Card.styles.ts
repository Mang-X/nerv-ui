import * as stylex from '@stylexjs/stylex'
import { color, elevation, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: shape.radiusLg,
    color: color.fg,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
    backgroundColor: color.card,
  },
  outline: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
  },
  solid: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    boxShadow: elevation.sm,
  },
  ghost: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxSizing: 'border-box',
    paddingBlock: '20px 12px',
    paddingInline: 20,
    minWidth: 0,
  },
  content: {
    boxSizing: 'border-box',
    paddingBlock: 12,
    paddingInline: 20,
    minWidth: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    boxSizing: 'border-box',
    paddingBlock: '12px 20px',
    paddingInline: 20,
    minWidth: 0,
  },
})

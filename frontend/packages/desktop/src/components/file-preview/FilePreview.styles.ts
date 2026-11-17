import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radius,
    backgroundColor: color.muted,
    fontFamily: typography.fontSans,
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  frame: {
    display: 'block',
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: color.card,
  },
  placeholder: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    textAlign: 'center',
    color: color.mutedFg,
  },
  placeholderIcon: {
    color: color.mutedFg,
  },
  placeholderTitle: {
    maxWidth: '100%',
    color: color.fg,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: '20px',
    wordBreak: 'break-all',
  },
  placeholderMeta: {
    color: color.mutedFg,
    fontSize: 12,
    lineHeight: '18px',
    wordBreak: 'break-word',
  },
  placeholderNote: {
    color: color.mutedFg,
    fontSize: 12,
    lineHeight: '18px',
  },
  link: {
    marginTop: 4,
    color: color.brand,
    fontSize: 12,
    fontWeight: 500,
    textDecorationLine: 'underline',
    textUnderlineOffset: 3,
  },
})

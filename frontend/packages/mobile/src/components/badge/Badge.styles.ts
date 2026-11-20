import * as stylex from '@stylexjs/stylex'
import { color, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: { position: 'relative', display: 'inline-flex' },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: color.danger,
    boxShadow: `0 0 0 2px ${color.bg}`,
  },
  count: {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translate(33%, -33%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    boxSizing: 'border-box',
    borderRadius: 999,
    backgroundColor: color.danger,
    color: color.dangerFg,
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    boxShadow: `0 0 0 2px ${color.bg}`,
  },
})

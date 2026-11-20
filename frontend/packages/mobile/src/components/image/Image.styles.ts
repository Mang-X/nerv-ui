import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'block',
    overflowX: 'hidden',
    overflowY: 'hidden',
    backgroundColor: color.muted,
    color: color.mutedFg,
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  radiusNone: {},
  radiusSm: { borderRadius: shape.radiusSm },
  radiusMd: { borderRadius: shape.radius },
  radiusLg: { borderRadius: shape.radiusLg },
  radiusFull: { borderRadius: 9999 },
  fitCover: { objectFit: 'cover' },
  fitContain: { objectFit: 'contain' },
  placeholder: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.sizeSm,
  },
})

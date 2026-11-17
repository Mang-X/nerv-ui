import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  nav: {
    display: 'block',
    minWidth: 0,
    color: color.fg,
    fontFamily: typography.fontSans,
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
    paddingInline: 2,
    borderRadius: shape.radiusSm,
    color: color.mutedFg,
    textDecorationLine: 'none',
    outlineStyle: 'none',
    transitionProperty: 'color, box-shadow',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { color: color.fg },
  },
  current: {
    color: color.fg,
    fontWeight: 500,
  },
  separator: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: color.mutedFg,
  },
})

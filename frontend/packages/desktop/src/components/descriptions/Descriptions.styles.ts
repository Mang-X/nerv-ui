import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'grid',
    alignItems: 'start',
    width: '100%',
    minWidth: 0,
    margin: 0,
    boxSizing: 'border-box',
    fontFamily: typography.fontSans,
    color: color.fg,
  },
  gap: {
    gap: 16,
  },
  bordered: {
    gap: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    borderRadius: shape.radiusLg,
    backgroundColor: color.border,
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    gap: 12,
    alignItems: 'baseline',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  itemVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
  },
  itemBordered: {
    paddingBlock: 10,
    paddingInline: 12,
    backgroundColor: color.card,
  },
  label: {
    margin: 0,
    flexShrink: 0,
    color: color.mutedFg,
    fontSize: typography.sizeSm,
    lineHeight: typography.lineSm,
    fontWeight: 400,
  },
  value: {
    margin: 0,
    minWidth: 0,
    color: color.fg,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
    overflowWrap: 'anywhere',
  },
})

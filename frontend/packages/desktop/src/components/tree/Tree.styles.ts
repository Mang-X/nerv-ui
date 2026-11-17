import * as stylex from '@stylexjs/stylex'
import { color, motion, shape, typography } from '../../theme/tokens.stylex'

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    padding: 4,
    boxSizing: 'border-box',
    fontFamily: typography.fontSans,
    color: color.fg,
  },
  item: {
    outlineStyle: 'none',
    // Focus stays on the treeitem while the visible row is its label, so the
    // keyboard-only 1px ring (the `focus.subtle` affordance) is drawn there.
    ':focus-visible [data-slot="tree-label"]': {
      boxShadow: `0 0 0 1px ${color.brand}`,
    },
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 6,
    paddingInline: 8,
    borderRadius: shape.radiusSm,
    color: 'inherit',
    fontSize: typography.sizeMd,
    lineHeight: typography.lineMd,
    cursor: 'pointer',
    outlineStyle: 'none',
    transitionProperty: 'background-color, color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    ':hover': { backgroundColor: color.muted },
    '[data-selected]': {
      backgroundColor: color.brandSoft,
      color: color.fg,
      fontWeight: 500,
    },
    '[data-current]': { color: color.brand, fontWeight: 600 },
    '[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
    '[data-loading]': { opacity: 0.7 },
  },
  indicator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 16,
    height: 16,
    color: color.mutedFg,
    transitionProperty: 'transform, color',
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
    '[data-expanded]': { color: color.brand, transform: 'rotate(90deg)' },
  },
  text: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  group: {
    paddingInlineStart: 16,
  },
})

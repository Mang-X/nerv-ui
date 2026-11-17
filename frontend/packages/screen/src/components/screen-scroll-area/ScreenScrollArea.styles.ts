import * as stylex from '@stylexjs/stylex'
import { focus } from '../../theme/shared.stylex'
import { scr, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    color: scr.fg,
  },
  viewport: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'hidden',
    outlineStyle: 'none',
  },
  manualViewport: { overflowY: 'auto' },
  track: { willChange: 'transform' },
  empty: { color: scr.fgSubtle, fontSize: scrType.sm, margin: 0, paddingBlock: 12 },
  focus: focus.subtle,
})

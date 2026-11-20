import * as stylex from '@stylexjs/stylex'
import { scr } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    width: '100%',
    overflowX: 'hidden',
    overflowY: 'hidden',
    backgroundColor: scr.bg,
    color: scr.fg,
  },
  stage: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  },
})

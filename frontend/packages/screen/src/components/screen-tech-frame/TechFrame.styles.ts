import * as stylex from '@stylexjs/stylex'
import { scr, scrShape } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    borderRadius: scrShape.radius,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.borderStrong,
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    pointerEvents: 'none',
  },
  cornerCyan: { borderColor: scr.accent },
  cornerGreen: { borderColor: scr.success },
  cornerAmber: { borderColor: scr.warning },
  cornerRed: { borderColor: scr.danger },
})

import * as stylex from '@stylexjs/stylex'
import { scr, scrShape } from '../../tokens.stylex'

export const styles = stylex.create({
  root: {
    position: 'relative',
    backgroundColor: scr.panel,
    borderRadius: scrShape.radiusLg,
    paddingInline: 20,
    paddingBlock: 18,
    color: scr.fg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.borderStrong,
  },
  notch: {
    position: 'absolute',
    top: -1,
    left: '50%',
    width: 56,
    height: 2,
    transform: 'translateX(-50%)',
    borderRadius: '0 0 2px 2px',
    backgroundColor: scr.accent,
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    pointerEvents: 'none',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: scr.accent,
    opacity: 0.8,
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: 500, color: scr.fgMuted, letterSpacing: '0.02em' },
  body: { position: 'relative' },
})

import * as stylex from '@stylexjs/stylex'
import { scr, scrShape, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: scr.scrim,
    backdropFilter: 'blur(2px)',
  },
  content: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    zIndex: 51,
    transform: 'translate(-50%, -50%)',
    width: 'min(640px, calc(100vw - 48px))',
    maxHeight: 'calc(100vh - 96px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxSizing: 'border-box',
    padding: 20,
    borderRadius: scrShape.radiusLg,
    backgroundColor: scr.panel,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: scr.borderStrong,
    color: scr.fg,
    fontSize: scrType.sm,
  },
  header: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  headText: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  title: { margin: 0, fontSize: scrType.md, fontWeight: 600 },
  description: { margin: 0, marginTop: 4, color: scr.fgMuted },
  body: { overflowY: 'auto', minHeight: 0 },
})

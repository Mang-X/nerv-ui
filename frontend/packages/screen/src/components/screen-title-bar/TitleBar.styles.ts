import * as stylex from '@stylexjs/stylex'
import { scr, scrType } from '../../tokens.stylex'

export const styles = stylex.create({
  root: { display: 'flex', alignItems: 'center', gap: 18, color: scr.fg },
  ruleLeft: {
    position: 'relative',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 1,
    backgroundImage: `linear-gradient(90deg, transparent, ${scr.borderStrong} 55%, ${scr.accentSoft})`,
  },
  ruleRight: {
    position: 'relative',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 1,
    backgroundImage: `linear-gradient(90deg, ${scr.accentSoft}, ${scr.borderStrong} 45%, transparent)`,
  },
  node: {
    position: 'absolute',
    top: '50%',
    width: 6,
    height: 6,
    backgroundColor: scr.accent,
    boxShadow: `0 0 6px ${scr.accentSoft}`,
    transform: 'translateY(-50%) rotate(45deg)',
  },
  nodeLeft: { right: 0 },
  nodeRight: { left: 0 },
  mid: { position: 'relative', flexShrink: 0, textAlign: 'center', paddingBottom: 9 },
  title: {
    color: scr.fg,
    fontSize: scrType.md,
    fontWeight: 600,
    lineHeight: 1.25,
    margin: 0,
    letterSpacing: '0.04em',
  },
  sub: { color: scr.fgSubtle, fontSize: scrType.xs, margin: 0, marginTop: 4 },
  underline: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 64,
    height: 2,
    transform: 'translateX(-50%)',
    backgroundColor: scr.accent,
    borderRadius: 1,
  },
})

import * as stylex from '@stylexjs/stylex'

export const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxSizing: 'border-box',
    width: 380,
    maxWidth: '100vw',
    height: '100%',
    maxHeight: '100vh',
    overflowY: 'auto',
    padding: 20,
    borderRadius: 0,
    zIndex: 50,
    // The drawer owns translate; only fade the surface. ui-sdk marks entry
    // with `data-starting-style` and exit with `data-ending-style`.
    '[data-starting-style]': { opacity: 0 },
    '[data-ending-style]': { opacity: 0 },
  },
})

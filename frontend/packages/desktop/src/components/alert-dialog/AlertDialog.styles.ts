import * as stylex from '@stylexjs/stylex'

/**
 * The alert dialog shares the dialog's trigger, surface and typography; only
 * its content is narrower and it has no dismiss-on-outside-press.
 */
export const styles = stylex.create({
  content: { maxWidth: 400 },
})

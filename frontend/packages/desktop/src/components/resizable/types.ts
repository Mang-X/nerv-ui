import type { ResizableSize } from '@ui-sdk/vue/resizable'

export type NvResizableOrientation = 'horizontal' | 'vertical'

export interface NvResizableProps {
  /** Whether the panes sit side by side or stacked. */
  orientation?: NvResizableOrientation
  /** Starting size of the first pane, in percent. */
  defaultSize?: number
  /** Smallest size of the first pane, in percent. */
  minSize?: number
  /** Largest size of the first pane, in percent. */
  maxSize?: number
  /** Lets the first pane collapse to `collapsedSize`. */
  collapsible?: boolean
  /** Size the first pane collapses to, like `0` or `"48px"`. */
  collapsedSize?: ResizableSize
  /** How far an arrow key moves the handle, in percent. */
  step?: number
  /** How far Shift plus an arrow key moves the handle, in percent. */
  largeStep?: number
  /** Accessible name for the resize handle. */
  label?: string
}

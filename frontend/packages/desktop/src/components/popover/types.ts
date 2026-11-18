export interface NvPopoverProps {
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean | 'trap-focus'
  openOnHover?: boolean
  delay?: number
  closeDelay?: number
  /**
   * 打开后把焦点放到哪里。默认 `auto` 会聚焦首个可聚焦元素（弹层里的按钮），
   * 于是「刚打开就出现聚焦环」。设 `'none'` 让焦点留在触发器上。
   */
  initialFocus?: 'auto' | 'content' | 'none' | string
}

export interface NvPopoverTriggerProps {
  disabled?: boolean
  focusableWhenDisabled?: boolean
}

export interface NvPopoverContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

/**
 * 下拉菜单的部件类型。
 *
 * 行为全部来自 `@ui-sdk/vue/menu`：打开/关闭、键盘导航、焦点归还、
 * 方向键与子菜单的鼠标悬停延时都由原语承担。这里只补视觉与命名。
 */

export interface NvDropdownMenuProps {
  /** 受控打开态（`v-model:open`）。不给就是自管理。 */
  open?: boolean
  defaultOpen?: boolean
  /** 模态菜单会锁住页面滚动与外部焦点。 */
  modal?: boolean
}

export interface NvDropdownMenuTriggerProps {
  disabled?: boolean
}

export interface NvDropdownMenuContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  /** 菜单最小宽度；内容过长时由原语自己滚动。 */
  minWidth?: number
}

export interface NvDropdownMenuItemProps {
  value?: string
  /** 屏幕阅读器与代理用的名字；内容不是纯文本时必填。 */
  label?: string
  disabled?: boolean
  /** 快捷键提示（仅展示，不绑定按键）。 */
  shortcut?: string
  /** 危险动作：文字用警示色。 */
  destructive?: boolean
}

export interface NvDropdownMenuCheckboxItemProps {
  /** 这一项在菜单里的值，原语据此标识勾选项。 */
  value: string
  /** 受控勾选态。 */
  checked?: boolean
  defaultChecked?: boolean
  label?: string
  disabled?: boolean
}

export interface NvDropdownMenuRadioItemProps {
  value: string
  label?: string
  disabled?: boolean
}

export interface NvDropdownMenuRadioGroupProps {
  value?: string
  defaultValue?: string
}

export interface NvDropdownMenuSubContentProps {
  minWidth?: number
}

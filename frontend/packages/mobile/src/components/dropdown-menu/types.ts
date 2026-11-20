export interface MobileDropdownOption {
  label: string
  value: string | number
}

export interface NvMobileDropdownMenuProps {
  /** 整条筛选栏的无障碍名称，例如「列表筛选」。 */
  label?: string
}

export interface NvMobileDropdownMenuItemProps {
  /** 没有任何选中值时的按钮文字。 */
  title: string
  options: MobileDropdownOption[]
  /** 受控选中值（`v-model`）。 */
  modelValue?: string | number
  /** 该项的无障碍名称；不给就用当前显示文字。 */
  label?: string
}

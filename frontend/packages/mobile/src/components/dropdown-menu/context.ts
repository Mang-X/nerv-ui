import type { InjectionKey, Ref } from 'vue'

/**
 * 筛选栏的共享状态：同时只有一项展开。展开态受控在栏上，
 * 而不是每个条目各存一份——从 A 点到 B 时必须先收起 A。
 */
export interface MobileDropdownMenuContext {
  openId: Ref<string | null>
  open: (id: string) => void
  close: () => void
}

export const dropdownMenuKey: InjectionKey<MobileDropdownMenuContext> = Symbol(
  'nv-mobile-dropdown-menu',
)

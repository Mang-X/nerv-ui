import { inject, type ComputedRef, type InjectionKey } from 'vue'

export interface NvSidebarContext {
  collapsed: ComputedRef<boolean>
  collapsible: ComputedRef<boolean>
  toggle: () => void
}

export const nvSidebarInjectionKey: InjectionKey<NvSidebarContext> = Symbol('nv-sidebar')

export function useNvSidebarContext(): NvSidebarContext | null {
  return inject(nvSidebarInjectionKey, null)
}

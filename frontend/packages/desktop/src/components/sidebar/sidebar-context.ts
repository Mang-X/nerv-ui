import { inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * 侧边栏把渲染要用的状态递给条目和页头。
 *
 * 收起态的**所有者**是 ui-sdk 原语（`sidebar-primitive.ts`）：折叠按钮的
 * `aria-expanded`、`data-collapsed`、给代理用的 `setCollapsed` 动作都由它写。
 * 这里只是把同一份状态翻成 Vue 的响应式值，供子树决定「文字显不显示、条目怎么排」——
 * 不承担切换逻辑，所以不在这里放 `toggle()`。
 */
export interface NvSidebarContext {
  collapsed: ComputedRef<boolean>
  collapsible: ComputedRef<boolean>
}

export const nvSidebarInjectionKey: InjectionKey<NvSidebarContext> = Symbol('nv-sidebar')

export function useNvSidebarContext(): NvSidebarContext | null {
  return inject(nvSidebarInjectionKey, null)
}

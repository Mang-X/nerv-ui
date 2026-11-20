import { createChange, createController, definePrimitive, type ChangeDetails } from '@ui-sdk/core'

/**
 * 侧边栏收起/展开的行为。
 *
 * ui-sdk 没有 sidebar 原语——收起态改变的不只是可见性（窄轨里图标仍然可点），
 * 所以不能套 `collapsible`：那会把它当成「面板被隐藏」，读屏会按 `aria-expanded`
 * 播报一个并不存在的面板。这里用 ui-sdk 的 `definePrimitive` 补一个，状态、动作
 * 和 `data-*` 都由内核写，代理桥也就看得见它。
 */
export type NvSidebarChangeReason = 'trigger-press' | 'imperative'

export interface NvSidebarOptions {
  /** 受控收起态。给了它就是受控模式，状态由外部持有。 */
  collapsed?: boolean
  /** 为 false 时不渲染折叠按钮，也拒绝任何收起动作。 */
  collapsible?: boolean
  /** 收起态变化时回调；受控模式下外部据此回写。 */
  onCollapsedChange?: (collapsed: boolean, details: ChangeDetails<string>) => void
  controller?: NvSidebarApi
  debug?: boolean
}

export interface NvSidebarState {
  collapsed: boolean
  collapsible: boolean
}

export interface NvSidebarApi {
  /** 直接设置收起态；返回是否真的变了。 */
  setCollapsed: (
    collapsed: boolean,
    cause?: { reason?: NvSidebarChangeReason; event?: Event },
  ) => boolean
  /** 在收起与展开之间切换。 */
  toggle: (cause?: { reason?: NvSidebarChangeReason; event?: Event }) => boolean
}

export function createSidebarController(): NvSidebarApi {
  return createController<NvSidebarApi>()
}

/**
 * @internal 实例类型里带着 ui-sdk 未公开导出的辅助类型（`SlotProps`），声明发射
 * 无法为它命名；对外只经 `NvSidebar*` 与 `createSidebarController` 暴露。
 */
export const sidebar = definePrimitive({
  name: 'sidebar',
  options: {
    collapsed: 'boolean',
    collapsible: 'boolean',
    onCollapsedChange: 'callback',
    controller: 'value',
  },
  controlled: ['collapsed'],
  state: (options: NvSidebarOptions): NvSidebarState => ({
    collapsed: options.collapsed ?? false,
    collapsible: options.collapsible ?? true,
  }),
  sync: (options: NvSidebarOptions): Partial<NvSidebarState> => ({
    ...(options.collapsed === undefined ? {} : { collapsed: options.collapsed }),
    collapsible: options.collapsible ?? true,
  }),
  api(context) {
    const change = createChange(context)
    const setCollapsed: NvSidebarApi['setCollapsed'] = (
      next,
      { reason = 'imperative', event } = {},
    ) => {
      const state = context.store.get()
      if (!state.collapsible || state.collapsed === next) return false
      return change('collapsed', next, { reason, event })
    }
    return {
      setCollapsed,
      toggle: (cause) => setCollapsed(!context.store.get().collapsed, cause),
    }
  },
  slots: (slot) => ({
    root: slot({
      state: (state) => ({ collapsed: state.collapsed, collapsible: state.collapsible }),
      attrs: (state) => ({
        'data-collapsed': state.collapsed ? '' : undefined,
        'data-collapsible': state.collapsible ? '' : undefined,
      }),
    }),
    trigger: slot({
      state: (state) => ({ collapsed: state.collapsed }),
      attrs: (state) => ({
        type: 'button',
        'aria-expanded': String(!state.collapsed),
        'data-collapsed': state.collapsed ? '' : undefined,
      }),
      press({ api }, event) {
        event?.preventDefault()
        api.toggle({ reason: 'trigger-press', event })
      },
    }),
  }),
  agent: { actions: ['setCollapsed'] },
})

import { createParts } from '@ui-sdk/vue'
import { sidebar } from './sidebar-primitive'

/**
 * 侧边栏的部件。`root` 保持 `<nav>`——它是导航地标，`aria-label` 从根落到这里；
 * `trigger` 是折叠按钮，`aria-expanded` 与键盘/指针处理由原语写。
 */
export const { Root: SidebarRoot, Trigger: SidebarTrigger } = createParts(sidebar, {
  root: 'nav',
  trigger: 'button',
})

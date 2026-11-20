// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  NvCard,
  NvCardHeader,
  NvCardAction,
  NvCardTitle,
  NvCardDescription,
  NvCardContent,
  NvCardFooter,
} from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/CardStructureExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('composes public card slots and acknowledges only the current page action', async () => {
  page = mount(Example)
  const card = page.getComponent(NvCard)
  const header = card.getComponent(NvCardHeader)
  expect(header.getComponent(NvCardTitle).text()).toBe('周末共读与手作交流安排')
  expect(header.getComponent(NvCardDescription).text()).toContain('一起阅读、交流与整理共享空间')
  expect(card.getComponent(NvCardContent).text()).toContain('请带上一本愿意分享的书')
  const footer = card.getComponent(NvCardFooter)
  expect(footer.get('[role="status"]').text()).toBe('尚未确认')
  await footer.get('button').trigger('click')
  expect(footer.get('[role="status"]').text()).toBe('已在本页确认阅读安排；刷新后不保留。')
})
it('renders the branded header action and keeps header and footer receipts independent', async () => {
  page = mount(Example)
  const header = page.getComponent(NvCardHeader)
  const action = header.getComponent(NvCardAction)
  expect(action.element.tagName).toBe('DIV')
  expect(action.attributes('data-slot')).toBe('nv-card-action')
  expect(action.attributes('aria-label')).toBeUndefined()
  const button = action.get('button')
  expect(button.text()).toBe('查看参与提示')
  expect(button.attributes('type')).toBe('button')
  const footer = page.getComponent(NvCardFooter)
  expect(page.getComponent(NvCardContent).get('[role="status"]').text()).toBe('尚未查看参与提示')
  await button.trigger('click')
  expect(page.getComponent(NvCardContent).get('[role="status"]').text()).toBe(
    '参与提示：按自己的节奏参与即可；仅在本页显示，刷新后不保留。',
  )
  expect(footer.get('[role="status"]').text()).toBe('尚未确认')
  await footer.get('button').trigger('click')
  expect(footer.get('[role="status"]').text()).toBe('已在本页确认阅读安排；刷新后不保留。')
  expect(page.getComponent(NvCardContent).get('[role="status"]').text()).toContain('参与提示：')
})

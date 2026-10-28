// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  NvCard,
  NvCardHeader,
  NvCardTitle,
  NvCardDescription,
  NvCardContent,
  NvCardFooter,
} from '@nerv-iip/ui'
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

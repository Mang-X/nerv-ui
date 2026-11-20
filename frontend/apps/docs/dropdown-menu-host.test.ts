// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { NvDropdownMenu } from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/DropdownSelectionExample.vue'
let page: VueWrapper
afterEach(() => {
  page?.unmount()
  document.body.innerHTML = ''
})
async function open() {
  page.getComponent(NvDropdownMenu).vm.$emit('update:open', true)
  await flushPromises()
}
function item(role: string, text: string) {
  const node = [...document.querySelectorAll<HTMLElement>(`[role="${role}"]`)].find((n) =>
    n.textContent?.includes(text),
  )
  expect(node, text).toBeTruthy()
  return node!
}
it('updates checkbox and exclusive radio through real public menu clicks and retains values on reopen', async () => {
  page = mount(Example, { attachTo: document.body })
  await open()
  expect(page.get('[role="status"]').text()).toContain('菜单：展开')
  item('menuitemcheckbox', '显示摘要').click()
  await flushPromises()
  expect(page.get('[role="status"]').text()).toContain('摘要：隐藏')
  await open()
  expect(item('menuitemcheckbox', '显示摘要').getAttribute('aria-checked')).toBe('false')
  item('menuitemradio', '按标题').click()
  await flushPromises()
  expect(page.get('[role="status"]').text()).toContain('排序：按标题')
  await open()
  expect(item('menuitemradio', '按标题').getAttribute('aria-checked')).toBe('true')
  expect(item('menuitemradio', '按时间').getAttribute('aria-checked')).toBe('false')
})
it('groups distinct actions semantically and reports only enabled submenu selections as safe page text', async () => {
  page = mount(Example, { attachTo: document.body })
  await open()
  expect(document.querySelector('[role="group"][aria-label="显示偏好"]')).toBeTruthy()
  expect(document.querySelector('[role="group"][aria-label="本页操作"]')).toBeTruthy()
  item('menuitem', '同步到云端').click()
  await flushPromises()
  expect(page.get('[role="status"]').text()).toContain('尚未选择位置')
  item('menuitem', '选择位置').click()
  await flushPromises()
  item('menuitem', '阅读清单').click()
  await flushPromises()
  expect(page.get('[role="status"]').text()).toContain('位置：阅读清单；仅本页有效')
  expect(page.get('[role="status"]').text()).toContain('菜单：收起')
})

// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/EntitySearchExample.vue'

let page: VueWrapper
afterEach(async () => {
  page?.unmount()
  await flushPromises()
  document.body.innerHTML = ''
})
async function open() {
  await page.get('#ep-paged-spaces').trigger('click')
  await flushPromises()
}
async function search(value: string) {
  const input = document.querySelector<HTMLInputElement>('input[role="combobox"]')!
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}
async function scrollToEnd() {
  const list = document.querySelector<HTMLElement>('[role="listbox"]')!
  // jsdom has no layout: these element-local metrics only exercise the public scroll event.
  Object.defineProperties(list, {
    clientHeight: { configurable: true, value: 288 },
    scrollHeight: { configurable: true, value: 416 },
  })
  list.scrollTop = 128
  list.dispatchEvent(new Event('scroll'))
  await flushPromises()
}
const choices = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]'))

it('searches the complete host catalog and preserves selected identities across queries', async () => {
  page = mount(Example, { attachTo: document.body })
  await open()
  expect(choices()).toHaveLength(8)
  await search('SPACE-017')
  expect(page.get('[role="status"]').text()).toContain('当前搜索：SPACE-017')
  expect(choices()).toHaveLength(1)
  expect(choices()[0].textContent).toContain('共享空间 17')
  choices()[0].click()
  await flushPromises()
  expect(page.get('[aria-label="可追加空间已选项"]').text()).toContain('SPACE-017')
  await open()
  await search('SPACE-018')
  expect(choices()).toHaveLength(1)
  choices()[0].click()
  await flushPromises()
  const selected = page.get('[aria-label="可追加空间已选项"]').text()
  expect(selected).toContain('SPACE-017')
  expect(selected).toContain('SPACE-018')
  await page.get('button[aria-label="清空已选"]').trigger('click')
  expect(page.find('[aria-label="可追加空间已选项"]').exists()).toBe(false)
})

it('appends current matching batches through scroll and stops at the catalog end', async () => {
  page = mount(Example, { attachTo: document.body })
  await open()
  await scrollToEnd()
  expect(choices()).toHaveLength(16)
  expect(choices()[0].textContent).toContain('SPACE-001')
  expect(choices()[15].textContent).toContain('SPACE-016')
  await scrollToEnd()
  expect(choices()).toHaveLength(24)
  expect(choices()[23].textContent).toContain('SPACE-024')
  expect(new Set(choices().map((choice) => choice.textContent)).size).toBe(24)
  await scrollToEnd()
  expect(choices()).toHaveLength(24)
  expect(page.get('[role="status"]').text()).toContain('本次已追加 2 批')
})

it('resets the matching window and append count when the host accepts another query', async () => {
  page = mount(Example, { attachTo: document.body })
  await open()
  await scrollToEnd()
  expect(choices()).toHaveLength(16)
  await search('不存在的空间')
  expect(choices()).toHaveLength(0)
  expect(document.body.textContent).toContain('无匹配实体')
  expect(page.get('[role="status"]').text()).toContain('本次已追加 0 批')
  await search('共享空间')
  expect(choices()).toHaveLength(8)
  await scrollToEnd()
  expect(choices()).toHaveLength(16)
  await search('')
  expect(choices()).toHaveLength(8)
  expect(page.get('[role="status"]').text()).toContain('当前搜索：（全部）')
  expect(page.get('[role="status"]').text()).toContain('本次已追加 0 批')
})

// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/EntityDialogExample.vue'

let page: VueWrapper
afterEach(async () => {
  page?.unmount()
  await flushPromises()
  document.body.innerHTML = ''
})
async function open() {
  expect(page.get('#ep-dialog-material').attributes('aria-haspopup')).toBe('dialog')
  await page.get('#ep-dialog-material').trigger('click')
  await flushPromises()
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
  expect(dialog).not.toBeNull()
  return dialog!
}
async function search(dialog: HTMLElement, value: string) {
  const input = dialog.querySelector<HTMLInputElement>('input[role="combobox"]')!
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}
it('opens the dialog and accepts the searched current material with clear recovery', async () => {
  page = mount(Example, { attachTo: document.body })
  expect(page.get('[role="status"]').text()).toBe('当前选择：（未选）')
  const dialog = await open()
  expect(dialog.textContent).toContain('对话框选择物料')
  await search(dialog, 'missing-code')
  expect(dialog.querySelectorAll('[role="option"]')).toHaveLength(0)
  expect(dialog.textContent).toContain('无匹配实体')
  await search(dialog, 'SKU-FG-200')
  expect(dialog.querySelectorAll('[role="option"]')).toHaveLength(1)
  dialog.querySelector<HTMLButtonElement>('[role="option"]')!.click()
  await flushPromises()
  expect(page.get('#ep-dialog-material').attributes('aria-expanded')).toBe('false')
  expect(page.get('[role="status"]').text()).toBe('当前选择：后减振器总成（SKU-FG-200）')
  const reopened = await open()
  expect(reopened.querySelector('[aria-selected="true"]')?.textContent).toContain('SKU-FG-200')
  reopened.querySelector<HTMLButtonElement>('button[aria-label="关闭"]')!.click()
  await flushPromises()
  await page.get('button[aria-label="清除对话框物料"]').trigger('click')
  expect(page.get('[role="status"]').text()).toBe('当前选择：（未选）')
  expect(page.get('#ep-dialog-material').text()).toContain('打开物料目录')
  expect(page.get('#ep-dialog-material').attributes('aria-expanded')).toBe('false')
})

it('keeps the accepted selection when a later search is closed without choosing', async () => {
  page = mount(Example, { attachTo: document.body })
  let dialog = await open()
  await search(dialog, '活塞杆')
  dialog.querySelector<HTMLButtonElement>('[role="option"]')!.click()
  await flushPromises()
  dialog = await open()
  await search(dialog, '弹簧')
  dialog.querySelector<HTMLButtonElement>('button[aria-label="关闭"]')!.click()
  await flushPromises()
  expect(page.get('[role="status"]').text()).toBe('当前选择：活塞杆毛坯（RM-200）')
  dialog = await open()
  expect(dialog.querySelectorAll('[role="option"]')).toHaveLength(4)
  expect(dialog.querySelector('[aria-selected="true"]')?.textContent).toContain('RM-200')
})

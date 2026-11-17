// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/EntityCreateExample.vue'

let page: VueWrapper
afterEach(async () => {
  page?.unmount()
  await flushPromises()
  document.body.innerHTML = ''
})
async function open() {
  await page.get('#ep-create-workshop').trigger('click')
  await flushPromises()
}
async function begin() {
  await open()
  const create = Array.from(document.querySelectorAll('button')).find(
    (button) => button.textContent?.trim() === '新增本地车间',
  )
  expect(create).toBeDefined()
  create!.click()
  await flushPromises()
  expect(page.get('#ep-create-workshop').attributes('aria-expanded')).toBe('false')
  expect(page.get('form[aria-label="新增本地车间"]').exists()).toBe(true)
}
async function confirm(name: string) {
  await page.get('#ep-create-name').setValue(name)
  await page.get('form').trigger('submit')
  await flushPromises()
}
it('accepts the public create request and appends a selectable controlled record', async () => {
  page = mount(Example, { attachTo: document.body })
  await begin()
  expect(page.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  await confirm('   ')
  expect(page.get('[role="status"]').text()).toBe('当前选择：（未选）')
  expect(page.find('form').exists()).toBe(true)
  await confirm('  周末画室  ')
  expect(page.find('form').exists()).toBe(false)
  expect(page.get('[role="status"]').text()).toBe('当前选择：周末画室（LOCAL-001）')
  await open()
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(3)
  expect(document.querySelector('[aria-selected="true"]')?.textContent).toContain('LOCAL-001')
})

it('cancels without changing the accepted record and resets the next draft', async () => {
  page = mount(Example, { attachTo: document.body })
  await open()
  document.querySelector<HTMLButtonElement>('[role="option"]')!.click()
  await flushPromises()
  await begin()
  await page.get('#ep-create-name').setValue('未确认的车间')
  const cancel = page.findAll('button').find((button) => button.text() === '取消新增')!
  await cancel.trigger('click')
  expect(page.get('[role="status"]').text()).toBe('当前选择：晨光工坊（WS-01）')
  await begin()
  expect((page.get('#ep-create-name').element as HTMLInputElement).value).toBe('')
  await confirm('雨后工坊')
  expect(page.get('[role="status"]').text()).toBe('当前选择：雨后工坊（LOCAL-001）')
  await open()
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(3)
})

it('keeps distinct created identities available after repeated creation and clear', async () => {
  page = mount(Example, { attachTo: document.body })
  await begin()
  await confirm('第一间工坊')
  await begin()
  await confirm('第二间工坊')
  expect(page.get('[role="status"]').text()).toBe('当前选择：第二间工坊（LOCAL-002）')
  await page.get('button[aria-label="清除本地车间"]').trigger('click')
  expect(page.get('[role="status"]').text()).toBe('当前选择：（未选）')
  await open()
  const choices = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="option"]'))
  expect(choices).toHaveLength(4)
  choices.find((choice) => choice.textContent?.includes('LOCAL-001'))!.click()
  await flushPromises()
  expect(page.get('[role="status"]').text()).toBe('当前选择：第一间工坊（LOCAL-001）')
})

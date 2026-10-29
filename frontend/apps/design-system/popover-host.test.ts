// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Example from './docs/.vitepress/examples/PopoverExample.vue'
let page: VueWrapper
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))
}
afterEach(() => {
  page?.unmount()
  document.body.innerHTML = ''
})
it('opens the public portal structure, closes and reopens, then returns focus on unit Escape', async () => {
  page = mount(Example, { attachTo: document.body })
  const trigger = page.get('button')
  trigger.element.focus()
  expect(trigger.attributes('aria-expanded')).toBe('false')
  await trigger.trigger('click')
  await settle()
  const content = () => document.querySelector<HTMLElement>('[data-slot="popover-content"]')
  expect(trigger.attributes('aria-expanded')).toBe('true')
  expect(page.element.contains(content())).toBe(false)
  expect(content()?.querySelector('[data-slot="popover-header"]')).not.toBeNull()
  expect(content()?.querySelector('[data-slot="popover-title"]')?.textContent).toBe(
    '留一点阅读时间',
  )
  expect(content()?.querySelector('[data-slot="popover-description"]')?.textContent).toContain(
    '选一本喜欢的书',
  )
  expect(content()?.getAttribute('aria-labelledby')).toBe(trigger.attributes('id'))
  content()!.querySelector('button')!.click()
  await settle()
  expect(content()).toBeNull()
  expect(page.get('[role="status"]').text()).toBe('已读完本页提示。')
  await trigger.trigger('click')
  await settle()
  expect(content()).not.toBeNull()
  // Synthetic keyboard dispatch is jsdom evidence, not real browser keyboard acceptance.
  document.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
  await settle()
  expect(content()).toBeNull()
  expect(trigger.attributes('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(trigger.element)
})

// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/BaseDatesExample.vue'
let host: VueWrapper
const settle = async () => {
  await flushPromises()
  await new Promise((r) => requestAnimationFrame(r))
}
const click = async (text: string) => {
  const button = [...document.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === text,
  )
  expect(button, text).toBeDefined()
  button!.click()
  await settle()
}
const day = async (slot: string, n: string) => {
  const el = [
    ...document.querySelectorAll<HTMLElement>(
      `[data-slot="${slot === 'range-calendar' ? 'range-calendar-trigger' : 'calendar-cell-trigger'}"]`,
    ),
  ].find((e) => e.textContent?.trim() === n && !e.hasAttribute('data-outside-view'))
  expect(el).toBeDefined()
  el!.click()
  await settle()
}
const popup = () => document.querySelector('[data-slot="popover-content"]')
afterEach(() => {
  host?.unmount()
  document.body.innerHTML = ''
})
it('selects single day through public calendar and clears with local feedback', async () => {
  host = mount(Example, { attachTo: document.body })
  await host.get('[data-single-picker] button').trigger('click')
  await settle()
  expect(document.querySelector('[data-slot="calendar"]')).not.toBeNull()
  await day('calendar', '19')
  expect(host.get('[data-single-value]').text()).toContain('2026-06-19')
  expect(host.get('[data-single-feedback]').text()).toContain('已采用：2026-06-19')
  expect(popup()).toBeNull()
  await host.get('[data-single-picker] button').trigger('click')
  await settle()
  await click('清除')
  expect(host.get('[data-single-value]').text()).toContain('未选择')
  expect(host.get('[data-single-feedback]').text()).toContain('已清除')
  expect(popup()).toBeNull()
})
it('selects range endpoints through public calendar and clears', async () => {
  host = mount(Example, { attachTo: document.body })
  await host.get('[data-range-picker] button').trigger('click')
  await settle()
  expect(document.querySelectorAll('[data-slot="range-calendar-grid"]')).toHaveLength(2)
  await day('range-calendar', '20')
  expect(host.get('[data-range-value]').text()).toContain('2026-06-20 → 待选终点')
  expect(host.get('[data-range-feedback]').text()).toBe('尚未采用')
  expect(popup()).not.toBeNull()
  await day('range-calendar', '23')
  expect(host.get('[data-range-value]').text()).toContain('2026-06-20 → 2026-06-23')
  expect(host.get('[data-range-feedback]').text()).toContain('已采用：2026-06-20 → 2026-06-23')
  expect(popup()).toBeNull()
  await host.get('[data-range-picker] button').trigger('click')
  await settle()
  await click('清除')
  expect(host.get('[data-range-value]').text()).toBe('未选择')
  expect(host.get('[data-range-feedback]').text()).toBe('已清除')
  expect(popup()).toBeNull()
})
it('disables both entrances and restores external values before real selection', async () => {
  host = mount(Example, { attachTo: document.body })
  await click('禁用日期入口')
  for (const label of ['single', 'range']) {
    const b = host.get(`[data-${label}-picker] button`)
    expect(b.attributes('disabled')).toBeDefined()
    ;(b.element as HTMLButtonElement).click()
    await settle()
    expect(popup()).toBeNull()
  }
  await click('外部替换')
  expect(host.get('[data-single-value]').text()).toBe('2026-07-08')
  expect(host.get('[data-range-value]').text()).toBe('2026-07-08 → 2026-07-12')
  await click('恢复初始安排')
  await click('启用日期入口')
  expect(host.get('[data-range-value]').text()).toBe('2026-06-10 → 2026-06-18')
  await host.get('[data-single-picker] button').trigger('click')
  await settle()
  await day('calendar', '21')
  expect(host.get('[data-single-value]').text()).toBe('2026-06-21')
})

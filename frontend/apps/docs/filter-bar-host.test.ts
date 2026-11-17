// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/FilterBarExample.vue'
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 5, 1))
})
let host: VueWrapper
const settle = async () => {
  await flushPromises()
  await new Promise((r) => requestAnimationFrame(r))
}
const click = async (text: string) => {
  const b = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)
  expect(b, text).toBeDefined()
  b!.click()
  await settle()
}
afterEach(() => {
  host?.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
})
it('adopts external values and removes each generated chip without clearing keyword or other fields', async () => {
  host = mount(Example, { attachTo: document.body })
  await click('采用六月共读安排')
  expect(host.get('[data-total]').text()).toBe('当前活动：1 场')
  expect(host.get('ul').text()).toContain('午后共读')
  for (const label of ['类别', '活动日期', '日期范围']) {
    await host.get(`button[aria-label="移除筛选 ${label}"]`).trigger('click')
    expect(host.find(`button[aria-label="移除筛选 ${label}"]`).exists()).toBe(false)
    expect((host.get('input').element as HTMLInputElement).value).toBe('共读')
  }
  expect(host.get('[data-total]').text()).toBe('当前活动：2 场')
  expect(host.get('[data-counts]').text()).toBe('筛选更新 3 次；重置 0 次')
  await click('重置')
  expect(host.get('[data-total]').text()).toBe('当前活动：3 场')
  expect(host.get('[data-counts]').text()).toBe('筛选更新 4 次；重置 1 次')
  expect(host.find('[aria-label^="移除筛选"]').exists()).toBe(false)
  expect(host.get('[data-receipt]').text()).toContain('关键词：无')
})
it('accepts keyword and select DOM events with empty results and external clear feedback', async () => {
  host = mount(Example, { attachTo: document.body })
  await host.get('input').setValue('不存在')
  expect(host.text()).toContain('没有符合条件的活动')
  expect(host.get('[data-receipt]').text()).toContain('关键词：不存在')
  await click('清空全部条件')
  expect(host.get('[data-action]').text()).toBe('已清空全部条件')
  await host.get('[role="combobox"]').trigger('keydown', { key: 'Enter' })
  await settle()
  const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (e) => e.textContent?.trim() === '交流',
  )
  expect(option).toBeDefined()
  option!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await settle()
  expect(host.get('ul').text()).toContain('书友交流')
  expect(host.get('[data-total]').text()).toBe('当前活动：1 场')
  expect(host.text()).toContain('类别:交流')
})
it('preserves field identity after reorder and adopts real date endpoints including partial range', async () => {
  host = mount(Example, { attachTo: document.body })
  await click('采用六月共读安排')
  await click('调整条件顺序')
  await host.get('[aria-label="移除筛选 日期范围"]').trigger('click')
  // Only Date is fixed; popover transitions and animation frames use real timers.
  const pick = async (index: number, day: string) => {
    await host.findAll('[data-slot="nv-date-picker"] button')[index].trigger('click')
    await settle()
    const cells = [...document.querySelectorAll<HTMLButtonElement>('.nv-dp-cell')]
    const chosen = cells.find(
      (b) => b.textContent?.trim() === day && !b.className.includes('text-muted-foreground/40'),
    )
    expect(chosen).toBeDefined()
    chosen!.click()
    await settle()
  }
  await pick(2, '10')
  expect(host.get('[data-receipt]').text()).toContain('2026-06-10')
  expect(host.get('ul').text()).toContain('湖畔共读')
  await pick(0, '10')
  expect(host.get('[data-receipt]').text()).toContain('不限终点')
  expect(host.get('[aria-label="移除筛选 日期范围"]').exists()).toBe(true)
  await pick(1, '20')
  expect(host.get('[data-receipt]').text()).toContain('2026-06-10 至 2026-06-20')
  expect(host.get('ul').text()).toBe('湖畔共读 · 2026-06-10')
  expect(host.get('[aria-label="移除筛选 活动日期"]').exists()).toBe(true)
  await click('清空全部条件')
  expect(host.find('[aria-label^="移除筛选"]').exists()).toBe(false)
  expect(host.get('[data-total]').text()).toBe('当前活动：3 场')
})

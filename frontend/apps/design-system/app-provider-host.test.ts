// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { NvApp, Tooltip, TooltipTrigger, TooltipContent, Toaster, toast } from '@nerv-iip/ui'
import Example from './docs/.vitepress/examples/AppProviderExample.vue'
let page: VueWrapper | undefined
afterEach(() => {
  page?.unmount()
  vi.restoreAllMocks()
})
it('uses one public app outlet and switches default and explicit tooltip delay', async () => {
  page = mount(Example)
  expect(page.getComponent(NvApp).props('tooltipDelay')).toBe(200)
  expect(page.findAllComponents(Toaster)).toHaveLength(1)
  const tooltip = page.getComponent(Tooltip)
  expect(tooltip.getComponent(TooltipTrigger).text()).toBe('阅读提示')
  expect(tooltip.findComponent(TooltipContent).exists()).toBe(true)
  await page.get('select').setValue('800')
  expect(page.getComponent(NvApp).props('tooltipDelay')).toBe(800)
  await page.get('select').setValue('200')
  expect(page.getComponent(NvApp).props('tooltipDelay')).toBe(200)
})
it('uses the real notification identity for first close repeat update and unmount without dismissing another owner', async () => {
  const baseline = new Set(toast.getToasts().map((item) => item.id))
  const otherId = toast('另一处的通知')
  const own = () =>
    toast.getToasts().filter((item) => !baseline.has(item.id) && item.id !== otherId)
  try {
    page = mount(Example)
    expect(page.get('[role="status"]').text()).toBe('尚未确认阅读安排。')
    await page.get('[data-action="notify"]').trigger('click')
    expect(page.get('[role="status"]').text()).toBe('已在本页确认阅读安排；刷新后不保留。')
    expect(own()).toHaveLength(1)
    const ownId = own()[0]!.id
    await page.get('[data-action="close"]').trigger('click')
    expect(own()).toHaveLength(0)
    expect(toast.getToasts().some((item) => item.id === otherId)).toBe(true)
    await page.get('[data-action="notify"]').trigger('click')
    await page.get('[data-action="notify"]').trigger('click')
    expect(own().map((item) => item.id)).toEqual([ownId])
    page.unmount()
    page = undefined
    expect(own()).toHaveLength(0)
    expect(toast.getToasts().some((item) => item.id === otherId)).toBe(true)
  } finally {
    for (const item of toast.getToasts()) if (!baseline.has(item.id)) toast.dismiss(item.id)
  }
})

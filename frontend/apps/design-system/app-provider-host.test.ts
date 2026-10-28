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
it('acknowledges locally and dismisses only its own notification on close and unmount', async () => {
  const dismiss = vi.spyOn(toast, 'dismiss')
  page = mount(Example)
  expect(page.get('[role="status"]').text()).toBe('尚未确认阅读安排。')
  await page.get('[data-action="notify"]').trigger('click')
  expect(page.get('[role="status"]').text()).toBe('已在本页确认阅读安排；刷新后不保留。')
  await page.get('[data-action="close"]').trigger('click')
  const ownId = dismiss.mock.calls[0]?.[0]
  expect(ownId).toBeDefined()
  await page.get('[data-action="notify"]').trigger('click')
  page.unmount()
  page = undefined
  expect(dismiss.mock.calls.length).toBeGreaterThanOrEqual(2)
  expect(dismiss.mock.calls.every(([id]) => id === ownId)).toBe(true)
})

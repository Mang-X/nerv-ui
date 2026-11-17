// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/BaseTabsExample.vue'
let host: VueWrapper
afterEach(() => host?.unmount())
it('links controlled selection to its panel and refuses disabled pointer activation', async () => {
  host = mount(Example)
  const tabs = host.findAll('[role="tab"]')
  await tabs[1]!.trigger('mousedown', { button: 0, ctrlKey: false })
  expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  const panel = host.get('[role="tabpanel"][data-state="active"]')
  expect(panel.text()).toContain('窗边阅读')
  expect(panel.attributes('id')).toBe(tabs[1]!.attributes('aria-controls'))
  expect(panel.attributes('aria-labelledby')).toBe(tabs[1]!.attributes('id'))
  expect(tabs[2]!.attributes('disabled')).toBeDefined()
  await tabs[2]!.trigger('mousedown', { button: 0, ctrlKey: false })
  expect(tabs[2]!.attributes('aria-selected')).toBe('false')
  expect(host.get('[role="status"]').text()).toContain('窗边阅读')
})
it('retains panel across external variant and direction changes with automatic focus', async () => {
  host = mount(Example)
  const button = (text: string) => host.findAll('button').find((b) => b.text() === text)!
  await host.findAll('[role="tab"]')[1]!.trigger('focus')
  for (const [label, direction, variant] of [
    ['线条', 'horizontal', 'line'],
    ['纵向', 'vertical', 'line'],
    ['默认', 'vertical', 'default'],
    ['横向', 'horizontal', 'default'],
  ]) {
    await button(label!).trigger('click')
    expect(button(label!).attributes('aria-pressed')).toBe('true')
    expect(host.get('[role="tabpanel"][data-state="active"]').text()).toContain('窗边阅读')
    expect(host.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    expect(host.get('[role="tablist"]').attributes('aria-orientation')).toBe(direction)
    expect(host.get('[role="tablist"]').attributes('data-variant')).toBe(variant)
  }
})

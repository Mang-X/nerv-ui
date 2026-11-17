// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/AlertDialogMediaExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
for (const [index, prefix] of [
  [0, 'nv-alert-dialog'],
  [1, 'alert-dialog'],
] as const) {
  it(`renders ${prefix} media and all structure with linked modal text and synchronous receipt`, async () => {
    page = mount(Example, { attachTo: document.body })
    const buttons = page.findAll('button')
    await buttons[index].trigger('click')
    await flushPromises()
    const modal = document.querySelector('[role="alertdialog"]')!
    expect(modal).not.toBeNull()
    for (const part of [
      'content',
      'header',
      'media',
      'title',
      'description',
      'footer',
      'action',
      'cancel',
    ])
      expect(document.querySelector(`[data-slot="${prefix}-${part}"]`)).not.toBeNull()
    expect(document.getElementById(modal.getAttribute('aria-labelledby')!)?.textContent).toContain(
      '共读安排',
    )
    expect(document.getElementById(modal.getAttribute('aria-describedby')!)?.textContent).toContain(
      '刷新',
    )
    expect(modal.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    ;(modal.querySelector(`[data-slot="${prefix}-cancel"]`) as HTMLElement).click()
    await flushPromises()
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    expect(page.findAll('[role="status"]')[index].text()).toBe('尚未确认')
    await buttons[index].trigger('click')
    await flushPromises()
    ;(document.querySelector(`[data-slot="${prefix}-action"]`) as HTMLElement).click()
    await flushPromises()
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    expect(page.findAll('[role="status"]')[index].text()).toBe(
      '已在本页确认共读安排；刷新后不保留。',
    )
    expect(page.findAll('[role="status"]')[1 - index].text()).toBe('尚未确认')
  })
}

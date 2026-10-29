// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Example from './docs/.vitepress/examples/BaseDialogExample.vue'
let page: VueWrapper
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))
}
afterEach(() => {
  page?.unmount()
  document.body.innerHTML = ''
})
for (const mode of ['fixed', 'scroll']) {
  it(`AC ${mode}: inner attrs, title description nodes, close reopen and synthetic Escape focus`, async () => {
    page = mount(Example, { attachTo: document.body })
    const trigger = page.get(`[data-open="${mode}"]`)
    trigger.element.focus()
    await trigger.trigger('click')
    await settle()
    const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!
    const content = dialog()
    expect(content.id).toBe(`base-dialog-${mode}`)
    expect(content.dataset.reading).toBe(mode)
    const title = document.getElementById(content.getAttribute('aria-labelledby')!)!
    const description = document.getElementById(content.getAttribute('aria-describedby')!)!
    expect(title.tagName).toBe(mode === 'fixed' ? 'H3' : 'H2')
    expect(description.tagName).toBe(mode === 'fixed' ? 'DIV' : 'P')
    expect(description.querySelector('a')?.getAttribute('href')).toBe('#基础-dialog固定与滚动内容')
    const footer = content.querySelector('[data-slot="dialog-footer"]')!
    expect(footer.textContent).toContain('Close')
    if (mode === 'fixed') {
      expect(document.querySelectorAll('[data-slot="dialog-overlay"]')).toHaveLength(1)
      expect(content.querySelector('[data-slot="dialog-close"]')).toBeNull()
    } else {
      expect(content.parentElement?.contains(content)).toBe(true)
      expect(content.querySelectorAll('article p')).toHaveLength(24)
      expect(content.querySelector('article p:last-child')?.textContent).toContain('阅读到这里')
      expect(
        content.querySelector('article')!.compareDocumentPosition(footer) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
    ;(footer.querySelector('button') as HTMLElement).click()
    await settle()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    await trigger.trigger('click')
    await settle()
    expect(dialog()).not.toBeNull()
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await settle()
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
  })
}

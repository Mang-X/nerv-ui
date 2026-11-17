// @vitest-environment jsdom
import { execFileSync } from 'node:child_process'
import { fileURLToPath, URL as NodeURL } from 'node:url'
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
    const href = description.querySelector('a')!.getAttribute('href')!
    // Compile real page headings in Node: VitePress/esbuild cannot initialize in jsdom's typed-array realm.
    const headingsHtml = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
      import { createMarkdownRenderer } from 'vitepress';
      import { readFileSync } from 'node:fs';
      const md = await createMarkdownRenderer(process.argv[1]);
      const headings = readFileSync(process.argv[2], 'utf8').split('\\n').filter((line) => /^#{1,6} /.test(line)).join('\\n');
      process.stdout.write(md.render(headings));
    `,
        fileURLToPath(new NodeURL('./docs', import.meta.url)),
        fileURLToPath(new NodeURL('./docs/components/desktop/dialog.md', import.meta.url)),
      ],
      { cwd: fileURLToPath(new NodeURL('.', import.meta.url)), encoding: 'utf8' },
    )
    const rendered = document.createElement('div')
    rendered.innerHTML = headingsHtml
    expect([...rendered.querySelectorAll('[id]')].map((node) => node.id)).toContain(
      decodeURIComponent(href.slice(1)),
    )
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

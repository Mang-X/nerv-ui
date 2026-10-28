import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import Demo from './PrintableDetailDemo.vue'
const pages: ReturnType<typeof mount>[] = []
async function open() {
  const p = mount(Demo, { attachTo: document.body })
  pages.push(p)
  await p.get('[data-open="0"]').trigger('click')
  return p
}
const printClick = () => (document.querySelector('[data-print]') as HTMLButtonElement).click()
afterEach(() => {
  pages.forEach((p) => p.unmount())
  pages.length = 0
  vi.restoreAllMocks()
  vi.useRealTimers()
})
it('prints current record without actions and cleans afterprint', async () => {
  await open()
  const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
  printClick()
  await nextTick()
  expect(spy).toHaveBeenCalledOnce()
  const target = document.querySelector('[data-detail-print-active]')!
  expect(target.textContent).toContain('阅读摘记')
  expect(target.querySelector('button')).toBeNull()
  window.dispatchEvent(new Event('afterprint'))
  await nextTick()
  expect(document.querySelector('[data-detail-print-active]')).toBeNull()
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(false)
})
it('close and replacement cancel pending requests without revival', async () => {
  const p = await open()
  const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
  printClick()
  ;(document.querySelector('[data-close]') as HTMLButtonElement).click()
  await nextTick()
  expect(spy).not.toHaveBeenCalled()
  await p.get('[data-open="0"]').trigger('click')
  printClick()
  await p.get('[data-open="1"]').trigger('click')
  expect(spy).not.toHaveBeenCalled()
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(false)
})
it('throw releases ownership with retryable error', async () => {
  await open()
  vi.spyOn(window, 'print').mockImplementation(() => {
    throw Error('blocked')
  })
  printClick()
  await nextTick()
  await nextTick()
  expect(document.querySelector('[role="alert"]')?.textContent).toContain('打印未打开')
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(false)
})
it('duplicates and nonowner unmount preserve owner isolation', async () => {
  const a = await open()
  const b = await open()
  const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
  printClick()
  printClick()
  await nextTick()
  expect(spy).toHaveBeenCalledOnce()
  b.unmount()
  pages.splice(pages.indexOf(b), 1)
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(true)
  a.unmount()
  pages.length = 0
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(false)
})
it('focus cancellation and timeout clean returned requests', async () => {
  vi.useFakeTimers()
  await open()
  vi.spyOn(window, 'print').mockImplementation(() => {})
  printClick()
  await nextTick()
  window.dispatchEvent(new Event('focus'))
  await vi.advanceTimersByTimeAsync(500)
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(false)
  printClick()
  await nextTick()
  await vi.advanceTimersByTimeAsync(300000)
  expect(document.body.hasAttribute('data-detail-print-owner')).toBe(false)
})

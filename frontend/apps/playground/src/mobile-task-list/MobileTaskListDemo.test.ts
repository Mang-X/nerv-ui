import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Demo from './MobileTaskListDemo.vue'
const clean: (() => void)[] = []
afterEach(() => {
  clean.splice(0).forEach((fn) => fn())
  vi.clearAllTimers()
  vi.useRealTimers()
})
describe('two neutral mobile hosts (jsdom fake clock)', () => {
  it.each(['library', 'studio'])(
    '%s exposes usable filters, paging, safe errors and navigation',
    async (source) => {
      vi.useFakeTimers()
      const w = mount(Demo, { props: { source } })
      clean.push(() => w.unmount())
      await vi.advanceTimersByTimeAsync(300)
      await flushPromises()
      expect(w.findAll('li')).toHaveLength(8)
      expect(
        w
          .get('nav')
          .findAll('a')
          .map((a) => a.attributes('href')),
      ).toEqual(['#mobile-task-list/library', '#mobile-task-list/studio', '#'])
      await w
        .findAll('button')
        .find((b) => b.text() === '让下次加载暂缓')!
        .trigger('click')
      await w
        .findAll('button')
        .find((b) => b.text() === '加载更多')!
        .trigger('click')
      await vi.advanceTimersByTimeAsync(300)
      await flushPromises()
      expect(w.get('[role="alert"]').text()).toContain('原内容已保留')
      expect(w.text()).not.toContain('demo temporarily unavailable')
      expect(w.findAll('li')).toHaveLength(8)
      await w.get('[data-testid="retry-list"]').trigger('click')
      await vi.advanceTimersByTimeAsync(300)
      await flushPromises()
      expect(w.findAll('li')).toHaveLength(16)
      await w.get('select').setValue('saved')
      await vi.advanceTimersByTimeAsync(300)
      await flushPromises()
      expect(w.findAll('li')).toHaveLength(8)
      expect(w.text()).toContain('没有更多了')
      w.unmount()
      expect(vi.getTimerCount()).toBe(0)
    },
  )
})

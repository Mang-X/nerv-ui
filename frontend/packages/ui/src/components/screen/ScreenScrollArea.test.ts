import { mount, flushPromises } from '@vue/test-utils'
import { h, nextTick, shallowRef } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import ScreenScrollArea from './ScreenScrollArea.vue'

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('tracks replaced viewport content and subsequent resize and scroll hints then disconnects on unmount', async () => {
  const observers: {
    callback: ResizeObserverCallback
    targets: Set<Element>
    disconnected: boolean
  }[] = []
  vi.stubGlobal(
    'ResizeObserver',
    class {
      record: (typeof observers)[number]
      constructor(callback: ResizeObserverCallback) {
        this.record = { callback, targets: new Set(), disconnected: false }
        observers.push(this.record)
      }
      observe(element: Element) {
        this.record.targets.add(element)
      }
      unobserve(element: Element) {
        this.record.targets.delete(element)
      }
      disconnect() {
        this.record.targets.clear()
        this.record.disconnected = true
      }
    },
  )
  let height = 100
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200)
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('nv-scr-sa-vp') ? height : 0
    },
  )
  const rows = shallowRef(['书房'])
  const wrapper = mount(ScreenScrollArea, {
    props: { type: 'always' },
    slots: {
      default: () =>
        h(
          'ul',
          { key: rows.value.length },
          rows.value.map((row) => h('li', row)),
        ),
    },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await flushPromises()
  const viewport = wrapper.get('.nv-scr-sa-vp').element as HTMLElement
  const up = () => wrapper.get('.nv-scr-sa-hint.up').isVisible()
  const down = () => wrapper.get('.nv-scr-sa-hint.down').isVisible()
  expect(up()).toBe(false)
  expect(down()).toBe(false)
  height = 600
  rows.value = ['书房', '展厅', '河岸']
  await flushPromises()
  expect(down()).toBe(true)
  viewport.scrollTop = 180
  await wrapper.get('.nv-scr-sa-vp').trigger('scroll')
  expect(up()).toBe(true)
  viewport.scrollTop = 400
  await wrapper.get('.nv-scr-sa-vp').trigger('scroll')
  expect(down()).toBe(false)
  // System DOM boundary: Reka may replace its measured content node.
  const oldContent = viewport.firstElementChild!
  const replacement = document.createElement('div')
  replacement.textContent = '新的内容层'
  viewport.replaceChildren(replacement)
  height = 800
  await flushPromises()
  const owner = observers.find((record) => record.targets.has(viewport))!
  expect(owner.targets.has(oldContent)).toBe(false)
  expect(owner.targets.has(replacement)).toBe(true)
  expect(down()).toBe(true)
  height = 100
  viewport.scrollTop = 0
  owner.callback([], {} as ResizeObserver)
  await nextTick()
  expect(up()).toBe(false)
  expect(down()).toBe(false)
  wrapper.unmount()
  wrappers.pop()
  expect(owner.disconnected).toBe(true)
  viewport.dispatchEvent(new Event('scroll'))
  expect(owner.targets.size).toBe(0)
})

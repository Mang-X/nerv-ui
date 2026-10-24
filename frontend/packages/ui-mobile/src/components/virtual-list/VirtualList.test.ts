import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import VirtualList from './VirtualList.vue'
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('updates its finite rendered window when the actual viewport resizes and disconnects on unmount', async () => {
  let height = 240
  let resize: () => void = () => {}
  const disconnect = vi.fn()
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => height)
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback
      }
      observe() {}
      disconnect = disconnect
    },
  )
  const wrapper = mount(VirtualList, {
    props: {
      items: Array.from({ length: 1000 }, (_, i) => `letter-${i + 1}`),
      itemHeight: 48,
      buffer: 2,
    },
    slots: {
      default: ({ item, index }: { item: unknown; index: number }) =>
        h('p', { 'data-row': '' }, `${index}:${item}`),
    },
  })
  await nextTick()
  expect(wrapper.findAll('[data-row]')).toHaveLength(9)
  height = 480
  resize()
  await nextTick()
  expect(wrapper.findAll('[data-row]')).toHaveLength(14)
  expect(wrapper.get('[data-row]').text()).toBe('0:letter-1')
  wrapper.unmount()
  expect(disconnect).toHaveBeenCalledOnce()
})

it('renders actual item identities in the scrolled window, updates reordered data and handles empty input', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(240)
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: `letter-${i + 1}` }))
  const wrapper = mount(VirtualList, {
    props: { items, itemHeight: 48, buffer: 2 },
    slots: {
      default: ({ item, index }: { item: unknown; index: number }) =>
        h('p', { 'data-row': '' }, `${index}:${(item as { id: string }).id}`),
    },
  })
  await nextTick()
  ;(wrapper.element as HTMLElement).scrollTop = 4800
  await wrapper.trigger('scroll')
  expect(wrapper.findAll('[data-row]')).toHaveLength(9)
  expect(wrapper.get('[data-row]').text()).toBe('98:letter-99')
  await wrapper.setProps({ items: [...items].reverse() })
  expect(wrapper.get('[data-row]').text()).toBe('98:letter-902')
  ;(wrapper.element as HTMLElement).scrollTop = 47760
  await wrapper.trigger('scroll')
  expect(wrapper.findAll('[data-row]').at(-1)?.text()).toBe('999:letter-1')
  expect(wrapper.findAll('[data-row]')).toHaveLength(7)
  await wrapper.setProps({ items: [] })
  expect(wrapper.findAll('[data-row]')).toHaveLength(0)
  wrapper.unmount()
})

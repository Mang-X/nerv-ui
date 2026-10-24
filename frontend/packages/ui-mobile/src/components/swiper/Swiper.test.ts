import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import Swiper from './Swiper.vue'
import SwiperItem from './SwiperItem.vue'
import { h } from 'vue'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})
it('moves the rendered track when the host changes the controlled index without emitting a user change', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  const wrapper = mount(Swiper, {
    props: { index: 0 },
    slots: { default: () => ['湖畔', '小径', '庭院'].map((text) => h(SwiperItem, {}, () => text)) },
  })
  expect(wrapper.findAll('[data-slot="swiper-item"]').map((item) => item.text())).toEqual([
    '湖畔',
    '小径',
    '庭院',
  ])
  expect(wrapper.get('.nv-m-swiper-track').attributes('style')).toContain('translate3d(0px')
  await wrapper.setProps({ index: 2 })
  expect(wrapper.get('.nv-m-swiper-track').attributes('style')).toContain('translate3d(-600px')
  expect(wrapper.emitted('change')).toBeUndefined()
  wrapper.unmount()
})

it('emits controlled page changes for horizontal swipes, clamps the ends and loops only when enabled', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  const wrapper = mount(Swiper, {
    props: { index: 0, items: ['A', 'B', 'C'] },
  })
  async function drag(dx: number, dy = 0) {
    const track = wrapper.get('.nv-m-swiper-track')
    track.element.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 150, clientY: 20, buttons: 1 }),
    )
    track.element.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 150 + dx, clientY: 20 + dy, buttons: 1 }),
    )
    await track.trigger('pointerup')
  }
  await drag(-150)
  expect(wrapper.emitted('update:index')?.at(-1)).toEqual([1])
  expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
  await wrapper.setProps({ index: 2 })
  await drag(-150)
  expect(wrapper.emitted('change')?.at(-1)).toEqual([2])
  await wrapper.setProps({ loop: true })
  await drag(-150)
  expect(wrapper.emitted('change')?.at(-1)).toEqual([0])
  await wrapper.setProps({ index: 0 })
  await drag(150)
  expect(wrapper.emitted('change')?.at(-1)).toEqual([2])
  const count = wrapper.emitted('change')?.length
  await drag(5, 150)
  expect(wrapper.emitted('change')).toHaveLength(count!)
  wrapper.unmount()
})

it('advances autoplay, stops it at zero and clears the timer on unmount', async () => {
  vi.useFakeTimers()
  const wrapper = mount(Swiper, { props: { items: ['A', 'B'], autoplay: 1000, loop: true } })
  await vi.advanceTimersByTimeAsync(1000)
  expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
  await wrapper.setProps({ autoplay: 0 })
  await vi.advanceTimersByTimeAsync(3000)
  expect(wrapper.emitted('change')).toHaveLength(1)
  await wrapper.setProps({ autoplay: 1000 })
  expect(vi.getTimerCount()).toBe(1)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
  vi.useRealTimers()
})

it.each([
  { label: 'empty', items: [] },
  { label: 'singleton', items: ['only'] },
])('keeps $label slides still without autoplay timers', ({ items }) => {
  vi.useFakeTimers()
  const wrapper = mount(Swiper, { props: { items, autoplay: 1000 } })
  expect(wrapper.findAll('.nv-m-swiper-item')).toHaveLength(items.length)
  expect(wrapper.findAll('.nv-m-swiper-dot')).toHaveLength(0)
  expect(vi.getTimerCount()).toBe(0)
  wrapper.unmount()
  vi.useRealTimers()
})

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import Swiper from './baseline/components/swiper/Swiper.vue'

it.each([
  { name: 'external-forward', initial: 0, target: 1, start: 150, end: 130 },
  { name: 'external-backward', initial: 2, target: 1, start: 130, end: 150 },
])('keeps the externally chosen page after a short drag - $name', async ({ initial, target, start, end }) => {
  const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  const wrapper = mount(Swiper, { props: { items: ['a','b','c'], index: initial }, slots: { default: '<p>letter</p>' } })
  try {
    await nextTick()
    const track = wrapper.get('.nv-m-swiper-track')
    track.element.dispatchEvent(new MouseEvent('pointerdown', { clientX: start, clientY: 10, buttons: 1 }))
    track.element.dispatchEvent(new MouseEvent('pointermove', { clientX: end, clientY: 10, buttons: 1 }))
    await nextTick()
    await wrapper.setProps({ index: target })
    track.element.dispatchEvent(new MouseEvent('pointerup', { clientX: end, clientY: 10, buttons: 0 }))
    await nextTick()
    expect(wrapper.emitted('update:index')).toBeUndefined()
    expect(wrapper.emitted('change')).toEqual([[target]])
    expect(track.attributes('style')).toContain('translate3d(-300px, 0, 0)')
  } finally { wrapper.unmount(); width.mockRestore() }
})

import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import SwipeCell from './SwipeCell.vue'
afterEach(() => vi.restoreAllMocks())
it('opens left, closes right and emits the selected stable action value once before closing', async () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(152)
  const wrapper = mount(SwipeCell, {
    props: {
      actions: [
        { label: '书签', value: 'bookmark' },
        { label: '收起', value: 'archive', tone: 'danger' },
      ],
    },
    slots: { default: '来信' },
  })
  const content = wrapper.get('.nv-m-swipe-content')
  async function drag(dx: number, dy = 0, cancel = false) {
    content.element.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 200, clientY: 20, buttons: 1 }),
    )
    content.element.dispatchEvent(
      new MouseEvent('pointermove', {
        clientX: 200 + dx,
        clientY: 20 + dy,
        buttons: 1,
        cancelable: true,
      }),
    )
    await content.trigger(cancel ? 'pointercancel' : 'pointerup')
  }
  await drag(-120)
  expect(content.attributes('style')).toContain('translateX(-152px)')
  expect(wrapper.get('.nv-m-swipe-actions').attributes('style')).toContain('opacity: 1')
  await drag(120)
  expect(content.attributes('style')).toContain('translateX(0px)')
  await drag(-120)
  await wrapper.findAll('button')[1]!.trigger('click')
  expect(wrapper.emitted('select')).toEqual([['archive']])
  expect(content.attributes('style')).toContain('translateX(0px)')
  await drag(-2, 120)
  expect(content.attributes('style')).toContain('translateX(0px)')
  await drag(-20, 0, true)
  expect(content.attributes('style')).toContain('translateX(0px)')
  expect(wrapper.emitted('select')).toHaveLength(1)
  wrapper.unmount()
})

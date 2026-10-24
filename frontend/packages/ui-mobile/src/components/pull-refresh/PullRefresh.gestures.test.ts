import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { nextTick } from 'vue'
import PullRefresh from './PullRefresh.vue'

it('cancels a pull beyond the threshold without requesting refresh', async () => {
  const wrapper = mount(PullRefresh)
  const area = wrapper.get('.nv-m-pr-inner')
  area.element.dispatchEvent(
    new MouseEvent('pointerdown', { clientY: 10, buttons: 1, bubbles: true }),
  )
  await nextTick()
  area.element.dispatchEvent(
    new MouseEvent('pointermove', { clientY: 260, buttons: 1, bubbles: true }),
  )
  await nextTick()
  expect(wrapper.text()).toContain('释放立即刷新')
  await area.trigger('pointercancel')
  expect(wrapper.emitted('refresh')).toBeUndefined()
  expect(wrapper.get('.nv-m-pr-inner').attributes('style')).toContain('translateY(0px)')
  wrapper.unmount()
})

it('does not start a refresh when a gesture began below the scroll top', async () => {
  const wrapper = mount(PullRefresh)
  const scroller = wrapper.get<HTMLElement>('.nv-m-pr-scroll').element
  const area = wrapper.get('.nv-m-pr-inner').element
  scroller.scrollTop = 120
  area.dispatchEvent(new MouseEvent('pointerdown', { clientY: 10, buttons: 1 }))
  scroller.scrollTop = 0
  area.dispatchEvent(new MouseEvent('pointermove', { clientY: 260, buttons: 1 }))
  area.dispatchEvent(new MouseEvent('pointerup'))
  await nextTick()
  expect(wrapper.emitted('refresh')).toBeUndefined()
  expect(wrapper.get('.nv-m-pr-inner').attributes('style')).toContain('translateY(0px)')
  wrapper.unmount()
})

it('refreshes only beyond the threshold and holds until the controlled loading value clears', async () => {
  const wrapper = mount(PullRefresh)
  const area = wrapper.get('.nv-m-pr-inner')
  async function drag(dy: number) {
    area.element.dispatchEvent(new MouseEvent('pointerdown', { clientY: 10, buttons: 1 }))
    area.element.dispatchEvent(new MouseEvent('pointermove', { clientY: 10 + dy, buttons: 1 }))
    await area.trigger('pointerup')
  }
  await drag(40)
  expect(wrapper.emitted('refresh')).toBeUndefined()
  expect(area.attributes('style')).toContain('translateY(0px)')
  await drag(250)
  expect(wrapper.emitted('refresh')).toEqual([[]])
  expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  await wrapper.setProps({ modelValue: true })
  expect(wrapper.text()).toContain('刷新中')
  expect(area.attributes('style')).toContain('translateY(56px)')
  await drag(250)
  expect(wrapper.emitted('refresh')).toHaveLength(1)
  await wrapper.setProps({ modelValue: false })
  expect(area.attributes('style')).toContain('translateY(0px)')
  expect(wrapper.text()).toContain('下拉刷新')
  wrapper.unmount()
})

it('keeps downward touch pulls at the top and restores native vertical panning below it', async () => {
  const wrapper = mount(PullRefresh)
  const scroller = wrapper.get<HTMLElement>('.nv-m-pr-scroll')
  await nextTick()
  await nextTick()
  expect(scroller.attributes('style')).toContain('touch-action: pan-x pan-down')
  scroller.element.scrollTop = 100
  await scroller.trigger('scroll')
  expect(scroller.attributes('style')).toContain('touch-action: pan-y')
  expect(wrapper.emitted('scroll')?.at(-1)).toEqual([100])
  scroller.element.scrollTop = 0
  await scroller.trigger('scroll')
  expect(scroller.attributes('style')).toContain('touch-action: pan-x pan-down')
  wrapper.unmount()
})

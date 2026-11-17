import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it } from 'vitest'
import PullRefresh from './baseline/components/pull-refresh/PullRefresh.vue'

function pointer(el: Element, type: string, y: number) {
  el.dispatchEvent(new MouseEvent(type, { clientX: 30, clientY: y, buttons: type === 'pointerup' ? 0 : 1, bubbles: true }))
}

it('does not emit another refresh when the host starts loading during an eligible pull', async () => {
  const wrapper = mount(PullRefresh, { props: { modelValue: false } })
  try {
    await nextTick(); await nextTick()
    const area = wrapper.get('.nv-m-pr-inner').element
    pointer(area, 'pointerdown', 10)
    pointer(area, 'pointermove', 260)
    await nextTick()
    expect(wrapper.text()).toContain('释放立即刷新')
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.text()).toContain('刷新中')
    pointer(area, 'pointerup', 260)
    await nextTick()
    expect(wrapper.emitted('refresh')).toBeUndefined()
  } finally { wrapper.unmount() }
})

it('ignores a pull started while loading and permits one after completion', async () => {
  const wrapper = mount(PullRefresh, { props: { modelValue: true } })
  try {
    await nextTick(); await nextTick()
    const area = wrapper.get('.nv-m-pr-inner').element
    pointer(area, 'pointerdown', 10); pointer(area, 'pointermove', 260); pointer(area, 'pointerup', 260)
    await nextTick()
    expect(wrapper.emitted('refresh')).toBeUndefined()
    await wrapper.setProps({ modelValue: false })
    pointer(area, 'pointerdown', 10); pointer(area, 'pointermove', 260); pointer(area, 'pointerup', 260)
    await nextTick()
    expect(wrapper.emitted('refresh')).toEqual([[]])
  } finally { wrapper.unmount() }
})

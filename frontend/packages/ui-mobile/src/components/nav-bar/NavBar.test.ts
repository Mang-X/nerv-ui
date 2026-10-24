import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { NvNavBar } from '../../index'

describe('NvNavBar touch action', () => {
  it('keeps back, title and right-slot actions independent', async () => {
    const right = vi.fn()
    const wrapper = mount(NvNavBar, {
      props: { back: true, title: '随行手记' },
      slots: { right: () => h('button', { onClick: right }, '更多') },
    })
    const back = wrapper.get('button[aria-label="返回"]')
    // Geometry and real edge clicks are covered by the production-browser regression.
    expect(back.classes()).toContain('size-11')
    await back.trigger('click')
    expect(wrapper.emitted('back')).toEqual([[]])
    await wrapper.get('button:not([aria-label])').trigger('click')
    expect(right).toHaveBeenCalledOnce()
    expect(wrapper.emitted('back')).toHaveLength(1)
    expect(wrapper.text()).toContain('随行手记')
    await wrapper.setProps({ back: false })
    expect(wrapper.find('button[aria-label="返回"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { NvMobileButton } from '../../index'

describe('NvMobileButton touch action', () => {
  it.each(['sm', 'md', 'lg'] as const)(
    'reserves a minimum touch target for %s without duplicating click',
    async (size) => {
      const action = vi.fn()
      const wrapper = mount(NvMobileButton, {
        props: { size },
        attrs: { type: 'button', onClick: action },
        slots: { default: '收下' },
      })
      const button = wrapper.get('button')
      expect(button.classes()).toContain('min-h-11')
      expect(button.classes()).toContain('min-w-11')
      await button.trigger('click')
      expect(action).toHaveBeenCalledOnce()
      expect(button.text()).toBe('收下')
      wrapper.unmount()
    },
  )

  it('forwards asChild, block, href and focus to the single link action', async () => {
    const action = vi.fn()
    const wrapper = mount(NvMobileButton, {
      attachTo: document.body,
      props: { asChild: true, block: true, size: 'sm' },
      attrs: { onClick: action },
      slots: { default: () => h('a', { href: '#result' }, '查看') },
    })
    const link = wrapper.get('a')
    expect(wrapper.findAll('a, button')).toHaveLength(1)
    expect(link.classes()).toContain('w-full')
    expect(link.attributes('href')).toBe('#result')
    link.element.focus()
    expect(document.activeElement).toBe(link.element)
    await link.trigger('click')
    expect(action).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('keeps native disabled and caller-managed busy content inert', async () => {
    const action = vi.fn()
    const wrapper = mount(NvMobileButton, {
      props: { size: 'sm' },
      attrs: { disabled: true, 'aria-busy': 'true', onClick: action },
      slots: { default: '保存中' },
    })
    await wrapper.get('button').trigger('click')
    expect(action).not.toHaveBeenCalled()
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toBe('保存中')
    wrapper.unmount()
  })
})

import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { NvTouchButton } from '@nerv-iip/ui'

it('blocks native activation while loading and resumes when ready', async () => {
  const onClick = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { loading: true },
    attrs: { onClick },
    slots: { default: '继续阅读', leading: '<span>→</span>' },
  })
  const button = wrapper.get('button')
  expect(button.attributes('aria-busy')).toBe('true')
  expect(button.element.disabled).toBe(true)
  button.element.click()
  expect(onClick).not.toHaveBeenCalled()
  expect(wrapper.text()).not.toContain('→')
  await wrapper.setProps({ loading: false })
  expect(button.element.disabled).toBe(false)
  expect(button.attributes('aria-busy')).toBeUndefined()
  expect(wrapper.text()).toContain('→')
  button.element.click()
  expect(onClick).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})

it('prevents loading link activation when rendering as an anchor', async () => {
  const onClick = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { as: 'a', loading: true },
    attrs: { onClick, href: '#reading' },
    slots: { default: '阅读' },
  })
  const link = wrapper.get('a')
  expect(link.attributes('aria-disabled')).toBe('true')
  link.element.click()
  expect(onClick).not.toHaveBeenCalled()
  await wrapper.setProps({ loading: false })
  link.element.click()
  expect(onClick).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})

it('keeps explicit disabled state after loading finishes', async () => {
  const onClick = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { loading: true, disabled: true },
    attrs: { onClick },
    slots: { default: '稍后' },
  })
  await wrapper.setProps({ loading: false })
  const button = wrapper.get('button')
  expect(button.element.disabled).toBe(true)
  button.element.click()
  expect(onClick).not.toHaveBeenCalled()
  wrapper.unmount()
})

it.each(['default', 'brand', 'success', 'warning', 'destructive', 'outline', 'ghost'] as const)(
  'activates and renders the leading slot for variant %s',
  async (variant) => {
    const onClick = vi.fn()
    const wrapper = mount(NvTouchButton, {
      props: { variant },
      attrs: { onClick },
      slots: { leading: '<span aria-hidden="true">→</span>', default: '阅读' },
    })
    expect(wrapper.text()).toBe('→阅读')
    await wrapper.get('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  },
)

it('forwards a link destination when rendering as a child', () => {
  const wrapper = mount(NvTouchButton, {
    props: { asChild: true },
    slots: { default: '<a href="#touch-actions">操作示例</a>' },
  })
  expect(wrapper.get('a').attributes('href')).toBe('#touch-actions')
  expect(wrapper.get('a').text()).toBe('操作示例')
  expect(wrapper.find('button').exists()).toBe(false)
  wrapper.unmount()
})

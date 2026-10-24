import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NvFab } from '../../index'

describe('NvFab public actions', () => {
  it('names the speed-dial trigger with text and emits the selected action identity once', async () => {
    const action = { key: 'save', text: '收好行程' }
    const wrapper = mount(NvFab, { props: { text: '更多随行操作', actions: [action] } })
    const trigger = wrapper.get('button[aria-label="更多随行操作"]')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === '收好行程')!
      .trigger('click')
    expect(wrapper.emitted('select')).toEqual([[action, 0]])
    expect(wrapper.emitted('click')).toBeUndefined()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('emits click for a single action and does not expose a speed-dial state', async () => {
    const wrapper = mount(NvFab, { props: { text: '记一笔' } })
    const trigger = wrapper.get('button')
    expect(trigger.text()).toBe('记一笔')
    expect(trigger.attributes('aria-expanded')).toBeUndefined()
    await trigger.trigger('click')
    expect(wrapper.emitted('click')).toEqual([[]])
    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })
})

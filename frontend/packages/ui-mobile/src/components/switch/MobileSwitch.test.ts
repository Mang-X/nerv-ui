import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick, shallowRef } from 'vue'
import { NvMobileSwitch } from '../../index'

describe('NvMobileSwitch touch action', () => {
  it('reserves a touch root while keeping controlled state, label and native form value', async () => {
    const wrapper = mount(
      {
        render: () =>
          h('form', [
            h(NvMobileSwitch, {
              modelValue: false,
              name: 'reminder',
              value: 'yes',
              'aria-label': '提醒',
            }),
          ]),
      },
      { attachTo: document.body },
    )
    const control = wrapper.getComponent(NvMobileSwitch)
    const button = wrapper.get<HTMLButtonElement>('button[role="switch"]')
    expect(button.classes()).toContain('h-11')
    expect(button.attributes()).toMatchObject({
      'aria-label': '提醒',
      'aria-checked': 'false',
      type: 'button',
    })
    await button.trigger('click')
    expect(control.emitted('update:modelValue')).toEqual([[true]])
    expect(button.attributes('aria-checked')).toBe('false')
    expect(new FormData(wrapper.get('form').element).has('reminder')).toBe(false)
    button.element.focus()
    expect(document.activeElement).toBe(button.element)
    wrapper.unmount()
  })

  it('reflects external controlled changes and keeps disabled native activation inert', async () => {
    const wrapper = mount(NvMobileSwitch, { props: { modelValue: false, disabled: true } })
    const button = wrapper.get<HTMLButtonElement>('button[role="switch"]')
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ modelValue: true })
    expect(button.attributes('aria-checked')).toBe('true')
    expect(button.attributes('data-state')).toBe('checked')
    await wrapper.setProps({ disabled: false })
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    wrapper.unmount()
  })
})

describe('NvMobileSwitch public asChild compatibility', () => {
  it('keeps the unfocused asChild role root exposed and focusable with controlled native form semantics', async () => {
    const modelValue = shallowRef(false)
    const disabled = shallowRef(false)
    const wrapper = mount(
      {
        render: () =>
          h('form', [
            h(NvMobileSwitch, {
              asChild: true,
              tabindex: 0,
              modelValue: modelValue.value,
              disabled: disabled.value,
              name: 'reminder',
              value: 'yes',
              'aria-label': '公开提醒',
            }),
          ]),
      },
      { attachTo: document.body },
    )
    const root = wrapper.get<HTMLElement>('[role="switch"]')
    const control = wrapper.getComponent(NvMobileSwitch)
    expect(root.attributes('aria-hidden')).toBeUndefined()
    expect(root.attributes()).toMatchObject({
      'aria-label': '公开提醒',
      'aria-checked': 'false',
      tabindex: '0',
    })
    expect(root.element.closest('[aria-hidden="true"]')).toBeNull()
    root.element.focus()
    expect(document.activeElement).toBe(root.element)
    await root.trigger('keydown', { key: 'Enter' })
    expect(control.emitted('update:modelValue')).toEqual([[true]])
    expect(root.attributes('aria-checked')).toBe('false')
    expect(new FormData(wrapper.get('form').element).has('reminder')).toBe(false)
    modelValue.value = true
    await nextTick()
    expect(root.attributes('aria-checked')).toBe('true')
    expect(new FormData(wrapper.get('form').element).get('reminder')).toBe('yes')
    disabled.value = true
    await nextTick()
    await root.trigger('keydown', { key: 'Enter' })
    expect(control.emitted('update:modelValue')).toEqual([[true]])
    expect(new FormData(wrapper.get('form').element).has('reminder')).toBe(false)
    wrapper.unmount()
  })
})

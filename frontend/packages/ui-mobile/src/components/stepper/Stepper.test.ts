import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NvStepper } from '../../index'

describe('NvStepper touch actions', () => {
  it('reserves independent targets and emits controlled steps without changing the input early', async () => {
    const wrapper = mount(NvStepper, { props: { modelValue: 2, min: 1, max: 5 } })
    const buttons = wrapper.findAll('button')
    for (const button of buttons) {
      expect(button.classes()).toContain('size-11')
      expect(button.attributes('type')).toBe('button')
    }
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('2')
    await wrapper.setProps({ modelValue: 3 })
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[3], [2]])
    wrapper.unmount()
  })

  it('keeps native input editing, blur clamping and disabled boundaries separate', async () => {
    const wrapper = mount(NvStepper, { props: { modelValue: 1, min: 1, max: 5 } })
    await wrapper.get('button[aria-label="减少"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    const input = wrapper.get<HTMLInputElement>('input')
    expect(input.attributes()).toMatchObject({ type: 'number', inputmode: 'numeric' })
    await input.setValue('9')
    expect(wrapper.emitted('update:modelValue')).toEqual([[9]])
    await wrapper.setProps({ modelValue: 9 })
    await input.trigger('blur')
    expect(input.element.value).toBe('5')
    expect(wrapper.emitted('update:modelValue')).toEqual([[9], [5]])
    await wrapper.setProps({ modelValue: 5 })
    await wrapper.get('button[aria-label="增加"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
    wrapper.unmount()
  })
})

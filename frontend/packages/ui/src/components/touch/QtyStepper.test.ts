import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { NvQtyStepper } from '@nerv-ui/ui'

it('requests bounded changes without mutating the controlled value', async () => {
  const wrapper = mount(NvQtyStepper, { props: { modelValue: 4, min: 1, max: 6, step: 3 } })
  await wrapper.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')).toEqual([[6]])
  expect(wrapper.text()).toBe('4')
  await wrapper.setProps({ modelValue: 6 })
  const inc = wrapper.get<HTMLButtonElement>('button[aria-label="增加"]')
  expect(inc.element.disabled).toBe(true)
  inc.element.click()
  expect(wrapper.emitted('update:modelValue')).toEqual([[6]])
  await wrapper.get('button[aria-label="减少"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])
  await wrapper.setProps({ modelValue: 2 })
  await wrapper.get('button[aria-label="减少"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
  await wrapper.setProps({ modelValue: 1 })
  const dec = wrapper.get<HTMLButtonElement>('button[aria-label="减少"]')
  expect(dec.element.disabled).toBe(true)
  const count = wrapper.emitted('update:modelValue')?.length
  dec.element.click()
  expect(wrapper.emitted('update:modelValue')).toHaveLength(count!)
  wrapper.unmount()
})

it('defaults to zero and increments by one with no finite upper bound', async () => {
  const wrapper = mount(NvQtyStepper)
  expect(wrapper.text()).toBe('0')
  expect(wrapper.get<HTMLButtonElement>('button[aria-label="减少"]').element.disabled).toBe(true)
  await wrapper.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
  await wrapper.setProps({ modelValue: 999 })
  await wrapper.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1000])
  wrapper.unmount()
})

it('disables both directions when the range is a single value', () => {
  const wrapper = mount(NvQtyStepper, { props: { modelValue: 3, min: 3, max: 3 } })
  for (const button of wrapper.findAll('button')) {
    expect((button.element as HTMLButtonElement).disabled).toBe(true)
    ;(button.element as HTMLButtonElement).click()
  }
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  wrapper.unmount()
})

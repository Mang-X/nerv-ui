import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { NvTouchSegmented } from '@nerv-ui/ui'

const options = [
  { value: 'read', label: '阅读' },
  { value: 'listen', label: '聆听' },
  { value: 'rest', label: '休息' },
]

it('aligns focus requests and controlled selection after options reorder', async () => {
  const wrapper = mount(NvTouchSegmented, {
    props: { modelValue: 'read', options },
    attachTo: document.body,
  })
  try {
    await wrapper.setProps({ options: [options[2]!, options[0]!, options[1]!] })
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual(['休息', '阅读', '聆听'])
    tabs[1]!.element.focus()
    await tabs[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['listen']])
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('阅读')
    expect(document.activeElement).toBe(tabs[2]!.element)
    await wrapper.setProps({ modelValue: 'listen' })
    expect(wrapper.get('[aria-selected="true"]').element).toBe(document.activeElement)
    expect(wrapper.findAll('[tabindex="0"]').map((tab) => tab.text())).toEqual(['聆听'])
  } finally {
    wrapper.unmount()
  }
})

it('uses updated options for Arrow Home and End after removal and insertion', async () => {
  const wrapper = mount(NvTouchSegmented, {
    props: { modelValue: 'read', options },
    attachTo: document.body,
  })
  try {
    await wrapper.setProps({
      options: [{ value: 'pause', label: '暂停' }, options[0]!, options[1]!],
    })
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual(['暂停', '阅读', '聆听'])
    tabs[1]!.element.focus()
    for (const [key, target, value] of [
      ['ArrowRight', 2, 'listen'],
      ['Home', 0, 'pause'],
      ['End', 2, 'listen'],
      ['ArrowLeft', 1, 'read'],
    ] as const) {
      const previous = wrapper.get('[aria-selected="true"]').element
      const focused = wrapper
        .findAll('[role="tab"]')
        .find((tab) => tab.element === document.activeElement)!
      await focused.trigger('keydown', { key })
      expect(document.activeElement).toBe(tabs[target]!.element)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([value])
      expect(wrapper.get('[aria-selected="true"]').element).toBe(previous)
      await wrapper.setProps({ modelValue: value })
      expect(wrapper.get('[aria-selected="true"]').element).toBe(document.activeElement)
      expect(wrapper.findAll('[tabindex="0"]').map((tab) => tab.element)).toEqual([
        document.activeElement,
      ])
    }
  } finally {
    wrapper.unmount()
  }
})

it('moves focus and requests a controlled selection with horizontal navigation keys', async () => {
  const wrapper = mount(NvTouchSegmented, {
    props: { modelValue: 'read', options },
    attachTo: document.body,
  })
  const tabs = wrapper.findAll('[role="tab"]')
  expect(tabs.map((tab) => tab.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
  await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
  expect(document.activeElement).toBe(tabs[1]!.element)
  expect(wrapper.emitted('update:modelValue')).toEqual([['listen']])
  expect(tabs[0]!.attributes('aria-selected')).toBe('true')
  await wrapper.setProps({ modelValue: 'listen' })
  expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  expect(tabs[1]!.attributes('tabindex')).toBe('0')
  await tabs[1]!.trigger('keydown', { key: 'End' })
  await tabs[2]!.trigger('keydown', { key: 'ArrowRight' })
  await tabs[0]!.trigger('keydown', { key: 'ArrowLeft' })
  await tabs[2]!.trigger('keydown', { key: 'Home' })
  expect(wrapper.emitted('update:modelValue')).toEqual([
    ['listen'],
    ['rest'],
    ['read'],
    ['rest'],
    ['read'],
  ])
  expect(document.activeElement).toBe(tabs[0]!.element)
  wrapper.unmount()
})

it('requests a pointer selection and waits for the controlled value', async () => {
  const wrapper = mount(NvTouchSegmented, { props: { modelValue: 'read', options } })
  await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
  expect(wrapper.emitted('update:modelValue')).toEqual([['rest']])
  expect(wrapper.findAll('[aria-selected="true"]').map((tab) => tab.text())).toEqual(['阅读'])
  await wrapper.setProps({ modelValue: 'rest' })
  expect(wrapper.findAll('[aria-selected="true"]').map((tab) => tab.text())).toEqual(['休息'])
  wrapper.unmount()
})

it('provides an entry for an unmatched value and handles empty or single options', async () => {
  const wrapper = mount(NvTouchSegmented, { props: { modelValue: 'missing', options } })
  expect(wrapper.findAll('[tabindex="0"]').map((tab) => tab.text())).toEqual(['阅读'])
  await wrapper.setProps({ options: [] })
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ options: [options[0]!] })
  await wrapper.get('[role="tab"]').trigger('keydown', { key: 'ArrowLeft' })
  expect(wrapper.emitted('update:modelValue')).toEqual([['read']])
  await wrapper.get('[role="tab"]').trigger('keydown', { key: 'ArrowDown' })
  expect(wrapper.emitted('update:modelValue')).toEqual([['read']])
  wrapper.unmount()
})

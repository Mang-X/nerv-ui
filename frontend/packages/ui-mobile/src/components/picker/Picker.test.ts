import { mount, flushPromises, DOMWrapper } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { NvPicker } from '../../index'

let wrapper: ReturnType<typeof mount>
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})
const options = [
  { label: '湖畔', value: 'lake' },
  { label: '林间', value: 'woods' },
  { label: '庭院', value: 'garden' },
]
const body = () => new DOMWrapper(document.body)
const settle = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r, 0))
}
async function scroll(index: number) {
  const wheel = body().get<HTMLElement>('.nv-m-picker-scroll')
  wheel.element.scrollTop = index * 40
  await wheel.trigger('scroll')
}
async function button(text: string) {
  await body()
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
  await settle()
}

it('initializes an already open picker from the public value and commits it on confirm', async () => {
  wrapper = mount(NvPicker, {
    props: { open: true, modelValue: 'woods', options },
    attachTo: document.body,
  })
  await settle()
  expect(body().get<HTMLElement>('.nv-m-picker-scroll').element.scrollTop).toBe(40)
  await scroll(2)
  await button('确定')
  expect(wrapper.emitted('update:modelValue')).toEqual([['garden']])
})

it('resynchronizes external value and keyed option order while open without emitting a commit', async () => {
  wrapper = mount(NvPicker, {
    props: { open: false, modelValue: 'lake', options },
    attachTo: document.body,
  })
  await wrapper.setProps({ open: true })
  await settle()
  await scroll(2)
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ modelValue: 'woods' })
  await settle()
  expect(body().get<HTMLElement>('.nv-m-picker-scroll').element.scrollTop).toBe(40)
  await wrapper.setProps({ options: [options[1]!, options[2]!, options[0]!] })
  await settle()
  expect(body().get<HTMLElement>('.nv-m-picker-scroll').element.scrollTop).toBe(0)
  await scroll(1)
  await button('确定')
  expect(wrapper.emitted('update:modelValue')).toEqual([['garden']])
})

it('discards a scrolled draft on cancel and confirms empty options without a value event', async () => {
  wrapper = mount(NvPicker, {
    props: { open: false, modelValue: 'lake', options },
    attachTo: document.body,
  })
  await wrapper.setProps({ open: true })
  await settle()
  await scroll(1)
  await button('取消')
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ open: false })
  await wrapper.setProps({ open: true, options: [] })
  await settle()
  await button('确定')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.emitted('update:open')).toEqual([[false], [false]])
})

it('preserves a scrolled draft by value across keyed reordering and falls back after its removal', async () => {
  wrapper = mount(NvPicker, {
    props: { open: false, modelValue: 'lake', options },
    attachTo: document.body,
  })
  await wrapper.setProps({ open: true })
  await settle()
  await scroll(2)
  await wrapper.setProps({ options: [options[2]!, options[0]!, options[1]!] })
  await settle()
  expect(body().get<HTMLElement>('.nv-m-picker-scroll').element.scrollTop).toBe(0)
  await button('确定')
  expect(wrapper.emitted('update:modelValue')).toEqual([['garden']])
  await wrapper.setProps({ open: false })
  await wrapper.setProps({ open: true })
  await settle()
  await wrapper.setProps({ options: [options[1]!] })
  await settle()
  await button('确定')
  expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['woods'])
})

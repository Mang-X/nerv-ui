import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { NvMobileDatePicker } from '../../index'
let wrapper: ReturnType<typeof mount>
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})
const body = () => new DOMWrapper(document.body)
const settle = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r, 0))
}
async function scroll(col: number, index: number) {
  const w = body().findAll<HTMLElement>('.nv-m-mdp-scroll')[col]!
  w.element.scrollTop = index * 40
  await w.trigger('scroll')
  await settle()
}
async function confirm() {
  await body()
    .findAll('button')
    .find((b) => b.text() === '确定')!
    .trigger('click')
  await settle()
}
it('initializes an already open date and keeps a shorter month valid before confirming', async () => {
  wrapper = mount(NvMobileDatePicker, {
    props: { open: true, modelValue: '2024-01-31', minYear: 2023, maxYear: 2025 },
    attachTo: document.body,
  })
  await settle()
  expect(body().findAll<HTMLElement>('.nv-m-mdp-scroll')[0]!.element.scrollTop).toBe(40)
  await scroll(1, 1)
  expect(body().findAll('.nv-m-mdp-scroll')[2]!.text()).not.toContain('30日')
  await confirm()
  expect(wrapper.emitted('update:modelValue')).toEqual([['2024-02-29']])
})
it('clamps the day when changing from a leap year and resynchronizes external dates and year bounds', async () => {
  wrapper = mount(NvMobileDatePicker, {
    props: { open: false, modelValue: '2024-02-29', minYear: 2023, maxYear: 2025 },
    attachTo: document.body,
  })
  await wrapper.setProps({ open: true })
  await settle()
  await scroll(0, 2)
  await confirm()
  expect(wrapper.emitted('update:modelValue')).toEqual([['2025-02-28']])
  await wrapper.setProps({ open: false })
  await wrapper.setProps({ open: true })
  await settle()
  await wrapper.setProps({ modelValue: '2023-12-31' })
  await settle()
  expect(body().findAll<HTMLElement>('.nv-m-mdp-scroll')[1]!.element.scrollTop).toBe(440)
  await wrapper.setProps({ minYear: 2024, maxYear: 2024 })
  await settle()
  await confirm()
  expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2024-12-31'])
})
it('cancel emits only close after wheel changes and reopening restores the external date', async () => {
  wrapper = mount(NvMobileDatePicker, {
    props: { open: false, modelValue: '2024-06-18', minYear: 2023, maxYear: 2025 },
    attachTo: document.body,
  })
  await wrapper.setProps({ open: true })
  await settle()
  await scroll(1, 0)
  await body()
    .findAll('button')
    .find((b) => b.text() === '取消')!
    .trigger('click')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  await wrapper.setProps({ open: false })
  await wrapper.setProps({ open: true })
  await settle()
  expect(body().findAll<HTMLElement>('.nv-m-mdp-scroll')[1]!.element.scrollTop).toBe(200)
})
it('keeps an out of range external year inside the advertised bounds on confirmation', async () => {
  wrapper = mount(NvMobileDatePicker, {
    props: { open: true, modelValue: '2022-12-31', minYear: 2023, maxYear: 2025 },
    attachTo: document.body,
  })
  await settle()
  await confirm()
  expect(wrapper.emitted('update:modelValue')).toEqual([['2023-12-31']])
  await wrapper.setProps({ open: false })
  await wrapper.setProps({ open: true, modelValue: '2026-01-01' })
  await settle()
  await confirm()
  expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2025-01-01'])
})
it('leaves an in-progress day wheel position to native scroll snap until the gesture settles', async () => {
  wrapper = mount(NvMobileDatePicker, {
    props: { open: true, modelValue: '2024-01-31', minYear: 2023, maxYear: 2025 },
    attachTo: document.body,
  })
  await settle()
  const day = body().findAll<HTMLElement>('.nv-m-mdp-scroll')[2]!
  day.element.scrollTop = 58
  await day.trigger('scroll')
  await settle()
  expect(day.element.scrollTop).toBe(58)
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await confirm()
  expect(wrapper.emitted('update:modelValue')).toEqual([['2024-01-02']])
})

import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import TouchTargetsHost from './test/TouchTargetsHost.vue'

it('keeps adjacent public actions, native input and controlled values independent', async () => {
  const wrapper = mount(TouchTargetsHost, { attachTo: document.body })
  await wrapper.get('button[aria-label="返回"]').trigger('click')
  await wrapper.get('[data-slot="nav-bar"] button:not([aria-label])').trigger('click')
  expect(wrapper.get('[aria-label="导航事件"]').text()).toBe('1 / 1')
  await wrapper.get('a[aria-label="链接按钮"]').trigger('click')
  expect(wrapper.get('[aria-label="按钮事件"]').text()).toBe('1')
  await wrapper.get('input[aria-label="邻近输入"]').setValue('独立文字')
  expect(wrapper.get('[aria-label="按钮事件"]').text()).toBe('1')
  await wrapper.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.get('[aria-label="步进值"]').text()).toBe('3')
  await wrapper.get('button[aria-label="受控开关"]').trigger('click')
  expect(wrapper.get('[aria-label="开关值"]').text()).toBe('true')
  expect(new FormData(wrapper.get('form').element).get('reminder')).toBe('yes')
  await wrapper.get('button[aria-label="外部复位"]').trigger('click')
  expect(wrapper.get('[aria-label="开关值"]').text()).toBe('false')
  expect(wrapper.get('[aria-label="步进值"]').text()).toBe('2')
  expect(new FormData(wrapper.get('form').element).has('reminder')).toBe(false)
  wrapper.unmount()
})

it('keeps caller-managed loading and disabled actions inert', async () => {
  const wrapper = mount(TouchTargetsHost)
  await wrapper.get('button[aria-label="保存任务"]').trigger('click')
  expect(wrapper.get('button[aria-label="保存任务"]').text()).toBe('保存中')
  expect(wrapper.get('button[aria-label="保存任务"]').attributes('aria-busy')).toBe('true')
  await wrapper.get('button[aria-label="保存任务"]').trigger('click')
  await wrapper.get('button[aria-label="禁用按钮"]').trigger('click')
  await wrapper.get('button[aria-label="禁用开关"]').trigger('click')
  expect(wrapper.get('[aria-label="按钮事件"]').text()).toBe('1')
  expect(wrapper.get('[aria-label="开关值"]').text()).toBe('false')
  wrapper.unmount()
})

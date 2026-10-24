import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import App from './App.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  localStorage.clear()
  window.location.hash = ''
})

it('adds a named project from the form to the searchable table', async () => {
  wrapper = mount(App, { attachTo: document.body })
  await wrapper.get('input#project-name').setValue('星河计划')
  await wrapper.get('form').trigger('submit')
  await wrapper.get('input[placeholder="搜索项目…"]').setValue('星河计划')
  expect(wrapper.get('tbody').text()).toContain('星河计划')
  expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  expect(wrapper.get('input#project-name').element).toHaveProperty('value', '')
})

it('opens the standalone touch demo from its direct entry and returns to desktop', async () => {
  window.location.hash = '#touch'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('共享阅读角')
  expect(wrapper.get('a[href="#desktop"]').text()).toBe('桌面演示')
  window.location.hash = '#touch-metrics'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('h1').text()).toBe('共享阅读角')
  window.location.hash = '#desktop'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('让想法有序向前')
  expect(wrapper.get('a[href="#touch"]').text()).toBe('触屏演示')
})

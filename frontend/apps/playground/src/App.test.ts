import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import App from './App.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  localStorage.clear()
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

// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { NvFormSection, NvSelect, Select } from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/localFormSectionExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('renders three public section column contracts and labelled independent select families', () => {
  page = mount(Example)
  expect(page.findAllComponents(NvFormSection).map((s) => s.props('columns'))).toEqual([2, 1, 3])
  const controls = page.findAll('[role="combobox"]')
  expect(controls).toHaveLength(2)
  for (const control of controls)
    expect(page.get(`label[for="${control.attributes('id')}"]`).exists()).toBe(true)
})
it('reflects both public model updates safely and resets only this instance', async () => {
  page = mount(
    defineComponent({ components: { Example }, template: '<div><Example/><Example/></div>' }),
  )
  const instances = page.findAllComponents(Example)
  const ids = page.findAll('[id]').map((n) => n.attributes('id'))
  expect(new Set(ids).size).toBe(ids.length)
  instances[0].getComponent(NvSelect).vm.$emit('update:modelValue', '<img src=x>')
  instances[0].getComponent(Select).vm.$emit('update:modelValue', '书画交流')
  await page.vm.$nextTick()
  expect(instances[0].get('[role="status"]').text()).toContain('<img src=x>；书画交流')
  expect(instances[0].find('img').exists()).toBe(false)
  expect(instances[1].get('[role="status"]').text()).toContain('北岸；阅读分享')
  await instances[0].get('button[type="button"]').trigger('click')
  expect(instances[0].get('[role="status"]').text()).toContain('北岸；阅读分享')
})

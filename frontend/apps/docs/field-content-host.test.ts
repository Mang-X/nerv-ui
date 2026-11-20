// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { NvFieldContent, NvFieldTitle, NvFieldSeparator } from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/FieldContentExample.vue'
import GroupExample from './docs/.vitepress/examples/FieldGroupExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('renders public content around labelled controls and a non-label title with readable separator', () => {
  page = mount(Example)
  expect(page.getComponent(NvFieldTitle).element.tagName).toBe('DIV')
  expect(page.getComponent(NvFieldTitle).text()).toBe('本页阅读偏好')
  expect(page.getComponent(NvFieldSeparator).text()).toBe('显示方式')
  const contents = page.findAllComponents(NvFieldContent)
  expect(contents).toHaveLength(2)
  for (const content of contents) {
    const control = content.get('input, select')
    expect(page.get(`label[for="${control.attributes('id')}"]`).exists()).toBe(true)
    expect(control.attributes('aria-describedby')).toBe(
      content.get('[id$="description"]').attributes('id'),
    )
  }
})
it('keeps ids and safe current-value feedback independent across F4 and F5 instances', async () => {
  page = mount(
    defineComponent({
      components: { Example, GroupExample },
      template: '<div><GroupExample /><Example /><Example /></div>',
    }),
  )
  const ids = page.findAll('[id]').map((node) => node.attributes('id'))
  expect(new Set(ids).size).toBe(ids.length)
  expect(ids).not.toContain('field-order-no')
  const examples = page.findAllComponents(Example)
  await examples[0].get('input').setValue('<img src=x onerror=alert(1)>')
  await examples[0].get('select').setValue('详细')
  expect(examples[0].get('[role="status"]').text()).toBe(
    '本页偏好：<img src=x onerror=alert(1)>；详细。刷新后不保留。',
  )
  expect(examples[0].find('img').exists()).toBe(false)
  expect(examples[1].get('[role="status"]').text()).toContain('随手阅读；简洁')
})

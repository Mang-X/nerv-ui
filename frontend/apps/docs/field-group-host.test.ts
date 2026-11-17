// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { NvFieldSet, NvFieldLegend } from '@nerv-iip/ui'
import Example from './docs/.vitepress/examples/FieldGroupExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('uses public fieldset and legend with associated instance-safe input labels', () => {
  page = mount(
    defineComponent({ components: { Example }, template: '<div><Example /><Example /></div>' }),
  )
  const ids = page.findAll('input').map((input) => input.attributes('id'))
  expect(new Set(ids).size).toBe(2)
  expect(ids).not.toContain('field-order-no')
  for (const group of page.findAllComponents(NvFieldSet)) {
    expect(group.element.tagName).toBe('FIELDSET')
    expect(group.getComponent(NvFieldLegend).element.tagName).toBe('LEGEND')
    expect(group.element.firstElementChild?.tagName).toBe('LEGEND')
    expect(group.get('legend').text()).toBe('周末共读活动的准备安排')
    expect(group.get('label').attributes('for')).toBe(group.get('input').attributes('id'))
    expect(group.get('input').attributes('aria-describedby')).toBe(
      group.get('[data-slot="nv-field-description"]').attributes('id'),
    )
  }
})
it('submits current input safely and isolates feedback between examples', async () => {
  page = mount(
    defineComponent({ components: { Example }, template: '<div><Example /><Example /></div>' }),
  )
  const examples = page.findAllComponents(Example)
  await examples[0].get('input').setValue('<img src=x onerror=alert(1)>')
  await examples[0].get('form').trigger('submit')
  expect(examples[0].get('[role="status"]').text()).toBe(
    '本页已确认：<img src=x onerror=alert(1)>；刷新后不保留。',
  )
  expect(examples[0].find('img').exists()).toBe(false)
  expect(examples[1].get('[role="status"]').text()).toBe('尚未确认')
  await examples[0].get('input').setValue('整理共享书架')
  await examples[0].get('form').trigger('submit')
  expect(examples[0].get('[role="status"]').text()).toContain('整理共享书架')
})

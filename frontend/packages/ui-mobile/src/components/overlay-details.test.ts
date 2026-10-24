import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'
import { afterEach, expect, it } from 'vitest'
import {
  NvActionSheet,
  NvMobileCollapse,
  NvMobileDropdownMenu,
  NvMobileDropdownMenuItem,
} from '../index'
let wrapper: ReturnType<typeof mount>
const body = () => new DOMWrapper(document.body)
const settle = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r, 0))
}
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})
it('action cancellation never selects and reordered actions emit their stable value once', async () => {
  const actions = [
    { label: '同名动作', value: 'first' },
    { label: '同名动作', value: 'second', danger: true },
  ]
  wrapper = mount(NvActionSheet, {
    props: { open: true, title: '动作', actions },
    attachTo: document.body,
  })
  await settle()
  await body().findAll('button').at(-1)!.trigger('click')
  expect(wrapper.emitted('select')).toBeUndefined()
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  await wrapper.setProps({ open: false })
  await wrapper.setProps({ open: true, actions: [...actions].reverse() })
  await settle()
  await body().findAll('button')[0]!.trigger('click')
  expect(wrapper.emitted('select')).toEqual([['second']])
})
it('dropdown keeps group ownership across keyed reordering and preserves number identity on change', async () => {
  wrapper = mount(
    defineComponent({
      components: { NvMobileDropdownMenu, NvMobileDropdownMenuItem },
      props: { flip: Boolean },
      setup(props) {
        const selected = ref<string | number>()
        const groups = computed(() => (props.flip ? ['b', 'a'] : ['a', 'b']))
        return {
          groups,
          selected,
          options: [
            { label: '二', value: 2 },
            { label: '三', value: 3 },
          ],
        }
      },
      template:
        '<NvMobileDropdownMenu><NvMobileDropdownMenuItem v-for="id in groups" :key="id" v-model="selected" :title="id" :options="options" /></NvMobileDropdownMenu><output>{{ typeof selected }} {{ selected }}</output>',
    }),
    { attachTo: document.body },
  )
  await wrapper.findAll('.nv-m-ddm-trigger')[0]!.trigger('click')
  await wrapper.setProps({ flip: true })
  expect(wrapper.findAll('.nv-m-ddm-trigger').map((b) => b.attributes('aria-expanded'))).toEqual([
    'false',
    'true',
  ])
  await wrapper.get('.nv-m-ddm-panel button').trigger('click')
  expect(wrapper.get('output').text()).toBe('number 2')
  expect(wrapper.findAll('.nv-m-ddm-panel')).toHaveLength(0)
  await wrapper.findAll('.nv-m-ddm-trigger')[0]!.trigger('click')
  await wrapper.findAll('.nv-m-ddm-trigger')[1]!.trigger('click')
  expect(wrapper.findAll('.nv-m-ddm-panel')).toHaveLength(1)
  await wrapper.get('.nv-m-ddm-scrim').trigger('click')
  expect(wrapper.findAll('.nv-m-ddm-panel')).toHaveLength(0)
})
it('collapse renders both slots and follows external open changes and its public toggle', async () => {
  wrapper = mount(NvMobileCollapse, {
    props: { open: false },
    slots: { title: '标题插槽', default: '内容插槽' },
  })
  expect(wrapper.get('button').text()).toBe('标题插槽')
  expect(wrapper.text()).toContain('内容插槽')
  await wrapper.setProps({ open: true })
  expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
  await wrapper.get('button').trigger('click')
  expect(wrapper.emitted('update:open')).toEqual([[false]])
  await wrapper.setProps({ open: false })
  expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
})

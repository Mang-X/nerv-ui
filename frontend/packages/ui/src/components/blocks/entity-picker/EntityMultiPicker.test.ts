import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { NvEntityMultiPicker } from '../../../index'

const options = [
  { value: '0', label: '晨光书房' },
  { value: 'a,b', label: '河岸花园' },
  { value: 'two', label: '山间来信' },
]

const mounted: Array<{ unmount: () => void }> = []
function render(props: Record<string, unknown> = {}) {
  const wrapper = mount(NvEntityMultiPicker, {
    props: { modelValue: [] as string[], options, title: '选择地点', ...props },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

async function open() {
  const trigger = document.body.querySelector<HTMLButtonElement>(
    '[data-slot="nv-entity-multi-picker"] button[aria-haspopup]',
  )!
  trigger.click()
  await flushPromises()
}

async function choose(label: string) {
  const item = [...document.body.querySelectorAll<HTMLButtonElement>('[role="option"]')].find(
    (button) => button.textContent?.includes(label),
  )
  expect(item, `missing option ${label}`).toBeDefined()
  item!.click()
  await flushPromises()
}

function searchInput() {
  return document.body.querySelector<HTMLInputElement>('input[role="combobox"]')!
}

async function search(value: string) {
  const input = searchInput()
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
})

describe('NvEntityMultiPicker public contract', () => {
  it('adds one option to a controlled array without changing the supplied array', async () => {
    const selected = ['0']
    const wrapper = render({ modelValue: selected })
    await open()
    await choose('河岸花园')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['0', 'a,b']])
    expect(selected).toEqual(['0'])
  })

  it('keeps the host authoritative, deduplicates, removes and clears without mutating input', async () => {
    const initial = ['0']
    const wrapper = render({ modelValue: initial })
    await open()
    expect(document.body.querySelector('[role="listbox"]')?.textContent).not.toContain('晨光书房')
    await choose('河岸花园')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['0', 'a,b']]])
    expect(wrapper.text()).not.toContain('河岸花园') // host has not accepted the proposal
    expect(initial).toEqual(['0'])

    await open()
    await choose('河岸花园')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['0', 'a,b']])
    await wrapper.setProps({ modelValue: ['0', 'a,b'] })
    expect(wrapper.findAll('button[aria-label^="移除 "]')).toHaveLength(2)
    await wrapper.get('button[aria-label="移除 晨光书房"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a,b']])
    await wrapper.get('button[aria-label="清空已选"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.text()).toContain('尚未选择')
  })

  it('retains selected labels across result pages, refreshes a matching label and shows unknown history', async () => {
    const wrapper = render({ modelValue: ['0', 'historic'], options: [options[0]] })
    expect(wrapper.text()).toContain('晨光书房')
    expect(wrapper.text()).toContain('historic')
    await wrapper.setProps({ options: [options[2]] })
    expect(wrapper.find('button[aria-label="移除 晨光书房"]').exists()).toBe(true)
    await wrapper.setProps({ options: [{ value: '0', label: '晨光书房新址' }] })
    expect(wrapper.find('button[aria-label="移除 晨光书房新址"]').exists()).toBe(true)
    await wrapper.setProps({ modelValue: ['historic'] })
    await wrapper.setProps({ modelValue: ['0', 'historic'], options: [] })
    expect(wrapper.find('button[aria-label="移除 0"]').exists()).toBe(true)
    await wrapper.get('button[aria-label="移除 historic"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['0']])
  })

  it('keeps the picked label when the host accepts and changes pages in the same update', async () => {
    const nextPage = [{ value: 'two', label: '山间来信' }]
    const Host = defineComponent({
      setup() {
        const selected = ref<string[]>([])
        const page = ref([options[1]])
        return () =>
          h(NvEntityMultiPicker, {
            modelValue: selected.value,
            options: page.value,
            title: '选择地点',
            'onUpdate:modelValue': (values: string[]) => {
              selected.value = values
              page.value = nextPage
            },
          })
      },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    mounted.push(wrapper)
    await open()
    await choose('河岸花园')
    expect(wrapper.get('[role="group"]').text()).toContain('河岸花园')
    expect(wrapper.find('button[aria-label="移除 河岸花园"]').exists()).toBe(true)
  })

  it('does not retain a rejected proposal for a later host acceptance', async () => {
    const wrapper = render({ modelValue: [], options: [options[1]] })
    await open()
    await choose('河岸花园')
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    await wrapper.setProps({ options: [] })
    await wrapper.setProps({ modelValue: ['a,b'] })
    expect(wrapper.get('[role="group"]').text()).toContain('a,b')
    expect(wrapper.get('[role="group"]').text()).not.toContain('河岸花园')
  })

  it('distinguishes same-name selections visually and by removal name across page changes', async () => {
    const wrapper = render({
      modelValue: ['WC-A', 'WC-B'],
      options: [
        { value: 'WC-A', label: '工作中心', code: '甲区' },
        { value: 'WC-B', label: '工作中心', code: '乙区' },
      ],
    })
    const group = wrapper.get('[role="group"]')
    expect(group.text()).toContain('工作中心')
    expect(group.text()).toContain('甲区')
    expect(group.text()).toContain('乙区')
    expect(group.find('button[aria-label="移除 工作中心 甲区"]').exists()).toBe(true)
    expect(group.find('button[aria-label="移除 工作中心 乙区"]').exists()).toBe(true)
    await wrapper.setProps({ options: [] })
    expect(group.find('button[aria-label="移除 工作中心 甲区"]').exists()).toBe(true)
    await group.get('button[aria-label="移除 工作中心 乙区"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['WC-A']])
  })

  it('uses the complete stable value for same-name options without a distinct secondary label', () => {
    const wrapper = render({
      modelValue: ['opaque-value-a', 'opaque-value-b'],
      options: [
        { value: 'opaque-value-a', label: '同名地点', hint: '开放' },
        { value: 'opaque-value-b', label: '同名地点', hint: '开放' },
      ],
      showCode: false,
    })
    const group = wrapper.get('[role="group"]')
    expect(group.text()).toContain('opaque-value-a')
    expect(group.text()).toContain('opaque-value-b')
    expect(group.find('button[aria-label="移除 同名地点 opaque-value-a"]').exists()).toBe(true)
    expect(group.find('button[aria-label="移除 同名地点 opaque-value-b"]').exists()).toBe(true)
  })

  it('keeps final same-name identities distinct across code hint and value collisions', async () => {
    const wrapper = render({
      modelValue: ['center-a', 'center-b', 'center-c'],
      options: [
        { value: 'center-a', label: '工作中心', code: '东区' },
        { value: 'center-b', label: '工作中心', hint: '东区' },
        { value: 'center-c', label: '工作中心', code: 'center-a' },
      ],
    })
    const group = wrapper.get('[role="group"]')
    for (const value of ['center-a', 'center-b', 'center-c']) {
      expect(group.find(`button[aria-label="移除 工作中心 ${value}"]`).exists()).toBe(true)
      expect(group.text()).toContain(value)
    }
    await wrapper.setProps({ options: [] })
    await group.get('button[aria-label="移除 工作中心 center-b"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['center-a', 'center-c']])
    await wrapper.setProps({ modelValue: ['center-c', 'center-b', 'center-a'] })
    expect(group.find('button[aria-label="移除 工作中心 center-b"]').exists()).toBe(true)
    expect(group.find('button[aria-label="移除 工作中心 center-c"]').exists()).toBe(true)
    expect(group.find('button[aria-label="移除 工作中心 center-a"]').exists()).toBe(true)
  })

  it('uses distinct hints when same-name options share one code', () => {
    const wrapper = render({
      modelValue: ['center-a', 'center-b'],
      options: [
        { value: 'center-a', label: '工作中心', code: 'WC', hint: '东区' },
        { value: 'center-b', label: '工作中心', code: 'WC', hint: '西区' },
      ],
    })
    const group = wrapper.get('[role="group"]')
    expect(group.find('button[aria-label="移除 工作中心 东区"]').exists()).toBe(true)
    expect(group.find('button[aria-label="移除 工作中心 西区"]').exists()).toBe(true)
    expect(group.text()).not.toContain('center-a')
    expect(group.text()).not.toContain('center-b')
  })

  it('forwards search, clear and one load-more request per source event', async () => {
    const wrapper = render({
      serverSearch: true,
      search: '',
      totalCount: 20,
      options: [options[0]],
    })
    await open()
    await search('河岸')
    expect(wrapper.emitted('update:search')?.at(-1)).toEqual(['河岸'])
    await wrapper.setProps({ search: '河岸', options: [options[1]] })
    await search('')
    expect(wrapper.emitted('update:search')?.at(-1)).toEqual([''])
    const list = document.body.querySelector<HTMLElement>('[role="listbox"]')!
    list.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.emitted('load-more')).toHaveLength(1)
  })

  it('does not request another page when the sole search hit is already selected', async () => {
    const wrapper = render({
      modelValue: ['a,b'],
      options: [options[1]],
      serverSearch: true,
      search: '河岸',
      totalCount: 1,
    })
    await open()
    expect(document.body.querySelector('[role="listbox"]')?.textContent).toContain('无匹配实体')
    expect(document.body.textContent).not.toContain('输入关键字继续筛选')
    document.body.querySelector<HTMLElement>('[role="listbox"]')!.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.emitted('load-more')).toBeUndefined()
  })

  it('exposes invalid semantics and blocks pointer and keyboard changes when disabled', async () => {
    const wrapper = render({
      modelValue: ['0'],
      disabled: true,
      invalid: true,
      ariaDescribedby: 'error',
    })
    expect(wrapper.get('[data-slot="nv-entity-multi-picker"]').attributes('data-invalid')).toBe(
      'true',
    )
    const trigger = wrapper.get('button[aria-haspopup]')
    expect(trigger.attributes()).toMatchObject({
      disabled: '',
      'aria-invalid': 'true',
      'aria-describedby': 'error',
    })
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Enter' })
    await wrapper.get('button[aria-label="移除 晨光书房"]').trigger('click')
    await wrapper.get('button[aria-label="清空已选"]').trigger('click')
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('disables existing removal and clear controls when the host pauses selection', async () => {
    const wrapper = render({ modelValue: ['0'] })
    const remove = wrapper.get('button[aria-label="移除 晨光书房"]')
    const clear = wrapper.get('button[aria-label="清空已选"]')
    expect(remove.attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ disabled: true })
    for (const control of [remove, clear]) {
      expect(control.attributes('disabled')).toBe('')
      await control.trigger('click')
      await control.trigger('keydown', { key: 'Enter' })
    }
    await wrapper.get('button[aria-haspopup]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
    await wrapper.setProps({ disabled: false })
    await remove.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
  })

  it('supports keyboard selection through the shared search listbox', async () => {
    const wrapper = render()
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = () => {}
    await open()
    const input = searchInput()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await flushPromises()
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a,b']])
    if (originalScrollIntoView) Element.prototype.scrollIntoView = originalScrollIntoView
    else delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
  })

  it('keeps the active descendant valid when search narrows the visible list', async () => {
    const wrapper = render()
    await open()
    const last = [...document.body.querySelectorAll<HTMLElement>('[role="option"]')].at(-1)!
    last.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    await search('晨光')
    const input = searchInput()
    expect(
      document.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.textContent,
    ).toContain('晨光书房')
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['0']])
  })
})

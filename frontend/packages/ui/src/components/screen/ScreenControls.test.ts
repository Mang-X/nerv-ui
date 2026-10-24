import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import {
  NvScreenSearch,
  NvScreenSelect,
  NvScreenTabs,
  NvScreenSegmented,
  NvScreenSwitch,
  NvScreenButton,
  NvScreenInput,
} from '@nerv-iip/ui'

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('clears the controlled search exactly once and guards disabled clear actions', async () => {
  const value = ref('河岸')
  const disabled = ref(true)
  const updates = vi.fn((next: string) => {
    value.value = next
  })
  const wrapper = mount(
    defineComponent(
      () => () =>
        h(NvScreenSearch, {
          modelValue: value.value,
          disabled: disabled.value,
          'onUpdate:modelValue': updates,
        }),
    ),
  )
  wrappers.push(wrapper)
  const clear = wrapper.get('button[aria-label="清除"]')
  expect(clear.attributes('disabled')).toBeDefined()
  clear.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await nextTick()
  expect(value.value).toBe('河岸')
  expect(updates).not.toHaveBeenCalled()
  disabled.value = false
  await nextTick()
  await clear.trigger('click')
  expect(value.value).toBe('')
  expect(updates.mock.calls).toEqual([['']])
  expect(wrapper.find('button').exists()).toBe(false)
})

it('select keeps typed values and a safe active option after reorder removal empty and recovery', async () => {
  const options = ref([
    { label: '零号区域', value: 0 as string | number },
    { label: '文字零号', value: '0' },
    { label: '河岸', value: 'river' },
  ])
  const value = ref<string | number | undefined>(0)
  const updates = vi.fn((next: string | number | undefined) => {
    value.value = next
  })
  const wrapper = mount(
    defineComponent(
      () => () =>
        h(NvScreenSelect, {
          options: options.value,
          modelValue: value.value,
          placeholder: '请选择区域',
          'onUpdate:modelValue': updates,
        }),
    ),
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  const trigger = wrapper.get('[role="combobox"]')
  ;(trigger.element as HTMLElement).focus()
  await trigger.trigger('keydown', { key: 'ArrowDown' })
  await trigger.trigger('keydown', { key: 'ArrowDown' })
  options.value = [options.value[2]!, options.value[0]!, options.value[1]!]
  await nextTick()
  const activeId = trigger.attributes('aria-activedescendant')
  expect(document.getElementById(activeId!)?.textContent).toContain('文字零号')
  await trigger.trigger('keydown', { key: 'Enter' })
  expect(value.value).toBe('0')
  expect(document.activeElement).toBe(trigger.element)
  expect(document.querySelector('[role="listbox"]')).toBeNull()
  await trigger.trigger('click')
  options.value = [{ label: '河岸新名', value: 'river' }]
  await nextTick()
  expect(trigger.text()).toContain('请选择区域')
  expect(value.value).toBe('0') // host owns missing selection; never silently rewrite it
  await trigger.trigger('keydown', { key: 'ArrowDown' })
  await trigger.trigger('keydown', { key: 'Enter' })
  expect(value.value).toBe('river')
  options.value = []
  await nextTick()
  await trigger.trigger('click')
  await trigger.trigger('keydown', { key: 'ArrowUp' })
  await trigger.trigger('keydown', { key: 'Enter' })
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(0)
  expect(value.value).toBe('river')
  await trigger.trigger('keydown', { key: 'Escape' })
  options.value = [
    { label: '文字零号', value: '0' },
    { label: '零号区域', value: 0 },
  ]
  await nextTick()
  await trigger.trigger('click')
  const choices = document.querySelectorAll<HTMLElement>('[role="option"]')
  choices[1]!.click()
  await nextTick()
  expect(value.value).toBe(0)
  expect(updates.mock.calls.map(([entry]) => entry)).toEqual(['0', 'river', 0])
  expect(document.activeElement).toBe(trigger.element)
})

it('select anchors within the viewport above a bottom edge and reanchors on inner scroll', async () => {
  vi.stubGlobal('innerWidth', 800)
  vi.stubGlobal('innerHeight', 600)
  let rect = { left: 700, right: 880, top: 550, bottom: 588, width: 180, height: 38 }
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      return (
        this.getAttribute('role') === 'combobox'
          ? rect
          : { left: 0, top: 0, right: 180, bottom: 180, width: 180, height: 180 }
      ) as DOMRect
    },
  )
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(180)
  const wrapper = mount(NvScreenSelect, {
    props: { options: [{ label: '河岸', value: 0 }] },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await wrapper.get('button').trigger('click')
  await nextTick()
  const panel = document.querySelector<HTMLElement>('[role="listbox"]')!
  expect(panel.parentElement).toBe(document.body)
  expect(parseFloat(panel.style.left)).toBe(614)
  expect(parseFloat(panel.style.top)).toBe(364)
  expect(parseFloat(panel.style.maxHeight)).toBeLessThanOrEqual(538)
  rect = { left: 24, right: 204, top: 80, bottom: 118, width: 180, height: 38 }
  wrapper.element.dispatchEvent(new Event('scroll', { bubbles: false }))
  await nextTick()
  await nextTick()
  expect(parseFloat(panel.style.left)).toBe(24)
  expect(parseFloat(panel.style.top)).toBe(124)
  window.dispatchEvent(new Event('resize'))
  await nextTick()
  expect(parseFloat(panel.style.top)).toBe(124)
  // Rectangle stubs prove coordinate logic only, never actual browser placement.
})

it('select closes on Escape Tab outside and disabling and releases open listeners on unmount', async () => {
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  const docAdd = vi.spyOn(document, 'addEventListener')
  const docRemove = vi.spyOn(document, 'removeEventListener')
  const wrapper = mount(NvScreenSelect, {
    props: { options: [{ label: '河岸', value: 0 }] },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  const trigger = wrapper.get('button')
  ;(trigger.element as HTMLElement).focus()
  for (const key of ['Escape', 'Tab']) {
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown', { key })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
  }
  await trigger.trigger('click')
  const outside = document.createElement('button')
  document.body.append(outside)
  outside.focus()
  outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
  await nextTick()
  expect(trigger.attributes('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(outside)
  await trigger.trigger('click')
  await wrapper.setProps({ disabled: true })
  expect(document.querySelector('[role="listbox"]')).toBeNull()
  await trigger.trigger('keydown', { key: 'Enter' })
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ disabled: false })
  await trigger.trigger('click')
  wrapper.unmount()
  wrappers.pop()
  expect(document.querySelector('[role="listbox"]')).toBeNull()
  for (const [event, callback, options] of add.mock.calls.filter(([event]) =>
    ['scroll', 'resize'].includes(event),
  )) {
    expect(
      remove.mock.calls.some(
        (call) => call[0] === event && call[1] === callback && call[2] === options,
      ),
    ).toBe(true)
  }
  for (const [event, callback, options] of docAdd.mock.calls.filter(
    ([event]) => event === 'pointerdown',
  )) {
    expect(
      docRemove.mock.calls.some(
        (call) => call[0] === event && call[1] === callback && call[2] === options,
      ),
    ).toBe(true)
  }
  window.dispatchEvent(new Event('resize'))
  expect(document.querySelector('[role="listbox"]')).toBeNull()
})

it.each([
  { name: 'tabs', component: NvScreenTabs, prop: 'items', role: 'tab', checked: 'aria-selected' },
  {
    name: 'segmented',
    component: NvScreenSegmented,
    prop: 'options',
    role: 'radio',
    checked: 'aria-checked',
  },
])(
  '$name keeps selection and focus together through arrow click reorder removal and recovery',
  async ({ component, prop, role, checked }) => {
    const options = ref([
      { label: '短', value: 0 as string | number },
      { label: '河岸展览与阅读空间', value: '0' },
      { label: '夜读', value: 'night' },
    ])
    const value = ref<string | number | undefined>(0)
    const disabled = ref(false)
    const updates = vi.fn((next: string | number | undefined) => {
      value.value = next
    })
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(component as Component, {
            [prop]: options.value,
            modelValue: value.value,
            disabled: disabled.value,
            'onUpdate:modelValue': updates,
          }),
      ),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    const buttons = () => wrapper.findAll(`[role="${role}"]`)
    ;(buttons()[0]!.element as HTMLElement).focus()
    await buttons()[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('0')
    expect(document.activeElement).toBe(buttons()[1]!.element)
    expect(buttons()[1]!.attributes(checked)).toBe('true')
    options.value = [options.value[1]!, options.value[2]!, options.value[0]!]
    await nextTick()
    await nextTick()
    await buttons()[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('night')
    expect(document.activeElement).toBe(buttons()[1]!.element)
    await buttons()[2]!.trigger('click')
    expect(value.value).toBe(0)
    expect(document.activeElement).toBe(buttons()[2]!.element)
    options.value = [{ label: '仍然开放', value: 'night' }]
    await nextTick()
    await nextTick()
    expect(value.value).toBe(0)
    expect(buttons()[0]!.attributes('tabindex')).toBe('0')
    expect(buttons()[0]!.attributes(checked)).toBe('false')
    expect(document.activeElement).toBe(buttons()[0]!.element)
    options.value = []
    await nextTick()
    expect(buttons()).toHaveLength(0)
    options.value = [{ label: '零号新名', value: 0 }]
    await nextTick()
    await nextTick()
    expect(buttons()[0]!.attributes(checked)).toBe('true')
    disabled.value = true
    await nextTick()
    await buttons()[0]!.trigger('keydown', { key: 'ArrowRight' })
    await buttons()[0]!.trigger('click')
    expect(buttons()[0]!.attributes('disabled')).toBeDefined()
    expect(updates.mock.calls.map(([entry]) => entry)).toEqual(['0', 'night', 0])
  },
)

it('switch ignores disabled key and click and accepts one native activation per key click sequence', async () => {
  const wrapper = mount(NvScreenSwitch, { props: { disabled: true, modelValue: false } })
  wrappers.push(wrapper)
  for (const key of [' ', 'Enter'])
    wrapper
      .get('button')
      .element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await nextTick()
  await wrapper.get('button').trigger('click')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  await wrapper.setProps({ disabled: false })
  for (const key of [' ', 'Enter']) {
    // jsdom does not synthesize native keyboard click: provide that public DOM boundary.
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    wrapper.get('button').element.dispatchEvent(event)
    if (!event.defaultPrevented) (wrapper.get('button').element as HTMLButtonElement).click()
    await nextTick()
  }
  expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
})

it('button preserves slot variant size native form type and disabled action boundary', async () => {
  const action = vi.fn()
  const wrapper = mount(NvScreenButton, {
    props: { type: 'submit', variant: 'secondary', size: 'sm', disabled: true },
    attrs: { onClick: action },
    slots: { default: '保存安排' },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('button').attributes('type')).toBe('submit')
  expect(wrapper.text()).toBe('保存安排')
  expect(wrapper.get('button').classes()).toContain('secondary')
  expect(wrapper.get('button').classes()).toContain('sm')
  ;(wrapper.get('button').element as HTMLButtonElement).click()
  expect(action).not.toHaveBeenCalled()
  await wrapper.setProps({ disabled: false })
  ;(wrapper.get('button').element as HTMLButtonElement).click()
  expect(action).toHaveBeenCalledTimes(1)
})

it('input exposes string model suffix error and native disabled state without coercing zero', async () => {
  const value = ref('0')
  const wrapper = mount(
    defineComponent(
      () => () =>
        h(NvScreenInput, {
          modelValue: value.value,
          'onUpdate:modelValue': (next: string) => {
            value.value = next
          },
          suffix: '人',
          error: true,
          ariaLabel: '来访人数',
        }),
    ),
  )
  wrappers.push(wrapper)
  expect(wrapper.text()).toBe('人')
  expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  expect(wrapper.get('input').element.value).toBe('0')
  await wrapper.get('input').setValue('12')
  expect(value.value).toBe('12')
  const disabled = mount(NvScreenInput, { props: { modelValue: '0', disabled: true } })
  wrappers.push(disabled)
  expect(disabled.get('input').attributes('disabled')).toBeDefined()
  expect(disabled.get('input').element.value).toBe('0')
})

it('segmented remeasures changed labels and resize and hides stale thumb when selected option disappears', async () => {
  let width = 120
  const callbacks: ResizeObserverCallback[] = []
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback)
      }
      observe() {}
      disconnect = disconnect
    },
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.getAttribute('role') === 'radio' ? width : 400
    },
  )
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockReturnValue(72)
  const wrapper = mount(NvScreenSegmented, {
    props: {
      options: [
        { label: '短', value: 0 },
        { label: '阅读空间', value: 'read' },
      ],
      modelValue: 'read',
    },
  })
  wrappers.push(wrapper)
  await nextTick()
  await flushPromises()
  const thumb = wrapper.get('.nv-scr-sg-thumb')
  expect(thumb.attributes('style')).toContain('width: 120px')
  width = 220
  await wrapper.setProps({
    options: [
      { label: '短', value: 0 },
      { label: '河岸展览与阅读空间', value: 'read' },
    ],
  })
  await flushPromises()
  expect(thumb.attributes('style')).toContain('width: 220px')
  width = 180
  callbacks.forEach((callback) => callback([], {} as ResizeObserver))
  await nextTick()
  expect(thumb.attributes('style')).toContain('width: 180px')
  expect(thumb.attributes('style')).toContain('translateX(72px)')
  await wrapper.setProps({ options: [] })
  await flushPromises()
  expect(thumb.classes()).not.toContain('ready')
  await wrapper.setProps({ options: [{ label: '恢复阅读', value: 'read' }] })
  await flushPromises()
  expect(thumb.classes()).toContain('ready')
  wrapper.unmount()
  wrappers.pop()
  expect(disconnect).toHaveBeenCalled()
  // System metrics/observer only; actual width alignment is verified in browser.
})

it('tabs keeps equal slot ink and hides it for missing or empty selection while preserving defaults', async () => {
  const wrapper = mount(NvScreenTabs, {
    props: {
      items: [
        { label: '短', value: 0 },
        { label: '河岸展览与阅读空间', value: '0' },
        { label: '夜读', value: 'night' },
      ],
      modelValue: '0',
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('.nv-scr-tb-ink').attributes('style')).toContain('width: 33.333333333333336%')
  expect(wrapper.get('.nv-scr-tb-ink').attributes('style')).toContain('translateX(100%)')
  await wrapper.setProps({ items: [{ label: '夜读', value: 'night' }] })
  expect(wrapper.find('.nv-scr-tb-ink').exists()).toBe(false)
  await wrapper.setProps({ items: [] })
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)
  const tabs = mount(NvScreenTabs)
  const segmented = mount(NvScreenSegmented)
  const search = mount(NvScreenSearch)
  const select = mount(NvScreenSelect)
  wrappers.push(tabs, segmented, search, select)
  expect(tabs.get('[aria-selected="true"]').text()).toBe('产量趋势')
  expect(segmented.get('[aria-checked="true"]').text()).toBe('今日')
  expect(search.get('input').attributes('placeholder')).toBe('搜索工单号 / 产线 / 设备')
  expect(select.get('button').text()).toContain('请选择产线')
})

it('select cancels pending placement before unmount without creating a late observer', async () => {
  const construct = vi.fn()
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor() {
        construct()
      }
      observe() {}
      disconnect = disconnect
    },
  )
  const wrapper = mount(NvScreenSelect, { attachTo: document.body })
  ;(wrapper.get('button').element as HTMLButtonElement).click()
  await nextTick()
  wrapper.unmount()
  await flushPromises()
  expect(document.querySelector('[role="listbox"]')).toBeNull()
  expect(construct).not.toHaveBeenCalled()
})

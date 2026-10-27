import { Comment, defineComponent, Fragment, h } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { NvTouchButton } from '@nerv-iip/ui'

// Match VTU trigger's Vue timestamp workaround for manually inspected events.
function dispatchVueEvent(element: Element, event: Event) {
  ;(event as Event & { _vts: number })._vts = Date.now() + 1
  return element.dispatchEvent(event)
}

it('blocks native activation while loading and resumes when ready', async () => {
  const onClick = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { loading: true },
    attrs: { onClick },
    slots: { default: '继续阅读', leading: '<span>→</span>' },
  })
  const button = wrapper.get('button')
  expect(button.attributes('aria-busy')).toBe('true')
  expect(button.element.disabled).toBe(true)
  button.element.click()
  expect(onClick).not.toHaveBeenCalled()
  expect(wrapper.text()).not.toContain('→')
  await wrapper.setProps({ loading: false })
  expect(button.element.disabled).toBe(false)
  expect(button.attributes('aria-busy')).toBeUndefined()
  expect(wrapper.text()).toContain('→')
  button.element.click()
  expect(onClick).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})

it('prevents loading link activation when rendering as an anchor', async () => {
  const onClick = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { as: 'a', loading: true },
    attrs: { onClick, href: '#reading' },
    slots: { default: '阅读' },
  })
  const link = wrapper.get('a')
  expect(link.attributes('aria-disabled')).toBe('true')
  link.element.click()
  expect(onClick).not.toHaveBeenCalled()
  await wrapper.setProps({ loading: false })
  link.element.click()
  expect(onClick).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})

it('keeps explicit disabled state after loading finishes', async () => {
  const onClick = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { loading: true, disabled: true },
    attrs: { onClick },
    slots: { default: '稍后' },
  })
  await wrapper.setProps({ loading: false })
  const button = wrapper.get('button')
  expect(button.element.disabled).toBe(true)
  button.element.click()
  expect(onClick).not.toHaveBeenCalled()
  wrapper.unmount()
})

it.each(['default', 'brand', 'success', 'warning', 'destructive', 'outline', 'ghost'] as const)(
  'activates and renders the leading slot for variant %s',
  async (variant) => {
    const onClick = vi.fn()
    const wrapper = mount(NvTouchButton, {
      props: { variant },
      attrs: { onClick },
      slots: { leading: '<span aria-hidden="true">→</span>', default: '阅读' },
    })
    expect(wrapper.text()).toBe('→阅读')
    await wrapper.get('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  },
)

it('forwards a link destination when rendering as a child', () => {
  const wrapper = mount(NvTouchButton, {
    props: { asChild: true },
    slots: { default: '<a href="#touch-actions">操作示例</a>' },
  })
  expect(wrapper.get('a').attributes('href')).toBe('#touch-actions')
  expect(wrapper.get('a').text()).toBe('操作示例')
  expect(wrapper.find('button').exists()).toBe(false)
  wrapper.unmount()
})

it.each(['a', 'button'] as const)(
  'keeps loading feedback and activation on the asChild %s host',
  async (tag) => {
    const onParentClick = vi.fn()
    const onChildClick = vi.fn()
    const wrapper = mount(NvTouchButton, {
      props: { asChild: true, loading: true },
      attrs: { onClick: onParentClick, id: 'actual-action' },
      slots: {
        leading: () => h('span', { 'data-leading': '' }, '→'),
        default: () =>
          h(tag, { href: tag === 'a' ? '#reading' : undefined, onClick: onChildClick }, '阅读'),
      },
    })
    const host = wrapper.get(tag)
    expect(host.attributes('aria-busy')).toBe('true')
    expect(host.attributes('aria-disabled')).toBe('true')
    expect(host.attributes('id')).toBe('actual-action')
    expect(host.find('[role="status"]').exists()).toBe(true)
    expect(host.text()).toContain('阅读')
    expect(host.find('[data-leading]').exists()).toBe(false)
    const blocked = new MouseEvent('click', { bubbles: true, cancelable: true })
    dispatchVueEvent(host.element, blocked)
    expect(blocked.defaultPrevented).toBe(true)
    expect(onParentClick).not.toHaveBeenCalled()
    expect(onChildClick).not.toHaveBeenCalled()
    await wrapper.setProps({ loading: false })
    expect(host.element).toBe(wrapper.get(tag).element)
    expect(host.attributes('aria-busy')).toBeUndefined()
    expect(host.find('[role="status"]').exists()).toBe(false)
    expect(host.get('[data-leading]').text()).toBe('→')
    if (tag === 'a') expect(host.attributes('href')).toBe('#reading')
    if (tag === 'button') expect((host.element as HTMLButtonElement).disabled).toBe(false)
    await host.trigger('click')
    expect(onParentClick).toHaveBeenCalledTimes(1)
    expect(onChildClick).toHaveBeenCalledTimes(1)
    await wrapper.setProps({ loading: true, disabled: true })
    await wrapper.setProps({ loading: false })
    expect(host.attributes('aria-disabled')).toBe('true')
    await host.trigger('click')
    expect(onChildClick).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  },
)

it('preserves a component child slots and capture handlers through loading recovery', async () => {
  const captured = vi.fn()
  const ChildLink = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h('a', { ...attrs, href: '#details' }, [slots.default?.(), slots.extra?.()])
    },
  })
  const wrapper = mount(NvTouchButton, {
    props: { asChild: true, loading: true },
    slots: {
      leading: () => h('span', { 'data-leading': '' }, '→'),
      default: () =>
        h(Fragment, [
          h(Comment),
          h(
            ChildLink,
            { onClickCapture: captured, class: 'caller-link' },
            {
              default: () => h('strong', '阅读'),
              extra: () => h('small', '详情'),
            },
          ),
        ]),
    },
  })
  const link = wrapper.get('a')
  expect(link.attributes('href')).toBe('#details')
  expect(link.classes()).toContain('caller-link')
  expect(link.get('strong').text()).toBe('阅读')
  expect(link.get('small').text()).toBe('详情')
  expect(link.findAll('[role="status"]')).toHaveLength(1)
  await link.trigger('click')
  expect(captured).not.toHaveBeenCalled()
  await wrapper.setProps({ loading: false })
  expect(link.get('[data-leading]').text()).toBe('→')
  expect(link.find('[role="status"]').exists()).toBe(false)
  await link.trigger('click')
  expect(captured).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})

it('blocks child activation keys while loading but preserves Tab and restores keyboard handlers', async () => {
  const onKey = vi.fn()
  const wrapper = mount(NvTouchButton, {
    props: { asChild: true, loading: true },
    slots: { default: () => h('a', { href: '#read', onKeydown: onKey, onKeyup: onKey }, '阅读') },
  })
  const link = wrapper.get('a')
  for (const type of ['keydown', 'keyup']) {
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true })
      dispatchVueEvent(link.element, event)
      expect(event.defaultPrevented).toBe(true)
    }
  }
  expect(onKey).not.toHaveBeenCalled()
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
  dispatchVueEvent(link.element, tab)
  expect(tab.defaultPrevented).toBe(false)
  expect(onKey).toHaveBeenCalledTimes(1)
  await wrapper.setProps({ loading: false })
  dispatchVueEvent(
    link.element,
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
  )
  expect(onKey).toHaveBeenCalledTimes(2)
  wrapper.unmount()
})

it('updates compiled asChild content without retaining the loader or losing the label', async () => {
  const wrapper = mount(NvTouchButton, {
    props: { asChild: true, loading: true },
    slots: {
      default: '<a href="#compiled"><span>阅读</span></a>',
      leading: '<span data-leading>→</span>',
    },
  })
  expect(wrapper.get('a').find('[role="status"]').exists()).toBe(true)
  await wrapper.setProps({ loading: false })
  expect(wrapper.get('a').text()).toBe('→阅读')
  expect(wrapper.get('a').attributes('href')).toBe('#compiled')
  expect(wrapper.find('[role="status"]').exists()).toBe(false)
  wrapper.unmount()
})

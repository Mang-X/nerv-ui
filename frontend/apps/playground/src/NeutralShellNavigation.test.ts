import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { expect, it } from 'vitest'
import { SidebarProvider, useSidebar } from '@nerv-iip/ui'
import NeutralShellNavigation from './NeutralShellNavigation.vue'

function fixture() {
  const Content = defineComponent({
    setup() {
      const { openMobile, setOpenMobile } = useSidebar()
      setOpenMobile(true)
      return () =>
        h('div', { onClickCapture: (event: MouseEvent) => event.preventDefault() }, [
          h(
            NeutralShellNavigation,
            {},
            { default: () => h('a', { href: '#destination' }, '目标空间') },
          ),
          h('p', { 'data-mobile-state': '' }, openMobile.value ? 'open' : 'closed'),
        ])
    },
  })
  return mount(SidebarProvider, { slots: { default: () => h(Content) } })
}

it('closes mobile navigation after a router handles the link default action', async () => {
  const wrapper = fixture()
  try {
    expect(wrapper.get('[data-mobile-state]').text()).toBe('open')
    await wrapper.get('a').trigger('click', { button: 0 })
    expect(wrapper.get('[data-mobile-state]').text()).toBe('closed')
    expect(wrapper.get('a').attributes('href')).toBe('#destination')
  } finally {
    wrapper.unmount()
  }
})

it('keeps mobile navigation open for modified link activation', async () => {
  const wrapper = fixture()
  try {
    await wrapper.get('a').trigger('click', { button: 0, ctrlKey: true })
    expect(wrapper.get('[data-mobile-state]').text()).toBe('open')
  } finally {
    wrapper.unmount()
  }
})

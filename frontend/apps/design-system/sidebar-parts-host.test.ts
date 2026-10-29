// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/SidebarPartsExample.vue'
let host: VueWrapper
afterEach(() => host?.unmount())
it('renders both skeleton shapes without navigation and switches to local actions', async () => {
  host = mount(Example)
  const button = (text: string) => host.findAll('button').find((b) => b.text() === text)!
  expect(host.get('[data-sidebar="group-content"]').exists()).toBe(true)
  expect(host.findAll('[data-sidebar="menu-skeleton"]')).toHaveLength(2)
  expect(host.findAll('[data-sidebar="menu-skeleton-icon"]')).toHaveLength(2)
  expect(
    host.find('[data-sidebar="menu-skeleton"] button, [data-sidebar="menu-skeleton"] a').exists(),
  ).toBe(false)
  await button('显示图标').trigger('click')
  expect(host.findAll('[data-sidebar="menu-skeleton-icon"]')).toHaveLength(0)
  await button('显示本页菜单').trigger('click')
  expect(host.findAll('[data-sidebar="menu-skeleton"]')).toHaveLength(0)
  await button('阅读记录').trigger('click')
  expect(host.get('[role="status"]').text()).toContain('当前菜单：阅读记录')
  expect(button('阅读记录').attributes('aria-pressed')).toBe('true')
  await button('显示等待状态').trigger('click')
  expect(host.get('[role="status"]').text()).toContain('正在等待菜单内容')
  expect(host.findAll('[data-sidebar="menu-skeleton"]')).toHaveLength(2)
  await button('显示图标').trigger('click')
  expect(host.findAll('[data-sidebar="menu-skeleton-icon"]')).toHaveLength(2)
  await button('显示本页菜单').trigger('click')
  expect(host.get('[role="status"]').text()).toContain('当前菜单：阅读记录')
})

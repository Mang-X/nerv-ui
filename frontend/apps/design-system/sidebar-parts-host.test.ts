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

import BaseExample from './docs/.vitepress/examples/BaseSidebarExample.vue'
import { nextTick } from 'vue'
import { vi } from 'vitest'
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))
}
// Simulated media conditions, not real resize or CSS layout evidence.
for (const mobile of [false, true]) {
  it(`base Sidebar ${mobile ? 'mobile Sheet' : 'desktop icon'} and none preserve current menu`, async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: mobile && query === '(max-width: 768px)',
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }))
    host = mount(BaseExample, { attachTo: document.body })
    const click = async (label: string) => {
      const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find(
        (node) => node.textContent?.trim() === label || node.getAttribute('aria-label') === label,
      )!
      expect(button).toBeTruthy()
      button.click()
      await settle()
    }
    await settle()
    await click('固定侧栏')
    expect(host.find('[data-slot="sidebar-gap"]').exists()).toBe(false)
    expect(host.find('[data-slot="sidebar"]').exists()).toBe(true)
    await click('阅读记录')
    expect(host.get('[role="status"]').text()).toContain('阅读记录')
    await click('可折叠侧栏')
    if (mobile) {
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      await click('切换阅读导航')
      expect(document.querySelector('[role="dialog"] [data-sidebar="menu"]')).not.toBeNull()
      expect(document.querySelector('[data-mobile="true"]')).not.toBeNull()
      await click('随手收藏')
      expect(host.get('[role="status"]').text()).toContain('随手收藏')
      await click('关闭阅读导航')
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      await click('切换阅读导航')
      expect(document.querySelector('[role="dialog"]')).not.toBeNull()
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
      await settle()
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    } else {
      expect(host.get('[data-slot="sidebar"]').attributes('data-state')).toBe('expanded')
      await click('切换阅读导航')
      expect(host.get('[data-slot="sidebar"]').attributes('data-collapsible')).toBe('icon')
      await click('切换阅读导航')
      expect(host.get('[data-slot="sidebar"]').attributes('data-state')).toBe('expanded')
    }
    host.unmount()
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })
}

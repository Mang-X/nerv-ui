import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import NeutralShell from './NeutralShell.vue'
const items = [
  { key: 'a', label: '诗歌角' },
  { key: 'b', label: '绘本间' },
]
const props = {
  title: '晨光书房',
  items,
  currentKey: 'a',
  user: { key: 'lin', name: '林悦' },
  layout: 'top' as const,
}
describe('Neutral shell host adapter', () => {
  it('keeps controlled selection and current identities after replacement and reorder', async () => {
    const w = mount(NeutralShell, { props })
    await w.get('[data-nav=b]').trigger('click')
    expect(w.emitted('navigate')).toEqual([['b']])
    expect(w.get('[data-nav=a]').attributes('aria-current')).toBe('page')
    await w.setProps({
      items: [
        { key: 'b', label: '新画室' },
        { key: 'a', label: '阅读角' },
      ],
      currentKey: 'b',
      user: { key: 'zhou', name: '周宁' },
    })
    expect(w.get('[data-nav=b]').text()).toBe('新画室')
    expect(w.get('[data-nav=b]').attributes('aria-current')).toBe('page')
    w.unmount()
  })
  for (const modifier of ['metaKey', 'ctrlKey'])
    it(`${modifier} K fires once across two instances and cleans up repeated mounts`, async () => {
      const a = mount(NeutralShell, { props, attachTo: document.body })
      const b = mount(NeutralShell, { props, attachTo: document.body })
      const focusTarget = b.get('[data-nav=b]').element as HTMLElement
      focusTarget.focus()
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', [modifier]: true, cancelable: true }),
      )
      expect(a.emitted('openSearch')).toBeUndefined()
      expect(b.emitted('openSearch')).toHaveLength(1)
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', [modifier]: true, repeat: true }),
      )
      expect(b.emitted('openSearch')).toHaveLength(1)
      b.unmount()
      a.unmount()
      const c = mount(NeutralShell, { props, attachTo: document.body })
      const target = c.get('[data-nav=a]').element as HTMLElement
      target.focus()
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'K', [modifier]: true, cancelable: true }),
      )
      expect(c.emitted('openSearch')).toHaveLength(1)
      const events = c.emitted('openSearch')!
      c.unmount()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', [modifier]: true }))
      expect(events).toHaveLength(1)
    })
})

describe('Neutral shell public menus', () => {
  it('selects the current overflow destination', async () => {
    const w = mount(NeutralShell, { props, attachTo: document.body })
    const more = w.findAll('button').find((button) => button.text() === '更多空间')!
    await more.trigger('keydown', { key: 'Enter' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    const destination = Array.from(document.querySelectorAll('[role=menuitem]')).find((el) =>
      el.textContent?.includes('绘本间'),
    ) as HTMLElement
    destination.click()
    expect(w.emitted('navigate')).toEqual([['b']])
    await new Promise((resolve) => setTimeout(resolve, 0))
    w.unmount()
  })
  it('opens user actions with the replaced identity and preserves slots', async () => {
    const w = mount(NeutralShell, {
      props,
      attachTo: document.body,
      slots: { header: '<span>今日安排</span>', 'user-menu-items': '<div>个人安排</div>' },
    })
    await w.setProps({ user: { key: 'zhou', name: '周宁的很长的完整用户名称' } })
    const trigger = w.get('[aria-label="周宁的很长的完整用户名称的用户菜单"]')
    await trigger.trigger('keydown', { key: 'Enter' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    const menu = document.querySelector('[role=menu]')
    expect(menu?.textContent).toContain('个人安排')
    const exit = Array.from(document.querySelectorAll('[role=menuitem]')).find((el) =>
      el.textContent?.includes('退出当前用户'),
    ) as HTMLElement
    exit.click()
    expect(w.emitted('signOut')).toEqual([['zhou']])
    expect(w.text()).toContain('今日安排')
    w.unmount()
  })
})

it('toggles the existing sidebar and keeps recent and starred actions', async () => {
  const w = mount(NeutralShell, { props: { ...props, recent: [items[0]], starred: [items[1]] } })
  const sidebar = w.get('[data-slot=nv-sidebar]')
  const before = sidebar.attributes('data-state')
  await w.get('[data-slot=nv-sidebar-trigger]').trigger('click')
  expect(sidebar.attributes('data-state')).not.toBe(before)
  await w.get('[data-slot=nv-sidebar-trigger]').trigger('click')
  expect(sidebar.attributes('data-state')).toBe(before)
  await w.get('nav[aria-label="星标"] button').trigger('click')
  await w.get('nav[aria-label="最近访问"] button').trigger('click')
  expect(w.emitted('navigate')).toEqual([['b'], ['a']])
  w.unmount()
})

it('measures zero through all domains on resize and label replacement and disconnects', async () => {
  let width = 90
  let resize = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      callback: () => void
      constructor(callback: () => void) {
        this.callback = callback
      }
      observe(el: HTMLElement) {
        if (el.tagName === 'NAV') resize = this.callback
      }
      disconnect = disconnect
    },
  )
  const client = vi
    .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
    .mockImplementation(function (this: HTMLElement) {
      return width
    })
  const offset = vi
    .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
    .mockImplementation(function (this: HTMLElement) {
      return this.textContent?.includes('很长') ? 300 : 80
    })
  const w = mount(NeutralShell, {
    props: { ...props, topDomains: items, currentDomainKey: 'b' },
    attachTo: document.body,
  })
  const tabs = () => w.findAll('[data-domain]')
  expect(tabs()).toHaveLength(0)
  expect(w.get('[data-overflow]').attributes('data-active')).toBe('true')
  await w.get('[data-overflow]').trigger('keydown', { key: 'Enter' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  ;(
    Array.from(document.querySelectorAll('[role=menuitem]')).find(
      (el) => el.textContent?.trim() === '绘本间',
    ) as HTMLElement
  ).click()
  expect(w.emitted('selectDomain')).toEqual([['b']])
  width = 170
  resize()
  await w.vm.$nextTick()
  expect(tabs()).toHaveLength(2)
  await w.setProps({ topDomains: [...items, { key: 'c', label: '花园' }] })
  expect(tabs()).toHaveLength(1)
  expect(w.get('[data-overflow]').attributes('data-active')).toBe('true')
  await w.setProps({ topDomains: [{ key: 'b', label: '很长的绘本间' }, items[0]] })
  expect(tabs()).toHaveLength(0)
  width = 500
  resize()
  await w.vm.$nextTick()
  expect(tabs().map((tab) => tab.attributes('data-domain'))).toEqual(['b', 'a'])
  w.unmount()
  expect(disconnect).toHaveBeenCalled()
  client.mockRestore()
  offset.mockRestore()
  vi.unstubAllGlobals()
})

it('keeps domain and page identities controlled and parent folds stable after replacement', async () => {
  const groups = [{ key: 'books', label: '书架', children: items }]
  const w = mount(NeutralShell, {
    props: { ...props, topDomains: items, currentDomainKey: 'a', items: groups, currentKey: 'b' },
  })
  expect(w.get('[data-parent=books]').attributes('data-active')).toBe('true')
  await w.get('[data-parent=books]').trigger('click')
  expect(w.find('[data-nav=b]').exists()).toBe(false)
  await w.setProps({ items: [{ ...groups[0], label: '新书架', children: [...items].reverse() }] })
  expect(w.get('[data-parent=books]').attributes('aria-expanded')).toBe('false')
  await w.get('[data-parent=books]').trigger('click')
  await w.get('[data-nav=a]').trigger('click')
  expect(w.emitted('navigate')).toEqual([['a']])
  expect(w.get('[data-nav=b]').attributes('aria-current')).toBe('page')
  await w.setProps({
    currentDomainKey: 'b',
    items: [{ key: 'c', label: '画室' }],
    currentKey: 'c',
    topDomains: [items[1]],
  })
  expect(w.find('[data-nav=b]').exists()).toBe(false)
  expect(w.get('[data-nav=c]').attributes('aria-current')).toBe('page')
  w.unmount()
})

it('replaces every shell copy channel including menu actions and navigation labels', async () => {
  const w = mount(NeutralShell, {
    props: {
      ...props,
      logo: '花',
      searchLabel: '寻找',
      moreLabel: '其余',
      signOutLabel: '告别',
      navLabel: '页签',
      domainsLabel: '花园',
      starredLabel: '收藏',
      recentLabel: '足迹',
      userMenuLabel: '我的选项',
      recent: items,
      starred: items,
    },
    attachTo: document.body,
  })
  expect(w.get('[aria-label=寻找]').text()).toBe('寻找')
  for (const label of ['页签', '花园', '收藏', '足迹'])
    expect(w.find(`nav[aria-label="${label}"]`).exists()).toBe(true)
  expect(w.text()).toContain('花')
  expect(w.get('[data-overflow]').text()).toBe('其余')
  await w.get('[aria-label="我的选项"]').trigger('keydown', { key: 'Enter' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  const exit = Array.from(document.querySelectorAll('[role=menuitem]')).find(
    (el) => el.textContent?.trim() === '告别',
  ) as HTMLElement
  expect(exit).toBeTruthy()
  exit.click()
  expect(w.emitted('signOut')).toEqual([['lin']])
  w.unmount()
})

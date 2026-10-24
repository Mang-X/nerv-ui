import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import MobileListDemo from './MobileListDemo.vue'
let wrapper: VueWrapper
async function click(text: string) {
  const button = wrapper.findAll('button').find((b) => b.text() === text)
  expect(button, text).toBeDefined()
  await button!.trigger('click')
}
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
  localStorage.clear()
})
it('reports the selected swipe action identity and closes the row', async () => {
  wrapper = mount(MobileListDemo)
  await click('收进书签')
  expect(wrapper.get('[aria-label="滑动动作回显"]').text()).toBe('湖畔来信 · bookmark')
  expect(wrapper.get('.nv-m-swipe-content').attributes('style')).toContain('translateX(0px)')
  await click('暂时收起')
  expect(wrapper.get('[aria-label="滑动动作回显"]').text()).toBe('湖畔来信 · archive')
})

it('finishes or recovers a failed refresh and ignores another pull while loading', async () => {
  vi.useFakeTimers()
  wrapper = mount(MobileListDemo)
  async function pull() {
    const el = wrapper.get('.nv-m-pr-inner').element
    el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientY: 10, buttons: 1 }))
    el.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientY: 260, buttons: 1 }))
    el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(0)
  }
  await pull()
  expect(wrapper.get('[aria-label="刷新状态"]').text()).toBe('刷新中 · 请求 1 次')
  await pull()
  expect(wrapper.get('[aria-label="刷新状态"]').text()).toBe('刷新中 · 请求 1 次')
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.get('[aria-label="刷新状态"]').text()).toBe('已更新 · 请求 1 次')
  expect(wrapper.get('[data-refresh-row]').text()).toContain('第 1 次来信')
  await wrapper.get('input[aria-label="下次刷新失败"]').setValue(true)
  await pull()
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.get('[aria-label="刷新状态"]').text()).toBe('刷新失败，请重新下拉 · 请求 2 次')
  expect(wrapper.get('[data-refresh-row]').text()).toContain('第 1 次来信')
  expect(wrapper.get('.nv-m-pr-inner').attributes('style')).toContain('translateY(0px)')
  await pull()
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.get('[aria-label="刷新状态"]').text()).toBe('已更新 · 请求 3 次')
})

it('loads one page at a time, pauses after failure, retries and stops at the end', async () => {
  vi.useFakeTimers()
  wrapper = mount(MobileListDemo)
  const list = wrapper.get('[data-slot="infinite-list"]')
  Object.defineProperties(list.element, {
    scrollHeight: { configurable: true, value: 600 },
    clientHeight: { configurable: true, value: 256 },
  })
  ;(list.element as HTMLElement).scrollTop = 344
  await wrapper.get('input[aria-label="下次加载失败"]').setValue(true)
  await list.trigger('scroll')
  await list.trigger('scroll')
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('加载中 · 8 封 · 请求 1 次')
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('加载失败 · 8 封 · 请求 1 次')
  await list.trigger('scroll')
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('请求 1 次')
  await click('重试加载')
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.findAll('[data-page-row]')).toHaveLength(16)
  await list.trigger('scroll')
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('全部读完 · 24 封 · 请求 3 次')
  expect(list.text()).toContain('没有更多来信')
  await list.trigger('scroll')
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('请求 3 次')
})

it('renders a finite virtual window, selects the item identity and reflects host reordering and empty data', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(240)
  wrapper = mount(MobileListDemo)
  await vi.waitFor(() => expect(wrapper.findAll('[data-window-row]')).toHaveLength(9))
  const list = wrapper.get('[data-slot="virtual-list"]')
  ;(list.element as HTMLElement).scrollTop = 4800
  await list.trigger('scroll')
  expect(wrapper.get('[data-window-row]').text()).toContain('信笺 99')
  await click('信笺 99')
  expect(wrapper.get('[aria-label="信笺回显"]').text()).toBe('已选 letter-99')
  await click('倒序信笺')
  expect(wrapper.get('[data-window-row]').text()).toContain('信笺 902')
  expect(wrapper.get('[aria-label="信笺回显"]').text()).toBe('已选 letter-99')
  await wrapper.get('input[aria-label="隐藏全部信笺"]').setValue(true)
  expect(wrapper.findAll('[data-window-row]')).toHaveLength(0)
  expect(wrapper.text()).toContain('没有信笺，取消勾选可继续翻阅。')
  vi.restoreAllMocks()
})

it('controls the carousel page, keeps end buttons disabled and clears autoplay when the host unmounts', async () => {
  vi.useFakeTimers()
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  wrapper = mount(MobileListDemo)
  const button = (text: string) => wrapper.findAll('button').find((b) => b.text() === text)!
  expect(button('上一页').attributes('disabled')).toBeDefined()
  await click('下一页')
  expect(wrapper.get('[aria-label="轮播状态"]').text()).toContain('第 2 / 3 页')
  expect(wrapper.get('.nv-m-swiper-track').attributes('style')).toContain('translate3d(-300px')
  await click('下一页')
  expect(button('下一页').attributes('disabled')).toBeDefined()
  await wrapper.get('input[aria-label="循环翻页"]').setValue(true)
  await click('下一页')
  expect(wrapper.get('[aria-label="轮播状态"]').text()).toContain('第 1 / 3 页')
  await wrapper.get('input[aria-label="自动翻页"]').setValue(true)
  await vi.advanceTimersByTimeAsync(1600)
  expect(wrapper.get('[aria-label="轮播状态"]').text()).toContain('第 2 / 3 页 · 切换 1 次')
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
  vi.restoreAllMocks()
})

it('shows an empty inbox, loads the first batch and cancels pending pagination on reset', async () => {
  vi.useFakeTimers()
  wrapper = mount(MobileListDemo)
  await click('清空信箱')
  expect(wrapper.findAll('[data-page-row]')).toHaveLength(0)
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('信箱为空 · 0 封')
  await click('加载首批')
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('加载中 · 0 封')
  await vi.advanceTimersByTimeAsync(650)
  expect(wrapper.findAll('[data-page-row]')).toHaveLength(8)
  const list = wrapper.get('[data-slot="infinite-list"]')
  await list.trigger('scroll')
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('加载中')
  await click('重新开始')
  await vi.advanceTimersByTimeAsync(1300)
  expect(wrapper.findAll('[data-page-row]')).toHaveLength(8)
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('可以继续')
})

it('clears pending refresh and pagination timers when the page is removed', async () => {
  vi.useFakeTimers()
  wrapper = mount(MobileListDemo)
  await vi.advanceTimersByTimeAsync(0)
  const area = wrapper.get('.nv-m-pr-inner').element
  area.dispatchEvent(new MouseEvent('pointerdown', { clientY: 10, buttons: 1 }))
  area.dispatchEvent(new MouseEvent('pointermove', { clientY: 260, buttons: 1 }))
  area.dispatchEvent(new MouseEvent('pointerup'))
  await wrapper.get('[data-slot="infinite-list"]').trigger('scroll')
  expect(wrapper.get('[aria-label="刷新状态"]').text()).toContain('刷新中')
  expect(wrapper.get('[aria-label="分页状态"]').text()).toContain('加载中')
  expect(vi.getTimerCount()).toBe(2)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
  await vi.advanceTimersByTimeAsync(1300)
})

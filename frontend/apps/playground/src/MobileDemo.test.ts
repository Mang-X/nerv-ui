import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import MobileDemo from './MobileDemo.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  localStorage.clear()
})

it('keeps bottom navigation and content tabs controlled and returns with the public back event', async () => {
  wrapper = mount(MobileDemo, { attachTo: document.body })
  const footer = wrapper.get('[data-shell="footer"]')
  expect(footer.get('[aria-current="page"]').text()).toBe('发现')
  await wrapper.get('[role="tablist"] button:nth-child(2)').trigger('click')
  expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe('小径')
  expect(wrapper.get('[role="tabpanel"]').text()).toContain('林间小径')
  await footer.findAll('button')[1]!.trigger('click')
  expect(footer.get('[aria-current="page"]').text()).toBe('收藏')
  expect(wrapper.get('[aria-label="当前页面"]').text()).toBe('我的收藏')
  await wrapper.get('button[aria-label="返回"]').trigger('click')
  expect(footer.get('[aria-current="page"]').text()).toBe('发现')
  expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe('小径')
})

it('selects cells and list rows, advances steps and receives grid item identity', async () => {
  wrapper = mount(MobileDemo)
  expect(wrapper.get('[role="status"]').text()).toBe('选一个去处，留一点空闲。')
  await wrapper.get('[data-slot="cell"][role="button"]').trigger('keydown', { key: 'Enter' })
  expect(wrapper.get('[role="status"]').text()).toBe('已选择：湖畔书屋')
  await wrapper.get('[role="tablist"] button:nth-child(2)').trigger('click')
  await wrapper.get('[data-row]').trigger('click')
  expect(wrapper.get('[role="status"]').text()).toBe('已选择：林间小径')
  expect(wrapper.get('[aria-label="行程进度"]').text()).toBe('准备 · 1/3')
  await wrapper.get('button[aria-label="下一步"]').trigger('click')
  expect(wrapper.get('[aria-label="行程进度"]').text()).toBe('出发 · 2/3')
  await wrapper.get('button[aria-label="下一步"]').trigger('click')
  expect(wrapper.get('[aria-label="行程进度"]').text()).toBe('抵达 · 3/3')
  expect(wrapper.get<HTMLButtonElement>('button[aria-label="下一步"]').element.disabled).toBe(true)
  await wrapper.get('button[aria-label="重新准备"]').trigger('click')
  expect(wrapper.get('[aria-label="行程进度"]').text()).toBe('准备 · 1/3')
  await wrapper.get('.nv-m-grid button:nth-child(2)').trigger('click')
  expect(wrapper.get('[role="status"]').text()).toBe('快捷入口：步行 · paths · 2')
  expect(wrapper.findAll('[role="separator"]')).toHaveLength(2)
  expect(wrapper.get('[data-slot="cell-group"]').text()).toContain('出行信息')
})

it('receives single and speed-dial FAB events and switches the shared theme', async () => {
  wrapper = mount(MobileDemo, { attachTo: document.body })
  await wrapper.get('button[aria-label="记一笔"]').trigger('click')
  expect(wrapper.get('[role="status"]').text()).toBe('已记下第 1 笔心情')
  await wrapper.get('button[aria-label="记一笔"]').trigger('click')
  expect(wrapper.get('[role="status"]').text()).toBe('已记下第 2 笔心情')
  const more = wrapper.get('button[aria-label="更多随行操作"]')
  await more.trigger('click')
  expect(more.attributes('aria-expanded')).toBe('true')
  const action = wrapper.findAll('button').find((button) => button.text() === '收好行程')!
  await action.trigger('click')
  expect(wrapper.get('[role="status"]').text()).toBe('随行操作：收好行程 · save · 1')
  expect(more.attributes('aria-expanded')).toBe('false')
  await wrapper.get('button[aria-label="切换明暗"]').trigger('click')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  await wrapper.get('button[aria-label="切换明暗"]').trigger('click')
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

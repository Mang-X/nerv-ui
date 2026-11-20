import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import TouchDemo from './TouchDemo.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  localStorage.clear()
})

it('keeps reading counts and duration in sync with bounded stepper events', async () => {
  wrapper = mount(TouchDemo)
  const books = wrapper.get('[role="group"][aria-label="阅读本数"]')
  expect(wrapper.get('[aria-label="阅读本数回显"]').text()).toBe('2 本')
  for (let i = 0; i < 4; i++) await books.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.get('[aria-label="阅读本数回显"]').text()).toBe('5 本')
  expect(books.get<HTMLButtonElement>('button[aria-label="增加"]').element.disabled).toBe(true)
  for (let i = 0; i < 6; i++) await books.get('button[aria-label="减少"]').trigger('click')
  expect(wrapper.get('[aria-label="阅读本数回显"]').text()).toBe('0 本')
  expect(books.get<HTMLButtonElement>('button[aria-label="减少"]').element.disabled).toBe(true)
  const duration = wrapper.get('[role="group"][aria-label="阅读时长"]')
  await duration.get('button[aria-label="增加"]').trigger('click')
  await duration.get('button[aria-label="增加"]').trigger('click')
  expect(wrapper.get('[aria-label="阅读时长回显"]').text()).toBe('18 分钟')
  await duration.get('button[aria-label="减少"]').trigger('click')
  expect(wrapper.get('[aria-label="阅读时长回显"]').text()).toBe('13 分钟')
})

it('selects a reading mode and resets both controlled steppers', async () => {
  wrapper = mount(TouchDemo)
  const tabs = wrapper.findAll('[role="tab"]')
  expect(tabs.map((tab) => tab.text())).toEqual(['阅读', '聆听', '休息'])
  await tabs[1]!.trigger('click')
  expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  expect(wrapper.get('[role="tabpanel"]').text()).toContain('聆听')
  await wrapper.get('[aria-label="阅读本数"] button[aria-label="增加"]').trigger('click')
  await wrapper.get('button[aria-label="重置阅读设置"]').trigger('click')
  expect(wrapper.get('[aria-label="阅读本数回显"]').text()).toBe('2 本')
  expect(wrapper.get('[aria-label="阅读时长回显"]').text()).toBe('10 分钟')
  expect(tabs[0]!.attributes('aria-selected')).toBe('true')
})

it('shows local loading completion and keeps disabled actions inactive', async () => {
  wrapper = mount(TouchDemo)
  const start = wrapper.get<HTMLButtonElement>('button[aria-label="开始本地体验"]')
  await start.trigger('click')
  expect(start.attributes('aria-busy')).toBe('true')
  expect(start.element.disabled).toBe(true)
  const disabled = wrapper.get<HTMLButtonElement>('button[aria-label="暂不可用"]')
  disabled.element.click()
  expect(wrapper.get('[aria-label="操作回显"]').text()).toBe('本地体验进行中')
  await wrapper.get('button[aria-label="结束本地体验"]').trigger('click')
  expect(start.element.disabled).toBe(false)
  expect(wrapper.get('[aria-label="操作回显"]').text()).toBe('已完成 1 次本地体验')
})

it('updates the station status and exposes the complete tone and button examples', async () => {
  wrapper = mount(TouchDemo)
  expect(wrapper.get('header').text()).toContain('开放中')
  await wrapper.get('select#corner-status').setValue('warning')
  expect(wrapper.get('header').text()).toContain('稍作休息')
  await wrapper.get('input#corner-pulse').setValue(false)
  expect(wrapper.get('label[for="corner-pulse"]').text()).toContain('状态点脉冲')
  expect(wrapper.get('[aria-label="指标语义色"]').text()).toContain('待确认')
  const variants = wrapper.get('[aria-label="按钮语义变体"]').findAll('button')
  expect(variants.map((button) => button.text())).toEqual([
    '默认',
    '品牌',
    '成功',
    '提醒',
    '危险',
    '描边',
    '轻量',
  ])
  await variants[4]!.trigger('click')
  expect(wrapper.get('[aria-label="操作回显"]').text()).toBe('已体验：危险')
  expect(wrapper.get('[aria-label="按钮尺寸"]').text()).toContain('md · 44px')
})

it('changes color mode and accent through the station right slot', async () => {
  wrapper = mount(TouchDemo, { attachTo: document.body })
  const dark = wrapper.get('header button[aria-label="深色模式"]')
  const before = dark.attributes('aria-pressed')
  await dark.trigger('click')
  expect(dark.attributes('aria-pressed')).toBe(before === 'true' ? 'false' : 'true')
  expect(document.documentElement.classList.contains('dark')).toBe(
    dark.attributes('aria-pressed') === 'true',
  )
  const blue = wrapper.get('header button[aria-label="蓝色强调色"]')
  const accentBefore = blue.attributes('aria-pressed')
  await blue.trigger('click')
  expect(blue.attributes('aria-pressed')).toBe(accentBefore === 'true' ? 'false' : 'true')
  expect(localStorage.getItem('nerv-ui-theme')).toBe(
    blue.attributes('aria-pressed') === 'true' ? 'blue' : 'neutral',
  )
})

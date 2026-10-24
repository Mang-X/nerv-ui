import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ScreenDemo from './ScreenDemo.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('changes scale and design dimensions with native host controls outside the stage', async () => {
  vi.stubGlobal('innerWidth', 960)
  vi.stubGlobal('innerHeight', 540)
  wrapper = mount(ScreenDemo)
  await nextTick()
  const stage = () => wrapper!.get('main').element.parentElement as HTMLElement
  expect(stage().style.transform).toBe('scale(0.5, 0.5)')
  await wrapper.get('select[aria-label="缩放方式"]').setValue('width')
  expect(wrapper.get('[role="status"]').text()).toContain('向下滚动')
  await wrapper.get('select[aria-label="设计尺寸"]').setValue('1920x1440')
  expect(stage().style.height).toBe('1440px')
  expect(stage().style.transform).toBe('scale(0.5, 0.5)')
  await wrapper.get('select[aria-label="缩放方式"]').setValue('stretch')
  expect(stage().style.transform).toBe('scale(0.5, 0.375)')
  await wrapper.get('select[aria-label="缩放方式"]').setValue('fit')
  expect(stage().style.transform).toBe('scale(0.375, 0.375)')
  expect(wrapper.get('nav').element.closest('.screen-scaler')).toBeNull()
  expect(wrapper.get('select').element.closest('.screen-scaler')).toBeNull()
})

it('changes visible neutral content through panel, border and tech-frame slots', async () => {
  wrapper = mount(ScreenDemo)
  const button = (text: string) => wrapper!.findAll('button').find((item) => item.text() === text)!
  await button('阅读说明').trigger('click')
  expect(wrapper.text()).toContain('自由入座，轻声交谈')
  await button('切换展厅').trigger('click')
  expect(wrapper.text()).toContain('河畔展厅')
  expect(wrapper.text()).toContain('沿着河岸，读一座城')
  await button('查看今日安排').trigger('click')
  expect(wrapper.get('ol').text()).toContain('14:00 · 河岸影像展 · 河畔展厅')
  await button('点亮留言').trigger('click')
  expect(wrapper.text()).toContain('愿你在这里，找到属于自己的片刻。')
  expect(button('收起留言').attributes('aria-pressed')).toBe('true')
  expect(wrapper.get('input[type="checkbox"]').element).toHaveProperty('checked', true)
  await wrapper.get('input[type="checkbox"]').setValue(false)
  expect(wrapper.get('input[type="checkbox"]').element).toHaveProperty('checked', false)
  // Actual flow/motion CSS and hit testing are browser evidence, not jsdom.
})

it('keeps every schedule entry in a keyboard reachable region across collapse and reopen at 1600 by 900', async () => {
  wrapper = mount(ScreenDemo)
  await wrapper.get('select[aria-label="设计尺寸"]').setValue('1600x900')
  const toggle = wrapper.findAll('button').find((item) => item.text() === '查看今日安排')!
  const entries = [
    '10:30 · 城市阅读会 · 街角书房',
    '14:00 · 河岸影像展 · 河畔展厅',
    '16:00 · 周末分享 · 城市客厅',
  ]
  for (let round = 0; round < 2; round++) {
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('ol').exists()).toBe(false)
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    const region = wrapper.get('[role="region"][aria-label="今日安排内容"]')
    expect(region.attributes('tabindex')).toBe('0')
    expect(region.findAll('li').map((item) => item.text())).toEqual(entries)
    expect(wrapper.text()).toContain('每一次停留，都让空间有了新的意义。')
    expect(wrapper.get('main footer a').attributes('href')).toBe('#desktop')
    await toggle.trigger('click')
  }
  // jsdom proves state/content/focusability only. Browser evidence owns layout and scrolling.
})

it('opens only the completed controls section and unmounts its portal when returning to stage', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/controls' }, attachTo: document.body })
  await nextTick()
  expect(wrapper.get('h1').text()).toBe('寻找城市的一处停留')
  expect(wrapper.get('a[href="#screen/controls"]').attributes('aria-current')).toBe('page')
  await wrapper.get('[role="combobox"]').trigger('click')
  expect(document.querySelector('[role="listbox"]')).not.toBeNull()
  await wrapper.setProps({ section: '#screen/stage' })
  expect(wrapper.get('h1').text()).toBe('城市文化空间')
  expect(document.querySelector('[role="listbox"]')).toBeNull()
  expect(wrapper.find('[role="combobox"]').exists()).toBe(false)
  for (const route of [
    'desktop',
    'touch',
    'mobile',
    'mobile-input',
    'mobile-overlays',
    'mobile-lists',
    'mobile-feedback',
  ]) {
    expect(wrapper.find(`a[href="#${route}"]`).exists()).toBe(true)
  }
})

it('opens the completed indicators deep link and stops its continuous readings before stage or controls', async () => {
  vi.useFakeTimers()
  try {
    wrapper = mount(ScreenDemo, { props: { section: '#screen/indicators' } })
    expect(wrapper.get('h1').text()).toBe('城市空间的每一刻')
    expect(wrapper.get('a[href="#screen/indicators"]').attributes('aria-current')).toBe('page')
    await wrapper
      .findAll('button')
      .find((item) => item.text() === '连续更新')!
      .trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    expect(wrapper.get('[aria-label="读数原文"]').text()).toContain('1,321')
    await wrapper.setProps({ section: '#screen/controls' })
    expect(wrapper.get('h1').text()).toBe('寻找城市的一处停留')
    expect(wrapper.find('[aria-label="读数原文"]').exists()).toBe(false)
    await wrapper.setProps({ section: '#screen/stage' })
    expect(wrapper.get('h1').text()).toBe('城市文化空间')
    expect(vi.getTimerCount()).toBe(0)
    await wrapper.setProps({ section: '#screen/indicators' })
    expect(wrapper.get('[aria-label="读数原文"]').text()).toContain('1,284')
    expect(
      wrapper
        .findAll('button')
        .find((item) => item.text() === '连续更新')!
        .attributes('aria-pressed'),
    ).toBe('false')
  } finally {
    vi.useRealTimers()
  }
})

it('opens data deep link and disposes its polling before old surfaces then returns with fresh source state', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }))
  try {
    wrapper = mount(ScreenDemo, { props: { section: '#screen/data' } })
    expect(wrapper.get('h1').text()).toBe('城市空间的流动消息')
    expect(wrapper.get('a[href="#screen/data"]').attributes('aria-current')).toBe('page')
    await vi.advanceTimersByTimeAsync(4000)
    expect(wrapper.get('[aria-label="reading-a 请求记录"]').text()).toBe('reading-a：2')
    expect(wrapper.get('[aria-label="notices 请求记录"]').text()).toBe('notices：2')
    await wrapper.setProps({ section: '#screen/stage' })
    expect(wrapper.get('h1').text()).toBe('城市文化空间')
    expect(vi.getTimerCount()).toBe(0)
    await wrapper.setProps({ section: '#screen/data' })
    expect(wrapper.get('[aria-label="阅读动态"]').text()).toContain('等待首次数据')
    expect(wrapper.get('[aria-label="reading-a 请求记录"]').text()).toBe('reading-a：0')
    for (const section of ['controls', 'indicators', 'stage'])
      expect(wrapper.find(`a[href="#screen/${section}"]`).exists()).toBe(true)
  } finally {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
  }
})

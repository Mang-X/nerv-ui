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

it('opens the public status hero deep link and leaves no display after returning to the stage', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/status-hero' } })
  expect(wrapper.get('a[href="#screen/status-hero"]').attributes('aria-current')).toBe('page')
  const settings = wrapper.get('[role="group"][aria-label="舞台设置"]')
  expect(settings.get('select[aria-label="缩放方式"]').element.tagName).toBe('SELECT')
  expect(wrapper.get('[role="region"][aria-label="现场主状态灯舞台"]').element).toHaveProperty(
    'tabIndex',
    0,
  )
  const actions = wrapper.get('[role="group"][aria-label="现场来源与状态"]')
  expect(actions.get('button[name="source-gallery"]').text()).toBe('城市文化空间')
  expect(actions.get('button[name="status-alarm"]').text()).toBe('紧急')
  expect(wrapper.findAll('[data-status-hero]')).toHaveLength(2)
  await wrapper.get('button[name="status-alarm"]').trigger('click')
  expect(wrapper.get('[data-primary-hero] .nv-scr-sh').classes()).toContain('nv-scr-sh-fast')
  await wrapper.setProps({ section: '#screen/stage' })
  expect(wrapper.find('[data-status-hero]').exists()).toBe(false)
  expect(wrapper.get('a[href="#screen/status-hero"]').attributes('aria-current')).toBeUndefined()
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

it('opens charts deep link preserves all completed sections and disposes autoplay before returning', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  try {
    wrapper = mount(ScreenDemo, { props: { section: '#screen/charts' } })
    expect(wrapper.get('h1').text()).toBe('内容分布与到访趋势')
    expect(wrapper.get('a[href="#screen/charts"]').attributes('aria-current')).toBe('page')
    await vi.advanceTimersByTimeAsync(1800)
    expect(wrapper.get('.nv-scr-bc-card').text()).toContain('reading/day/p1')
    await wrapper.setProps({ section: '#screen/stage' })
    expect(wrapper.get('h1').text()).toBe('城市文化空间')
    expect(vi.getTimerCount()).toBe(0)
    await wrapper.setProps({ section: '#screen/charts' })
    expect(wrapper.get('[aria-label="数据身份"]').text()).toContain('reading/day/5')
    expect(wrapper.find('.nv-scr-bc-card').exists()).toBe(false)
    for (const section of ['stage', 'controls', 'indicators', 'data'])
      expect(wrapper.find(`a[href="#screen/${section}"]`).exists()).toBe(true)
  } finally {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
  }
})

it('opens tables deep link preserves completed links and resets rows and focus when returning', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/tables' }, attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('城市文化空间 · 清单与事件')
  expect(wrapper.get('a[href="#screen/tables"]').attributes('aria-current')).toBe('page')
  await wrapper.get('[aria-label="下一页"]').trigger('click')
  expect(wrapper.get('[aria-label="清单页读数"]').text()).toContain('collection-019')
  for (const section of ['stage', 'controls', 'indicators', 'data', 'charts']) {
    expect(wrapper.get(`a[href="#screen/${section}"]`).attributes('href')).toBe(
      `#screen/${section}`,
    )
  }
  await wrapper.setProps({ section: '#screen/stage' })
  expect(wrapper.find('[aria-label="清单页读数"]').exists()).toBe(false)
  expect(wrapper.get('h1').text()).toBe('城市文化空间')
  await wrapper.setProps({ section: '#screen/tables' })
  expect(wrapper.get('[aria-label="清单页读数"]').text()).toContain('collection-001')
  expect(document.querySelector('[role="listbox"]')).toBeNull()
})

it('opens the background-only deep link with two isolated copies and unmounts on route change', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/backgrounds' } })
  expect(wrapper.findAll('svg.nv-scr-flow[viewBox="0 0 1440 810"]')).toHaveLength(2)
  expect(wrapper.findAll('svg.nv-scr-iso[viewBox="0 0 1200 760"]')).toHaveLength(2)
  expect(wrapper.findAll('svg.nv-scr-fusion')).toHaveLength(2)
  await wrapper.setProps({ section: '#screen/stage' })
  expect(wrapper.find('svg.nv-scr-flow[viewBox="0 0 1440 810"]').exists()).toBe(false)
  expect(wrapper.find('svg.nv-scr-iso[viewBox="0 0 1200 760"]').exists()).toBe(false)
  expect(wrapper.find('svg.nv-scr-fusion').exists()).toBe(false)
  await wrapper.setProps({ section: '#screen/backgrounds' })
  expect(wrapper.findAll('svg.nv-scr-flow[viewBox="0 0 1440 810"]')).toHaveLength(2)
  expect(wrapper.findAll('svg.nv-scr-iso[viewBox="0 0 1200 760"]')).toHaveLength(2)
  expect(wrapper.text()).not.toMatch(/T08|R02|来源|第二实例|示例/)
  expect(wrapper.html()).not.toMatch(/aria-label="[^"]*(?:第二实例|示例)/)
})

it('opens the seeded layout deep link with host actions and remounts cleanly', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/layout' } })
  expect(wrapper.findAll('.nv-scr-layout')).toHaveLength(2)
  expect(wrapper.get('select[aria-label="设计尺寸"]').attributes('disabled')).toBeDefined()
  const firstPath = wrapper.get('.nv-scr-layout path.nv-scr-layout-path').attributes('d')
  await wrapper
    .findAll('button')
    .find((button) => button.text() === '换一种光影')!
    .trigger('click')
  expect(wrapper.get('.nv-scr-layout path.nv-scr-layout-path').attributes('d')).not.toBe(firstPath)
  await wrapper
    .findAll('button')
    .find((button) => button.text() === '更新时刻')!
    .trigger('click')
  expect(wrapper.get('.nv-scr-layout__chrome').text()).toContain('10:31')
  await wrapper
    .findAll('button')
    .find((button) => button.text() === '阅读完整介绍')!
    .trigger('click')
  expect(wrapper.get('.layout-demo-extra').text()).toContain('河岸展厅保留了这座城市')
  await wrapper
    .findAll('button')
    .find((button) => button.text() === '加入心愿')!
    .trigger('click')
  expect(wrapper.get('.layout-demo-feedback').text()).toContain('已记下')
  await wrapper.setProps({ section: '#screen/stage' })
  expect(wrapper.find('.nv-scr-layout').exists()).toBe(false)
  await wrapper.setProps({ section: '#screen/layout' })
  expect(wrapper.findAll('.nv-scr-layout')).toHaveLength(2)
  expect(wrapper.get('.nv-scr-layout__chrome').text()).toContain('10:30')
  expect(wrapper.text()).not.toMatch(/T08|R04|来源|第二实例|示例/)
})

it('opens the stage quantity deep link and preserves existing stage navigation', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/stage-flow' } })
  expect(wrapper.get('a[href="#screen/stage-flow"]').attributes('aria-current')).toBe('page')
  expect(wrapper.get('a[href="#screen/stage"]').attributes('aria-current')).toBeUndefined()
  expect(wrapper.find('[data-slot="nv-screen-stage-flow"]').exists()).toBe(true)
  await wrapper.setProps({ section: '#screen/stage' })
  expect(wrapper.find('[data-slot="nv-screen-stage-flow"]').exists()).toBe(false)
  expect(wrapper.get('a[href="#screen/stage"]').attributes('aria-current')).toBe('page')
  expect(wrapper.find('a[href="#screen/status-hero"]').exists()).toBe(true)
})

it('routes the heatmap through the scaler with one current link and preserves previous screen navigation', async () => {
  wrapper = mount(ScreenDemo, { props: { section: '#screen/heatmap' } })
  expect(wrapper.get('a[href="#screen/heatmap"]').attributes('aria-current')).toBe('page')
  expect(wrapper.findAll('a[aria-current="page"]')).toHaveLength(1)
  expect(wrapper.findAll('[data-slot="nv-screen-heatmap"]')).toHaveLength(2)
  expect(wrapper.find('[role="region"][aria-label="分档热力舞台"]').exists()).toBe(true)
  for (const href of [
    '#desktop',
    '#touch',
    '#mobile',
    '#files',
    '#screen/stage',
    '#screen/layout',
    '#screen/controls',
    '#screen/indicators',
    '#screen/charts',
    '#screen/data',
    '#screen/tables',
    '#screen/summary',
    '#screen/status-hero',
    '#screen/stage-flow',
  ]) {
    expect(wrapper.find(`a[href="${href}"]`).exists()).toBe(true)
  }
  await wrapper.setProps({ section: '#screen/stage-flow' })
  expect(wrapper.find('[data-slot="nv-screen-heatmap"]').exists()).toBe(false)
  expect(wrapper.get('a[href="#screen/stage-flow"]').attributes('aria-current')).toBe('page')
})

import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  localStorage.clear()
  window.location.hash = ''
})

it('adds a named project from the form to the searchable table', async () => {
  wrapper = mount(App, { attachTo: document.body })
  await wrapper.get('input#project-name').setValue('星河计划')
  await wrapper.get('form').trigger('submit')
  await wrapper.get('input[placeholder="搜索项目…"]').setValue('星河计划')
  expect(wrapper.get('tbody').text()).toContain('星河计划')
  expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  expect(wrapper.get('input#project-name').element).toHaveProperty('value', '')
})

it('opens screen stage deep links and returns through every existing surface without a fixed stage', async () => {
  window.location.hash = '#screen/stage'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('城市文化空间')
  expect(wrapper.get('a[href="#screen/stage"]').text()).toBe('空间舞台')
  for (const [hash, heading] of [
    ['#desktop', '让想法有序向前'],
    ['#touch', '共享阅读角'],
    ['#mobile', '周末随行'],
    ['#mobile-input', '随心记录'],
    ['#mobile-overlays', '片刻安排'],
    ['#mobile-lists', '翻阅时光'],
    ['#mobile-feedback', '片刻回响'],
  ]) {
    expect(wrapper.find(`a[href="${hash}"]`).exists()).toBe(true)
    window.location.hash = hash!
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('h1').text()).toBe(heading)
    expect(wrapper.find('.screen-scaler').exists()).toBe(false)
    window.location.hash = '#screen'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('h1').text()).toBe('城市文化空间')
    expect(wrapper.findAll('.screen-scaler')).toHaveLength(1)
  }
})

it('opens the standalone touch demo from its direct entry and returns to desktop', async () => {
  window.location.hash = '#touch'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('共享阅读角')
  expect(wrapper.get('a[href="#desktop"]').text()).toBe('桌面演示')
  window.location.hash = '#touch-metrics'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('h1').text()).toBe('共享阅读角')
  window.location.hash = '#desktop'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('让想法有序向前')
  expect(wrapper.get('a[href="#touch"]').text()).toBe('触屏演示')
})

it('opens the standalone mobile shell directly and preserves desktop and touch entries', async () => {
  window.location.hash = '#mobile'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('周末随行')
  expect(wrapper.get('[data-shell="header"]').text()).toContain('随行手记')
  expect(wrapper.get('[data-shell="footer"]').text()).toContain('发现')
  expect(wrapper.get('a[href="#desktop"]').text()).toBe('桌面演示')
  expect(wrapper.get('a[href="#touch"]').text()).toBe('触屏演示')
  window.location.hash = '#desktop'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('a[href="#mobile"]').text()).toBe('移动演示')
  window.location.hash = '#touch'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await wrapper.vm.$nextTick()
  expect(wrapper.get('h1').text()).toBe('共享阅读角')
})

it('opens mobile inputs directly and keeps the shell, desktop and touch routes reachable', async () => {
  window.location.hash = '#mobile-input'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('随心记录')
  expect(wrapper.get('a[href="#mobile"]').text()).toBe('随行手记')
  for (const [hash, heading] of [
    ['#mobile', '周末随行'],
    ['#touch', '共享阅读角'],
    ['#desktop', '让想法有序向前'],
  ]) {
    window.location.hash = hash!
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain(heading)
  }
})

it('opens the standalone overlay page directly and preserves all four existing entries', async () => {
  window.location.hash = '#mobile-overlays'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('片刻安排')
  for (const hash of ['#desktop', '#touch', '#mobile', '#mobile-input']) {
    expect(wrapper.find(`a[href="${hash}"]`).exists()).toBe(true)
  }
})

it('opens mobile lists directly and navigates through all five existing entries', async () => {
  window.location.hash = '#mobile-lists'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('翻阅时光')
  for (const hash of ['#desktop', '#touch', '#mobile', '#mobile-input', '#mobile-overlays']) {
    expect(wrapper.find(`a[href="${hash}"]`).exists()).toBe(true)
  }
  for (const [hash, heading] of [
    ['#mobile', '周末随行'],
    ['#mobile-input', '随心记录'],
    ['#mobile-overlays', '片刻安排'],
    ['#touch', '共享阅读角'],
    ['#desktop', '让想法有序向前'],
  ]) {
    window.location.hash = hash!
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('h1').text()).toBe(heading)
    expect(wrapper.get('a[href="#mobile-lists"]').text()).toBe('翻阅时光')
  }
})

it('opens mobile feedback directly and returns through all six existing entries', async () => {
  window.location.hash = '#mobile-feedback'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('片刻回响')
  for (const [hash, heading] of [
    ['#mobile', '周末随行'],
    ['#mobile-input', '随心记录'],
    ['#mobile-overlays', '片刻安排'],
    ['#mobile-lists', '翻阅时光'],
    ['#touch', '共享阅读角'],
    ['#desktop', '让想法有序向前'],
  ]) {
    expect(wrapper.find(`a[href="${hash}"]`).exists()).toBe(true)
    window.location.hash = hash!
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('h1').text()).toBe(heading)
    await wrapper.get('a[href="#mobile-feedback"]').trigger('click')
    window.location.hash = '#mobile-feedback'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('h1').text()).toBe('片刻回响')
  }
})

it('opens files directly and returns from every completed surface group', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  window.location.hash = '#files'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('留住片刻')
  for (const hash of [
    '#desktop',
    '#touch',
    '#mobile',
    '#mobile-input',
    '#mobile-overlays',
    '#mobile-lists',
    '#mobile-feedback',
    '#screen/stage',
    '#screen/layout',
    '#screen/controls',
    '#screen/indicators',
    '#screen/data',
    '#screen/charts',
    '#screen/tables',
  ]) {
    expect(wrapper.find(`a[href="${hash}"]`).exists()).toBe(true)
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('a[href="#files"]').text()).toBe('留住片刻')
    window.location.hash = '#files'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(wrapper.get('h1').text()).toBe('留住片刻')
  }
})

it('routes both directory deep links and preserves the return link', async () => {
  window.location.hash = '#directory-detail/studio'
  wrapper = mount(App, { attachTo: document.body })
  await nextTick()
  expect(wrapper.findComponent({ name: 'DirectoryRecipe' }).props('host').source).toBe('studio')
  expect(wrapper.get('a[href="#"]').text()).toBe('返回工作空间')
  window.location.hash = '#directory-detail/library'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await nextTick()
  expect(wrapper.findComponent({ name: 'DirectoryRecipe' }).props('host').source).toBe('library')
})

it('routes photo deep links and returns to the mobile entry without losing existing routes', async () => {
  window.location.hash = '#mobile-photos/library'
  wrapper = mount(App, { attachTo: document.body })
  expect(wrapper.get('h1').text()).toBe('阅读剪影')
  expect(wrapper.get('a[href="#mobile"]').text()).toBe('返回随行')
  window.location.hash = '#mobile-photos/studio'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await nextTick()
  expect(wrapper.get('h1').text()).toBe('画室色彩')
  window.location.hash = '#mobile'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await nextTick()
  expect(wrapper.get('a[href="#mobile-photos/library"]').text()).toBe('留住光影')
})

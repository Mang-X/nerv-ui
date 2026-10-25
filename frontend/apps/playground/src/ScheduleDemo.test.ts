import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'
let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  window.location.hash = ''
  localStorage.clear()
  vi.unstubAllGlobals()
})
it('opens schedule deep entry selects a task and returns through desktop and all previous routes', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  window.location.hash = '#schedule'
  wrapper = mount(App)
  expect(wrapper.get('h1').text()).toBe('给片刻留个位置')
  await wrapper.get('[data-task-id="read"]').trigger('click')
  expect(wrapper.get('[data-selection]').text()).toContain('read')
  for (const hash of [
    '#desktop',
    '#touch',
    '#mobile',
    '#mobile-input',
    '#mobile-overlays',
    '#mobile-lists',
    '#mobile-feedback',
    '#files',
    '#screen/stage',
    '#screen/controls',
    '#screen/indicators',
    '#screen/data',
    '#screen/charts',
    '#screen/tables',
    '#screen/summary',
  ]) {
    expect(wrapper.find(`a[href="${hash}"]`).exists()).toBe(true)
  }
  window.location.hash = '#desktop'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await nextTick()
  expect(wrapper.get('a[href="#schedule"]').text()).toBe('时间安排')
  expect(wrapper.find('[data-slot="nv-schedule-timeline"]').exists()).toBe(false)
  window.location.hash = '#schedule'
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  await nextTick()
  expect(wrapper.get('[data-selection]').text()).toContain('尚未选择')
  expect(wrapper.findAll('[data-task-id]')).toHaveLength(2)
})

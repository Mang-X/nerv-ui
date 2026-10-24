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

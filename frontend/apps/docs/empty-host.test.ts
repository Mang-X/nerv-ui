// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@nerv-iip/ui'
import Example from './docs/.vitepress/examples/EmptyExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('switches content and empty state and reports this page recovery', async () => {
  page = mount(Example)
  expect(page.get('ul').text()).toContain('午后阅读')
  await page.get('button').trigger('click')
  expect(page.find('ul').exists()).toBe(false)
  const empty = page.getComponent(Empty)
  const header = empty.getComponent(EmptyHeader)
  expect(header.getComponent(EmptyTitle).text()).toBe('暂时没有阅读安排')
  expect(header.getComponent(EmptyDescription).text()).toContain('恢复本页安排')
  const restore = empty.getComponent(EmptyContent).get('button')
  expect(restore.attributes('type')).toBe('button')
  await restore.trigger('click')
  expect(page.findComponent(Empty).exists()).toBe(false)
  expect(page.get('ul').text()).toContain('午后阅读')
  expect(page.get('[role="status"]').text()).toBe('已恢复本页的阅读安排；刷新后重新开始。')
  await page.get('button').trigger('click')
  expect(page.get('[role="status"]').text()).toBe('当前没有阅读安排。')
})
it('keeps default media content and icon media decorative while switching variants', async () => {
  page = mount(Example)
  await page.get('button').trigger('click')
  expect(page.getComponent(EmptyMedia).props('variant')).toBe('default')
  expect(page.getComponent(EmptyMedia).text()).toBe('阅读时光')
  await page.get('select').setValue('icon')
  const media = page.getComponent(EmptyMedia)
  expect(media.props('variant')).toBe('icon')
  expect(media.get('svg').attributes('aria-hidden')).toBe('true')
  expect(page.getComponent(EmptyTitle).text()).toBe('暂时没有阅读安排')
  await page.get('select').setValue('default')
  expect(page.getComponent(EmptyMedia).text()).toBe('阅读时光')
})

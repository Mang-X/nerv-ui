// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { NvKanban, NvRecordCard } from '@nerv-iip/ui'
import Example from './docs/.vitepress/examples/localKanbanRecordExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('renders columns empty state status meta and zero and nonzero progress', () => {
  page = mount(Example)
  expect(page.findComponent(NvKanban).exists()).toBe(true)
  expect(page.findAll('section').map((c) => c.get('header').text())).toEqual([
    '待阅读2',
    '阅读中1',
    '已读完0',
  ])
  expect(page.findAll('section')[2].text()).toContain('暂无卡片')
  const cards = page.findAllComponents(NvRecordCard)
  expect(cards).toHaveLength(3)
  expect(cards[0].text()).toContain('0%')
  expect(cards[0].text()).toContain('待阅读')
  expect(cards[0].text()).toContain('240 pages')
  expect(cards[2].text()).toContain('45%')
})
it('keeps actions and column counts current after reorder replacement and restore', async () => {
  page = mount(Example)
  await page.get('button[aria-label="重排待阅读"]').trigger('click')
  expect(page.findAllComponents(NvRecordCard)[0].text()).toContain('BOOK-02')
  await page.get('button[aria-label="查看 BOOK-02"]').trigger('click')
  expect(page.get('[role="status"]').text()).toBe('当前查看：BOOK-02 · 山间散步')
  await page.get('button[aria-label="替换待阅读"]').trigger('click')
  expect(page.find('button[aria-label="查看 BOOK-02"]').exists()).toBe(false)
  expect(page.get('[role="status"]').text()).toContain('BOOK-04')
  await page.get('button[aria-label="查看 BOOK-04"]').trigger('click')
  expect(page.get('[role="status"]').text()).toBe('当前查看：BOOK-04 · 城市笔记')
  expect(page.findAll('section').map((c) => c.get('header').text())).toEqual([
    '待阅读1',
    '阅读中1',
    '已读完0',
  ])
  await page.get('button[aria-label="恢复书篮"]').trigger('click')
  expect(page.findAllComponents(NvRecordCard)).toHaveLength(3)
  expect(page.get('[role="status"]').text()).toContain('已恢复')
})

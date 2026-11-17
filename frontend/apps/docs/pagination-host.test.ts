// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Example from './docs/.vitepress/examples/PaginationExample.vue'
let host: VueWrapper
afterEach(() => host?.unmount())
it('keeps controlled results, numbered buttons and boundary actions consistent', async () => {
  host = mount(Example)
  const control = (name: string) => host.get(`[data-slot="pagination-${name}"]`)
  expect(control('first').attributes('disabled')).toBeDefined()
  expect(control('previous').attributes('disabled')).toBeDefined()
  expect(host.get('[role="status"]').text()).toContain('1–3 / 共 29 条 · 第 1 / 10 页')
  expect(host.get('[data-slot="pagination-ellipsis"]').exists()).toBe(true)
  await control('next').trigger('click')
  expect(host.get('[role="status"]').text()).toContain('4–6')
  expect(host.get('li').text()).toBe('阅读片段 4 · 数量 3')
  await host.get('button[aria-label="第 3 页"]').trigger('click')
  expect(host.get('[role="status"]').text()).toContain('7–9')
  await control('last').trigger('click')
  expect(host.findAll('li')).toHaveLength(2)
  expect(host.get('[role="status"]').text()).toContain('28–29 / 共 29 条 · 第 10 / 10 页')
  expect(control('next').attributes('disabled')).toBeDefined()
  expect(control('last').attributes('disabled')).toBeDefined()
  expect(host.get('button[aria-current="page"]').text()).toBe('10')
  await control('previous').trigger('click')
  expect(host.get('[role="status"]').text()).toContain('25–27')
  await control('first').trigger('click')
  expect(host.get('li').text()).toBe('阅读片段 1 · 数量 0')
})
it('uses real local anchors separately from page buttons without nested controls', () => {
  host = mount(Example)
  const links = host.findAll('[data-slot="pagination-link"]')
  expect(links.map((link) => link.element.tagName)).toEqual(['A', 'A'])
  expect(links.map((link) => link.attributes('href'))).toEqual([
    '#controlled-results',
    '#link-navigation',
  ])
  expect(links[1]!.attributes('aria-current')).toBeUndefined()
  expect(links[0]!.attributes('aria-current')).toBeUndefined()
  for (const link of links) expect(host.find(link.attributes('href')!).exists()).toBe(true)
  expect(host.find('button a, a button, button button, a a').exists()).toBe(false)
})

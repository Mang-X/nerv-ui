// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { NvMetricComparison } from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/localMetricComparisonExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('reflects current visit and consumption inputs through the public comparison DOM', async () => {
  page = mount(Example)
  const card = () => page.getComponent(NvMetricComparison).text()
  expect(card()).toContain('到访人次')
  expect(card()).toContain('+20')
  expect(card()).toContain('120%')
  await page.get('button[aria-label="切换为耗用"]').trigger('click')
  expect(card()).toContain('耗用升数')
  expect(card()).toContain('预算')
  expect(card()).toContain('已用')
  expect(card()).toContain('-20')
  expect(card()).toContain('80%')
  expect(page.get('[role="status"]').text()).toContain('预算 100；已用 80；越低越好')
  await page.get('button[aria-label="切换优劣方向"]').trigger('click')
  expect(page.get('[role="status"]').text()).toContain('越高越好')
  expect(page.getComponent(NvMetricComparison).props('betterWhen')).toBe('higher')
  expect(card()).toContain('80%')
})
it('renders zero baseline semantics without treating an undefined ratio as zero', async () => {
  page = mount(Example)
  await page.get('button[aria-label="基线与实际归零"]').trigger('click')
  expect(page.getComponent(NvMetricComparison).text()).toContain('100%')
  expect(page.get('[role="status"]').text()).toContain('计划 0；到访 0')
  await page.get('button[aria-label="零基线非零实际"]').trigger('click')
  const text = page.getComponent(NvMetricComparison).text()
  expect(text).toContain('+12')
  expect(text).toContain('—')
  expect(text).not.toContain('0%')
  expect(page.get('[role="status"]').text()).toContain('计划 0；到访 12')
})

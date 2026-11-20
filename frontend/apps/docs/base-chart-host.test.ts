// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from '@nerv-ui/ui'
import Example from './docs/.vitepress/examples/BaseChartExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
const click = async (text: string) => {
  await page
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
}
it('synchronizes real zero, keyed replacement, clear, restore and visibility across public chart parts', async () => {
  page = mount(Example)
  expect(page.findComponent(ChartContainer).exists()).toBe(true)
  const hint = () => page.getComponent(ChartTooltipContent).text()
  const legend = () => page.getComponent(ChartLegendContent).text()
  expect(hint()).toContain('阅读角0 人次')
  expect(page.get('meter').attributes('value')).toBe('0')
  const garden = page.findAll('li button')[1]!
  await garden.trigger('focus')
  expect(hint()).toContain('12.346')
  await click('替换数据')
  expect(hint()).toContain('窗边花园（更新）3.5')
  expect(hint()).not.toContain('12.346')
  expect(legend()).not.toContain('阅读角')
  expect(page.findAll('meter').map((m) => m.attributes('value'))).toEqual(['3.5', '0'])
  await click('隐藏数据')
  expect(page.findAll('meter')).toHaveLength(0)
  expect(legend()).toBe('')
  expect(hint()).toContain('尚无当前项')
  await click('显示数据')
  expect(hint()).toContain('3.5')
  await click('清空数据')
  expect(page.findAll('meter')).toHaveLength(0)
  expect(legend()).toBe('')
  expect(hint()).toContain('尚无当前项')
  await click('恢复数据')
  expect(hint()).toContain('12.346')
  expect(legend()).toContain('阅读角')
  await page.findAll('li button')[0]!.trigger('click')
  expect(hint()).toContain('阅读角0 人次')
  await click('替换数据')
  expect(hint()).toContain('尚无当前项')
})

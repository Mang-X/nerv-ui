// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { TableCaption, TableFooter, TableEmpty } from '@nerv-iip/ui'
import Example from './docs/.vitepress/examples/BaseTableExample.vue'
let page: VueWrapper
afterEach(() => page?.unmount())
it('renders current totals, exact empty colspan and restores real zero quantities', async () => {
  page = mount(Example)
  const table = () => page.get('table')
  expect(page.getComponent(TableCaption).text()).toBe('物品清单 · 当前 3 条')
  expect(
    table()
      .findAll('thead th')
      .map((cell) => cell.text()),
  ).toEqual(['物品', '数量', '单位'])
  expect(
    table()
      .findAll('tbody tr')
      .map((row) => row.findAll('td').map((cell) => cell.text())),
  ).toEqual([
    ['收纳盒', '0', '个'],
    ['标签纸', '12.346', '个'],
    ['书签', '2', '个'],
  ])
  expect(page.getComponent(TableFooter).text()).toContain('14.346')
  expect(page.findComponent(TableEmpty).exists()).toBe(false)
  expect(page.get('[role="region"]').attributes('tabindex')).toBe('0')
  await page.get('button').trigger('click')
  expect(page.getComponent(TableCaption).text()).toBe('物品清单 · 当前 0 条')
  const empty = page.getComponent(TableEmpty)
  expect(empty.get('td').attributes('colspan')).toBe(String(table().findAll('thead th').length))
  expect(empty.text()).toContain('当前没有物品记录')
  expect(table().findAll('tbody tr')).toHaveLength(1)
  expect(
    page
      .getComponent(TableFooter)
      .findAll('td')
      .map((cell) => cell.text()),
  ).toEqual(['当前合计', '0', '个'])
  await page.findAll('button')[1]!.trigger('click')
  expect(page.findComponent(TableEmpty).exists()).toBe(false)
  expect(table().findAll('tbody tr')).toHaveLength(3)
  expect(table().get('tbody tr td:nth-child(2)').text()).toBe('0')
  expect(page.getComponent(TableFooter).text()).toContain('14.346')
  expect(page.getComponent(TableCaption).text()).toBe('物品清单 · 当前 3 条')
})

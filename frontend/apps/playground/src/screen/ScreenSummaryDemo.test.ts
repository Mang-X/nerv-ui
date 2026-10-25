import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import ScreenSummaryDemo from './ScreenSummaryDemo.vue'
import ScreenDemo from '../ScreenDemo.vue'
let w: ReturnType<typeof mount>
afterEach(() => w?.unmount())
function button(text: string) {
  return w.findAll('button').find((n) => n.text() === text)!
}
it('summary switches culture and coworking sources with explicit legacy adapter and improving cost decrease', async () => {
  w = mount(ScreenSummaryDemo)
  expect(w.get('[aria-label="当前概况来源"]').text()).toBe('文化空间')
  expect(w.findAll('.nv-scr-oeh-val').map((n) => n.text())).toEqual(['12,840人次', '2,460元'])
  expect(w.findAll('.nv-scr-oeh-delta')[1]!.attributes('data-tone')).toBe('positive')
  expect(w.get('.nv-scr-lc-stats').text()).toContain('目标到访15,000 人次')
  expect(w.get('.nv-scr-tg-seg').attributes('title')).toBe('街角书房 · 占用 35%')
  await button('共享办公').trigger('click')
  expect(w.get('[aria-label="当前概况来源"]').text()).toBe('共享办公')
  expect(w.findAll('.nv-scr-oeh-val').map((n) => n.text())).toEqual(['386人次', '980元'])
  expect(w.get('.nv-scr-lc-stats').text()).toContain('预订目标500 人次')
  expect(w.get('.nv-scr-lc-foot').text()).toBe('服务时长6 小时')
  expect(w.get('.nv-scr-tg-seg').attributes('title')).toBe('协作厅 · 使用中 45%')
  expect(w.text()).not.toMatch(/产量|达成率|停机时长|焊接|OEE|Takt/)
})
it('summary unknown empty large and long labels update visible values and segment input then recover', async () => {
  w = mount(ScreenSummaryDemo)
  await button('未知读数').trigger('click')
  expect(w.findAll('.nv-scr-oeh-val').map((n) => n.text())).toEqual(['—人次', '—元'])
  expect(w.get('.nv-scr-lc-stats').text()).toContain('当前到访— 人次')
  expect(w.findAll('.nv-scr-oeh-spark')).toHaveLength(0)
  await button('空时段').trigger('click')
  expect(w.findAll('.nv-scr-tg-row')).toHaveLength(0)
  expect(w.text()).toContain('暂无时段')
  await button('更新时段').trigger('click')
  expect(w.get('.nv-scr-tg-seg').attributes('title')).toBe('街角书房 · 异常 10%')
  await button('长文案与大数').trigger('click')
  expect(w.get('.nv-scr-oeh-val').text()).toBe('123,456,789人次')
  expect(w.text()).toContain('城市公共文化空间联合服务中心')
  await button('恢复读数').trigger('click')
  expect(w.get('.nv-scr-oeh-val').text()).toBe('12,840人次')
  expect(w.findAll('.nv-scr-oeh-spark')).toHaveLength(2)
})
it('summary deep link preserves all previous routes and resets source on return', async () => {
  w = mount(ScreenDemo, { props: { section: '#screen/summary' } })
  expect(w.get('h1').text()).toBe('空间使用概况')
  expect(w.get('a[href="#screen/summary"]').attributes('aria-current')).toBe('page')
  expect(w.get('a[href="#screen/stage"]').attributes('aria-current')).toBeUndefined()
  await button('共享办公').trigger('click')
  for (const route of [
    'screen/stage',
    'screen/controls',
    'screen/indicators',
    'screen/data',
    'screen/charts',
    'screen/tables',
    'desktop',
    'touch',
    'mobile',
    'mobile-input',
    'mobile-overlays',
    'mobile-lists',
    'mobile-feedback',
  ])
    expect(w.get(`a[href="#${route}"]`).attributes('href')).toBe(`#${route}`)
  await w.setProps({ section: '#screen/stage' })
  expect(w.get('h1').text()).toBe('城市文化空间')
  expect(w.find('.nv-scr-tg').exists()).toBe(false)
  await w.setProps({ section: '#screen/summary' })
  expect(w.get('[aria-label="当前概况来源"]').text()).toBe('文化空间')
})

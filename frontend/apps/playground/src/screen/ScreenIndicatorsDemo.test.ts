import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ScreenIndicatorsDemo from './ScreenIndicatorsDemo.vue'
import { indicatorSources } from './indicators-fixtures'

const wrappers: ReturnType<typeof mount>[] = []
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }))
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
const button = (wrapper: ReturnType<typeof mount>, text: string) =>
  wrapper.findAll('button').find((item) => item.text() === text)!

it('host switches each source identity and keeps real zero distinct from unknown without invalid numeric props', async () => {
  const wrapper = mount(ScreenIndicatorsDemo)
  wrappers.push(wrapper)
  await flushPromises()
  expect(wrapper.get('[aria-label="读数来源"]').text()).toContain('morning · 街角书房')
  expect(wrapper.get('[aria-label="到访读数"]').text()).toContain('1,284')
  expect(wrapper.get('[aria-label="预订比例"]').text()).toContain('72.5%')
  await wrapper.get('select[aria-label="读数组"]').setValue('zero')
  expect(wrapper.get('[aria-label="读数来源"]').text()).toContain('zero · 开馆之前')
  expect(wrapper.get('[aria-label="到访读数"]').text()).toContain('0')
  expect(wrapper.get('[aria-label="预订比例"]').text()).toContain('0%')
  expect(wrapper.get('[aria-label="读数原文"]').text()).toContain('0')
  await wrapper.get('select[aria-label="读数组"]').setValue('unknown')
  expect(wrapper.get('[aria-label="到访读数"]').text()).toContain('尚未统计')
  expect(wrapper.get('[aria-label="预订比例"]').text()).toContain('比例未知')
  expect(wrapper.get('[aria-label="预订比例"]').find('svg').exists()).toBe(false)
  expect(wrapper.text()).not.toMatch(/NaN|Infinity|工单|良品率/)
  expect(wrapper.get('[aria-label="阅读微趋势"]').find('line').exists()).toBe(true)
  await wrapper.get('select[aria-label="读数组"]').setValue('evening')
  expect(wrapper.get('[aria-label="读数来源"]').text()).toContain('evening · 河岸展厅')
  expect(wrapper.get('[aria-label="预订比例"]').text()).toContain('93.2%')
  expect(wrapper.get('[aria-label="预订微趋势"]').findAll('path')).toHaveLength(2)
})

it('host updates long text all status labels and trend area without replacing them with component defaults', async () => {
  const wrapper = mount(ScreenIndicatorsDemo)
  wrappers.push(wrapper)
  await wrapper.get('select[aria-label="读数组"]').setValue('boundary')
  expect(wrapper.get('[aria-label="预订比例"]').text()).toContain('125.3%')
  expect(wrapper.get('[aria-label="到访读数"]').text()).toContain('12 345.67 · 待核对')
  expect(wrapper.get('[aria-label="指标横条"]').text()).toContain(
    '河畔公共阅读空间全年累计到访说明',
  )
  expect(wrapper.get('[aria-label="指标横条"]').text()).toContain(
    indicatorSources.find((item) => item.id === 'boundary')!.note,
  )
  await button(wrapper, '切换状态文字').trigger('click')
  expect(wrapper.get('[aria-label="状态对照"]').text()).toContain('阅读提示 · run')
  await wrapper.get('input[aria-label="趋势面积"]').setValue(false)
  expect(wrapper.get('[aria-label="阅读微趋势"]').find('path[fill^="url("]').exists()).toBe(false)
  expect(wrapper.get('[aria-label="预订微趋势"]').find('path[fill^="url("]').exists()).toBe(false)
})

it('host continuous readings stop on source change and unmount without timers updating another group', async () => {
  vi.useFakeTimers()
  const wrapper = mount(ScreenIndicatorsDemo)
  wrappers.push(wrapper)
  await button(wrapper, '连续更新').trigger('click')
  expect(button(wrapper, '停止更新').attributes('aria-pressed')).toBe('true')
  await vi.advanceTimersByTimeAsync(1400)
  expect(wrapper.get('[aria-label="读数原文"]').text()).toContain('1,358')
  await wrapper.get('select[aria-label="读数组"]').setValue('zero')
  expect(button(wrapper, '连续更新').attributes('aria-pressed')).toBe('false')
  await vi.advanceTimersByTimeAsync(1400)
  expect(wrapper.get('[aria-label="读数原文"]').text()).toContain('0')
  await button(wrapper, '连续更新').trigger('click')
  wrapper.unmount()
  wrappers.pop()
  expect(vi.getTimerCount()).toBe(0)
})

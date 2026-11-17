import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import ScreenChartsDemo from './ScreenChartsDemo.vue'

let w: ReturnType<typeof mount>
afterEach(() => {
  w?.unmount()
  vi.unstubAllGlobals()
})
function start() {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }))
  w = mount(ScreenChartsDemo)
}
function button(label: string) {
  return w.findAll('button').find((b) => b.text() === label)!
}
it('range model switches real source point count scale and all channel readouts then short empty and recover preserve identity', async () => {
  start()
  const path = () => w.get('.nv-scr-tc-act').attributes('d')
  const original = path()
  expect(w.get('[aria-label="数据身份"]').text()).toContain('reading/day/5')
  expect(w.get('[aria-label="点值原文"]').text()).toContain('reading/day/p5')
  await button('近三周').trigger('click')
  expect(button('近三周').attributes('aria-pressed')).toBe('true')
  expect(w.get('[aria-label="数据身份"]').text()).toContain('reading/weeks/3')
  expect(path()).not.toBe(original)
  expect(w.get('.nv-scr-tc-y').text()).toContain('2,000')
  expect(w.get('[aria-label="点值原文"]').text()).toContain('1,307')
  await button('缩短为两点').trigger('click')
  expect(w.get('[aria-label="数据身份"]').text()).toContain('reading/weeks/2')
  await button('清空数据').trigger('click')
  expect(w.get('.nv-scr-tc-act').attributes('d')).toBe('')
  expect(w.find('.nv-scr-tc-cardh').exists()).toBe(false)
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  expect(w.get('[aria-label="点值原文"]').text()).toContain('暂无点值')
  await button('恢复数据').trigger('click')
  expect(w.get('[aria-label="数据身份"]').text()).toContain('reading/weeks/3')
  await button('替换来源').trigger('click')
  expect(w.get('[aria-label="数据身份"]').text()).toContain('gallery/weeks/3')
  expect(w.get('[aria-label="点值原文"]').text()).not.toContain('reading/weeks/p')
})
it('host distribution controls replace donut legend center and Pareto denominator consistently including zero', async () => {
  start()
  expect(w.get('.nv-scr-dn-center').text()).toContain('100')
  expect(w.get('.nv-scr-pa-sum').text()).toContain('80.0%')
  expect(w.get('.nv-scr-pa-tail').text()).toContain('20 次 · 20.0%')
  await button('单类内容').trigger('click')
  expect(w.findAll('.nv-scr-dn-arc')).toHaveLength(1)
  expect(w.get('.nv-scr-dn-center').text()).toContain('23')
  expect(w.get('.nv-scr-pa-tail').text()).toContain('0 次 · 0.0%')
  await button('零值内容').trigger('click')
  expect(w.get('.nv-scr-dn-center').text()).toContain('0')
  expect(w.get('.nv-scr-pa-tail').text()).toContain('0 次 · 0.0%')
  await button('替换内容').trigger('click')
  expect(w.findAll('.nv-scr-dn-l').map((l) => l.text())).toEqual([
    '声音档案',
    '城市长卷：沿河街巷与日常生活的共同记忆',
    '手作',
  ])
  expect(w.get('.nv-scr-dn-center').text()).toContain('200')
  expect(w.get('.nv-scr-pa-tail').text()).toContain('60 次 · 30.0%')
})

import { toRaw } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import type { XYContainer, Line, Plotband } from '@unovis/ts'
import { mount, flushPromises } from '@vue/test-utils'
import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { VisLine, VisXYContainer, VisPlotband, VisCrosshair } from '@unovis/vue'
import { NvLineChart } from '../../../index'
// jsdom supplies no SVG layout. Only the platform layout boundary is controlled;
// XYContainer, axes, domain calculation, scales, callback and Plotband remain real.
let layoutWidth = 600
let axisWidth = 50
const htmlWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return layoutWidth
  },
})
const originalDescriptors = ['getBBox', 'clientWidth', 'clientHeight', 'transform'].map(
  (key) => [key, Object.getOwnPropertyDescriptor(SVGElement.prototype, key)] as const,
)
Object.defineProperty(SVGElement.prototype, 'transform', {
  configurable: true,
  value: { baseVal: { consolidate: () => null } },
})
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  configurable: true,
  value() {
    return { x: 0, y: 0, width: axisWidth, height: 16 }
  },
})
for (const [key, attr] of [
  ['clientWidth', 'width'],
  ['clientHeight', 'height'],
]) {
  Object.defineProperty(SVGElement.prototype, key, {
    configurable: true,
    get() {
      return Number(this.getAttribute(attr) ?? 0)
    },
  })
}
afterAll(() => {
  if (htmlWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', htmlWidth)
  else Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth')
  for (const [key, descriptor] of originalDescriptors) {
    if (descriptor) Object.defineProperty(SVGElement.prototype, key, descriptor)
    else Reflect.deleteProperty(SVGElement.prototype, key)
  }
})
const mounts: ReturnType<typeof mount>[] = []
afterEach(() => {
  mounts.splice(0).forEach((w) => w.unmount())
  axisWidth = 50
})
async function rendered() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await flushPromises()
}
function producer<T>(w: VueWrapper): T {
  return toRaw(w.vm.$.exposed!.component.value) as T
}
const data = [
  { time: '08:00', a: -10, b: 100 },
  { time: '08:00', a: 0, b: 200 },
  { time: '09:00', a: 10, b: 300 },
]
async function chart(extra = {}) {
  const w = mount(NvLineChart, {
    attachTo: document.body,
    props: {
      data,
      xKey: 'time',
      series: [
        { key: 'a', label: '甲' },
        { key: 'b', label: '乙' },
      ],
      ...extra,
    },
  })
  mounts.push(w)
  await rendered()
  const container = producer<XYContainer<unknown>>(
    w.getComponent(VisXYContainer as never) as VueWrapper,
  )
  layoutWidth = 600
  container.render(0)
  await rendered()
  return { w, container }
}
describe('line annotations with actual Unovis producer', () => {
  it('projects boundary and duplicate-label rows onto actual shared plot scales', async () => {
    const { w } = await chart({
      markers: [
        { id: 'a', index: 0, seriesKey: 'a', label: '起点' },
        { id: 'b', index: 2, seriesKey: 'b', label: '终点' },
      ],
    })
    const markers = w.findAll('[data-slot=nv-line-marker]')
    expect(markers).toHaveLength(2)
    expect((markers[0].element as HTMLElement).style.left).toBe('62px')
    expect((markers[1].element as HTMLElement).style.left).toBe('584px')
    expect((markers[1].element as HTMLElement).style.top).toBe('12px')
    const line = producer<Line<unknown>>(w.getComponent(VisLine as never) as VueWrapper)
    expect(line.yScale.domain()).toEqual([-10, 300])
  })
  it('clips multiple reversed bands with official producer and never expands data domain', async () => {
    const { w } = await chart({
      bands: [
        { id: 'x', axis: 'x', from: 3, to: -1, label: '时间范围' },
        { id: 'y', axis: 'y', from: -1e308, to: 1e308, label: '值域' },
        { id: 'off', axis: 'x', from: 8, to: 9, label: '轴外' },
      ],
    })
    const bands = w.findAllComponents(VisPlotband as never) as VueWrapper[]
    expect(bands).toHaveLength(2)
    expect(bands[0].props()).toMatchObject({ from: 0, to: 2, excludeFromDomainCalculation: true })
    expect(bands[1].props()).toMatchObject({ from: -10, to: 300 })
    const rect = producer<Plotband<unknown>>(bands[0]).element.querySelector('rect')!
    expect(rect.getAttribute('width')).toBe('522')
  })
  it('associates each same-tone range with a numbered plot label and complete legend after reorder and replacement', async () => {
    const { w } = await chart({
      bands: [
        { id: 'late', axis: 'x', from: 1.5, to: 2, label: '晚段' },
        { id: 'early', axis: 'x', from: 0, to: 0.5, label: '早段' },
        { id: 'high', axis: 'y', from: 150, to: 250, label: '高区' },
      ],
    })
    function region(label: string, number: number) {
      expect(w.get('[aria-label="范围说明"]').text()).toContain(`[${number}] ${label}`)
      const band = w
        .findAllComponents(VisPlotband as never)
        .find((b) =>
          producer<Plotband<unknown>>(b as VueWrapper).element.textContent?.includes(`[${number}]`),
        )
      expect(band, `region containing ${label}`).toBeDefined()
      const element = producer<Plotband<unknown>>(band as VueWrapper).element
      const rect = element.querySelector('rect')!
      const text = element.querySelector('text')!
      expect(text.textContent).toBe(`[${number}]`)
      for (const [coordinate, size] of [
        ['x', 'width'],
        ['y', 'height'],
      ]) {
        if (coordinate === 'y') {
          const y = Number(text.getAttribute('y'))
          expect(y).toBe(4 + (number - 1) * 18)
          const line = producer<Line<unknown>>(w.getComponent(VisLine as never) as VueWrapper)
          expect(y).toBeLessThanOrEqual(Math.max(...line.yScale.range().map(Number)))
          continue
        }
        const start = Number(rect.getAttribute(coordinate))
        const end = start + Number(rect.getAttribute(size))
        expect(Number(text.getAttribute(coordinate))).toBeGreaterThanOrEqual(start)
        expect(Number(text.getAttribute(coordinate))).toBeLessThanOrEqual(end)
      }
      return Number(rect.getAttribute('x'))
    }
    expect(region('早段', 2)).toBeLessThan(region('晚段', 1))
    region('高区', 3)
    await w.setProps({
      bands: [{ id: 'early', axis: 'x', from: 0.5, to: 1, label: '当前段' }],
    })
    await rendered()
    region('当前段', 1)
    expect(w.findAllComponents(VisPlotband as never)).toHaveLength(1)
    expect(w.find('svg').text()).not.toMatch(/早段|晚段|高区/)
    await w.setProps({ bands: [] })
    expect(w.findAllComponents(VisPlotband as never)).toHaveLength(0)
  })
  it('uses current identity after replacement and reorder without replacing focused marker DOM', async () => {
    const { w } = await chart({
      markers: [{ id: 'a', index: 1, seriesKey: 'a', label: '旧标签', href: '#detail-a' }],
    })
    const old = w.get('[data-marker-id=a]').element as HTMLElement
    old.focus()
    await w.setProps({
      markers: [
        { id: 'b', index: 2, seriesKey: 'a', label: '乙' },
        { id: 'a', index: 0, seriesKey: 'b', label: '新标签', href: '#detail-new' },
      ],
    })
    expect(w.get('[data-marker-id=a]').element).toBe(old)
    expect(document.activeElement).toBe(old)
    await w.get('[data-marker-id=a]').trigger('keydown', { key: ' ' })
    expect(w.emitted('markerClick')?.[0]?.[0]).toMatchObject({ id: 'a', label: '新标签' })
    expect(w.get('[data-marker-id=a]').attributes('href')).toBe('#detail-new')
    await w.setProps({ markers: [] })
    expect(w.findAll('[data-slot=nv-line-marker]')).toHaveLength(0)
  })
  it('updates resize and data/series domains and isolates a second chart', async () => {
    const marker = { id: 'a', index: 2, seriesKey: 'b', label: '终点' }
    const { w, container } = await chart({ markers: [marker] })
    const other = await chart({ markers: [marker] })
    layoutWidth = 800
    container.render(0)
    await rendered()
    expect((w.get('[data-marker-id=a]').element as HTMLElement).style.left).toBe('784px')
    expect((other.w.get('[data-marker-id=a]').element as HTMLElement).style.left).toBe('584px')
    await w.setProps({ series: [{ key: 'a', label: '甲' }] })
    container.render(0)
    await rendered()
    expect(w.find('[data-marker-id=a]').exists()).toBe(false)
    await w.setProps({ data: [] })
    expect(w.findAllComponents(VisPlotband as never)).toHaveLength(0)
  })
  it('omits unknown, invalid and unsafe targets and adds no default annotation', async () => {
    const { w } = await chart()
    expect(w.findAllComponents(VisPlotband as never)).toHaveLength(0)
    expect(w.findAll('[data-slot=nv-line-marker]')).toHaveLength(0)
    await w.setProps({
      markers: [
        { id: 'bad', index: -1, seriesKey: 'a', label: '轴外' },
        { id: 'safe', index: 1, seriesKey: 'a', label: '零', href: 'javascript:alert(1)' },
      ],
    })
    expect(w.findAll('[data-slot=nv-line-marker]')).toHaveLength(1)
    expect(w.get('[data-marker-id=safe]').element.tagName).toBe('BUTTON')
  })
  it('keeps single zero points, omits unknown values and projects large finite differences without NaN', async () => {
    const { w, container } = await chart({
      data: [{ time: 'now', a: 0 }],
      series: [{ key: 'a', label: '零' }],
      markers: [{ id: 'zero', index: 0, seriesKey: 'a', label: '零' }],
    })
    expect(w.find('[data-marker-id=zero]').exists()).toBe(true)
    await w.setProps({ data: [{ time: 'now', a: '' }] })
    expect(w.find('[data-marker-id=zero]').exists()).toBe(false)
    await w.setProps({
      data: [
        { time: 'start', a: -1e308 },
        { time: 'end', a: 1e308 },
      ],
      markers: [{ id: 'end', index: 1, seriesKey: 'a', label: '大有限值' }],
      bands: [{ id: 'all', axis: 'y', from: -1e308, to: 1e308, label: '全域' }],
    })
    container.render(0)
    await rendered()
    await rendered()
    expect(w.get('[data-marker-id=end]').attributes('style')).not.toMatch(/NaN|Infinity/)
    expect(w.html()).not.toContain('d="MNaN')
    expect(
      producer<Line<unknown>>(w.getComponent(VisLine as never) as VueWrapper).yScale.domain(),
    ).toEqual([-1, 1])
  })
  it('follows actual axis auto margins and formats current tooltip data with units', async () => {
    const { w, container } = await chart({
      markers: [{ id: 'first', index: 0, seriesKey: 'a', label: '起点' }],
      valueSuffix: ' 件',
    })
    axisWidth = 90
    container.render(0)
    await rendered()
    expect((w.get('[data-marker-id=first]').element as HTMLElement).style.left).toBe('102px')
    await w.setProps({ data: [{ time: '2026-10-28 10:00', a: 42, b: 84 }] })
    container.render(0)
    await rendered()
    const crosshair = producer<{
      config: { template: (row: Record<string, number | string>) => string }
    }>(w.getComponent(VisCrosshair as never) as VueWrapper)
    const html = crosshair.config.template({ time: '2026-10-28 10:00', a: 42, b: 84 })
    expect(html).toContain('42 件')
    expect(html).toContain('84 件')
    expect(html).toContain('2026-10-28 10:00')
  })
})

it('separates nested same-center range labels and retains full long names with axis endpoints', async () => {
  const { w } = await chart({
    bands: [
      { id: 'outer', axis: 'x', from: 0, to: 2, label: '完整的外层早间阅读范围' },
      { id: 'inner', axis: 'x', from: 0.5, to: 1.5, label: '完整的内层晚间活动范围' },
    ],
  })
  const bands = w.findAllComponents(VisPlotband as never) as VueWrapper[]
  const labels = bands.map((b) => producer<Plotband<unknown>>(b).element.querySelector('text')!)
  expect(labels.map((t) => t.textContent)).toEqual(['[1]', '[2]'])
  expect(
    Math.abs(Number(labels[0].getAttribute('y')) - Number(labels[1].getAttribute('y'))),
  ).toBeGreaterThanOrEqual(18)
  const entries = w.get('[aria-label="范围说明"]').findAll('li')
  expect(entries[0].text()).toContain('[1] 完整的外层早间阅读范围')
  expect(entries[0].text()).toContain('横轴 0–2')
  expect(entries[1].text()).toContain('[2] 完整的内层晚间活动范围')
  expect(entries[1].text()).toContain('横轴 0.5–1.5')
})

it('places Y range numbers on plot-relative rows regardless of range starts and bottom clipping', async () => {
  const { w } = await chart({
    bands: [
      { id: 'a', axis: 'y', from: 10, to: 20, label: '甲范围' },
      { id: 'b', axis: 'y', from: 12, to: 22, label: '乙范围' },
      { id: 'bottom', axis: 'y', from: 0, to: 1, label: '低位范围' },
    ],
  })
  const bands = w.findAllComponents(VisPlotband as never) as VueWrapper[]
  const ys = bands.map((b) =>
    Number(producer<Plotband<unknown>>(b).element.querySelector('text')!.getAttribute('y')),
  )
  expect(ys).toEqual([4, 22, 40])
  expect(w.get('[aria-label="范围说明"]').text()).toContain('[3] 低位范围')
  await w.setProps({ bands: [{ id: 'bottom', axis: 'y', from: 0, to: 1, label: '低位范围' }] })
  await rendered()
  const band = w.getComponent(VisPlotband as never) as VueWrapper
  expect(producer<Plotband<unknown>>(band).element.querySelector('text')!.getAttribute('y')).toBe(
    '4',
  )
})

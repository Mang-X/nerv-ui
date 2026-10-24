import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  NvDigitalFlop,
  NvSparkline,
  NvRingGauge,
  NvCapsuleBar,
  NvKpiBar,
  NvScreenStatusLight,
  NvScreenStatusTag,
} from '@nerv-iip/ui'

const wrappers: ReturnType<typeof mount>[] = []
const frames = new Map<number, FrameRequestCallback>()
let frameId = 0
let media: MediaQueryList
let reduced = false
beforeEach(() => {
  const events = new EventTarget()
  media = {
    get matches() {
      return reduced
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  } as MediaQueryList
  vi.stubGlobal('matchMedia', () => media)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  frames.clear()
  reduced = false
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
async function frame(time: number) {
  // Advance only callbacks already registered at the system RAF boundary.
  expect(frames.size).toBeGreaterThan(0)
  const callbacks = [...frames.values()]
  frames.clear()
  callbacks.forEach((callback) => callback(time))
  await nextTick()
}

it('digital flop cancels numeric motion when a literal replaces it and resumes without stale content', async () => {
  const wrapper = mount(NvDigitalFlop, { props: { value: 1200, suffix: '人' } })
  wrappers.push(wrapper)
  await flushPromises()
  expect(wrapper.attributes('aria-label')).toBe('1,200 人')
  await wrapper.setProps({ value: 2400.5 })
  await frame(100)
  await frame(250)
  expect(wrapper.attributes('aria-label')).not.toBe('2,400.5 人')
  await wrapper.setProps({ value: '尚未统计 · 请稍候' })
  expect(wrapper.attributes('aria-label')).toBe('尚未统计 · 请稍候 人')
  expect(wrapper.text()).toContain('尚未统计 · 请稍候')
  expect(frames.size).toBe(0)
  await wrapper.setProps({ value: 0, suffix: '次' })
  await frame(400)
  await frame(1000)
  expect(wrapper.attributes('aria-label')).toBe('0 次')
  expect(wrapper.text()).not.toContain('尚未统计')
  expect(frames.size).toBe(0)
})

it('digital flop settles an in-flight reading when reduced motion changes and never schedules reduced updates', async () => {
  const wrapper = mount(NvDigitalFlop, { props: { value: 100 } })
  wrappers.push(wrapper)
  await flushPromises()
  await wrapper.setProps({ value: 400.25 })
  await frame(100)
  await frame(200)
  reduced = true
  media.dispatchEvent(Object.assign(new Event('change'), { matches: true, media: media.media }))
  await nextTick()
  expect(wrapper.attributes('aria-label')).toBe('400.25')
  expect(frames.size).toBe(0)
  await wrapper.setProps({ value: -12.5 })
  expect(wrapper.attributes('aria-label')).toBe('-12.5')
  expect(frames.size).toBe(0)
})

it('digital flop replaces a fast second target decreases to the final decimal and cancels on unmount', async () => {
  const wrapper = mount(NvDigitalFlop, { props: { value: 1234.5, suffix: '次' } })
  wrappers.push(wrapper)
  await flushPromises()
  expect(wrapper.attributes('aria-label')).toBe('1,234.5 次')
  await wrapper.setProps({ value: 9876.5 })
  await frame(100)
  await frame(200)
  await wrapper.setProps({ value: 12.25 })
  expect(frames.size).toBe(1)
  await frame(300)
  await frame(900)
  expect(wrapper.attributes('aria-label')).toBe('12.25 次')
  expect(wrapper.text()).toBe('12.25次')
  expect(frames.size).toBe(0)
  await wrapper.setProps({ value: 9000 })
  await frame(1000)
  wrapper.unmount()
  wrappers.pop()
  expect(frames.size).toBe(0)
})

it('digital flop preserves long strings and initial reduced numbers through type changes', async () => {
  reduced = true
  const wrapper = mount(NvDigitalFlop, { props: { value: '12 345.67 · 尚未确认' } })
  wrappers.push(wrapper)
  await flushPromises()
  expect(wrapper.attributes('aria-label')).toBe('12 345.67 · 尚未确认')
  await wrapper.setProps({ value: 0 })
  expect(wrapper.attributes('aria-label')).toBe('0')
  await wrapper.setProps({ value: 12345.67, suffix: '本' })
  expect(wrapper.attributes('aria-label')).toBe('12,345.67 本')
  expect(frames.size).toBe(0)
})

it('sparkline keeps each area reference local even when the random source repeats', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.25)
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h('div', [
          h(NvSparkline, { data: [0, 10], area: true, color: 'red' }),
          h(NvSparkline, { data: [10, 0], area: true, color: 'green' }),
        ]),
    }),
  )
  wrappers.push(wrapper)
  const svgs = wrapper.findAll('svg')
  const ids = svgs.map((svg) => svg.get('linearGradient').attributes('id'))
  expect(new Set(ids).size).toBe(2)
  svgs.forEach((svg, i) => {
    expect(svg.get('path[fill^="url("]').attributes('fill')).toBe(`url(#${ids[i]})`)
    expect(svg.get('stop').attributes('stop-color')).toBe(i === 0 ? 'red' : 'green')
  })
})

it('ring clamps only its arc and keeps zero negative overflow and decimal readings in text and aria', async () => {
  const wrapper = mount(NvRingGauge, { props: { value: 100, label: '预订比例' } })
  wrappers.push(wrapper)
  const full = wrapper.get('circle[stroke-linecap]').attributes('stroke-dasharray')
  await wrapper.setProps({ value: 125 })
  expect(wrapper.get('circle[stroke-linecap]').attributes('stroke-dasharray')).toBe(full)
  expect(wrapper.get('svg').attributes('aria-label')).toBe('预订比例 125%')
  expect(wrapper.text()).toContain('125%')
  await wrapper.setProps({ value: -12.3 })
  expect(wrapper.find('circle[stroke-linecap]').exists()).toBe(false)
  expect(wrapper.get('svg').attributes('aria-label')).toBe('预订比例 -12.3%')
  await wrapper.setProps({ value: 0 })
  expect(wrapper.findAll('circle')).toHaveLength(1)
  expect(wrapper.text()).toContain('0%')
  await wrapper.setProps({
    value: 45.67,
    label: '阅读时长',
    suffix: '分钟',
    size: 180,
    valueSize: 32,
  })
  expect(wrapper.get('svg').attributes('aria-label')).toBe('阅读时长 45.7分钟')
  expect(wrapper.text()).toContain('45.7分钟')
  expect(wrapper.element).toHaveProperty('style.width', '180px')
})

it('capsule preserves each raw reading and caption while clamping fills and replacing rows', async () => {
  const wrapper = mount(NvCapsuleBar, {
    props: {
      items: [
        { label: '零次预订', value: 0 },
        { label: '低于基线', value: -5, tone: 'red' },
        { label: '高于目标', value: 125.25, tone: 'indigo' },
        { label: '正常比例', value: 12.5, tone: 'green' },
      ],
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.text()).toBe('零次预订0%低于基线-5%高于目标125.25%正常比例12.5%')
  const fills = wrapper.findAll('[style*="width"]')
  expect(fills.map((fill) => fill.element.getAttribute('style'))).toEqual([
    'width: 100%;',
    'width: 12.5%;',
  ])
  const label = '河畔公共阅读空间的全年累计预约说明'
  await wrapper.setProps({ items: [{ label, value: 3.14159, tone: 'amber' }], suffix: '次' })
  expect(wrapper.text()).toBe(`${label}3.14159次`)
  expect(wrapper.get('[title]').attributes('title')).toBe(label)
  await wrapper.setProps({ items: [] })
  expect(wrapper.text()).toBe('')
  expect(wrapper.find('[style*="width"]').exists()).toBe(false)
})

it('sparkline renders explicit empty and single data as a dash then constant and changing point identities', async () => {
  const wrapper = mount(NvSparkline, { props: { data: [], area: true } })
  wrappers.push(wrapper)
  expect(wrapper.get('line').attributes('stroke-dasharray')).toBe('3 4')
  expect(wrapper.find('path').exists()).toBe(false)
  await wrapper.setProps({ data: [7] })
  expect(wrapper.get('line').attributes('stroke-dasharray')).toBe('3 4')
  await wrapper.setProps({ data: [5, 5], color: 'rebeccapurple' })
  expect(wrapper.get('path[fill="none"]').attributes('d')).toBe('M0.0 50.0 L240.0 50.0')
  expect(wrapper.get('stop').attributes('stop-color')).toBe('rebeccapurple')
  expect(wrapper.attributes('style')).toContain('--nv-scr-sl-color: rebeccapurple')
  await wrapper.setProps({ data: [0, 10, 0], area: false, color: 'orange' })
  expect(wrapper.get('path').attributes('d')).toBe('M0.0 50.0 L120.0 6.0 L240.0 50.0')
  expect(wrapper.find('path[fill^="url("]').exists()).toBe(false)
  expect(wrapper.get('stop').attributes('stop-color')).toBe('orange')
  await wrapper.setProps({ data: [10, 0] })
  expect(wrapper.get('path').attributes('d')).toBe('M0.0 6.0 L240.0 50.0')
  await wrapper.setProps({ data: [] })
  expect(wrapper.find('path').exists()).toBe(false)
  expect(wrapper.get('line').attributes('stroke-dasharray')).toBe('3 4')
})

it('sparkline preserves finite rising falling and relative geometry across overflow range updates', async () => {
  const wrapper = mount(NvSparkline, { props: { data: [-1e308, 1e308], area: true } })
  wrappers.push(wrapper)
  const expectPaths = (line: string, area = true) => {
    const path = wrapper.get('path[fill="none"]')
    expect(path.attributes('d')).toBe(line)
    expect(path.attributes('style')).toContain(line)
    expect(wrapper.find('path[fill^="url("]').exists()).toBe(area)
    if (area) {
      const fill = wrapper.get('path[fill^="url("]')
      expect(fill.attributes('d')).toBe(line + ' L240 56 L0 56 Z')
      expect(fill.attributes('style')).toContain(line + ' L240 56 L0 56 Z')
    }
  }
  expectPaths('M0.0 50.0 L240.0 6.0')
  await wrapper.setProps({ data: [-10, 10] })
  expectPaths('M0.0 50.0 L240.0 6.0')
  await wrapper.setProps({ data: [1e308, -1e308], area: false })
  expectPaths('M0.0 6.0 L240.0 50.0', false)
  await wrapper.setProps({
    data: [-Number.MAX_VALUE, -Number.MAX_VALUE / 2, 0, Number.MAX_VALUE / 2, Number.MAX_VALUE],
    area: true,
  })
  expectPaths('M0.0 50.0 L60.0 39.0 L120.0 28.0 L180.0 17.0 L240.0 6.0')
})

it('sparkline retains constant extremes adjacent finite values and subnormal ordering', async () => {
  const wrapper = mount(NvSparkline, {
    props: { data: [Number.MAX_VALUE, Number.MAX_VALUE], area: true },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('path[fill="none"]').attributes('d')).toBe('M0.0 50.0 L240.0 50.0')
  for (const data of [
    [-Number.MAX_VALUE, -Number.MAX_VALUE],
    [Number.MIN_VALUE, Number.MIN_VALUE],
  ]) {
    await wrapper.setProps({ data })
    expect(wrapper.get('path[fill="none"]').attributes('d')).toBe('M0.0 50.0 L240.0 50.0')
  }
  for (const data of [
    [1e308, 1.0000000000000002e308],
    [-1.0000000000000002e308, -1e308],
  ]) {
    await wrapper.setProps({ data })
    expect(wrapper.get('path[fill="none"]').attributes('d')).toBe('M0.0 50.0 L240.0 6.0')
    expect(wrapper.get('path[fill^="url("]').attributes('d')).toBe(
      'M0.0 50.0 L240.0 6.0 L240 56 L0 56 Z',
    )
  }
  await wrapper.setProps({ data: [-Number.MIN_VALUE, 0, Number.MIN_VALUE] })
  expect(wrapper.get('path[fill="none"]').attributes('d')).toBe('M0.0 50.0 L120.0 28.0 L240.0 6.0')
  expect(wrapper.get('path[fill^="url("]').attributes('d')).toBe(
    'M0.0 50.0 L120.0 28.0 L240.0 6.0 L240 56 L0 56 Z',
  )
})

it('kpi accepts the actual icon component and independent zero and clamped ring inputs with host text', async () => {
  const icon = defineComponent({
    props: ['size'],
    setup: (props) => () =>
      h('svg', { 'aria-label': '阅读图标', width: props.size }, [h('title', '打开一本书')]),
  })
  const wrapper = mount(NvKpiBar, {
    props: {
      items: [
        { icon, value: '尚未统计', label: '累计阅读', tone: 'amber' },
        { value: '0%', label: '预订比例', ring: 0 },
      ],
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('svg[aria-label="阅读图标"]').attributes('width')).toBe('19')
  expect(wrapper.get('title').text()).toBe('打开一本书')
  expect(wrapper.text()).toContain('尚未统计累计阅读')
  const ring = () => wrapper.get('svg[aria-label^="预订比例"]')
  const trackLength = Number(ring().get('circle[stroke-linecap]').attributes('stroke-dasharray'))
  expect(Number(ring().get('circle[stroke-linecap]').attributes('stroke-dashoffset'))).toBe(
    trackLength,
  )
  await wrapper.setProps({
    items: [{ value: '125% · 超出目标', label: '预订比例', ring: 125, tone: 'green' }],
  })
  expect(wrapper.find('svg[aria-label="阅读图标"]').exists()).toBe(false)
  expect(ring().attributes('aria-label')).toBe('预订比例 125% · 超出目标')
  expect(ring().get('circle[stroke-linecap]').attributes('stroke-dashoffset')).toBe('0')
  await wrapper.setProps({
    items: [
      {
        icon,
        value: '由宿主提供的很长很长的数值说明',
        label: '河畔公共阅读空间全年累计到访说明',
        tone: 'cyan',
      },
    ],
  })
  expect(wrapper.text()).toContain('由宿主提供的很长很长的数值说明河畔公共阅读空间全年累计到访说明')
  expect(wrapper.find('circle').exists()).toBe(false)
  await wrapper.setProps({ items: [] })
  expect(wrapper.text()).toBe('')
})

it('status light and tag keep every tone alias equivalent while labels change independently', async () => {
  for (const component of [NvScreenStatusLight, NvScreenStatusTag]) {
    const wrapper = mount(component, { props: { tone: 'cyan', label: '尚未统计' } })
    wrappers.push(wrapper)
    for (const [tone, color] of [
      ['run', 'green'],
      ['idle', 'amber'],
      ['alarm', 'red'],
      ['cyan', 'cyan'],
      ['green', 'green'],
      ['amber', 'amber'],
      ['red', 'red'],
    ] as const) {
      await wrapper.setProps({ tone, label: `空间提示 · ${tone}` })
      expect(wrapper.text()).toBe(`空间提示 · ${tone}`)
      expect(wrapper.classes()).toContain(color)
      await wrapper.setProps({ label: `阅读提示 · ${tone}` })
      expect(wrapper.text()).toBe(`阅读提示 · ${tone}`)
      expect(wrapper.classes()).toContain(color)
    }
  }
})

it('retains legacy defaults without treating explicitly empty arrays as example data', () => {
  const capsule = mount(NvCapsuleBar)
  const kpi = mount(NvKpiBar)
  const tag = mount(NvScreenStatusTag)
  const spark = mount(NvSparkline)
  wrappers.push(capsule, kpi, tag, spark)
  expect(capsule.text()).toContain('焊接线 A93%')
  expect(kpi.text()).toContain('工单总数')
  expect(kpi.text()).toContain('1,284 kWh')
  expect(tag.text()).toBe('运行中')
  expect(tag.classes()).toContain('green')
  expect(spark.get('path').attributes('d')).toContain('L240.0 6.0')
})

it.each([
  [1e-7, '0.0000001'],
  [-1e-7, '-0.0000001'],
  [1.25e-7, '0.000000125'],
  [-1.25e-7, '-0.000000125'],
])(
  'digital flop preserves scientific decimal %s on initial render and reduced updates',
  async (value, expected) => {
    reduced = true
    const wrapper = mount(NvDigitalFlop, { props: { value, suffix: '次' } })
    wrappers.push(wrapper)
    await flushPromises()
    expect(wrapper.text()).toBe(`${expected}次`)
    expect(wrapper.attributes('aria-label')).toBe(`${expected} 次`)
    await wrapper.setProps({ value: 0 })
    expect(wrapper.attributes('aria-label')).toBe('0 次')
    await wrapper.setProps({ value })
    expect(wrapper.text()).toBe(`${expected}次`)
    expect(wrapper.attributes('aria-label')).toBe(`${expected} 次`)
    expect(frames.size).toBe(0)
  },
)

it.each([
  [0, '0'],
  [12.25, '12.25'],
  [-1234.5, '-1,234.5'],
  [1.25e3, '1,250'],
  [1.25e21, '1,250,000,000,000,000,000,000'],
  [1e-20, `0.${'0'.repeat(19)}1`],
  [1.25e-20, `0.${'0'.repeat(19)}125`],
  [1e-100, `0.${'0'.repeat(99)}1`],
  [1e-101, '1e-101'],
  [-1.25e-100, '-1.25e-100'],
  [Number.MIN_VALUE, '5e-324'],
])(
  'digital flop safely formats finite precision boundary %s and keeps strings literal',
  async (value, expected) => {
    reduced = true
    const wrapper = mount(NvDigitalFlop, { props: { value } })
    wrappers.push(wrapper)
    await flushPromises()
    expect(wrapper.text()).toBe(expected)
    expect(wrapper.attributes('aria-label')).toBe(expected)
    await wrapper.setProps({ value: '00.00000010e+0 · 待核对' })
    expect(wrapper.text()).toBe('00.00000010e+0 · 待核对')
    await wrapper.setProps({ value })
    expect(wrapper.attributes('aria-label')).toBe(expected)
    expect(frames.size).toBe(0)
  },
)

it('digital flop settles tiny rapid decreasing targets across normal reduced literal and remount transitions', async () => {
  const wrapper = mount(NvDigitalFlop, { props: { value: 1234.5, suffix: '次' } })
  wrappers.push(wrapper)
  await flushPromises()
  await wrapper.setProps({ value: 1.25e-7 })
  await frame(86400000)
  await frame(86400200)
  await wrapper.setProps({ value: -1e-7 })
  await frame(86400216)
  await frame(86400816)
  expect(wrapper.text()).toBe('-0.0000001次')
  expect(wrapper.attributes('aria-label')).toBe('-0.0000001 次')
  expect(frames.size).toBe(0)
  await wrapper.setProps({ value: 1.25e-7 })
  await frame(86401000)
  reduced = true
  media.dispatchEvent(Object.assign(new Event('change'), { matches: true }))
  await nextTick()
  expect(wrapper.text()).toBe('0.000000125次')
  expect(wrapper.attributes('aria-label')).toBe('0.000000125 次')
  expect(frames.size).toBe(0)
  await wrapper.setProps({ value: '极小读数 · 待确认' })
  expect(wrapper.text()).toBe('极小读数 · 待确认次')
  await wrapper.setProps({ value: 1e-7 })
  expect(wrapper.attributes('aria-label')).toBe('0.0000001 次')
  reduced = false
  media.dispatchEvent(Object.assign(new Event('change'), { matches: false }))
  await nextTick()
  await wrapper.setProps({ value: -1.25e-7 })
  await frame(86401200)
  await frame(86401800)
  expect(wrapper.attributes('aria-label')).toBe('-0.000000125 次')
  await wrapper.setProps({ value: 1e-7 })
  wrapper.unmount()
  wrappers.pop()
  expect(frames.size).toBe(0)
  const remounted = mount(NvDigitalFlop, { props: { value: 1.25e-7 } })
  wrappers.push(remounted)
  expect(remounted.text()).toBe('0.000000125')
  expect(frames.size).toBe(0)
})

it('digital flop reaches finite extreme and subnormal targets without overflow or endpoint cancellation', async () => {
  const wrapper = mount(NvDigitalFlop, { props: { value: Number.MAX_VALUE } })
  wrappers.push(wrapper)
  await flushPromises()
  expect(wrapper.attributes('aria-label')).not.toMatch(/NaN|∞|Infinity/)
  await wrapper.setProps({ value: -Number.MAX_VALUE })
  await frame(100)
  await frame(300)
  expect(wrapper.attributes('aria-label')).not.toMatch(/NaN|∞|Infinity/)
  await frame(700)
  expect(Number((wrapper.attributes('aria-label') ?? '').replaceAll(',', ''))).toBe(
    -Number.MAX_VALUE,
  )
  await wrapper.setProps({ value: Number.MIN_VALUE })
  await frame(800)
  await frame(1400)
  expect(wrapper.text()).toBe('5e-324')
  expect(wrapper.attributes('aria-label')).toBe('5e-324')
  expect(frames.size).toBe(0)
})

it('digital flop keeps grouped intermediate readings beyond portable Intl precision', async () => {
  const wrapper = mount(NvDigitalFlop, { props: { value: 1234.5 } })
  wrappers.push(wrapper)
  await flushPromises()
  await wrapper.setProps({ value: 1.25e-20 })
  await frame(100)
  expect(wrapper.text()).toBe('1,234.5000000000000000000000')
  expect(wrapper.attributes('aria-label')).toBe('1,234.5000000000000000000000')
  await frame(700)
  expect(wrapper.text()).toBe(`0.${'0'.repeat(19)}125`)
  expect(frames.size).toBe(0)
})

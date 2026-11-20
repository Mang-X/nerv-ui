import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { NvScreenTrendChart, NvScreenBarChart, NvScreenDonut, NvScreenPareto } from '@nerv-ui/ui'

beforeEach(() =>
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })),
)

const mounted: ReturnType<typeof mount>[] = []
afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
function chart(component: any, props: any = {}, slots: any = {}) {
  const w = mount(component, { props, slots })
  mounted.push(w)
  return w
}
function rect(w: ReturnType<typeof mount>, selector: string) {
  vi.spyOn(w.get(selector).element, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    top: 30,
    width: 940,
    height: 300,
    right: 1040,
    bottom: 330,
    x: 100,
    y: 30,
    toJSON() {},
  })
}

it('Trend retains its default pin but explicit false and empty data never show historical readings', async () => {
  const w = chart(NvScreenTrendChart)
  expect(w.get('.nv-scr-tc-cardh').text()).toContain('1,086')
  await w.setProps({ tooltip: false })
  expect(w.find('.nv-scr-tc-cardh').exists()).toBe(false)
  await w.setProps({ tooltip: undefined, actual: [], plan: [], series: [] })
  expect(w.find('.nv-scr-tc-cardh').exists()).toBe(false)
  expect(w.get('.nv-scr-tc-act').attributes('d')).toBe('')
})

it('Trend opens the plot midpoint card into the available container half with its full label and extra reading', async () => {
  const label = 'W'.repeat(120)
  const w = chart(NvScreenTrendChart, {
    actual: [10, 50, 90],
    plan: [20, 60, 100],
    series: [{ label: 'extra', color: 'red', data: [7, 41, 67] }],
    hoverLabels: ['L', label, 'R'],
    yLabels: ['100', '80', '60', '40', '20', '0'],
    tooltip: false,
    tabs: false,
  })
  rect(w, 'svg')
  await w.get('svg').trigger('mousemove', { clientX: 593 })
  expect(w.get('.nv-scr-tc-cardh').classes('flip')).toBe(true)
  expect(w.get('.nv-scr-tc-c-t').text()).toBe(label)
  expect(w.get('.nv-scr-tc-c-a b').text()).toBe('50')
  expect(w.get('.nv-scr-tc-c-p b').text()).toBe('60')
  expect(w.get('.nv-scr-tc-c-s').text()).toBe('extra41')
  await w.get('svg').trigger('mouseleave')
  expect(w.find('.nv-scr-tc-cardh').exists()).toBe(false)
})

it.each([
  { count: 3, index: 0, flip: false },
  { count: 3, index: 2, flip: true },
  { count: 5, index: 1, flip: false },
  { count: 5, index: 2, flip: true },
  { count: 5, index: 3, flip: true },
  { count: 41, index: 18, flip: false },
  { count: 41, index: 19, flip: true },
  { count: 41, index: 20, flip: true },
  { count: 41, index: 21, flip: true },
])(
  'Trend places point $index of $count into the available container half with current readings',
  async ({ count, index, flip }) => {
    const actual = Array.from({ length: count }, (_, i) => 10 + i)
    const labels = actual.map((_, i) => `source/day/p${i + 1}`)
    const w = chart(NvScreenTrendChart, {
      actual,
      plan: actual.map((v) => v + 100),
      series: [{ label: 'extra', color: 'red', data: actual.map((v) => v + 200) }],
      hoverLabels: labels,
      tooltip: false,
      tabs: false,
    })
    rect(w, 'svg')
    await w.get('svg').trigger('mousemove', { clientX: 146 + (894 * index) / (count - 1) })
    expect(w.get('.nv-scr-tc-cardh').classes('flip')).toBe(flip)
    expect(w.get('.nv-scr-tc-c-t').text()).toBe(labels[index])
    expect(w.get('.nv-scr-tc-c-a b').text()).toBe(String(10 + index))
    expect(w.get('.nv-scr-tc-c-p b').text()).toBe(String(110 + index))
    expect(w.get('.nv-scr-tc-c-s').text()).toBe(`extra${210 + index}`)
  },
)

it('Trend shares point slots across short series and recomputes a held pointer through short empty and recovered data', async () => {
  const w = chart(NvScreenTrendChart, {
    actual: [0, 17, 100],
    plan: [11],
    series: [{ label: '线上', color: 'red', data: [5, 9] }],
    tooltip: false,
    hoverLabels: ['A-1', 'A-2', 'A-3'],
    yLabels: ['100', '50', '0'],
  })
  rect(w, 'svg')
  await w.get('svg').trigger('mousemove', { clientX: 1040 })
  expect(w.get('.nv-scr-tc-cardh').text()).toContain('A-3')
  expect(w.get('.nv-scr-tc-c-a b').text()).toBe('100')
  expect(w.get('.nv-scr-tc-c-p b').text()).toBe('—')
  expect(w.get('.nv-scr-tc-c-s b').text()).toBe('—')
  expect(w.get('.nv-scr-tc-ser').attributes('d')).toBe('M46.0 272.8 L493.0 262.2')
  await w.setProps({ actual: [0, 41], plan: [19, 37], hoverLabels: ['B-1', 'B-2'], series: [] })
  expect(w.get('.nv-scr-tc-c-t').text()).toBe('B-2')
  expect(w.get('.nv-scr-tc-c-a b').text()).toBe('41')
  await w.setProps({ actual: [], plan: [] })
  expect(w.find('.nv-scr-tc-cardh').exists()).toBe(false)
  await w.setProps({ actual: [0], plan: [], hoverLabels: ['C-1'] })
  expect(w.get('.nv-scr-tc-c-t').text()).toBe('C-1')
  expect(w.get('.nv-scr-tc-c-a b').text()).toBe('0')
  expect(w.get('.nv-scr-tc-c-p b').text()).toBe('—')
  await w.get('svg').trigger('mouseleave')
  expect(w.find('.nv-scr-tc-cardh').exists()).toBe(false)
})

it('Bar shows zero and missing distinctly and held pointer follows replacement slots without old values', async () => {
  const w = chart(NvScreenBarChart, {
    series: [
      { label: '现场', color: 'red', data: [0, 23, 71] },
      { label: '预约', color: 'blue', data: [7] },
    ],
    hoverLabels: ['A1', 'A2', 'A3'],
  })
  rect(w, 'svg')
  await w.get('svg').trigger('mousemove', { clientX: 1039 })
  expect(w.get('.nv-scr-bc-c-t').text()).toBe('A3')
  expect(w.findAll('.nv-scr-bc-c-s b').map((v) => v.text())).toEqual(['71', '—'])
  await w.setProps({ series: [{ label: '新现场', color: 'red', data: [0] }], hoverLabels: ['B1'] })
  expect(w.get('.nv-scr-bc-card').text()).toBe('B1新现场0')
  expect(w.get('.nv-scr-bc-bar').attributes('height')).toBe('0')
  await w.setProps({ series: [] })
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  await w.setProps({
    series: [{ label: '恢复', color: 'red', data: [19, 43] }],
    hoverLabels: ['C1', 'C2'],
  })
  expect(w.get('.nv-scr-bc-card').text()).toBe('C2恢复43')
})

it('Bar observes timer edges pauses for hover resumes on leave reacts to autoplay and motion and disposes', async () => {
  vi.useFakeTimers()
  const listeners = new Set<(e: { matches: boolean }) => void>()
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: (_: string, cb: any) => listeners.add(cb),
    removeEventListener: (_: string, cb: any) => listeners.delete(cb),
  }))
  const interval = vi.spyOn(globalThis, 'setInterval')
  const w = chart(NvScreenBarChart, {
    series: [{ label: 'S', color: 'red', data: [13, 47, 29] }],
    autoplay: true,
    autoplayMs: 120,
  })
  expect(interval).toHaveBeenCalledWith(expect.any(Function), 120)
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  await vi.advanceTimersByTimeAsync(119)
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  expect(w.get('.nv-scr-bc-card').text()).toBe('#1S13')
  await vi.advanceTimersByTimeAsync(120)
  expect(w.get('.nv-scr-bc-card').text()).toBe('#2S47')
  rect(w, 'svg')
  await w.get('svg').trigger('mousemove', { clientX: 1039 })
  await vi.advanceTimersByTimeAsync(240)
  expect(w.get('.nv-scr-bc-card').text()).toBe('#3S29')
  await w.get('svg').trigger('mouseleave')
  await vi.advanceTimersByTimeAsync(120)
  expect(w.get('.nv-scr-bc-card').text()).toBe('#3S29')
  await w.setProps({ autoplay: false })
  expect(vi.getTimerCount()).toBe(0)
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  await w.setProps({ autoplay: true })
  listeners.forEach((cb) => cb({ matches: true }))
  await vi.advanceTimersByTimeAsync(240)
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  expect(vi.getTimerCount()).toBe(0)
  listeners.forEach((cb) => cb({ matches: false }))
  await vi.advanceTimersByTimeAsync(120)
  expect(w.get('.nv-scr-bc-card').text()).toBe('#1S13')
  w.unmount()
  mounted.splice(mounted.indexOf(w), 1)
  expect(vi.getTimerCount()).toBe(0)
  expect(listeners.size).toBe(0)
})

it('Donut preserves subunit and huge finite ratios across zero single reordered and replaced segments with center and legend', async () => {
  const w = chart(
    NvScreenDonut,
    { segments: [{ label: '书籍', color: 'red', value: 0.2 }] },
    { default: '<b>宿主合计 0.2</b>' },
  )
  const lengths = () =>
    w.findAll('.nv-scr-dn-arc').map((a) => Number(a.attributes('stroke-dasharray')!.split(' ')[0]))
  expect(lengths()[0]).toBeCloseTo(326.726, 2)
  expect(w.get('.nv-scr-dn-center').text()).toBe('宿主合计 0.2')
  expect(w.get('.nv-scr-dn-legend').text()).toBe('书籍0.2')
  await w.setProps({
    segments: [
      { label: '书籍', color: 'red', value: 0 },
      { label: '影像', color: 'blue', value: 0 },
    ],
  })
  expect(lengths()).toEqual([0, 0])
  await w.setProps({
    segments: [
      { label: '影像', color: 'blue', value: 1e308 },
      { label: '书籍', color: 'red', value: 1e308 },
    ],
  })
  expect(lengths()[0]).toBeCloseTo(160.863, 2)
  expect(lengths()[1]).toBeCloseTo(160.863, 2)
  expect(w.findAll('.nv-scr-dn-l').map((a) => a.text())).toEqual(['影像', '书籍'])
  await w.setProps({
    segments: [
      { label: '影像', color: 'blue', value: 3 },
      { label: '书籍', color: 'red', value: 1 },
    ],
    legend: false,
  })
  expect(lengths()[0]).toBeCloseTo(242.544, 2)
  expect(w.find('.nv-scr-dn-legend').exists()).toBe(false)
  await w.setProps({ segments: [] })
  expect(lengths()).toEqual([])
})

it('Pareto preserves input order and host percentages while distinguishing omitted total from explicit zero', async () => {
  const w = chart(NvScreenPareto, {
    items: [
      { label: '影像', sub: 'host-b', count: 0.2, pct: 20 },
      { label: '书籍', sub: 'host-a', count: 0.6, pct: 60 },
    ],
    unit: '份',
  })
  expect(w.findAll('.nv-scr-pa-name').map((a) => a.text())).toEqual(['影像', '书籍'])
  expect(w.findAll('.nv-scr-pa-cum').map((a) => a.text())).toEqual(['Σ 20.0%', 'Σ 80.0%'])
  expect(w.findAll('.nv-scr-pa-fill')[1].attributes('style')).toContain('width: 100%')
  expect(w.find('.nv-scr-pa-tail').exists()).toBe(false)
  await w.setProps({ total: 1 })
  expect(w.get('.nv-scr-pa-tail').text()).toContain('长尾 0.19999999999999996 份 · 20.0%')
  await w.setProps({ items: [{ label: '空项', count: 0, pct: 0 }], total: 0 })
  expect(w.get('.nv-scr-pa-tail').text()).toBe('长尾 0 份 · 0.0%')
  expect(w.get('.nv-scr-pa-fill').attributes('style')).toContain('width: 0%')
  await w.setProps({ items: [], total: undefined })
  expect(w.get('.nv-scr-pa-sum').text()).toBe('TOP0 合计 0.0%')
})

it('Trend and Bar retain meaningful finite geometry near the numeric upper bound with isolated instance gradients', async () => {
  const a = chart(NvScreenTrendChart, { actual: [0, 1.7e308], plan: [], tooltip: false })
  const b = chart(NvScreenTrendChart, { actual: [0, 5], plan: [], tooltip: false })
  expect(a.get('.nv-scr-tc-act').attributes('d')).toBe('M46.0 286.0 L940.0 22.0')
  expect(a.get('linearGradient').attributes('id')).not.toBe(
    b.get('linearGradient').attributes('id'),
  )
  expect(a.get('.nv-scr-tc-area').attributes('fill')).toBe(
    `url(#${a.get('linearGradient').attributes('id')})`,
  )
  const c = chart(NvScreenBarChart, {
    series: [{ label: 'large', color: 'red', data: [1.7e308, 0] }],
  })
  const d = chart(NvScreenBarChart, { series: [{ label: 'other', color: 'blue', data: [7] }] })
  expect(c.findAll('.nv-scr-bc-bar')[0].attributes('height')).toBe('128')
  expect(c.findAll('.nv-scr-bc-bar')[1].attributes('height')).toBe('0')
  expect(c.get('linearGradient').attributes('id')).not.toBe(
    d.get('linearGradient').attributes('id'),
  )
})

it('Trend nearest point boundaries and Bar same slot expose every current series without borrowing adjacent labels', async () => {
  const w = chart(NvScreenTrendChart, {
    actual: [0, 73, 19],
    plan: [31, 97, 41],
    series: [{ label: 'E', color: 'red', data: [11, 23, 47] }],
    hoverLabels: ['point-A', 'point-B', 'point-C'],
    tooltip: false,
  })
  rect(w, 'svg')
  for (const [clientX, label, values] of [
    [146, 'point-A', ['0', '31', '11']],
    [369, 'point-A', ['0', '31', '11']],
    [370, 'point-B', ['73', '97', '23']],
    [816, 'point-B', ['73', '97', '23']],
    [817, 'point-C', ['19', '41', '47']],
    [1040, 'point-C', ['19', '41', '47']],
  ] as const) {
    await w.get('svg').trigger('mousemove', { clientX })
    expect(w.get('.nv-scr-tc-c-t').text()).toBe(label)
    expect(
      w
        .get('.nv-scr-tc-cardh')
        .findAll('b')
        .map((b) => b.text()),
    ).toEqual(values)
  }
  const b = chart(NvScreenBarChart, {
    series: [
      { label: 'A', color: 'red', data: [0, 73, 19] },
      { label: 'B', color: 'blue', data: [31, 97, 41] },
    ],
    hoverLabels: ['point-A', 'point-B', 'point-C'],
  })
  rect(b, 'svg')
  for (const [clientX, label, values] of [
    [100, 'point-A', ['0', '31']],
    [570, 'point-B', ['73', '97']],
    [1039, 'point-C', ['19', '41']],
  ] as const) {
    await b.get('svg').trigger('mousemove', { clientX })
    expect(b.get('.nv-scr-bc-c-t').text()).toBe(label)
    expect(
      b
        .get('.nv-scr-bc-card')
        .findAll('b')
        .map((v) => v.text()),
    ).toEqual(values)
  }
})

it('reduced motion at mount never registers autoplay but preserves manual Bar reading', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }))
  const interval = vi.spyOn(globalThis, 'setInterval')
  const w = chart(NvScreenBarChart, {
    series: [{ label: 'A', color: 'red', data: [17] }],
    autoplay: true,
  })
  expect(interval).not.toHaveBeenCalled()
  expect(w.find('.nv-scr-bc-card').exists()).toBe(false)
  rect(w, 'svg')
  await w.get('svg').trigger('mousemove', { clientX: 300 })
  expect(w.get('.nv-scr-bc-card').text()).toBe('#1A17')
})

it('Pareto explicit zero total displays a zero denominator tail instead of hiding the summary', () => {
  const w = chart(NvScreenPareto, { items: [], total: 0, unit: '次' })
  expect(w.get('.nv-scr-pa-sum').text()).toContain('TOP0 合计 0.0%')
  expect(w.get('.nv-scr-pa-tail').text()).toBe('长尾 0 次 · 0.0%')
})

// F1: the HTML card is limited to a half chart; the right half must open left.
it.each([
  { slot: 1, value: '11', flip: false },
  { slot: 6, value: '47', flip: false },
  { slot: 7, value: '59', flip: true },
  { slot: 8, value: '67', flip: true },
  { slot: 12, value: '103', flip: true },
])(
  'Bar places slot $slot tooltip into the available half without changing its label or readings',
  async ({ slot, value, flip }) => {
    const labels = Array.from({ length: 12 }, (_, i) =>
      i === 6 ? 'W'.repeat(100) : `source/day/p${i + 1}`,
    )
    const w = chart(NvScreenBarChart, {
      series: [
        {
          label: 'source-A',
          color: 'red',
          data: [11, 17, 23, 31, 41, 47, 59, 67, 73, 83, 97, 103],
        },
      ],
      hoverLabels: labels,
      autoplay: false,
    })
    rect(w, 'svg')
    await w.get('svg').trigger('mousemove', { clientX: 100 + (940 * (slot - 0.5)) / 12 })
    expect(w.get('[role="tooltip"]').classes('flip')).toBe(flip)
    expect(w.get('.nv-scr-bc-c-t').text()).toBe(labels[slot - 1])
    expect(w.get('.nv-scr-bc-c-s b').text()).toBe(value)
    await w.get('svg').trigger('mouseleave')
    expect(w.find('[role="tooltip"]').exists()).toBe(false)
  },
)

it('Bar keeps the exact midpoint tooltip on the right with all current series readings', async () => {
  const w = chart(NvScreenBarChart, {
    series: [
      { label: 'current', color: 'red', data: [11, 17, 23] },
      { label: 'comparison', color: 'blue', data: [29, 31, 41] },
    ],
    hoverLabels: ['left', 'middle', 'right'],
  })
  rect(w, 'svg')
  await w.get('svg').trigger('mousemove', { clientX: 570 })
  expect(w.get('[role="tooltip"]').classes('flip')).toBe(false)
  expect(w.get('.nv-scr-bc-c-t').text()).toBe('middle')
  expect(w.findAll('.nv-scr-bc-c-s b').map((v) => v.text())).toEqual(['17', '31'])
})

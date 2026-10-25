import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { NvOeeHero, NvScreenStatusCard, NvTaktGantt } from '@nerv-iip/ui'
const wrappers: ReturnType<typeof mount>[] = []
function render(component: any, props: any = {}) {
  const w = mount(component, { props })
  wrappers.push(w)
  return w
}
afterEach(() => wrappers.splice(0).forEach((w) => w.unmount()))
const legacy = {
  name: '焊接线 A',
  state: '运行',
  label: '运行中',
  tone: 'run',
  plan: '1,240',
  actual: '1,156',
  rate: '93.2%',
  downtime: '0 分钟',
}
it('hero legacy minus prefix and default spark remain while explicit empty removes spark', async () => {
  const w = render(NvOeeHero, { label: 'OEE', value: 92.4, unit: '%', delta: '-2.7%' })
  expect(w.get('.nv-scr-oeh-val').text()).toBe('92.4%')
  expect(w.get('.nv-scr-oeh-delta').classes()).toContain('down')
  expect(w.find('svg').exists()).toBe(true)
  await w.setProps({ delta: '较昨日 -5%', spark: [] })
  expect(w.get('.nv-scr-oeh-delta').classes()).not.toContain('down')
  expect(w.find('svg').exists()).toBe(false)
})
it('hero explicit tone expresses improving decrease and updates independent of delta text', async () => {
  const w = render(NvOeeHero, {
    label: '费用',
    value: '—',
    delta: '较昨日 -5%',
    deltaTone: 'positive',
    spark: [],
  })
  expect(w.get('.nv-scr-oeh-delta').attributes('data-tone')).toBe('positive')
  expect(w.get('.nv-scr-oeh-val').text()).toBe('—')
  await w.setProps({ delta: '+3%', deltaTone: 'negative', value: 0, spark: [2, 1] })
  expect(w.get('.nv-scr-oeh-delta').attributes('data-tone')).toBe('negative')
  expect(w.get('.nv-scr-oeh-val').text()).toBe('0')
  expect(w.find('svg').exists()).toBe(true)
  await w.setProps({ deltaTone: 'neutral' })
  expect(w.get('.nv-scr-oeh-delta').attributes('data-tone')).toBe('neutral')
  await w.setProps({ delta: '' })
  expect(w.find('.nv-scr-oeh-delta').exists()).toBe(false)
})
it('two heroes retain separate gradient references while source and spark change', async () => {
  const Host = defineComponent({
    props: ['spark', 'value'],
    setup: (props) => () =>
      h('div', [
        h(NvOeeHero, { label: '访问', value: props.value ?? 10, spark: props.spark ?? [1, 2] }),
        h(NvOeeHero, { label: '费用', value: 20, spark: [3, 1] }),
      ]),
  })
  const w = render(Host)
  const ids = w.findAll('linearGradient').map((n) => n.attributes('id'))
  expect(new Set(ids).size).toBe(2)
  expect(w.findAll('path[fill^="url"]').map((n) => n.attributes('fill'))).toEqual(
    ids.map((id) => `url(#${id})`),
  )
  const first = w.findAllComponents(NvOeeHero)[0]!
  const old = first.get('.nv-scr-oeh-line').attributes('d')
  await w.setProps({ spark: [2, 1, 3], value: '1,000,000' })
  expect(first.get('.nv-scr-oeh-val').text()).toBe('1,000,000')
  expect(w.findAllComponents(NvOeeHero)[1]!.get('.nv-scr-oeh-val').text()).toBe('20')
  expect(w.findAll('svg').every((n) => n.attributes('aria-hidden') === 'true')).toBe(true)
  expect(first.get('.nv-scr-oeh-line').attributes('d')).not.toBe(old)
  expect(w.findAll('linearGradient').map((n) => n.attributes('id'))).toEqual(ids)
})
it('status legacy strings labels units and all three palette accents remain', async () => {
  const w = render(NvScreenStatusCard, legacy)
  expect(w.get('.nv-scr-lc-state').text()).toBe('当前状态')
  expect(w.findAll('.nv-scr-lc-stats i').map((n) => n.text())).toEqual([
    '计划产量',
    '实际产量',
    '达成率',
  ])
  expect(w.findAll('.nv-scr-lc-stats b').map((n) => n.text())).toEqual([
    '1,240 件',
    '1,156 件',
    '93.2%',
  ])
  expect(w.get('.nv-scr-lc-foot').text()).toContain('停机时长')
  for (const [tone, accent] of [
    ['run', 'green'],
    ['idle', 'amber'],
    ['alarm', 'red'],
  ]) {
    await w.setProps({ tone })
    expect(w.classes()).toContain(accent)
    expect(w.get('.nv-scr-lc-big').classes()).toContain(tone)
  }
})
it('status covers every fixed domain label and unit then restores omitted defaults', async () => {
  const w = render(NvScreenStatusCard, {
    ...legacy,
    labels: { state: '空间状态', plan: '目标', actual: '当前', rate: '进度', downtime: '持续时间' },
    unit: '人',
    plan: '—',
    actual: '0',
    rate: '—',
    downtime: '—',
  })
  expect(w.get('.nv-scr-lc-state').text()).toBe('空间状态')
  expect(w.findAll('.nv-scr-lc-stats i').map((n) => n.text())).toEqual(['目标', '当前', '进度'])
  expect(w.findAll('.nv-scr-lc-stats b').map((n) => n.text())).toEqual(['— 人', '0 人', '—'])
  expect(w.get('.nv-scr-lc-foot').text()).toBe('持续时间—')
  expect(w.findAll('.nv-scr-panel')).toHaveLength(1)
  expect(w.text()).not.toMatch(/产量|达成率|停机时长|当前状态|件/)
  await w.setProps({ labels: { plan: '预算' }, unit: '' })
  expect(w.get('.nv-scr-lc-stats b').text()).toBe('—')
  expect(w.get('.nv-scr-lc-state').text()).toBe('当前状态')
  expect(w.get('.nv-scr-lc-stats i').text()).toBe('预算')
  await w.setProps({ labels: undefined, unit: undefined })
  expect(w.get('.nv-scr-lc-stats i').text()).toBe('计划产量')
  expect(w.get('.nv-scr-lc-stats b').text()).toBe('— 件')
})
it('takt legacy title axis rows palettes and hover text remain', () => {
  const w = render(NvTaktGantt)
  expect(w.text()).toContain('节拍 Takt 58s')
  expect(w.findAll('.nv-scr-tg-row')).toHaveLength(3)
  expect(w.get('.nv-scr-tg-axis').text()).toContain('09:30')
  expect(w.findAll('.nv-scr-tg-legend span').map((n) => n.text())).toEqual([
    '运行',
    '待机',
    '停机',
    '报警',
  ])
  expect(w.get('.nv-scr-tg-seg').attributes('title')).toBe('焊接线 A · 运行 34%')
})
it('takt neutral labels drive legend and every ordered segment title width and updates', async () => {
  const w = render(NvTaktGantt, {
    title: '空间时段',
    axis: ['开馆', '闭馆'],
    toneLabels: { run: '占用', idle: '开放', stop: '闭馆', alarm: '异常' },
    rows: [
      {
        name: '书房',
        segs: [
          ['run', 25],
          ['idle', 25],
          ['stop', 25],
          ['alarm', 25],
        ],
      },
    ],
  })
  expect(w.findAll('.nv-scr-tg-legend span').map((n) => n.text())).toEqual([
    '占用',
    '开放',
    '闭馆',
    '异常',
  ])
  expect(
    w
      .findAll('.nv-scr-tg-seg')
      .map((n) => [n.attributes('title'), (n.element as HTMLElement).style.width]),
  ).toEqual(['占用', '开放', '闭馆', '异常'].map((label) => [`书房 · ${label} 25%`, '25%']))
  await w.setProps({
    title: '服务时段',
    axis: ['上午', '下午'],
    toneLabels: { run: '服务中', idle: '可预约', stop: '休息', alarm: '暂停' },
    rows: [
      {
        name: '服务台',
        segs: [
          ['alarm', 10],
          ['run', 90],
        ],
      },
    ],
  })
  expect(w.get('.nv-scr-panel-t').text()).toBe('服务时段')
  expect(w.get('.nv-scr-tg-axis').text()).toBe('上午下午')
  expect(w.findAll('.nv-scr-tg-seg').map((n) => n.attributes('title'))).toEqual([
    '服务台 · 暂停 10%',
    '服务台 · 服务中 90%',
  ])
  expect(w.findAll('.nv-scr-tg-seg').map((n) => n.classes().at(-1))).toEqual(['alarm', 'run'])
})
it('takt explicit empty axis rows and segments never restore industrial examples and partial labels fallback', async () => {
  const w = render(NvTaktGantt, { title: '', axis: [], rows: [], toneLabels: { run: '占用' } })
  expect(w.findAll('.nv-scr-tg-row')).toHaveLength(0)
  expect(w.findAll('.nv-scr-tg-axis span')).toHaveLength(0)
  expect(w.text()).not.toMatch(/焊接|装配|CNC|Takt/)
  expect(w.findAll('.nv-scr-tg-legend span').map((n) => n.text())).toEqual([
    '占用',
    '待机',
    '停机',
    '报警',
  ])
  await w.setProps({
    rows: [
      { name: '空时段', segs: [] },
      {
        name: '部分开放',
        segs: [
          ['idle', 0],
          ['run', 50],
        ],
      },
      { name: '全时段', segs: [['stop', 100]] },
    ],
  })
  expect(w.findAll('.nv-scr-tg-row')).toHaveLength(3)
  expect(w.findAll('.nv-scr-tg-seg').map((n) => (n.element as HTMLElement).style.width)).toEqual([
    '0%',
    '50%',
    '100%',
  ])
})

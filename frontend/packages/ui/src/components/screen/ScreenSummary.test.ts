import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { NvOeeHero, NvScreenStatusCard } from '@nerv-iip/ui'
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

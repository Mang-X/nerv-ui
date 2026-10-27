import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import * as ui from '../../index'

it('exports a read only heatmap and preserves threshold boundaries zero and unknown', () => {
  expect(ui).toHaveProperty('NvScreenHeatmap')
  const page = mount(ui.NvScreenHeatmap, {
    props: {
      cells: [54.999, 55, 55.001, 69.999, 70, 70.001, 84.999, 85, 85.001, 0, null].map(
        (value, key) => ({ key, label: '同名', value }),
      ),
      thresholds: [
        { min: 85, label: '高档', tone: 'green' },
        { min: 55, label: '次档', tone: 'amber' },
        { min: 70, label: '中档', tone: 'cyan' },
      ],
      below: { label: '低档', tone: 'red' },
      unknownLabel: '未确认',
    },
  })
  expect(page.findAll('[data-cell-band]').map((el) => el.text())).toEqual([
    '低档',
    '次档',
    '次档',
    '次档',
    '中档',
    '中档',
    '中档',
    '高档',
    '高档',
    '低档',
    '未确认',
  ])
  expect(
    page
      .findAll('[data-cell-value]')
      .slice(-2)
      .map((el) => el.text()),
  ).toEqual(['0', '—'])
  expect(page.find('button, [role="grid"], [role="button"]').exists()).toBe(false)
  page.unmount()
})

it('shows the current keyed value for hover focus replacement removal and independent instances', async () => {
  const cells = Object.freeze([
    { key: 'a', label: '重名', value: 0 },
    { key: 'b', label: '重名', value: -2.1256 },
  ])
  const props = { cells, thresholds: [], below: { label: '来源分档', tone: 'cyan' as const } }
  const page = mount({
    components: { Heatmap: ui.NvScreenHeatmap },
    setup: () => ({ props }),
    template: '<div><Heatmap v-bind="props"/><Heatmap v-bind="props"/></div>',
  })
  const maps = page.findAllComponents(ui.NvScreenHeatmap)
  await maps[0].findAll('[data-heatmap-cell]')[0].trigger('mouseenter')
  expect(maps[0].get('[role="tooltip"]').text()).toBe('重名 · 0 · 来源分档')
  expect(maps[1].find('[role="tooltip"]').exists()).toBe(false)
  await maps[1].findAll('[data-heatmap-cell]')[1].trigger('focus')
  expect(maps[1].get('[role="tooltip"]').text()).toBe('重名 · -2.126 · 来源分档')
  expect(maps[0].get('[role="tooltip"]').attributes('id')).not.toBe(
    maps[1].get('[role="tooltip"]').attributes('id'),
  )
  expect(maps[1].findAll('[data-heatmap-cell]')[1].attributes('aria-describedby')).toBe(
    maps[1].get('[role="tooltip"]').attributes('id'),
  )
  await maps[1].findAll('[data-heatmap-cell]')[1].trigger('blur')
  expect(maps[1].find('[role="tooltip"]').exists()).toBe(false)
  await maps[0].findAll('[data-heatmap-cell]')[1].trigger('mouseenter')
  await maps[0].findAll('[data-heatmap-cell]')[0].trigger('mouseleave')
  expect(maps[0].get('[role="tooltip"]').text()).toContain('-2.126')
  await maps[0].findAll('[data-heatmap-cell]')[1].trigger('mouseleave')
  expect(maps[0].find('[role="tooltip"]').exists()).toBe(false)
  expect(cells[1].value).toBe(-2.1256)
  page.unmount()

  const single = mount(ui.NvScreenHeatmap, { props })
  await single.findAll('[data-heatmap-cell]')[0].trigger('focus')
  const long = '很长的宿主时间标签'.repeat(20)
  await single.setProps({ cells: [{ key: 'a', label: long, value: 1.23456 }] })
  expect(single.get('[role="tooltip"]').text()).toBe(`${long} · 1.235 · 来源分档`)
  await single.setProps({ thresholds: [{ min: 1, label: '替换分档', tone: 'green' }] })
  expect(single.get('[role="tooltip"]').text()).toContain('替换分档')
  await single.setProps({ cells: [] })
  expect(single.find('[role="tooltip"]').exists()).toBe(false)
  await single.setProps({ cells: [{ key: 'a', label: '回来', value: 2 }] })
  expect(single.find('[role="tooltip"]').exists()).toBe(false)
  await single.get('[data-heatmap-cell]').trigger('focus')
  await single.get('[data-heatmap-cell]').trigger('keydown', { key: 'Escape' })
  expect(single.find('[role="tooltip"]').exists()).toBe(false)
  single.unmount()
})

it('renders alternate grids empty single nonfinite values and rejects ambiguous scales without mutation', async () => {
  const thresholds = Object.freeze([
    { min: 10, label: '上档', tone: 'green' as const },
    { min: -2, label: '中档', tone: 'amber' as const },
  ])
  const page = mount(ui.NvScreenHeatmap, {
    props: {
      cells: Array.from({ length: 24 }, (_, key) => ({ key, label: `时段 ${key}`, value: key })),
      thresholds,
      below: { label: '下档', tone: 'red' },
      axisStart: '昨日 10:00（宿主文本）',
      axisEnd: '今日 09:00',
      unit: '小时',
    },
  })
  expect(page.findAll('[data-heatmap-cell]')).toHaveLength(24)
  expect(page.get('.nv-scr-heatmap-grid').attributes('style')).toContain('repeat(6,')
  expect(page.text()).toContain('昨日 10:00（宿主文本）')
  await page.setProps({ columns: 4, cells: [{ key: 'one', label: '一格', value: -2.5 }] })
  expect(page.findAll('[data-heatmap-cell]')).toHaveLength(1)
  expect(page.get('.nv-scr-heatmap-grid').attributes('style')).toContain('repeat(4,')
  expect(page.get('[data-cell-value]').text()).toBe('-2.5小时')
  expect(page.get('[data-cell-band]').text()).toBe('下档')
  expect(thresholds.map((entry) => entry.min)).toEqual([10, -2])
  await page.setProps({
    cells: [null, undefined, NaN, Infinity, -Infinity, '4'].map((value, key) => ({
      key,
      label: '未确认',
      value: value as number,
    })),
  })
  expect(page.findAll('[data-cell-value]').map((el) => el.text())).toEqual([
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
  ])
  expect(page.findAll('[data-cell-band]').map((el) => el.text())).toEqual([
    '未知',
    '未知',
    '未知',
    '未知',
    '未知',
    '未知',
  ])
  for (const invalid of [
    [{ min: NaN, label: '无效', tone: 'red' as const }],
    [
      { min: 1, label: '甲', tone: 'green' as const },
      { min: 1, label: '乙', tone: 'green' as const },
    ],
  ]) {
    await page.setProps({
      cells: [{ key: 0, label: '可读的真实值', value: 3 }],
      thresholds: invalid,
    })
    expect(page.get('[data-cell-value]').text()).toBe('3小时')
    expect(page.get('[data-cell-band]').text()).toBe('未知')
    expect(page.get('.nv-scr-heatmap-legend').text()).toBe('未知')
  }
  await page.setProps({ cells: [], emptyLabel: '暂无此时段', columns: 0 })
  expect(page.get('[role="status"]').text()).toBe('暂无此时段')
  expect(page.findAll('[data-heatmap-cell]')).toHaveLength(0)
  expect(page.get('.nv-scr-heatmap-grid').attributes('style')).toContain('repeat(6,')
  page.unmount()
})

it('keeps tooltip descriptions local across independent Vue roots and remounts', async () => {
  const { createApp, h, nextTick } = await import('vue')
  const roots = [document.createElement('div'), document.createElement('div')]
  roots.forEach((root) => document.body.append(root))
  const props = {
    cells: [{ key: 'same', label: '同名', value: 0 }],
    thresholds: [],
    below: { label: '来源', tone: 'cyan' as const },
  }
  const apps = roots.map((root) => {
    const app = createApp({ render: () => h(ui.NvScreenHeatmap, props) })
    app.mount(root)
    return app
  })
  await nextTick()
  roots.forEach((root) => root.querySelector<HTMLElement>('[data-heatmap-cell]')!.focus())
  // Focus the first again with an explicit event, so both independent roots have active records.
  roots[0]!.querySelector('[data-heatmap-cell]')!.dispatchEvent(new FocusEvent('focus'))
  await nextTick()
  const ids = roots.map((root) => root.querySelector('[role="tooltip"]')!.id)
  expect(new Set(ids).size).toBe(2)
  for (const root of roots)
    expect(root.querySelector('[data-heatmap-cell]')!.getAttribute('aria-describedby')).toBe(
      root.querySelector('[role="tooltip"]')!.id,
    )
  apps.forEach((app) => app.unmount())
  const replacement = createApp({ render: () => h(ui.NvScreenHeatmap, props) })
  replacement.mount(roots[0]!)
  await nextTick()
  roots[0]!.querySelector<HTMLElement>('[data-heatmap-cell]')!.focus()
  await nextTick()
  expect(ids).not.toContain(roots[0]!.querySelector('[role="tooltip"]')!.id)
  replacement.unmount()
  roots.forEach((root) => root.remove())
})

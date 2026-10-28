import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { NvScreenStageFlow } from '../../index'

it('shows host labels and quantities without inventing status or unknown values', () => {
  const page = mount(NvScreenStageFlow, {
    props: {
      stages: [
        { key: 'zero', label: '报名', value: 0 },
        {
          key: 'minus',
          label: '调整',
          value: -2.1256,
          status: { label: '需要关注', tone: 'amber' },
        },
        { key: 'unknown', label: '待确认', value: null },
      ],
    },
  })
  expect(page.findAll('[data-stage-value]').map((el) => el.text())).toEqual(['0', '-2.126', '—'])
  expect(page.text()).toContain('需要关注')
  expect(page.findAll('[data-stage-connector]')).toHaveLength(2)
  expect(page.findAll('button, a, [tabindex]')).toHaveLength(0)
})

it('keeps keyed stages and host data intact through reorder replacement empty and single states', async () => {
  const stages = [
    { key: 'a', label: '重名', value: 1.25 },
    { key: 'b', label: '重名', value: 2000 },
  ]
  const page = mount(NvScreenStageFlow, { props: { stages, connector: '→' } })
  const first = page.findAll('[data-stage]')[0].element
  await page.setProps({ stages: [stages[1], stages[0]] })
  expect(page.findAll('[data-stage]')[1].element).toBe(first)
  expect(page.findAll('[data-stage-value]').map((el) => el.text())).toEqual(['2,000', '1.25'])
  expect(stages.map((stage) => stage.value)).toEqual([1.25, 2000])
  expect(page.get('[data-stage-connector]').text()).toBe('→')
  const label = '很长的阶段名称'.repeat(12)
  const status = '等待来源确认'.repeat(12)
  await page.setProps({
    stages: [{ key: 'new', label, value: undefined, status: { label: status, tone: 'red' } }],
  })
  expect(page.text()).toContain(label)
  expect(page.text()).toContain(status)
  expect(page.get('[data-stage-value]').text()).toBe('—')
  expect(page.findAll('[data-stage-connector]')).toHaveLength(0)
  await page.setProps({ stages: [] })
  expect(page.findAll('[data-stage]')).toHaveLength(0)
  expect(page.findAll('[data-stage-connector]')).toHaveLength(0)
})

it('rejects non numeric runtime quantities and allows explicitly hidden connectors', () => {
  const page = mount(NvScreenStageFlow, {
    props: {
      stages: [NaN, Infinity, -Infinity, '12', undefined].map((value, key) => ({
        key,
        label: `来源 ${key}`,
        value: value as number,
      })),
      connector: '',
    },
  })
  expect(page.findAll('[data-stage-value]').map((el) => el.text())).toEqual([
    '—',
    '—',
    '—',
    '—',
    '—',
  ])
  expect(page.findAll('[data-stage-connector]')).toHaveLength(0)
  expect(page.findAll('.nv-scr-tag')).toHaveLength(0)
})

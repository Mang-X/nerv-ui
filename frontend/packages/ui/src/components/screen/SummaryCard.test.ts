import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NvScreenSummaryCard, type ScreenSummaryMetric } from '../../index'

const metrics: ScreenSummaryMetric[] = [
  { key: 'zero', label: '同名', value: 0 },
  { key: 'unknown', label: '同名', value: null },
  { key: 'negative', label: '调整', value: -1.23456, unit: '%' },
]
const base = { identity: 'stable-a', title: '河岸空间', metrics }

describe('public summary card source capabilities', () => {
  it('launcher keeps zero unknown literal metrics explicit status chips and host action identity', async () => {
    const page = mount(NvScreenSummaryCard, {
      props: {
        ...base,
        variant: 'launcher',
        description: '今日开放',
        status: { label: '待确认', tone: 'amber' },
        chipsLabel: '区域',
        chips: [{ key: 'east', label: '东侧', tone: 'green' }],
        actionLabel: '查看空间',
      },
      slots: { icon: '<span>◇</span>' },
    })
    expect(page.findAll('[data-summary-value]').map((v) => v.text())).toEqual([
      '0',
      '—',
      '-1.235 %',
    ])
    expect(page.text()).toContain('待确认')
    expect(page.text()).toContain('东侧')
    expect(page.text()).toContain('◇')
    await page.get('button').trigger('click')
    expect(page.emitted('action')).toEqual([['stable-a']])
    expect(page.get('button').attributes('aria-label')).toBe('查看空间：河岸空间')
    expect(metrics[2].value).toBe(-1.23456)
    page.unmount()
  })
  it('health retains primary comparison secondary values and clamps only the progress drawing', async () => {
    const page = mount(NvScreenSummaryCard, {
      props: {
        ...base,
        variant: 'health',
        primary: { key: 'rate', label: '完成比例', value: 123.4567, unit: '%' },
        comparison: [
          { key: 'actual', label: '已完成', value: 4 },
          { key: 'plan', label: '安排', value: null },
        ],
        progress: 123.4567,
      },
    })
    expect(page.get('[data-summary-primary]').text()).toContain('123.457 %')
    expect(page.get('[data-summary-progress]').attributes('style')).toContain('width: 100%')
    expect(page.text()).toContain('已完成')
    expect(page.text()).toContain('安排')
    await page.setProps({ progress: -12.5 })
    expect(page.get('[data-summary-progress]').attributes('style')).toContain('width: 0%')
    await page.setProps({ progress: null })
    expect(page.find('[data-summary-progress]').exists()).toBe(false)
    page.unmount()
  })
  it('line retains literal trend status dot row warning and technical reference on replacement', async () => {
    const page = mount(NvScreenSummaryCard, {
      props: {
        ...base,
        variant: 'line',
        trend: [2, -1, 4],
        trendLabel: '每小时到访',
        reference: 'REF-8',
        dots: [
          { key: 'a', label: '东侧开放', tone: 'green' },
          { key: 'b', label: '西侧待确认', tone: 'amber' },
        ],
        notice: { label: '等待确认开放时间', tone: 'red' },
      },
    })
    const path = page.get('.nv-scr-sl-line').attributes('d')
    expect(page.get('[role="img"]').attributes('aria-label')).toBe('每小时到访')
    expect(page.text()).toContain('东侧开放')
    expect(page.text()).toContain('等待确认开放时间')
    expect(page.text()).toContain('REF-8')
    await page.setProps({ trend: [7, 7, 7], notice: undefined, dots: [] })
    expect(page.get('.nv-scr-sl-line').attributes('d')).not.toBe(path)
    expect(page.findAll('[data-summary-dot]')).toHaveLength(0)
    await page.setProps({ trend: [] })
    expect(page.find('.nv-scr-sl-line').exists()).toBe(false)
    page.unmount()
  })
  it('preserves keyed metric nodes on same-key reorder and handles empty metrics and long text', async () => {
    const page = mount(NvScreenSummaryCard, { props: { ...base, variant: 'launcher' } })
    const first = page.findAll('[data-summary-metric]')[0].element
    await page.setProps({ metrics: [metrics[2], metrics[1], metrics[0]] })
    expect(page.findAll('[data-summary-metric]')[2].element).toBe(first)
    const text = '河岸阅读与展览空间'.repeat(16)
    await page.setProps({
      title: text,
      description: text,
      status: { label: text, tone: 'cyan' },
      actionLabel: text,
      metrics: [],
    })
    expect(page.text()).toContain(text)
    expect(page.get('button').text()).toContain(text)
    expect(page.findAll('[data-summary-metric]')).toHaveLength(0)
    page.unmount()
  })
})

import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { NvActionSummary } from '../../../index'

const Icon = defineComponent({ render: () => h('span', '图标') })
const base = {
  title: '今日安排',
  description: '看看接下来要处理的事项。',
  icon: Icon,
  count: 3,
  unit: '项',
  actionLabel: '查看安排',
  emptyTitle: '今天已清空',
  emptyHint: '新事项到达后会出现在这里。',
  errorTitle: '暂时取不到安排',
  errorHint: '现在无法判断还有多少事项。',
  unavailableTitle: '安排暂不可用',
  unavailableHint: '请稍后查看。',
  items: [
    { key: 'a', primary: '晨间整理', secondary: '09:30 · 今天' },
    { key: 'b', primary: '阅读时间', secondary: '10:00 · 今天' },
  ],
} as const

describe('NvActionSummary public contract', () => {
  it('renders a fixed card with a trusted count, preview, and current action', async () => {
    const wrapper = mount(NvActionSummary, { props: { ...base, state: 'data' } })
    expect(wrapper.attributes('data-state')).toBe('data')
    expect(wrapper.classes()).toContain('h-[19rem]')
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('3项')
    expect(wrapper.findAll('[data-slot="nv-action-summary-item"]')).toHaveLength(2)
    await wrapper.get('button[aria-label="查看安排"]').trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
    expect(wrapper.emitted('retry')).toBeUndefined()
  })

  it('keeps pending, error, and unavailable distinct from an empty result', async () => {
    const wrapper = mount(NvActionSummary, { props: { ...base, state: 'pending' } })
    expect(wrapper.get('[data-state="pending"] [aria-hidden="true"]')).toBeTruthy()
    expect(wrapper.find('[data-slot="nv-action-summary-count"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('今天已清空')

    await wrapper.setProps({ state: 'error' })
    expect(wrapper.get('[role="alert"]').text()).toContain('现在无法判断还有多少事项。')
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('—')
    expect(wrapper.text()).not.toContain('今天已清空')
    await wrapper.get('button[data-slot="nv-button"]').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
    expect(wrapper.emitted('action')).toBeUndefined()

    await wrapper.setProps({ state: 'unavailable' })
    expect(wrapper.get('[role="alert"]').text()).toContain('请稍后查看。')
    expect(wrapper.find('button[data-slot="nv-button"]').exists()).toBe(false)
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('—')

    await wrapper.setProps({ state: 'empty', count: 0 })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('0项')
    expect(wrapper.text()).toContain('今天已清空')
    expect(wrapper.find('button[aria-label="查看安排"]').exists()).toBe(true)
  })

  it('treats invalid counts as unknown while preserving a real zero', async () => {
    const wrapper = mount(NvActionSummary, { props: { ...base, state: 'data', count: Number.NaN } })
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('—')
    await wrapper.setProps({ count: Number.POSITIVE_INFINITY })
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('—')
    await wrapper.setProps({ count: 0 })
    expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe('0项')
  })

  it('keeps data without previews distinct from explicit empty through host replacements', async () => {
    const wrapper = mount(NvActionSummary, {
      props: { ...base, state: 'data', items: [] },
    })

    for (const [count, readout] of [
      [3, '3项'],
      [0, '0项'],
      [null, '—'],
    ] as const) {
      await wrapper.setProps({ state: 'data', count, items: [] })
      expect(wrapper.get('[data-slot="nv-action-summary-count"]').text()).toBe(readout)
      expect(wrapper.text()).toContain('暂无最近预览')
      expect(wrapper.text()).not.toContain('今天已清空')
      expect(wrapper.findAll('[data-slot="nv-action-summary-item"]')).toHaveLength(0)
    }

    await wrapper.setProps({ state: 'empty', count: 0 })
    expect(wrapper.text()).toContain('今天已清空')
    expect(wrapper.text()).not.toContain('暂无最近预览')

    await wrapper.setProps({
      state: 'data',
      count: 3,
      items: [{ key: 'new', primary: '新安排', secondary: '现在' }],
    })
    expect(wrapper.text()).toContain('新安排')
    expect(wrapper.text()).not.toContain('今天已清空')
    expect(wrapper.text()).not.toContain('暂无最近预览')
  })

  it('replaces previews from new host input and caps the visible list at four', async () => {
    const wrapper = mount(NvActionSummary, { props: { ...base, state: 'data' } })
    await wrapper.setProps({
      items: [
        { key: 'c', primary: '新的安排', secondary: '11:30 · 今天' },
        { key: 'd', primary: '散步', secondary: '13:00 · 今天' },
        { key: 'e', primary: '写信', secondary: '14:00 · 今天' },
        { key: 'f', primary: '画画', secondary: '15:00 · 今天' },
        { key: 'g', primary: '多出的安排', secondary: '16:00 · 今天' },
      ],
      actionLabel: '打开新安排',
    })
    expect(wrapper.findAll('[data-slot="nv-action-summary-item"]')).toHaveLength(4)
    expect(wrapper.text()).toContain('新的安排')
    expect(wrapper.text()).not.toContain('晨间整理')
    expect(wrapper.text()).not.toContain('多出的安排')
    await wrapper.get('button[aria-label="打开新安排"]').trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
    expect(wrapper.emitted('retry')).toBeUndefined()
  })
})

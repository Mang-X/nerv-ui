import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NvNotificationInbox } from '../../../index'
const a = {
  key: 'a',
  title: '预约提醒',
  summary: '请带上借阅卡',
  read: false,
  statuses: [{ label: '紧急', tone: 'warning' as const }],
}
const props = { title: '收件箱', items: [a], selectedKey: 'a' }
describe('NvNotificationInbox public contract', () => {
  it('distinguishes absent empty loading and error without inventing success', async () => {
    const w = mount(NvNotificationInbox, { props: { title: '收件箱' } })
    expect(w.text()).toContain('尚未提供通知')
    await w.setProps({ items: [] })
    expect(w.text()).toContain('暂无通知')
    await w.setProps({ loading: true })
    expect(w.get('[role=status]').text()).toContain('正在加载')
    await w.setProps({ loading: false, error: '暂时无法读取' })
    expect(w.get('[role=alert]').text()).toBe('暂时无法读取')
    await w.get('[data-refresh]').trigger('click')
    expect(w.emitted('refresh')).toEqual([[]])
    expect(w.get('[role=alert]').text()).toBe('暂时无法读取')
  })
  it('keeps selection and read controlled and action separate from open', async () => {
    const w = mount(NvNotificationInbox, { props: { ...props, selectedKey: null } })
    await w.get('[data-open]').trigger('click')
    expect(w.emitted('update:selectedKey')).toEqual([['a']])
    expect(w.find('[data-detail]').exists()).toBe(false)
    await w.get('[data-mark]').trigger('click')
    expect(w.emitted('markRead')?.[0]).toEqual([a])
    expect(w.emitted('open')).toHaveLength(1)
    expect(w.text()).toContain('未读')
    await w.setProps({ selectedKey: 'a', pendingKeys: ['a'] })
    expect(w.get('[data-detail]').text()).toContain(a.summary)
    expect(w.get('[data-mark]').attributes('disabled')).toBeDefined()
    await w.setProps({ pendingKeys: [], items: [{ ...a, read: true }] })
    expect(w.find('[data-mark]').exists()).toBe(false)
    expect(w.text()).toContain('已读')
  })
  it('uses current identity after reorder deletion and same-key replacement', async () => {
    const w = mount(NvNotificationInbox, { props })
    const next = { ...a, title: '预约时间调整', summary: '新的说明' }
    await w.setProps({ items: [{ key: 'b', title: '活动', read: true }, next] })
    expect(w.get('[data-detail]').text()).toContain('新的说明')
    await w.get('[data-detail] [data-mark]').trigger('click')
    expect(w.emitted('markRead')?.[0]).toEqual([next])
    await w.setProps({ items: [] })
    expect(w.find('[data-detail]').exists()).toBe(false)
  })
  it('rejects filter changes until host replaces the value and exposes typed slots', async () => {
    const w = mount(NvNotificationInbox, {
      props: {
        ...props,
        filter: 'all',
        filters: [
          { value: 'all', label: '全部' },
          { value: 'unread', label: '未读' },
        ],
      },
      slots: {
        meta: '<span>阅读室</span>',
        action: '<button>稍后处理</button>',
        detail: '<p>完整内容</p>',
      },
    })
    await w.get('select').setValue('unread')
    expect(w.emitted('update:filter')).toEqual([['unread']])
    expect((w.get('select').element as HTMLSelectElement).value).toBe('all')
    expect(w.text()).toContain('阅读室')
    expect(w.get('[data-detail]').text()).toContain('完整内容')
    await w.setProps({ filter: 'unread' })
    expect((w.get('select').element as HTMLSelectElement).value).toBe('unread')
  })
})

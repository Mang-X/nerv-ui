import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { afterEach, expect, it } from 'vitest'
import { NvAlarmTable, NvScreenPagination, NvScreenTable } from '../../index'

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => wrappers.splice(0).forEach((w) => w.unmount()))
const events = [
  {
    id: 'event-a',
    time: '10:00',
    line: '书房',
    level: 'sev' as const,
    name: '预约变更',
    wo: 'REF-7',
    status: '已恢复',
  },
  {
    id: 'event-b',
    time: '10:01',
    line: '展厅',
    level: 'gen' as const,
    name: '场次更新',
    wo: 'REF-7',
    status: '特别好',
  },
]
it('Alarm neutral headers level text and explicit state slot preserve distinct event identity across reorder replacement and empty', async () => {
  const w = mount(NvAlarmTable, {
    props: {
      rows: events,
      rowKey: 'id',
      title: '空间事件',
      more: '',
      labels: {
        time: '时间',
        line: '空间',
        level: '优先级',
        name: '事件',
        wo: '参考号',
        status: '记录',
      },
      levelLabels: { sev: '优先', gen: '常规' },
    },
    slots: {
      'cell-status': ({ row, value }: { row: Record<string, unknown>; value: string }) =>
        h('label', [
          h('span', `${row.id}:${value}`),
          h('input', { 'aria-label': row.id, value: row.id }),
        ]),
    },
  })
  wrappers.push(w)
  expect(w.findAll('th').map((c) => c.text())).toEqual([
    '时间',
    '空间',
    '优先级',
    '事件',
    '参考号',
    '记录',
  ])
  expect(w.findAll('tbody tr').map((r) => r.text())).toEqual([
    '10:00书房优先预约变更REF-7event-a:已恢复',
    '10:01展厅常规场次更新REF-7event-b:特别好',
  ])
  expect(w.find('.nv-scr-at-ok').exists()).toBe(false)
  const input = w.get('input[aria-label="event-a"]').element
  await w.setProps({ rows: [events[1]!, events[0]!] })
  expect(w.findAll('input').map((n) => n.attributes('aria-label'))).toEqual(['event-b', 'event-a'])
  expect(w.get('input[aria-label="event-a"]').element).toBe(input)
  await w.setProps({ rows: [{ ...events[0]!, id: 'event-c', status: '待阅' }] })
  expect(w.text()).toContain('event-c:待阅')
  expect(w.text()).not.toContain('event-a')
  await w.setProps({ rows: [] })
  expect(w.findAll('tbody tr')).toHaveLength(0)
  await w.setProps({ rows: events })
  expect(w.findAll('tbody tr')).toHaveLength(2)
  expect(w.find('a, button').exists()).toBe(false)
})
it('Pagination invalid sizes use the legacy default without invalid pages or ranges', async () => {
  const w = mount(NvScreenPagination, { props: { total: 31, page: 1, pageSize: 0 } })
  wrappers.push(w)
  for (const size of [0, -3, NaN, Infinity]) {
    await w.setProps({ pageSize: size })
    expect(w.get('nav').text()).toContain('共 31 条 · 1–10')
    expect(w.findAll('button').map((b) => b.text())).toEqual(['', '1', '2', '3', '4', ''])
  }
})
it('legacy Alarm defaults remain six columns five rows and restored state while more is plain text', async () => {
  const w = mount(NvAlarmTable)
  wrappers.push(w)
  expect(w.findAll('th').map((c) => c.text())).toEqual([
    '告警时间',
    '产线',
    '告警级别',
    '告警内容',
    '工单号',
    '状态',
  ])
  expect(w.findAll('tbody tr')).toHaveLength(5)
  expect(w.text()).toContain('WO-2406-0421')
  expect(w.get('.nv-scr-at-ok').text()).toBe('已恢复')
  expect(w.findAll('.nv-scr-at-lvl').map((n) => n.text())).toEqual([
    '严重',
    '一般',
    '一般',
    '严重',
    '一般',
  ])
  expect(w.get('.nv-scr-at-more').element.tagName).toBe('SPAN')
  expect(w.find('a, button').exists()).toBe(false)
  await w.setProps({ more: '', rows: [] })
  expect(w.find('.nv-scr-at-more').exists()).toBe(false)
  expect(w.findAll('tbody tr')).toHaveLength(0)
})
it('Alarm level and state slots own explicit tones regardless of Chinese words and update with input', async () => {
  const w = mount(NvAlarmTable, {
    props: { rows: events, rowKey: 'id' },
    slots: {
      'cell-level': ({ row, value }: { row: Record<string, unknown>; value: string }) =>
        h('span', { class: 'host-level', 'data-id': row.id }, `优先级:${value}`),
      'cell-status': ({ row, value }: { row: Record<string, unknown>; value: string }) =>
        h('span', { class: 'host-neutral', 'data-id': row.id }, value),
    },
  })
  wrappers.push(w)
  expect(w.find('.nv-scr-at-lvl').exists()).toBe(false)
  expect(w.find('.nv-scr-at-ok').exists()).toBe(false)
  expect(w.findAll('.host-neutral').map((n) => n.text())).toEqual(['已恢复', '特别好'])
  await w.setProps({ rows: [{ ...events[0]!, status: '特别坏', level: 'gen' }] })
  expect(w.get('.host-neutral').text()).toBe('特别坏')
  expect(w.get('.host-level').text()).toBe('优先级:gen')
})
it('Table preserves zero empty dash and cell callback identity through keyed reorder replacement and empty', async () => {
  const clicked: unknown[] = []
  const rows = [
    { id: 'a', wo: 'same', count: 0, note: '', action: '—' },
    { id: 'b', wo: 'same', count: 8, note: '—', action: '' },
  ]
  const w = mount(NvScreenTable, {
    props: {
      rowKey: 'id',
      rows,
      columns: [
        { key: 'id', label: '编号' },
        { key: 'count', label: '数量', align: 'right' },
        { key: 'note', label: '备注', align: 'center' },
        { key: 'action', label: '操作' },
      ],
    },
    slots: {
      'cell-action': ({ row, value }: { row: Record<string, unknown>; value: unknown }) =>
        h('button', { onClick: () => clicked.push([row.id, value]) }, `${row.id}:${value}`),
    },
  })
  wrappers.push(w)
  expect(
    w
      .findAll('tbody tr')[0]!
      .findAll('td')
      .map((c) => c.text()),
  ).toEqual(['a', '0', '', 'a:—'])
  expect(w.findAll('th')[1]!.attributes('style')).toContain('text-align: right')
  expect(w.findAll('tbody tr')[0]!.findAll('td')[2]!.attributes('style')).toContain(
    'text-align: center',
  )
  const button = w.findAll('button')[0]!.element
  await w.setProps({ rows: [rows[1]!, rows[0]!] })
  expect(w.findAll('button')[1]!.element).toBe(button)
  await w.findAll('button')[1]!.trigger('click')
  expect(clicked).toEqual([['a', '—']])
  await w.setProps({ rows: [{ id: 'c', count: 0, note: '', action: '' }] })
  await w.get('button').trigger('click')
  expect(clicked).toEqual([
    ['a', '—'],
    ['c', ''],
  ])
  await w.setProps({ rows: [] })
  expect(w.findAll('tbody tr')).toHaveLength(0)
  await w.setProps({ rows })
  expect(w.findAll('tbody tr')).toHaveLength(2)
})
it('Pagination windows boundaries ranges and controlled updates never emit on total replacement', async () => {
  const w = mount(NvScreenPagination, { props: { total: 153, pageSize: 10, page: 1 } })
  wrappers.push(w)
  const numbers = () => w.findAll('.nv-scr-pg-num').map((n) => n.text())
  expect(numbers()).toEqual(['1', '2', '3', '4', '5', '…', '16'])
  expect(w.get('[aria-label="上一页"]').attributes('disabled')).toBeDefined()
  await w.get('[aria-current="page"]').trigger('click')
  expect(w.emitted('update:page')).toBeUndefined()
  await w.get('[aria-label="下一页"]').trigger('click')
  expect(w.emitted('update:page')).toEqual([[2]])
  await w.setProps({ page: 8 })
  expect(numbers()).toEqual(['1', '…', '7', '8', '9', '…', '16'])
  expect(w.get('.nv-scr-pg-total').text()).toBe('共 153 条 · 71–80')
  await w.get('[aria-label="上一页"]').trigger('click')
  expect(w.emitted('update:page')).toEqual([[2], [7]])
  await w.setProps({ page: 16 })
  expect(numbers()).toEqual(['1', '…', '12', '13', '14', '15', '16'])
  expect(w.get('[aria-label="下一页"]').attributes('disabled')).toBeDefined()
  expect(w.get('.nv-scr-pg-total').text()).toBe('共 153 条 · 151–153')
  await w.setProps({ total: 0, page: 1 })
  expect(w.get('.nv-scr-pg-total').text()).toBe('共 0 条 · 0')
  expect(numbers()).toEqual(['1'])
  expect(w.get('[aria-label="下一页"]').attributes('disabled')).toBeDefined()
  expect(w.emitted('update:page')).toEqual([[2], [7]])
  await w.setProps({ total: 23 })
  expect(numbers()).toEqual(['1', '2', '3'])
  expect(w.emitted('update:page')).toEqual([[2], [7]])
})
it('Alarm explicit empty labels level text and status stay empty rather than falling back', async () => {
  const w = mount(NvAlarmTable, {
    props: {
      rows: [{ ...events[0]!, id: 0, status: '' }],
      rowKey: 'id',
      labels: { time: '', status: '' },
      levelLabels: { sev: '' },
    },
  })
  wrappers.push(w)
  expect(w.findAll('th')[0]!.text()).toBe('')
  expect(w.findAll('th')[5]!.text()).toBe('')
  expect(w.get('.nv-scr-at-lvl').text()).toBe('')
  expect(w.findAll('tbody td')[5]!.text()).toBe('')
  await w.setProps({ labels: { time: '时刻' }, levelLabels: { sev: '即时' } })
  expect(w.findAll('th')[0]!.text()).toBe('时刻')
  expect(w.get('.nv-scr-at-lvl').text()).toBe('即时')
})
it('Alarm accepts existing named six field row interfaces without requiring an index signature', () => {
  interface LegacyRow {
    time: string
    line: string
    level: 'sev' | 'gen'
    name: string
    wo: string
    status: string
  }
  const rows: LegacyRow[] = [
    { time: '08:00', line: 'A', level: 'gen', name: '兼容记录', wo: 'WO-1', status: '已恢复' },
  ]
  const w = mount(NvAlarmTable, { props: { rows } })
  wrappers.push(w)
  expect(w.findAll('tbody tr')).toHaveLength(1)
  expect(w.text()).toContain('兼容记录')
})

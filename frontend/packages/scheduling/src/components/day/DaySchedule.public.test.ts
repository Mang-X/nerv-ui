import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { SchedulingDaySchedule, SchedulingDaySheet, type SchedulingDayEntry } from '../../index'

const entries: readonly SchedulingDayEntry[] = Object.freeze([
  {
    semanticKey: 'night',
    assignmentId: 'a-1',
    label: '夜读',
    groupId: 'hall',
    groupLabel: '活动厅',
    startUtc: '2026-11-01T15:00:00Z',
    endUtc: '2026-11-02T16:00:00Z',
    segments: [{ startUtc: '2026-11-01T15:00:00Z', endUtc: '2026-11-02T16:00:00Z' }],
  },
  {
    semanticKey: 'midnight',
    assignmentId: 'a-2',
    label: '闭馆整理',
    groupId: 'hall',
    groupLabel: '活动厅',
    startUtc: '2026-11-01T15:30:00Z',
    endUtc: '2026-11-01T16:00:00Z',
  },
  {
    semanticKey: 'zero',
    assignmentId: 'a-3',
    label: '零时长',
    groupId: 'studio',
    groupLabel: '创作室',
    startUtc: '2026-11-02T02:00:00Z',
    endUtc: '2026-11-02T02:00:00Z',
  },
  {
    semanticKey: 'morning',
    assignmentId: 'a-4',
    label: '晨间创作',
    groupId: 'studio',
    groupLabel: '创作室',
    startUtc: '2026-11-02T01:00:00Z',
    endUtc: '2026-11-02T03:00:00Z',
    quantity: 0,
  },
])

afterEach(() => {
  vi.restoreAllMocks()
  document.body.removeAttribute('data-nv-day-print-owner')
  document.querySelectorAll('.nv-day-print-target').forEach((node) => node.remove())
})

it('public day view uses a half-open factory day and keeps source entries immutable', async () => {
  const original = JSON.stringify(entries)
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '读书会日安排',
    },
  })
  expect(page.get('[data-day-sheet]').text()).toContain('夜读')
  expect(page.get('[data-day-sheet]').text()).toContain('晨间创作')
  expect(page.get('[data-day-sheet]').text()).not.toContain('闭馆整理')
  expect(page.get('[data-day-sheet]').text()).not.toContain('零时长')
  expect(page.get('[data-semantic-key="morning"]').attributes('data-assignment-id')).toBe('a-4')
  expect(page.get('[data-semantic-key="morning"]').text()).toContain('0')
  await page.setProps({ date: '2026-11-03', groupId: 'studio' })
  expect(page.get('[data-day-sheet]').text()).toContain('该日与所选分组没有安排')
  expect(JSON.stringify(entries)).toBe(original)
  page.unmount()
})

it('controlled date and group requests wait for external replacement and reject invalid calendar or timezone', async () => {
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '读书会日安排',
    },
  })
  await page.get('input[type="date"]').setValue('2026-11-03')
  await page.get('select').setValue('studio')
  expect(page.emitted('update:date')?.at(-1)).toEqual(['2026-11-03'])
  expect(page.emitted('update:groupId')?.at(-1)).toEqual(['studio'])
  expect(page.get('input[type="date"]').element).toHaveProperty('value', '2026-11-02')
  expect(page.get('[data-day-sheet]').text()).toContain('夜读')
  await page.setProps({ date: '2026-02-30', timezone: '' })
  expect(page.text()).toContain('日期或时区未解析')
  expect(page.get('[data-action="print-day"]').attributes('disabled')).toBeDefined()
  page.unmount()
})

it.each([
  ['invalid calendar date', '2026-02-30', 'Asia/Shanghai'],
  ['missing timezone', '2026-11-02', ''],
  ['unknown IANA timezone', '2026-11-02', 'Unknown/Nowhere'],
])(
  '%s is unresolved rather than an empty day and recovers on valid input',
  async (_case, date, timezone) => {
    const original = JSON.stringify(entries)
    const page = mount(SchedulingDaySchedule, {
      props: { entries, date, groupId: 'all', timezone, title: '日安排' },
    })
    expect(page.text()).toContain('日期或时区未解析')
    expect(page.text()).not.toContain('该日与所选分组没有安排')
    expect(page.find('[data-day-sheet]').exists()).toBe(false)
    expect(page.get('[data-action="print-day"]').attributes('disabled')).toBeDefined()

    await page.setProps({ date: '2026-11-02', timezone: 'Asia/Shanghai' })
    expect(page.get('[data-day-sheet]').text()).toContain('夜读')
    await page.setProps({ entries: [] })
    expect(page.get('[data-day-sheet]').text()).toContain('该日与所选分组没有安排')
    expect(JSON.stringify(entries)).toBe(original)
    page.unmount()
  },
)

it('nested entry changes cancel the current print without changing source ownership', async () => {
  vi.spyOn(window, 'print').mockImplementation(() => {})
  const mutable = reactive(entries.map((entry) => ({ ...entry })))
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries: mutable,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '日安排',
    },
  })
  await page.get('[data-action="print-day"]').trigger('click')
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(true)
  mutable[0]!.label = '夜读调整'
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  await nextTick()
  expect(document.querySelector('.nv-day-print-target')).toBeNull()
  expect(page.get('[data-day-sheet]').text()).toContain('夜读调整')
  page.unmount()
})

it('readonly replacement cancels print and restored permission permits a new request', async () => {
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '日安排',
    },
  })
  await page.get('[data-action="print-day"]').trigger('click')
  await page.setProps({ readOnly: true })
  expect(page.get('[data-action="print-day"]').attributes('disabled')).toBeDefined()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  await page.setProps({ readOnly: false })
  await page.get('[data-action="print-day"]').trigger('click')
  expect(print).toHaveBeenCalledTimes(2)
  expect(document.querySelectorAll('.nv-day-print-target')).toHaveLength(1)
  window.dispatchEvent(new Event('afterprint'))
  await nextTick()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  page.unmount()
})

it('a cancelled instance cannot leave a target or delayed focus cleanup for the next owner', async () => {
  vi.useFakeTimers()
  try {
    vi.spyOn(window, 'print').mockImplementation(() => {})
    const props = { entries, date: '2026-11-02', groupId: 'all', timezone: 'Asia/Shanghai' }
    const one = mount(SchedulingDaySchedule, { props: { ...props, title: '第一份' } })
    const two = mount(SchedulingDaySchedule, { props: { ...props, title: '第二份' } })
    await one.get('[data-action="print-day"]').trigger('click')
    window.dispatchEvent(new Event('focus'))
    await one.setProps({ title: '已替换' })
    expect(
      document.querySelectorAll('.nv-day-print-target[data-nv-day-print-active]'),
    ).toHaveLength(0)
    await two.get('[data-action="print-day"]').trigger('click')
    const secondOwner = document.body.getAttribute('data-nv-day-print-owner')
    expect(secondOwner).toBeTruthy()
    vi.advanceTimersByTime(500)
    expect(document.body.getAttribute('data-nv-day-print-owner')).toBe(secondOwner)
    expect(
      document.querySelectorAll('.nv-day-print-target[data-nv-day-print-active]'),
    ).toHaveLength(1)
    one.unmount()
    expect(document.body.getAttribute('data-nv-day-print-owner')).toBe(secondOwner)
    window.dispatchEvent(new Event('afterprint'))
    await nextTick()
    expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
    two.unmount()
  } finally {
    vi.useRealTimers()
  }
})

it('print cleanup preserves a host body class', async () => {
  vi.spyOn(window, 'print').mockImplementation(() => {})
  document.body.classList.add('host-print-context')
  try {
    const page = mount(SchedulingDaySchedule, {
      props: {
        entries,
        date: '2026-11-02',
        groupId: 'all',
        timezone: 'Asia/Shanghai',
        title: '日安排',
      },
    })
    await page.get('[data-action="print-day"]').trigger('click')
    window.dispatchEvent(new Event('afterprint'))
    await nextTick()
    expect(document.body.className).toBe('host-print-context')
    expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
    page.unmount()
  } finally {
    document.body.classList.remove('host-print-context')
  }
})

it('a rejected controlled date request keeps the rendered day until external replacement', async () => {
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '日安排',
    },
  })
  await page.get('input[type="date"]').setValue('2026-11-03')
  expect(page.emitted('update:date')?.at(-1)).toEqual(['2026-11-03'])
  expect(page.get('input[type="date"]').element).toHaveProperty('value', '2026-11-02')
  expect(page.get('[data-day-sheet]').text()).toContain('夜读')
  page.unmount()
})

it.each([
  ['title', { title: '替换的标题' }],
  ['plan label', { planLabel: '替换的方案' }],
  ['status label', { statusLabel: '替换的状态' }],
  ['readonly', { readOnly: true }],
  ['readonly reason', { readOnlyReason: '权限已变化' }],
  ['date', { date: '2026-11-03' }],
  ['group', { groupId: 'studio' }],
  ['timezone', { timezone: 'America/New_York' }],
  ['entries', { entries: [] }],
])('external %s replacement releases only the active print target', async (_case, change) => {
  vi.spyOn(window, 'print').mockImplementation(() => {})
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '日安排',
      planLabel: '原方案',
      statusLabel: '原状态',
      readOnlyReason: '原原因',
    },
  })
  await page.get('[data-action="print-day"]').trigger('click')
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(true)
  await page.setProps(change)
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  await nextTick()
  expect(document.querySelector('.nv-day-print-target')).toBeNull()
  page.unmount()
})

it('public sheet prints detail and empty state without controls or invented missing values', async () => {
  const page = mount(SchedulingDaySheet, {
    props: {
      entries,
      date: '2026-11-02',
      groupLabel: '全部空间',
      timezone: 'Asia/Shanghai',
      title: '读书会日安排',
      planLabel: '本页内存安排',
      statusLabel: '未保存',
    },
  })
  expect(page.get('header').text()).toContain('本页内存安排 · 未保存')
  expect(page.get('thead').text()).toContain('活动')
  expect(page.get('tbody').text()).toContain('夜读')
  expect(page.get('[data-semantic-key="midnight"]').text()).not.toContain('数量 0')
  expect(page.find('button').exists()).toBe(false)
  await page.setProps({ entries: [] })
  expect(page.get('[data-day-sheet]').text()).toContain('该日与所选分组没有安排')
  expect(page.find('table').exists()).toBe(false)
  page.unmount()
})

it('print owns only its target and removes its own body state after cancel, repeat, throw and unmount', async () => {
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  const target = document.createElement('div')
  document.body.append(target)
  const page = mount(SchedulingDaySchedule, {
    attachTo: target,
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '读书会日安排',
    },
  })
  await page.get('[data-action="print-day"]').trigger('click')
  await nextTick()
  const owner = document.body.getAttribute('data-nv-day-print-owner')
  expect(owner).toBeTruthy()
  expect(document.querySelectorAll('.nv-day-print-target[data-nv-day-print-active]')).toHaveLength(
    1,
  )
  expect(document.querySelector('.nv-day-print-target')?.textContent).toContain('夜读')
  expect(document.querySelector('.nv-day-print-target button')).toBeNull()
  expect(print).toHaveBeenCalledOnce()
  await page.get('[data-action="print-day"]').trigger('click')
  expect(print).toHaveBeenCalledOnce()
  window.dispatchEvent(new Event('afterprint'))
  await nextTick()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  expect(document.querySelector('.nv-day-print-target')).toBeNull()
  await page.get('[data-action="print-day"]').trigger('click')
  await nextTick()
  expect(print).toHaveBeenCalledTimes(2)
  page.unmount()
  await nextTick()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  expect(document.querySelector('.nv-day-print-target')).toBeNull()
  target.remove()

  print.mockImplementation(() => {
    throw new Error('print unavailable')
  })
  const failed = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '读书会日安排',
    },
  })
  await failed.get('[data-action="print-day"]').trigger('click')
  await nextTick()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  expect(failed.text()).toContain('打印未打开')
  failed.unmount()
})

it('explicit New York calendar days keep 23 and 25 hour boundaries without browser timezone fallback', async () => {
  const dst: readonly SchedulingDayEntry[] = [
    {
      semanticKey: 'spring-before',
      assignmentId: 's-1',
      label: '春季前夜',
      groupId: 'a',
      groupLabel: 'A',
      startUtc: '2026-03-08T04:30:00Z',
      endUtc: '2026-03-08T05:00:00Z',
    },
    {
      semanticKey: 'spring-day',
      assignmentId: 's-2',
      label: '春季当日',
      groupId: 'a',
      groupLabel: 'A',
      startUtc: '2026-03-08T05:00:00Z',
      endUtc: '2026-03-09T04:00:00Z',
    },
    {
      semanticKey: 'fall-day',
      assignmentId: 'f-1',
      label: '秋季当日',
      groupId: 'a',
      groupLabel: 'A',
      startUtc: '2026-11-01T04:00:00Z',
      endUtc: '2026-11-02T05:00:00Z',
    },
    {
      semanticKey: 'fall-after',
      assignmentId: 'f-2',
      label: '秋季次日',
      groupId: 'a',
      groupLabel: 'A',
      startUtc: '2026-11-02T05:00:00Z',
      endUtc: '2026-11-02T06:00:00Z',
    },
  ]
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries: dst,
      date: '2026-03-08',
      groupId: 'all',
      timezone: 'America/New_York',
      title: '日安排',
    },
  })
  expect(page.get('[data-day-sheet]').text()).toContain('春季当日')
  expect(page.get('[data-day-sheet]').text()).not.toContain('春季前夜')
  await page.setProps({ date: '2026-11-01' })
  expect(page.get('[data-day-sheet]').text()).toContain('秋季当日')
  expect(page.get('[data-day-sheet]').text()).not.toContain('秋季次日')
  page.unmount()
})

it('semantic and assignment identities stay separate across an external row replacement', async () => {
  const rows: readonly SchedulingDayEntry[] = [
    {
      semanticKey: 'a:b',
      assignmentId: 'c',
      label: '晨间共读',
      groupId: 'room',
      groupLabel: '阅读室',
      startUtc: '2026-11-02T01:00:00Z',
      endUtc: '2026-11-02T02:00:00Z',
    },
    {
      semanticKey: 'a',
      assignmentId: 'b:c',
      label: '午后共读',
      groupId: 'room',
      groupLabel: '阅读室',
      startUtc: '2026-11-02T03:00:00Z',
      endUtc: '2026-11-02T04:00:00Z',
    },
  ]
  const page = mount(SchedulingDaySchedule, {
    props: {
      entries: rows,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '日安排',
    },
  })
  expect(
    page
      .findAll('[data-day-sheet] tbody tr')
      .map((row) => [
        row.attributes('data-semantic-key'),
        row.attributes('data-assignment-id'),
        row.text().includes('共读'),
      ]),
  ).toEqual([
    ['a:b', 'c', true],
    ['a', 'b:c', true],
  ])
  await page.setProps({
    entries: [{ ...rows[0]!, assignmentId: 'new', label: '晨间共读 · 已调整' }, rows[1]!],
  })
  expect(page.get('[data-semantic-key="a:b"]').attributes('data-assignment-id')).toBe('new')
  expect(page.get('[data-semantic-key="a"]').text()).toContain('午后共读')
  page.unmount()
})

it('a second instance cannot steal or clear the active print owner', async () => {
  vi.spyOn(window, 'print').mockImplementation(() => {})
  const one = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '第一份',
    },
  })
  const two = mount(SchedulingDaySchedule, {
    props: {
      entries,
      date: '2026-11-02',
      groupId: 'all',
      timezone: 'Asia/Shanghai',
      title: '第二份',
    },
  })
  await one.get('[data-action="print-day"]').trigger('click')
  const owner = document.body.getAttribute('data-nv-day-print-owner')
  await two.get('[data-action="print-day"]').trigger('click')
  expect(document.body.getAttribute('data-nv-day-print-owner')).toBe(owner)
  expect(document.querySelectorAll('.nv-day-print-target')).toHaveLength(1)
  two.unmount()
  expect(document.body.getAttribute('data-nv-day-print-owner')).toBe(owner)
  one.unmount()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
})

it('focus after a cancelled print clears only the local listener timer and target', async () => {
  vi.useFakeTimers()
  try {
    vi.spyOn(window, 'print').mockImplementation(() => {})
    const page = mount(SchedulingDaySchedule, {
      props: {
        entries,
        date: '2026-11-02',
        groupId: 'all',
        timezone: 'Asia/Shanghai',
        title: '日安排',
      },
    })
    await page.get('[data-action="print-day"]').trigger('click')
    window.dispatchEvent(new Event('beforeprint'))
    window.dispatchEvent(new Event('focus'))
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
    expect(document.querySelector('.nv-day-print-target')).toBeNull()
    page.unmount()
    document.body.setAttribute('data-nv-day-print-owner', 'another-owner')
    const other = mount(SchedulingDaySchedule, {
      props: {
        entries,
        date: '2026-11-02',
        groupId: 'all',
        timezone: 'Asia/Shanghai',
        title: '日安排',
      },
    })
    await other.get('[data-action="print-day"]').trigger('click')
    other.unmount()
    expect(document.body.getAttribute('data-nv-day-print-owner')).toBe('another-owner')
  } finally {
    vi.useRealTimers()
  }
})

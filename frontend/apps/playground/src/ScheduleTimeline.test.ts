import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import * as ui from '@nerv-iip/ui'
import type { NvScheduleVisualModel } from '@nerv-iip/ui'

const model: NvScheduleVisualModel = {
  horizon: { start: '2026-01-15T00:00:00Z', end: '2026-01-16T00:00:00Z' },
  timezones: ['UTC'],
  groups: [
    { id: 'reading', label: '阅读计划' },
    { id: 'walking', label: '漫步计划' },
  ],
  resources: [
    { id: 'room', label: '共享书房' },
    { id: 'garden', label: '城市花园' },
  ],
  tasks: [
    {
      id: 'read',
      label: '读一本书',
      groupId: 'reading',
      resourceId: 'room',
      start: '2026-01-15T06:00:00Z',
      end: '2026-01-15T12:00:00Z',
      timezone: 'UTC',
      facts: [{ label: '书目', value: '山间来信' }],
    },
    {
      id: 'walk',
      label: '午后漫步',
      groupId: 'walking',
      resourceId: 'garden',
      start: '2026-01-15T18:00:00+02:00',
      end: '2026-01-15T22:00:00+02:00',
      timezone: 'Europe/Helsinki',
      facts: [{ label: '路线', value: '湖畔' }],
    },
  ],
  links: [{ id: 'read-walk', source: 'read', target: 'walk' }],
}
let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => wrapper?.unmount())
it('root export renders two neutral tasks at fixed instant coordinates and emits their task identity', async () => {
  expect(ui).toHaveProperty('NvScheduleTimeline')
  wrapper = mount(ui.NvScheduleTimeline, { props: { model, scale: 'day' } })
  expect(wrapper.get('[data-task-id="read"]').attributes('style')).toContain('left: 25%')
  expect(wrapper.get('[data-task-id="read"]').attributes('style')).toContain('width: 25%')
  expect(wrapper.get('[data-task-id="walk"]').attributes('style')).toContain(
    'left: 66.66666666666666%',
  )
  expect(wrapper.get('[data-task-id="walk"]').text()).toContain('午后漫步')
  expect(wrapper.get('[data-task-id="read"]').text()).toContain('山间来信')
  expect(wrapper.get('[data-lane-id="reading"]').text()).toContain('阅读计划')
  expect(wrapper.get('[data-axis-tick]').text()).toContain('UTC · 1/15 00:00')
  const path = wrapper
    .get('[data-dependency-id="read-walk"] path')
    .attributes('d')!
    .match(/-?[\d.]+/g)!
    .map(Number)
  expect(path).toHaveLength(5)
  ;[360, 140, 420, 432, 480].forEach((value, index) => expect(path[index]).toBeCloseTo(value, 8))
  await wrapper.get('[data-task-id="walk"]').trigger('click')
  expect(wrapper.emitted('taskSelect')).toEqual([['walk']])
})

it('replaces same-key labels facts segments links windows and resources without retaining old content', async () => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: {
      model: {
        ...model,
        tasks: [
          {
            ...model.tasks[0]!,
            locked: true,
            conflictLabel: '时间重叠',
            statusLabels: ['待确认'],
            segments: [
              {
                id: 'part-old',
                start: '2026-01-15T06:00:00Z',
                end: '2026-01-15T08:00:00Z',
                label: '第一段',
              },
            ],
          },
          model.tasks[1]!,
        ],
        windows: [
          {
            id: 'hold',
            laneId: 'room',
            label: '保留时段',
            start: '2026-01-14T22:00:00Z',
            end: '2026-01-15T08:00:00Z',
          },
        ],
      },
      view: 'resource',
      scale: 'day',
    },
  })
  expect(wrapper.get('[data-segment-id="part-old"]').attributes('style')).toContain(
    'width: 33.33333333333333%',
  )
  expect(wrapper.get('[data-window-id="hold"]').attributes('style')).toContain('left: 0%')
  expect(wrapper.get('[data-window-id="hold"]').attributes('style')).toContain(
    'width: 33.33333333333333%',
  )
  await wrapper.get('[data-task-id="read"]').trigger('click')
  expect(wrapper.emitted('conflictClick')).toEqual([['read']])
  expect(wrapper.get('[data-task-id="read"]').attributes('aria-label')).toContain('锁定')
  const replacement = {
    ...model,
    resources: [{ id: 'room', label: '新书房' }],
    tasks: [
      {
        ...model.tasks[0]!,
        label: '重读一封信',
        facts: [{ label: '书目', value: '远方计划' }],
        segments: [
          {
            id: 'part-new',
            start: '2026-01-15T09:00:00Z',
            end: '2026-01-15T12:00:00Z',
            label: '后半段',
          },
        ],
      },
    ],
    links: [{ id: 'dangling', source: 'read', target: 'walk' }],
    windows: [],
  }
  await wrapper.setProps({ model: replacement })
  expect(wrapper.get('[data-task-id="read"]').text()).toContain('重读一封信')
  expect(wrapper.get('[data-task-id="read"]').attributes('title')).toContain('远方计划')
  expect(wrapper.get('[data-lane-id="room"]').text()).toContain('新书房')
  expect(wrapper.get('[data-segment-id="part-new"]').attributes('style')).toContain('left: 50%')
  expect(wrapper.get('[data-segment-id="part-new"]').attributes('style')).toContain('width: 50%')
  for (const stale of [
    '读一本书',
    '山间来信',
    '午后漫步',
    '共享书房',
    '第一段',
    '时间重叠',
    '待确认',
    '锁定',
  ])
    expect(wrapper.text()).not.toContain(stale)
  expect(wrapper.find('[data-window-id]').exists()).toBe(false)
  expect(wrapper.find('[data-dependency-id]').exists()).toBe(false)
  await wrapper.setProps({ model: { ...replacement, tasks: [], links: [] } })
  expect(wrapper.find('[data-task-id]').exists()).toBe(false)
  expect(wrapper.find('[data-segment-id]').exists()).toBe(false)
  expect(wrapper.text()).toContain('暂无时间安排')
  await wrapper.setProps({ model })
  expect(wrapper.findAll('[data-task-id]')).toHaveLength(2)
  expect(wrapper.get('[data-dependency-id="read-walk"]').attributes('data-target')).toBe('walk')
})

it('readonly selection never edits or mutates frozen caller data', async () => {
  function freeze<T>(value: T): T {
    if (value && typeof value === 'object') {
      Object.freeze(value)
      for (const child of Object.values(value)) freeze(child)
    }
    return value
  }
  const input = freeze(structuredClone(model))
  const before = JSON.stringify(input)
  wrapper = mount(ui.NvScheduleTimeline, { props: { model: input } })
  const task = wrapper.get('[data-task-id="read"]')
  task.element.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100, bubbles: true }))
  task.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 300, bubbles: true }))
  task.element.dispatchEvent(new MouseEvent('pointerup', { clientX: 300, bubbles: true }))
  await task.trigger('dblclick')
  await task.trigger('keydown', { key: 'Delete' })
  await task.trigger('click')
  expect(JSON.stringify(input)).toBe(before)
  expect(wrapper.emitted('taskSelect')).toEqual([['read']])
  expect(
    Object.keys(wrapper.emitted()).filter((name) => /update:|edit|dragEnd|resize/i.test(name)),
  ).toEqual([])
  expect(
    wrapper.findAll('input, textarea, [contenteditable="true"], [draggable="true"]'),
  ).toHaveLength(0)
})

it('keeps unresolved zones explicit and rejects wall-time tasks without guessing a browser timezone', async () => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: {
      model: {
        ...model,
        timezones: ['Invalid/Zone'],
        tasks: [
          { ...model.tasks[0]!, timezone: null },
          { ...model.tasks[1]!, start: '2026-01-15T16:00:00', end: '2026-01-15T20:00:00' },
        ],
      },
      scale: 'day',
    },
  })
  expect(wrapper.text()).toContain('时区未解析')
  expect(wrapper.get('[data-axis-tick]').text()).toContain('UTC · 1/15 00:00')
  expect(wrapper.get('[data-task-id="read"]').attributes('aria-label')).toContain(
    '时区未解析 · 2026-01-15T06:00:00Z',
  )
  expect(wrapper.find('[data-task-id="walk"]').exists()).toBe(false)
  expect(wrapper.text()).toContain('部分任务缺少有效 UTC/offset 起止时刻')
  await wrapper.setProps({ model: { horizon: { start: '', end: '' }, tasks: [], links: [] } })
  expect(wrapper.find('[data-axis-tick]').exists()).toBe(false)
  expect(wrapper.text()).toContain('暂无时间安排')
})

it('preserves catalog empty lanes overlap stacking and explicit native scale choices', async () => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: {
      model: {
        ...model,
        resources: [...model.resources!, { id: 'empty', label: '备用空间' }],
        tasks: [
          model.tasks[0]!,
          {
            ...model.tasks[1]!,
            resourceId: 'room',
            start: '2026-01-15T08:00:00Z',
            end: '2026-01-15T10:00:00Z',
          },
        ],
      },
      view: 'resource',
      laneOrder: 'catalog',
      scale: 'eightHours',
    },
  })
  expect(wrapper.findAll('[data-axis-tick]')).toHaveLength(3)
  expect(wrapper.get('[data-task-id="walk"]').attributes('style')).toContain('top: 288px')
  expect(wrapper.get('[data-lane-id="empty"]').text()).toContain('0 项')
  await wrapper.setProps({ laneOrder: 'onlyScheduled', scale: 'day' })
  expect(wrapper.find('[data-lane-id="empty"]').exists()).toBe(false)
  expect(wrapper.findAll('[data-axis-tick]')).toHaveLength(1)
})

it('shows host attention separately from conflicts and never emits a conflict action for attention alone', async () => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: {
      model: {
        ...model,
        tasks: [{ ...model.tasks[0]!, attentionLabel: '借阅时间待确认' }],
        links: [],
      },
    },
  })
  expect(wrapper.get('[data-task-id="read"]').text()).toContain('借阅时间待确认')
  expect(wrapper.get('[data-task-id="read"]').attributes('aria-label')).toContain('借阅时间待确认')
  await wrapper.get('[data-task-id="read"]').trigger('click')
  expect(wrapper.emitted('taskSelect')).toEqual([['read']])
  expect(wrapper.emitted('conflictClick')).toBeUndefined()
})

it('uses unified badges for host conflict attention lock and labels without classifying host text', async () => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: {
      model: {
        ...model,
        tasks: [
          {
            ...model.tasks[0]!,
            conflictLabel: '宿主冲突',
            attentionLabel: '宿主提醒',
            locked: true,
            statusLabels: ['Completed'],
          },
        ],
        links: [],
      },
    },
  })
  const badges = wrapper.findAllComponents(ui.NvStatusBadge)
  expect(badges.map((badge) => [badge.props('label'), badge.props('tone')])).toEqual([
    ['宿主冲突', 'danger'],
    ['宿主提醒', 'warning'],
    ['锁定', 'neutral'],
    ['Completed', 'neutral'],
  ])
  for (const label of ['宿主冲突', '宿主提醒', '锁定', 'Completed']) {
    expect(wrapper.get(`[aria-label="状态：${label}"]`).text()).toContain(label)
  }
  await wrapper.get('[data-task-id="read"]').trigger('click')
  expect(wrapper.emitted('taskSelect')).toEqual([['read']])
  expect(wrapper.emitted('conflictClick')).toEqual([['read']])
})

it('keeps short task identity statuses and selection readable in native details without widening time bars', async () => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: {
      model: {
        ...model,
        tasks: [
          {
            ...model.tasks[0]!,
            end: '2026-01-15T06:05:00Z',
            locked: true,
            attentionLabel: '宿主短时提醒',
            statusLabels: ['待确认'],
          },
        ],
        links: [],
      },
      scale: 'day',
    },
  })
  expect(wrapper.get('[data-task-id="read"]').attributes('aria-label')).toContain('读一本书')
  const details = wrapper.get('details')
  expect(details.get('summary').text()).toContain('短时任务详情')
  const select = details.get('button')
  expect(select.text()).toContain('读一本书')
  expect(select.text()).toContain('1/15 06:00')
  for (const label of ['宿主短时提醒', '锁定', '待确认'])
    expect(details.get(`[aria-label="状态：${label}"]`).text()).toContain(label)
  await select.trigger('click')
  expect(wrapper.emitted('taskSelect')).toEqual([['read']])
  expect(wrapper.emitted('conflictClick')).toBeUndefined()
})

it('rejects nonexistent calendar dates across tasks horizon windows segments and dependency endpoints', async () => {
  const input: NvScheduleVisualModel = {
    horizon: { start: '2026-03-02T00:00:00Z', end: '2026-03-03T00:00:00Z' },
    timezones: ['UTC'],
    tasks: [
      {
        id: 'valid',
        label: '实际三月',
        groupId: 'one',
        timezone: 'UTC',
        start: '2026-03-02T06:00:00Z',
        end: '2026-03-02T12:00:00Z',
        segments: [
          { id: 'bad-segment', start: '2026-02-30T06:00:00Z', end: '2026-02-30T07:00:00Z' },
          { id: 'good-segment', start: '2026-03-02T08:00:00Z', end: '2026-03-02T09:00:00Z' },
        ],
      },
      {
        id: 'invalid',
        label: '不存在的二月',
        groupId: 'one',
        timezone: 'UTC',
        start: '2026-02-30T06:00:00Z',
        end: '2026-02-30T12:00:00Z',
      },
    ],
    windows: [
      {
        id: 'bad-window',
        laneId: 'one',
        label: '不存在窗口',
        start: '2026-02-30T06:00:00Z',
        end: '2026-02-30T12:00:00Z',
      },
      {
        id: 'good-window',
        laneId: 'one',
        label: '真实窗口',
        start: '2026-03-02T06:00:00Z',
        end: '2026-03-02T12:00:00Z',
      },
    ],
    links: [{ id: 'invalid-endpoint', source: 'invalid', target: 'valid' }],
  }
  wrapper = mount(ui.NvScheduleTimeline, { props: { model: input, scale: 'day' } })
  expect(wrapper.find('[data-task-id="invalid"]').exists()).toBe(false)
  expect(wrapper.find('[data-segment-id="bad-segment"]').exists()).toBe(false)
  expect(wrapper.find('[data-window-id="bad-window"]').exists()).toBe(false)
  expect(wrapper.find('[data-dependency-id]').exists()).toBe(false)
  expect(wrapper.get('[data-task-id="valid"]').attributes('aria-label')).toContain('3/2 06:00')
  expect(wrapper.find('[data-segment-id="good-segment"]').exists()).toBe(true)
  expect(wrapper.find('[data-window-id="good-window"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('部分任务缺少有效 UTC/offset 起止时刻')
  await wrapper.setProps({
    model: {
      horizon: { start: '2026-02-30T00:00:00Z', end: '2026-02-30T12:00:00Z' },
      tasks: [],
      links: [],
      timezones: ['UTC'],
    },
  })
  expect(wrapper.find('[data-axis-tick]').exists()).toBe(false)
})

it.each([
  { name: 'non leap February', start: '2026-02-29T06:00:00Z', end: '2026-02-29T12:00:00Z' },
  { name: 'century non leap February', start: '1900-02-29T06:00:00Z', end: '1900-02-29T12:00:00Z' },
  { name: 'April month end', start: '2026-04-31T06:00:00Z', end: '2026-04-31T12:00:00Z' },
  { name: 'zero month', start: '2026-00-15T06:00:00Z', end: '2026-01-15T12:00:00Z' },
  { name: 'zero day', start: '2026-01-00T06:00:00Z', end: '2026-01-15T12:00:00Z' },
  {
    name: 'invalid start with offset',
    start: '2026-02-30T06:00:00+02:00',
    end: '2026-03-02T12:00:00+02:00',
  },
  { name: 'invalid end only', start: '2026-02-28T06:00:00Z', end: '2026-02-30T12:00:00Z' },
  { name: 'hour overflow', start: '2026-01-15T25:00:00Z', end: '2026-01-16T12:00:00Z' },
  { name: 'nonzero end of day minute', start: '2026-01-15T24:01:00Z', end: '2026-01-16T12:00:00Z' },
  {
    name: 'nonzero end of day fraction',
    start: '2026-01-15T24:00:00.001Z',
    end: '2026-01-16T12:00:00Z',
  },
  { name: 'minute overflow', start: '2026-01-15T06:60:00Z', end: '2026-01-15T12:00:00Z' },
  { name: 'leap second', start: '2026-01-15T06:00:60Z', end: '2026-01-15T12:00:00Z' },
  { name: 'offset hour overflow', start: '2026-01-15T06:00:00+24:00', end: '2026-01-15T12:00:00Z' },
  {
    name: 'offset minute overflow',
    start: '2026-01-15T06:00:00+02:60',
    end: '2026-01-15T12:00:00Z',
  },
  { name: 'missing offset', start: '2026-01-15T06:00:00', end: '2026-01-15T12:00:00' },
  { name: 'zero duration', start: '2026-01-15T06:00:00Z', end: '2026-01-15T06:00:00Z' },
  { name: 'reversed duration', start: '2026-01-15T12:00:00Z', end: '2026-01-15T06:00:00Z' },
])('rejects invalid instant partition $name without calendar normalization', ({ start, end }) => {
  wrapper = mount(ui.NvScheduleTimeline, {
    props: { model: { ...model, tasks: [{ ...model.tasks[0]!, start, end }], links: [] } },
  })
  expect(wrapper.find('[data-task-id="read"]').exists()).toBe(false)
  expect(wrapper.text()).toContain('部分任务缺少有效 UTC/offset 起止时刻')
})

it.each([
  {
    name: 'leap year February end',
    horizon: '2024-02-29',
    start: '2024-02-29T06:00:00Z',
    end: '2024-02-29T12:00:00Z',
    next: '2024-03-01',
    left: 25,
    width: 25,
    label: '2/29 06:00',
  },
  {
    name: 'divisible four hundred leap year',
    horizon: '2000-02-29',
    start: '2000-02-29T06:00:00Z',
    end: '2000-02-29T12:00:00Z',
    next: '2000-03-01',
    left: 25,
    width: 25,
    label: '2/29 06:00',
  },
  {
    name: 'month end with negative offset',
    horizon: '2026-04-30',
    start: '2026-04-30T01:00:00-05:00',
    end: '2026-04-30T07:00:00-05:00',
    next: '2026-05-01',
    left: 25,
    width: 25,
    label: '4/30 06:00',
  },
  {
    name: 'positive offset crossing UTC date',
    horizon: '2026-02-28',
    start: '2026-03-01T00:00:00+02:00',
    end: '2026-03-01T01:00:00+02:00',
    next: '2026-03-01',
    left: 91.66666666666666,
    width: 4.166666666666666,
    label: '2/28 22:00',
  },
  {
    name: 'basic numeric offset and minute precision',
    horizon: '2026-01-15',
    start: '2026-01-15T08:00+0200',
    end: '2026-01-15T14:00+0200',
    next: '2026-01-16',
    left: 25,
    width: 25,
    label: '1/15 06:00',
  },
  {
    name: 'offset milliseconds',
    horizon: '2026-01-15',
    start: '2026-01-15T08:00:00.125+02:00',
    end: '2026-01-15T14:00:00.125+02:00',
    next: '2026-01-16',
    left: 25.000144675925927,
    width: 25,
    label: '1/15 06:00',
  },
  {
    name: 'valid ISO end of day',
    horizon: '2026-01-15',
    start: '2026-01-15T18:00:00Z',
    end: '2026-01-15T24:00:00.000Z',
    next: '2026-01-16',
    left: 75,
    width: 25,
    label: '1/15 18:00',
  },
])(
  'preserves valid instant partition $name at independent UTC coordinates',
  ({ horizon, next, start, end, left, width, label }) => {
    wrapper = mount(ui.NvScheduleTimeline, {
      props: {
        model: {
          ...model,
          horizon: { start: `${horizon}T00:00:00Z`, end: `${next}T00:00:00Z` },
          tasks: [{ ...model.tasks[0]!, start, end }],
          links: [],
        },
        scale: 'day',
      },
    })
    const task = wrapper.get('[data-task-id="read"]')
    expect(Number.parseFloat((task.element as HTMLElement).style.left)).toBeCloseTo(left, 9)
    expect(Number.parseFloat((task.element as HTMLElement).style.width)).toBeCloseTo(width, 9)
    expect(task.attributes('aria-label')).toContain(label)
    expect(wrapper.text()).not.toContain('部分任务缺少有效 UTC/offset 起止时刻')
  },
)

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

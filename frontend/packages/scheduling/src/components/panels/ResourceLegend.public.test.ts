import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { SchedulingLegend, deriveLegendSemantics, type ScheduleModel } from '../../index'

const input = (): ScheduleModel => ({
  tasks: [
    {
      id: 'activity-a',
      type: 'operation',
      orderId: 'group',
      operationId: 'a',
      operationSequence: 1,
      text: '实际活动A',
      resourceId: 'room-a',
      startUtc: '2026-10-26T09:45:00Z',
      endUtc: '2026-10-26T10:45:00Z',
      locked: false,
      hasConflict: false,
      timezone: 'UTC',
    },
  ],
  resources: [{ id: 'room-a', text: '空间A' }],
  links: [],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  horizon: { startUtc: '2026-10-26T09:30:00Z', endUtc: '2026-10-26T11:30:00Z' },
  calendars: [],
  timezones: ['UTC'],
  meta: { planId: 'reading', status: 'generated', algorithmVersion: 'host' },
})

it.each([
  ['hour', '2026-10-26T09:00:00Z', '2026-10-26T13:00:00Z'],
  ['day', '2026-10-26T00:00:00Z', '2026-10-27T00:00:00Z'],
  ['week', '2026-10-26T00:00:00Z', '2026-11-02T00:00:00Z'],
  ['month', '2026-10-01T00:00:00Z', '2026-11-01T00:00:00Z'],
] as const)(
  'resource legend clips positive blocks and calendar gaps to rendered %s cells',
  (scale, start, end) => {
    const model = input()
    const block = { ...model.tasks[0]!, id: 'block', blockKind: 'maintenance' as const }
    const semantics = (a: string, b: string) =>
      deriveLegendSemantics(
        { ...model, tasks: [model.tasks[0]!, { ...block, startUtc: a, endUtc: b }] },
        0,
        scale,
        'resource',
      )
    expect(semantics(start, new Date(Date.parse(start) + 60_000).toISOString()).blocks).toEqual([
      'maintenance',
    ])
    expect(semantics(new Date(Date.parse(end) - 60_000).toISOString(), end).blocks).toEqual([
      'maintenance',
    ])
    expect(semantics(new Date(Date.parse(start) - 60_000).toISOString(), start).blocks).toEqual([])
    expect(semantics(end, new Date(Date.parse(end) + 60_000).toISOString()).blocks).toEqual([])
    expect(semantics(start, start).blocks).toEqual([])
    model.calendars = [
      {
        calendarId: 'c',
        resourceIds: ['room-a'],
        workCenterIds: [],
        shiftWindows: [
          { startUtc: model.horizon.startUtc, endUtc: model.horizon.endUtc, shiftCode: 'open' },
        ],
      },
    ]
    expect(deriveLegendSemantics(model, 0, scale, 'resource').calendar.nonWorking).toBe(true)
    model.calendars[0]!.shiftWindows = [{ startUtc: start, endUtc: end, shiftCode: 'all' }]
    expect(deriveLegendSemantics(model, 0, scale, 'resource').calendar.nonWorking).toBe(false)
  },
)

it('resource legend suppresses the current unpainted shift stroke without changing order grid semantics', async () => {
  const model = input()
  model.calendars = [
    {
      calendarId: 'c',
      resourceIds: ['room-a'],
      workCenterIds: [],
      shiftWindows: [
        { startUtc: '2026-10-26T09:00:00Z', endUtc: '2026-10-26T13:00:00Z', shiftCode: 'open' },
      ],
    },
  ]
  const w = mount(SchedulingLegend, { props: { model, view: 'resource', scale: 'hour', now: 0 } })
  expect(w.text()).not.toContain('班次边界')
  expect(deriveLegendSemantics(model, 0, 'hour', 'resource').calendar.shift).toBe(false)
  await w.setProps({ view: 'order' })
  expect(w.text()).toContain('班次边界')
  w.unmount()
})

it('resource legend uses retained lane KPIs and filters empty block-only and summary lanes', async () => {
  const model = input()
  model.resources.push({ id: 'empty', text: '空泳道', utilization: 2 })
  const block = {
    ...model.tasks[0]!,
    id: 'block',
    resourceId: 'empty',
    blockKind: 'maintenance' as const,
    hasConflict: true,
    locked: true,
    priority: 'high' as const,
    isRush: true,
    kitting: 0,
    changeoverMin: 15,
  }
  model.tasks.push(block, { ...block, id: 'summary', type: 'order', blockKind: undefined })
  const w = mount(SchedulingLegend, {
    props: { model, view: 'resource', laneOrder: 'onlyScheduled', scale: 'hour', now: 0 },
  })
  expect(w.text()).toBe('')
  await w.setProps({ laneOrder: 'name' })
  expect(w.text()).toContain('资源过载')
  expect(w.text()).toContain('设备维护')
  expect(w.text()).not.toContain('冲突')
  expect(w.text()).not.toContain('锁定')
  model.resources[1]!.utilization = Infinity
  await w.setProps({ model: structuredClone(model) })
  expect(w.text()).not.toContain('资源过载')
  model.resources[1]!.utilization = 0
  await w.setProps({ model: structuredClone(model) })
  expect(w.text()).not.toContain('资源过载')
  // A raw overloaded load does not prove the aggregate lane is overloaded.
  model.resources = model.resources.map((r) => ({
    ...r,
    utilization: undefined,
    dimensions: { workCenter: { id: 'shared', label: '共用空间' } },
  }))
  model.loads = [
    {
      resourceId: 'room-a',
      windowStartUtc: model.horizon.startUtc,
      windowEndUtc: model.horizon.endUtc,
      assignedMinutes: 0,
      availableMinutes: 100,
      utilization: 0,
    },
    {
      resourceId: 'empty',
      windowStartUtc: model.horizon.startUtc,
      windowEndUtc: model.horizon.endUtc,
      assignedMinutes: 150,
      availableMinutes: 100,
      utilization: 1.5,
    },
  ]
  await w.setProps({ model: structuredClone(model) })
  expect(w.text()).not.toContain('资源过载')
  model.loads[1]!.assignedMinutes = 250
  await w.setProps({ model: structuredClone(model) })
  expect(w.text()).toContain('资源过载')
  model.loads.pop()
  await w.setProps({ model: structuredClone(model) })
  expect(w.text()).not.toContain('资源过载')
  w.unmount()
})

it('resource legend shares the board first-dimension default and explicit grouping replacement', async () => {
  const model = input()
  model.groupDimensions = [
    { key: 'team', label: '小组' },
    { key: 'workCenter', label: '空间' },
  ]
  model.resources = [
    {
      id: 'room-a',
      text: '空间A',
      utilization: 2,
      dimensions: {
        team: { id: 'shared', label: '共读组' },
        workCenter: { id: 'a', label: 'A' },
      },
    },
    {
      id: 'room-b',
      text: '空间B',
      utilization: 0,
      dimensions: {
        team: { id: 'shared', label: '共读组' },
        workCenter: { id: 'b', label: 'B' },
      },
    },
  ]
  const w = mount(SchedulingLegend, { props: { model, view: 'resource', scale: 'hour', now: 0 } })
  expect(w.text()).not.toContain('资源过载') // default team has no authoritative aggregate KPI
  await w.setProps({ groupBy: 'workCenter' })
  expect(w.text()).toContain('资源过载')
  await w.setProps({ groupBy: 'team' })
  expect(w.text()).not.toContain('资源过载')
  w.unmount()
})

it('resource legend omits off-axis flags and retains a visible zero-duration ordinary operation', () => {
  const model = input()
  const task = {
    ...model.tasks[0]!,
    id: 'special',
    hasConflict: true,
    locked: true,
    kitting: 0,
    changeoverMin: 0,
    startUtc: '2026-10-26T08:00:00Z',
    endUtc: '2026-10-26T08:30:00Z',
  }
  model.tasks.push(task)
  expect(deriveLegendSemantics(model, 0, 'hour', 'resource').status.conflict).toBe(false)
  task.startUtc = task.endUtc = '2026-10-26T10:00:00Z'
  const s = deriveLegendSemantics(model, 0, 'hour', 'resource')
  expect(s.status).toMatchObject({ conflict: true, locked: true })
  expect(s.card).toMatchObject({ kitting: true, changeover: false })
})

it('resource legend now keeps horizon membership inside the larger normalized axis', () => {
  const model = input()
  for (const [at, visible] of [
    ['2026-10-26T09:00:00Z', false],
    ['2026-10-26T09:29:59.999Z', false],
    [model.horizon.startUtc, true],
    [model.horizon.endUtc, true],
    ['2026-10-26T11:30:00.001Z', false],
    ['2026-10-26T12:00:00Z', false],
  ] as const)
    expect(deriveLegendSemantics(model, Date.parse(at), 'hour', 'resource').calendar.now, at).toBe(
      visible,
    )
})

it('resource legend includes the positive maintenance fragment before a non-hour horizon', () => {
  const model = input()
  model.tasks.push({
    ...model.tasks[0]!,
    id: 'maintenance',
    blockKind: 'maintenance',
    startUtc: '2026-10-26T09:00:00Z',
    endUtc: '2026-10-26T09:15:00Z',
  })
  model.calendars = [
    {
      calendarId: 'opening',
      resourceIds: ['room-a'],
      workCenterIds: [],
      shiftWindows: [
        { startUtc: '2026-10-26T09:00:00Z', endUtc: '2026-10-26T13:00:00Z', shiftCode: 'open' },
      ],
    },
  ]
  const before = JSON.stringify(model)
  const w = mount(SchedulingLegend, { props: { model, view: 'resource', scale: 'hour', now: 0 } })
  expect(w.text()).toContain('设备维护')
  expect(deriveLegendSemantics(model, 0, 'hour', 'resource').blocks).toEqual(['maintenance'])
  expect(JSON.stringify(model)).toBe(before)
  w.unmount()
})

it('resource legend derives task statuses from projected operations while order retains its milestone', async () => {
  const model = input()
  model.tasks.push({
    ...model.tasks[0]!,
    id: 'milestone',
    isMilestone: true,
    hasConflict: true,
    locked: true,
    priority: 'high',
    isRush: true,
    kitting: 0,
    changeoverMin: 15,
    startUtc: '2026-10-26T10:00:00Z',
    endUtc: '2026-10-26T10:00:00Z',
    materialRisk: {
      orderId: 'group',
      operationId: 'a',
      reasonCodes: [],
      shortages: [],
      message: '开工前备料',
    },
    equipmentRisk: {
      orderId: 'group',
      operationId: 'a',
      resourceId: 'room-a',
      reasonCodes: [],
      message: '设备未知',
    },
  })
  const before = JSON.stringify(model)
  const w = mount(SchedulingLegend, { props: { model, view: 'resource', scale: 'hour', now: 0 } })
  expect.soft(w.text()).toBe('')
  expect.soft(deriveLegendSemantics(model, 0, 'hour', 'resource')).toMatchObject({
    gantt: { baseline: false, link: false, milestone: false },
    card: { priority: false, rush: false, kitting: false, changeover: false, bottleneck: false },
    status: { conflict: false, locked: false, materialRisk: false, equipmentRisk: false },
  })
  await w.setProps({ view: 'order' })
  expect(w.text()).toContain('里程碑')
  expect(w.text()).toContain('冲突')
  expect(JSON.stringify(model)).toBe(before)
  model.tasks[1]!.isMilestone = false
  model.tasks[1]!.endUtc = '2026-10-26T10:15:00Z'
  await w.setProps({ view: 'resource', model: structuredClone(model) })
  for (const label of [
    '冲突',
    '锁定',
    '优先级',
    '插单',
    '齐套',
    '换型耗时',
    '缺料待备',
    '设备状态未知',
  ])
    expect(w.text()).toContain(label)
  w.unmount()
})

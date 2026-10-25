import { expect, it } from 'vitest'
import { factoryTimeInput } from '@nerv-iip/scheduling/model'
import { reading, travel } from './models'
it('public models support reading and travel without domain identifiers', () => {
  expect([reading.tasks[0]!.label, travel.tasks[0]!.label]).toEqual(['读一本书', '沿河走走'])
  expect(factoryTimeInput(reading.tasks[0]!.start, 'UTC')).toBe('2026-01-15T06:00:00')
})

import { taskFactRows, withWorkOrderFacts } from '@nerv-iip/scheduling/model'
it('host facts preserve unknown forbidden unavailable empty and zero independently', () => {
  const model = withWorkOrderFacts(reading, [
    {
      taskId: 'read',
      facts: [
        { label: '余票', state: 'known', value: 0 },
        { label: '备注', state: 'known', value: '' },
        { label: '天气', state: 'unknown' },
        { label: '成员', state: 'forbidden' },
        { label: '路线', state: 'unavailable', text: '路线尚未同步' },
      ],
    },
  ])
  expect(taskFactRows(model.tasks[0]!)).toEqual([
    ['余票', '0'],
    ['备注', ''],
    ['天气', '未知'],
    ['成员', '无权读取'],
    ['路线', '路线尚未同步'],
  ])
  expect(taskFactRows(withWorkOrderFacts(model, []).tasks[0]!)).toEqual([['事实', '未知']])
  expect(withWorkOrderFacts(model, []).tasks[0]!.facts).toEqual([{ label: '事实', value: '未知' }])
  expect(
    taskFactRows(withWorkOrderFacts(model, [{ taskId: 'read', facts: [] }]).tasks[0]!),
  ).toEqual([])
  expect(reading.tasks[0]!.facts).toBeUndefined()
  expect(model.tasks[0]!.statusLabels).toEqual(['借阅已确认'])
})

import {
  factoryTimeInstant,
  scheduleTime,
  withFactoryTimeContext,
} from '@nerv-iip/scheduling/model'
it('strict time rejects absent calendar and unspecified zones', () => {
  expect(factoryTimeInput('2026-02-30T06:00:00Z', 'UTC')).toBe('')
  expect(factoryTimeInstant('2026-02-30T06:00:00', 'UTC', '')).toBeUndefined()
  expect(scheduleTime('2026-01-15T06:00:00Z')).toBe('时区未解析')
  expect(scheduleTime('2026-01-15T06:00:00Z', '')).toBe('时区未解析')
  expect(scheduleTime('2026-01-15T06:00:00Z', 'Invalid/Zone')).toBe('时区未解析')
})
it('offset and milliseconds survive unchanged UTC and offset wall input', () => {
  for (const [original, zone, wall] of [
    ['2026-01-15T08:00:00.125+02:00', 'UTC', '2026-01-15T06:00:00'],
    ['2026-01-15T00:00:00.987Z', 'Asia/Shanghai', '2026-01-15T08:00:00'],
    ['2026-01-15T00:00:00.001-05:00', 'America/New_York', '2026-01-15T00:00:00'],
  ])
    expect(factoryTimeInstant(wall!, zone!, original!)).toBe(original)
  expect(factoryTimeInstant('2026-01-15T07:00', 'UTC', '2026-01-15T08:00:00.125+02:00')).toBe(
    '2026-01-15T07:00:00.125Z',
  )
})
it('DST gaps and folds reject edits while the original fold instant remains unchanged', () => {
  expect(factoryTimeInstant('2026-03-08T02:30:00', 'America/New_York', '')).toBeUndefined()
  expect(factoryTimeInstant('2026-11-01T01:30:00', 'America/New_York', '')).toBeUndefined()
  expect(
    factoryTimeInstant('2026-11-01T01:30:00', 'America/New_York', '2026-11-01T01:30:00.123-04:00'),
  ).toBe('2026-11-01T01:30:00.123-04:00')
  expect(factoryTimeInstant('2026-11-01T02:30:00', 'America/New_York', '')).toBe(
    '2026-11-01T07:30:00.000Z',
  )
})
it('task zones remain explicit across partial context replacement without first-factory fallback', () => {
  const pair = { ...reading, tasks: [...reading.tasks, { ...travel.tasks[0]!, id: 'walk' }] }
  const first = withFactoryTimeContext(pair, [
    { taskId: 'read', timezone: 'UTC', label: '书房' },
    { taskId: 'walk', timezone: '' },
  ])
  expect(first.tasks.map((t) => t.timezone)).toEqual(['UTC', ''])
  expect(first.timezones).toEqual(['', 'UTC'])
  const next = withFactoryTimeContext(first, [{ taskId: 'walk', timezone: 'Asia/Shanghai' }])
  expect(next.tasks.map((t) => t.timezone)).toEqual(['', 'Asia/Shanghai'])
  expect(pair.tasks[1]!.timezone).toBe('')
  expect(withFactoryTimeContext(pair).tasks.map((t) => t.timezone)).toEqual(['', ''])
})

import { freezeWindow, projectFreezeWindow } from '@nerv-iip/scheduling/model'
it('host freeze intervals project literally without default calendar or implicit fallback', () => {
  const input = {
    windows: [
      {
        workCenterId: 'space',
        startUtc: '2026-01-15T04:00:00+02:00',
        endUtc: '2026-01-15T08:00:00+02:00',
      },
    ],
  }
  const window = freezeWindow(input, 'space')!
  expect(window).toEqual({
    startUtc: '2026-01-15T04:00:00+02:00',
    endUtc: '2026-01-15T08:00:00+02:00',
    start: 1768442400000,
    end: 1768456800000,
  })
  const projection = projectFreezeWindow(window, 1768435200000, 1768521600000)!
  expect(projection.left).toBeCloseTo(8.333333333333334, 10)
  expect(projection.width).toBeCloseTo(16.666666666666668, 10)
  expect(freezeWindow(input, 'absent')).toBeUndefined()
  expect(freezeWindow(null, 'space')).toBeUndefined()
})
it('freeze rejects invalid dates and clips only positive overlap on a valid axis', () => {
  for (const [startUtc, endUtc] of [
    ['2026-02-30T00:00:00Z', '2026-03-03T00:00:00Z'],
    ['2026-01-15T00:00:00', '2026-01-15T02:00:00Z'],
    ['2026-01-15T02:00:00Z', '2026-01-15T02:00:00Z'],
    ['2026-01-15T03:00:00Z', '2026-01-15T02:00:00Z'],
  ])
    expect(
      freezeWindow(
        { windows: [{ workCenterId: 'space', startUtc: startUtc!, endUtc: endUtc! }] },
        'space',
      ),
    ).toBeUndefined()
  const window = { startUtc: '', endUtc: '', start: 20, end: 80 }
  expect(projectFreezeWindow(window, 40, 100)!.left).toBe(0)
  expect(projectFreezeWindow(window, 40, 100)!.width).toBeCloseTo(66.66666666666667, 10)
  expect(projectFreezeWindow(window, 0, 50)).toMatchObject({ left: 40, width: 60 })
  for (const axis of [
    [80, 100],
    [0, 20],
    [50, 50],
    [60, 20],
    [NaN, 100],
    [0, Infinity],
  ])
    expect(projectFreezeWindow(window, axis[0]!, axis[1]!)).toBeUndefined()
})
it.each([
  ['2024-02-29T00:00:00Z', '2024-02-29T00:00:00'],
  ['2000-02-29T00:00:00Z', '2000-02-29T00:00:00'],
  ['2026-01-15T24:00:00Z', '2026-01-16T00:00:00'],
])('strict valid calendar %s displays %s', (input, expected) => {
  expect(factoryTimeInput(input, 'UTC')).toBe(expected)
})
it.each([
  '1900-02-29T00:00:00Z',
  '2026-04-31T00:00:00Z',
  '2026-01-15T24:00:01Z',
  '2026-01-15T00:00:00+24:00',
  '2026-01-15T00:00:00',
  'garbage',
])('strict invalid instant %s remains unknown', (input) => {
  expect(factoryTimeInput(input, 'UTC')).toBe('')
  expect(scheduleTime(input, 'UTC')).toBe('—')
})
it('invalid original and empty zone never bypass wall conversion checks', () => {
  expect(factoryTimeInstant('2026-01-15T06:00:00', '', '2026-01-15T06:00:00Z')).toBeUndefined()
  expect(factoryTimeInstant('2026-01-15T06:00:00', 'Invalid/Zone', '')).toBeUndefined()
  expect(factoryTimeInput('2026-01-15T06:00:00Z', '')).toBe('')
  expect(factoryTimeInstant('not-a-date', 'UTC', '')).toBeUndefined()
})

import { expectTypeOf } from 'vitest'
import type { ScheduleVisualModel } from '@nerv-iip/scheduling/model'
it('projected declarations replace literal host facts and zones with actual output types', () => {
  const literal = {
    tasks: [{ id: 'read', timezone: 'UTC', facts: [{ label: '旧标签', value: '旧值' }] }],
  } as const
  const projected = withWorkOrderFacts(withFactoryTimeContext(literal, []), [
    { taskId: 'read', facts: [{ label: '余票', state: 'known', value: 0 }] },
  ])
  expectTypeOf(projected.tasks[0]!.timezone).toEqualTypeOf<string>()
  expectTypeOf(projected.tasks[0]!.facts[0]!.value).toEqualTypeOf<string>()
  expect(projected.tasks[0]!.timezone).toBe('')
  expect(projected.tasks[0]!.facts).toEqual([{ label: '余票', value: '0' }])
  expect(literal.tasks[0].facts[0].value).toBe('旧值')
})

it('mixed readonly tasks retain id narrowing and literal fields after facts and time replacement', () => {
  const source = {
    horizon: { start: '2026-01-15T00:00Z', end: '2026-01-16T00:00Z' },
    links: [],
    tasks: [
      {
        id: 'read',
        label: 'Read',
        start: '2026-01-15T00:00Z',
        end: '2026-01-15T02:00Z',
        segments: [{ id: 'read-1', start: '2026-01-15T00:00Z', end: '2026-01-15T01:00Z' }],
        timezone: 'oldzone',
        facts: [{ label: 'oldfacts', value: 'oldvalue' }],
      },
      {
        id: 'walk',
        label: 'Walk',
        start: '2026-01-15T03:00Z',
        end: '2026-01-15T04:00Z',
        attentionLabel: 'Rain',
        timezone: 'oldzone',
        facts: [{ label: 'oldfacts', value: 'oldvalue' }],
      },
    ],
  } as const satisfies ScheduleVisualModel
  const timed = withFactoryTimeContext(source, [])
  const facts = withWorkOrderFacts(source, [])

  for (const task of timed.tasks) {
    expectTypeOf(task.timezone).toEqualTypeOf<string>()
    expectTypeOf(task.factoryTimeLabel).toEqualTypeOf<string>()
    expectTypeOf(task.facts).toEqualTypeOf<(typeof source.tasks)[0]['facts']>()
    expect(task.timezone).toBe('')
    expect(task.factoryTimeLabel).toBe('时区未解析')
    expect(task.facts).toEqual([{ label: 'oldfacts', value: 'oldvalue' }])
    if (task.id === 'read') {
      expectTypeOf(task.label).toEqualTypeOf<'Read'>()
      expectTypeOf(task.segments).toEqualTypeOf<(typeof source.tasks)[0]['segments']>()
      expect(task.segments[0].id).toBe('read-1')
    } else {
      expectTypeOf(task.id).toEqualTypeOf<'walk'>()
      expectTypeOf(task.label).toEqualTypeOf<'Walk'>()
      expectTypeOf(task.attentionLabel).toEqualTypeOf<'Rain'>()
      expect(task.attentionLabel).toBe('Rain')
    }
  }
  for (const task of facts.tasks) {
    expectTypeOf(task.facts[0]!.value).toEqualTypeOf<string>()
    expectTypeOf(task.timezone).toEqualTypeOf<'oldzone'>()
    expect(task.facts).toEqual([{ label: '事实', value: '未知' }])
    expect(task.timezone).toBe('oldzone')
    if (task.id === 'read') {
      expectTypeOf(task.label).toEqualTypeOf<'Read'>()
      expectTypeOf(task.segments).toEqualTypeOf<(typeof source.tasks)[0]['segments']>()
      expect(task.segments[0].id).toBe('read-1')
    } else {
      expectTypeOf(task.id).toEqualTypeOf<'walk'>()
      expectTypeOf(task.label).toEqualTypeOf<'Walk'>()
      expectTypeOf(task.attentionLabel).toEqualTypeOf<'Rain'>()
      expect(task.attentionLabel).toBe('Rain')
    }
  }
  for (const model of [withWorkOrderFacts(timed, []), withFactoryTimeContext(facts, [])]) {
    expectTypeOf(model).toMatchTypeOf<ScheduleVisualModel>()
    for (const task of model.tasks) {
      expectTypeOf(task.timezone).toEqualTypeOf<string>()
      expectTypeOf(task.facts[0]!.value).toEqualTypeOf<string>()
      expect(task.timezone).toBe('')
      expect(task.facts).toEqual([{ label: '事实', value: '未知' }])
      if (task.id === 'read') {
        expectTypeOf(task.segments).toEqualTypeOf<(typeof source.tasks)[0]['segments']>()
        expect(task.segments[0].id).toBe('read-1')
      } else {
        expectTypeOf(task.attentionLabel).toEqualTypeOf<'Rain'>()
        expect(task.attentionLabel).toBe('Rain')
      }
    }
  }
  expect(source.tasks.map((task) => [task.timezone, task.facts])).toEqual([
    ['oldzone', [{ label: 'oldfacts', value: 'oldvalue' }]],
    ['oldzone', [{ label: 'oldfacts', value: 'oldvalue' }]],
  ])
})

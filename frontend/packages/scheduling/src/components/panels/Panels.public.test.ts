import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  ChangeSummaryPanel,
  SchedulingLegend,
  factoryTimeInput,
  factoryTimeInstant,
  type ScheduleChange,
  type ScheduleModel,
  type TimeScale,
  type ScheduleTask,
  type BlockKind,
} from '../../index'

const model: ScheduleModel = {
  tasks: [
    {
      id: 'activity-a',
      orderId: 'group-a',
      operationId: 'internal-a',
      operationSequence: 1,
      type: 'operation',
      text: '晨间共读',
      resourceId: 'room-a',
      startUtc: '2026-10-26T00:00:00Z',
      endUtc: '2026-10-26T04:00:00Z',
      locked: false,
      hasConflict: false,
      timezone: 'Asia/Shanghai',
    },
  ],
  resources: [{ id: 'room-a', text: '晨光书房' }],
  links: [],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  horizon: { startUtc: '2026-10-26T00:00:00Z', endUtc: '2026-10-26T16:00:00Z' },
  timezones: ['Asia/Shanghai'],
  meta: { planId: 'reading', status: 'generated', algorithmVersion: 'host' },
}

it('change explicit identity never borrows replacement legacy pair facts or actions', async () => {
  const a = { ...model.tasks[0]!, display: { resourceLabel: 'A空间' } }
  const b = {
    ...a,
    id: 'activity-b',
    text: '另一活动',
    display: { resourceLabel: 'B专用空间' },
    startUtc: '2026-10-27T02:00:00Z',
    endUtc: '2026-10-27T04:00:00Z',
  }
  const change: ScheduleChange = {
    taskId: a.id,
    orderId: a.orderId,
    operationId: a.operationId,
    changeType: 'moved',
    message: '调整时间',
    label: '独立活动A',
  }
  const input = JSON.stringify({ a, b, change })
  const w = mount(ChangeSummaryPanel, {
    props: { changes: [change], baseTasks: [a], tasks: [a, b] },
  })
  await w.get('button[data-change-task]').trigger('click')
  expect(w.emitted('select')).toEqual([[a.id]])
  await w.setProps({ tasks: [b, a] })
  expect(w.text()).toContain('A空间 → A空间')
  await w.setProps({ tasks: [b] })
  expect.soft(w.text()).not.toContain('B专用空间')
  expect
    .soft(w.findAll('time').map((e) => e.attributes('datetime')))
    .toEqual([a.startUtc, a.endUtc])
  expect.soft(w.get('button[data-change-task]').attributes('disabled')).toBeDefined()
  await w.get('button[data-change-task]').trigger('click')
  expect(w.emitted('select')).toEqual([[a.id]])
  await w.setProps({ tasks: [] })
  expect(w.findAll('time').map((e) => e.attributes('datetime'))).toEqual([a.startUtc, a.endUtc])
  expect(w.get('button[data-change-task]').attributes('disabled')).toBeDefined()
  expect(JSON.stringify({ a, b, change })).toBe(input)
  w.unmount()
})

it('change legacy association requires an omitted identity and one matching pair', async () => {
  const a = { ...model.tasks[0]!, display: { resourceLabel: '唯一历史空间' } }
  const b = { ...a, id: 'activity-b', display: { resourceLabel: '重复历史空间' } }
  const change: ScheduleChange = {
    orderId: a.orderId,
    operationId: a.operationId,
    changeType: 'moved',
    message: '历史调整',
  }
  const w = mount(ChangeSummaryPanel, { props: { changes: [change], tasks: [a] } })
  expect(w.text()).toContain('唯一历史空间')
  expect(w.get('button').attributes('disabled')).toBeDefined()
  await w.setProps({ tasks: [b, a] })
  expect(w.text()).not.toContain('历史空间')
  await w.setProps({ tasks: [a, b] })
  expect(w.text()).not.toContain('历史空间')
  await w.setProps({ tasks: [{ ...b, operationId: 'different' }] })
  expect(w.text()).not.toContain('历史空间')
  await w.setProps({ tasks: [a], changes: [{ ...change, taskId: '' }] })
  expect(w.text()).not.toContain('唯一历史空间')
  expect(w.get('button').attributes('disabled')).toBeDefined()
  await w.get('button').trigger('click')
  expect(w.emitted('select')).toBeUndefined()
  await w.setProps({ changes: [{ ...change, taskId: a.id }], tasks: undefined })
  await w.get('button').trigger('click')
  expect(w.emitted('select')).toEqual([[a.id]])
  w.unmount()
})

it.each([
  ['Asia/Shanghai', '+08:00', 'hour'],
  ['Asia/Shanghai', '+08:00', 'day'],
  ['Asia/Shanghai', '+08:00', 'week'],
  ['Asia/Shanghai', '+08:00', 'month'],
  ['Asia/Kolkata', '+05:30', 'hour'],
  ['Asia/Kolkata', '+05:30', 'day'],
  ['Asia/Kolkata', '+05:30', 'week'],
  ['Asia/Kolkata', '+05:30', 'month'],
] as const)(
  'legend follows millisecond display cells in %s offset %s scale %s without changing edit instants',
  (zone, offset, scale) => {
    const operation = {
      ...model.tasks[0]!,
      timezone: zone,
      startUtc: `2026-11-02T09:00:00.123${offset}`,
      endUtc: `2026-11-02T11:00:00.123${offset}`,
    }
    const start = `2026-11-${scale === 'month' ? '01' : '02'}T${scale === 'hour' ? '09' : '00'}:00:00${offset}`
    const end = `2026-11-03T00:00:00${offset}`
    const input: ScheduleModel = {
      ...model,
      tasks: [
        operation,
        { ...operation, id: 'block', blockKind: 'maintenance', startUtc: start, endUtc: end },
      ],
      timezones: [zone],
      calendars: [
        {
          calendarId: 'calendar',
          resourceIds: ['room-a'],
          workCenterIds: [],
          shiftWindows: [{ startUtc: start, endUtc: end, shiftCode: 'open' }],
        },
      ],
    }
    const before = JSON.stringify(input)
    const w = mount(SchedulingLegend, { props: { model: input, scale: scale as TimeScale } })
    // Retained factory_hour_start clears milliseconds; coarser custom units retain
    // the original fractional instant through their offset conversion (real DOM).
    expect.soft(w.text().includes('班次边界')).toBe(scale === 'hour')
    expect.soft(w.text()).toContain('设备维护')
    // Display normalization must never change the public editing no-op contract.
    expect(
      factoryTimeInstant(factoryTimeInput(operation.startUtc, zone), zone, operation.startUtc),
    ).toBe(operation.startUtc)
    expect(JSON.stringify(input)).toBe(before)
    w.unmount()
  },
)

const block = (
  id: string,
  blockKind: BlockKind,
  end = '11',
  resourceId = 'room-a',
): ScheduleTask => ({
  ...model.tasks[0]!,
  id,
  blockKind,
  resourceId,
  startUtc: '2026-11-02T01:00:00Z',
  endUtc: `2026-11-02T${end === '11' ? '03' : '05'}:00:00Z`,
})
it.each([
  {
    name: 'first complete overlap',
    blocks: [block('m', 'maintenance'), block('d', 'downtime')],
    expected: ['设备维护'],
  },
  {
    name: 'reversed complete overlap',
    blocks: [block('d', 'downtime'), block('m', 'maintenance')],
    expected: ['计划停机'],
  },
  {
    name: 'partial both',
    blocks: [block('m', 'maintenance'), block('d', 'downtime', '13')],
    expected: ['设备维护', '计划停机'],
  },
  {
    name: 'partial reverse',
    blocks: [block('d', 'downtime', '13'), block('m', 'maintenance')],
    expected: ['计划停机'],
  },
])('legend block priority matches order cells for $name', ({ blocks, expected }) => {
  const operation = {
    ...model.tasks[0]!,
    startUtc: '2026-11-02T01:00:00Z',
    endUtc: '2026-11-02T05:00:00Z',
  }
  const w = mount(SchedulingLegend, {
    props: { model: { ...model, tasks: [operation, ...blocks] }, scale: 'hour' },
  })
  for (const label of ['设备维护', '计划停机'])
    expect(w.text().includes(label)).toBe(expected.includes(label))
  w.unmount()
})

it('legend block priority respects separate lanes and resource before work center across replacements', async () => {
  const a = {
    ...model.tasks[0]!,
    workCenterId: 'center-a',
    startUtc: '2026-11-02T01:00:00Z',
    endUtc: '2026-11-02T03:00:00Z',
  }
  const b = { ...a, id: 'activity-b', resourceId: 'room-b', workCenterId: 'center-b' }
  const m = { ...block('m', 'maintenance'), resourceId: undefined, workCenterId: 'center-a' }
  const d = block('d', 'downtime')
  const original = { ...model, tasks: [a, m, d] }
  const before = JSON.stringify(original)
  const w = mount(SchedulingLegend, { props: { model: original, scale: 'hour' } })
  expect.soft(w.text()).not.toContain('设备维护')
  expect(w.text()).toContain('计划停机')
  await w.setProps({
    model: {
      ...model,
      tasks: [a, b, block('m', 'maintenance'), block('d', 'downtime', '11', 'room-b')],
    },
  })
  expect(w.text()).toContain('设备维护')
  expect(w.text()).toContain('计划停机')
  await w.setProps({ model: { ...model, tasks: [b, block('m', 'maintenance')] } })
  expect(w.text()).not.toContain('设备维护')
  expect(w.text()).not.toContain('计划停机')
  await w.setProps({ model: { ...model, tasks: [] } })
  expect(w.text()).not.toContain('设备维护')
  await w.setProps({ model: { ...model, tasks: [a, block('d', 'downtime')] } })
  expect(w.text()).toContain('计划停机')
  expect(w.text()).not.toContain('设备维护')
  expect(JSON.stringify(original)).toBe(before)
  w.unmount()
})

it('legend keeps overlapping resource overlays at coarse scales while order cells retain first hit', async () => {
  const input = {
    ...model,
    horizon: { startUtc: '2026-11-02T00:00:00Z', endUtc: '2026-11-03T00:00:00Z' },
    tasks: [
      { ...model.tasks[0]!, startUtc: '2026-11-02T01:00:00Z', endUtc: '2026-11-02T03:00:00Z' },
      block('m', 'maintenance'),
      block('d', 'downtime'),
    ],
  }
  const w = mount(SchedulingLegend, { props: { model: input, view: 'resource', scale: 'month' } })
  expect(w.text()).toContain('设备维护')
  expect(w.text()).toContain('计划停机')
  await w.setProps({ view: 'order', scale: 'hour' })
  expect(w.text()).toContain('设备维护')
  expect(w.text()).not.toContain('计划停机')
  w.unmount()
})

describe('public panel display contracts', () => {
  it('legend does not promise absent lines calendars or blocks without model evidence', async () => {
    const w = mount(SchedulingLegend)
    expect.soft(w.text()).not.toContain('班次边界')
    expect.soft(w.text()).not.toContain('依赖箭头')
    expect.soft(w.text()).not.toContain('设备维护')
    await w.setProps({ model, scale: 'hour' })
    expect.soft(w.text()).not.toContain('非工作时段')
    expect.soft(w.text()).not.toContain('班次边界')
    expect.soft(w.text()).not.toContain('计划基线')
    w.unmount()
  })
})

it('toolbar keeps read only actions disabled with reasons and does not navigate an empty search', async () => {
  const { SchedulingToolbar } = await import('../../index')
  const w = mount(SchedulingToolbar, {
    props: {
      scale: 'hour',
      readOnly: true,
      canUndo: true,
      canRedo: true,
      dirty: true,
      busy: false,
      searchable: true,
      search: '未找到',
      matchCount: 0,
    },
  })
  const undo = w.get('button[aria-label="撤销"]')
  expect.soft(undo.attributes('disabled')).toBeDefined()
  expect.soft(undo.attributes('title')).toBe('当前为只读')
  expect.soft(w.get('button[aria-label="重做"]').attributes('disabled')).toBeDefined()
  expect
    .soft(
      w
        .findAll('button')
        .find((b) => b.text() === '重新排程')
        ?.attributes('disabled'),
    )
    .toBeDefined()
  expect
    .soft(
      w
        .findAll('button')
        .find((b) => b.text() === '发布计划')
        ?.attributes('disabled'),
    )
    .toBeDefined()
  await w.get('input').trigger('keydown', { key: 'Enter' })
  expect.soft(w.emitted('searchNext')).toBeUndefined()
  expect(w.get('[role="status"]').text()).toBe('无匹配')
  w.unmount()
})

it('detail uses host display facts preserves zero and follows same identity replacement before a controlled lock', async () => {
  const { TaskDetailPanel, TaskFacts } = await import('../../index')
  const t = {
    ...model.tasks[0]!,
    changeoverMin: 0,
    quantity: 0,
    progress: 0,
    display: { groupLabel: '周一读书会', resourceLabel: '晨光书房' },
    facts: [
      { label: '参与人数', value: '0' },
      { label: '关联活动', value: '' },
      { label: '反馈', value: '未知' },
      { label: '报名', value: '无权读取' },
      { label: '记录', value: '暂不可读取' },
    ],
  }
  const w = mount(TaskDetailPanel, {
    props: { task: t, readOnly: false, lockDisabledReason: '活动尚未确认' },
  })
  expect.soft(w.text()).toContain('晨光书房')
  expect.soft(w.text()).toContain('周一读书会')
  expect.soft(w.text()).toContain('0 分钟')
  expect.soft(w.text()).not.toContain('internal-a')
  expect.soft(w.get('button').attributes('disabled')).toBeDefined()
  await w.get('button').trigger('click')
  expect.soft(w.emitted('toggle-lock')).toBeUndefined()
  await w.setProps({
    task: { ...t, text: '晨间共读 · 更新', locked: true },
    lockDisabledReason: undefined,
  })
  await w.get('button').trigger('click')
  expect(w.emitted('toggle-lock')?.at(-1)).toEqual(['activity-a', false])
  expect(w.text()).toContain('已锁定') // request alone does not change authority
  await w.setProps({ task: { ...t, text: '晨间共读 · 更新', locked: false }, readOnly: true })
  expect(w.find('button').exists()).toBe(false)
  expect(w.text()).toContain('晨间共读 · 更新')
  const f = mount(TaskFacts)
  expect.soft(f.text()).toContain('未选择工序')
  await f.setProps({ task: t })
  expect(f.findAll('dd').map((d) => d.text())).toEqual(['0', '', '未知', '无权读取', '暂不可读取'])
  w.unmount()
  f.unmount()
})

it('change rows resolve the selected identity rather than a coincident legacy pair after reorder', async () => {
  const { ChangeSummaryPanel } = await import('../../index')
  const t = model.tasks[0]!
  const w = mount(ChangeSummaryPanel, {
    props: {
      changes: [
        {
          taskId: t.id,
          orderId: t.orderId,
          operationId: t.operationId,
          changeType: 'moved',
          message: '调整阅读时间',
          label: '晨间共读',
          groupLabel: '周一读书会',
        },
      ],
      tasks: [
        { ...t, id: 'other-activity', resourceId: 'wrong-room' },
        { ...t, resourceId: 'right-room', display: { resourceLabel: '晨光书房' } },
      ],
    },
  })
  expect.soft(w.text()).toContain('晨间共读')
  expect.soft(w.text()).toContain('晨光书房')
  expect.soft(w.text()).not.toContain('wrong-room')
  expect.soft(w.text()).not.toContain('internal-a')
  await w.get('button[data-change-task]').trigger('click')
  expect(w.emitted('select')?.at(-1)).toEqual(['activity-a'])
  w.unmount()
})

it('list actions use current host labels and identity and honor readonly and unavailable actions', async () => {
  const { ConflictPanel, UnscheduledPanel } = await import('../../index')
  const a = {
    id: 'notice-a',
    reason: 'calendar' as const,
    severity: 'warning' as const,
    message: '阅读室时间重叠',
    label: '晨间共读',
    reasonLabel: '时间待确认',
    taskId: 'activity-a',
  }
  const b = { ...a, id: 'notice-b', taskId: 'activity-b', label: '午间共读' }
  const c = mount(ConflictPanel, { props: { conflicts: [a, b] } })
  expect.soft(c.text()).toContain('时间待确认')
  await c.setProps({ conflicts: [b, a] })
  await c.get('button[data-conflict-id="notice-a"]').trigger('click')
  expect(c.emitted('select')?.at(-1)).toEqual(['activity-a'])
  const u = mount(UnscheduledPanel, {
    props: {
      items: [
        {
          orderId: 'internal-group',
          operationId: 'internal-operation',
          reason: 'calendar',
          message: '等待确认场地',
          label: '傍晚共读',
          groupLabel: '周一读书会',
          actionLabel: '查看安排',
        },
      ],
      readOnly: true,
    },
  })
  expect.soft(u.text()).toContain('傍晚共读')
  expect.soft(u.text()).not.toContain('internal-group')
  expect.soft(u.get('button').attributes('disabled')).toBeDefined()
  expect.soft(u.get('button').attributes('title')).toBe('当前为只读')
  c.unmount()
  u.unmount()
})

it('legend visibility follows host acknowledgement and resource boundaries use continuous overlays at coarse scales', async () => {
  const w = mount(SchedulingLegend, {
    props: {
      model: {
        ...model,
        calendars: [
          {
            calendarId: 'calendar-a',
            resourceIds: ['room-a'],
            workCenterIds: [],
            shiftWindows: [
              {
                startUtc: '2026-10-26T01:30:00Z',
                endUtc: '2026-10-26T03:00:00Z',
                shiftCode: 'morning',
              },
            ],
          },
        ],
      },
      scale: 'day',
      view: 'resource',
      categories: [{ key: 'reading', label: '共读' }],
      hiddenGroups: [],
    },
  })
  expect(w.text()).toContain('班次边界')
  await w.get('button[aria-label="隐藏 工序分色"]').trigger('click')
  expect(w.emitted('toggle-category')?.at(-1)).toEqual([{ key: 'category', visible: false }])
  expect(w.get('button[aria-label="隐藏 工序分色"]').attributes('aria-pressed')).toBe('false')
  await w.setProps({ hiddenGroups: ['category'] })
  expect(w.get('button[aria-label="显示 工序分色"]').attributes('aria-pressed')).toBe('true')
  await w.setProps({
    model: {
      ...model,
      calendars: [
        {
          calendarId: 'unrelated',
          resourceIds: ['other-room'],
          workCenterIds: [],
          shiftWindows: [
            {
              startUtc: '2026-10-26T00:00:00Z',
              endUtc: '2026-10-26T08:00:00Z',
              shiftCode: 'unused',
            },
          ],
        },
      ],
    },
  })
  expect(w.text()).not.toContain('班次边界')
  expect(w.text()).not.toContain('非工作时段')
  w.unmount()
})

it('toolbar emits each enabled public action and honors host capability reasons and optional clusters', async () => {
  const { SchedulingToolbar } = await import('../../index')
  const w = mount(SchedulingToolbar, {
    props: {
      scale: 'day',
      readOnly: false,
      canUndo: true,
      canRedo: true,
      dirty: true,
      busy: false,
    },
  })
  const events = [
    ['放大', 'zoomIn'],
    ['缩小', 'zoomOut'],
    ['定位到当前', 'today'],
    ['适配窗口', 'fit'],
    ['撤销', 'undo'],
    ['重做', 'redo'],
    ['锁定为只读', 'toggleReadOnly'],
  ] as const
  for (const [label, event] of events) {
    await w.get(`button[aria-label="${label}"]`).trigger('click')
    expect(w.emitted(event)?.at(-1)).toEqual([])
  }
  for (const [label, event] of [
    ['重新排程', 'repreview'],
    ['发布计划', 'release'],
  ] as const) {
    await w
      .findAll('button')
      .find((b) => b.text() === label)!
      .trigger('click')
    expect(w.emitted(event)?.at(-1)).toEqual([])
  }
  await w.setProps({
    disabledReasons: { zoomIn: '已到最大刻度', release: '当前不可确认' },
    busy: true,
  })
  expect(w.get('button[aria-label="放大"]').attributes('title')).toBe('已到最大刻度')
  expect(w.get('button[aria-label="撤销"]').attributes('title')).toBe('正在处理，请稍候')
  expect(
    w
      .findAll('button')
      .find((b) => b.text() === '发布计划')!
      .attributes('title'),
  ).toBe('当前不可确认')
  await w.setProps({ canEdit: false, canRelease: false, canRepreview: false })
  expect(w.find('button[aria-label="允许编辑"]').exists()).toBe(false)
  expect(w.find('button[aria-label="撤销"]').exists()).toBe(false)
  expect(w.text()).not.toContain('发布计划')
  expect(w.find('input').exists()).toBe(false)
  w.unmount()
})

it('list replacement and per row capability keep actions on current identities without inferred association', async () => {
  const { ConflictPanel, UnscheduledPanel, ChangeSummaryPanel } = await import('../../index')
  const c = mount(ConflictPanel, {
    props: {
      conflicts: [
        {
          id: 'same-notice',
          taskId: 'old-task',
          reason: 'calendar',
          severity: 'info',
          message: '旧记录',
        },
      ],
    },
  })
  await c.setProps({
    conflicts: [
      {
        id: 'same-notice',
        taskId: 'new-task',
        reason: 'calendar',
        severity: 'warning',
        message: '新记录',
        selectDisabledReason: '暂不可查看',
      },
    ],
  })
  expect(c.text()).not.toContain('旧记录')
  await c.get('button').trigger('click')
  expect(c.emitted('select')).toBeUndefined()
  await c.setProps({
    conflicts: [
      {
        id: 'same-notice',
        taskId: 'new-task',
        reason: 'calendar',
        severity: 'warning',
        message: '新记录',
      },
    ],
  })
  await c.get('button').trigger('click')
  expect(c.emitted('select')?.at(-1)).toEqual(['new-task'])
  const row = {
    orderId: 'group-new',
    operationId: 'operation-new',
    reason: 'calendar' as const,
    message: '等待场地',
    label: '傍晚分享',
  }
  const u = mount(UnscheduledPanel, {
    props: { items: [{ ...row, actionDisabledReason: '组织者离线' }] },
  })
  await u.get('button').trigger('click')
  expect(u.emitted('fix')).toBeUndefined()
  await u.setProps({ items: [row] })
  await u.get('button').trigger('click')
  expect(u.emitted('fix')?.at(-1)).toEqual(['group-new', 'operation-new'])
  const change = {
    orderId: 'unrelated',
    operationId: 'missing',
    changeType: 'blocked' as const,
    message: '等待确认',
  }
  const summary = mount(ChangeSummaryPanel, {
    props: { changes: [change], tasks: model.tasks, baseTasks: [] },
  })
  expect(summary.get('button').attributes('disabled')).toBeDefined()
  expect(summary.text()).not.toContain('晨间共读')
  await summary.get('input').setValue('没有匹配项')
  expect(summary.text()).toContain('没有匹配的变更')
  c.unmount()
  u.unmount()
  summary.unmount()
})

it('legend follows the real vendor odd hour phase and omits blocks that contain no order grid cell', async () => {
  const input = {
    ...model,
    horizon: { startUtc: '2026-11-01T16:00:00Z', endUtc: '2026-11-03T16:00:00Z' },
    tasks: [
      { ...model.tasks[0]!, startUtc: '2026-11-02T01:00:00Z', endUtc: '2026-11-02T08:00:00Z' },
      {
        ...model.tasks[0]!,
        id: 'cleanup',
        startUtc: '2026-11-02T04:00:00Z',
        endUtc: '2026-11-02T05:00:00Z',
        blockKind: 'maintenance' as const,
      },
    ],
    calendars: [
      {
        calendarId: 'opening',
        resourceIds: ['room-a'],
        workCenterIds: [],
        shiftWindows: [
          { startUtc: '2026-11-02T00:00:00Z', endUtc: '2026-11-02T10:00:00Z', shiftCode: 'even' },
        ],
      },
    ],
  }
  const w = mount(SchedulingLegend, { props: { model: input, scale: 'hour' } })
  expect.soft(w.text()).not.toContain('班次边界') // real vendor cells: 07,09,11,13,15,17,19
  expect.soft(w.text()).not.toContain('设备维护') // cleanup 12-13 contains no cell start
  await w.setProps({
    model: {
      ...input,
      calendars: [
        {
          ...input.calendars[0]!,
          shiftWindows: [
            { startUtc: '2026-11-02T01:00:00Z', endUtc: '2026-11-02T10:00:00Z', shiftCode: 'odd' },
          ],
        },
      ],
    },
  })
  expect.soft(w.text()).toContain('班次边界')
  await w.setProps({ view: 'resource', model: input })
  expect(w.text()).toContain('班次边界') // continuous P05 overlay does not require grid alignment
  expect(w.text()).toContain('设备维护')
  w.unmount()
})

it('legend does not label a zero changeover badge that the current resource card does not draw', () => {
  const w = mount(SchedulingLegend, {
    props: {
      model: { ...model, tasks: [{ ...model.tasks[0]!, changeoverMin: 0 }] },
      view: 'resource',
    },
  })
  expect(w.text()).not.toContain('换型耗时')
  w.unmount()
})

it('legend ignores stale summary dates when deriving the real operation hour phase', () => {
  const activity = {
    ...model.tasks[0]!,
    parentId: 'summary',
    startUtc: '2026-11-02T01:00:00Z',
    endUtc: '2026-11-02T04:00:00Z',
  }
  const summary = {
    ...activity,
    id: 'summary',
    type: 'order' as const,
    parentId: undefined,
    startUtc: '2026-11-02T00:00:00Z',
  }
  const w = mount(SchedulingLegend, {
    props: {
      scale: 'hour',
      model: {
        ...model,
        tasks: [summary, activity],
        calendars: [
          {
            calendarId: 'opening',
            resourceIds: ['room-a'],
            workCenterIds: [],
            shiftWindows: [
              {
                startUtc: '2026-11-02T00:00:00Z',
                endUtc: '2026-11-02T08:00:00Z',
                shiftCode: 'morning',
              },
            ],
          },
        ],
      },
    },
  })
  // The retained vendor getSubtaskDates excludes project summaries; actual cells start at 07:00.
  expect(w.text()).not.toContain('班次边界')
  w.unmount()
})

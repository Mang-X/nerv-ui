import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ResourceSchedulerBoard, type ScheduleModel, type ScheduleTask } from '../index'
import { __setGanttModuleForTest, type GanttModule } from '../engine/dhtmlx/loader'

// Real preserved Evaluation bytes in jsdom: DOM/identity lane, browser geometry separately.
let wrapper: VueWrapper<InstanceType<typeof ResourceSchedulerBoard>> | undefined
beforeEach(async () => {
  for (const property of ['offsetWidth', 'clientWidth'] as const)
    vi.spyOn(HTMLElement.prototype, property, 'get').mockReturnValue(1200)
  for (const property of ['offsetHeight', 'clientHeight'] as const)
    vi.spyOn(HTMLElement.prototype, property, 'get').mockReturnValue(4000)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 1200,
        bottom: 4000,
        width: 1200,
        height: 4000,
        toJSON() {
          return {}
        },
      }
    },
  )
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
  const vendor = await vi.importActual<GanttModule>('../../vendor/dhtmlx/dhtmlxgantt.es.js')
  await vi.advanceTimersByTimeAsync(2)
  __setGanttModuleForTest(vendor)
})
afterEach(async () => {
  wrapper?.unmount()
  wrapper = undefined
  await vi.advanceTimersByTimeAsync(2)
  __setGanttModuleForTest(null)
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})
const task = (id: string, resourceId: string, space: string, team: string): ScheduleTask => ({
  id,
  resourceId,
  workCenterId: space,
  orderId: id,
  operationId: id,
  operationSequence: 0,
  type: 'operation',
  text: `Activity ${id}`,
  timezone: 'UTC',
  locked: false,
  hasConflict: false,
  startUtc: '2026-10-25T08:00:00Z',
  endUtc: '2026-10-25T10:00:00Z',
  dimensions: { workCenter: { id: space, label: space }, team: { id: team, label: team } },
})
function model(): ScheduleModel {
  return {
    tasks: [
      task('a', 'r0', 'Zero', 'Blue'),
      task('b', 'ru', 'Unknown', 'Blue'),
      task('c', 'ro', 'Over', 'Amber'),
    ],
    resources: [
      {
        id: 'r0',
        text: 'Zero resource',
        utilization: 0,
        oee: 0,
        changeoverCount: 0,
        materialRisk: 0,
      },
      { id: 'ru', text: 'Unknown resource' },
      { id: 'ro', text: 'Over resource', utilization: 1.5 },
      { id: 'Zero', text: 'Unrelated resource', utilization: 9 },
    ],
    groupDimensions: [
      { key: 'workCenter', label: 'Space' },
      { key: 'team', label: 'Team' },
    ],
    groupValues: {
      workCenter: [
        { id: 'Zero', label: 'Zero' },
        { id: 'Unknown', label: 'Unknown' },
        { id: 'Over', label: 'Over' },
        { id: 'Empty', label: 'Empty' },
      ],
      team: [
        { id: 'Blue', label: 'Blue' },
        { id: 'Amber', label: 'Amber' },
        { id: 'Quiet', label: 'Quiet' },
      ],
    },
    loads: [],
    links: [],
    conflicts: [],
    unscheduled: [],
    changes: [],
    timezones: ['UTC'],
    horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
    meta: { planId: 'public-resource', status: 'generated', algorithmVersion: 'host' },
  }
}
async function show(input = model(), groupBy = 'workCenter') {
  wrapper = mount(ResourceSchedulerBoard, {
    attachTo: document.body,
    props: { model: input, groupBy, laneOrder: 'name', scale: 'hour', readOnly: true },
  })
  await flushPromises()
  await vi.advanceTimersByTimeAsync(2)
  await nextTick()
  expect(wrapper.find('[data-engine="dhtmlx"]').exists()).toBe(true)
  return wrapper
}
function row(label: string) {
  const rows = [...document.querySelectorAll('.gantt_row')]
  const result = rows.find(
    (element) => element.querySelector('.nerv-lane-name')?.textContent === label,
  )
  expect(result, `lane ${label}`).toBeTruthy()
  return result as HTMLElement
}
it('public resource headers preserve known zero unknown and overload without borrowing a colliding resource id', async () => {
  await show()
  expect(row('Zero').textContent).toContain('0%')
  expect(row('Zero').textContent).not.toContain('900%')
  expect(row('Zero').textContent).toContain('OEE0%')
  expect(row('Unknown').textContent).toContain('—')
  expect(row('Unknown').textContent).not.toContain('0%')
  expect(row('Over').querySelector('.nerv-over')?.textContent).toBe('150%')
  expect(row('Empty')).toBeTruthy()
})
function labels() {
  return [...document.querySelectorAll('.gantt_row .nerv-lane-name')].map(
    (node) => node.textContent,
  )
}
async function update(props: Record<string, unknown>) {
  await wrapper!.setProps(props)
  await flushPromises()
  await nextTick()
}

// Public DOM gestures on the preserved vendor. Geometry is deterministic jsdom
// input here; trusted browser pointers and scrolling have their own receipt.
function resourcePointer(type: string, x: number, y: number, target: EventTarget = document.body) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      button: 0,
      buttons: type === 'mouseup' ? 0 : 1,
      clientX: x,
      clientY: y,
    }),
  )
}
function beginResourceMove(id = 'a') {
  const bar = document.querySelector<HTMLElement>(`.gantt_task_line[data-task-id="${id}"]`)!
  expect(bar).toBeTruthy()
  Object.defineProperty(bar, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 100,
      top: 0,
      right: 220,
      bottom: 264,
      width: 120,
      height: 264,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    }),
  })
  Object.defineProperty(document.querySelector('.nerv-drop-cancel')!, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ left: 1000, top: 3800, right: 1200, bottom: 3900, width: 200, height: 100 }),
  })
  resourcePointer('mousedown', 130, 40, bar.querySelector('.nerv-card')!)
  return bar
}
it('public resource reassignment preserves input and resource identity and clears rejected drag visuals', async () => {
  const input = model()
  const before = JSON.stringify(input)
  await show(input)
  await update({ readOnly: false })
  beginResourceMove()
  // Name order: Empty, Over, Unknown, Zero. Drop a from Zero onto Unknown.
  resourcePointer('mousemove', 260, 600)
  expect(document.querySelector<HTMLElement>('.nerv-drop-hint')!.style.display).toBe('flex')
  expect.soft(document.querySelector('.nerv-drop-tip')!.textContent).toMatch(/\d{2}:00$/)
  resourcePointer('mouseup', 260, 600)
  expect.soft(document.querySelectorAll('.nerv-drag-source')).toHaveLength(0)
  await vi.advanceTimersByTimeAsync(2)
  await nextTick()
  expect.soft(JSON.stringify(input)).toBe(before)
  expect.soft(wrapper!.emitted('taskDragEnd')?.[0]?.[0]).toMatchObject({
    taskId: 'a',
    operationId: 'a',
    resourceId: 'r0',
    kind: 'reassign',
    assignment: { dimension: 'workCenter', id: 'Unknown', label: 'Unknown' },
  })
  expect.soft(document.querySelectorAll('.nerv-drag-source')).toHaveLength(0)
  expect.soft(document.querySelector<HTMLElement>('.nerv-drop-hint')!.style.display).toBe('none')
  expect.soft(document.querySelector<HTMLElement>('.nerv-drop-cancel')!.style.display).toBe('none')
  expect.soft(wrapper!.emitted('taskSelect')).toBeUndefined()
})

it.each([
  'Escape',
  'cancel zone',
  'outside timeline',
  'read only',
  'authority replacement',
  'dimension replacement',
])('public resource move cancels on %s without proposing or leaving a ghost', async (reason) => {
  const input = model()
  const before = JSON.stringify(input)
  await show(input)
  await update({ readOnly: false })
  beginResourceMove()
  resourcePointer('mousemove', 260, 600)
  if (reason === 'Escape')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  if (reason === 'read only') await update({ readOnly: true })
  if (reason === 'authority replacement')
    await update({
      model: {
        ...input,
        tasks: input.tasks.map((t) =>
          t.id === 'a'
            ? {
                ...t,
                text: 'New authority',
                startUtc: '2026-10-25T12:00:00Z',
                endUtc: '2026-10-25T15:00:00Z',
              }
            : t,
        ),
      },
    })
  if (reason === 'dimension replacement') await update({ groupBy: 'team' })
  const [x, y] =
    reason === 'cancel zone'
      ? [1100, 3850]
      : reason === 'outside timeline'
        ? [-20, 600]
        : [260, 600]
  resourcePointer('mousemove', x!, y!)
  resourcePointer('mouseup', x!, y!)
  await vi.advanceTimersByTimeAsync(2)
  await nextTick()
  expect(wrapper!.emitted('taskDragEnd')).toBeUndefined()
  expect(JSON.stringify(input)).toBe(before)
  expect(document.querySelectorAll('.nerv-drag-source')).toHaveLength(0)
  expect(document.querySelector<HTMLElement>('.nerv-drop-hint')!.style.display).toBe('none')
  expect(document.querySelector<HTMLElement>('.nerv-drop-cancel')!.style.display).toBe('none')
  if (reason === 'authority replacement') expect(wrapper!.text()).toContain('New authority')
  // The next deliberate click must still select; cancellation cannot consume it.
  const bar = document.querySelector('.gantt_task_line[data-task-id="a"]')!
  resourcePointer('mousedown', 100, 40, bar)
  resourcePointer('mouseup', 100, 40)
  bar.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(wrapper!.emitted('taskSelect')?.at(-1)).toEqual(['a'])
})

it.each(['team', 'equipment', 'resource'])(
  'public resource explicit %s assignment accepts a frozen model without inventing equipment or work-center identity',
  async (dimension) => {
    const input = model()
    input.groupValues = { ...input.groupValues, [dimension]: input.groupValues!.team! }
    input.tasks = input.tasks.map((t) => ({
      ...t,
      dimensions: { ...t.dimensions, [dimension]: t.dimensions!.team! },
    }))
    const freeze = (value: unknown): void => {
      if (value && typeof value === 'object') {
        Object.values(value).forEach(freeze)
        Object.freeze(value)
      }
    }
    freeze(input)
    await show(input, dimension)
    await update({ readOnly: false })
    const before = document.querySelector<HTMLElement>('.gantt_task_line[data-task-id="a"]')!.style
      .top
    beginResourceMove()
    resourcePointer('mousemove', 260, 40) // Amber is the first lane in team name order.
    resourcePointer('mouseup', 260, 40)
    await vi.advanceTimersByTimeAsync(2)
    await nextTick()
    const payload = wrapper!.emitted('taskDragEnd')![0]![0] as import('../index').TaskDragPayload
    expect(payload).toMatchObject({
      taskId: 'a',
      operationId: 'a',
      resourceId: 'r0',
      kind: 'reassign',
      assignment: { dimension, id: 'Amber', label: 'Amber' },
    })
    expect(
      document.querySelector<HTMLElement>('.gantt_task_line[data-task-id="a"]')!.style.top,
    ).toBe(before)
    const accepted = {
      ...input,
      tasks: input.tasks.map((t) =>
        t.id === 'a'
          ? {
              ...t,
              startUtc: payload.startUtc,
              endUtc: payload.endUtc,
              dimensions: { ...t.dimensions, [dimension]: { id: 'Amber', label: 'Amber' } },
            }
          : t,
      ),
    }
    await update({ model: accepted })
    expect(accepted.tasks[0]!.resourceId).toBe('r0')
    expect(accepted.tasks[0]!.workCenterId).toBe('Zero')
    expect(labels()).toEqual(['Amber', 'Blue', 'Quiet'])
    expect(
      document.querySelector<HTMLElement>('.gantt_task_line[data-task-id="a"]')!.style.top,
    ).not.toBe(before)
    expect(input.tasks[0]!.dimensions![dimension]!.id).toBe('Blue')
  },
)

it('public legacy resource reassignment names a real resource while horizontal moves snap to hours and preserve duration', async () => {
  const input = model()
  input.groupDimensions = undefined
  input.groupValues = undefined
  input.tasks = input.tasks.map((t) => ({ ...t, dimensions: undefined, workCenterId: undefined }))
  const before = JSON.stringify(input)
  await show(input)
  await update({ readOnly: false })
  // Name order: Over resource, Unknown resource, Unrelated resource, Zero resource.
  beginResourceMove()
  resourcePointer('mousemove', 260, 320)
  resourcePointer('mouseup', 260, 320)
  await vi.advanceTimersByTimeAsync(2)
  const first = wrapper!.emitted('taskDragEnd')![0]![0] as import('../index').TaskDragPayload
  expect(first).toMatchObject({ taskId: 'a', resourceId: 'ru', kind: 'reassign' })
  expect(first.assignment).toBeUndefined()
  beginResourceMove()
  resourcePointer('mousemove', 300, 900)
  resourcePointer('mouseup', 300, 900)
  await vi.advanceTimersByTimeAsync(2)
  const moved = wrapper!.emitted('taskDragEnd')![1]![0] as import('../index').TaskDragPayload
  expect(moved).toMatchObject({ taskId: 'a', resourceId: 'r0', kind: 'move' })
  expect(moved.assignment).toBeUndefined()
  expect(moved.startUtc).toMatch(/T\d{2}:00:00\.000Z$/)
  expect(Date.parse(moved.endUtc) - Date.parse(moved.startUtc)).toBe(7_200_000)
  expect(JSON.stringify(input)).toBe(before)
})

it.each(['dimension', 'legacy resource'])(
  'public resource unassigned lane preserves the %s namespace without inventing an empty id',
  async (namespace) => {
    const input = model()
    input.tasks.push({
      ...task('unassigned', '', '', ''),
      resourceId: undefined,
      workCenterId: undefined,
      dimensions: undefined,
    })
    if (namespace === 'legacy resource') {
      input.groupDimensions = undefined
      input.groupValues = undefined
      input.tasks = input.tasks.map((t) => ({
        ...t,
        workCenterId: undefined,
        dimensions: undefined,
      }))
    }
    const before = JSON.stringify(input)
    await show(input)
    await update({ readOnly: false })
    const index = labels().indexOf('未分配')
    expect(index).toBeGreaterThanOrEqual(0)
    beginResourceMove()
    resourcePointer('mousemove', 260, index * 280 + 40)
    resourcePointer('mouseup', 260, index * 280 + 40)
    await vi.advanceTimersByTimeAsync(2)
    const payload = wrapper!.emitted('taskDragEnd')![0]![0] as import('../index').TaskDragPayload
    expect(payload.kind).toBe('reassign')
    if (namespace === 'dimension') {
      expect(payload.resourceId).toBe('r0')
      expect(payload.assignment).toEqual({ dimension: 'workCenter', id: null, label: '未分配' })
    } else {
      expect(Object.hasOwn(payload, 'resourceId')).toBe(true)
      expect(payload.resourceId).toBeUndefined()
      expect(payload.assignment).toBeUndefined()
    }
    expect(JSON.stringify(input)).toBe(before)
  },
)

it.each(['locked', 'segments', 'block', 'milestone', 'zero duration'])(
  'public resource editing rejects %s activities',
  async (state) => {
    const input = model()
    if (state === 'locked') input.tasks[0]!.locked = true
    if (state === 'segments')
      input.tasks[0]!.segments = [
        { startUtc: input.tasks[0]!.startUtc, endUtc: '2026-10-25T09:00:00Z' },
        { startUtc: '2026-10-25T09:30:00Z', endUtc: input.tasks[0]!.endUtc },
      ]
    if (state === 'block') input.tasks[0]!.blockKind = 'maintenance'
    if (state === 'milestone') input.tasks[0]!.isMilestone = true
    if (state === 'zero duration') input.tasks[0]!.endUtc = input.tasks[0]!.startUtc
    const before = JSON.stringify(input)
    await show(input)
    await update({ readOnly: false })
    if (state === 'block' || state === 'milestone')
      expect(document.querySelector('.gantt_task_line[data-task-id="a"]')).toBeNull()
    else {
      beginResourceMove()
      resourcePointer('mousemove', 260, 600)
      resourcePointer('mouseup', 260, 600)
    }
    await vi.advanceTimersByTimeAsync(2)
    expect(wrapper!.emitted('taskDragEnd')).toBeUndefined()
    expect(document.querySelectorAll('.nerv-drag-source')).toHaveLength(0)
    expect(document.querySelector<HTMLElement>('.nerv-drop-hint')!.style.display).toBe('none')
    expect(JSON.stringify(input)).toBe(before)
    if (state === 'locked') expect(wrapper!.emitted('lockedDragAttempt')).toEqual([['a']])
  },
)
function legacyResourceModel(): ScheduleModel {
  return {
    ...model(),
    tasks: [],
    resources: [{ id: 'r0', text: 'Resource r0' }],
    groupDimensions: undefined,
    groupValues: undefined,
    calendars: [
      { calendarId: 'unrelated-center', resourceIds: [], workCenterIds: ['r0'], shiftWindows: [] },
    ],
    freezeContext: {
      windows: [
        { workCenterId: 'r0', startUtc: '2026-10-25T08:30:00Z', endUtc: '2026-10-25T09:30:00Z' },
      ],
    },
  }
}
it.each([
  { case: 'vendor', native: false },
  { case: 'native', native: true },
])(
  'public $case resource fallback never borrows same-id work-center windows and retains resource blocks',
  async ({ native }) => {
    const input = legacyResourceModel()
    if (native) {
      __setGanttModuleForTest(null)
      wrapper = mount(ResourceSchedulerBoard, {
        attachTo: document.body,
        props: {
          model: input,
          groupBy: 'workCenter',
          laneOrder: 'name',
          scale: 'hour',
          readOnly: true,
        },
      })
      await flushPromises()
      expect(wrapper.find('[data-slot="nv-schedule-timeline"]').exists()).toBe(true)
    } else await show(input)
    expect(wrapper!.text()).toContain('Resource r0')
    expect(
      wrapper!.findAll('[data-calendar-window], [data-freeze-window], [data-window-id]'),
    ).toHaveLength(0)
    // Compatibility still admits genuinely associated resource calendars/blocks.
    const block = {
      ...task('resource-block', 'r0', '', ''),
      dimensions: undefined,
      workCenterId: undefined,
      blockKind: 'maintenance' as const,
      startUtc: '2026-10-25T08:30:00Z',
      endUtc: '2026-10-25T09:30:00Z',
    }
    await update({
      model: {
        ...input,
        tasks: [block],
        calendars: [{ ...input.calendars![0]!, resourceIds: ['r0'], workCenterIds: [] }],
      },
    })
    expect(wrapper!.text()).toContain('Resource r0')
    expect(wrapper!.findAll('[data-freeze-window]')).toHaveLength(0)
    if (native) expect(wrapper!.findAll('[data-window-id]')).toHaveLength(1)
    else {
      expect(wrapper!.findAll('[data-calendar-window]').length).toBeGreaterThan(0)
      expect(wrapper!.findAll('[data-block-window]').map((w) => [w.attributes('style')])).toEqual([
        ['left:25%;width:50%'],
      ])
    }
    await update({ model: { ...input, resources: [], calendars: [], freezeContext: null } })
    expect(wrapper!.text()).not.toContain('Resource r0')
    expect(
      wrapper!.findAll(
        '[data-calendar-window], [data-freeze-window], [data-block-window], [data-window-id]',
      ),
    ).toHaveLength(0)
  },
)
it.each([
  { case: 'vendor', native: false },
  { case: 'native', native: true },
])(
  'public $case explicit work-center tasks suppress resource fallback across ordering replacement and dimensions',
  async ({ native }) => {
    const op = { ...task('op', 'r0', 'wc-A', ''), dimensions: undefined }
    const input = { ...legacyResourceModel(), tasks: [op], calendars: [], freezeContext: null }
    if (native) {
      __setGanttModuleForTest(null)
      wrapper = mount(ResourceSchedulerBoard, {
        attachTo: document.body,
        props: { model: input, groupBy: 'workCenter', laneOrder: 'name', readOnly: true },
      })
      await flushPromises()
    } else await show(input)
    const laneLabels = () =>
      native
        ? wrapper!
            .findAll('.nv-schedule-timeline-lane .nv-schedule-timeline-label__name')
            .map((w) => w.text())
        : labels()
    const check = (expected: string[]) => expect(laneLabels()).toEqual(expected)
    for (const laneOrder of ['name', 'busiest', 'onlyScheduled']) {
      await update({ laneOrder })
      check(['wc-A'])
      await wrapper!
        .find(native ? '[data-task-id="op"]' : '.gantt_task_line[data-task-id="op"]')
        .trigger('click')
      expect(wrapper!.emitted('taskSelect')?.at(-1)).toEqual(['op'])
    }
    // A later task supplies the dimension for the whole input, including unassigned members.
    await update({
      laneOrder: 'name',
      model: { ...input, tasks: [{ ...op, id: 'unassigned', workCenterId: undefined }, op] },
    })
    check(['未分配', 'wc-A'])
    // Blocks also carry explicit membership, but never qualify for onlyScheduled.
    await update({ model: { ...input, tasks: [{ ...op, blockKind: 'maintenance' }] } })
    check(['wc-A'])
    await update({ laneOrder: 'onlyScheduled' })
    expect(wrapper!.text()).not.toContain('wc-A')
    // Task dimensions outrank resource dimensions, which outrank the legacy workCenterId.
    await update({
      laneOrder: 'name',
      model: {
        ...input,
        resources: [
          {
            ...input.resources[0]!,
            dimensions: { workCenter: { id: 'wc-R', label: 'Resource center' } },
          },
        ],
        tasks: [{ ...op, dimensions: { workCenter: { id: 'wc-T', label: 'Task center' } } }],
      },
    })
    check(['Resource center', 'Task center'])
    expect(wrapper!.text()).not.toContain('wc-A')
    await update({
      model: {
        ...input,
        resources: [
          {
            ...input.resources[0]!,
            dimensions: { workCenter: { id: 'wc-R', label: 'Resource center' } },
          },
        ],
      },
    })
    check(['Resource center'])
    await update({
      model: {
        ...input,
        tasks: [{ ...op, workCenterId: undefined }],
        groupValues: { workCenter: [] },
      },
    })
    check(['未分配'])
    // workCenterId cannot invent membership in an unrelated dimension.
    await update({ groupBy: 'team', model: input })
    expect(wrapper!.text()).toContain('Resource r0')
    expect(wrapper!.text()).not.toContain('wc-A')
    await update({ groupBy: 'workCenter', model: { ...input, tasks: [] } })
    expect(wrapper!.text()).toContain('Resource r0')
    expect(wrapper!.text()).not.toContain('wc-A')
    await update({ model: { ...input, tasks: [], resources: [] } })
    expect(wrapper!.text()).not.toContain('Resource r0')
  },
)
it('public controlled dimensions and three orders retain catalog empty and block-only lanes and stable task events after reorder', async () => {
  const input = model()
  input.tasks.push({ ...task('block', 'rb', 'Block', 'Quiet'), blockKind: 'maintenance' })
  input.resources.push({
    id: 're',
    text: 'Catalog member',
    dimensions: {
      workCenter: { id: 'Resource only', label: 'Resource only' },
      team: { id: 'Reserve', label: 'Reserve' },
    },
  })
  input.tasks[0]!.hasConflict = true
  const before = JSON.stringify(input)
  await show(input)
  expect(labels()).toEqual(['Block', 'Empty', 'Over', 'Resource only', 'Unknown', 'Zero'])
  for (const [groupBy, busiest, names, scheduled] of [
    [
      'workCenter',
      ['Zero', 'Unknown', 'Over', 'Empty', 'Resource only', 'Block'],
      ['Block', 'Empty', 'Over', 'Resource only', 'Unknown', 'Zero'],
      ['Zero', 'Unknown', 'Over'],
    ],
    [
      'team',
      ['Blue', 'Amber', 'Quiet', 'Reserve'],
      ['Amber', 'Blue', 'Quiet', 'Reserve'],
      ['Blue', 'Amber'],
    ],
  ] as const) {
    for (const [laneOrder, expected] of [
      ['busiest', busiest],
      ['name', names],
      ['onlyScheduled', scheduled],
    ] as const) {
      await update({ groupBy, laneOrder })
      expect(labels()).toEqual(expected)
      wrapper!.vm.command({ kind: 'revealTask', taskId: 'a' })
      const bar = wrapper!.find('.gantt_task_line[data-task-id="a"]')
      expect(bar.exists()).toBe(true)
      await bar.trigger('click')
      expect(wrapper!.emitted('taskSelect')?.at(-1)).toEqual(['a'])
      expect(wrapper!.emitted('conflictClick')?.at(-1)).toEqual(['a'])
    }
  }
  await update({
    model: {
      ...input,
      tasks: [...input.tasks].reverse(),
      resources: [...input.resources].reverse(),
    },
  })
  await wrapper!.find('.gantt_task_line[data-task-id="c"]').trigger('click')
  expect(wrapper!.emitted('taskSelect')?.at(-1)).toEqual(['c'])
  expect(wrapper!.emitted('taskDragEnd')).toBeUndefined()
  expect(wrapper!.emitted('update:groupBy')).toBeUndefined()
  expect(JSON.stringify(input)).toBe(before)
  await update({
    groupBy: 'workCenter',
    laneOrder: 'name',
    model: {
      ...input,
      tasks: [input.tasks[0]!],
      resources: [input.resources[0]],
      groupValues: { workCenter: [{ id: 'Zero', label: 'Renamed zero' }] },
    },
  })
  expect(labels()).toEqual(['Renamed zero'])
  expect(document.querySelector('.gantt_task_line[data-task-id="c"]')).toBeNull()
  expect(document.body.textContent).not.toContain('Unknown')
})
it('public empty resources and all-zero metrics remain visible without a task or an empty-state overlay', async () => {
  const input = model()
  input.tasks = []
  input.groupValues = { workCenter: [{ id: 'Zero', label: 'Zero' }] }
  input.resources = [
    { ...input.resources[0]!, dimensions: { workCenter: { id: 'Zero', label: 'Zero' } } },
  ]
  await show(input)
  expect(row('Zero').textContent).toContain('利用率0%OEE0%切换0待料0')
  expect(wrapper!.find('[data-testid="gantt-empty"]').exists()).toBe(false)
  await update({ laneOrder: 'onlyScheduled' })
  expect(wrapper!.find('[data-testid="gantt-empty"]').exists()).toBe(true)
})
it('public generated lane ids never replace a colliding task identity or emit a lane as a task', async () => {
  const input = model()
  input.tasks[0]!.id = 'lane:Zero'
  await show(input)
  wrapper!.vm.command({ kind: 'revealTask', taskId: 'lane:Zero' })
  const bar = wrapper!.find('.gantt_task_line[data-task-id="lane:Zero"]')
  expect(bar.exists()).toBe(true)
  await bar.trigger('click')
  expect(wrapper!.emitted('taskSelect')?.at(-1)).toEqual(['lane:Zero'])
  const count = wrapper!.emitted('taskSelect')!.length
  row('Zero').dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(wrapper!.emitted('taskSelect')).toHaveLength(count)
})
it('public resource names remain literal text even when they contain markup', async () => {
  const input = model()
  input.groupValues!.workCenter![0]!.label = '<img src=x onerror=alert(1)>'
  await show(input)
  expect(row('<img src=x onerror=alert(1)>').querySelector('img')).toBeNull()
})
it('public calendar block and freeze backgrounds stay scoped to their input namespace and clear on replacement', async () => {
  const input = model()
  // Same raw id belongs to two unrelated namespaces: r0 resource vs r0 work-center.
  input.tasks = [
    task('a', 'r0', 'Zero', 'Blue'),
    task('b', 'ru', 'r0', 'Amber'),
    { ...task('block', 'rb', 'Block', 'Quiet'), blockKind: 'maintenance' },
  ]
  input.groupValues!.workCenter = [
    { id: 'Zero', label: 'Zero' },
    { id: 'r0', label: 'Other center' },
    { id: 'Block', label: 'Block' },
  ]
  input.calendars = [
    {
      calendarId: 'only-r0-resource',
      resourceIds: ['r0'],
      workCenterIds: [],
      shiftWindows: [
        { startUtc: '2026-10-25T08:00:00Z', endUtc: '2026-10-25T09:00:00Z', shiftCode: 'morning' },
      ],
    },
  ]
  input.tasks[2]!.startUtc = '2026-10-25T08:30:00Z'
  input.tasks[2]!.endUtc = '2026-10-25T09:30:00Z'
  input.freezeContext = {
    windows: [
      { workCenterId: 'r0', startUtc: '2026-10-25T08:30:00Z', endUtc: '2026-10-25T09:30:00Z' },
    ],
  }
  await show(input)
  const timeline = (id: string) => document.querySelector(`.gantt_task_row[task_id="lane:${id}"]`)!
  expect(timeline('Zero').querySelectorAll('.nerv-offwork').length).toBeGreaterThan(0)
  expect(timeline('Zero').querySelectorAll('.nerv-shift-start')).toHaveLength(1)
  expect(timeline('r0').querySelectorAll('.nerv-offwork, .nerv-shift-start')).toHaveLength(0)
  expect(timeline('r0').querySelectorAll('[data-freeze-window]').length).toBeGreaterThan(0)
  expect(timeline('Zero').querySelectorAll('[data-freeze-window]')).toHaveLength(0)
  const blocks = [...timeline('Block').querySelectorAll<HTMLElement>('[data-block-window]')]
  expect(blocks.map((block) => [block.style.left, block.style.width])).toEqual([['25%', '50%']])
  const frozen = [...timeline('r0').querySelectorAll<HTMLElement>('[data-freeze-window]')]
  expect(frozen.map((window) => [window.style.left, window.style.width])).toEqual([['25%', '50%']])
  expect(timeline('Zero').querySelectorAll('.nerv-cell-block')).toHaveLength(0)
  await update({ model: { ...input, calendars: [{ ...input.calendars![0]!, shiftWindows: [] }] } })
  expect(timeline('Zero').querySelectorAll('[data-calendar-window]').length).toBeGreaterThan(0)
  expect(timeline('r0').querySelectorAll('[data-calendar-window]')).toHaveLength(0)
  await update({ groupBy: 'team' })
  expect(document.querySelectorAll('[data-freeze-window]')).toHaveLength(0)
  await update({
    model: {
      ...input,
      calendars: [],
      freezeContext: null,
      tasks: input.tasks.filter((task) => !task.blockKind),
    },
  })
  expect(
    document.querySelectorAll(
      '.nerv-offwork, .nerv-shift-start, .nerv-cell-block, [data-freeze-window]',
    ),
  ).toHaveLength(0)
})
it('public missing-module fallback shares dimension membership empty lanes block windows and exact selection ids', async () => {
  __setGanttModuleForTest(null)
  const input = model()
  input.tasks.push({ ...task('block', 'rb', 'Block', 'Quiet'), blockKind: 'maintenance' })
  wrapper = mount(ResourceSchedulerBoard, {
    attachTo: document.body,
    props: { model: input, readOnly: true, groupBy: 'workCenter', laneOrder: 'name' },
  })
  await flushPromises()
  expect(wrapper.find('[data-slot="nv-schedule-timeline"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Block')
  expect(wrapper.text()).toContain('Empty')
  expect(wrapper.text()).not.toContain('Unrelated resource')
  const activity = wrapper.find('[data-task-id="a"]')
  await activity.trigger('click')
  expect(wrapper.emitted('taskSelect')?.at(-1)).toEqual(['a'])
  expect(wrapper.findAll('[data-window-id]')).not.toHaveLength(0)
  await update({ groupBy: 'team', laneOrder: 'onlyScheduled' })
  expect(wrapper.text()).toContain('Blue')
  expect(wrapper.text()).not.toContain('Quiet')
  await update({ readOnly: false })
  expect(wrapper.find('[data-testid="engine-unavailable"]').exists()).toBe(true)
  expect(wrapper.find('[data-slot="nv-schedule-timeline"]').exists()).toBe(false)
})
it('public resource hour axis never invents night or early shift names from missing calendar data', async () => {
  await show()
  expect(wrapper!.text()).not.toMatch(/夜班|早班|中班/)
})
it.each([
  { case: 'bare wall time', instant: '2026-10-25T08:00:00' },
  { case: 'invalid calendar day', instant: '2026-02-30T08:00:00Z' },
])(
  'public resource calendar contains $case and recovers without guessing shift instants',
  async ({ instant }) => {
    const input = model()
    await show(input)
    await update({
      model: {
        ...input,
        calendars: [
          {
            calendarId: 'invalid',
            resourceIds: ['r0'],
            workCenterIds: [],
            shiftWindows: [
              { startUtc: instant, endUtc: '2026-10-25T09:00:00Z', shiftCode: 'opening' },
            ],
          },
        ],
      },
    })
    expect(wrapper!.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper!.find('[data-engine="dhtmlx"]').exists()).toBe(false)
    await update({
      model: {
        ...input,
        calendars: [
          {
            calendarId: 'valid',
            resourceIds: ['r0'],
            workCenterIds: [],
            shiftWindows: [
              {
                startUtc: '2026-10-25T08:00:00Z',
                endUtc: '2026-10-25T09:00:00Z',
                shiftCode: 'opening',
              },
            ],
          },
        ],
      },
    })
    await vi.advanceTimersByTimeAsync(2)
    await flushPromises()
    expect(wrapper!.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper!.find('[data-engine="dhtmlx"]').exists()).toBe(true)
    wrapper!.vm.command({ kind: 'revealTask', taskId: 'a' })
    await wrapper!.find('.gantt_task_line[data-task-id="a"]').trigger('click')
    expect(wrapper!.emitted('taskSelect')?.at(-1)).toEqual(['a'])
  },
)

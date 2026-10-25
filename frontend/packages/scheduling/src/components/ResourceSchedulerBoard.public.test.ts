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

import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { GanttChart, ResourceSchedulerBoard, type ScheduleModel } from '../index'
import { __setGanttModuleForTest } from '../engine/dhtmlx/loader'

const model: ScheduleModel = {
  tasks: [
    {
      id: 'same',
      orderId: 'club',
      operationId: 'read',
      operationSequence: 1,
      type: 'operation',
      text: '共读',
      startUtc: '2026-10-25T08:00:00Z',
      endUtc: '2026-10-25T10:00:00Z',
      timezone: 'UTC',
      locked: false,
      hasConflict: false,
    },
  ],
  links: [],
  resources: [],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  timezones: ['UTC'],
  horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
  meta: { planId: 'reading', status: 'preview', algorithmVersion: 'host' },
}
const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount())
  __setGanttModuleForTest(null)
  vi.restoreAllMocks()
})
function fakeFactory() {
  const instances: { root?: HTMLElement; destroyed: boolean; parsed: number }[] = []
  return {
    instances,
    Gantt: {
      getGanttInstance() {
        const state = { root: undefined as HTMLElement | undefined, destroyed: false, parsed: 0 }
        instances.push(state)
        return {
          config: {},
          templates: {},
          attachEvent: () => '',
          detachEvent: () => {},
          init(root: HTMLElement) {
            state.root = root
          },
          clearAll() {
            state.root?.replaceChildren()
          },
          parse(data: { data: { id: string; text: string }[] }) {
            state.parsed++
            state.root!.innerHTML = data.data
              .map((t) => `<button task_id="${t.id}">${t.text}</button>`)
              .join('')
          },
          render() {},
          getTask: () => undefined,
          destructor() {
            state.destroyed = true
            state.root?.replaceChildren()
          },
        }
      },
    },
  }
}
it('destroys the removed loading container and remounts one live instance', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, { props: { model, readOnly: true }, attachTo: document.body })
  wrappers.push(w)
  await flushPromises()
  expect(w.text()).toContain('共读')
  await w.setProps({ loading: true })
  await flushPromises()
  expect(factory.instances[0].destroyed).toBe(true)
  await w.setProps({ loading: false })
  await flushPromises()
  expect(w.text()).toContain('共读')
  expect(factory.instances.filter((i) => !i.destroyed)).toHaveLength(1)
})
it('does not mount after unmount while vendor resolution is pending', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, { props: { model, readOnly: true } })
  w.unmount()
  await flushPromises()
  expect(factory.instances).toHaveLength(0)
})
it('reports an initialization error and cleans the failed instance', async () => {
  const destructor = vi.fn()
  __setGanttModuleForTest({
    Gantt: {
      getGanttInstance: () => ({
        config: {},
        templates: {},
        attachEvent: () => '',
        init() {
          throw Error('fixture init failure')
        },
        destructor,
      }),
    },
  })
  const w = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(w)
  await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('暂时无法显示安排')
  expect(destructor).toHaveBeenCalledOnce()
})
it('uses the shared native renderer on a genuinely missing module and disables editing', async () => {
  __setGanttModuleForTest(null)
  const w = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(w)
  await flushPromises()
  expect(w.get('[data-slot="nv-schedule-timeline"]').text()).toContain('共读')
  await w.setProps({ readOnly: false })
  expect(w.get('[data-testid="engine-unavailable"]').text()).toContain('当前无法编辑安排')
})
it('keeps same-id instances isolated when one unmounts', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const a = mount(GanttChart, { props: { model, readOnly: true } })
  const b = mount(ResourceSchedulerBoard, { props: { model, readOnly: true } })
  wrappers.push(b)
  await flushPromises()
  a.unmount()
  expect(b.text()).toContain('共读')
  expect(factory.instances[1].destroyed).toBe(false)
})
it('cleans late asynchronous initialization after the loading container is removed', async () => {
  let release!: () => void
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  const factory = fakeFactory()
  const create = factory.Gantt.getGanttInstance
  factory.Gantt.getGanttInstance = () => {
    const g = create()
    const init = g.init
    return {
      ...g,
      init(root: HTMLElement) {
        init(root)
        return ready
      },
    }
  }
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(w)
  await flushPromises()
  expect(factory.instances).toHaveLength(1)
  const root = factory.instances[0].root!
  await w.setProps({ loading: true })
  release()
  await flushPromises()
  expect(root.children).toHaveLength(0)
  expect(factory.instances[0].destroyed).toBe(true)
  expect(w.find('[data-testid="gantt-skeleton"]').exists()).toBe(true)
})
it('applies commands queued before readiness only after authoritative data is parsed', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const observations: string[] = []
  const w = mount(GanttChart, {
    props: { model, readOnly: true, onTaskSelect: () => observations.push(w.text()) },
  })
  wrappers.push(w)
  w.vm.command({ kind: 'selectTask', taskId: 'same' })
  await flushPromises()
  expect(w.emitted('taskSelect')).toEqual([['same']])
  expect(observations[0]).toContain('共读')
})
it('rejects a second singleton owner without destroying the first chart', async () => {
  const factory = fakeFactory()
  const singleton = factory.Gantt.getGanttInstance()
  __setGanttModuleForTest({ gantt: singleton })
  const a = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(a)
  await flushPromises()
  const b = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(b)
  await flushPromises()
  expect(b.get('[role="alert"]').text()).toContain('暂时无法显示安排')
  expect(a.text()).toContain('共读')
  expect(factory.instances[0].destroyed).toBe(false)
})
it('refreshes engine theme tokens when the public theme changes without a mode switch', async () => {
  const { useTheme } = await import('@nerv-iip/ui')
  const theme = useTheme()
  theme.setTheme('neutral')
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(w)
  await flushPromises()
  theme.setTheme('blue')
  await flushPromises()
  expect(
    (w.get('[data-engine="dhtmlx"]').element as HTMLElement).style.getPropertyValue('--nv-brand'),
  ).toBe('oklch(0.55 0.18 255)')
  theme.reset()
})
it('clears stale tasks when the host withdraws the optional model', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, { props: { model, readOnly: true } })
  wrappers.push(w)
  await flushPromises()
  expect(w.text()).toContain('共读')
  await w.setProps({ model: undefined })
  await flushPromises()
  expect(w.text()).not.toContain('共读')
})
it('rejects a bare wall time before mounting instead of guessing browser coordinates', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, {
    props: {
      model: { ...model, tasks: [{ ...model.tasks[0], startUtc: '2026-10-25T08:00:00' }] },
      readOnly: true,
    },
  })
  wrappers.push(w)
  await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('时间信息有误')
  expect(factory.instances).toHaveLength(0)
})
it('keeps an invalid explicit timezone unresolved before vendor initialization', async () => {
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, {
    props: {
      model: {
        ...model,
        timezones: ['invalid/zone'],
        tasks: [{ ...model.tasks[0], timezone: 'invalid/zone' }],
      },
      readOnly: true,
    },
  })
  wrappers.push(w)
  await flushPromises()
  expect(w.text()).toContain('尚未设置有效的工厂时区')
  expect(factory.instances).toHaveLength(0)
})
it('contains live invalid instants without host errors and recovers the current model', async () => {
  const errors: unknown[] = []
  const factory = fakeFactory()
  __setGanttModuleForTest(factory)
  const w = mount(GanttChart, {
    props: { model, readOnly: true },
    global: { config: { errorHandler: (error) => errors.push(error) } },
  })
  wrappers.push(w)
  await flushPromises()
  expect(w.text()).toContain('共读')
  await w.setProps({
    model: { ...model, tasks: [{ ...model.tasks[0], startUtc: '2026-10-25T08:00:00' }] },
  })
  await flushPromises()
  expect(w.get('[role="alert"]').text()).toContain('时间信息有误')
  expect(w.find('[data-engine="dhtmlx"]').exists()).toBe(false)
  expect(factory.instances[0].destroyed).toBe(true)
  expect(errors).toEqual([])
  await w.setProps({ model: { ...model, tasks: [{ ...model.tasks[0], text: '恢复共读' }] } })
  await flushPromises()
  expect(w.find('[role="alert"]').exists()).toBe(false)
  expect(w.get('[data-engine="dhtmlx"]').text()).toContain('恢复共读')
  expect(errors).toEqual([])
})
it.each(['plannedStartUtc', 'plannedEndUtc'] as const)(
  'rejects a live bare baseline %s without host errors and recovers explicit offsets',
  async (field) => {
    const errors: unknown[] = []
    const factory = fakeFactory()
    __setGanttModuleForTest(factory)
    const baseline = {
      ...model,
      tasks: [
        {
          ...model.tasks[0],
          plannedStartUtc: '2026-10-25T16:00:00+08:00',
          plannedEndUtc: '2026-10-25T18:00:00+08:00',
        },
      ],
    }
    const w = mount(GanttChart, {
      props: { model: baseline, readOnly: true },
      global: { config: { errorHandler: (error) => errors.push(error) } },
    })
    wrappers.push(w)
    await flushPromises()
    expect(w.text()).toContain('共读')
    await w.setProps({
      model: { ...baseline, tasks: [{ ...baseline.tasks[0], [field]: '2026-10-25T08:00:00' }] },
    })
    await flushPromises()
    expect(w.get('[role="alert"]').text()).toContain('时间信息有误')
    expect(w.find('[data-engine="dhtmlx"]').exists()).toBe(false)
    expect(errors).toEqual([])
    await w.setProps({ model: baseline })
    await flushPromises()
    expect(w.find('[role="alert"]').exists()).toBe(false)
    expect(w.get('[data-engine="dhtmlx"]').text()).toContain('共读')
    expect(errors).toEqual([])
  },
)
it('preserves a reused singleton owner when an earlier asynchronous initialization resolves', async () => {
  let resolve!: () => void
  const ready = new Promise<void>((done) => {
    resolve = done
  })
  const factory = fakeFactory()
  const singleton = factory.Gantt.getGanttInstance()
  const initialize = singleton.init
  let initializations = 0
  const reusable = {
    ...singleton,
    init(root: HTMLElement) {
      initialize(root)
      return ++initializations === 1 ? ready : undefined
    },
  }
  __setGanttModuleForTest({ gantt: reusable })
  const a = mount(GanttChart, { props: { model, readOnly: true } })
  await flushPromises()
  a.unmount()
  const b = mount(GanttChart, {
    props: {
      model: { ...model, tasks: [{ ...model.tasks[0], text: '后来的共读' }] },
      readOnly: true,
    },
  })
  wrappers.push(b)
  await flushPromises()
  expect(b.get('[data-engine="dhtmlx"]').text()).toContain('后来的共读')
  resolve()
  await flushPromises()
  expect(b.get('[data-engine="dhtmlx"]').text()).toContain('后来的共读')
  await b.setProps({ model: { ...model, tasks: [{ ...model.tasks[0], text: '继续共读' }] } })
  await flushPromises()
  expect(b.text()).toContain('继续共读')
})

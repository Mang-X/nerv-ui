import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { SchedulingDraftBoard, type ScheduleModel } from '@nerv-iip/scheduling'
import { sampleModel } from '../test-fixtures/models'
import { __setGanttModuleForTest } from '../engine/dhtmlx/loader'

// Delay initialization, not the command spy: real useEngine queues and the real
// DhtmlxEngine acknowledges selectTask. This lane uses a vendor DOM stub only.
const loading = vi.hoisted(() => ({ wait: () => Promise.resolve() }))
vi.mock('../engine/dhtmlx/loader', async (original) => ({
  ...(await original<typeof import('../engine/dhtmlx/loader')>()),
  preloadGantt: () => loading.wait(),
}))
let page: VueWrapper<InstanceType<typeof SchedulingDraftBoard>> | undefined
let release: () => void = () => {}
afterEach(() => {
  page?.unmount()
  page = undefined
  release()
  __setGanttModuleForTest(null)
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})
function setup() {
  const pending: (() => void)[] = []
  loading.wait = () =>
    new Promise<void>((resolve) => {
      pending.push(resolve)
    })
  release = () => pending.splice(0).forEach((resolve) => resolve())
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  const instances: { destroyed: boolean }[] = []
  __setGanttModuleForTest({
    Gantt: {
      getGanttInstance() {
        const state = { destroyed: false }
        instances.push(state)
        const handlers = new Map<string, (...args: unknown[]) => unknown>()
        let root: HTMLElement
        let tasks: { id: string; text: string }[] = []
        let selected = ''
        const vendor = {
          config: {},
          templates: {},
          attachEvent(name: string, handler: (...args: unknown[]) => unknown) {
            handlers.set(name, handler)
            return name
          },
          detachEvent(name: string) {
            handlers.delete(name)
          },
          init(container: HTMLElement) {
            root = container
          },
          clearAll() {
            tasks = []
            selected = ''
            root.replaceChildren()
          },
          parse(data: { data: typeof tasks }) {
            tasks = data.data
            vendor.render()
          },
          getTask(id: string) {
            return tasks.find((t) => t.id === id)
          },
          isTaskExists(id: string) {
            return tasks.some((t) => t.id === id)
          },
          selectTask(id: string) {
            selected = id
          },
          render() {
            root.replaceChildren(
              ...tasks.map((task) => {
                const button = document.createElement('button')
                button.textContent = task.text
                button.className =
                  'gantt_task_line' + (task.id === selected ? ' gantt_selected' : '')
                button.setAttribute('task_id', task.id)
                button.onclick = () => handlers.get('onTaskClick')?.(task.id)
                return button
              }),
            )
          },
          destructor() {
            state.destroyed = true
            root.replaceChildren()
          },
        }
        return vendor
      },
    },
  })
  const model: ScheduleModel = structuredClone(sampleModel)
  model.tasks = model.tasks.slice(0, 2).map((t) => ({ ...t, parentId: undefined }))
  const before = JSON.stringify(model)
  page = mount(SchedulingDraftBoard, {
    props: {
      model,
      selectedTaskId: 'a1',
      readOnly: true,
      'onUpdate:selectedTaskId': (id: string) => {
        void page!.setProps({ selectedTaskId: id })
      },
    },
    attachTo: document.body,
  })
  return { model, before, instances }
}
async function clickView(text: string) {
  await page!
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
}
it.each(['latest', 'many', 'empty', 'unknown', 'same-id', 'resource-remount'] as const)(
  'draft waits for initialization before synchronizing current selection for %s',
  async (scenario) => {
    const { model, before, instances } = setup()
    await flushPromises()
    if (scenario === 'many') {
      await page!.setProps({ selectedTaskId: 'a2' })
      await page!.setProps({ selectedTaskId: 'a1' })
    }
    if (scenario === 'resource-remount') {
      await clickView('资源安排图')
      await flushPromises()
    }
    const expected = scenario === 'empty' ? '' : scenario === 'unknown' ? 'absent' : 'a2'
    await page!.setProps({ selectedTaskId: expected })
    if (scenario === 'same-id')
      await page!.setProps({
        model: { ...model, tasks: [{ ...model.tasks[1]!, text: '当前交流' }, model.tasks[0]!] },
      })
    release()
    await flushPromises()
    expect(page!.emitted('update:selectedTaskId')).toBeUndefined()
    expect(page!.props().selectedTaskId).toBe(expected)
    expect(page!.get('[data-draft-detail]').text()).toContain(
      expected === '' || expected === 'absent'
        ? '尚未选择活动'
        : scenario === 'same-id'
          ? '当前交流'
          : '交流心得',
    )
    expect(instances).toHaveLength(1)
    expect(JSON.stringify(model)).toBe(before)
    // Waiting must not suppress a later real user request, including readonly.
    await page!.get('.gantt_task_line[task_id="a1"]').trigger('click')
    await flushPromises()
    expect(page!.emitted('update:selectedTaskId')).toEqual([['a1']])
    expect(page!.get('[data-draft-detail]').text()).toContain('共读第一章')
    expect(instances).toHaveLength(1)
  },
)
it('draft discards loading selection when unmounted without emitting a late request', async () => {
  const { instances } = setup()
  await flushPromises()
  await page!.setProps({ selectedTaskId: 'a2' })
  page!.unmount()
  release()
  await flushPromises()
  expect(page!.emitted('update:selectedTaskId')).toBeUndefined()
  expect(instances).toHaveLength(0)
})

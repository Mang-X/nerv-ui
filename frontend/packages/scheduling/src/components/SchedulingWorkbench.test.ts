import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { cloneModel } from '../model/clone'
import { sampleModel } from '../test-fixtures/models'
import SchedulingWorkbench from './SchedulingWorkbench.vue'
import { SchedulingToolbar } from '../index'

async function settle() {
  await flushPromises()
  await nextTick()
  await flushPromises()
}

it.each(['preview', 'release'] as const)(
  'loading cancels old %s receipts and blocks edits until ready retry',
  async (kind) => {
    const requests: {
      resolve: (m: typeof sampleModel) => void
      reject: (e: Error) => void
      signal: AbortSignal
    }[] = []
    const callback = vi.fn(
      (_value: unknown, control: { signal: AbortSignal }) =>
        new Promise<typeof sampleModel>((resolve, reject) =>
          requests.push({ resolve, reject, signal: control.signal }),
        ),
    )
    const w = mount(SchedulingWorkbench, {
      props: {
        model: cloneModel(sampleModel),
        ...(kind === 'preview'
          ? { preview: callback }
          : {
              release: async (...args: Parameters<typeof callback>) => {
                await callback(...args)
              },
            }),
      },
      global: { stubs: { GanttChart: true, ResourceSchedulerBoard: true } },
    })
    const toolbar = w.getComponent(SchedulingToolbar)
    const event = kind === 'preview' ? 'repreview' : 'release'
    toolbar.vm.$emit(event)
    await nextTick()
    expect(requests).toHaveLength(1)
    await w.setProps({ loading: true })
    expect(requests[0]!.signal.aborted).toBe(true)
    expect(toolbar.props('readOnly')).toBe(true)
    toolbar.vm.$emit(event)
    toolbar.vm.$emit('toggleReadOnly')
    await nextTick()
    expect(requests).toHaveLength(1)
    expect(w.getComponent({ name: 'GanttChart' }).props('readOnly')).toBe(true)
    await w.setProps({ loading: false })
    toolbar.vm.$emit(event)
    await nextTick()
    expect(requests).toHaveLength(2)
    requests[0]!.reject(new Error('HTTP stale'))
    await settle()
    expect(toolbar.props('busy')).toBe(true)
    const current = cloneModel(sampleModel)
    current.tasks[0]!.text = '当前重试结果'
    requests[1]!.resolve(current)
    await settle()
    expect(toolbar.props('busy')).toBe(false)
    expect(w.getComponent({ name: 'GanttChart' }).props('model').tasks[0].text).toBe(
      kind === 'preview' ? '当前重试结果' : sampleModel.tasks[0]!.text,
    )
    toolbar.vm.$emit(event)
    await nextTick()
    await w.setProps({ loading: true })
    const stale = cloneModel(sampleModel)
    stale.tasks[0]!.text = '旧成功回执'
    requests[2]!.resolve(stale)
    await settle()
    expect(requests[2]!.signal.aborted).toBe(true)
    expect(w.getComponent({ name: 'GanttChart' }).props('model').tasks[0].text).not.toBe(
      '旧成功回执',
    )
    w.unmount()
  },
)

describe('SchedulingWorkbench', () => {
  it('renders the order gantt view', async () => {
    const wrapper = mount(SchedulingWorkbench, {
      props: { model: cloneModel(sampleModel), defaultView: 'order' },
      attachTo: document.body,
    })
    await settle()
    expect(wrapper.find('[data-view="order"]').exists()).toBe(true)
    // 两个视图切换标签都在
    const tabLabels = wrapper.findAll('[role="tab"]').map((t) => t.text())
    expect(tabLabels.some((t) => t.includes('活动甘特'))).toBe(true)
    expect(tabLabels.some((t) => t.includes('资源安排板'))).toBe(true)
    wrapper.unmount()
  })

  it('renders the resource board view', async () => {
    const wrapper = mount(SchedulingWorkbench, {
      props: { model: cloneModel(sampleModel), defaultView: 'resource' },
      attachTo: document.body,
    })
    await settle()
    expect(wrapper.find('[data-view="resource"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('surfaces conflicts in business language in the side panel', async () => {
    const wrapper = mount(SchedulingWorkbench, {
      props: { model: cloneModel(sampleModel) },
      attachTo: document.body,
    })
    await settle()
    expect(wrapper.text()).toContain('产能不足')
    wrapper.unmount()
  })
})

it('composes the existing table recipe and retains before/after slots without editing authority', async () => {
  const wrapper = mount(SchedulingWorkbench, {
    props: { model: cloneModel(sampleModel), readOnly: true },
    slots: { before: '入口说明', after: '返回导航' },
    attachTo: document.body,
  })
  await settle()
  const tab = wrapper.findAll('[role="tab"]').find((t) => t.text() === '活动表格')!
  await tab.trigger('mousedown', { button: 0 })
  await tab.trigger('click')
  await settle()
  expect(wrapper.text()).toContain('入口说明')
  expect(wrapper.text()).toContain('返回导航')
  const table = wrapper.findComponent({ name: 'SchedulingDraftBoard' })
  expect(table.exists()).toBe(true)
  expect(table.props('readOnly')).toBe(true)
  wrapper.unmount()
})

it('keeps host readonly authoritative even when a toolbar requests editing', async () => {
  const w = mount(SchedulingWorkbench, {
    props: { model: cloneModel(sampleModel), readOnly: true },
    global: { stubs: { GanttChart: true, ResourceSchedulerBoard: true } },
  })
  const toolbar = w.findComponent({ name: 'SchedulingToolbar' })
  toolbar.vm.$emit('toggleReadOnly')
  await nextTick()
  expect(toolbar.props('readOnly')).toBe(true)
  w.unmount()
})
it.each(['readonly', 'callback', 'unmount'] as const)(
  'cancels workbench preview at %s boundary',
  async (edge) => {
    let resolve!: (m: typeof sampleModel) => void
    let signal: AbortSignal | undefined
    const preview = (_m: typeof sampleModel, control: { signal: AbortSignal }) => {
      signal = control.signal
      return new Promise<typeof sampleModel>((r) => {
        resolve = r
      })
    }
    const w = mount(SchedulingWorkbench, {
      props: { model: cloneModel(sampleModel), preview },
      global: { stubs: { GanttChart: true, ResourceSchedulerBoard: true } },
    })
    w.findComponent({ name: 'SchedulingToolbar' }).vm.$emit('repreview')
    await nextTick()
    expect(signal?.aborted).toBe(false)
    if (edge === 'readonly') await w.setProps({ readOnly: true })
    if (edge === 'callback') await w.setProps({ preview: async (m) => m })
    if (edge === 'unmount') w.unmount()
    expect(signal?.aborted).toBe(true)
    const changed = cloneModel(sampleModel)
    changed.tasks[0]!.text = '迟到预览'
    resolve(changed)
    await settle()
    if (edge !== 'unmount') {
      expect(w.findComponent({ name: 'GanttChart' }).props('model').tasks[0].text).not.toBe(
        '迟到预览',
      )
      w.unmount()
    }
  },
)

import { mount, flushPromises } from '@vue/test-utils'
import { it, expect, vi, afterEach } from 'vitest'
import { reactive } from 'vue'
import { toast } from '@nerv-iip/ui'
import { readingPlan } from './models'
// Only isolate the not-yet-restored P04 renderer; this verifies Workbench parameters, not vendor.
vi.mock('../../packages/scheduling/src/components/GanttChart.vue', () => ({
  default: {
    props: ['model'],
    template:
      '<div><output data-testid="draft">{{ model.meta.planId }} / {{ model.tasks[0]?.text }} / {{ model.tasks[0]?.locked }}</output><button data-testid="select-task" @click="$emit(\'task-select\', \'read\')">选择共读</button></div>',
  },
}))
vi.mock('../../packages/scheduling/src/components/ResourceSchedulerBoard.vue', () => ({
  default: { template: '<div />' },
}))
import Workbench from '../../packages/scheduling/src/components/SchedulingWorkbench.vue'
import Toolbar from '../../packages/scheduling/src/components/panels/SchedulingToolbar.vue'
it('Workbench reads replaced callbacks and ignores a cancelled completion without success toast', async () => {
  const original = readingPlan(),
    before = JSON.stringify(original)
  const success = vi.spyOn(toast, 'success').mockImplementation(() => 0)
  const first = vi.fn(async () => readingPlan('first'))
  const wrapper = mount(Workbench, {
    props: { model: original, context: { key: 'A' }, preview: first },
  })
  let finish!: (model: ReturnType<typeof readingPlan>) => void
  const second = vi.fn(
    () =>
      new Promise<ReturnType<typeof readingPlan>>((resolve) => {
        finish = resolve
      }),
  )
  await wrapper.setProps({ preview: second })
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  await flushPromises()
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
  expect(second.mock.calls[0]).toMatchObject([
    { meta: { planId: 'reading' } },
    { context: { key: 'A' }, signal: { aborted: false } },
  ])
  await wrapper.setProps({ context: { key: 'B' }, model: readingPlan('B') })
  finish(readingPlan('late'))
  await flushPromises()
  expect(success).not.toHaveBeenCalled()
  expect(JSON.stringify(original)).toBe(before)
  expect(wrapper.getComponent(Toolbar).props('dirty')).toBe(false)
  await wrapper.setProps({ preview: undefined, release: undefined, model: undefined })
  expect(wrapper.getComponent(Toolbar).props('canRepreview')).toBe(false)
  expect(wrapper.getComponent(Toolbar).props('canRelease')).toBe(false)
  wrapper.unmount()
  success.mockRestore()
})
it('Workbench reports only successful injected preview and readOnly blocks action emission', async () => {
  const success = vi.spyOn(toast, 'success').mockImplementation(() => 0)
  const preview = vi.fn(async () => readingPlan('accepted'))
  const wrapper = mount(Workbench, { props: { model: readingPlan(), preview, readOnly: true } })
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  await flushPromises()
  expect(preview).not.toHaveBeenCalled()
  await wrapper.setProps({ readOnly: false })
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  await flushPromises()
  expect(success).toHaveBeenCalledWith('已按锁定项重新排程')
  wrapper.unmount()
  success.mockRestore()
})

it('Workbench releases the same-reference authoritative plan with its current context', async () => {
  const model = reactive(readingPlan('A'))
  const release = vi.fn(async () => {})
  const wrapper = mount(Workbench, { props: { model, context: { key: 'A' }, release } })
  model.meta.planId = 'B'
  model.tasks[0]!.text = 'authoritative B'
  await wrapper.setProps({ context: { key: 'B' } })
  await wrapper
    .findAll('button')
    .find((button) => button.text() === '发布计划')!
    .trigger('click')
  await flushPromises()
  expect(release.mock.calls).toMatchObject([['B', { context: { key: 'B' } }]])
  wrapper.unmount()
})

// The isolated renderer only displays the received model and emits selection;
// locking, undo/redo, snapshots and all async ownership run in real Workbench/edits.
function button(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((item) => item.text() === text)!
}
function gate<T>() {
  let resolve!: (value: T) => void
  let reject!: (cause: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
afterEach(() => vi.restoreAllMocks())

for (const input of ['in-place', 'replacement'] as const) {
  for (const kind of ['preview', 'release'] as const) {
    for (const terminal of ['success', 'failure'] as const) {
      it(`Workbench ${input} authority invalidates old ${kind} ${terminal} without clearing current pending`, async () => {
        const model = reactive(readingPlan('A'))
        const old = gate<ReturnType<typeof readingPlan>>()
        const current = gate<ReturnType<typeof readingPlan>>()
        const preview = vi
          .fn((_snapshot: unknown, _control: unknown) => old.promise)
          .mockImplementationOnce(() => old.promise)
          .mockImplementationOnce(() => current.promise)
        const release = vi
          .fn(async (_planId: string, _control: unknown) => {
            await old.promise
          })
          .mockImplementationOnce(async () => {
            await old.promise
          })
          .mockImplementationOnce(async () => {
            await current.promise
          })
        const success = vi.spyOn(toast, 'success').mockImplementation(() => 0)
        const error = vi.spyOn(toast, 'error').mockImplementation(() => 0)
        const wrapper = mount(Workbench, {
          props: { model, context: { key: 'same' }, preview, release },
        })
        await wrapper.get('[data-testid="select-task"]').trigger('click')
        await button(wrapper, '锁定此工序').trigger('click')
        success.mockClear()
        await button(wrapper, kind === 'preview' ? '重新排程' : '发布计划').trigger('click')
        const callback = kind === 'preview' ? preview : release
        expect(callback.mock.calls[0]).toMatchObject([
          kind === 'preview' ? { meta: { planId: 'A' }, tasks: [{ locked: true }] } : 'A',
          { context: { key: 'same' }, signal: { aborted: false } },
        ])
        expect(model.tasks[0]!.locked).toBe(false)
        if (input === 'in-place') {
          model.meta.planId = 'B'
          model.tasks[0]!.text = 'authoritative B'
          await flushPromises()
        } else {
          const next = readingPlan('B')
          next.tasks[0]!.text = 'authoritative B'
          await wrapper.setProps({ model: next })
        }
        expect(callback.mock.calls[0]).toMatchObject([
          expect.anything(),
          { signal: { aborted: true } },
        ])
        expect(wrapper.get('[data-testid="draft"]').text()).toBe('B / authoritative B / false')
        expect(wrapper.get('button[aria-label="撤销"]').attributes('disabled')).toBeDefined()
        await wrapper.get('[data-testid="select-task"]').trigger('click')
        await button(wrapper, '锁定此工序').trigger('click')
        success.mockClear()
        await button(wrapper, kind === 'preview' ? '重新排程' : '发布计划').trigger('click')
        if (terminal === 'success') old.resolve(readingPlan('stale-A'))
        else old.reject(Error('stale A failed'))
        await flushPromises()
        expect(button(wrapper, '发布计划').attributes('disabled')).toBeDefined()
        expect(wrapper.get('[data-testid="draft"]').text()).toBe('B / authoritative B / true')
        expect(success).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
        expect(callback.mock.calls[1]).toMatchObject([
          kind === 'preview'
            ? { meta: { planId: 'B' }, tasks: [{ text: 'authoritative B', locked: true }] }
            : 'B',
          { context: { key: 'same' }, signal: { aborted: false } },
        ])
        current.resolve(readingPlan('accepted-B'))
        await flushPromises()
        expect(button(wrapper, '发布计划').attributes('disabled')).toBeUndefined()
        expect(wrapper.get('button[aria-label="撤销"]').attributes('disabled')).toBeDefined()
        expect(success).toHaveBeenCalledTimes(1)
        expect(error).not.toHaveBeenCalled()
        expect(wrapper.get('[data-testid="draft"]').text()).toBe(
          kind === 'preview' ? 'accepted-B / 共读 / false' : 'B / authoritative B / true',
        )
        wrapper.unmount()
      })
    }
  }
}

it('Workbench same-tick nested authority and context updates reach preview before the render queue', async () => {
  const model = reactive(readingPlan('A'))
  const context = reactive({ key: 'A' })
  const pending = gate<ReturnType<typeof readingPlan>>()
  const preview = vi.fn(() => pending.promise)
  const wrapper = mount(Workbench, { props: { model, context, preview } })
  model.meta.planId = 'B'
  model.tasks[0]!.text = 'same tick B'
  context.key = 'B'
  // Public Toolbar event in the same tick; native disabled DOM is updated next render.
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  expect(preview.mock.calls).toMatchObject([
    [{ meta: { planId: 'B' }, tasks: [{ text: 'same tick B' }] }, { context: { key: 'B' } }],
  ])
  wrapper.unmount()
  pending.resolve(readingPlan('late'))
  await flushPromises()
})

it('Workbench keeps local undo redo and failed-preview retry until external authority resets history', async () => {
  const model = reactive(readingPlan('A'))
  const before = JSON.stringify(model)
  const pending = gate<ReturnType<typeof readingPlan>>()
  const preview = vi
    .fn(() => pending.promise)
    .mockImplementationOnce(async () => {
      throw Error('current failure')
    })
  const error = vi.spyOn(toast, 'error').mockImplementation(() => 0)
  const wrapper = mount(Workbench, { props: { model, preview } })
  await wrapper.get('[data-testid="select-task"]').trigger('click')
  await button(wrapper, '锁定此工序').trigger('click')
  await wrapper.get('button[aria-label="撤销"]').trigger('click')
  expect(wrapper.get('[data-testid="draft"]').text()).toBe('A / 共读 / false')
  await wrapper.get('button[aria-label="重做"]').trigger('click')
  expect(wrapper.get('[data-testid="draft"]').text()).toBe('A / 共读 / true')
  await button(wrapper, '重新排程').trigger('click')
  await flushPromises()
  expect(error).toHaveBeenCalledWith('重新排程失败,请稍后重试')
  expect(wrapper.get('button[aria-label="撤销"]').attributes('disabled')).toBeUndefined()
  expect(wrapper.get('[data-testid="draft"]').text()).toBe('A / 共读 / true')
  expect(JSON.stringify(model)).toBe(before)
  await button(wrapper, '重新排程').trigger('click')
  expect(preview).toHaveBeenCalledTimes(2)
  model.tasks[0]!.text = 'new authority'
  await flushPromises()
  expect(wrapper.get('[data-testid="draft"]').text()).toBe('A / new authority / false')
  expect(wrapper.get('button[aria-label="撤销"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('button[aria-label="重做"]').attributes('disabled')).toBeDefined()
  expect(wrapper.text()).not.toContain('解锁(允许拖拽)')
  pending.resolve(readingPlan('stale'))
  await flushPromises()
  expect(wrapper.get('[data-testid="draft"]').text()).toBe('A / new authority / false')
  await wrapper.setProps({ model: undefined })
  expect(wrapper.get('[data-testid="draft"]').text()).toBe('/  /')
  wrapper.unmount()
})

for (const kind of ['preview', 'release'] as const) {
  it(`Workbench context-only nested change cancels ${kind} and keeps captured context isolated`, async () => {
    const context = reactive({ key: 'A' })
    const old = gate<ReturnType<typeof readingPlan>>()
    const preview = vi.fn((_snapshot: unknown, _control: unknown) => old.promise)
    const release = vi.fn(async (_planId: string, _control: unknown) => {
      await old.promise
    })
    const success = vi.spyOn(toast, 'success').mockImplementation(() => 0)
    const error = vi.spyOn(toast, 'error').mockImplementation(() => 0)
    const wrapper = mount(Workbench, {
      props: { model: readingPlan('same'), context, preview, release },
    })
    await wrapper.get('[data-testid="select-task"]').trigger('click')
    await button(wrapper, '锁定此工序').trigger('click')
    success.mockClear()
    await button(wrapper, kind === 'preview' ? '重新排程' : '发布计划').trigger('click')
    context.key = 'B'
    await flushPromises()
    const callback = kind === 'preview' ? preview : release
    expect(callback.mock.calls[0]).toMatchObject([
      expect.anything(),
      { context: { key: 'A' }, signal: { aborted: true } },
    ])
    expect(wrapper.get('button[aria-label="撤销"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="draft"]').text()).toBe('same / 共读 / true')
    old.reject(Error('late context A'))
    await flushPromises()
    expect(success).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect(button(wrapper, '发布计划').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
}

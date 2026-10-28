import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import { SchedulingWorkbench, SchedulingToolbar } from '../index'
import { sampleModel } from '../test-fixtures/models'
import { cloneModel } from '../model/clone'

it.each(['dimension', 'resource'] as const)(
  'workbench accepts %s reassignment through its resource board and restores host authority',
  async (kind) => {
    const model = cloneModel(sampleModel)
    const before = JSON.stringify(model)
    const w = mount(SchedulingWorkbench, {
      props: { model, defaultView: 'resource' },
      global: {
        stubs: {
          ResourceSchedulerBoard: {
            name: 'ResourceSchedulerBoard',
            props: ['model', 'readOnly'],
            emits: ['taskDragEnd', 'taskSelect'],
            template: '<div />',
          },
        },
      },
    })
    const board = w.getComponent({ name: 'ResourceSchedulerBoard' })
    const toolbar = w.getComponent(SchedulingToolbar)
    const task = model.tasks[0]!
    board.vm.$emit('taskSelect', task.id)
    await nextTick()
    const detail = () => w.getComponent({ name: 'TaskDetailPanel' }).props('task')
    const payload = {
      taskId: task.id,
      operationId: task.operationId,
      kind: 'reassign' as const,
      startUtc: task.startUtc,
      endUtc: task.endUtc,
      resourceId: kind === 'resource' ? undefined : task.resourceId,
      ...(kind === 'dimension'
        ? { assignment: { dimension: 'workCenter', id: 'other', label: '另一区域' } }
        : {}),
    }
    board.vm.$emit('taskDragEnd', payload)
    await nextTick()
    const accepted = () => board.props('model').tasks[0]
    expect(accepted().resourceId).toBe(kind === 'resource' ? undefined : task.resourceId)
    expect(detail()).toEqual(accepted())
    if (kind === 'dimension')
      expect(accepted().dimensions.workCenter).toEqual({ id: 'other', label: '另一区域' })
    expect(toolbar.props('dirty')).toBe(true)
    toolbar.vm.$emit('undo')
    await nextTick()
    expect(accepted()).toEqual(task)
    expect(detail()).toEqual(accepted())
    toolbar.vm.$emit('redo')
    await nextTick()
    expect(accepted().resourceId).toBe(kind === 'resource' ? undefined : task.resourceId)
    expect(detail()).toEqual(accepted())
    await w.setProps({ model: cloneModel(model), readOnly: true })
    board.vm.$emit('taskDragEnd', payload)
    await nextTick()
    expect(accepted()).toEqual(task)
    expect(detail()).toBeUndefined()
    expect(toolbar.props('dirty')).toBe(false)
    expect(JSON.stringify(model)).toBe(before)
    w.unmount()
  },
)

it('selected detail follows current preview facts and never revives after the selected task is removed', async () => {
  const model = cloneModel(sampleModel)
  const updated = cloneModel(model)
  updated.tasks[0]!.text = '当前任务事实'
  const preview = vi
    .fn()
    .mockResolvedValueOnce(updated)
    .mockResolvedValueOnce({ ...updated, tasks: [] })
    .mockResolvedValueOnce(model)
  const w = mount(SchedulingWorkbench, {
    props: { model, preview },
    global: {
      stubs: {
        GanttChart: {
          name: 'GanttChart',
          props: ['model'],
          emits: ['taskSelect'],
          template: '<div />',
        },
      },
    },
  })
  w.getComponent({ name: 'GanttChart' }).vm.$emit('taskSelect', model.tasks[0]!.id)
  await nextTick()
  const toolbar = w.getComponent(SchedulingToolbar)
  const detail = () => w.getComponent({ name: 'TaskDetailPanel' }).props('task')
  toolbar.vm.$emit('repreview')
  await flushPromises()
  expect(detail()?.text).toBe('当前任务事实')
  toolbar.vm.$emit('repreview')
  await flushPromises()
  expect(detail()).toBeUndefined()
  toolbar.vm.$emit('repreview')
  await flushPromises()
  expect(w.getComponent({ name: 'GanttChart' }).props('model').tasks).toHaveLength(
    model.tasks.length,
  )
  expect(detail()).toBeUndefined()
  w.unmount()
})

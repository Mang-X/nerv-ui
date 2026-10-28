import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it } from 'vitest'
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
            emits: ['taskDragEnd'],
            template: '<div />',
          },
        },
      },
    })
    const board = w.getComponent({ name: 'ResourceSchedulerBoard' })
    const toolbar = w.getComponent(SchedulingToolbar)
    const task = model.tasks[0]!
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
    if (kind === 'dimension')
      expect(accepted().dimensions.workCenter).toEqual({ id: 'other', label: '另一区域' })
    expect(toolbar.props('dirty')).toBe(true)
    toolbar.vm.$emit('undo')
    await nextTick()
    expect(accepted()).toEqual(task)
    toolbar.vm.$emit('redo')
    await nextTick()
    expect(accepted().resourceId).toBe(kind === 'resource' ? undefined : task.resourceId)
    await w.setProps({ model: cloneModel(model), readOnly: true })
    board.vm.$emit('taskDragEnd', payload)
    await nextTick()
    expect(accepted()).toEqual(task)
    expect(toolbar.props('dirty')).toBe(false)
    expect(JSON.stringify(model)).toBe(before)
    w.unmount()
  },
)

import { effectScope, ref } from 'vue'
import { expect, it } from 'vitest'
import { useSchedulingEdits } from '../host'
import { cloneModel } from '../model/clone'
import { resourceProjection } from '../model/resource-projection'
import { sampleModel } from '../test-fixtures/models'
import type { TaskDragPayload } from '../engine/engine'

function setup() {
  const original = cloneModel(sampleModel)
  original.tasks = [original.tasks[0]!]
  original.resources = [
    {
      id: 'resource-a',
      text: '设备A',
      dimensions: {
        workCenter: { id: 'center-a', label: 'A' },
        team: { id: 'team-a', label: '甲' },
      },
    },
  ]
  Object.assign(original.tasks[0]!, {
    resourceId: 'resource-a',
    workCenterId: 'center-a',
    dimensions: { workCenter: { id: 'center-a', label: 'A' }, team: { id: 'team-a', label: '甲' } },
  })
  const before = JSON.stringify(original)
  const model = ref(original)
  const scope = effectScope()
  const edits = scope.run(() => useSchedulingEdits(model))!
  const proposal = (extra: Partial<TaskDragPayload> = {}): TaskDragPayload => ({
    taskId: 'a1',
    operationId: 'op-10',
    startUtc: original.tasks[0]!.startUtc,
    endUtc: original.tasks[0]!.endUtc,
    kind: 'reassign',
    resourceId: 'resource-a',
    ...extra,
  })
  return { original, before, model, scope, edits, proposal }
}

it('accepts dimension reassignment without borrowing a colliding resource identity and supports undo redo authority', () => {
  const s = setup()
  s.edits.onTaskDragEnd(
    s.proposal({ assignment: { dimension: 'workCenter', id: 'resource-b', label: '新工作中心' } }),
  )
  expect(s.model.value.tasks[0]).toMatchObject({
    resourceId: 'resource-a',
    workCenterId: 'resource-b',
    dimensions: { workCenter: { id: 'resource-b', label: '新工作中心' }, team: { id: 'team-a' } },
  })
  expect(resourceProjection(s.model.value).lanes.find((l) => l.operations.length)?.id).toBe(
    'resource-b',
  )
  expect(JSON.stringify(s.original)).toBe(s.before)
  s.edits.undo()
  expect(s.model.value.tasks[0]!.workCenterId).toBe('center-a')
  s.edits.redo()
  expect(s.model.value.tasks[0]!.workCenterId).toBe('resource-b')
  s.model.value = cloneModel(s.original)
  expect(s.edits.canUndo.value).toBe(false)
  expect(s.model.value.tasks[0]!.workCenterId).toBe('center-a')
  s.scope.stop()
})

it('clears an explicitly unassigned resource while move and resize keep an omitted resource', () => {
  const s = setup()
  s.model.value = {
    ...s.model.value,
    tasks: s.model.value.tasks.map((t) => ({
      ...t,
      dimensions: undefined,
      workCenterId: undefined,
    })),
    resources: [],
  }
  for (const kind of ['move', 'resize'] as const) {
    s.edits.onTaskDragEnd(s.proposal({ kind, resourceId: undefined }))
    expect(s.model.value.tasks[0]!.resourceId).toBe('resource-a')
  }
  s.edits.onTaskDragEnd(s.proposal({ resourceId: undefined }))
  expect(s.model.value.tasks[0]!.resourceId).toBeUndefined()
  expect(
    resourceProjection(s.model.value).lanes.find((l) => l.operations.length)?.id,
  ).toBeUndefined()
  s.edits.undo()
  expect(s.model.value.tasks[0]!.resourceId).toBe('resource-a')
  s.scope.stop()
})

it.each(['workCenter', 'team'])(
  'explicitly unassigns %s without inherited resource membership or losing other dimensions',
  (dimension) => {
    const s = setup()
    s.edits.onTaskDragEnd(s.proposal({ assignment: { dimension, id: null, label: '未分配' } }))
    expect(
      resourceProjection(s.model.value, dimension).lanes.find((l) => l.operations.length)?.id,
    ).toBeUndefined()
    expect(s.model.value.tasks[0]!.resourceId).toBe('resource-a')
    const other = dimension === 'team' ? 'workCenter' : 'team'
    expect(s.model.value.tasks[0]!.dimensions?.[other]).toEqual(
      s.original.tasks[0]!.dimensions?.[other],
    )
    s.edits.undo()
    expect(
      resourceProjection(s.model.value, dimension).lanes.find((l) => l.operations.length)?.id,
    ).toBe(dimension === 'team' ? 'team-a' : 'center-a')
    s.edits.redo()
    expect(
      resourceProjection(s.model.value, dimension).lanes.find((l) => l.operations.length)?.id,
    ).toBeUndefined()
    s.edits.onTaskDragEnd(s.proposal({ assignment: { dimension, id: 'next', label: '新归属' } }))
    expect(
      resourceProjection(s.model.value, dimension).lanes.find((l) => l.operations.length)?.id,
    ).toBe('next')
    expect(JSON.stringify(s.original)).toBe(s.before)
    s.scope.stop()
  },
)

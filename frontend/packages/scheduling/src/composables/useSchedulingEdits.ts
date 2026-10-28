import {
  computed,
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { TaskDragPayload } from '../engine/engine'
import { cloneModel } from '../model/clone'
import type { ScheduleModel } from '../model/types'

export interface SchedulingEditControl<Context = unknown> {
  signal: AbortSignal
  context: Context | undefined
}
export interface SchedulingEditsDeps<Context = unknown> {
  context?: Context
  preview?: (
    snapshot: ScheduleModel,
    control: SchedulingEditControl<Context>,
  ) => Promise<ScheduleModel>
  release?: (planId: string, control: SchedulingEditControl<Context>) => Promise<void>
}

/** Local reversible display edits. Solving, validation, permission and storage belong to host. */
export function useSchedulingEdits<Context = unknown>(
  model: Ref<ScheduleModel>,
  deps: MaybeRefOrGetter<SchedulingEditsDeps<Context>> = {},
) {
  const history = shallowRef<ScheduleModel[]>([cloneModel(model.value)])
  const pointer = shallowRef(0)
  const busy = shallowRef(false)
  const error = shallowRef<unknown>()
  const status = shallowRef<'idle' | 'pending' | 'success' | 'unknown' | 'error'>('idle')
  let controller: AbortController | undefined
  let disposed = false,
    localWrite = false
  const dirty = computed(() => pointer.value > 0)
  const canUndo = computed(() => pointer.value > 0 && !busy.value)
  const canRedo = computed(() => pointer.value < history.value.length - 1 && !busy.value)
  function cancel() {
    controller?.abort()
    controller = undefined
    busy.value = false
    status.value = 'idle'
  }
  function resetBaseline() {
    history.value = [cloneModel(model.value)]
    pointer.value = 0
  }
  function replace(next: ScheduleModel) {
    localWrite = true
    try {
      model.value = cloneModel(next)
    } finally {
      localWrite = false
    }
  }
  function commit(next: ScheduleModel) {
    replace(next)
    history.value = [...history.value.slice(0, pointer.value + 1), cloneModel(model.value)]
    pointer.value = history.value.length - 1
    status.value = 'idle'
    error.value = undefined
  }
  watch(
    model,
    () => {
      if (!localWrite) {
        cancel()
        error.value = undefined
        resetBaseline()
      }
    },
    { deep: true, flush: 'sync' },
  )
  watch(
    () => toValue(deps).context,
    () => {
      cancel()
      error.value = undefined
      resetBaseline()
    },
    { deep: true, flush: 'sync' },
  )
  onScopeDispose(() => {
    disposed = true
    cancel()
  })

  function onTaskDragEnd(p: TaskDragPayload) {
    if (disposed || busy.value || !model.value.tasks.some((t) => t.id === p.taskId)) return
    commit({
      ...model.value,
      tasks: model.value.tasks.map((t) => {
        if (t.id !== p.taskId) return t
        const next = {
          ...t,
          startUtc: p.startUtc,
          endUtc: p.endUtc,
          resourceId: p.resourceId ?? t.resourceId,
          segments:
            t.segments?.length === 1 ? [{ startUtc: p.startUtc, endUtc: p.endUtc }] : t.segments,
        }
        if (p.kind === 'reassign') {
          if (p.assignment) {
            const { dimension, id, label } = p.assignment
            next.resourceId = t.resourceId
            next.dimensions = { ...t.dimensions }
            const retained = (t.unassignedDimensions ?? []).filter((d) => d !== dimension)
            if (id === null) {
              delete next.dimensions[dimension]
              next.unassignedDimensions = [...retained, dimension]
            } else {
              next.dimensions[dimension] = { id, label }
              next.unassignedDimensions = retained
            }
            if (dimension === 'workCenter') next.workCenterId = id ?? undefined
          } else next.resourceId = p.resourceId
        }
        return next
      }),
    })
  }
  function setLocked(taskId: string, locked: boolean) {
    if (
      disposed ||
      busy.value ||
      !model.value.tasks.some((t) => t.id === taskId && t.locked !== locked)
    )
      return
    commit({
      ...model.value,
      tasks: model.value.tasks.map((t) => (t.id === taskId ? { ...t, locked } : t)),
    })
  }
  function undo() {
    if (!disposed && canUndo.value) {
      pointer.value--
      replace(history.value[pointer.value]!)
    }
  }
  function redo() {
    if (!disposed && canRedo.value) {
      pointer.value++
      replace(history.value[pointer.value]!)
    }
  }

  async function perform(kind: 'preview' | 'release'): Promise<boolean> {
    if (disposed || busy.value) return false
    const callbacks = toValue(deps)
    if ((kind === 'preview' && !callbacks.preview) || (kind === 'release' && !callbacks.release)) {
      status.value = 'unknown'
      error.value = undefined
      return false
    }
    const current = new AbortController()
    controller = current
    busy.value = true
    status.value = 'pending'
    error.value = undefined
    const isCurrent = () => !disposed && controller === current && !current.signal.aborted
    try {
      const context = callbacks.context === undefined ? undefined : cloneModel(callbacks.context)
      const control = { signal: current.signal, context }
      if (kind === 'preview') {
        const next = await callbacks.preview!(cloneModel(model.value), control)
        if (!isCurrent()) return false
        replace(next)
      } else {
        await callbacks.release!(model.value.meta.planId, control)
        if (!isCurrent()) return false
      }
      resetBaseline()
      status.value = 'success'
      return true
    } catch (cause) {
      if (!isCurrent()) return false
      error.value = cause
      status.value = 'error'
      throw cause
    } finally {
      if (isCurrent()) {
        busy.value = false
        controller = undefined
      }
    }
  }
  return {
    dirty,
    canUndo,
    canRedo,
    busy,
    error,
    status,
    onTaskDragEnd,
    setLocked,
    undo,
    redo,
    repreview: () => perform('preview'),
    release: () => perform('release'),
    cancel,
  }
}

import { onScopeDispose, shallowRef, watch, type Ref } from 'vue'
import { toModel, type ScheduleModelAdapter } from '../model/aps-mapper'
import { cloneModel } from '../model/clone'
import type { ScheduleModel } from '../model/types'

/** Opaque host context; the library has no organization/environment/auth semantics. */
export type SchedulingContext = unknown
export interface SchedulingPlanRequest<Context> {
  planId: string
  context: Context
}
export interface SchedulingPlanDeps<Source, Context> {
  load?: (
    request: SchedulingPlanRequest<Context>,
    control: { signal: AbortSignal },
  ) => Promise<Source | undefined>
  adapt?: ScheduleModelAdapter<Source>
}

/** Latest request wins, including failures; disposal/cancel invalidate commits even if host ignores abort. */
export function useSchedulingPlan<Source, Context>(
  planId: Readonly<Ref<string | undefined>>,
  context: Readonly<Ref<Context | undefined>>,
  deps: SchedulingPlanDeps<Source, Context> = {},
) {
  const model = shallowRef<ScheduleModel>()
  const loading = shallowRef(false)
  const error = shallowRef<unknown>()
  const status = shallowRef<'idle' | 'loading' | 'ready' | 'unknown' | 'error'>('idle')
  let controller: AbortController | undefined
  let disposed = false
  function cancel() {
    controller?.abort()
    controller = undefined
    loading.value = false
    status.value = 'idle'
  }
  async function reload(): Promise<boolean> {
    if (disposed) return false
    cancel()
    error.value = undefined
    const id = planId.value,
      ctx = context.value
    if (!id || ctx === undefined) {
      model.value = undefined
      return false
    }
    const { load, adapt } = deps
    if (!load || !adapt) {
      model.value = undefined
      status.value = 'unknown'
      return false
    }
    const current = new AbortController()
    controller = current
    loading.value = true
    status.value = 'loading'
    const isCurrent = () => !disposed && controller === current && !current.signal.aborted
    try {
      const source = await load(
        { planId: id, context: cloneModel(ctx) },
        { signal: current.signal },
      )
      if (!isCurrent()) return false
      const next = source === undefined ? undefined : toModel(source, adapt)
      if (!isCurrent()) return false
      model.value = next === undefined ? undefined : cloneModel(next)
      status.value = next === undefined ? 'unknown' : 'ready'
      return next !== undefined
    } catch (cause) {
      if (isCurrent()) {
        error.value = cause
        status.value = 'error'
      }
      return false
    } finally {
      if (isCurrent()) {
        loading.value = false
        controller = undefined
      }
    }
  }
  watch(
    [planId, context],
    () => {
      model.value = undefined
      void reload()
    },
    { immediate: true, deep: true, flush: 'sync' },
  )
  onScopeDispose(() => {
    disposed = true
    cancel()
  })
  return { model, loading, error, status, reload, cancel }
}

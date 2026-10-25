import { effectScope, ref, shallowRef } from 'vue'
import {
  useSchedulingPlan,
  useSchedulingEdits,
  toModel,
  toLockedAssignments,
  evaluateDraft,
  materialReadyLabel,
  type SchedulingContext,
  type SchedulingPlanRequest,
  type SchedulingPlanDeps,
  type SchedulingEditControl,
  type SchedulingEditsDeps,
  type ScheduleModelAdapter,
  type LockedAssignmentsAdapter,
  type DraftValidator,
  type MaterialReadyFormatter,
} from '@nerv-iip/scheduling/host'
import type { ScheduleModel } from '@nerv-iip/scheduling/model'
import { readingPlan } from './models'

type HostContext = { club: string; revision: number }
const source = { key: 'reading', model: readingPlan() }
const adapter: ScheduleModelAdapter<typeof source> = (s) => s.model
const locked: LockedAssignmentsAdapter<readonly string[]> = (m) =>
  m.tasks.filter((t) => t.locked).map((t) => t.id)
const validator: DraftValidator = (m) => ({
  tasks: Object.fromEntries(m.tasks.map((t) => [t.id, { issues: [] }])),
})
const formatter: MaterialReadyFormatter<{ label: string }> = (f) => f.label
const model: ScheduleModel = toModel(source, adapter)
const lockIds: readonly string[] = toLockedAssignments(model, locked)
evaluateDraft(model, validator)
materialReadyLabel({ label: 'host' }, formatter)
const context: HostContext = { club: 'north', revision: 1 }
const opaque: SchedulingContext = context
const request: SchedulingPlanRequest<HostContext> = { planId: 'reading', context }
const deps: SchedulingPlanDeps<typeof source, HostContext> = {
  load: async (r) => (r.context.revision === 1 ? source : undefined),
  adapt: adapter,
}
const control: SchedulingEditControl<HostContext> = {
  signal: new AbortController().signal,
  context,
}
const editsDeps: SchedulingEditsDeps<HostContext> = {
  context,
  preview: async (m) => m,
  release: async (id) => {
    void id
  },
}
export const typeExamples = () =>
  effectScope().run(() => {
    const plan = useSchedulingPlan(
      ref<string | undefined>('reading'),
      ref<HostContext | undefined>(context),
      deps,
    )
    const edits = useSchedulingEdits(shallowRef(model), editsDeps)
    return { plan, edits, lockIds, opaque, request, control }
  })
// Wrong-source and wrong-assignment consumers must be rejected, never widened to any.
// @ts-expect-error exact adapter source required
const badSource = () => toModel({ wrong: 1 }, adapter)
// @ts-expect-error host output stays readonly string[], not an SDK assignment array
const badLocks: number[] = toLockedAssignments(model, locked)
void badSource
void badLocks

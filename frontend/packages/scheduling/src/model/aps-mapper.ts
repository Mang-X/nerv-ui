import type { ScheduleModel } from './types'

/** Host owns source semantics, dependencies and domain classifications. */
export type ScheduleModelAdapter<Source> = (source: Source) => ScheduleModel
export type LockedAssignmentsAdapter<Assignments> = (model: ScheduleModel) => Assignments

/** Former APS-only name retained; no implicit DTO mapping or solving. */
export function toModel<Source>(
  source: Source,
  adapter: ScheduleModelAdapter<Source>,
): ScheduleModel {
  return adapter(source)
}

/** Host determines which edits correspond to its fixed/locked assignment contract. */
export function toLockedAssignments<Assignments>(
  model: ScheduleModel,
  adapter: LockedAssignmentsAdapter<Assignments>,
): Assignments {
  return adapter(model)
}

import type { DraftFeedback, ScheduleModel } from './types'

export type DraftValidator = (model: ScheduleModel) => DraftFeedback

/** No validator means unknown, never a successful capacity/calendar/permission check. */
export function evaluateDraft(model: ScheduleModel, validator?: DraftValidator): DraftFeedback {
  if (validator) return validator(model)
  return {
    tasks: Object.fromEntries(
      model.tasks
        .filter((task) => task.type === 'operation' && !task.blockKind)
        .map((task) => [
          task.id,
          { issues: [{ kind: 'unknown', message: '宿主未提供校验依据。' }] },
        ]),
    ),
  }
}

import type { SchedulingDraftErrorFormatter, SchedulingDraftOperation } from './types'

// Only plain user-facing reasons cross the display boundary. Raw errors remain diagnostic events.
function plainReason(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    Boolean(value.trim()) &&
    !/[{}[\]\r\n]|https?:\/\/|HTTP|operationId|internal|upstream|\b(?:gateway|API|JSON|stack|TypeError|SyntaxError)\b|failed to fetch|network error/i.test(
      value,
    )
  )
}
export function actionFailureMessage(
  error: unknown,
  operation: SchedulingDraftOperation,
  formatter?: SchedulingDraftErrorFormatter,
): string {
  let reason: string | undefined
  try {
    const formatted = formatter?.(error, operation)
    if (plainReason(formatted)) reason = formatted.trim()
  } catch {
    // A failing formatter must not turn a retained draft into an unhandled rejection.
  }
  if (!reason) {
    const record =
      error && typeof error === 'object' ? (error as Record<string, unknown>) : undefined
    const candidate = record?.message ?? record?.detail ?? record?.title
    if (plainReason(candidate) && /\p{Script=Han}/u.test(candidate)) reason = candidate.trim()
  }
  const action = operation === 'save' ? '保存' : '清空'
  return reason
    ? `未能${action}：${reason}。草案仍保留，可重试。`
    : `未能${action}，草案仍保留，可重试。`
}

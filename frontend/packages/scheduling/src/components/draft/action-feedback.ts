import type { SchedulingDraftErrorFormatter, SchedulingDraftOperation } from './types'

// Classify transport/problem vocabulary and diagnostic syntax, rather than one
// particular HTTP title. A Chinese prefix does not make technical text safe.
const technicalText =
  /[{}[\]\r\n]|https?:\/\/|HTTP|operationId|internal|upstream|\b(?:gateway|API|JSON|stack|\w*Error|\w*Exception|request[s]?|response|service|server|network|unauthorized|forbidden|conflict|gone|locked|timeout|precondition|payload|media|authentication|authorization)\b|\b(?:not[ -]+(?:found|acceptable|implemented)|too[ -]+many|failed[ -]+to[ -]+fetch)\b|\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\b(?:GET|POST|PUT|PATCH|DELETE)\s+\/|(?:^|[:：])\s*[45]\d{2}(?=$|[\s:：,.])|\bat\s+[\w.$]+\s*\(/i
// Default reasons may contain a domain identifier (CNC, A-01), but unreviewed
// English words/problem titles must not pass merely because Han is present.
const unreviewedEnglish = /[a-z]{2}|\b[A-Za-z]+(?:[ \t-]+[A-Za-z]+)+\b/

// Only plain user-facing reasons cross the display boundary. Raw errors remain diagnostic events.
function plainReason(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    Boolean(value.trim()) &&
    !technicalText.test(value) &&
    !/\b(?:code|status(?:code)?|trace(?:id)?|requestid)\s*[:=]|(?:^|[\s:：])\/[a-z0-9._-]+(?:\/[a-z0-9._-]+)+/i.test(
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
    if (
      plainReason(candidate) &&
      /\p{Script=Han}/u.test(candidate) &&
      !unreviewedEnglish.test(candidate)
    )
      reason = candidate.trim()
  }
  const action = operation === 'save' ? '保存' : '清空'
  return reason
    ? `未能${action}：${reason}。草案仍保留，可重试。`
    : `未能${action}，草案仍保留，可重试。`
}

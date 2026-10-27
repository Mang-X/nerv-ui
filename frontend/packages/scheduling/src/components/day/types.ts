/** Host supplies display facts and a stable semantic key; assignmentId identifies only this instance. */
export interface SchedulingDayEntry {
  readonly semanticKey: string
  readonly assignmentId: string
  readonly label: string
  readonly orderLabel?: string
  readonly operationLabel?: string
  readonly operationSequence?: number | null
  readonly groupId: string
  readonly groupLabel: string
  readonly resourceLabel?: string
  readonly quantity?: number | null
  readonly unit?: string
  readonly startUtc: string
  readonly endUtc: string
  readonly segments?: readonly Readonly<{ startUtc: string; endUtc: string }>[]
}

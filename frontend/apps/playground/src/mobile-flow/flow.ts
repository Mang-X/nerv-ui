export interface FlowCandidate {
  key: string
  label: string
  detail: string
  quantity: number | null
  unit: string
  eligible: boolean
  reason: string
  status: { label: string; tone: 'default' | 'success' | 'warning' | 'danger' }
}
export interface FlowInput {
  source: string
  code: string
  candidates: FlowCandidate[]
  readonly: boolean
  validate: (quantity: string, candidate: FlowCandidate) => string | null
  execute: (
    draft: { code: string; key: string; quantity: string },
    signal: AbortSignal,
  ) => Promise<{ receipt: string }>
}

export type AlarmLevel = 'critical' | 'major' | 'minor' | 'info'

export type AlarmTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface AlarmRecord {
  id: string | number
  /** Display time, already formatted by the host. */
  time: string
  /** Source line / station / device identity. */
  source: string
  /** Alarm content. */
  message: string
  level: AlarmLevel
  /** Optional acknowledgement state, e.g. 未确认 / 处理中 / 已恢复. */
  status?: string
  /** Tone for the status text; the component never infers it from the text. */
  statusTone?: AlarmTone
}

export interface AlarmTableLabels {
  level?: string
  time?: string
  source?: string
  message?: string
  status?: string
}

export type AlarmLevelLabels = Partial<Record<AlarmLevel, string>>

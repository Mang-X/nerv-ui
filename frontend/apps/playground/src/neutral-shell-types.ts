export interface ShellEntry {
  key: string
  label: string
  disabled?: boolean
  children?: ShellEntry[]
}

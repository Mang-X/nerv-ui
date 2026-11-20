export type NvToggleSize = 'sm' | 'md'
export type NvToggleVariant = 'ghost' | 'outline'
export type NvToggleGroupOrientation = 'horizontal' | 'vertical'

export interface NvToggleProps {
  /** Controlled pressed state (`v-model:pressed`). */
  pressed?: boolean
  defaultPressed?: boolean
  /** Identifies the toggle inside a group. */
  value?: string
  disabled?: boolean
  focusableWhenDisabled?: boolean
  size?: NvToggleSize
  variant?: NvToggleVariant
}

export interface NvToggleGroupProps {
  /** Controlled pressed values (`v-model:value`). */
  value?: string[]
  defaultValue?: string[]
  /** Lets several toggles stay pressed. */
  multiple?: boolean
  /** Whether the pressed toggle can be unpressed in single mode. */
  deselectable?: boolean
  disabled?: boolean
  orientation?: NvToggleGroupOrientation
  loop?: boolean
}

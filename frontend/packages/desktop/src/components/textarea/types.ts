export interface NvTextareaProps {
  /** Controlled value (`v-model`). */
  modelValue?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Marks the control invalid: `aria-invalid` plus the danger border. */
  invalid?: boolean
  /** Grows the textarea with its content. */
  autoResize?: boolean
  /** Visible rows when not auto-resizing. */
  rows?: number
}

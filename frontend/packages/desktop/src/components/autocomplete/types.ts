export type NvAutocompleteFilter = 'contains' | 'startsWith' | 'fuzzy' | false

export interface NvAutocompleteProps {
  /** Controlled text (`v-model:value`). Suggestions only help fill it in. */
  value?: string
  defaultValue?: string
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  /** Suggestion strings; anything typed stays valid. */
  items?: string[]
  /** How typing narrows the suggestions. */
  filter?: NvAutocompleteFilter
  /** Completes the text with the first matching suggestion, rest selected. */
  inlineComplete?: boolean
  autoHighlight?: boolean
  openOnFocus?: boolean
  /** Runs when Enter is pressed with no suggestion highlighted. */
  submitOnSelect?: boolean
  placeholder?: string
  /** Accessible name for the field. */
  ariaLabel?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  form?: string
  /** Shows a clear button while the field holds text. */
  clearable?: boolean
  clearLabel?: string
  emptyText?: string
}

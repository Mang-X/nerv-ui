export interface NvFileInputProps {
  /** Controlled files (`v-model:value`). */
  value?: File[]
  defaultValue?: File[]
  /** Accepted files: MIME types, wildcards and extensions. */
  accept?: string | readonly string[]
  multiple?: boolean
  /** The most files accepted at a time. */
  maxFiles?: number
  /** Largest accepted size, in bytes. */
  maxSize?: number
  /** Smallest accepted size, in bytes. */
  minSize?: number
  /** Extra validation: return a reason string to reject the file. */
  validate?: (file: File) => string | null | undefined | void
  /** Name the files submit under. */
  name?: string
  form?: string
  required?: boolean
  disabled?: boolean
  /** Label of the button that opens the system picker. */
  triggerLabel?: string
  /** The line above the trigger inside the drop zone. */
  hint?: string
  /** Shows the drop zone. Turn off for a plain trigger-only input. */
  dropzone?: boolean
  /** Shows the chosen files under the zone. */
  showList?: boolean
  /** Accessible name for the file list. */
  listLabel?: string
  /** Called when files fail the size, type or count checks. */
  rejectReason?: (reasons: string[]) => string
}

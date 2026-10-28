/** Host-adapted successful receipt. key is stable and unique within a list. */
export interface PhotoAttachment {
  key: string
  name: string
  /** Safe user-facing detail, e.g. size or a distinguishing caption. */
  description?: string
}
export type PhotoUpload = (
  file: File,
  context: { signal: AbortSignal; purpose: string },
) => Promise<PhotoAttachment>

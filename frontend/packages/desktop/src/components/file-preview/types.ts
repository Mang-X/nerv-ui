export type NvFilePreviewKind = 'image' | 'pdf' | 'other'

export interface NvFilePreviewProps {
  /** File URL. A blob/object URL is fine; images and PDFs are rendered inline. */
  src?: string
  /** Display name. Also used to infer the file kind when content type is missing. */
  fileName?: string
  /** MIME type, e.g. `image/png` or `application/pdf`. */
  contentType?: string
  /** Preview height in px. */
  height?: number
}

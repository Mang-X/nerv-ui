export type NvFilePreviewKind = 'image' | 'pdf' | 'office-docx' | 'office-xlsx' | 'office-pptx' | 'other'

export interface NvFilePreviewProps {
  /** File URL. A blob/object URL is fine; images, PDFs and OOXML documents render inline. */
  src?: string
  /** Display name. Also used to infer the file kind when content type is missing. */
  fileName?: string
  /** MIME type, e.g. `image/png` or `application/pdf`. */
  contentType?: string
  /** Preview height in px. */
  height?: number
  /** File size in bytes, shown as `类型 · 大小` in the header. */
  sizeBytes?: number
  /** Shows the header with the file name, type/size and open-source action. */
  showHeader?: boolean
  /** Shows the engine toolbar (page navigation, zoom, rotate). */
  showToolbar?: boolean
  /** Shows the PDF thumbnail rail. */
  showThumbnails?: boolean
  /** Replaces the preview body with a loading state. */
  loading?: boolean
  /** Message shown instead of the preview when loading fails. */
  error?: string | null
  /** Called when an engine fails to load the document. */
  onError?: (message: string) => void
  /** Called when the preview is ready. */
  onReady?: (kind: NvFilePreviewKind) => void
}

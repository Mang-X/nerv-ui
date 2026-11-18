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
  /** Called when an engine fails to load the document. */
  onError?: (message: string) => void
  /** Called when the preview is ready. */
  onReady?: (kind: NvFilePreviewKind) => void
}

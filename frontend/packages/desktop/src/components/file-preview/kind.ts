import type { NvFilePreviewKind } from './types'

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg'])

const ooxmlTypes: Record<string, NvFilePreviewKind> = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'office-docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'office-xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'office-pptx',
}

const ooxmlExtensions: Record<string, NvFilePreviewKind> = {
  docx: 'office-docx',
  xlsx: 'office-xlsx',
  pptx: 'office-pptx',
}

export function fileExtension(fileName: string | undefined): string {
  const name = fileName ?? ''
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

/**
 * 预览种类：先看 MIME，再按扩展名兜底。
 * 只认 OOXML（docx/xlsx/pptx）—— 旧版 doc/xls/ppt 二进制格式解析不了，交给占位分支。
 */
export function resolveKind(fileName: string | undefined, contentType: string | undefined): NvFilePreviewKind {
  const type = (contentType ?? '').toLowerCase().split(';')[0].trim()
  const ext = fileExtension(fileName)

  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf' || type === 'application/x-pdf' || ext === 'pdf') return 'pdf'
  if (type in ooxmlTypes) return ooxmlTypes[type]
  if (ext in ooxmlExtensions) return ooxmlExtensions[ext]
  if (!type && imageExtensions.has(ext)) return 'image'
  return 'other'
}

/** OOXML 文档在 fetch 时要带对应的 Accept 头。 */
export function ooxmlAcceptHeader(kind: NvFilePreviewKind): string {
  const entry = Object.entries(ooxmlTypes).find(([, value]) => value === kind)
  return entry ? entry[0] : 'application/octet-stream'
}
